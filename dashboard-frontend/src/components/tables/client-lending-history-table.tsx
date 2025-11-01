"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import LendingHistoryTable from "./lending-history-table";

import { getLendingHistory } from "@/lib/actions/custodial-wallet";


export default function ClientLendingHistoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: lendingHistoryData, isLoading, error, refetch } = useQuery({
    queryKey: ["lendingHistory", currentPage, pageSize],
    queryFn: async () => {
      const offset = (currentPage - 1) * pageSize;
      const response = await getLendingHistory(pageSize, offset);
      
      if (response?.data?.data) {
        setTotalCount(response.data.data.pagination?.total || 0);
        setTotalPages(Math.ceil((response.data.data.pagination?.total || 0) / pageSize));
        return response.data.data.lendingHistory || [];
      }
      return [];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (error) {
    console.error("Error fetching lending history:", error);
  }

  const pagination = {
    page: currentPage,
    pageSize,
    totalPages,
    totalRecords: totalCount,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <LendingHistoryTable 
      data={lendingHistoryData || []} 
      loading={isLoading}
      pagination={pagination}
    />
  );
}
