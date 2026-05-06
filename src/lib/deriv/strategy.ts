import type { Candle, Direction, HTFTrend, SymbolSignal, SymbolDef, Tick } from "./types";

/** Strict monotonic momentum on last N ticks (N = 3..5). Picks longest run. */
export function tickMomentum(ticks: Tick[]): Direction | null {
  if (ticks.length < 3) return null;
  const tail = ticks.slice(-5);
  // try 5 then 4 then 3
  for (const n of [5, 4, 3]) {
    if (tail.length < n) continue;
    const seg = tail.slice(-n);
    let up = true;
    let down = true;
    for (let i = 1; i < seg.length; i++) {
      if (!(seg[i].quote > seg[i - 1].quote)) up = false;
      if (!(seg[i].quote < seg[i - 1].quote)) down = false;
    }
    if (up) return "CALL";
    if (down) return "PUT";
  }
  return null;
}

/** Spike: last tick move > 2.5x avg of previous 5 sizes. */
export function detectSpike(ticks: Tick[]): { dir: Direction; strength: number } | null {
  if (ticks.length < 7) return null;
  const tail = ticks.slice(-7);
  const sizes: number[] = [];
  for (let i = 1; i < tail.length; i++) sizes.push(Math.abs(tail[i].quote - tail[i - 1].quote));
  const last = sizes[sizes.length - 1];
  const prev = sizes.slice(0, -1); // 5 prior sizes
  const avg = prev.reduce((a, b) => a + b, 0) / Math.max(prev.length, 1);
  if (avg <= 0) return null;
  const ratio = last / avg;
  if (ratio < 2.5) return null;
  const lastDir: Direction =
    tail[tail.length - 1].quote > tail[tail.length - 2].quote ? "CALL" : "PUT";
  return { dir: lastDir, strength: ratio };
}

/** EMA helper. */
function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  out.push(prev);
  for (let i = 1; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

/** MACD line value (last) using 12/26. */
export function macdLast(closes: number[]): number {
  if (closes.length < 26) return 0;
  const e12 = ema(closes, 12);
  const e26 = ema(closes, 26);
  return e12[e12.length - 1] - e26[e26.length - 1];
}

/** RSI (Wilder, 14) array. */
function rsiArr(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains.push(Math.max(0, d));
    losses.push(Math.max(0, -d));
  }
  const out: number[] = [];
  let avgG = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgL = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out.push(100 - 100 / (1 + (avgL === 0 ? 100 : avgG / avgL)));
  for (let i = period; i < gains.length; i++) {
    avgG = (avgG * (period - 1) + gains[i]) / period;
    avgL = (avgL * (period - 1) + losses[i]) / period;
    out.push(100 - 100 / (1 + (avgL === 0 ? 100 : avgG / avgL)));
  }
  return out;
}

/** Stochastic RSI (0..100), last value. */
export function stochRsiLast(closes: number[], period = 14): number {
  const rsi = rsiArr(closes, period);
  if (rsi.length < period) return 50;
  const window = rsi.slice(-period);
  const min = Math.min(...window);
  const max = Math.max(...window);
  if (max === min) return 50;
  return ((rsi[rsi.length - 1] - min) / (max - min)) * 100;
}

/** Combine 15m + 1h candles into HTF trend per spec. */
export function classifyHTF(c15: Candle[], c60: Candle[]): HTFTrend {
  const candles = c60.length >= 30 ? c60 : c15;
  if (!candles.length) return { bias: "NEUTRAL", macd: 0, stochRsi: 50, closeOpen: 0 };
  const last = candles[candles.length - 1];
  const closes = candles.map((c) => c.close);
  const macd = macdLast(closes);
  const sr = stochRsiLast(closes);
  const closeOpen = last.close - last.open;
  const bullish = closeOpen > 0 && macd > 0 && sr > 50;
  const bearish = closeOpen < 0 && macd < 0 && sr < 50;
  return {
    bias: bullish ? "BULLISH" : bearish ? "BEARISH" : "NEUTRAL",
    macd,
    stochRsi: sr,
    closeOpen,
  };
}

/** Realised volatility on recent ticks (stddev of returns). */
function volatility(ticks: Tick[]): number {
  if (ticks.length < 10) return 0;
  const tail = ticks.slice(-30);
  const rets: number[] = [];
  for (let i = 1; i < tail.length; i++) {
    const r = (tail[i].quote - tail[i - 1].quote) / tail[i - 1].quote;
    rets.push(r);
  }
  const m = rets.reduce((a, b) => a + b, 0) / rets.length;
  const v = rets.reduce((a, b) => a + (b - m) ** 2, 0) / rets.length;
  return Math.sqrt(v) * 1e4; // scale
}

/** Build per-symbol signal + score. */
export function evaluateSymbol(
  def: SymbolDef,
  ticks: Tick[],
  c15: Candle[],
  c60: Candle[],
): SymbolSignal {
  const momentum = tickMomentum(ticks);
  const spike = detectSpike(ticks);
  const htf = classifyHTF(c15, c60);
  const vol = volatility(ticks);
  const momentumScore = momentum ? 1 : 0;
  const spikeScore = spike ? Math.min(spike.strength / 2.5, 4) : 0;
  const score = momentumScore + spikeScore + vol;
  const parts = [
    momentum ? `mom=${momentum}` : null,
    spike ? `spike=${spike.dir}×${spike.strength.toFixed(2)}` : null,
    `htf=${htf.bias}`,
    `vol=${vol.toFixed(2)}`,
  ].filter(Boolean);
  return {
    symbol: def.code,
    speed: def.speed,
    momentum,
    spike,
    htf,
    score,
    reason: parts.join(" • "),
  };
}

/**
 * Decide if a signal yields a trade direction per the strict rules.
 * - Spike mode requires the *next* tick to reverse against the spike, AND HTF must align.
 * - Otherwise momentum + HTF must align in the same direction.
 * `lastTickDirAfterSpike` is the direction of the very latest tick AFTER the spike tick.
 */
export function resolveEntry(
  sig: SymbolSignal,
  ticks: Tick[],
): { direction: Direction; mode: "momentum" | "spike" } | null {
  // Spike mode (priority)
  if (sig.spike && ticks.length >= 2) {
    const a = ticks[ticks.length - 2].quote;
    const b = ticks[ticks.length - 1].quote;
    const lastDir: Direction = b > a ? "CALL" : b < a ? "PUT" : sig.spike.dir;
    // wait 1 tick: if spike was UP and next tick is DOWN -> SELL
    if (sig.spike.dir === "CALL" && lastDir === "PUT" && sig.htf.bias === "BEARISH") {
      return { direction: "PUT", mode: "spike" };
    }
    if (sig.spike.dir === "PUT" && lastDir === "CALL" && sig.htf.bias === "BULLISH") {
      return { direction: "CALL", mode: "spike" };
    }
  }
  // Momentum mode
  if (sig.momentum === "CALL" && sig.htf.bias === "BULLISH") {
    return { direction: "CALL", mode: "momentum" };
  }
  if (sig.momentum === "PUT" && sig.htf.bias === "BEARISH") {
    return { direction: "PUT", mode: "momentum" };
  }
  return null;
}
