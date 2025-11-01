// Trading history
export interface ITradingHistoryData {
  _id: string;
  timestamp: string;
  pair: string;
  action: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  expectedAmountOut: string;
  txHash: string;
  status: string;
  message: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITradingHistoryTable {
  id: string;
  txDate: string;
  action: string;
  txDescription: string;
  amount: string;
  token: string;
  txStatus: string;
  txHash: string;
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

// Lending history
export interface ILendingHistoryData {
  _id: string;
  timestamp: string;
  token: string;
  action: string;
  amount: string;
  apy?: number;
  platform: string;
  status: string;
  error?: string;
  message: string;
  decisionId?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILendingHistoryTable {
  id: string;
  txDate: string;
  action: string;
  txDescription: string;
  amount: string;
  pair: string;
  apy: number;
  status: string;
}
