"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// ApexCharts needs dynamic import to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProtocolAllocationChart() {
  const [series] = useState<number[]>([35, 25, 15, 15, 10]); // static percentages

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "pie",
    },
    labels: ["BTC", "ETH", "SOL", "AVAX", "MATIC"], // token names
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
    },
  };

  return (
    <div className="border rounded-md p-4 bg-background">
      <h3 className="text-primary text-lg mb-2">Protocol Allocation</h3>
      <Chart options={options} series={series} type="pie" width="100%" />
    </div>
  );
}
