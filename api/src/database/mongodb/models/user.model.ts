import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id: string;
  wallet_address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true
  },
  wallet_address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for faster queries
userSchema.index({ wallet_address: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 