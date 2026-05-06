import type { TradeRecord } from "@/lib/deriv/types";
import { cn } from "@/lib/utils";

interface Props {
  trades: TradeRecord[];
}

const statusStyle: Record<TradeRecord["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  open: "bg-primary/20 text-primary border border-primary/40 animate-pulse",
  won: "bg-success/15 text-success border border-success/40",
  lost: "bg-destructive/15 text-destructive border border-destructive/40",
  error: "bg-warning/15 text-warning border border-warning/40",
};

export function TradeGrid({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center text-muted-foreground">
        No trades yet. Hit <span className="text-foreground font-medium">Start</span> to begin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
      {trades.map((t) => (
        <div key={t.id} className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
              t.direction === "CALL" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            )}>
              {t.direction === "CALL" ? "▲" : "▼"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold">{t.symbol}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cycle #{t.cycle}</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                ${t.stake} · {t.duration}t · {new Date(t.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-xs px-2 py-0.5 rounded-full mb-1 inline-block uppercase tracking-wider font-semibold",
              statusStyle[t.status]
            )}>
              {t.status}
            </div>
            {t.profit != null && (
              <div className={cn(
                "font-mono font-bold tabular text-sm",
                t.profit >= 0 ? "text-success" : "text-destructive"
              )}>
                {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
