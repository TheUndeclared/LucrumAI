import axios from 'axios';
import config from '@config';
import { logger } from '@utils/logger';
import BaseService from './baseService.service';
import { HttpBadRequest } from '@exceptions/http/HttpBadRequest';

// Kamino API Configuration
const KAMINO_API = 'https://api.kamino.finance';
const PROGRAM_ID = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD';
const CLUSTER = 'mainnet-beta';

// Lending tokens we're interested in tracking (but not limited to)
export const LENDING_TOKENS = ['SOL', 'USDC', 'USDT', 'ETH', 'WBTC', 'cbBTC'] as const;
export type LendingToken = typeof LENDING_TOKENS[number];

export interface LendingMetrics {
  priceUsd: number;
  tvl: number;
  utilizationRatio: number;
  supplyInterestApy: number;
  borrowInterestApy: number;
  loanToValueRatio: number;
  assetPriceUsd: number;
  rawReserveData?: {
    reserve: string;
    liquidityToken: string;
    totalSupplyUsd: string;
    totalBorrowUsd: string;
    maxLtv: string;
    borrowApy: string;
    supplyApy: string;
  };
}

export interface LendingMarketData {
  timestamp: string;
  metrics: Record<string, LendingMetrics>;
}

export interface LendingDataResponse {
  success: boolean;
  data?: LendingMarketData;
  error?: string;
}

class KaminoService extends BaseService {
  private readonly baseUrl = KAMINO_API;
  private readonly programId = PROGRAM_ID;
  private readonly cluster = CLUSTER;

  /**
   * Fetch comprehensive lending metrics from Kamino
   */
  public async getLendingMetrics(): Promise<LendingDataResponse> {
    try {
      logger.info({
        message: 'Fetching Kamino lending market data',
        labels: { origin: 'KaminoService' },
      });

      // Use the direct reserves metrics endpoint
      const marketPubkey = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF'; // Primary market
      const { data: reserves } = await axios.get(
        `${this.baseUrl}/kamino-market/${marketPubkey}/reserves/metrics`,
        { 
          params: { env: this.cluster },
          timeout: 10000
        }
      );

      if (!Array.isArray(reserves)) {
        throw new Error('Invalid response format from Kamino reserves API');
      }

      logger.info({
        message: 'Kamino reserves data received',
        reservesCount: reserves.length,
        availableTokens: reserves.map(r => r.liquidityToken).slice(0, 10), // Show first 10
        labels: { origin: 'KaminoService' },
      });

      // Map reserves to our metrics format
      const timestamp = new Date().toISOString();
      const metrics: Record<string, LendingMetrics> = {};

      // Filter for tokens we're interested in (SOL, USDC, USDT, ETH, BTC variants)
      const interestedTokens = ['SOL', 'USDC', 'USDT', 'ETH', 'WBTC', 'cbBTC', 'tBTC', 'jSOL', 'vSOL', 'mSOL'];
      
      for (const reserve of reserves) {
        const token = reserve.liquidityToken;
        
        // Check if this token is one we're interested in
        const isInterested = interestedTokens.some(interestedToken => 
          token.toUpperCase().includes(interestedToken) || 
          token === interestedToken
        );

        if (isInterested) {
          // Calculate utilization ratio
          const totalSupply = parseFloat(reserve.totalSupplyUsd) || 0;
          const totalBorrow = parseFloat(reserve.totalBorrowUsd) || 0;
          const utilizationRatio = totalSupply > 0 ? totalBorrow / totalSupply : 0;

          metrics[token] = {
            priceUsd: 0, // Not provided directly, we'll fetch separately if needed
            tvl: totalSupply,
            utilizationRatio,
            supplyInterestApy: parseFloat(reserve.supplyApy) || 0,
            borrowInterestApy: parseFloat(reserve.borrowApy) || 0,
            loanToValueRatio: parseFloat(reserve.maxLtv) || 0,
            assetPriceUsd: 0, // Not provided directly
            // Store raw data for LLM prompt
            rawReserveData: {
              reserve: reserve.reserve,
              liquidityToken: reserve.liquidityToken,
              totalSupplyUsd: reserve.totalSupplyUsd,
              totalBorrowUsd: reserve.totalBorrowUsd,
              maxLtv: reserve.maxLtv,
              borrowApy: reserve.borrowApy,
              supplyApy: reserve.supplyApy
            }
          };
        }
      }

      // If no interested tokens found, include the top 5 by TVL
      if (Object.keys(metrics).length === 0) {
        const topReserves = reserves
          .sort((a, b) => parseFloat(b.totalSupplyUsd) - parseFloat(a.totalSupplyUsd))
          .slice(0, 5);

        for (const reserve of topReserves) {
          const token = reserve.liquidityToken;
          const totalSupply = parseFloat(reserve.totalSupplyUsd) || 0;
          const totalBorrow = parseFloat(reserve.totalBorrowUsd) || 0;
          const utilizationRatio = totalSupply > 0 ? totalBorrow / totalSupply : 0;

          metrics[token] = {
            priceUsd: 0,
            tvl: totalSupply,
            utilizationRatio,
            supplyInterestApy: parseFloat(reserve.supplyApy) || 0,
            borrowInterestApy: parseFloat(reserve.borrowApy) || 0,
            loanToValueRatio: parseFloat(reserve.maxLtv) || 0,
            assetPriceUsd: 0,
            // Store raw data for LLM prompt
            rawReserveData: {
              reserve: reserve.reserve,
              liquidityToken: reserve.liquidityToken,
              totalSupplyUsd: reserve.totalSupplyUsd,
              totalBorrowUsd: reserve.totalBorrowUsd,
              maxLtv: reserve.maxLtv,
              borrowApy: reserve.borrowApy,
              supplyApy: reserve.supplyApy
            }
          };
        }
      }

      const lendingData: LendingMarketData = {
        timestamp,
        metrics
      };

      logger.info({
        message: 'Successfully processed Kamino lending data',
        tokensIncluded: Object.keys(metrics),
        tokensCount: Object.keys(metrics).length,
        labels: { origin: 'KaminoService' },
      });

      return {
        success: true,
        data: lendingData
      };

    } catch (error) {
      logger.error({
        message: `Error fetching Kamino lending data: ${error.message}`,
        error: error.message,
        labels: { origin: 'KaminoService' },
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get lending data formatted for LLM prompt
   */
  public async getLendingDataForLLM(): Promise<string> {
    const lendingResponse = await this.getLendingMetrics();
    
    if (!lendingResponse.success || !lendingResponse.data) {
      throw new HttpBadRequest('Failed to fetch lending data for LLM analysis');
    }

    const promptObject = {
      lendingData: {
        timestamp: lendingResponse.data.timestamp,
        pairs: Object.entries(lendingResponse.data.metrics).map(([token, fields]) => ({
          token,
          ...fields
        }))
      }
    };

    return JSON.stringify(promptObject, null, 2);
  }

  /**
   * Health check for Kamino API connectivity
   */
  public async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const marketPubkey = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';
      const { data } = await axios.get(
        `${this.baseUrl}/kamino-market/${marketPubkey}/reserves/metrics`,
        { 
          params: { env: this.cluster },
          timeout: 5000
        }
      );

      return {
        healthy: Array.isArray(data) && data.length > 0,
        message: `Kamino API is accessible - ${data.length} reserves available`
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Kamino API error: ${error.message}`
      };
    }
  }
}

export default KaminoService;