import mongoose from 'mongoose';
import { logger } from '@utils/logger';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info({
        message: 'Already connected to MongoDB',
        labels: { origin: 'database' }
      });
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soltradeai';
      
      await mongoose.connect(mongoUri, {
        retryWrites: true,
        w: 'majority'
      });

      this.isConnected = true;
      logger.info({
        message: 'MongoDB connected successfully',
        labels: { origin: 'database' }
      });
    } catch (error) {
      logger.error({
        message: `MongoDB connection error: ${error.message}`,
        labels: { origin: 'database' }
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info({
        message: 'MongoDB disconnected',
        labels: { origin: 'database' }
      });
    } catch (error) {
      logger.error({
        message: `MongoDB disconnect error: ${error.message}`,
        labels: { origin: 'database' }
      });
      throw error;
    }
  }
}

export const db = Database.getInstance();
export default db;
