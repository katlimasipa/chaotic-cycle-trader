import { createFileRoute, ClientOnly, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDerivBot } from "@/lib/deriv/useDerivBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatTile } from "@/components/bot/StatTile";
import { TradeGrid } from "@/components/bot/TradeGrid";
import { StakeLadder } from "@/components/bot/StakeLadder";
import { EquityCurve } from "@/components/bot/EquityCurve";
import { ActivityLog } from "@/components/bot/ActivityLog";
import { SignalsPanel } from "@/components/bot/SignalsPanel";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SYMBOL_LIST } from "@/lib/deriv/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Architeq Quant" },
      { name: "description", content: "Live multi-symbol Deriv trading bot dashboard." },
    ],
  }),
  component: () => (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <DashboardGate />
    </ClientOnly>
  ),
});

function DashboardGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  return <Dashboard email={user.email ?? ""} />;
}

function Dashboard({ email }: { email: string }) {
  const bot = useDerivBot();
  const [tokenInput, setTokenInput] = useState(bot.token);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [maxC, setMaxC] = useState("");

  const wsDot =
    bot.wsStatus === "open" ? "bg-success"
    : bot.wsStatus === "connecting" ? "bg-warning animate-pulse"
    : bot.wsStatus === "error" ? "bg-destructive"
    : "bg-muted-foreground";

  const selectedSig = bot.selected
    ? bot.signals.find((s) => s.symbol === bot.selected!.symbol)
    : bot.signals[0];

  const lastTick = selectedSig
    ? bot.ticksBySymbol[selectedSig.symbol]?.slice(-1)[0]?.quote
    : undefined;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <header className="relative border-b border-border/40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center font-display font-bold text-primary">Æ</div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">
                Architeq <span className="text-muted-foreground font-normal">Quant</span>
              </h1>
              <p className="text-[11px] text-muted-foreground mt-1 tracking-wide">
                multi-symbol · spike-aware · HTF-confirmed
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", wsDot)} />
              <span className="text-muted-foreground uppercase tracking-wider">{bot.wsStatus}</span>
            </div>
            {bot.balance != null && (
              <div className="text-sm">
                <span className="text-muted-foreground">Balance</span>{" "}
                <span className="font-mono tabular">${bot.balance.toFixed(2)}</span>
              </div>
            )}
            <span className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border",
              bot.status === "running"
                ? "border-success/50 text-success bg-success/10"
                : bot.status === "error"
                  ? "border-destructive/50 text-destructive bg-destructive/10"
                  : "border-border text-muted-foreground",
            )}>{bot.status.toUpperCase()}</span>
            <span className="text-muted-foreground hidden md:inline">{email}</span>
            <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Token + Symbols */}
        <section className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-1">Deriv connection</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Paste your Deriv API token. Stored only in this browser.{" "}
              <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Create token →
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="password"
                placeholder="Deriv API token (Read + Trade scopes)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="font-mono text-xs bg-input/40"
              />
              <Button
                onClick={async () => { bot.saveToken(tokenInput); await bot.connect(); }}
                disabled={!tokenInput || bot.wsStatus === "connecting"}
              >
                {bot.authorized ? "Reconnect" : "Connect"}
              </Button>
            </div>
            {bot.lastError && <p className="text-xs text-destructive mt-3 font-mono">⚠ {bot.lastError}</p>}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-2">Session limits</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Take Profit</Label>
                <Input type="number" placeholder="—" value={tp}
                  onChange={(e) => { setTp(e.target.value); bot.setConfig({ ...bot.config, takeProfit: e.target.value ? +e.target.value : null }); }}
                  className="mt-1 font-mono" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stop Loss</Label>
                <Input type="number" placeholder="—" value={sl}
                  onChange={(e) => { setSl(e.target.value); bot.setConfig({ ...bot.config, stopLoss: e.target.value ? +e.target.value : null }); }}
                  className="mt-1 font-mono" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Max Cycles</Label>
                <Input type="number" placeholder="∞" value={maxC}
                  onChange={(e) => { setMaxC(e.target.value); bot.setConfig({ ...bot.config, maxCycles: e.target.value ? +e.target.value : null }); }}
                  className="mt-1 font-mono" />
              </div>
            </div>
          </div>
        </section>

        {/* Symbol selector */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Symbols in rotation</h2>
            <span className="text-xs text-muted-foreground">{bot.config.symbols.length} active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMBOL_LIST.map((s) => {
              const on = bot.config.symbols.includes(s.code);
              return (
                <button
                  key={s.code}
                  onClick={() => {
                    const next = on
                      ? bot.config.symbols.filter((c) => c !== s.code)
                      : [...bot.config.symbols, s.code];
                    bot.setConfig({ ...bot.config, symbols: next });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono border transition-colors",
                    on
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-border/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Action bar */}
        <section className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={bot.start} disabled={bot.status === "running"}
            className="bg-success text-success-foreground hover:bg-success/90 font-semibold">
            ▶ Start Bot
          </Button>
          <Button size="lg" variant="outline" onClick={bot.stop} disabled={bot.status !== "running"}>■ Stop</Button>
          <Button size="lg" variant="ghost" onClick={bot.reset}>⟲ Reset Session</Button>
          <div className="ml-auto text-xs text-muted-foreground font-mono flex gap-4">
            {selectedSig && <span>focus: <span className="text-foreground">{selectedSig.symbol}</span></span>}
            {lastTick != null && <span>last tick: <span className="text-foreground tabular">{lastTick.toFixed(4)}</span></span>}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatTile label="Total P&L" value={`${bot.totalProfit >= 0 ? "+" : ""}$${bot.totalProfit.toFixed(2)}`}
            tone={bot.totalProfit >= 0 ? "positive" : "negative"} />
          <StatTile label="Stake Tier" value={`$${bot.currentStake}`} tone="primary" hint="profit-tier ladder" />
          <StatTile label="Cycle" value={`#${bot.cycle}`} hint="batches completed" />
          <StatTile label="Win Rate" value={`${bot.winRate.toFixed(1)}%`} hint={`${bot.wins}W · ${bot.losses}L`} />
          <StatTile label="Total Trades" value={bot.wins + bot.losses} hint={`${bot.config.batchSize} per cycle`} />
        </section>

        {/* Equity + Ladder */}
        <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="glass rounded-2xl p-6">
            <div className="mb-4">
              <h2 className="font-display font-semibold">Equity curve</h2>
              <p className="text-xs text-muted-foreground">Cumulative P&L across closed trades</p>
            </div>
            <EquityCurve data={bot.equity} />
          </div>
          <StakeLadder profit={bot.totalProfit} />
        </section>

        {/* Signals */}
        <section>
          <h2 className="font-display font-semibold mb-3">Symbol scoring</h2>
          <SignalsPanel signals={bot.signals} selected={bot.selected?.symbol ?? null} />
        </section>

        {/* Trades + Log */}
        <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div>
            <h2 className="font-display font-semibold mb-3">Trade batches</h2>
            <TradeGrid trades={bot.trades} />
          </div>
          <ActivityLog entries={bot.log} />
        </section>

        <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
          Built by{" "}
          <a href="https://architeq.co.za" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Architeq Web Agency
          </a>{" "}
          · Trading involves substantial risk.
        </footer>
      </main>
    </div>
  );
}
