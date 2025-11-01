"use server";

import { TradingBalance } from "@/components/charts/protocol-allocation-chart";
import { generateQueryParamsString } from "@/functions";
import { fetchWrapper } from "@/lib/fetch-wrapper";
import { ILendingHistoryData, IQueryData, ITradingHistoryData, OHLCVPairItem } from "@/types";

type TradingHistoryResponse = {
  message: string;
  data: Array<ITradingHistoryData>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type DecisionsResponse = {
  data: {
    count: number;
    rows: Array<{
      _id: string;
      decision: {
        trading?: {
          action: string;
          pair: string | null;
          shouldExecute: boolean;
          reasoning: {
            marketCondition: string;
            technicalAnalysis: string;
            riskAssessment: string;
            pairSelection: string;
            comparativeAnalysis: {
              volatilityComparison: string;
              trendAlignment: string;
              relativeStrength: string;
              modelAgreement: string;
              correlationImpact?: string;
            };
          };
          confidence: string;
        };
        lending?: {
          action: string;
          token: string | null;
          amountPercentage?: number;
          apyExpected?: number;
          shouldExecute: boolean;
          reasoning: string;
          riskLevel?: string;
          poolSizeUsd?: number;
          poolSizeFormatted?: string;
          utilizationRate?: string;
          reserveAddress?: string;
          supplyApyFormatted?: string;
          confidence: string;
        };
      };
      id: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
};

type OHLCVPairResponse = {
  items: Array<OHLCVPairItem>;
};

type TradingBalancesResponse = {
  data: {
    message: string;
    balances: Array<TradingBalance>;
    total: number; // Total number of balances
  };
};

type TradingMetricsResponse = {
  message: string;
  data: {
    totalPnl24Hours: number;
    pnl24Hours: number;
    averageAPY: number;
    tradeCount24h: number;
    successRate24h: number;
    lastUpdated: string;
  };
};

type LendingHistoryResponse = {
  success: boolean;
  data: {
    records: Array<ILendingHistoryData>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

// Get trading history
export const getTradingHistory = async (page: number = 1, limit: number = 10) => {
  // Send request
  const response = await fetchWrapper<TradingHistoryResponse>(
    `/api/trading/history?page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  );

  return response;
};

// Get decisions.
export const getDecisions = async (limit: number = 10, offset: number = 0) => {
  // Send request.
  const response = await fetchWrapper<DecisionsResponse>(
    `/api/llms/decisions?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    }
  );

  return response;
};

// Get OHLC price data for a specific asset within a time range
export const getOHLCPriceMetrics = async (queryData: IQueryData) => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  // const oneWeekAgo = now - 7 * 24 * 60 * 60; // 7 days ago in seconds
  // console.log({ oneWeekAgo });

  const params = {
    // The address of a pair contract
    address:
      queryData.symbol === "BTCUSD"
        ? process.env.BIRDEYE_ADDRESS_BTCUSD
        : queryData.symbol === "SOLUSD"
          ? process.env.BIRDEYE_ADDRESS_SOLUSD
          : "",
    // time_from: oneWeekAgo, // Unix timestamp in seconds
    time_from: 0, // Unix timestamp in seconds
    time_to: now, // Unix timestamp in seconds
    type: queryData.timeFrame, // OHLCV time frame.
  };

  // Get query params string
  const queryParams = generateQueryParamsString(params);

  // Send request
  const response = await fetchWrapper<OHLCVPairResponse>(
    `/defi/ohlcv/pair${queryParams}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-chain": "solana",
        "X-API-KEY": process.env.BIRDEYE_API_KEY,
      },
      baseUrl: process.env.BIRDEYE_API_BASE_URL,
    }
  );

  return response;
};

// Get trading history
export const getTradingBalances = async () => {
  // Send request
  const response = await fetchWrapper<TradingBalancesResponse>(
    "/api/trading/balances",
    {
      method: "GET",
    }
  );

  return response;
};

// Get trading metrics
export const getTradingMetrics = async () => {
  // Send request
  const response = await fetchWrapper<TradingMetricsResponse>(
    "/api/trading/metrics",
    {
      method: "GET",
    }
  );

  return response;
};

// Get lending history
export const getLendingHistory = async (page: number = 1, limit: number = 20) => {
  // Send request
  const response = await fetchWrapper<LendingHistoryResponse>(
    `/api/lending/history?page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  );

  return response;
};
