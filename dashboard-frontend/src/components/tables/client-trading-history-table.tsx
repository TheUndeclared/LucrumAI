"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import TradingHistoryTable from "./trading-history-table";

import { getTradingHistory } from "@/lib/actions/custodial-wallet";


export default function ClientTradingHistoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: tradingHistoryData, isLoading, error, refetch, isFetching, isError } = useQuery({
    queryKey: ["tradingHistory", currentPage, pageSize],
    queryFn: async () => {
      console.log("🚀 Fetching trading history with params:", { currentPage, pageSize });
      const offset = (currentPage - 1) * pageSize;
      const response = await getTradingHistory(pageSize, offset);
      
      console.log("📊 Trading history response:", response);
      
      // Handle authentication errors
      if (response?.error) {
        console.error("❌ Trading history error:", response.error);
        throw new Error(response.error);
      }
      
      if (response?.data?.data) {
        console.log("✅ Successfully parsed trading history data:", response.data.data.tradingHistory?.length || 0, "items");
        return {
          tradingHistory: response.data.data.tradingHistory || [],
          pagination: response.data.data.pagination || { total: 0, limit: pageSize, offset: 0 }
        };
      }
      console.log("❌ No data found in response");
      return {
        tradingHistory: [],
        pagination: { total: 0, limit: pageSize, offset: 0 }
      };
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes("authentication") || error?.message?.includes("token")) {
        return false;
      }
      return failureCount < 1; // Only retry once for other errors
    },
  });

  // Update pagination state when data changes
  React.useEffect(() => {
    if (tradingHistoryData?.pagination) {
      setTotalCount(tradingHistoryData.pagination.total || 0);
      setTotalPages(Math.ceil((tradingHistoryData.pagination.total || 0) / pageSize));
    }
  }, [tradingHistoryData, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (error) {
    console.error("Error fetching trading history:", error);
  }

  // Show error state
  if (isError && error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <div className="text-center">
          <p className="text-lg font-semibold">Error loading trading history</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("🔄 Trading History Loading State:", {
    isLoading,
    isFetching,
    isError,
    hasData: !!tradingHistoryData,
    dataLength: tradingHistoryData?.tradingHistory?.length || 0,
    currentPage,
    pageSize,
    error: error?.message || null
  });

  const pagination = {
    page: currentPage,
    pageSize,
    totalPages,
    totalRecords: totalCount,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <TradingHistoryTable 
      data={tradingHistoryData?.tradingHistory || []} 
      loading={isLoading}
      pagination={pagination}
    />
  );
}
