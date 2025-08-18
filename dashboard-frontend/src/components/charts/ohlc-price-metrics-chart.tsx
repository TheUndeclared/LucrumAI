"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { transformOHLCVPairItems } from "@/functions";
import { getOHLCPriceMetrics } from "@/lib/actions";
import { OHLCVPairItem } from "@/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const symbols: string[] = ["BTCUSD", "SOLUSD"];
const ohlcTimeFrames: string[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1H",
  "2H",
  "4H",
  "6H",
  "8H",
  "12H",
  "1D",
  "3D",
  "1W",
  "1M",
];

export default function OHLCPriceMetricsChart() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Record<string, string>>({
    symbol: symbols[0],
    timeFrame: ohlcTimeFrames[0], // Default time frame
  });
  const [transformedOHLCData, setTransformedOHLCData] = useState<
    Array<{ x: Date; y: number[] }>
  >([]);

  // Transform the OHLC data for ApexCharts
  const series = useMemo(
    () => [{ data: transformedOHLCData }],
    [transformedOHLCData]
  );

  // Chart options
  const options = useMemo<ApexCharts.ApexOptions>(
    () => ({
      chart: {
        type: "candlestick",
        height: 350,
        background: "transparent", // Transparent background
        foreColor: "#ffffff", // Light text color
      },
      theme: {
        mode: "dark", // Enable dark theme
      },
      title: {
        // text: "Market Price Metrics",
        text: "",
        margin: 10,
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    }),
    []
  );

  // Handle fetch data from endpoint
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      /**
       * Fetch OHLC price metrics
       * It will return an object of OHLC price metrics.
       */
      const response = await getOHLCPriceMetrics(filters);
      console.log({ getOHLCPriceMetrics: response });

      if (!response || !response.data) {
        console.error("No data received from OHLCV pair API");
        toast.error("No data received from OHLCV pair API");
        return;
      }

      const transformedData =
        response.data.items.length > 0
          ? transformOHLCVPairItems(response.data.items as OHLCVPairItem[])
          : [];

      // Update state with fetched data
      setTransformedOHLCData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false); // Stop loader
    }
  }, [filters]);

  // Trigger request when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="text-[#7efe73]">●</span> Market Price Metrics
      </h3>
      <div className="flex items-center gap-2 mb-4">
        {/* Symbol Selector */}
        <Select
          defaultValue={filters.symbol}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, symbol: value }))
          }
        >
          <SelectTrigger className="w-28 h-auto relative z-10 leading-none cursor-pointer -mb-6">
            <SelectValue placeholder="Select a symbol" />
          </SelectTrigger>
          <SelectContent>
            {symbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Frame Selector */}
        <Select
          defaultValue={filters.timeFrame}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, timeFrame: value }))
          }
        >
          <SelectTrigger className="w-28 h-auto relative z-10 leading-none cursor-pointer -mb-6">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            {ohlcTimeFrames.map((timeFrame) => (
              <SelectItem key={timeFrame} value={timeFrame}>
                {timeFrame}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-[350px] rounded-lg bg-gray-600 mt-8" />
        </div>
      ) : transformedOHLCData.length === 0 ? (
        <p className="text-gray-400 mt-8">
          No data available for the selected filters.
        </p>
      ) : (
        <Chart
          height={350}
          options={options}
          series={series}
          type="candlestick"
        />
      )}
    </>
  );
}
