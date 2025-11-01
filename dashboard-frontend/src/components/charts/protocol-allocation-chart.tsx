"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Skeleton } from "../ui/skeleton";

import { getTradingBalances } from "@/lib/actions";


// ApexCharts needs dynamic import to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TradingBalance = {
  symbol: string;
  mint: string;
  balance: number;
  decimals: number;
};

interface ProtocolAllocationChartProps {
  walletTokens?: Array<{
    mint: string;
    balance: string;
    decimals: number;
    symbol: string;
    name: string;
  }>;
}

export default function ProtocolAllocationChart({ walletTokens }: ProtocolAllocationChartProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [balances, setBalances] = useState<TradingBalance[]>([]);

  // Chart options will be defined after series and labels are available

  // Handle data fetching - if walletTokens provided (profile page), use those; otherwise fetch from API (dashboard page)
  useEffect(() => {
    async function fetchBalances() {
      try {
        if (walletTokens && walletTokens.length > 0) {
          // Profile page: use provided wallet tokens
          const transformedBalances: TradingBalance[] = walletTokens.map(token => ({
            symbol: token.symbol,
            mint: token.mint,
            balance: parseFloat(token.balance) / Math.pow(10, token.decimals),
            decimals: token.decimals
          }));
          setBalances(transformedBalances);
        } else {
          // Dashboard page: fetch from old API for admin wallet stats
          const response = await getTradingBalances();
          console.log({ getTradingBalances: response });
          setBalances(response?.data?.data?.balances || []);
        }
      } catch (err) {
        console.error("Error fetching balances:", err);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [walletTokens]);

  // Deduplicate balances by mint address and sum the balances
  const deduplicatedBalances = balances.reduce((acc, balance) => {
    const existing = acc.find(b => b.mint === balance.mint);
    if (existing) {
      existing.balance += balance.balance;
    } else {
      acc.push({ ...balance });
    }
    return acc;
  }, [] as TradingBalance[]);

  console.log('Original balances:', balances);
  console.log('Deduplicated balances:', deduplicatedBalances);

  const series = deduplicatedBalances.map((b) => b.balance);
  const labels = deduplicatedBalances.map((b) => {
    // Determine token symbol based on mint address (most reliable)
    if (b.mint === "So11111111111111111111111111111111111111112") return "SOL";
    if (b.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
    if (b.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
    if (b.mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") return "BTC";
    if (b.mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") return "RAY";
    if (b.mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") return "JUP";
    if (b.mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") return "GRASS";
    if (b.mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") return "ETH";
    
    // Fallback to symbol if mint is not recognized
    if (b.symbol === "UNKNOWN") return "Yield Token";
    return b.symbol;
  });

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "pie",
    },
    labels, // token names
    colors: ["#22C55E", "#10B981", "#059669", "#047857", "#065F46"], // your palette
    stroke: {
      show: false, // removes white borders
    },
    legend: {
      show: false, // Hide default legend since we'll create custom layout
    },
    dataLabels: {
      enabled: false, // Remove percentage labels from chart itself
    },
    tooltip: {
      enabled: false, // Remove balance view on hover
    },
  };

  // Calculate percentages for custom legend
  const total = series.reduce((sum, value) => sum + value, 0);
  const percentages = series.map(value => total > 0 ? (value / total) * 100 : 0);

  return (
  <div className="border rounded-md p-4 bg-background">
  <h3 className="text-primary text-lg mb-2">Tokens Allocation</h3>

  {loading ? (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-40 h-40 rounded-full" />
      <div className="flex flex-wrap gap-3 justify-center">
        <Skeleton className="w-16 h-4 rounded" />
        <Skeleton className="w-16 h-4 rounded" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>
    </div>
  ) : balances.length > 0 ? (
    <div className="flex flex-col items-center gap-4">
      {/* Responsive Chart */}
      <Chart
        height={window.innerWidth < 768 ? 150 : 200} // smaller on mobile
        options={options}
        series={series}
        type="pie"
        width={window.innerWidth < 768 ? 150 : 200}
      />

      {/* Token List */}
      <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm">
        {labels.map((label, index) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: options.colors?.[index] || '#22C55E' }}
              />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {percentages[index] < 0.01
                ? percentages[index].toFixed(3)
                : percentages[index] < 0.1
                ? percentages[index].toFixed(2)
                : percentages[index].toFixed(1)}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground text-center">
      No balances found. Please deposit some tokens
    </div>
  )}
</div>

  );
}
