import type { Candle, Direction, HTFTrend, SymbolSignal, SymbolDef, Tick } from "./types";

/** 
 * Smoothed momentum on last 10 ticks.
 * Returns direction if consistency is high (>70%).
 */
export function tickMomentum(ticks: Tick[]): Direction | null {
  if (ticks.length < 7) return null;
  const tail = ticks.slice(-7); // Look at last 7 ticks
  let ups = 0;
  let downs = 0;
  
  for (let i = 1; i < tail.length; i++) {
    if (tail[i].quote > tail[i - 1].quote) ups++;
    else if (tail[i].quote < tail[i - 1].quote) downs++;
  }

  // Require 5/6 moves (approx 83%) - slightly looser than before
  if (ups < 5 && downs < 5) return null;

  // Reduced Min distance check (0.002% of price)
  const netMove = Math.abs(tail[tail.length - 1].quote - tail[0].quote);
  const minMove = tail[0].quote * 0.00002; 
  if (netMove < minMove) return null;
  
  return ups >= 5 ? "CALL" : "PUT";
}

/** 
 * Spike: last tick move > 2.5x avg of previous 7 sizes.
 */
export function detectSpike(ticks: Tick[]): { dir: Direction; strength: number } | null {
  if (ticks.length < 10) return null;
  const tail = ticks.slice(-10);
  const sizes: number[] = [];
  for (let i = 1; i < tail.length; i++) sizes.push(Math.abs(tail[i].quote - tail[i - 1].quote));
  
  const last = sizes[sizes.length - 1];
  const prev = sizes.slice(0, -1); 
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  
  if (avg <= 0) return null;
  const ratio = last / avg;
  
  // Loosened threshold (2.5) for more entries
  if (ratio < 2.5) return null;
  
  const lastDir: Direction = tail[tail.length - 1].quote > tail[tail.length - 2].quote ? "CALL" : "PUT";
  return { dir: lastDir, strength: ratio };
}

/** EMA helper. */
function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
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

/** MACD (12, 26, 9) */
export function macdInfo(closes: number[]): { macd: number; signal: number; hist: number } {
  if (closes.length < 35) return { macd: 0, signal: 0, hist: 0 };
  const e12 = ema(closes, 12);
  const e26 = ema(closes, 26);
  const macdLine = e12.map((v, i) => v - e26[i]);
  const signalLine = ema(macdLine.slice(26), 9);
  
  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  
  return {
    macd: lastMacd,
    signal: lastSignal,
    hist: lastMacd - lastSignal
  };
}

/** RSI (14) last value. */
export function rsiLast(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

/** Classify HTF trend with more weight on MACD and EMA slope. */
export function classifyHTF(c15: Candle[], c60: Candle[]): HTFTrend {
  const candles = c60.length >= 30 ? c60 : c15;
  if (candles.length < 30) return { bias: "NEUTRAL", macd: 0, stochRsi: 50, closeOpen: 0 };
  
  const closes = candles.map((c) => c.close);
  const { macd, hist } = macdInfo(closes);
  const rsi = rsiLast(closes);
  
  // Trend identification: MACD above signal and positive histogram, or RSI strong
  const bullish = hist > 0 && rsi > 55;
  const bearish = hist < 0 && rsi < 45;
  
  return {
    bias: bullish ? "BULLISH" : bearish ? "BEARISH" : "NEUTRAL",
    macd,
    stochRsi: rsi, // we'll reuse the field but it's regular RSI now for simplicity/reliability
    closeOpen: closes[closes.length - 1] - closes[closes.length - 5], // 5-candle momentum
  };
}

/** Realised volatility on recent ticks (stddev of returns). */
function getVolatility(ticks: Tick[]): number {
  if (ticks.length < 20) return 0;
  const tail = ticks.slice(-20);
  const rets: number[] = [];
  for (let i = 1; i < tail.length; i++) {
    rets.push((tail[i].quote - tail[i - 1].quote) / tail[i - 1].quote);
  }
  const m = rets.reduce((a, b) => a + b, 0) / rets.length;
  const v = rets.reduce((a, b) => a + (b - m) ** 2, 0) / rets.length;
  return Math.sqrt(v) * 1e5; // scale higher
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
  const vol = getVolatility(ticks);
  
  // Quality-based scoring instead of raw volatility
  let score = 0;
  if (momentum) score += 2;
  if (spike) score += 3;
  if (htf.bias !== "NEUTRAL") score += 1;
  
  // Volatility filter: Prefer active but not "crazy" markets
  const volWeight = vol > 5 && vol < 50 ? 1 : 0;
  score *= (1 + volWeight);

  const parts = [
    momentum ? `mom=${momentum}` : null,
    spike ? `spike=${spike.dir}×${spike.strength.toFixed(1)}` : null,
    `htf=${htf.bias}`,
    `vol=${vol.toFixed(1)}`,
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
 * Added: Mean Reversion logic for spikes against HTF trend.
 */
export function resolveEntry(
  sig: SymbolSignal,
  ticks: Tick[],
): { direction: Direction; mode: "momentum" | "spike" } | null {
  if (ticks.length < 2) return null;

  // 1. Spike Reversal (Mean Reversion) - Very High Accuracy
  if (sig.spike) {
    const lastTick = ticks[ticks.length - 1].quote;
    const prevTick = ticks[ticks.length - 2].quote;
    const currentDir = lastTick > prevTick ? "CALL" : "PUT";

    // If we had a CALL spike and now price starts ticking down, AND HTF is BEARISH or NEUTRAL
    if (sig.spike.dir === "CALL" && currentDir === "PUT" && sig.htf.bias !== "BULLISH") {
      return { direction: "PUT", mode: "spike" };
    }
    // If we had a PUT spike and now price starts ticking up, AND HTF is BULLISH or NEUTRAL
    if (sig.spike.dir === "PUT" && currentDir === "CALL" && sig.htf.bias !== "BEARISH") {
      return { direction: "CALL", mode: "spike" };
    }
  }

  // 2. Momentum Follow - Trend Following
  // Only enter if Momentum matches HTF Bias for strong confluence
  if (sig.momentum === "CALL" && sig.htf.bias === "BULLISH") {
    return { direction: "CALL", mode: "momentum" };
  }
  if (sig.momentum === "PUT" && sig.htf.bias === "BEARISH") {
    return { direction: "PUT", mode: "momentum" };
  }

  return null;
}
