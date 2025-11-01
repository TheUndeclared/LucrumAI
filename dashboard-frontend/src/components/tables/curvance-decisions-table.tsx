"use client";

import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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

type CurvanceRow = {
  id: string;
  action: string;
  marketAnalysis?: string;
  riskAssessment?: string;
  confidence: string;
  createdAt?: string | number | Date;
  token?: string; // "Pair"
  supplyApyFormatted?: string; // "APY %"
  reasoning?: string; // "Reasoning"
};

// Accept either 0-based (pageIndex/pageCount) or 1-based (page/totalPages)
type PaginationLike =
  | { pageIndex: number; pageCount: number; onPageChange?: (pageIndex: number) => void }
  | { page: number; totalPages: number; onPageChange?: (page: number) => void }
  | any;

export default function CurvanceDecisionsCards({
  data,
  pagination,
  loading = false,
}: {
  data: CurvanceRow[] | undefined;
  pagination?: PaginationLike;
  loading?: boolean;
}) {
  const items = data || [];

  const renderPair = (raw?: string) => {
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
          <>
            <Image alt={pair} className="rounded-full shrink-0" height={24} src={iconSrc} width={24} />
            <Image alt="Kamino" className="rounded-full shrink-0" height={24} src="/images/kamino.png" width={24} />
          </>
        ) : null}
        <span className="font-medium truncate">{pair}</span>
      </div>
    );
  };

  const renderActionBadge = (action?: string) => {
    if (!action) return "-";
    const colorClass =
      action === "LEND"
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

  const renderConfidence = (confidence?: string) => {
    if (!confidence) return "-";
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

  const renderDate = (createdAt?: CurvanceRow["createdAt"]) => {
    if (!createdAt) return "-";
    try {
      return format(createdAt, "MMMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  /** ---------- Pagination: support both shapes + normalize ---------- */
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

  // ---- UI ----
  return (
    <div className="space-y-4">
      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60 overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Separator />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No Curvance decisions to display.
          </CardContent>
        </Card>
      )}

      {/* Cards + Accordion detail */}
      {!loading &&
        items.map((row) => (
          <Card key={row.id} className="border-border/60 overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                {renderPair(row.token)}
                {renderActionBadge(row.action)}
              </div>

              {/* Meta chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-muted text-foreground" variant="secondary">
                  Tx. Date: {renderDate(row.createdAt)}
                </Badge>
                <Badge className="bg-muted text-foreground" variant="secondary">
                  APY: {row.supplyApyFormatted || "-"}
                </Badge>
                <Badge className="bg-muted text-foreground" variant="secondary">
                  Confidence: {row.confidence || "-"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Separator />
              <Accordion collapsible className="w-full" type="single">
                <AccordionItem value="details">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">
                        View analysis & reasoning
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="p-4 space-y-4">
                      {row.reasoning && (
                        <div className="space-y-1.5">
                          <div className="text-xs text-muted-foreground">Reasoning</div>
                          <div className="text-sm text-foreground break-words">{row.reasoning}</div>
                        </div>
                      )}
                      {row.marketAnalysis && (
                        <div className="space-y-1.5">
                          <div className="text-xs text-muted-foreground">Market Analysis</div>
                          <div className="text-sm text-foreground break-words">{row.marketAnalysis}</div>
                        </div>
                      )}
                      {row.riskAssessment && (
                        <div className="space-y-1.5">
                          <div className="text-xs text-muted-foreground">Risk Assessment</div>
                          <div className="text-sm text-foreground break-words">{row.riskAssessment}</div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div>{renderConfidence(row.confidence)}</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}

      {/* Pagination (renders as long as we know there is at least 1 page) */}
      {!loading && items.length > 0 && pagination && Number.isFinite(pageCount) && pageCount >= 1 && (
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

            {/* windowed page links (internal 0-based; labels 1-based) */}
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
