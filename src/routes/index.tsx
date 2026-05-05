import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useState } from "react";
import { useDerivBot } from "@/lib/deriv/useDerivBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatTile } from "@/components/bot/StatTile";
import { TradeGrid } from "@/components/bot/TradeGrid";
import { StakeLadder } from "@/components/bot/StakeLadder";
import { EquityCurve } from "@/components/bot/EquityCurve";
import { ActivityLog } from "@/components/bot/ActivityLog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chaos Batch — Deriv High-Frequency Trading Bot" },
      {
        name: "description",
        content:
          "Premium dashboard for a chaotic-batch Deriv trading bot. 5 simultaneous Rise/Fall trades per cycle, momentum entry, profit-tier stake ladder.",
      },
    ],
  }),
  component: () => (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <Dashboard />
    </ClientOnly>
  ),
});

const SYMBOLS = [
  { v: "R_10", l: "Volatility 10" },
  { v: "R_25", l: "Volatility 25" },
  { v: "R_50", l: "Volatility 50" },
  { v: "R_75", l: "Volatility 75" },
  { v: "R_100", l: "Volatility 100" },
];

function Dashboard() {
  const bot = useDerivBot();
  const [tokenInput, setTokenInput] = useState(bot.token);
  const [tp, setTp] = useState<string>("");
  const [sl, setSl] = useState<string>("");
  const [maxC, setMaxC] = useState<string>("");

  const wsDot =
    bot.wsStatus === "open"
      ? "bg-success"
      : bot.wsStatus === "connecting"
        ? "bg-warning animate-pulse"
        : bot.wsStatus === "error"
          ? "bg-destructive"
          : "bg-muted-foreground";

  const lastTick = bot.ticks[bot.ticks.length - 1]?.quote;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="font-display font-bold text-primary">C</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">
                Chaos Batch <span className="text-muted-foreground font-normal">/ Deriv</span>
              </h1>
              <p className="text-[11px] text-muted-foreground mt-1 tracking-wide">
                5× simultaneous • 1-tick Rise/Fall • profit-tier stake ladder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className={cn("h-2 w-2 rounded-full", wsDot)} />
              <span className="text-muted-foreground uppercase tracking-wider">
                {bot.wsStatus}
              </span>
            </div>
            {bot.balance != null && (
              <div className="text-sm">
                <span className="text-muted-foreground">Balance</span>{" "}
                <span className="font-mono tabular">${bot.balance.toFixed(2)}</span>
              </div>
            )}
            <span
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full border",
                bot.status === "running"
                  ? "border-success/50 text-success bg-success/10"
                  : bot.status === "error"
                    ? "border-destructive/50 text-destructive bg-destructive/10"
                    : "border-border text-muted-foreground",
              )}
            >
              {bot.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Token + Config */}
        <section className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-1">Connection</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Paste your Deriv API token. Stored only in this browser.{" "}
              <a
                href="https://app.deriv.com/account/api-token"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Create token →
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="password"
                placeholder="Deriv API token (needs Read + Trade scopes)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="font-mono text-xs bg-input/40"
              />
              <Button
                onClick={async () => {
                  bot.saveToken(tokenInput);
                  await bot.connect();
                }}
                disabled={!tokenInput || bot.wsStatus === "connecting"}
              >
                {bot.authorized ? "Reconnect" : "Connect"}
              </Button>
            </div>
            {bot.lastError && (
              <p className="text-xs text-destructive mt-3 font-mono">⚠ {bot.lastError}</p>
            )}
          </div>

          <div className="glass rounded-2xl p-6 space-y-3">
            <h2 className="font-display font-semibold">Session Limits</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Take Profit
                </Label>
                <Input
                  type="number"
                  placeholder="—"
                  value={tp}
                  onChange={(e) => {
                    setTp(e.target.value);
                    bot.setConfig({ ...bot.config, takeProfit: e.target.value ? +e.target.value : null });
                  }}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Stop Loss
                </Label>
                <Input
                  type="number"
                  placeholder="—"
                  value={sl}
                  onChange={(e) => {
                    setSl(e.target.value);
                    bot.setConfig({ ...bot.config, stopLoss: e.target.value ? +e.target.value : null });
                  }}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Max Cycles
                </Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={maxC}
                  onChange={(e) => {
                    setMaxC(e.target.value);
                    bot.setConfig({ ...bot.config, maxCycles: e.target.value ? +e.target.value : null });
                  }}
                  className="mt-1 font-mono"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Symbol
              </Label>
              <select
                value={bot.config.symbol}
                onChange={(e) => bot.setConfig({ ...bot.config, symbol: e.target.value })}
                className="mt-1 w-full rounded-md bg-input/60 border border-border px-3 py-2 text-sm font-mono"
              >
                {SYMBOLS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l} ({s.v})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Action bar */}
        <section className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={bot.start}
            disabled={bot.status === "running"}
            className="bg-success text-success-foreground hover:bg-success/90 font-semibold"
          >
            ▶ Start Bot
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={bot.stop}
            disabled={bot.status !== "running"}
          >
            ■ Stop
          </Button>
          <Button size="lg" variant="ghost" onClick={bot.reset}>
            ⟲ Reset Session
          </Button>
          <div className="ml-auto text-xs text-muted-foreground font-mono">
            {lastTick != null && (
              <>
                last tick:{" "}
                <span className="text-foreground tabular">{lastTick.toFixed(4)}</span>
              </>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatTile
            label="Total P&L"
            value={`${bot.totalProfit >= 0 ? "+" : ""}$${bot.totalProfit.toFixed(2)}`}
            tone={bot.totalProfit >= 0 ? "positive" : "negative"}
          />
          <StatTile
            label="Current Stake"
            value={`$${bot.currentStake}`}
            tone="primary"
            hint="auto from profit tier"
          />
          <StatTile label="Cycle" value={`#${bot.cycle}`} hint="batches completed" />
          <StatTile
            label="Win Rate"
            value={`${bot.winRate.toFixed(1)}%`}
            hint={`${bot.wins}W · ${bot.losses}L`}
          />
          <StatTile
            label="Total Trades"
            value={bot.wins + bot.losses}
            hint={`${bot.config.batchSize} per cycle`}
          />
        </section>

        {/* Equity + Ladder */}
        <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold">Equity Curve</h2>
                <p className="text-xs text-muted-foreground">
                  Cumulative P&L across all closed trades
                </p>
              </div>
            </div>
            <EquityCurve data={bot.equity} />
          </div>
          <StakeLadder profit={bot.totalProfit} />
        </section>

        {/* Trades + Log */}
        <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div>
            <h2 className="font-display font-semibold mb-3">Trade Batches</h2>
            <TradeGrid trades={bot.trades} />
          </div>
          <ActivityLog entries={bot.log} />
        </section>

        <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
          Trading involves substantial risk. This bot is for educational purposes — use a demo
          account first.
        </footer>
      </main>
    </div>
  );
}
