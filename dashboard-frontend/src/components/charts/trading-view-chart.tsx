"use client";

import React, { useEffect, useRef, useState } from "react";

interface TradingViewChartProps {
  symbol?: string; // Example: "BINANCE:BTCUSDT"
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "BINANCE:BTCUSDT",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [height, setHeight] = useState<number>(500);

  // Observe dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Handle responsive height
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setHeight(300); // mobile
      else if (width < 1024) setHeight(400); // tablet
      else setHeight(500); // desktop
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Embed TradingView script
  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      width: "100%",
      height,
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [symbol, theme, height]);

  return (
    <div ref={containerRef} className="tradingview-widget-container w-full">
      <div className="tradingview-widget-container__widget" />
    </div>
  );
};

export default TradingViewChart;
