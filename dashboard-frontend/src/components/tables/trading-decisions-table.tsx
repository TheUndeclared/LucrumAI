"use client";

import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { replaceMultipleWords } from "@/functions";

type DecisionsTradingCard = {
  id: string;
  pair: string;
  action: string;
  pairSelection: string;
  riskAssessment: string;
  marketCondition: string;
  technicalAnalysis: string;
  modelAgreement: string;
  confidence: string;
  createdAt?: string | number | Date;
};

type PaginationLike =
  | {
      // 0-based variant
      pageIndex: number;
      pageCount: number;
      onPageChange?: (pageIndex: number) => void; // expects 0-based
    }
  | {
      // 1-based variant (your parent: page/totalPages)
      page: number;
      totalPages: number;
      onPageChange?: (page: number) => void; // expects 1-based
    }
  | any;

export default function TradingDecisionsCards({
  data,
  pagination,
  loading = false,
}: {
  data: DecisionsTradingCard[] | undefined;
  pagination?: PaginationLike;
  loading?: boolean;
}) {
  const items = data || [];

  const renderPair = (raw: string) => {
    const pair = (raw?.toString() || "-").replaceAll("_", "");
    let iconSrc = "";
    const up = pair.toUpperCase();
    if (up === "SOLUSD" || up === "WSOLUSD") iconSrc = "/images/solana.avif";
    else if (up === "ETHUSD" || up === "WETHUSD") iconSrc = "/images/ethereum.avif";
    else if (up === "BTCUSD" || up === "WBTCUSD") iconSrc = "/images/btc.png";
    else if (up === "RAYUSD") iconSrc = "/images/raydium.png";
    else if (up === "GRASSUSD") iconSrc = "/images/grass.png";
    else if (up === "JUPUSD") iconSrc = "/images/jupiter.png";
    else if (up === "USDC") iconSrc = "/images/usdc.png";
    else if (up === "USDT") iconSrc = "/images/usdt.png";

    return (
      <div className="flex items-center gap-2 min-w-0">
        {iconSrc ? (
          <Image alt={pair} className="rounded-full shrink-0" height={24} src={iconSrc} width={24} />
        ) : null}
        <span className="font-medium truncate">{pair}</span>
      </div>
    );
  };

  const renderActionBadge = (action: string) => {
    const colorClass =
      action === "BUY"
        ? "bg-green-500 dark:bg-green-600"
        : action === "WAIT"
        ? "bg-yellow-500 dark:bg-yellow-600"
        : "bg-blue-500 dark:bg-blue-600";
    return (
      <Badge className={`${colorClass} text-white`} variant="secondary">
        {action}
      </Badge>
    );
  };

  const renderRisk = (riskAssessment: string) => {
    const value = riskAssessment?.toString() || "-";
    const isHigh = value.toLowerCase().includes("high");
    const isLow = value.toLowerCase().includes("low");
    return (
      <div className="flex items-center gap-2">
        {isHigh && <ArrowUpIcon className="shrink-0 text-red-500" size={18} />}
        {isLow && <ArrowDownIcon className="shrink-0 text-green-500" size={18} />}
        <span className="text-sm">{isHigh ? "HIGH" : isLow ? "LOW" : value}</span>
      </div>
    );
  };

  const renderConfidence = (confidence: string) => {
    const colorClass =
      confidence === "HIGH"
        ? "bg-green-500 dark:bg-green-600"
        : confidence === "LOW"
        ? "bg-red-500 dark:bg-red-600"
        : "bg-blue-500 dark:bg-blue-600";
    return (
      <Badge className={`${colorClass} text-white`} variant="secondary">
        {confidence}
      </Badge>
    );
  };

  const renderDate = (createdAt: DecisionsTradingCard["createdAt"]) => {
    if (!createdAt) return "-";
    try {
      return format(createdAt, "MMMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  /** ---------- Pagination: support both shapes ---------- */
  // prefer explicit pageCount/pageIndex if present; otherwise fall back to totalPages/page (1-based)
  const providedPageCount =
    typeof (pagination as any)?.pageCount === "number"
      ? (pagination as any).pageCount
      : (pagination as any)?.totalPages;

  const providedIndex =
    typeof (pagination as any)?.pageIndex === "number"
      ? (pagination as any).pageIndex // 0-based
      : typeof (pagination as any)?.page === "number"
      ? (pagination as any).page // 1-based
      : 0;

  const isOneBased = typeof (pagination as any)?.page === "number";
  const pageCount = Math.max(0, Number(providedPageCount ?? 0));
  const pageIndex = Math.max(0, Number(isOneBased ? providedIndex - 1 : providedIndex)); // internal 0-based

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < Math.max(0, pageCount - 1);

  const toParentIndex = (zero: number) => (isOneBased ? zero + 1 : zero);
  const onPageChange = (pagination as any)?.onPageChange as ((p: number) => void) | undefined;

  const goPrev = () => canPrev && onPageChange?.(toParentIndex(pageIndex - 1));
  const goNext = () => canNext && onPageChange?.(toParentIndex(pageIndex + 1));
  const goTo = (zero: number) => onPageChange?.(toParentIndex(zero));

  return (
    <div className="space-y-4">
      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60 overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Separator />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No trading decisions to display.
          </CardContent>
        </Card>
      )}

      {/* Cards */}
      {!loading &&
        items.map((row) => (
          <Card key={row.id} className="border-border/60 overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              {renderPair(row.pair)}
              {renderActionBadge(row.action)}
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 opacity-70" />
                  <span>Tx. Date:</span>
                </div>
                <span className="font-medium text-foreground">
                  {renderDate(row.createdAt)}
                </span>
                <Separator className="h-4" orientation="vertical" />
                <span className="opacity-75">Model Consensus:</span>
                <span className="font-medium text-foreground">
                  {row.modelAgreement || "N/A"}
                </span>
              </div>

              <Separator />

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs text-muted-foreground">Pair Selection</div>
                  <div className="text-sm text-foreground break-words">{row.pairSelection}</div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs text-muted-foreground">Risk Assessment</div>
                  <div className="text-sm text-foreground">{renderRisk(row.riskAssessment)}</div>
                </div>

                <div className="space-y-1.5 sm:col-span-2 min-w-0">
                  <div className="text-xs text-muted-foreground">Technical Analysis</div>
                  <div className="text-sm text-foreground break-words">
                    {replaceMultipleWords(row.technicalAnalysis, { gpt: "", DeepSeek: "" })}
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div>{renderConfidence(row.confidence)}</div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs text-muted-foreground">Market Condition</div>
                  <div className="text-sm text-foreground break-words">{row.marketCondition}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Pagination (renders if we have >= 1 page) */}
      {!loading && items.length > 0 && pagination && pageCount >= 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={!canPrev}
                className={!canPrev ? "pointer-events-none opacity-50" : ""}
                tabIndex={!canPrev ? -1 : 0}
                onClick={goPrev}
              />
            </PaginationItem>

            {/* windowed page links (internal 0-based math; labels 1-based) */}
            {pageCount > 0 && (
              <>
                {Array.from({ length: pageCount })
                  .slice(Math.max(0, pageIndex - 2), Math.min(pageCount, pageIndex + 3))
                  .map((_, idx) => {
                    const first = Math.max(0, pageIndex - 2);
                    const zero = first + idx;
                    const label = zero + 1;
                    return (
                      <PaginationItem key={zero}>
                        <PaginationLink isActive={zero === pageIndex} onClick={() => goTo(zero)}>
                          {label}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                {pageIndex + 3 < pageCount && (
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
                onClick={goNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
