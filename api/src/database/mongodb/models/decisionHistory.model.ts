import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDecisionHistory {
  id: string;
  decision: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const decisionHistorySchema = new mongoose.Schema<IDecisionHistory>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true
  },
  decision: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for faster queries
decisionHistorySchema.index({ createdAt: -1 });

export const DecisionHistory = mongoose.model<IDecisionHistory>('DecisionHistory', decisionHistorySchema); 