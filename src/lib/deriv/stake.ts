// Profit-tier stake ladder. Strict, no martingale.
export function stakeForProfit(profit: number): number {
  if (profit < 10) return 1;
  if (profit < 50) return 5;
  if (profit < 100) return 10;
  if (profit < 500) return 25;
  if (profit < 1000) return 100;
  return 100;
}

export const STAKE_TIERS: { label: string; stake: number; min: number; max: number }[] = [
  { label: "< $10", stake: 1, min: -Infinity, max: 10 },
  { label: "$10 – $50", stake: 5, min: 10, max: 50 },
  { label: "$50 – $100", stake: 10, min: 50, max: 100 },
  { label: "$100 – $500", stake: 25, min: 100, max: 500 },
  { label: "$500 – $1000", stake: 100, min: 500, max: 1000 },
];
