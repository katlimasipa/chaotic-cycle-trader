import { STAKE_TIERS } from "@/lib/deriv/stake";
import { cn } from "@/lib/utils";

export function StakeLadder({ profit }: { profit: number }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Stake Ladder</h3>
        <span className="text-xs text-muted-foreground">profit-tier based</span>
      </div>
      <div className="space-y-2">
        {STAKE_TIERS.map((tier) => {
          const active = profit >= tier.min && profit < tier.max;
          return (
            <div
              key={tier.label}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm border transition-colors",
                active
                  ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_0_1px_oklch(0.62_0.22_275/0.3)]"
                  : "border-border/40 text-muted-foreground",
              )}
            >
              <span className="font-mono text-xs">{tier.label}</span>
              <span className="tabular font-semibold">${tier.stake}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
