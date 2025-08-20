// Trading history
export interface ITradingHistoryData {
  id: string;
  pair: string;
  action: string;
  amountIn: string;
  expectedAmountOut: string;
  createdAt: string;
  status: string;
  price: string;
  txHash: string;
  tokenIn: string;
  tokenOut: string;
  decisionId: string;
  decision: IDecision;
  error: string | null;
  message: string;
  timestamp: string;
  updatedAt: string;
}

export interface ITradingHistoryTable {
  id: string;
  txHash: string;
  txDate: string;
  txDescription: string;
}

// Decision
export interface IDecision {
  id: string;
  decision: object;
  createdAt: string;
  updatedAt: string;
}
// export interface IDecisionLending {
//   borrowApy: number;
//   supplyApy: number;
//   timestamp: string;
//   totalBorrow: number;
//   totalSupply: number;
//   utilizationRate: number;
// }
// export interface IDecisionTrading {
//   action: "WAIT" | "BUY";
//   confidence: "HIGH" | "LOW";
//   pair: string; // "SOL_USD"
//   reasoning: {
//     pairSelection: string;
//     riskAssessment: "HIGH" | "LOW";
//     technicalAnalysis: string;
//   };
// }

// OHLC Historical Price Metrics
export interface OHLCData {
  t: number[]; // Timestamps (Unix seconds)
  o: number[]; // Open prices
  h: number[]; // High prices
  l: number[]; // Low prices
  c: number[]; // Close prices
}
export interface OHLCVPairItem {
  address: string; // The address of a pair contract
  o: number; // Open prices
  h: number; // High prices
  l: number; // Low prices
  c: number; // Close prices
  type: string; // OHLCV time frame.
  unixTime: number; // Timestamps (Unix seconds)
  v: number; // Volume
}
