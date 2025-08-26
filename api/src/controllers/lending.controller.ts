import { Request, Response, NextFunction } from 'express';
import Services from '@services/index';
import { LendingHistory } from '../database/mongodb/models/lendingHistory.model';
import { logger } from '@utils/logger';

class LendingController {
  /**
   * Get Kamino lending market data
   */
  public getLendingMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { kaminoService } = Services.getInstance();
      
      if (!kaminoService) {
        return res.status(503).json({
          success: false,
          message: 'Kamino service not available'
        });
      }

      const metrics = await kaminoService.getLendingMetrics();
      
      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error({
        message: `Error fetching lending metrics: ${error.message}`,
        labels: { origin: 'LendingController' },
      });
      next(error);
    }
  };

  /**
   * Get lending history
   */
  public getLendingHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        token, 
        action, 
        status 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter object
      const filter: any = {};
      if (token) filter.token = token;
      if (action) filter.action = action;
      if (status) filter.status = status;

      // Get total count and records
      const [total, records] = await Promise.all([
        LendingHistory.countDocuments(filter),
        LendingHistory.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      res.status(200).json({
        success: true,
        data: {
          records,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      logger.error({
        message: `Error fetching lending history: ${error.message}`,
        labels: { origin: 'LendingController' },
      });
      next(error);
    }
  };

  /**
   * Test Kamino connectivity
   */
  public testKaminoConnection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { kaminoService } = Services.getInstance();
      
      if (!kaminoService) {
        return res.status(503).json({
          success: false,
          message: 'Kamino service not available'
        });
      }

      const healthCheck = await kaminoService.healthCheck();
      
      res.status(healthCheck.healthy ? 200 : 503).json({
        success: healthCheck.healthy,
        message: healthCheck.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error({
        message: `Error testing Kamino connection: ${error.message}`,
        labels: { origin: 'LendingController' },
      });
      next(error);
    }
  };

  /**
   * Manual lending test (for development/debugging)
   */
  public testLendingDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { llmService } = Services.getInstance();
      
      if (!llmService) {
        return res.status(503).json({
          success: false,
          message: 'LLM service not available'
        });
      }

      // This will trigger the lending analysis as part of the decision process
      const decision = await llmService.makeDecision();
      
      res.status(200).json({
        success: true,
        message: 'Lending decision analysis completed',
        data: {
          lending: decision.recommendations?.lending,
          timestamp: decision.timestamp
        }
      });
    } catch (error) {
      logger.error({
        message: `Error testing lending decision: ${error.message}`,
        labels: { origin: 'LendingController' },
      });
      next(error);
    }
  };
}

export default LendingController;