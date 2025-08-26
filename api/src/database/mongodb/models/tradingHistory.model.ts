import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITradingHistory {
  id: string;
  timestamp: Date;
  pair: string;
  action: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  expectedAmountOut: string;
  txHash?: string; // Optional - only present for successful trades
  status: string;
  error?: string;
  message?: string;
  decisionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const tradingHistorySchema = new mongoose.Schema<ITradingHistory>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  pair: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  tokenIn: {
    type: String,
    required: true
  },
  tokenOut: {
    type: String,
    required: true
  },
  amountIn: {
    type: String,
    required: true
  },
  expectedAmountOut: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    required: function() {
      return this.status === 'COMPLETED'; // Only required for successful trades
    },
    sparse: true // Only enforce uniqueness on non-null values
  },
  status: {
    type: String,
    required: true
  },
  error: String,
  message: String,
  decisionId: {
    type: String,
    ref: 'DecisionHistory'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for faster queries
tradingHistorySchema.index({ txHash: 1 });
tradingHistorySchema.index({ pair: 1 });
tradingHistorySchema.index({ decisionId: 1 });
tradingHistorySchema.index({ createdAt: -1 });

export const TradingHistory = mongoose.model<ITradingHistory>('TradingHistory', tradingHistorySchema); 