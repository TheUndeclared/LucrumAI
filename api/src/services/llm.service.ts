import { OpenAI } from 'openai';
import config from '@config';
import { logger } from '@utils/logger';
import BaseService from './baseService.service';
import MarketDataService, { MarketDataParams, MarketDataResponse, TradingPair, TRADING_PAIRS } from './marketData.service';
import KaminoService, { LendingMarketData, LendingToken } from './kaminoService.service';
import { DecisionHistory } from '../database/mongodb/models/decisionHistory.model';
import { LendingHistory } from '../database/mongodb/models/lendingHistory.model';
import { HttpError } from '@exceptions/http/HttpError';
import { HttpBadRequest } from '@exceptions/http/HttpBadRequest';

import XService from '@services/x.service';

class LLMService extends BaseService {
  private openai: OpenAI;
  // private deepseek: OpenAI;  // Commented out - keeping for future use
  private grok: OpenAI | null;
  private marketDataService: MarketDataService | null = null;
  private kaminoService: KaminoService | null = null;
  private solanaTrading: any = null; // Will be injected via dependency injection

  private xService: XService | null = null;

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey,
    });
    
    // DeepSeek initialization - commented out
    // this.deepseek = new OpenAI({
    //   apiKey: config.ai.deepseek.apiKey,
    //   baseURL: config.ai.deepseek.baseUrl,
    // });
    
    // GROK initialization with validation
    if (!config.ai.grok.apiKey || config.ai.grok.apiKey === 'your_grok_api_key_here') {
      logger.warn({
        message: 'GROK API key not configured. GROK model will be disabled.',
        labels: { origin: 'LLMService' },
      });
      this.grok = null;
    } else {
      this.grok = new OpenAI({
        apiKey: config.ai.grok.apiKey,
        baseURL: config.ai.grok.baseUrl,
      });
      logger.info({
        message: 'GROK client initialized successfully',
        labels: { origin: 'LLMService' },
      });
    }
  }

  /**
   * Set the Solana Trading service (dependency injection)
   */
  public setSolanaTrading(solanaTrading: any): void {
    this.solanaTrading = solanaTrading;
    logger.info({
      message: 'Solana Trading service injected into LLM service',
      availablePairs: solanaTrading?.getAvailablePairs?.(),
      labels: { origin: 'LLMService' }
    });
  }

  /**
   * Set the Kamino service (dependency injection)
   */
  public setKaminoService(kaminoService: KaminoService): void {
    this.kaminoService = kaminoService;
    logger.info({
      message: 'Kamino service injected into LLM service',
      labels: { origin: 'LLMService' }
    });
  }

  private async getCollectiveDecision(indicators: any, lendingData?: LendingMarketData | null): Promise<any> {
    // If GROK is not available, use only OpenAI
    if (!this.grok) {
      logger.info({
        message: 'Using OpenAI only (GROK disabled)',
        labels: { origin: 'LLMService' },
      });
      
      try {
        const gptDecision = await this.getModelDecision(this.openai, config.ai.openai.model, indicators);
        return {
          ...gptDecision,
          reasoning: {
            ...gptDecision.reasoning,
            marketCondition: `OpenAI Only: ${gptDecision.reasoning.marketCondition}`,
          },
          confidence: 'MEDIUM', // Lower confidence since only one model
        };
      } catch (error) {
        logger.error({
          message: 'OpenAI model failed and GROK is disabled',
          labels: { origin: 'LLMService' },
        });
        throw new Error('No AI models available for decision making');
      }
    }

    // Both models available - use dual-model approach
    const [gptResult, grokResult]: any[] = await Promise.allSettled([
      this.getModelDecision(this.openai, config.ai.openai.model, indicators),
      this.getModelDecision(this.grok, config.ai.grok.model, indicators),
    ]);

    // Handle different scenarios
    if (gptResult.status === 'rejected' && grokResult.status === 'rejected') {
      logger.error({
        message: 'Both AI models failed to respond',
        labels: { origin: 'LLMService' },
      });
      throw new Error('No AI models available for decision making');
    }

    // If one model fails, use the other one with medium confidence
    if (gptResult.status === 'rejected') {
      const decision = grokResult.value;
      return {
        ...decision,
        reasoning: {
          ...decision.reasoning,
          marketCondition: `GROK Only: ${decision.reasoning.marketCondition}`,
        },
        confidence: 'MEDIUM',
      };
    }

    if (grokResult.status === 'rejected') {
      const decision = gptResult.value;
      return {
        ...decision,
        reasoning: {
          ...decision.reasoning,
          marketCondition: `GPT Only: ${decision.reasoning.marketCondition}`,
        },
        confidence: 'MEDIUM',
      };
    }

    // Both models responded successfully
    const gptDecision = gptResult.value;
    const grokDecision = grokResult.value;

    // If both agree on action and pair, merge their decisions
    if (gptDecision.action === grokDecision.action && gptDecision.pair === grokDecision.pair) {
      
      return {
        action: gptDecision.action,
        pair: gptDecision.pair,
        shouldExecute: gptDecision.action === 'BUY' || gptDecision.action === 'SELL',
        reasoning: {
          marketCondition: `All Models Agree: ${gptDecision.reasoning.marketCondition}`,
          technicalAnalysis: `Consensus: ${gptDecision.reasoning.technicalAnalysis}`,
          riskAssessment: this.combineRiskAssessments(gptDecision?.reasoning?.riskAssessment, grokDecision?.reasoning?.riskAssessment),
          pairSelection: gptDecision.reasoning.pairSelection,
          comparativeAnalysis: {
            ...gptDecision.reasoning.comparativeAnalysis,
            modelAgreement: 'Both GPT and GROK agree on pair selection and action',
          },
        },
        confidence: 'HIGH',
      };
    }

    // If they disagree, take the conservative approach
    return {
      action: 'WAIT',
      pair: null,
      shouldExecute: false,
      reasoning: {
        marketCondition: 'Mixed signals between GPT and GROK',
        technicalAnalysis: `GPT suggests ${gptDecision.action} ${gptDecision.pair}, GROK suggests ${grokDecision.action} ${grokDecision.pair}`,
        riskAssessment: 'HIGH due to model disagreement',
        pairSelection: 'Models disagree on pair selection',
        comparativeAnalysis: {
          volatilityComparison: 'Analysis suspended due to model disagreement',
          trendAlignment: 'Models show different interpretations',
          relativeStrength: 'No consensus on strongest pair',
          modelAgreement: 'GPT and GROK disagree on best trading opportunity',
        },
      },
      confidence: 'LOW',
    };
  }

  private async getModelDecision(client: OpenAI, model: string, data: any) {
    try {
      logger.info({
        message: `Making API call to ${model}`,
        model,
        labels: { origin: 'LLMService' },
      });

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional crypto trading advisor analyzing SOL/USD and BTC/USD pairs on Solana. You must assess market conditions using technical indicators, price action, and sentiment analysis. Respond with ONLY raw JSON, no markdown or code blocks.`,
          },
          {
            role: 'user',
            content: `Analyze these trading pairs and recommend the best trading opportunity if any:
                     Data: ${JSON.stringify(data)}

                     Consider the following factors in your analysis:
                     
                     1. Technical Indicators:
                     - Moving Averages (50/200 EMA)
                     - Relative Strength Index (RSI)
                     - MACD
                     - Bollinger Bands
                     - Volume Trends
                     
                     2. Price Action & Trend Analysis:
                     - Support/Resistance Levels
                     - Breakouts/Reversals
                     - Trend Strength
                     - Price Patterns
                     
                     3. Cross-Pair Analysis:
                     - Correlations
                     - Relative Strength
                     - Market Regime
                     - Leading/Lagging Pairs

                     4. Risk Assessment:
                     - Volatility Levels
                     - Stop-Loss Placement
                     - Position Sizing
                     - Market Depth

                     Return ONLY this JSON structure (no markdown):
                     {
                       "action": "BUY" | "SELL" | "WAIT",
                       "pair": "SOL_USD" | "BTC_USD",
                       "reasoning": {
                         "marketCondition": "brief state of the chosen market",
                         "technicalAnalysis": "key technical factors",
                         "riskAssessment": "risk level and considerations",
                         "pairSelection": "why this pair was chosen over others",
                         "comparativeAnalysis": {
                           "volatilityComparison": "volatility across pairs",
                           "trendAlignment": "how trends align/diverge",
                           "relativeStrength": "strongest setup and why",
                           "correlationImpact": "how correlations affect the decision"
                         }
                       }
                     }`,
          },
        ],
        model: model,
        temperature: 0.2,
        max_tokens: 500,
      });

      logger.info({
        message: `${model} API response received`,
        model,
        choices: completion.choices?.length || 0,
        usage: completion.usage,
        labels: { origin: 'LLMService' },
      });

      const content = completion.choices[0]?.message?.content;
      
      logger.info({
        message: `Raw ${model} response`,
        model,
        contentLength: content?.length || 0,
        content: content?.substring(0, 500) + (content?.length > 500 ? '...' : ''), // Log first 500 chars
        fullResponse: model.includes('grok') ? completion : undefined, // Full response only for GROK debugging
        labels: { origin: 'LLMService' },
      });

      if (!content || content.trim() === '') {
        logger.error({
          message: `${model} returned empty response`,
          model,
          fullCompletion: completion,
          labels: { origin: 'LLMService' },
        });
        throw new HttpBadRequest(`${model} returned empty response`);
      }

      const cleanContent = content
        .trim()
        .replace(/^```json\n/, '')
        .replace(/\n```$/, '');

      return JSON.parse(cleanContent);
    } catch (error) {
      logger.error({
        message: 'Failed to get model decision',
        model,
        error: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        labels: { origin: 'LLMService' },
      });
      
      // Re-throw the original error if it's already a known error type
      if (error instanceof HttpBadRequest) {
        throw error;
      }
      
      // Handle JSON parsing errors specifically
      if (error.message.includes('Unexpected end of JSON input') || error.message.includes('JSON')) {
        throw new HttpBadRequest(`Failed to parse ${model} response - invalid JSON format`);
      }
      
      // Handle API errors
      if (error.code === 'invalid_api_key' || error.status === 401) {
        throw new HttpBadRequest(`${model} API key is invalid or missing`);
      }
      
      throw new HttpBadRequest(`Failed to get response from ${model}: ${error.message}`);
    }
  }

  private combineRiskAssessments(gptRisk: string, grokRisk: string): string {
    const isHighRisk = (risk: string) => risk.toLowerCase().includes('high') || risk.toLowerCase().includes('volatile');

    if (isHighRisk(gptRisk) || isHighRisk(grokRisk)) {
      return 'HIGH';
    }
    return 'LOW';
  }

  public async makeDecision(params?: Partial<MarketDataParams>) {
    try {
      // Use Bird Eye's 10-day lookback by default
      const timeRanges = this.marketDataService?.getDefaultTimeRange() || getTimeRanges();
      const marketDataParams = {
        from: params?.from || timeRanges.from,
        to: params?.to || timeRanges.to,
        resolution: params?.resolution || '240',
      };

      // Get market data for all pairs
      const tradingMarketData = await this.marketDataService.getAllPairsData(marketDataParams);

      // Calculate indicators for all pairs
      const tradingIndicators = this.calculateIndicatorsForAllPairs(tradingMarketData);

      // Get lending data from Kamino
      let lendingData = null;
      let lendingDecision = null;
      if (this.kaminoService) {
        try {
          const lendingResponse = await this.kaminoService.getLendingMetrics();
          if (lendingResponse.success && lendingResponse.data) {
            lendingData = lendingResponse.data;
            // Get lending decision from AI
            lendingDecision = await this.getLendingDecision(lendingData, tradingIndicators);
          }
        } catch (lendingError) {
          logger.warn({
            message: `Failed to get lending data: ${lendingError.message}`,
            labels: { origin: 'LLMService' },
          });
        }
      }

      // Get trading decision across all pairs (now includes lending context)
      const tradingDecision = await this.getCollectiveDecision(tradingIndicators, lendingData);

      // Execute both trading and lending decisions
      const execution = await Promise.allSettled([
        tradingDecision.shouldExecute && tradingDecision.pair ? this.handleTradeSignal(tradingDecision) : Promise.resolve(),
        lendingDecision?.shouldExecute ? this.handleLendingSignal(lendingDecision) : Promise.resolve(),
      ]);

      const finalDecision = {
        decision: {
          trading: tradingDecision,
          lending: lendingDecision,
        },
      };

      // X posting temporarily disabled
      // try {
      //   const msg = await this.generateTradingSummary(finalDecision);
      //   console.log('X msg: ', msg);
      //   await this.xService.postToX(msg);
      // } catch (e) {
      //   logger.error('X error', e);
      // }

      // Save combined decision history
      const decisionHistory = await DecisionHistory.create(finalDecision);

      return {
        timestamp: new Date().toISOString(),
        indicators: {
          trading: tradingIndicators,
          lending: lendingData,
        },
        recommendations: {
          trading: {
            ...tradingDecision,
            id: decisionHistory.id,
          },
          lending: lendingDecision ? {
            ...lendingDecision,
            id: decisionHistory.id,
          } : null,
        },
      };
    } catch (error) {
      logger.error({
        message: `Error in LLM service: ${error.message}`,
        labels: { origin: 'LLMService' },
      });
      throw error;
    }
  }

  private calculateIndicators(marketData: any) {
    try {
      // Basic validation
      if (!marketData || !marketData.t || marketData.t.length === 0) {
        logger.error({
          message: 'Missing timestamp data',
          data: marketData,
          labels: { origin: 'LLMService.calculateIndicators' },
        });
        return this.getDefaultIndicators();
      }

      // Use available data or defaults
      const prices = marketData.c && marketData.c.length > 0 ? marketData.c : marketData.o && marketData.o.length > 0 ? marketData.o : [];
      const volumes = marketData.v || [];
      const timestamps = marketData.t;

      if (prices.length === 0) {
        throw new Error('No price data available');
      }

      // Latest values
      const latestPrice = prices[prices.length - 1];
      const latestTimestamp = timestamps[timestamps.length - 1];

      // Price changes
      const dailyChange = this.calculatePriceChange(prices, 6); // 6 4-hour periods = 1 day
      const weeklyChange = this.calculatePriceChange(prices, 42); // 42 4-hour periods = 1 week
      const monthlyChange = this.calculatePriceChange(prices, 180); // 180 4-hour periods = 30 days

      // Moving Averages (in 4-hour periods)
      const sma20 = this.calculateSMA(prices, 20); // 3.3 days
      const sma50 = this.calculateSMA(prices, 50); // 8.3 days
      const sma200 = this.calculateSMA(prices, 200); // 33.3 days

      // Volatility for different periods
      const dailyVolatility = this.calculateVolatility(this.calculateReturns(prices.slice(-6)));
      const weeklyVolatility = this.calculateVolatility(this.calculateReturns(prices.slice(-42)));

      // Volume analysis (Bird Eye doesn't provide volume data)
      const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 1;
      const latestVolume = volumes.length > 0 ? volumes[volumes.length - 1] : 1;
      const volumeTrend = avgVolume > 0 ? (latestVolume / avgVolume - 1) * 100 : 0;

      // Support and Resistance
      const support = Math.min(...prices.slice(-30));
      const resistance = Math.max(...prices.slice(-30));

      return {
        timestamp: new Date(latestTimestamp).toISOString(),
        price: {
          current: latestPrice,
          changes: {
            daily: dailyChange.toFixed(2),
            weekly: weeklyChange.toFixed(2),
            monthly: monthlyChange.toFixed(2),
          },
        },
        technicals: {
          sma: {
            sma20: sma20.toFixed(2),
            sma50: sma50.toFixed(2),
            sma200: sma200.toFixed(2),
            isAboveSMA20: latestPrice > sma20,
            isAboveSMA50: latestPrice > sma50,
            isAboveSMA200: latestPrice > sma200,
          },
          volatility: {
            daily: (dailyVolatility * 100).toFixed(2),
            weekly: (weeklyVolatility * 100).toFixed(2),
          },
          volume: {
            current: latestVolume,
            trend: volumeTrend.toFixed(2),
            isAboveAverage: latestVolume > avgVolume,
          },
          levels: {
            support: support.toFixed(2),
            resistance: resistance.toFixed(2),
            distanceToSupport: (((latestPrice - support) / latestPrice) * 100).toFixed(2),
            distanceToResistance: (((resistance - latestPrice) / latestPrice) * 100).toFixed(2),
          },
          rsi: this.calculateRSI(prices, 14).toFixed(2),
          momentum: this.calculateMomentum(prices, 14).toFixed(2),
        },
      };
    } catch (error) {
      logger.error({
        message: `Error calculating indicators: ${error.message}`,
        labels: { origin: 'LLMService.calculateIndicators' },
      });
      return this.getDefaultIndicators();
    }
  }

  private calculatePriceChange(prices: number[], periods: number): number {
    if (prices.length < periods) return 0;
    const recent = prices[prices.length - 1];
    const old = prices[prices.length - periods];
    return ((recent - old) / old) * 100;
  }

  private getDefaultIndicators() {
    return {
      timestamp: new Date().toISOString(),
      price: {
        current: 0,
        changes: {
          daily: '0',
          weekly: '0',
          monthly: '0',
        },
      },
      technicals: {
        sma: {
          sma20: '0',
          sma50: '0',
          sma200: '0',
          isAboveSMA20: false,
          isAboveSMA50: false,
          isAboveSMA200: false,
        },
        volatility: {
          daily: '0',
          weekly: '0',
        },
        volume: {
          current: 0,
          trend: '0',
          isAboveAverage: false,
        },
        levels: {
          support: '0',
          resistance: '0',
          distanceToSupport: '0',
          distanceToResistance: '0',
        },
        rsi: '0',
        momentum: '0',
      },
      error: 'Invalid data',
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMomentum(prices: number[], period = 14): number {
    if (prices.length < period) return 0;
    return prices[prices.length - 1] - prices[prices.length - period];
  }

  async handleTradeSignal(decision: any) {
    try {
      if (!decision.shouldExecute || !decision.pair) {
        logger.info({
          message: 'Trade signal received but execution not required',
          shouldExecute: decision.shouldExecute,
          pair: decision.pair,
          action: decision.action,
          labels: { origin: 'LLMService' },
        });
        return null;
      }

      logger.info({
        message: 'Trade signal received - executing trade',
        decision,
        labels: { origin: 'LLMService' },
      });

      // Check if Solana trading service is available
      if (!this.solanaTrading) {
        logger.warn({
          message: 'Solana trading service not available',
          labels: { origin: 'LLMService' },
        });
        return {
          success: false,
          error: 'Solana trading service not available',
        };
      }

      // Map and validate trading pair
      let pair = this.mapDecisionPairToTradingPair(decision.pair);
      
      if (!pair) {
        logger.warn({
          message: 'No suitable trading pair found for decision',
          originalPair: decision.pair,
          labels: { origin: 'LLMService' },
        });
        return {
          success: false,
          error: `No trading pair available for ${decision.pair}`,
        };
      }

      // Determine risk level based on confidence
      const riskLevel = decision.confidence === 'HIGH' ? 'LOW' : 'HIGH'; // High confidence = lower risk

      // Calculate trade amount based on risk level and specific pair
      const tradeAmount = await this.solanaTrading.calculateTradeAmount(decision.action, pair, riskLevel);

      if (tradeAmount <= 0) {
        logger.warn({
          message: 'Calculated trade amount is too small or invalid',
          tradeAmount,
          action: decision.action,
          riskLevel,
          labels: { origin: 'LLMService' },
        });
        return {
          success: false,
          error: 'Trade amount too small or insufficient balance',
        };
      }

      logger.info({
        message: 'Executing Solana trade',
        action: decision.action,
        pair,
        amount: tradeAmount,
        riskLevel,
        confidence: decision.confidence,
        labels: { origin: 'LLMService' },
      });

      // Execute the trade
      const tradeResult = await this.solanaTrading.executeTrade(
        decision.action,
        pair,
        tradeAmount,
        decision.id // Pass decision ID for tracking
      );

      if (tradeResult.success) {
        logger.info({
          message: 'Trade executed successfully',
          tradeResult,
          labels: { origin: 'LLMService' },
        });

        return {
          success: true,
          message: 'Trade executed successfully',
          tradeResult,
          decision,
        };
      } else {
        logger.error({
          message: 'Trade execution failed',
          error: tradeResult.error,
          labels: { origin: 'LLMService' },
        });

        return {
          success: false,
          error: tradeResult.error,
          decision,
        };
      }
    } catch (error) {
      logger.error({
        message: 'Error handling trade signal',
        error: error.message,
        decision,
        labels: { origin: 'LLMService' },
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Map LLM decision pairs to available trading pairs
   */
  private mapDecisionPairToTradingPair(decisionPair: string): string | null {
    if (!this.solanaTrading) {
      return null;
    }

    const availablePairs = this.solanaTrading.getAvailablePairs();
    const normalizedDecisionPair = decisionPair.toUpperCase().replace(/[/_-]/g, '_');

    logger.info({
      message: 'Mapping decision pair to trading pair',
      originalPair: decisionPair,
      normalizedPair: normalizedDecisionPair,
      availablePairs,
      labels: { origin: 'LLMService' }
    });

    // Direct match
    if (availablePairs.includes(normalizedDecisionPair)) {
      return normalizedDecisionPair;
    }

    // Try common mappings
    const pairMappings: Record<string, string[]> = {
      'SOL_USDT': ['SOL_USD', 'SOLUSD', 'SOL', 'SOLANA'],
      'SOL_USDC': ['SOL_USDC', 'SOL_USD', 'SOLUSD'],
      'BTC_USDT': ['BTC_USD', 'BTCUSD', 'BTC', 'BITCOIN'],
    };

    for (const [tradingPair, aliases] of Object.entries(pairMappings)) {
      if (availablePairs.includes(tradingPair)) {
        for (const alias of aliases) {
          if (normalizedDecisionPair === alias || normalizedDecisionPair.includes(alias)) {
            logger.info({
              message: 'Mapped decision pair to trading pair',
              originalPair: decisionPair,
              mappedPair: tradingPair,
              labels: { origin: 'LLMService' }
            });
            return tradingPair;
          }
        }
      }
    }

    // Default fallback to first available pair if it contains USD
    const usdPair = availablePairs.find(pair => pair.includes('USD'));
    if (usdPair) {
      logger.info({
        message: 'Using fallback USD pair for decision',
        originalPair: decisionPair,
        fallbackPair: usdPair,
        labels: { origin: 'LLMService' }
      });
      return usdPair;
    }

    return null;
  }

  private assessRiskLevel(riskAssessment: string): 'HIGH' | 'LOW' {
    if (!riskAssessment) return 'LOW';

    // Check for high risk indicators
    const highRiskTerms = ['high', 'volatile', 'unstable', 'risky', 'dangerous'];

    for (const term of highRiskTerms) {
      if (riskAssessment.includes(term)) {
        return 'HIGH';
      }
    }

    return 'LOW';
  }

  /**
   * Retrieves decisions history
   *
   * @param {any} options - Search and pagination options
   * @returns {Promise<{count: number, rows: any[]}>} - DecisionHistory.
   * @throws {HttpError} - Error if something goes wrong
   */
  public getDecisionHistory = async (
    options: any,
  ): Promise<{
    count: number;
    rows: any[];
  }> => {
    try {
      const { limit = 50, offset = 0, sort = { createdAt: -1 }, ...query } = options;
      
      const [count, rows] = await Promise.all([
        DecisionHistory.countDocuments(query),
        DecisionHistory.find(query)
          .sort(sort)
          .skip(offset)
          .limit(limit)
          .lean() // Convert to plain objects
      ]);
      
      return { count, rows };
    } catch (error) {
      throw new HttpError({
        message: 'Can not retrieve decision history',
        errors: error,
      });
    }
  };

  private calculateIndicatorsForAllPairs(marketData: Record<TradingPair, MarketDataResponse>) {
    const indicators = {} as Record<TradingPair, any>;

    for (const [pair, data] of Object.entries(marketData)) {
      indicators[pair] = this.calculateIndicators(data);
    }

    // Add cross-pair analysis
    const crossPairAnalysis = this.calculateCrossPairMetrics(marketData);

    return {
      pairs: indicators,
      crossPairAnalysis,
    };
  }

  private calculateCrossPairMetrics(marketData: Record<TradingPair, MarketDataResponse>) {
    try {
      const correlations: Record<string, number> = {};
      const relativeStrength: Record<string, number> = {};
      const volatilityRank: Record<string, number> = {};

      // Calculate correlations between pairs
      for (let i = 0; i < TRADING_PAIRS.length; i++) {
        for (let j = i + 1; j < TRADING_PAIRS.length; j++) {
          const pair1 = TRADING_PAIRS[i];
          const pair2 = TRADING_PAIRS[j];

          const returns1 = this.calculateReturns(marketData[pair1].c || []);
          const returns2 = this.calculateReturns(marketData[pair2].c || []);

          correlations[`${pair1}_${pair2}`] = this.calculateCorrelation(returns1, returns2);
        }
      }

      // Calculate relative strength (using last 24h performance)
      for (const pair of TRADING_PAIRS) {
        const prices = marketData[pair].c || [];
        const dailyChange = this.calculatePriceChange(prices, 6); // 6 4-hour periods = 1 day
        relativeStrength[pair] = dailyChange;
      }

      // Rank pairs by volatility
      const volatilities = TRADING_PAIRS.map(pair => ({
        pair,
        volatility: this.calculateVolatility(this.calculateReturns(marketData[pair].c || [])),
      }));

      volatilities.sort((a, b) => b.volatility - a.volatility);
      volatilities.forEach((v, i) => {
        volatilityRank[v.pair] = i + 1;
      });

      return {
        correlations,
        relativeStrength,
        volatilityRank,
        strongestTrend: this.findStrongestTrend(marketData),
        marketRegime: this.determineMarketRegime(marketData),
      };
    } catch (error) {
      logger.error({
        message: 'Error calculating cross-pair metrics',
        error: error.message,
        labels: { origin: 'LLMService' },
      });
      return {
        correlations: {},
        relativeStrength: {},
        volatilityRank: {},
        strongestTrend: null,
        marketRegime: 'UNKNOWN',
      };
    }
  }

  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length === 0 || returns2.length === 0) return 0;

    const minLength = Math.min(returns1.length, returns2.length);
    const r1 = returns1.slice(-minLength);
    const r2 = returns2.slice(-minLength);

    const mean1 = r1.reduce((a, b) => a + b, 0) / minLength;
    const mean2 = r2.reduce((a, b) => a + b, 0) / minLength;

    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;

    for (let i = 0; i < minLength; i++) {
      const diff1 = r1[i] - mean1;
      const diff2 = r2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }

    if (denom1 === 0 || denom2 === 0) return 0;
    return numerator / Math.sqrt(denom1 * denom2);
  }

  private findStrongestTrend(marketData: Record<TradingPair, MarketDataResponse>): string | null {
    let strongestPair = null;
    let maxStrength = -Infinity;

    for (const pair of TRADING_PAIRS) {
      const prices = marketData[pair].c || [];
      if (prices.length === 0) continue;

      // Calculate trend strength using linear regression
      const n = prices.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = prices;

      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const strength = Math.abs(slope);

      if (strength > maxStrength) {
        maxStrength = strength;
        strongestPair = pair;
      }
    }

    return strongestPair;
  }

  private determineMarketRegime(marketData: Record<TradingPair, MarketDataResponse>): 'RISK_ON' | 'RISK_OFF' | 'MIXED' | 'UNKNOWN' {
    try {
      let bullishCount = 0;
      let bearishCount = 0;
      let totalPairs = 0;

      for (const pair of TRADING_PAIRS) {
        const prices = marketData[pair].c || [];
        if (prices.length < 2) continue;

        totalPairs++;
        const recentChange = this.calculatePriceChange(prices, 6); // Daily change

        if (recentChange > 1) bullishCount++;
        else if (recentChange < -1) bearishCount++;
      }

      if (totalPairs === 0) return 'UNKNOWN';

      const bullishRatio = bullishCount / totalPairs;
      const bearishRatio = bearishCount / totalPairs;

      if (bullishRatio > 0.6) return 'RISK_ON';
      if (bearishRatio > 0.6) return 'RISK_OFF';
      return 'MIXED';
    } catch (error) {
      logger.error({
        message: 'Error determining market regime',
        error: error.message,
        labels: { origin: 'LLMService' },
      });
      return 'UNKNOWN';
    }
  }

  public generateTradingSummary = async (tradingData: object): Promise<string> => {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a professional crypto trading analyst. Generate a concise, engaging summary of trading decisions and market analysis for social media.',
          },
          {
            role: 'user',
            content: `Generate a trading summary from this data: ${JSON.stringify(tradingData)}`,
          },
        ],
        model: config.ai.openai.model,
        temperature: 0.7,
        max_tokens: 280,
      });

      return completion.choices[0].message.content || 'No summary generated';
    } catch (error) {
      logger.error({
        message: 'Error generating trading summary',
        error: error.message,
        labels: { origin: 'LLMService' },
      });
      return 'Trading analysis completed. Check dashboard for details.';
    }
  };

  /**
   * Get lending decision from AI based on Kamino data
   */
  private async getLendingDecision(lendingData: LendingMarketData, tradingIndicators?: any): Promise<any> {
    try {
      const lendingPrompt = this.buildLendingPrompt(lendingData, tradingIndicators);
      
      // Use both models if available, or just OpenAI
      const decisions = await Promise.allSettled([
        this.getModelLendingDecision(this.openai, config.ai.openai.model, lendingPrompt),
        this.grok ? this.getModelLendingDecision(this.grok, config.ai.grok.model, lendingPrompt) : Promise.reject('GROK not available')
      ]);

      const gptResult = decisions[0];
      const grokResult = decisions[1];

      // If both succeed, compare decisions
      if (gptResult.status === 'fulfilled' && grokResult.status === 'fulfilled') {
        const gptDecision = gptResult.value;
        const grokDecision = grokResult.value;

        // If both agree, high confidence
        if (gptDecision.action === grokDecision.action && gptDecision.token === grokDecision.token) {
          return {
            ...gptDecision,
            confidence: 'HIGH',
            reasoning: `Both AI models agree: ${gptDecision.action} ${gptDecision.token}`
          };
        }

        // If they disagree, conservative approach
        return {
          action: 'WAIT',
          token: null,
          amount: 0,
          shouldExecute: false,
          confidence: 'LOW',
          reasoning: 'AI models disagree on lending strategy - waiting for clearer signals'
        };
      }

      // Single model fallback
      const successResult = gptResult.status === 'fulfilled' ? gptResult : grokResult;
      if (successResult.status === 'fulfilled') {
        return {
          ...successResult.value,
          confidence: 'MEDIUM',
          reasoning: `Single AI model decision: ${successResult.value.action}`
        };
      }

      // No models available
      return {
        action: 'WAIT',
        token: null,
        amount: 0,
        shouldExecute: false,
        confidence: 'NONE',
        reasoning: 'No AI models available for lending analysis'
      };

    } catch (error) {
      logger.error({
        message: `Error getting lending decision: ${error.message}`,
        labels: { origin: 'LLMService' },
      });
      return {
        action: 'WAIT',
        token: null,
        amount: 0,
        shouldExecute: false,
        confidence: 'ERROR',
        reasoning: `Error in lending analysis: ${error.message}`
      };
    }
  }

  /**
   * Get lending decision from a specific AI model
   */
  private async getModelLendingDecision(client: OpenAI, model: string, prompt: string): Promise<any> {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a DeFi lending expert. Analyze lending opportunities and provide specific recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model,
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    return this.parseLendingResponse(response);
  }

  /**
   * Build lending analysis prompt
   */
  private buildLendingPrompt(lendingData: LendingMarketData, tradingIndicators?: any): string {
    // Convert our lending data to the format expected by the prompt
    const rawReservesData = this.convertToKaminoFormat(lendingData);
    const lendingDataJson = JSON.stringify(rawReservesData, null, 2);

    return `## Task
Analyze the provided Kamino protocol data and recommend the single best yield farming opportunity. Your decision should be based primarily on APY (Annual Percentage Yield) while considering risk factors.

## Data Structure
You will receive JSON data containing the following fields for each reserve:
- \`reserve\`: Protocol address identifier
- \`liquidityToken\`: Token symbol
- \`maxLtv\`: Maximum loan-to-value ratio (risk indicator)
- \`borrowApy\`: Annual percentage yield for borrowing
- \`supplyApy\`: Annual percentage yield for supplying/lending
- \`totalSupply\`: Total amount supplied to the pool
- \`totalBorrow\`: Total amount borrowed from the pool
- \`totalSupplyUsd\`: USD value of total supply
- \`totalBorrowUsd\`: USD value of total borrowings

## Decision Criteria (in order of priority):
1. **Primary**: Highest \`supplyApy\` (this is your yield farming return)
2. **Secondary**: Pool liquidity depth (\`totalSupplyUsd\` - prefer pools with >$1M)
3. **Tertiary**: Utilization ratio (totalBorrowUsd/totalSupplyUsd - prefer 10-80% range)
4. **Risk Factor**: \`maxLtv\` > 0 indicates borrowing is allowed (slightly higher risk)

## Response Format
Provide your response in exactly this structure:

\`\`\`
{
  "recommended_pair": "[liquidityToken]",
  "supply_apy": "[supplyApy as percentage with % symbol]",
  "supply_apy_decimal": [supplyApy as decimal number],
  "reason": "[2-3 sentence justification focusing on APY and risk assessment]",
  "pool_size_usd": [totalSupplyUsd as number],
  "pool_size_formatted": "$[totalSupplyUsd in millions]M",
  "utilization_rate": "[calculated percentage with % symbol]",
  "reserve_address": "[reserve address]"
}
\`\`\`

## Important Notes:
- Focus on \`supplyApy\` as this represents your farming yield
- Ignore pairs with \`supplyApy\` of 0 or near 0
- Consider only pairs where you can actually earn meaningful yield
- If multiple pairs have similar APY, prefer larger, more liquid pools
- Be concise and data-driven in your reasoning

## Data to Analyze:
${lendingDataJson}`;
  }

  /**
   * Convert our internal lending data format to match Kamino API format for LLM prompt
   */
  private convertToKaminoFormat(lendingData: LendingMarketData): any[] {
    return Object.entries(lendingData.metrics).map(([token, metrics]) => {
      // Use raw data if available, otherwise construct from our processed data
      if ((metrics as any).rawReserveData) {
        return (metrics as any).rawReserveData;
      }
      
      // Fallback to constructed data
      return {
        reserve: `reserve_${token}`,
        liquidityToken: token,
        maxLtv: metrics.loanToValueRatio.toString(),
        borrowApy: metrics.borrowInterestApy.toString(),
        supplyApy: metrics.supplyInterestApy.toString(),
        totalSupply: "0",
        totalBorrow: "0",
        totalSupplyUsd: metrics.tvl.toString(),
        totalBorrowUsd: (metrics.tvl * metrics.utilizationRatio).toString()
      };
    });
  }

  /**
   * Parse AI response for lending decision
   */
  private parseLendingResponse(response: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Convert the new format to our internal format
      const action = parsed.supply_apy_decimal > 0 ? 'LEND' : 'WAIT';
      const shouldExecute = parsed.supply_apy_decimal > config.lending.risk.minApyThreshold;
      
      return {
        action,
        token: parsed.recommended_pair || null,
        amountPercentage: shouldExecute ? 0.1 : 0, // Default 10% allocation for good opportunities
        apyExpected: parsed.supply_apy_decimal || 0,
        shouldExecute,
        reasoning: parsed.reason || 'No reasoning provided',
        riskLevel: this.calculateRiskLevel(parsed),
        // Additional data from new format
        poolSizeUsd: parsed.pool_size_usd || 0,
        poolSizeFormatted: parsed.pool_size_formatted || '',
        utilizationRate: parsed.utilization_rate || '',
        reserveAddress: parsed.reserve_address || '',
        supplyApyFormatted: parsed.supply_apy || ''
      };
    } catch (error) {
      logger.error({
        message: 'Failed to parse lending response',
        response,
        error: error.message,
        labels: { origin: 'LLMService' },
      });
      
      return {
        action: 'WAIT',
        token: null,
        amountPercentage: 0,
        apyExpected: 0,
        shouldExecute: false,
        reasoning: 'Failed to parse AI response',
        riskLevel: 'HIGH'
      };
    }
  }

  /**
   * Calculate risk level based on lending opportunity metrics
   */
  private calculateRiskLevel(parsed: any): string {
    const apy = parsed.supply_apy_decimal || 0;
    const poolSize = parsed.pool_size_usd || 0;
    const utilizationRate = parseFloat(parsed.utilization_rate?.replace('%', '')) || 0;

    // High APY (>10%) = potentially higher risk
    if (apy > 0.1) return 'HIGH';
    
    // Small pool (<$1M) = higher risk
    if (poolSize < 1000000) return 'HIGH';
    
    // Very high utilization (>90%) = higher risk
    if (utilizationRate > 90) return 'HIGH';
    
    // Very low utilization (<5%) = may indicate issues
    if (utilizationRate < 5) return 'MEDIUM';
    
    // Good APY range (2-10%) with decent pool size
    if (apy >= 0.02 && apy <= 0.1 && poolSize >= 1000000) return 'LOW';
    
    return 'MEDIUM';
  }

  /**
   * Handle lending signal execution
   */
  private async handleLendingSignal(decision: any): Promise<any> {
    try {
      if (!decision.shouldExecute || decision.action === 'WAIT') {
        logger.info({
          message: 'Lending decision is to wait - no action taken',
          decision: decision.action,
          reasoning: decision.reasoning,
          labels: { origin: 'LLMService' },
        });
        return { success: true, message: 'No lending action required' };
      }

      // TODO: Implement actual lending execution
      // For now, just log the decision and save to database
      logger.info({
        message: 'Lending signal received',
        action: decision.action,
        token: decision.token,
        amountPercentage: decision.amountPercentage,
        apyExpected: decision.apyExpected,
        labels: { origin: 'LLMService' },
      });

      // Save lending decision to database for tracking
      await LendingHistory.create({
        timestamp: new Date(),
        token: decision.token,
        action: decision.action,
        amount: '0', // Will be calculated when execution is implemented
        amountUsd: '0',
        apy: decision.apyExpected,
        platform: 'KAMINO',
        status: 'PENDING',
        message: `AI recommendation: ${decision.reasoning}`,
      });

      return {
        success: true,
        message: 'Lending decision logged for future implementation',
        action: decision.action,
        token: decision.token
      };

    } catch (error) {
      logger.error({
        message: `Error handling lending signal: ${error.message}`,
        labels: { origin: 'LLMService' },
      });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Helper function for time ranges
function getTimeRanges() {
  const now = Date.now();
  const tenDaysAgo = now - (10 * 24 * 60 * 60 * 1000);
  return { from: tenDaysAgo, to: now };
}

export default LLMService;
