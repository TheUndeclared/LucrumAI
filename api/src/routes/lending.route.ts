import { Router } from 'express';
import LendingController from '@controllers/lending.controller';
import Routes from '@interfaces/routes.interface';

class LendingRoute implements Routes {
  public path = '/lending';
  public router = Router();
  public lendingController = new LendingController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get lending market data and metrics
    this.router.get(`${this.path}/metrics`, this.lendingController.getLendingMetrics);
    
    // Get lending history with pagination and filters
    this.router.get(`${this.path}/history`, this.lendingController.getLendingHistory);
    
    // Test Kamino API connectivity
    this.router.get(`${this.path}/test-connection`, this.lendingController.testKaminoConnection);
    
    // Test lending decision process
    this.router.post(`${this.path}/test-decision`, this.lendingController.testLendingDecision);
  }
}

export default LendingRoute;