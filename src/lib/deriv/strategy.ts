import type { Direction, Tick } from "./types";

/**
 * Momentum-based entry:
 *  - Look at last N ticks (3–5).
 *  - Compute up vs down moves between consecutive ticks.
 *  - If a clear majority (>=60%) → trade that direction.
 *  - Otherwise return null → skip cycle.
 */
export function momentumSignal(ticks: Tick[], window = 5): Direction | null {
  if (ticks.length < window) return null;
  const slice = ticks.slice(-window);
  let up = 0;
  let down = 0;
  for (let i = 1; i < slice.length; i++) {
    const diff = slice[i].quote - slice[i - 1].quote;
    if (diff > 0) up++;
    else if (diff < 0) down++;
  }
  const total = up + down;
  if (total === 0) return null;
  const upRatio = up / total;
  if (upRatio >= 0.6) return "CALL";
  if (upRatio <= 0.4) return "PUT";
  return null;
}
