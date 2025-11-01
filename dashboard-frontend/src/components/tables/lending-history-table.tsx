"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

type LendingHistoryTable = {
  id: string;
  user_id: string;
  custodial_wallet_address: string;
  action: string;
  token: string;
  amount: string;
  apy: number;
  confidence: number;
  status: string;
  error_message?: string;
  created_at: string;
};

export const columns: ColumnDef<LendingHistoryTable>[] = [
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
  {
    accessorKey: "description",
    header: "Tx. Description",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const amount = row.getValue("amount") as string;
      const token = row.getValue("token") as string;
      
      if (action === "DEPOSIT") {
        return `Lent ${parseFloat(amount).toFixed(2)} ${token}`;
      } else if (action === "WITHDRAW") {
        return `Withdrew ${parseFloat(amount).toFixed(2)} ${token}`;
      }
      return `${action} ${parseFloat(amount).toFixed(2)} ${token}`;
    },
    size: 200,
  },
  {
    accessorKey: "token",
    header: "Token",
    cell: ({ row }) => {
      const token = row.getValue("token") as string;
      let iconSrc = "";

      if (token.toUpperCase() === "SOL" || token.toUpperCase() === "WSOL") {
        iconSrc = "/images/solana.avif";
      } else if (token.toUpperCase() === "ETH" || token.toUpperCase() === "WETH") {
        iconSrc = "/images/ethereum.avif";
      } else if (token.toUpperCase() === "BTC" || token.toUpperCase() === "WBTC") {
        iconSrc = "/images/btc.png";
      } else if (token.toUpperCase() === "RAY") {
        iconSrc = "/images/raydium.png";
      } else if (token.toUpperCase() === "GRASS") {
        iconSrc = "/images/grass.png";
      } else if (token.toUpperCase() === "JUP") {
        iconSrc = "/images/jupiter.png";
      } else if (token.toUpperCase() === "USDC") {
        iconSrc = "/images/usdc.png";
      } else if (token.toUpperCase() === "USDT") {
        iconSrc = "/images/usdt.png";
      }

      return (
        <div className="flex items-center gap-2">
          {iconSrc && (
            <Image
              alt={token}
              className="rounded-full"
              height={24}
              src={iconSrc}
              width={24}
            />
          )}
          <span>{token}</span>
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
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const colorClass =
        action === "DEPOSIT"
          ? "bg-green-500 dark:bg-green-600"
          : action === "WITHDRAW"
            ? "bg-red-500 dark:bg-red-600"
            : "bg-blue-500 dark:bg-blue-600";
      return (
        <Badge className={`${colorClass} text-white`} variant="secondary">
          {action}
        </Badge>
      );
    },
    size: 80,
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

export default function LendingHistoryTable({ 
  data, 
  pagination, 
  loading = false 
}: { 
  data: LendingHistoryTable[];
  pagination?: PaginationProps;
  loading?: boolean;
}) {
  console.log("Lending History: ", data);
  return (
    <>
      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading}
        pagination={pagination}
      />
    </>
  );
}
