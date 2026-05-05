import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DerivClient } from "./client";
import { momentumSignal } from "./strategy";
import { stakeForProfit } from "./stake";
import type { BotConfig, BotStatus, Direction, Tick, TradeRecord } from "./types";

interface EquityPoint {
  t: number;
  pnl: number;
}

interface UseDerivBotState {
  status: BotStatus;
  wsStatus: "connecting" | "open" | "closed" | "error" | "idle";
  ticks: Tick[];
  trades: TradeRecord[];
  cycle: number;
  totalProfit: number;
  currentStake: number;
  wins: number;
  losses: number;
  equity: EquityPoint[];
  balance: number | null;
  lastError: string | null;
  authorized: boolean;
  log: { t: number; msg: string }[];
}

const DEFAULT_CONFIG: BotConfig = {
  symbol: "R_100",
  batchSize: 5,
  takeProfit: null,
  stopLoss: null,
  maxCycles: null,
};

export function useDerivBot() {
  const [token, setToken] = useState<string>(
    () => (typeof window !== "undefined" && localStorage.getItem("deriv_token")) || "",
  );
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<UseDerivBotState>({
    status: "idle",
    wsStatus: "idle",
    ticks: [],
    trades: [],
    cycle: 0,
    totalProfit: 0,
    currentStake: 1,
    wins: 0,
    losses: 0,
    equity: [{ t: Date.now(), pnl: 0 }],
    balance: null,
    lastError: null,
    authorized: false,
    log: [],
  });

  const clientRef = useRef<DerivClient | null>(null);
  const ticksRef = useRef<Tick[]>([]);
  const runningRef = useRef(false);
  const inFlightRef = useRef(false);
  const totalProfitRef = useRef(0);
  const cycleRef = useRef(0);
  const cooldownRef = useRef(0); // cycles to skip
  const consecutiveLossesRef = useRef(0);

  const pushLog = useCallback((msg: string) => {
    setState((s) => ({
      ...s,
      log: [{ t: Date.now(), msg }, ...s.log].slice(0, 200),
    }));
  }, []);

  const saveToken = useCallback((t: string) => {
    setToken(t);
    if (typeof window !== "undefined") localStorage.setItem("deriv_token", t);
  }, []);

  const ensureClient = useCallback(() => {
    if (clientRef.current) return clientRef.current;
    const c = new DerivClient({
      onStatus: (s) => setState((st) => ({ ...st, wsStatus: s })),
    });
    clientRef.current = c;
    c.connect();
    return c;
  }, []);

  const connect = useCallback(async () => {
    if (!token) {
      setState((s) => ({ ...s, lastError: "Missing API token" }));
      return false;
    }
    const c = ensureClient();
    setState((s) => ({ ...s, status: "connecting", lastError: null }));
    try {
      await c.authorize(token);
      const bal = await c.balance();
      setState((s) => ({
        ...s,
        authorized: true,
        balance: bal.balance?.balance ?? null,
        status: "idle",
      }));
      pushLog("Authorized successfully.");
      // Subscribe to ticks
      await c.forgetAll("ticks").catch(() => {});
      await c.ticks(config.symbol, (msg) => {
        if (msg.tick) {
          const t: Tick = { epoch: msg.tick.epoch, quote: msg.tick.quote };
          ticksRef.current = [...ticksRef.current.slice(-200), t];
          setState((s) => ({ ...s, ticks: ticksRef.current.slice(-60) }));
        }
      });
      pushLog(`Subscribed to ${config.symbol} ticks.`);
      return true;
    } catch (e: any) {
      const msg = e?.message || "Auth failed";
      setState((s) => ({ ...s, status: "error", lastError: msg, authorized: false }));
      pushLog(`Error: ${msg}`);
      return false;
    }
  }, [token, ensureClient, config.symbol, pushLog]);

  const updateProfit = useCallback(
    (delta: number) => {
      totalProfitRef.current += delta;
      setState((s) => {
        const newPnl = s.totalProfit + delta;
        return {
          ...s,
          totalProfit: newPnl,
          currentStake: stakeForProfit(newPnl),
          equity: [...s.equity, { t: Date.now(), pnl: newPnl }].slice(-500),
        };
      });
    },
    [],
  );

  const runBatch = useCallback(async () => {
    const c = clientRef.current;
    if (!c) return;
    if (inFlightRef.current) return;

    if (cooldownRef.current > 0) {
      cooldownRef.current -= 1;
      pushLog(`Cooldown: ${cooldownRef.current} cycles remaining.`);
      return;
    }

    const signal = momentumSignal(ticksRef.current, 10);
    if (!signal.direction) {
      // Don't spam logs every 400ms
      return;
    }
    const direction = signal.direction;

    inFlightRef.current = true;
    cycleRef.current += 1;
    const cycle = cycleRef.current;
    const stake = stakeForProfit(totalProfitRef.current);

    setState((s) => ({ ...s, status: "running", cycle }));
    pushLog(
      `Cycle #${cycle}: ${signal.reason} → 5× ${direction} @ $${stake}`,
    );

    // Create placeholder trades
    const placeholders: TradeRecord[] = Array.from({ length: config.batchSize }, (_, i) => ({
      id: `${cycle}-${i}-${Date.now()}`,
      cycle,
      direction,
      stake,
      status: "pending",
      openedAt: Date.now(),
    }));
    setState((s) => ({ ...s, trades: [...placeholders, ...s.trades].slice(0, 200) }));

    // Fire all 5 buys in parallel
    const buyPromises = placeholders.map((p) =>
      c
        .buyRiseFall({ symbol: config.symbol, direction, stake })
        .then((res) => ({ p, res }))
        .catch((err) => ({ p, err })),
    );
    const results = await Promise.all(buyPromises);

    const settlePromises: Promise<void>[] = [];

    results.forEach(({ p, res, err }: any) => {
      if (err || !res?.buy) {
        const message = err?.message || "buy failed";
        setState((s) => ({
          ...s,
          trades: s.trades.map((t) =>
            t.id === p.id ? { ...t, status: "error", error: message, closedAt: Date.now() } : t,
          ),
        }));
        pushLog(`Trade ${p.id} failed: ${message}`);
        return;
      }
      const contractId = res.buy.contract_id as number;
      setState((s) => ({
        ...s,
        trades: s.trades.map((t) =>
          t.id === p.id ? { ...t, status: "open", contractId } : t,
        ),
      }));

      settlePromises.push(
        new Promise<void>((resolve) => {
          c.openContractStream(contractId, (msg) => {
            const poc = msg.proposal_open_contract;
            if (!poc) return;
            if (poc.is_sold) {
              const profit = Number(poc.profit ?? 0);
              const won = profit >= 0;
              setState((s) => ({
                ...s,
                trades: s.trades.map((t) =>
                  t.id === p.id
                    ? {
                        ...t,
                        status: won ? "won" : "lost",
                        profit,
                        payout: poc.payout,
                        entrySpot: poc.entry_spot,
                        exitSpot: poc.exit_spot,
                        closedAt: Date.now(),
                      }
                    : t,
                ),
                wins: s.wins + (won ? 1 : 0),
                losses: s.losses + (won ? 0 : 1),
              }));
              updateProfit(profit);
              resolve();
            }
          }).catch(() => resolve());
        }),
      );
    });

    await Promise.all(settlePromises);
    inFlightRef.current = false;
    pushLog(`Cycle #${cycle} complete. PnL so far: $${totalProfitRef.current.toFixed(2)}`);

    // Check stop conditions
    if (config.takeProfit != null && totalProfitRef.current >= config.takeProfit) {
      pushLog(`Take profit reached ($${config.takeProfit}). Stopping.`);
      runningRef.current = false;
    }
    if (config.stopLoss != null && totalProfitRef.current <= -Math.abs(config.stopLoss)) {
      pushLog(`Stop loss reached (-$${Math.abs(config.stopLoss)}). Stopping.`);
      runningRef.current = false;
    }
    if (config.maxCycles != null && cycle >= config.maxCycles) {
      pushLog(`Max cycles reached (${config.maxCycles}). Stopping.`);
      runningRef.current = false;
    }
  }, [config, pushLog, updateProfit]);

  // Loop driver — checks every 400ms whether to fire next batch
  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current || inFlightRef.current) return;
      runBatch();
    }, 400);
    return () => clearInterval(id);
  }, [runBatch]);

  const start = useCallback(async () => {
    if (!state.authorized) {
      const ok = await connect();
      if (!ok) return;
    }
    runningRef.current = true;
    setState((s) => ({ ...s, status: "running" }));
    pushLog("Bot started.");
  }, [state.authorized, connect, pushLog]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setState((s) => ({ ...s, status: "stopped" }));
    pushLog("Bot stopped.");
  }, [pushLog]);

  const reset = useCallback(() => {
    runningRef.current = false;
    inFlightRef.current = false;
    totalProfitRef.current = 0;
    cycleRef.current = 0;
    setState((s) => ({
      ...s,
      status: "idle",
      trades: [],
      cycle: 0,
      totalProfit: 0,
      currentStake: 1,
      wins: 0,
      losses: 0,
      equity: [{ t: Date.now(), pnl: 0 }],
      log: [{ t: Date.now(), msg: "Session reset." }, ...s.log].slice(0, 200),
    }));
  }, []);

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  const winRate = useMemo(() => {
    const total = state.wins + state.losses;
    return total === 0 ? 0 : (state.wins / total) * 100;
  }, [state.wins, state.losses]);

  return {
    token,
    saveToken,
    config,
    setConfig,
    ...state,
    winRate,
    connect,
    start,
    stop,
    reset,
  };
}
