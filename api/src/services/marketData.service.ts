import BaseService from '@services/baseService.service';
import config from '@config';
import axios from 'axios';
import { logger } from '@utils/logger';
import { HttpBadRequest } from '@exceptions/http/HttpBadRequest';

export interface MarketDataParams {
  from: number;
  to: number;
  resolution: '1' | '2' | '5' | '15' | '30' | '60' | '120' | '240' | '360' | '720' | 'D' | '1D' | 'W' | '1W' | 'M' | '1M';
  symbol?: string; // Make optional since we'll fetch all pairs by default
}

// Bird Eye API Response Interface
export interface BirdEyeHistoryItem {
  unixTime: number;
  value: number;
}

export interface BirdEyeHistoryResponse {
  success: boolean;
  data: {
    isScaledUiToken: boolean;
    items: BirdEyeHistoryItem[];
  };
}

// Updated Market Data Response to match Bird Eye format
export interface MarketDataResponse {
  success: boolean;
  data: {
    isScaledUiToken: boolean;
    items: BirdEyeHistoryItem[];
  };
  // Legacy fields for backward compatibility
  t?: number[]; // timestamps
  c?: number[]; // close prices
  o?: number[]; // open prices
  h?: number[]; // high prices
  l?: number[]; // low prices
  v?: number[]; // volumes
  status?: string;
  errmsg?: string;
}

// Updated trading pairs for Solana
export const TRADING_PAIRS = ['SOLUSD', 'BTCUSD'] as const;
export type TradingPair = typeof TRADING_PAIRS[number];

// Solana trading pair addresses
const SOLANA_PAIRS = {
  SOLUSD: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2', // SOL/USDC pair
  BTCUSD: 'A6S3kDFfAjEPV8oJErihw3D2UPwkBZDPFfnxGB9scxVe', // WBTC/USDC pair (reverted to original)
} as const;

class MarketDataService extends BaseService {
  private readonly baseUrl = 'https://public-api.birdeye.so';
  private readonly apiKey = config.ai.birdeye?.apiKey; // Add to config later

  public async getAllPairsData(params: Omit<MarketDataParams, 'symbol'>): Promise<Record<TradingPair, MarketDataResponse>> {
    const results: Partial<Record<TradingPair, MarketDataResponse>> = {};

    await Promise.all(
      TRADING_PAIRS.map(async symbol => {
        try {
          const data = await this.getMarketData({ ...params, symbol });

          if (!data.success) {
            throw new HttpBadRequest('Bird Eye API returned error status');
          }

          results[symbol] = data;
        } catch (error) {
          logger.error({
            message: `Error fetching market data for ${symbol}: ${error.message}`,
            labels: { origin: 'MarketDataService' },
          });
          results[symbol] = this.getEmptyResponse();
        }
      }),
    );

    const validPairs = Object.entries(results).filter(([_, data]) => data.success && data.data?.items?.length > 0);

    if (validPairs.length === 0) {
      throw new HttpBadRequest('Failed to fetch valid data for any trading pair');
    }

    return results as Record<TradingPair, MarketDataResponse>;
  }

