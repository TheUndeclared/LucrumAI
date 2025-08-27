"use server";

import { TradingBalance } from "@/components/charts/protocol-allocation-chart";
import { generateQueryParamsString } from "@/functions";
import { fetchWrapper } from "@/lib/fetch-wrapper";
import { IQueryData, ITradingHistoryData, OHLCVPairItem } from "@/types";

type TradingHistoryResponse = {
  count: number; // Total number of records
  rows: Array<ITradingHistoryData>;
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
    totalBalanceTraded24h: number;
    pnl24Hours: number;
    averageAPY: number;
    tradeCount24h: number;
    successRate24h: number;
    lastUpdated: string;
  };
};

// Get trading history
export const getTradingHistory = async () => {
  // Send request
  const response = await fetchWrapper<TradingHistoryResponse>(
    "/api/trading/history",
    {
      method: "GET",
    }
  );

  return response;
};

// Get decisions
export const getDecisions = async () => {
  // Send request
  const response = await fetchWrapper<TradingHistoryResponse>(
    "/api/llms/decisions",
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
