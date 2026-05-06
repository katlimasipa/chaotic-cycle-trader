import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Architeq Quant — Multi-symbol Deriv trading bot" },
      {
        name: "description",
        content:
          "High-frequency multi-symbol Deriv trading system with momentum, spike detection and higher-timeframe confirmation. Built by Architeq Web Agency.",
      },
      { property: "og:title", content: "Architeq Quant — Deriv Trading Bot" },
      { property: "og:description", content: "Tick momentum × HTF trend × spike reversal. 5-trade batches. Profit-tier staking." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <header className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center font-display font-bold text-primary">
            Æ
          </div>
          <span className="font-display font-semibold tracking-tight">
            Architeq <span className="text-muted-foreground font-normal">Quant</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm">Get started</Button></Link>
        </div>
      </header>

      <main className="relative z-10 max-w-[1200px] mx-auto px-6 pt-16 pb-24">
        <div className="max-w-3xl">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-primary border border-primary/40 bg-primary/10 px-3 py-1 rounded-full mb-6">
            Multi-symbol · Spike-aware · HTF-confirmed
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight">
            Trade Deriv at the speed of <span className="text-primary">conviction</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            A precision execution engine for Volatility Indices that combines
            micro tick momentum, macro 15m/1h trend confirmation, and spike-reversal
            detection — firing 5 simultaneous trades only when every filter aligns.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Launch Dashboard →
              </Button>
            </Link>
            <a href="https://architeq.co.za" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline">Visit Architeq</Button>
            </a>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-5">
          {[
            { t: "10 Symbols", d: "Volatility 10/25/50/75/100, both 1-second and standard indices, scored every 500ms." },
            { t: "HTF Filter", d: "15m + 1h candles with MACD and Stochastic RSI gate every entry." },
            { t: "Spike Reversal", d: "Outsized tick (>2.5× avg) + reversal confirms a counter-trade — when HTF agrees." },
            { t: "5× Batch Engine", d: "Parallel buy with auto-retry. 1-tick on fast indices, 3-tick on slow." },
            { t: "Profit-Tier Stakes", d: "$1 → $100 ladder driven strictly by realised session profit." },
            { t: "Loss Cooldowns", d: "1 loss → skip 2 cycles. 2 losses → skip 5. No revenge trading." },
          ].map((f) => (
            <div key={f.t} className="glass rounded-2xl p-6">
              <div className="font-display text-lg font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/40">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            Built by{" "}
            <a href="https://architeq.co.za" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
              Architeq Web Agency
            </a>
          </div>
          <div className="text-xs">Trading involves risk. Use a demo account first.</div>
        </div>
      </footer>
    </div>
  );
}