  public async getMarketData(params: MarketDataParams): Promise<MarketDataResponse> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!params.symbol) {
          throw new HttpBadRequest('Symbol is required for Bird Eye API');
        }

        const tokenAddress = this.getTokenAddress(params.symbol);
        const timeFrom = Math.floor(params.from / 1000).toString(); // Convert to seconds and string
        const timeTo = Math.floor(params.to / 1000).toString(); // Convert to seconds and string

        const requestParams = {
          address: tokenAddress,
          address_type: 'pair',
          type: this.convertResolutionToBirdEye(params.resolution),
          time_from: timeFrom,
          time_to: timeTo,
          ui_amount_mode: 'raw',
        };

        const requestHeaders = {
          'accept': 'application/json',
          'x-chain': 'solana',
          ...(this.apiKey && { 'X-API-KEY': this.apiKey }),
        };

        const response = await axios.get(`${this.baseUrl}/defi/history_price`, {
          params: requestParams,
          headers: requestHeaders,
          timeout: 10000, // 10 second timeout
        });

        if (!response.data || !response.data.success) {
          throw new HttpBadRequest('Invalid response structure from Bird Eye API');
        }

        return this.formatResponse(response.data);
              } catch (error) {
          lastError = error;
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            logger.warn({
              message: `Bird Eye API attempt ${attempt} failed, retrying in ${delay}ms`,
              error: error.message,
              symbol: params.symbol,
              labels: { origin: 'MarketDataService' },
            });
            
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            logger.error({
              message: `Bird Eye API failed after ${maxRetries} attempts`,
              error: error.message,
              symbol: params.symbol,
              labels: { origin: 'MarketDataService' },
            });
          }
        }
    }

    throw lastError;
  }

  private getTokenAddress(symbol: string): string {
    switch (symbol) {
      case 'SOLUSD':
        return SOLANA_PAIRS.SOLUSD;
      case 'BTCUSD':
        return SOLANA_PAIRS.BTCUSD;
      default:
        throw new HttpBadRequest(`Unsupported symbol: ${symbol}`);
    }
  }

  private convertResolutionToBirdEye(resolution: string): string {
    // Convert resolution to Bird Eye format (matching their documentation)
    const resolutionMap: Record<string, string> = {
      '1': '1M',
      '5': '5M',
      '15': '15M',
      '30': '30M',
      '60': '1H',
      '120': '2H',
      '240': '4H', // 4-hour intervals as requested
      '360': '6H',
      '720': '12H',
      'D': '1D',
      '1D': '1D',
      'W': '1W',
      '1W': '1W',
      'M': '1M',
      '1M': '1M',
    };

    return resolutionMap[resolution] || '4H';
  }

  private formatResponse(data: BirdEyeHistoryResponse): MarketDataResponse {
    // Extract timestamps and values for backward compatibility
    const timestamps = data.data.items.map(item => item.unixTime * 1000); // Convert to milliseconds
    const values = data.data.items.map(item => item.value);

    // Ensure we have valid data
    if (timestamps.length === 0 || values.length === 0) {
      return this.getEmptyResponse();
    }

    // Validate timestamps are not in the future
    const now = Date.now();
    const validTimestamps = timestamps.filter(ts => ts <= now);
    const validValues = values.slice(0, validTimestamps.length);

    if (validTimestamps.length === 0) {
      logger.warn({
        message: 'All timestamps are in the future, using current time',
        originalTimestamps: timestamps.slice(0, 5),
        labels: { origin: 'MarketDataService' },
      });
      // Use current time if all timestamps are in the future
      const currentTime = Date.now();
      const timeStep = 1 * 60 * 60 * 1000; // 4 hours in milliseconds
      const generatedTimestamps = [];
      const generatedValues = [];
      
      for (let i = 0; i < values.length; i++) {
        generatedTimestamps.push(currentTime - (values.length - i - 1) * timeStep);
        generatedValues.push(values[i]);
      }

      return {
        ...data,
        t: generatedTimestamps,
        c: generatedValues,
        o: generatedValues,
        h: generatedValues,
        l: generatedValues,
        v: new Array(generatedValues.length).fill(1),
      };
    }

    return {
      ...data,
      // Legacy fields for backward compatibility
      t: validTimestamps,
      c: validValues, // Use values as close prices
      o: validValues, // Use same values for open (since Bird Eye doesn't provide OHLCV)
      h: validValues, // Use same values for high
      l: validValues, // Use same values for low
      v: new Array(validValues.length).fill(1), // Use 1 instead of 0 to avoid division by zero
    };
  }

  private getEmptyResponse(): MarketDataResponse {
    return {
      success: false,
      data: {
        isScaledUiToken: false,
        items: [],
      },
      // Legacy fields
      t: [],
      c: [],
      o: [],
      h: [],
      l: [],
      v: [],
    };
  }

  // Helper method to calculate 10-day lookback timestamps
  public getDefaultTimeRange(): { from: number; to: number } {
    const now = Date.now();
    const tenDaysAgo = now - (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    
    return {
      from: tenDaysAgo,
      to: now,
    };
  }


}

export default MarketDataService;
