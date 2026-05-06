export type Direction = "CALL" | "PUT";

export interface Tick {
  epoch: number;
  quote: number;
}

export interface Candle {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SymbolDef {
  code: string;          // Deriv symbol code (e.g. R_100, 1HZ100V)
  label: string;
  speed: "fast" | "slow"; // fast = 1s, slow = 2s
}

export const SYMBOL_LIST: SymbolDef[] = [
  { code: "1HZ10V",  label: "Volatility 10 (1s)",  speed: "fast" },
  { code: "1HZ25V",  label: "Volatility 25 (1s)",  speed: "fast" },
  { code: "1HZ50V",  label: "Volatility 50 (1s)",  speed: "fast" },
  { code: "1HZ75V",  label: "Volatility 75 (1s)",  speed: "fast" },
  { code: "1HZ100V", label: "Volatility 100 (1s)", speed: "fast" },
  { code: "R_10",  label: "Volatility 10",  speed: "slow" },
  { code: "R_25",  label: "Volatility 25",  speed: "slow" },
  { code: "R_50",  label: "Volatility 50",  speed: "slow" },
  { code: "R_75",  label: "Volatility 75",  speed: "slow" },
  { code: "R_100", label: "Volatility 100", speed: "slow" },
];

export interface TradeRecord {
  id: string;
  contractId?: number;
  symbol: string;
  cycle: number;
  direction: Direction;
  stake: number;
  duration: number;
  payout?: number;
  profit?: number;
  status: "pending" | "open" | "won" | "lost" | "error";
  openedAt: number;
  closedAt?: number;
  entrySpot?: number;
  exitSpot?: number;
  error?: string;
  retries?: number;
}

export interface BotConfig {
  symbols: string[];           // active set (codes)
  batchSize: number;
  takeProfit: number | null;
  stopLoss: number | null;
  maxCycles: number | null;
}

export type BotStatus = "idle" | "connecting" | "running" | "waiting" | "stopped" | "error";

export interface HTFTrend {
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  macd: number;
  stochRsi: number;
  closeOpen: number;
}

export interface SymbolSignal {
  symbol: string;
  speed: "fast" | "slow";
  momentum: Direction | null;     // strict 3-5 monotone
  spike: { dir: Direction; strength: number } | null;
  htf: HTFTrend;
  score: number;
  reason: string;
}
