"use client";

import { getTradingBalances } from "@/lib/actions";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

// ApexCharts needs dynamic import to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TradingBalance = {
  symbol: string;
  mint: string;
  balance: number;
  decimals: number;
};

export default function ProtocolAllocationChart() {
  const [loading, setLoading] = useState<boolean>(true);
  const [balances, setBalances] = useState<TradingBalance[]>([]);
  // const [series] = useState<number[]>([35, 25, 15, 15, 10]); // static percentages

  const series = balances.map((b) => b.balance);
  const labels = balances.map((b) =>
    b.symbol === "UNKNOWN" ? "Yield Token" : b.symbol
  );

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "pie",
    },
    // labels: ["BTC", "ETH", "SOL", "AVAX", "MATIC"], // token names
    labels, // token names
    colors: ["#22C55E", "#10B981", "#059669", "#047857", "#065F46"], // your palette
    stroke: {
      show: false, // removes white borders
    },
    legend: {
      position: "bottom",
      labels: {
        colors: "#CBD5E1", // Tailwind slate-300 for dark mode readability
      },
    },
    dataLabels: {
      style: {
        fontSize: "14px",
        colors: ["#fff"], // labels on pie pieces
      },
      formatter: function (val: number, opts: any) {
        return `${labels[opts.seriesIndex]}: ${val.toFixed(1)}%`;
      },
    },
  };

  // Fetch trading balances
  useEffect(() => {
    async function fetchBalances() {
      try {
        const response = await getTradingBalances();
        console.log({ getTradingBalances: response });
        setBalances(response?.data?.data?.balances || []);
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, []);

  return (
    <div className="border rounded-md p-4 bg-background">
      <h3 className="text-primary text-lg mb-2">Protocol Allocation</h3>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-40 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="w-16 h-4 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
        </div>
      ) : balances.length > 0 ? (
        <Chart options={options} series={series} type="pie" width="100%" />
      ) : (
        <div className="text-sm text-muted-foreground">No balances found.</div>
      )}
    </div>
  );
}
