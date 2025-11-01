"use client";

import { format } from "date-fns";
import { ArrowLeftRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/functions";
import { transformTradingHistoryData } from "@/functions/transform-trading-history-data";
import { getTradingHistory } from "@/lib/actions";
import { ITradingHistoryTable } from "@/types";

/**
 * NOTE: This preserves your logic + data flow:
 * - fetchTradingHistory uses getTradingHistory + transformTradingHistoryData
 * - pagination state (page, pageSize, totalPages, totalRecords)
 * - loading state & error handling
 * Only the UI has changed from table -> cards with chips & an action bar.
 */

export default function Page() {
  const [transformedData, setTransformedData] = useState<ITradingHistoryTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // 1-based page index (kept as-is)
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTradingHistory = async (currentPage: number, currentPageSize: number) => {
    setLoading(true);
    try {
      const response = await getTradingHistory(currentPage, currentPageSize);
      // console.log("Trading history response:", response);

      if (response?.data?.data?.length > 0) {
        const transformed = transformTradingHistoryData(response.data.data);
        setTransformedData(transformed);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
          setTotalRecords(response.data.pagination.total);
        }
      } else {
        setTransformedData([]);
        if (response?.data?.pagination) {
          setTotalPages(response.data.pagination.pages || 1);
          setTotalRecords(response.data.pagination.total || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching trading history:", error);
      setTransformedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradingHistory(page, pageSize);
     
  }, [page, pageSize]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Pagination guards (since your page is 1-based)
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Optionally infer common fields if present (non-breaking; falls back gracefully)
  const inferPairIcon = (pairRaw?: string) => {
    if (!pairRaw) return "";
    const pair = (pairRaw || "").toString().replaceAll("_", "").toUpperCase();
    if (pair === "SOLUSD" || pair === "WSOLUSD") return "/images/solana.avif";
    if (pair === "ETHUSD" || pair === "WETHUSD") return "/images/ethereum.avif";
    if (pair === "BTCUSD" || pair === "WBTCUSD") return "/images/btc.png";
    if (pair === "RAYUSD") return "/images/raydium.png";
    if (pair === "GRASSUSD") return "/images/grass.png";
    if (pair === "JUPUSD") return "/images/jupiter.png";
    if (pair === "USDC") return "/images/usdc.png";
    if (pair === "USDT") return "/images/usdt.png";
    return "";
  };

  const prettyDate = (value: any) => {
    try {
      return value ? format(value, "MMMM dd, yyyy") : "-";
    } catch {
      return "-";
    }
  };

  const pageSizeOptions = useMemo(() => [5, 10, 20, 50], []);

  return (
    <div
      className={cn(
        "min-h-screen grid grid-rows-[auto_1fr] text-gray-900 dark:text-foreground transition-colors"
      )}
    >
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-4 p-4 mt-16">
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-4 md:min-h-min">
          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">Trading History</h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading…" : `${totalRecords} records • Page ${page} of ${Math.max(totalPages, 1)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => handlePageSizeChange(Number(v))}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Loading skeletons */}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <Card key={i} className="border-border/60 overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Separator />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && transformedData.length === 0 && (
              <Card className="border-border/60 overflow-hidden">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No trading history to display.
                </CardContent>
              </Card>
            )}

            {/* Cards grid */}
            {!loading && transformedData.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {transformedData.map((row: any) => {
                  // Try to detect common props; fallback-safe if your transform differs
                  const createdAt = row.createdAt ?? row.txDate ?? row.date;
                  const pairRaw = row.pair ?? row.token ?? row.symbol;
                  const action = row.action ?? row.decision;
                  const confidence = row.confidence;
                  const reasoning = row.reasoning ?? row.technicalAnalysis ?? row.notes;

                  const pair = (pairRaw || "-").toString().replaceAll("_", "");
                  const icon = inferPairIcon(pairRaw);

                  // Badge colors (kept logic-friendly)
                  const actionColor =
                    action === "BUY" || action === "LEND"
                      ? "bg-green-500 dark:bg-green-600"
                      : action === "WAIT"
                      ? "bg-yellow-500 dark:bg-yellow-600"
                      : "bg-blue-500 dark:bg-blue-600";

                  const confidenceColor =
                    confidence === "HIGH"
                      ? "bg-green-500 dark:bg-green-600"
                      : confidence === "LOW"
                      ? "bg-red-500 dark:bg-red-600"
                      : "bg-blue-500 dark:bg-blue-600";

                  return (
                    <Card key={row.id ?? `${pair}-${createdAt ?? Math.random()}`} className="border-border/60 overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {icon ? (
                              <Image
                                alt={pair}
                                className="rounded-full shrink-0"
                                height={24}
                                src={icon}
                                width={24}
                              />
                            ) : null}
                            <p className="font-medium truncate">{pair}</p>
                          </div>
                          {action ? (
                            <Badge className={`${actionColor} text-white`} variant="secondary">
                              {action}
                            </Badge>
                          ) : null}
                        </div>

                        {/* Chips row */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge className="bg-muted text-foreground" variant="secondary">
                            <CalendarDays className="mr-1 h-3.5 w-3.5 opacity-70" />
                            {prettyDate(createdAt)}
                          </Badge>
                          {"apy" in row || "supplyApyFormatted" in row ? (
                            <Badge className="bg-muted text-foreground" variant="secondary">
                              APY: {row.apy ?? row.supplyApyFormatted ?? "-"}
                            </Badge>
                          ) : null}
                          {confidence ? (
                            <Badge className={`${confidenceColor} text-white`} variant="secondary">
                              {confidence}
                            </Badge>
                          ) : null}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4">
                        {/* Reasoning / details */}
                        {reasoning ? (
                          <div className="space-y-1.5">
                            <div className="text-xs text-muted-foreground">Reasoning</div>
                            <div className="text-sm text-foreground break-words">{reasoning}</div>
                          </div>
                        ) : null}

                        {/* Render any extra noteworthy fields in a compact key:value list */}
                        <div className="space-y-1.5">
                          <div className="text-xs text-muted-foreground">Details</div>
                          <div className="text-sm text-foreground break-words">
                            <div className="grid grid-cols-1 gap-1.5">
                              {Object.entries(row)
                                .filter(([k]) =>
                                  ![
                                    "id",
                                    "pair",
                                    "token",
                                    "symbol",
                                    "createdAt",
                                    "txDate",
                                    "date",
                                    "action",
                                    "decision",
                                    "confidence",
                                    "reasoning",
                                    "technicalAnalysis",
                                    "notes",
                                    "apy",
                                    "supplyApyFormatted",
                                  ].includes(k)
                                )
                                .slice(0, 6) // keep it compact
                                .map(([k, v]) => (
                                  <div key={k} className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-muted-foreground capitalize">
                                      {k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                                    </span>
                                    <span className="truncate max-w-[60%] text-right">
                                      {typeof v === "string" || typeof v === "number" ? String(v) : "-"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        <Separator />
                        <div className="text-[11px] text-muted-foreground">
                          ID: {row.id || "—"}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && transformedData.length > 0 && (
              <div className="mt-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        aria-disabled={!canPrev}
                        className={!canPrev ? "pointer-events-none opacity-50" : ""}
                        tabIndex={!canPrev ? -1 : 0}
                        onClick={() => canPrev && handlePageChange(page - 1)}
                      />
                    </PaginationItem>

                    {/* Windowed numeric links */}
                    {totalPages > 0 && (
                      <>
                        {Array.from({ length: totalPages })
                          .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                          .map((_, idx) => {
                            const first = Math.max(0, page - 3);
                            const p = first + idx + 1; // convert to 1-based
                            return (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  isActive={p === page}
                                  onClick={() => handlePageChange(p)}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                        {page + 2 < totalPages && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        aria-disabled={!canNext}
                        className={!canNext ? "pointer-events-none opacity-50" : ""}
                        tabIndex={!canNext ? -1 : 0}
                        onClick={() => canNext && handlePageChange(page + 1)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
