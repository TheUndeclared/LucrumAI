"use client";

import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TokenBalance = {
  symbol: string;
  balance: number;
};

interface ERC20BalanceChartProps {
  balances: TokenBalance[];
  loading?: boolean;
}

export default function ERC20BalanceChart({ balances, loading = false }: ERC20BalanceChartProps) {
  if (loading) return <div>Loading balances...</div>;
  if (!balances || balances.length === 0) return <div>No balances to display</div>;

  // Chart options
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent", // Transparent background
      foreColor: "#ffffff", // Light text color
    },
    labels: balances.map((t) => t.symbol),
    theme: {
      mode: "dark", // Enable dark theme
      monochrome: {
        enabled: true,
        color: "#816cf9", // purple-500
        shadeIntensity: 0.4,
      },
    },
  };

  const chartSeries = balances.map((t) => t.balance);

  return (
    <div>
      <h2 className="text-lg font-bold">Token Balances</h2>
      <Chart
        height={350}
        options={chartOptions}
        series={chartSeries}
        type="donut"
      />
    </div>
  );
}