import type { SymbolSignal } from "@/lib/deriv/types";
import { cn } from "@/lib/utils";

export function SignalsPanel({
  signals,
  selected,
}: {
  signals: SymbolSignal[];
  selected: string | null;
}) {
  if (!signals.length) {
    return (
      <div className="glass rounded-xl p-6 text-center text-muted-foreground text-sm">
        Waiting for tick data…
      </div>
    );
  }
  return (
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border/40">
            <th className="text-left px-4 py-2">Symbol</th>
            <th className="text-left px-4 py-2">HTF (15m/1h)</th>
            <th className="text-left px-4 py-2">Momentum</th>
            <th className="text-left px-4 py-2">Spike</th>
            <th className="text-right px-4 py-2">MACD</th>
            <th className="text-right px-4 py-2">RSI</th>
            <th className="text-right px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          {signals.map((s) => (
            <tr
              key={s.symbol}
              className={cn(
                "border-b border-border/20",
                s.symbol === selected && "bg-primary/10",
              )}
            >
              <td className="px-4 py-2 text-foreground">{s.symbol}</td>
              <td className="px-4 py-2">
                <span className={cn(
                  s.htf15.bias === "BULLISH" && "text-success",
                  s.htf15.bias === "BEARISH" && "text-destructive",
                  s.htf15.bias === "NEUTRAL" && "text-muted-foreground",
                )}>{s.htf15.bias}</span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className={cn(
                  s.htf60.bias === "BULLISH" && "text-success",
                  s.htf60.bias === "BEARISH" && "text-destructive",
                  s.htf60.bias === "NEUTRAL" && "text-muted-foreground",
                )}>{s.htf60.bias}</span>
              </td>
              <td className={cn(
                "px-4 py-2",
                s.momentum === "CALL" && "text-success",
                s.momentum === "PUT" && "text-destructive",
                !s.momentum && "text-muted-foreground",
              )}>{s.momentum ?? "—"}</td>
              <td className={cn("px-4 py-2", s.spike ? "text-warning" : "text-muted-foreground")}>
                {s.spike ? `${s.spike.dir}` : "—"}
              </td>
              <td className="px-4 py-2 text-right tabular">{s.htf15.macd.toFixed(4)}</td>
              <td className="px-4 py-2 text-right tabular">{s.rsi.toFixed(0)}</td>
              <td className="px-4 py-2 text-right tabular text-foreground">{s.score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
