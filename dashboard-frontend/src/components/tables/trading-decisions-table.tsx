"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { replaceMultipleWords } from "@/functions";

type DecisionsTradingTable = {
  id: string;
  pair: string;
  action: string;
  pairSelection: string;
  riskAssessment: string;
  marketCondition: string;
  technicalAnalysis: string;
  modelAgreement: string;
  confidence: string;
};

export const columns: ColumnDef<DecisionsTradingTable>[] = [
  {
    accessorKey: "createdAt",
    header: "Tx. Date",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("createdAt")
          ? format(row.getValue("createdAt"), "MMMM dd, yyyy")
          : "-"}
      </div>
    ),
    // size: 100,
    // minSize: 100,
  },
  {
    accessorKey: "pair",
    header: "Pair",
    cell: ({ row }) => {
      const pair = (row.getValue("pair")?.toString() || "-").replaceAll(
        "_",
        ""
      );
      let iconSrc = "";

      if (pair.toUpperCase() === "SOLUSD") {
        iconSrc = "/images/solana.avif";
      } else if (pair.toUpperCase() === "ETHUSD") {
        iconSrc = "/images/ethereum.avif";
      }

      return (
        <div className="flex items-center gap-2">
          {iconSrc && (
            <Image
              alt={pair}
              className="rounded-full"
              height={24}
              src={iconSrc}
              width={24}
            />
          )}
          <span>{pair}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'action',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Action" />
  //   ),
  // },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action");
      const colorClass =
        action === "BUY"
          ? "bg-green-500 dark:bg-green-600"
          : action === "WAIT"
            ? "bg-yellow-500 dark:bg-yellow-600"
            : "bg-blue-500 dark:bg-blue-600";
      return (
        <Badge className={`${colorClass} text-white`} variant="secondary">
          {row.getValue("action")}
        </Badge>
      );
    },
    size: 80,
  },
  {
    accessorKey: "pairSelection",
    header: "Pair Selection",
    cell: ({ row }) => row.getValue("pairSelection"),
  },
  {
    accessorKey: "riskAssessment",
    header: "Risk Assessment",
    cell: ({ row }) => {
      const value = row.getValue("riskAssessment")?.toString() || "-";
      const isHigh = value.toLowerCase().includes("high");
      const isLow = value.toLowerCase().includes("low");

      return (
        <div className="flex items-center gap-2">
          {isHigh && (
            <ArrowUpIcon className="text-red-500 shrink-0" size={18} />
          )}
          {isLow && (
            <ArrowDownIcon className="text-green-500 shrink-0" size={18} />
          )}
          <span>{isHigh ? "HIGH" : "LOW"}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'marketCondition',
  //   header: 'Market Condition',
  //   cell: ({ row }) => (
  //     <div className="font-medium">{row.getValue('marketCondition')}</div>
  //   ),
  // },
  {
    accessorKey: "technicalAnalysis",
    header: "Technical Analysis",
    cell: ({ row }) =>
      replaceMultipleWords(row.getValue("technicalAnalysis"), {
        gpt: "",
        DeepSeek: "",
      }),
  },
  // {
  //   accessorKey: 'modelAgreement',
  //   header: 'Model Agreement',
  //   cell: ({ row }) => (
  //     <div className="font-medium">{row.getValue('modelAgreement')}</div>
  //   ),
  // },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      const confidence = row.getValue("confidence");
      const colorClass =
        confidence === "HIGH"
          ? "bg-green-500 dark:bg-green-600"
          : confidence === "LOW"
            ? "bg-red-500 dark:bg-red-600"
            : "bg-blue-500 dark:bg-blue-600";
      return (
        <Badge className={`${colorClass} text-white`} variant="secondary">
          {confidence as string}
        </Badge>
      );
    },
    size: 100,
  },
];

export default function TradingDecisionsTable({ data }) {
  console.log("Trading: ", data);
  return (
    <>
      <DataTable columns={columns} data={data} />
    </>
  );
}
