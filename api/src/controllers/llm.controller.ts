import { Request, Response, NextFunction } from 'express';
import Services from '@services/index';
import { MarketDataParams } from '@services/marketData.service';

class LLMController {
  public test = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const llmService = Services.getInstance().llmService;
      const params: Partial<MarketDataParams> = {
        resolution: '240',
      };

      const result = await llmService.makeDecision(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public makeDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const llmService = Services.getInstance().llmService;
      const params: Partial<MarketDataParams> = {
        resolution: '240',
      };

      const result = await llmService.makeDecision(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getDecisions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const llmService = Services.getInstance().llmService;
      const result = await llmService.getDecisionHistory(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LLMController;
