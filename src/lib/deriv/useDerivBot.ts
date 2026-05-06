import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DerivClient } from "./client";
import { evaluateSymbol, resolveEntry } from "./strategy";
import { stakeForProfit } from "./stake";
import {
  SYMBOL_LIST,
  type BotConfig,
  type BotStatus,
  type Candle,
  type SymbolSignal,
  type Tick,
  type TradeRecord,
} from "./types";

interface EquityPoint {
  t: number;
  pnl: number;
}

interface UseDerivBotState {
  status: BotStatus;
  wsStatus: "connecting" | "open" | "closed" | "error" | "idle";
  ticksBySymbol: Record<string, Tick[]>;
  signals: SymbolSignal[];
  selected: { symbol: string; mode: "momentum" | "spike"; direction: "CALL" | "PUT" } | null;
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
  symbols: SYMBOL_LIST.map((s) => s.code),
  takeProfit: null,
  stopLoss: null,
  maxCycles: null,
};

const HTF_REFRESH_MS = 60_000;

export function useDerivBot() {
  const [token, setToken] = useState<string>(
    () => (typeof window !== "undefined" && localStorage.getItem("deriv_token")) || "",
  );
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<UseDerivBotState>({
    status: "idle",
    wsStatus: "idle",
    ticksBySymbol: {},
    signals: [],
    selected: null,
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
  const ticksRef = useRef<Record<string, Tick[]>>({});
  const candles15Ref = useRef<Record<string, Candle[]>>({});
  const candles60Ref = useRef<Record<string, Candle[]>>({});
  const subscribedRef = useRef<Set<string>>(new Set());
  const runningRef = useRef(false);
  const inFlightRef = useRef(false);
  const totalProfitRef = useRef(0);
  const cycleRef = useRef(0);
  const cooldownRef = useRef(0);
  const consecutiveLossesRef = useRef(0);
  const htfTimerRef = useRef<number | null>(null);

  const pushLog = useCallback((msg: string) => {
    setState((s) => ({
      ...s,
      log: [{ t: Date.now(), msg }, ...s.log].slice(0, 300),
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

  const refreshHTFFor = useCallback(async (symbol: string) => {
    const c = clientRef.current;
    if (!c) return;
    try {
      const [r15, r60] = await Promise.all([
        c.candles(symbol, 900, 60),
        c.candles(symbol, 3600, 60),
      ]);
      const map = (r: any): Candle[] =>
        (r?.candles ?? []).map((k: any) => ({
          epoch: k.epoch,
          open: Number(k.open),
          high: Number(k.high),
          low: Number(k.low),
          close: Number(k.close),
        }));
      candles15Ref.current[symbol] = map(r15);
      candles60Ref.current[symbol] = map(r60);
    } catch (e: any) {
      // silent — HTF is best-effort
    }
  }, []);

  const subscribeSymbol = useCallback(
    async (symbol: string) => {
      const c = clientRef.current;
      if (!c) return;
      if (subscribedRef.current.has(symbol)) return;
      subscribedRef.current.add(symbol);
      try {
        await c.ticks(symbol, (msg) => {
          if (msg.tick && msg.tick.symbol === symbol) {
            const t: Tick = { epoch: msg.tick.epoch, quote: Number(msg.tick.quote) };
            const prev = ticksRef.current[symbol] ?? [];
            ticksRef.current[symbol] = [...prev.slice(-200), t];
          }
        });
        await refreshHTFFor(symbol);
      } catch (e: any) {
        pushLog(`Failed to subscribe ${symbol}: ${e?.message ?? e}`);
        subscribedRef.current.delete(symbol);
      }
    },
    [pushLog, refreshHTFFor],
  );

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
      pushLog("Authorized.");
      // subscribe to all configured symbols
      for (const sym of config.symbols) {
        await subscribeSymbol(sym);
      }
      pushLog(`Subscribed to ${config.symbols.length} symbols.`);
      // HTF refresh loop
      if (htfTimerRef.current == null) {
        htfTimerRef.current = window.setInterval(() => {
          for (const sym of config.symbols) refreshHTFFor(sym);
        }, HTF_REFRESH_MS);
      }
      return true;
    } catch (e: any) {
      const msg = e?.message || "Auth failed";
      setState((s) => ({ ...s, status: "error", lastError: msg, authorized: false }));
      pushLog(`Error: ${msg}`);
      return false;
    }
  }, [token, ensureClient, config.symbols, pushLog, refreshHTFFor, subscribeSymbol]);

  const updateProfit = useCallback((delta: number) => {
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
  }, []);

  /** Score all symbols and return the best entry candidate. */
  const evaluateAll = useCallback((): SymbolSignal[] => {
    return SYMBOL_LIST.filter((d) => config.symbols.includes(d.code))
      .map((d) =>
        evaluateSymbol(
          d,
          ticksRef.current[d.code] ?? [],
          candles15Ref.current[d.code] ?? [],
          candles60Ref.current[d.code] ?? [],
        ),
      )
      .sort((a, b) => b.score - a.score);
  }, [config.symbols]);

  const buyWithRetry = useCallback(
    async (
      symbol: string,
      direction: "CALL" | "PUT",
      stake: number,
      duration: number,
      attempt = 0,
    ): Promise<any> => {
      const c = clientRef.current!;
      try {
        const res = await c.buyRiseFall({ symbol, direction, stake, duration });
        return { res };
      } catch (err: any) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
          return buyWithRetry(symbol, direction, stake, duration, attempt + 1);
        }
        return { err };
      }
    },
    [],
  );

  const runBatch = useCallback(async () => {
    const c = clientRef.current;
    if (!c) return;
    if (inFlightRef.current) return;

    if (cooldownRef.current > 0) {
      cooldownRef.current -= 1;
      pushLog(`Cooldown: ${cooldownRef.current} cycle(s) remaining.`);
      await new Promise((r) => setTimeout(r, 1500));
      return;
    }

    const ranked = evaluateAll();
    setState((s) => ({ ...s, signals: ranked }));

    let chosen: { symbol: string; mode: "momentum" | "spike"; direction: "CALL" | "PUT" } | null =
      null;
    let speed: "fast" | "slow" = "fast";
    for (const sig of ranked) {
      const entry = resolveEntry(sig, ticksRef.current[sig.symbol] ?? []);
      if (entry) {
        chosen = { symbol: sig.symbol, mode: entry.mode, direction: entry.direction };
        speed = sig.speed;
        break;
      }
    }
    if (!chosen) {
      setState((s) => ({ ...s, selected: null }));
      return;
    }

    inFlightRef.current = true;
    cycleRef.current += 1;
    const cycle = cycleRef.current;
    const stake = stakeForProfit(totalProfitRef.current);
    const duration = speed === "fast" ? 1 : 3;

    setState((s) => ({ ...s, status: "running", cycle, selected: chosen }));
    pushLog(
      `Cycle #${cycle}: ${chosen.symbol} ${chosen.mode.toUpperCase()} → ${chosen.direction} @ $${stake} (${duration}t)`,
    );

    const trade: TradeRecord = {
      id: `${cycle}-${Date.now()}`,
      symbol: chosen.symbol,
      cycle,
      direction: chosen.direction,
      stake,
      duration,
      status: "pending",
      openedAt: Date.now(),
    };
    
    setState((s) => ({ ...s, trades: [trade, ...s.trades].slice(0, 200) }));

    const { res, err } = await buyWithRetry(chosen.symbol, chosen.direction, stake, duration);

    if (err || !res?.buy) {
      const message = err?.message || "Buy failed";
      setState((s) => ({
        ...s,
        trades: s.trades.map((t) =>
          t.id === trade.id ? { ...t, status: "error", error: message, closedAt: Date.now() } : t
        ),
      }));
      pushLog(`Trade failed: ${message}`);
      inFlightRef.current = false;
      return;
    }

    const contractId = res.buy.contract_id as number;
    setState((s) => ({
      ...s,
      trades: s.trades.map((t) => (t.id === trade.id ? { ...t, status: "open", contractId } : t)),
    }));

    try {
      await new Promise<void>((resolve, reject) => {
        c.openContractStream(contractId, (msg) => {
          const poc = msg.proposal_open_contract;
          if (!poc) return;
          if (poc.is_sold) {
            const profit = Number(poc.profit ?? 0);
            const won = profit >= 0;
            setState((s) => ({
              ...s,
              trades: s.trades.map((t) =>
                t.id === trade.id
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
            
            if (!won) {
              consecutiveLossesRef.current += 1;
              cooldownRef.current = consecutiveLossesRef.current >= 2 ? 5 : 2;
              pushLog(`Loss. Streak: ${consecutiveLossesRef.current}. Cooldown: ${cooldownRef.current}`);
            } else {
              consecutiveLossesRef.current = 0;
              pushLog(`Win! +$${profit.toFixed(2)}`);
            }
            resolve();
          }
        }).catch(reject);
      });
    } catch (e) {
      pushLog(`Stream error: ${e}`);
    }

    inFlightRef.current = false;

    if (config.takeProfit != null && totalProfitRef.current >= config.takeProfit) {
      pushLog(`Take profit reached. Stopping.`);
      runningRef.current = false;
    }
    if (config.stopLoss != null && totalProfitRef.current <= -Math.abs(config.stopLoss)) {
      pushLog(`Stop loss reached. Stopping.`);
      runningRef.current = false;
    }
    if (config.maxCycles != null && cycle >= config.maxCycles) {
      pushLog(`Max cycles reached. Stopping.`);
      runningRef.current = false;
    }
  }, [buyWithRetry, config.batchSize, config.maxCycles, config.stopLoss, config.takeProfit, evaluateAll, pushLog, updateProfit]);

  // Loop driver — every 500ms also pushes a UI snapshot of ticks/signals
  useEffect(() => {
    const id = setInterval(() => {
      // snapshot a few ticks per symbol for UI
      const snap: Record<string, Tick[]> = {};
      for (const sym of config.symbols) snap[sym] = (ticksRef.current[sym] ?? []).slice(-30);
      setState((s) => ({ ...s, ticksBySymbol: snap }));

      if (!runningRef.current || inFlightRef.current) return;
      runBatch();
    }, 500);
    return () => clearInterval(id);
  }, [runBatch, config.symbols]);

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
    cooldownRef.current = 0;
    consecutiveLossesRef.current = 0;
    setState((s) => ({
      ...s,
      status: "idle",
      trades: [],
      selected: null,
      cycle: 0,
      totalProfit: 0,
      currentStake: 1,
      wins: 0,
      losses: 0,
      equity: [{ t: Date.now(), pnl: 0 }],
      log: [{ t: Date.now(), msg: "Session reset." }, ...s.log].slice(0, 300),
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (htfTimerRef.current != null) clearInterval(htfTimerRef.current);
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
