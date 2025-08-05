import mongoose from 'mongoose';
import { logger } from '@utils/logger';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soltradeai';
    
    await mongoose.connect(mongoUri, {
      // MongoDB connection options
      retryWrites: true,
      w: 'majority'
    });

    logger.info({
      message: 'MongoDB connected successfully',
      labels: { origin: 'database' }
    });
  } catch (error) {
    logger.error({
      message: `MongoDB connection error: ${error.message}`,
      labels: { origin: 'database' }
    });
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn({
    message: 'MongoDB disconnected',
    labels: { origin: 'database' }
  });
});

mongoose.connection.on('error', (err) => {
  logger.error({
    message: `MongoDB error: ${err.message}`,
    labels: { origin: 'database' }
  });
}); 