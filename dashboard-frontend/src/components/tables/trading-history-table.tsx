"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

type TradingHistoryTable = {
  _id: string;
  id: string;
  user_id: string;
  custodial_wallet_address: string;
  action: string;
  base_token: string;
  quote_token: string;
  base_amount: string;
  quote_amount: string;
  price: string;
  confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
  transaction_signature?: string;
  error_message?: string;
  llm_decision_id?: string;
};

export const columns: ColumnDef<TradingHistoryTable>[] = [
  {
    accessorKey: "created_at",
    header: "Tx. Date",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("created_at")
          ? format(new Date(row.getValue("created_at")), "MMM dd, yyyy")
          : "-"}
      </div>
    ),
    size: 100,
  },
  // Add missing action column for the description cell to access
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      
      // Custom colors for BUY and SELL
      let badgeClass = "";
      if (action === "BUY") {
        badgeClass = "bg-green-500 hover:bg-green-600 text-white";
      } else if (action === "SELL") {
        badgeClass = "bg-blue-500 hover:bg-blue-600 text-white";
      }
      
      return (
        <Badge className={badgeClass} variant="secondary">
          {action}
        </Badge>
      );
    },
    size: 80,
  },
  // Add missing base_amount column for the description cell to access
  {
    accessorKey: "base_amount",
    header: "Amount",
    cell: ({ row }) => {
      const baseAmount = row.getValue("base_amount") as string;
      
      // Dynamic amount formatting function - always show in decimal format
      const formatAmount = (amount: string): string => {
        if (!amount || isNaN(parseFloat(amount))) return "0";
        
        const num = parseFloat(amount);
        if (num === 0) return "0";
        
        // Always show in decimal format, adjust precision based on size
        if (num < 0.000001) {
          return num.toFixed(12); // e.g., 0.000000123456
        } else if (num < 0.0001) {
          return num.toFixed(8); // e.g., 0.00002560
        } else if (num < 0.01) {
          return num.toFixed(6); // e.g., 0.000123
        } else if (num < 1) {
          return num.toFixed(4); // e.g., 0.1234
        } else {
          return num.toFixed(2); // e.g., 1.23
        }
      };
      
      const safeAmount = formatAmount(baseAmount);
      return <span>{safeAmount}</span>;
    },
    size: 100,
  },


  {
    accessorKey: "description",
    header: "Tx. Description",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const baseAmount = row.getValue("base_amount") as string;
      const baseToken = row.getValue("base_token") as string;
      // Access quote data directly from original data to avoid column definition requirement
      const quoteAmount = (row.original as any).quote_amount as string;
      const quoteToken = (row.original as any).quote_token as string;

      // Helper function to convert token mint to readable name
      const getTokenName = (token: string): string => {
        if (!token) return "Unknown";
        
        // Check if it's already a readable symbol
        if (token.length <= 5) return token.toUpperCase();
        
        // Convert mint address to readable name for all 6 trading pairs
        const mintToName: { [key: string]: string } = {
          // SOL
          "So11111111111111111111111111111111111111112": "SOL",
          "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",
          // BTC
          "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": "BTC",
          "3NZ9JMVBmGAqoKWHsjiC8VhURZCNhW1JgMfq4I3tLcTo": "WBTC",
          // ETH
          "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "ETH",
          // RAY
          "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": "RAY",
          // JUP
          "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": "JUP",
          // GRASS
          "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi": "GRASS",
          // Stablecoins
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
        };
        
        return mintToName[token] || token.substring(0, 4) + "...";
      };

      // Dynamic amount formatting function - always show in decimal format
      const formatAmount = (amount: string): string => {
        if (!amount || isNaN(parseFloat(amount))) return "0";
        
        const num = parseFloat(amount);
        if (num === 0) return "0";
        
        // Always show in decimal format, adjust precision based on size
        if (num < 0.000001) {
          return num.toFixed(12); // e.g., 0.000000123456
        } else if (num < 0.0001) {
          return num.toFixed(8); // e.g., 0.00002560
        } else if (num < 0.01) {
          return num.toFixed(6); // e.g., 0.000123
        } else if (num < 1) {
          return num.toFixed(4); // e.g., 0.1234
        } else {
          return num.toFixed(2); // e.g., 1.23
        }
      };
      
      const baseTokenName = getTokenName(baseToken);
      const quoteTokenName = getTokenName(quoteToken);
      
      // Use quote amount for display if available, otherwise use base amount
      const displayAmount = quoteAmount && parseFloat(quoteAmount) > 0 
        ? formatAmount(quoteAmount)
        : formatAmount(baseAmount);
      
      const displayToken = quoteAmount && parseFloat(quoteAmount) > 0 
        ? quoteTokenName 
        : baseTokenName;

      // Determine the quote token name - if it's "Unknown", try to infer from base token
      let finalQuoteTokenName = quoteTokenName;
      if (quoteTokenName === "Unknown" || !quoteToken || quoteToken.trim() === "") {
        // Default to USDT for most trading pairs, or try to infer from base token
        if (baseTokenName === "SOL" || baseTokenName === "ETH" || baseTokenName === "mSOL") {
          finalQuoteTokenName = "USDT";
        } else if (baseTokenName === "USDT") {
          finalQuoteTokenName = "SOL";
        } else if (baseTokenName === "USDC") {
          finalQuoteTokenName = "USDT";
        } else {
          finalQuoteTokenName = "USDT"; // Default fallback
        }
      }

             if (action === "BUY") {
         // Format: "Bought SOL for 10.50 USDT" or "Bought SOL against USDT" if no quote amount
         if (quoteAmount && parseFloat(quoteAmount) > 0) {
           return `Bought ${baseTokenName} for ${displayAmount} ${finalQuoteTokenName}`;
         } else {
           return `Bought ${baseTokenName} against ${finalQuoteTokenName}`;
         }
       } else if (action === "SELL") {
         // Format: "Sold SOL for 10.50 USDT" or "Sold SOL against USDT" if no quote amount
         if (quoteAmount && parseFloat(quoteAmount) > 0) {
           return `Sold ${baseTokenName} for ${displayAmount} ${finalQuoteTokenName}`;
         } else {
           return `Sold ${baseTokenName} against ${finalQuoteTokenName}`;
         }
       }
      return `${action} ${formatAmount(baseAmount)} ${baseTokenName}`;
    },
    size: 200,
  },
  {
    accessorKey: "base_token",
    header: "Token",
    cell: ({ row }) => {
      const baseToken = row.getValue("base_token") as string;
      
      // Helper function to convert token mint to readable name and get icon
      const getTokenInfo = (token: string): { name: string; iconSrc: string } => {
        if (!token) return { name: "Unknown", iconSrc: "" };
        
        // Check if it's already a readable symbol
        if (token.length <= 5) {
          const name = token.toUpperCase();
          let iconSrc = "";
          
          if (name === "SOL" || name === "WSOL") iconSrc = "/images/solana.avif";
          else if (name === "ETH" || name === "WETH") iconSrc = "/images/ethereum.avif";
          else if (name === "BTC" || name === "WBTC") iconSrc = "/images/btc.png";
          else if (name === "RAY") iconSrc = "/images/raydium.png";
          else if (name === "GRASS") iconSrc = "/images/grass.png";
          else if (name === "JUP") iconSrc = "/images/jupiter.png";
          else if (name === "USDC") iconSrc = "/images/usdc.png";
          else if (name === "USDT") iconSrc = "/images/usdt.png";
          
          return { name, iconSrc };
        }
        
        // Convert mint address to readable name and icon for all 6 trading pairs
        const mintToInfo: { [key: string]: { name: string; iconSrc: string } } = {
          // SOL
          "So11111111111111111111111111111111111111112": { name: "SOL", iconSrc: "/images/solana.avif" },
          "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { name: "mSOL", iconSrc: "/images/solana.avif" },
          // BTC
          "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": { name: "BTC", iconSrc: "/images/btc.png" },
          "3NZ9JMVBmGAqoKWHsjiC8VhURZCNhW1JgMfq4I3tLcTo": { name: "WBTC", iconSrc: "/images/btc.png" },
          // ETH
          "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": { name: "ETH", iconSrc: "/images/ethereum.avif" },
          // RAY
          "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": { name: "RAY", iconSrc: "/images/raydium.png" },
          // JUP
          "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": { name: "JUP", iconSrc: "/images/jupiter.png" },
          // GRASS
          "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi": { name: "GRASS", iconSrc: "/images/grass.png" },
          // Stablecoins
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { name: "USDC", iconSrc: "/images/usdc.png" },
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { name: "USDT", iconSrc: "/images/usdt.png" },
        };
        
        return mintToInfo[token] || { name: token.substring(0, 4) + "...", iconSrc: "" };
      };

      const { name, iconSrc } = getTokenInfo(baseToken);

      return (
        <div className="flex items-center gap-2">
          {iconSrc && (
            <Image
              alt={name}
              className="rounded-full"
              height={24}
              src={iconSrc}
              width={24}
            />
          )}
          <span>{name}</span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "transaction_signature",
    header: "Tx. Hash",
    cell: ({ row }) => {
      const txHash = row.getValue("transaction_signature") as string;
      
      // If no transaction signature, show "NOT FOUND"
      if (!txHash || txHash.trim() === '') {
        return (
          <span className="text-gray-500 text-sm">NOT FOUND</span>
        );
      }
      
      const shortHash = txHash.length > 8 ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : txHash;

      return (
        <a
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          href={`https://solscan.io/tx/${txHash}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="font-mono text-sm">{shortHash}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const errorMessage = (row.original as any).error_message as string;
      
      // Check if it's an insufficient gas error
      let displayStatus = status;
      if ((status === "FAILED" || status === "ERROR") && errorMessage) {
        if (errorMessage.toLowerCase().includes("insufficient") && 
            (errorMessage.toLowerCase().includes("lamports") || 
             errorMessage.toLowerCase().includes("funds") ||
             errorMessage.toLowerCase().includes("balance"))) {
          displayStatus = "Insufficient GAS";
        }
      }
      
      // Custom colors for status
      let badgeClass = "";
      if (displayStatus === "SUCCESS" || displayStatus === "COMPLETED") {
        badgeClass = "bg-green-500 hover:bg-green-600 text-white";
      } else if (displayStatus === "PENDING" || displayStatus === "PROCESSING") {
        badgeClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
      } else if (displayStatus === "FAILED" || displayStatus === "ERROR" || displayStatus === "Insufficient GAS") {
        badgeClass = "bg-red-500 hover:bg-red-600 text-white";
      } else {
        badgeClass = "bg-gray-500 hover:bg-gray-600 text-white";
      }
      
      return (
        <Badge className={badgeClass} variant="secondary">
          {displayStatus}
        </Badge>
      );
    },
    size: 100,
  },
];

interface PaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function TradingHistoryTable({ 
  data, 
  pagination, 
  loading = false 
}: { 
  data: TradingHistoryTable[];
  pagination?: PaginationProps;
  loading?: boolean;
}) {
  console.log("Trading History Data:", data);
  
  // Log data structure for debugging
  if (data && data.length > 0) {
    console.log("First trading history item keys:", Object.keys(data[0]));
    console.log("First trading history item:", data[0]);
  }

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <>
      <DataTable 
        columns={columns} 
        data={safeData} 
        loading={loading}
        pagination={pagination}
      />
    </>
  );
}
