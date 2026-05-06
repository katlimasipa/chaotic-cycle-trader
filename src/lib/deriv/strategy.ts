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
function getVolatility(ticks: Tick[]): { current: number; isExpanding: boolean } {
  if (ticks.length < 30) return { current: 0, isExpanding: false };
  const allRets: number[] = [];
  for (let i = 1; i < ticks.length; i++) {
    allRets.push((ticks[i].quote - ticks[i - 1].quote) / ticks[i - 1].quote);
  }
  
  const currentTail = allRets.slice(-15);
  const m = currentTail.reduce((a, b) => a + b, 0) / currentTail.length;
  const v = currentTail.reduce((a, b) => a + (b - m) ** 2, 0) / currentTail.length;
  const currentVol = Math.sqrt(v) * 1e5;

  // SMA of volatility for expansion check
  const windowSize = 20;
  const volHistory: number[] = [];
  for (let i = 0; i < allRets.length - windowSize; i++) {
    const slice = allRets.slice(i, i + windowSize);
    const mm = slice.reduce((a, b) => a + b, 0) / slice.length;
    const vv = slice.reduce((a, b) => a + (b - mm) ** 2, 0) / slice.length;
    volHistory.push(Math.sqrt(vv) * 1e5);
  }
  
  const avgVol = volHistory.length ? volHistory.reduce((a, b) => a + b, 0) / volHistory.length : currentVol;
  
  return {
    current: currentVol,
    isExpanding: currentVol > avgVol * 1.1, // 10% above average
  };
}

/** Local EMA (200) filter on ticks. */
function getLocalTrend(ticks: Tick[]): "BULLISH" | "BEARISH" | "NEUTRAL" {
  if (ticks.length < 200) return "NEUTRAL";
  const closes = ticks.map(t => t.quote);
  const ema200 = ema(closes, 200);
  const lastEma = ema200[ema200.length - 1];
  const lastPrice = closes[closes.length - 1];
  
  return lastPrice > lastEma ? "BULLISH" : "BEARISH";
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
  const localTrend = getLocalTrend(ticks);
  const rsi = htf15.stochRsi;
  
  let score = 0;
  if (momentum) score += 2;
  if (spike) score += 3;
  if (htf15.bias !== "NEUTRAL" && htf15.bias === htf60.bias) score += 2;
  if (localTrend === htf15.bias) score += 1;
  if (vol.isExpanding) score += 1;
  
  const parts = [
    momentum ? `mom=${momentum}` : null,
    spike ? `spike=${spike.dir}` : null,
    `htf=${htf15.bias}/${htf60.bias}`,
    `local=${localTrend}`,
    vol.isExpanding ? "vol↑" : "vol-",
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
 * resolveEntry: Full Confluence Logic (Pine Script Inspired).
 */
export function resolveEntry(sig: SymbolSignal, ticks: Tick[]): { mode: "momentum" | "spike"; direction: Direction } | null {
  if (ticks.length < 5) return null;
  const lastTick = ticks[ticks.length - 1].quote;
  const prevTick = ticks[ticks.length - 2].quote;

  // 1. HTF Trend (15m & 60m must be same or non-opposing)
  const bias15 = sig.htf15.bias;
  const bias60 = sig.htf60.bias;
  
  // 2. Local Filter (EMA 200)
  const localTrend = getLocalTrend(ticks);
  
  // 3. Volatility Expanding check
  const vol = getVolatility(ticks);
  if (!vol.isExpanding) return null;

  // 4. Momentum Strategy
  const mom = tickMomentum(ticks);
  if (mom) {
    // Pine Script Style: HTF Bullish + Local Bullish + Momentum Up
    const isBullishConfluence = mom === "CALL" && bias15 === "BULLISH" && (bias60 !== "BEARISH") && localTrend === "BULLISH";
    const isBearishConfluence = mom === "PUT" && bias15 === "BEARISH" && (bias60 !== "BULLISH") && localTrend === "BEARISH";
    
    if (isBullishConfluence || isBearishConfluence) {
      if (mom === "CALL" && sig.rsi > 70) return null;
      if (mom === "PUT" && sig.rsi < 30) return null;
      return { mode: "momentum", direction: mom };
    }
  }

  // 5. Spike Strategy (Mean Reversion Outliers)
  const spike = detectSpike(ticks);
  if (spike) {
    const reversalDir: Direction = spike.dir === "CALL" ? "PUT" : "CALL";
    
    // Reverse only if it's an outlier move AGAINST the trend or in extreme exhaustion
    const isExhaustion = spike.dir === "CALL" ? sig.rsi > 75 : sig.rsi < 25;
    if (isExhaustion) {
      const isReverting = reversalDir === "CALL" ? lastTick > prevTick : lastTick < prevTick;
      if (isReverting) return { mode: "spike", direction: reversalDir };
    }
  }

  return null;
}
