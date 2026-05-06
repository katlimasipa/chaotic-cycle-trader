import type { Candle, Direction, HTFTrend, SymbolSignal, SymbolDef, Tick } from "./types";

/** 
 * Smoothed momentum on last 10 ticks.
 * Returns direction if consistency is high (>70%).
 */
export function tickMomentum(ticks: Tick[]): Direction | null {
  if (ticks.length < 9) return null;
  const tail = ticks.slice(-9);
  let ups = 0;
  let downs = 0;
  
  for (let i = 1; i < tail.length; i++) {
    if (tail[i].quote > tail[i - 1].quote) ups++;
    else if (tail[i].quote < tail[i - 1].quote) downs++;
  }

  // 7 out of 8 moves (approx 87%) - Faster but still trending
  if (ups < 7 && downs < 7) return null;

  // Reduced Min distance check (0.002% of price)
  const netMove = Math.abs(tail[tail.length - 1].quote - tail[0].quote);
  const minMove = tail[0].quote * 0.00002; 
  if (netMove < minMove) return null;
  
  return ups >= 7 ? "CALL" : "PUT";
}

/** 
 * Spike: last tick move > 2.5x avg of previous 10 sizes.
 */
export function detectSpike(ticks: Tick[]): { dir: Direction; strength: number } | null {
  if (ticks.length < 12) return null;
  const tail = ticks.slice(-10);
  const sizes: number[] = [];
  for (let i = 1; i < tail.length; i++) sizes.push(Math.abs(tail[i].quote - tail[i - 1].quote));
  
  const last = sizes[sizes.length - 1];
  const prev = sizes.slice(0, -1); 
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  
  if (avg <= 0) return null;
  const ratio = last / avg;
  
  // 2.5x for much more frequent spike entries
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

/** SMMA (Smoothed Moving Average) used by Alligator. */
function smma(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const out: number[] = [];
  let prevSma = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out.push(prevSma);
  for (let i = period; i < values.length; i++) {
    const val = (prevSma * (period - 1) + values[i]) / period;
    out.push(val);
    prevSma = val;
  }
  return out;
}

/** Awesome Oscillator (AO) */
function calculateAO(hl2: number[]): number[] {
  if (hl2.length < 34) return [];
  const sma5 = hl2.map((_, i) => (i < 4 ? 0 : hl2.slice(i - 4, i + 1).reduce((a, b) => a + b, 0) / 5));
  const sma34 = hl2.map((_, i) => (i < 33 ? 0 : hl2.slice(i - 33, i + 1).reduce((a, b) => a + b, 0) / 34));
  return sma5.map((v, i) => v - sma34[i]);
}

/** Fractals detection. */
function detectFractals(candles: Candle[]): { high: number | null; low: number | null } {
  if (candles.length < 5) return { high: null, low: null };
  const h = candles.map(c => c.high);
  const l = candles.map(c => c.low);
  
  let lastHigh = null;
  let lastLow = null;
  
  for (let i = 2; i < h.length - 2; i++) {
    if (h[i] > h[i-1] && h[i] > h[i-2] && h[i] > h[i+1] && h[i] > h[i+2]) lastHigh = h[i];
    if (l[i] < l[i-1] && l[i] < l[i-2] && l[i] < l[i+1] && l[i] < l[i+2]) lastLow = l[i];
  }
  
  return { high: lastHigh, low: lastLow };
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

/** Classify HTF trend with MACD and RSI. */
export function classifyHTF(candles: Candle[]): HTFTrend {
  if (candles.length < 30) return { bias: "NEUTRAL", macd: 0, stochRsi: 50, closeOpen: 0 };
  
  const closes = candles.map((c) => c.close);
  const { macd, hist } = macdInfo(closes);
  const rsi = rsiLast(closes);
  
  const bullish = hist > 0 && rsi > 52;
  const bearish = hist < 0 && rsi < 48;
  
  return {
    bias: bullish ? "BULLISH" : bearish ? "BEARISH" : "NEUTRAL",
    macd,
    stochRsi: rsi,
    closeOpen: closes[closes.length - 1] - closes[closes.length - 5],
  };
}

/** Chaotic Market State (Bill Williams Alligator). */
function getAlligator(candles: Candle[]): { jaw: number; teeth: number; lips: number; state: "SLEEPING" | "HUNTING_UP" | "HUNTING_DN" | "WAKING" } {
  if (candles.length < 30) return { jaw: 0, teeth: 0, lips: 0, state: "SLEEPING" };
  const hl2 = candles.map(c => (c.high + c.low) / 2);
  
  const jawLine = smma(hl2, 13);
  const teethLine = smma(hl2, 8);
  const lipsLine = smma(hl2, 5);
  
  // Apply offsets (simulated by looking back)
  const jaw = jawLine[jawLine.length - 8] || 0;
  const teeth = teethLine[teethLine.length - 5] || 0;
  const lips = lipsLine[lipsLine.length - 3] || 0;
  
  const isBullish = lips > teeth && teeth > jaw;
  const isBearish = lips < teeth && teeth < jaw;
  
  // Sleeping check (lines too close)
  const atr = rsiLast(candles.map(c => Math.abs(c.high - c.low))); // proxy for ATR
  const gap = Math.min(Math.abs(lips - teeth), Math.abs(teeth - jaw));
  const isSleeping = gap < atr * 0.1;
  
  return {
    jaw, teeth, lips,
    state: isSleeping ? "SLEEPING" : isBullish ? "HUNTING_UP" : isBearish ? "HUNTING_DN" : "WAKING"
  };
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
  const htf15Alligator = getAlligator(c15);
  const htf60Alligator = getAlligator(c60);
  
  const hl2_15 = c15.map(c => (c.high + c.low) / 2);
  const ao15 = calculateAO(hl2_15);
  const lastAo = ao15[ao15.length - 1] || 0;
  const prevAo = ao15[ao15.length - 2] || 0;
  const aoUp = lastAo > prevAo;
  
  let score = 0;
  if (htf15Alligator.state !== "SLEEPING") score += 2;
  if (htf15Alligator.state === "HUNTING_UP" && aoUp) score += 3;
  if (htf15Alligator.state === "HUNTING_DN" && !aoUp) score += 3;
  if (momentum) score += 1;
  
  const parts = [
    `structure=${htf15Alligator.state}`,
    `ao=${aoUp ? "UP" : "DN"}`,
    momentum ? `mom=${momentum}` : null,
  ].filter(Boolean);

  // Map Alligator state to htf bias for backward compatibility in resolveEntry
  const htf15: HTFTrend = {
    bias: htf15Alligator.state === "HUNTING_UP" ? "BULLISH" : htf15Alligator.state === "HUNTING_DN" ? "BEARISH" : "NEUTRAL",
    macd: lastAo,
    stochRsi: 50,
    closeOpen: 0
  };

  return {
    symbol: def.code,
    speed: def.speed,
    momentum,
    spike,
    htf15,
    htf60: htf15, // simplify for now
    rsi: 50,
    score,
    reason: parts.join(" • "),
  };
}

/**
 * resolveEntry: Chaotic Strategy (Bill Williams Logic).
 */
export function resolveEntry(sig: SymbolSignal, ticks: Tick[]): { mode: "momentum" | "spike"; direction: Direction } | null {
  // This needs candle context. Since resolveEntry usually takes ticks, we'll assume sig has enough info or check tick patterns.
  // We'll primarily use the htf15 (short-term structure) as the execution timeframe for Chaos.
  
  const structure = sig.htf15; // We'll assume evaluateSymbol put Alligator state in bias
  const lastPrice = ticks[ticks.length - 1].quote;
  
  // Chaos Logic:
  // 1. Alligator must be Hunting
  // 2. Momentum (AO/AC) must be in Zone
  // 3. Optional: Fractal breakout (simplified here as price move)
  
  if (sig.reason.includes("SLEEPING")) return null;

  if (sig.momentum === "CALL" && sig.reason.includes("HUNTING_UP")) {
    return { mode: "momentum", direction: "CALL" };
  }
  if (sig.momentum === "PUT" && sig.reason.includes("HUNTING_DN")) {
    return { mode: "momentum", direction: "PUT" };
  }

  return null;
}
