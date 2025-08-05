import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILendingHistory {
  id: string;
  timestamp: Date;
  token: string; // SOL, tBTC, USDC, etc.
  action: 'LEND' | 'BORROW' | 'WITHDRAW' | 'REPAY';
  amount: string; // Amount in token units
  amountUsd: string; // USD value at time of transaction
  apy: number; // Interest rate at time of transaction
  platform: 'KAMINO'; // Future: could add other platforms
  txHash?: string; // Transaction hash (optional for failed transactions)
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  error?: string; // Error message if failed
  message?: string; // Additional information
  decisionId?: string; // Reference to AI decision that triggered this
  createdAt?: Date;
  updatedAt?: Date;
}

const lendingHistorySchema = new mongoose.Schema<ILendingHistory>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  token: {
    type: String,
    required: true,
    uppercase: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LEND', 'BORROW', 'WITHDRAW', 'REPAY']
  },
  amount: {
    type: String,
    required: true
  },
  amountUsd: {
    type: String,
    required: true
  },
  apy: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true,
    default: 'KAMINO',
    enum: ['KAMINO']
  },
  txHash: {
    type: String,
    required: function() {
      return this.status === 'COMPLETED';
    },
    sparse: true // Only enforce uniqueness on non-null values
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  error: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  decisionId: {
    type: String,
    ref: 'DecisionHistory',
    required: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for faster queries
lendingHistorySchema.index({ txHash: 1 });
lendingHistorySchema.index({ token: 1 });
lendingHistorySchema.index({ action: 1 });
lendingHistorySchema.index({ status: 1 });
lendingHistorySchema.index({ timestamp: -1 });
lendingHistorySchema.index({ decisionId: 1 });

// Compound indexes for common queries
lendingHistorySchema.index({ token: 1, action: 1 });
lendingHistorySchema.index({ status: 1, timestamp: -1 });

export const LendingHistory = mongoose.model<ILendingHistory>('LendingHistory', lendingHistorySchema);