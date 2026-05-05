import type { Direction, Tick } from "./types";

export interface SignalResult {
  direction: Direction | null;
  reason: string;
}

/**
 * Strict momentum entry per spec:
 *  - Need ≥10 ticks.
 *  - ≥7 of last 10 ticks in same direction.
 *  - Last 3 ticks all same direction as the majority.
 *  - Last 3 tick moves non-decreasing in magnitude (momentum building).
 *  - Chop filter: skip if >3 direction alternations in last 10 ticks.
 *  - Noise filter: skip if average |move| < 0.005% of price.
 */
export function momentumSignal(ticks: Tick[], window = 10): SignalResult {
  if (ticks.length < window) return { direction: null, reason: "warming up" };
  const slice = ticks.slice(-window);

  const moves: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    moves.push(slice[i].quote - slice[i - 1].quote);
  }

  let up = 0;
  let down = 0;
  let alternations = 0;
  let prevSign = 0;
  for (const m of moves) {
    const s = m > 0 ? 1 : m < 0 ? -1 : 0;
    if (s > 0) up++;
    else if (s < 0) down++;
    if (s !== 0 && prevSign !== 0 && s !== prevSign) alternations++;
    if (s !== 0) prevSign = s;
  }

  if (alternations > 3) return { direction: null, reason: `chop (${alternations} flips)` };

  // Noise filter
  const avgMove = moves.reduce((s, m) => s + Math.abs(m), 0) / moves.length;
  const refPrice = slice[slice.length - 1].quote || 1;
  if (avgMove / refPrice < 0.00005) return { direction: null, reason: "flat" };

  const total = up + down;
  if (total === 0) return { direction: null, reason: "no movement" };

  const dominant: Direction | null =
    up >= 7 ? "CALL" : down >= 7 ? "PUT" : null;
  if (!dominant) return { direction: null, reason: `weak (${up}↑/${down}↓)` };

  // Last 3 moves all in dominant direction
  const last3 = moves.slice(-3);
  const wantPositive = dominant === "CALL";
  const allAligned = last3.every((m) => (wantPositive ? m > 0 : m < 0));
  if (!allAligned) return { direction: null, reason: "last-3 not aligned" };

  // Non-decreasing magnitude
  const mags = last3.map((m) => Math.abs(m));
  if (!(mags[1] >= mags[0] * 0.8 && mags[2] >= mags[1] * 0.8)) {
    return { direction: null, reason: "momentum fading" };
  }

  return { direction: dominant, reason: `${up}↑/${down}↓ + 3-aligned` };
}
