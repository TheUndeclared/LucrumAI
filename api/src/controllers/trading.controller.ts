import { NextFunction, Request, Response } from 'express';
import responsePreparer from '@middlewares/responseHandler.middleware';
import Services from '@services/index';

class TradingController {
  private solanaTrading = Services.getInstance()?.solanaTrading;

  public getTradingHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.solanaTrading) {
        return responsePreparer(503, { 
          message: 'Solana trading service not available',
          history: []
        })(req, res, next);
      }

      // Use the existing trading history from the old trading service approach
      // Import TradingHistory model directly since we removed TradingService
      const { TradingHistory } = await import('../database/mongodb/models/tradingHistory.model');
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const total = await TradingHistory.countDocuments();
      const history = await TradingHistory.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return responsePreparer(200, {
        message: 'Trading history retrieved successfully',
        data: history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  public getAvailablePairs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.solanaTrading) {
        return responsePreparer(503, { 
          message: 'Solana trading service not available',
          pairs: []
        })(req, res, next);
      }

      const availablePairs = this.solanaTrading.getAvailablePairs();
      const pairDetails = availablePairs.map(pairName => {
        const config = this.solanaTrading.getPairConfig(pairName);
        return {
          name: pairName,
          baseToken: config?.baseToken,
          quoteToken: config?.quoteToken,
          enabled: config?.enabled
        };
      });

      return responsePreparer(200, {
        message: 'Available trading pairs retrieved successfully',
        pairs: pairDetails,
        total: pairDetails.length
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  public getBalances = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.solanaTrading) {
        return responsePreparer(503, { 
          message: 'Solana trading service not available',
          balances: []
        })(req, res, next);
      }

      const balances = await this.solanaTrading.getAllBalances();
      return responsePreparer(200, {
        message: 'Balances retrieved successfully',
        balances,
        total: balances.length
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  public testTrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.solanaTrading) {
        return responsePreparer(503, { 
          message: 'Solana trading service not available'
        })(req, res, next);
      }

      const { action, pair, amount } = req.body;

      if (!action || !pair || !amount) {
        return responsePreparer(400, {
          message: 'Missing required parameters: action, pair, amount',
          required: { action: 'BUY|SELL', pair: 'string', amount: 'number' }
        })(req, res, next);
      }

      if (!['BUY', 'SELL'].includes(action)) {
        return responsePreparer(400, {
          message: 'Invalid action. Must be BUY or SELL'
        })(req, res, next);
      }

      // Validate pair exists
      const pairConfig = this.solanaTrading.getPairConfig(pair);
      if (!pairConfig) {
        const availablePairs = this.solanaTrading.getAvailablePairs();
        return responsePreparer(400, {
          message: `Trading pair ${pair} not found or disabled`,
          availablePairs
        })(req, res, next);
      }

      const result = await this.solanaTrading.executeTrade(action, pair, parseFloat(amount));
      return responsePreparer(200, {
        message: result.success ? 'Trade executed successfully' : 'Trade failed',
        result
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default TradingController;
