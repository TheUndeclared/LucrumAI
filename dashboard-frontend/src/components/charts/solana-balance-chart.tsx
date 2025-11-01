"use client";

import { useConnection,useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ApexCharts needs dynamic import to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Token = {
  symbol: string;
  mint: string;
};

const tokens: Token[] = [
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "USDT", mint: "Es9vMFrzaCERaXzvEwA4Jwv96kZ9eHkTeMXJZ7DkPg6v" },
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112" }, // native SOL
];

export default function SolanaBalanceChart() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [balances, setBalances] = useState<
    { symbol: string; balance: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalances = async () => {
      setLoading(true);
      const newBalances: { symbol: string; balance: number }[] = [];

      for (const token of tokens) {
        try {
          if (token.symbol === "SOL") {
            // Get native SOL balance
            const lamports = await connection.getBalance(publicKey);
            newBalances.push({ symbol: "SOL", balance: lamports / 1e9 });
          } else {
            // Get SPL token account balance
            const tokenAccounts =
              await connection.getParsedTokenAccountsByOwner(publicKey, {
                mint: new PublicKey(token.mint),
              });

            const amount =
              tokenAccounts.value?.[0]?.account?.data?.parsed?.info?.tokenAmount
                ?.uiAmount || 0;

            newBalances.push({ symbol: token.symbol, balance: amount });
          }
        } catch (err) {
          console.error(`Error loading ${token.symbol}:`, err);
        }
      }

      setBalances(newBalances);
      setLoading(false);
    };

    fetchBalances();
  }, [publicKey, connection]);

  if (!publicKey) return <div>Connect your Solana wallet to see balances.</div>;
  if (loading) return <div>Loading balances...</div>;

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      // foreColor: "#ffffff",
      foreColor: "#E5E7EB", // Tailwind's gray-200
    },
    labels: balances.map((b) => b.symbol),
    theme: {
      mode: "dark",
      monochrome: {
        enabled: true,
        color: "#16c784",
        shadeIntensity: 0.6,
      },
    },
    legend: {
      position: "bottom",
      fontSize: "14px",
      labels: {
        colors: "#9CA3AF", // Tailwind's gray-400
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      style: {
        colors: ["#F9FAFB"], // text-white
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => val.toFixed(4),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              color: "#F9FAFB", // text-white
            },
            value: {
              show: true,
              fontSize: "14px",
              color: "#D1D5DB", // text-gray-300
              formatter: (val: string) => parseFloat(val).toFixed(4),
            },
          },
        },
      },
    },
    colors: ["#16c784", "#f97316", "#3b82f6", "#f43f5e", "#eab308"], // SOL, USDC, USDT etc.
  };

  const chartSeries = balances.map((b) => b.balance);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Token Balances</h2>
      <Chart
        height={350}
        options={chartOptions}
        series={chartSeries}
        type="donut"
      />
    </div>
  );
}
