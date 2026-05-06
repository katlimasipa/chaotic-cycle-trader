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
  const htf15 = classifyHTF(c15);
  const htf60 = classifyHTF(c60);
  const vol = getVolatility(ticks);
  const rsi = htf15.stochRsi;
  
  let score = 0;
  if (momentum) score += 2;
  if (spike) score += 3;
  if (htf15.bias !== "NEUTRAL" && htf15.bias === htf60.bias) score += 2;
  
  const volWeight = vol > 5 && vol < 50 ? 1 : 0;
  score *= (1 + volWeight);

  const parts = [
    momentum ? `mom=${momentum}` : null,
    spike ? `spike=${spike.dir}` : null,
    `htf=${htf15.bias}/${htf60.bias}`,
    `rsi=${rsi.toFixed(0)}`,
  ].filter(Boolean);

  return {
    symbol: def.code,
    speed: def.speed,
    momentum,
    spike,
    htf15,
    htf60,
    rsi,
    score,
    reason: parts.join(" • "),
  };
}

/**
 * resolveEntry: High frequency with basic trend confluence.
 */
export function resolveEntry(sig: SymbolSignal, ticks: Tick[]): { mode: "momentum" | "spike"; direction: Direction } | null {
  if (ticks.length < 5) return null;
  const lastTick = ticks[ticks.length - 1].quote;
  const prevTick = ticks[ticks.length - 2].quote;

  // 1. HTF Filter: Use only 15m bias for speed.
  const bias = sig.htf15.bias;

  // 2. Momentum Strategy (Trend Following)
  const mom = tickMomentum(ticks);
  if (mom) {
    // Match 15m trend or if trend is neutral
    if (bias === "NEUTRAL" || mom === bias) {
      // Very loose RSI guards (75/25)
      if (mom === "CALL" && sig.rsi > 75) return null;
      if (mom === "PUT" && sig.rsi < 25) return null;
      return { mode: "momentum", direction: mom };
    }
  }

  // 3. Spike Strategy (Mean Reversion)
  const spike = detectSpike(ticks);
  if (spike) {
    const reversalDir: Direction = spike.dir === "CALL" ? "PUT" : "CALL";
    
    // Trade spikes if 15m is NOT strongly trending against the reversal
    if (bias === "NEUTRAL" || reversalDir === bias) {
      const isReverting = reversalDir === "CALL" ? lastTick > prevTick : lastTick < prevTick;
      if (isReverting) {
        return { mode: "spike", direction: reversalDir };
      }
    }
  }

  return null;
}
