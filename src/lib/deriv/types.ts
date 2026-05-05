export type Direction = "CALL" | "PUT";

export interface Tick {
  epoch: number;
  quote: number;
}

export interface TradeRecord {
  id: string;
  contractId?: number;
  cycle: number;
  direction: Direction;
  stake: number;
  payout?: number;
  profit?: number;
  status: "pending" | "open" | "won" | "lost" | "error";
  openedAt: number;
  closedAt?: number;
  entrySpot?: number;
  exitSpot?: number;
  error?: string;
}

export interface BotConfig {
  symbol: string;
  batchSize: number;
  takeProfit: number | null;
  stopLoss: number | null;
  maxCycles: number | null;
}

export type BotStatus = "idle" | "connecting" | "running" | "waiting" | "stopped" | "error";
