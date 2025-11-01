"use client";

import { useEffect, useState } from "react";

import { columns } from "./columns";

import Header from "@/components/header";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/functions";
import { transformLendingHistoryData } from "@/functions/transform-trading-history-data";
import { getLendingHistory } from "@/lib/actions";
import { ILendingHistoryTable } from "@/types";


export default function Page() {
  const [transformedData, setTransformedData] = useState<ILendingHistoryTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchLendingHistory = async (currentPage: number, currentPageSize: number) => {
    setLoading(true);
    try {
      const response = await getLendingHistory(currentPage, currentPageSize);
      console.log("Lending history response:", response);

      if (response?.data?.data?.records?.length > 0) {
        const transformed = transformLendingHistoryData(response.data.data.records);
        setTransformedData(transformed);

        // Update pagination info
        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.totalPages);
          setTotalRecords(response.data.data.pagination.total);
        }
      } else {
        setTransformedData([]);
      }
    } catch (error) {
      console.error("Error fetching lending history:", error);
      setTransformedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLendingHistory(page, pageSize);
  }, [page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <div
      className={cn(
        "min-h-screen grid grid-rows-[auto_1fr] text-gray-900 dark:text-foreground transition-colors"
      )}
    >
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-4 p-4 mt-16">
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-4 md:min-h-min">
          <DataTable
            columns={columns}
            data={transformedData}
            loading={loading}
            pagination={{
              page,
              pageSize,
              totalPages,
              totalRecords,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
            title="Lending History"
          />
        </div>
      </main>
    </div>
  );
}
