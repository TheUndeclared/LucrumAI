"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import Image from "next/image";

type CurvanceDecisionsTableProps = {
  id: string;
  action: string;
  marketAnalysis: string;
  riskAssessment: string;
  confidence: string;
};

export const columns: ColumnDef<CurvanceDecisionsTableProps>[] = [
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
  },
  {
    accessorKey: "token",
    header: "Pair",
    cell: ({ row }) => {
      const pair = (row.getValue("token")?.toString() || "-").replaceAll(
        "_",
        ""
      );
      let iconSrc = "";

      if (pair.toUpperCase() === "SOLUSD") {
        iconSrc = "/images/solana.avif";
      } else if (pair.toUpperCase() === "ETHUSD") {
        iconSrc = "/images/ethereum.avif";
      } else if (pair.toUpperCase() === "USDC") {
        iconSrc = "/images/usdc.png";
      } else if (pair.toUpperCase() === "USDT") {
        iconSrc = "/images/usdt.png";
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
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      if (!row.getValue("action")) return "-";
      const action = row.getValue("action");
      const colorClass =
        action === "LEND"
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
    accessorKey: "supplyApyFormatted",
    header: "APY %",
    cell: ({ row }) => row.getValue("supplyApyFormatted") || "-",
  },
  {
    accessorKey: "reasoning",
    header: "Reasoning",
    cell: ({ row }) => row.getValue("reasoning"),
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      if (!row.getValue("confidence")) return "-";
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

export default function CurvanceDecisionsTable({ data }) {
  console.log("Curvance: ", data);
  return (
    <>
      <DataTable columns={columns} data={data} />
    </>
  );
}
