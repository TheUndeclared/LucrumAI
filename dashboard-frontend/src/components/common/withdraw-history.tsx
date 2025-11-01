"use client";

import { ChevronLeft, ChevronRight,History } from "lucide-react";
import { useState } from "react";

// import { getWithdrawHistory } from "@/lib/actions/custodial-wallet";
import { Button } from "@/components/ui/button";
import { useWithdrawHistory } from "@/hooks/use-withdraw-history";

interface WithdrawHistoryProps {
  walletAddress?: string;
}

export default function WithdrawHistory({
  walletAddress,
}: WithdrawHistoryProps) {
  // const [withdrawals, setWithdrawals] = useState<
  //   Array<{
  //     _id: string;
  //     user_id: string;
  //     custodial_wallet_address: string;
  //     target_wallet_address: string;
  //     token_mint: string;
  //     token_standard: string;
  //     amount: number;
  //     transaction_signature: string;
  //     status: "PENDING" | "COMPLETED" | "FAILED";
  //     created_at: string;
  //     updated_at: string;
  //   }>
  // >([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  // const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(5); // Show 5 records per page

  const { data, isLoading, error } = useWithdrawHistory(
    walletAddress,
    currentPage,
    5
  );

  console.log("Withdraw history data:", data);

  // @ts-expect-error need to define type
  const withdrawals = data?.withdrawals ?? [];
  // @ts-expect-error need to define type
  const totalRecords = data?.pagination?.total ?? 0;

  // useEffect(() => {
  //   const fetchWithdrawHistory = async () => {
  //     if (!walletAddress) return;

  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       const offset = currentPage * limit;
  //       const response = await getWithdrawHistory(limit, offset);

  //       console.log("Withdraw history response:", response);

  //       if (response.error) {
  //         setError(response.error);
  //         return;
  //       }

  //       const responseData = response.data as any;
  //       if (responseData?.data?.withdrawals) {
  //         setWithdrawals(responseData.data.withdrawals);
  //         setTotalRecords(responseData.data.pagination.total);
  //       } else {
  //         console.log("No withdrawals found in response:", responseData);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching withdraw history:", error);
  //       setError("Failed to load withdraw history");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchWithdrawHistory();
  // }, [walletAddress, currentPage, limit]);

  if (!walletAddress) return null;

  return (
    <div className="border rounded-md p-4 bg-background">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-muted-foreground text-sm font-medium">
          Withdraw History
        </h3>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading history...</div>
      ) : error ? (
        <div className="text-sm text-red-400">{(error as Error).message}</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No withdraw history found
        </div>
      ) : (
        <div className="space-y-2">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal._id}
              className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/20 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {(() => {
                    // Determine token symbol based on mint address (most reliable)
                    if (withdrawal.token_mint === "So11111111111111111111111111111111111111112") return "SOL";
                    if (withdrawal.token_mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
                    if (withdrawal.token_mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
                    if (withdrawal.token_mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") return "BTC";
                    if (withdrawal.token_mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") return "RAY";
                    if (withdrawal.token_mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") return "JUP";
                    if (withdrawal.token_mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") return "GRASS";
                    if (withdrawal.token_mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") return "ETH";
                    
                    // Fallback to token standard if mint is not recognized
                    if (withdrawal.token_standard === "SOL") return "SOL";
                    return "Unknown";
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">
                  {withdrawal.amount.toFixed(6)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    withdrawal.status === "COMPLETED"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : withdrawal.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>
            </div>
          ))}

          {totalRecords > limit && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Showing {currentPage * limit + 1}-
                {Math.min((currentPage + 1) * limit, totalRecords)} of{" "}
                {totalRecords}
              </div>
              <div className="flex gap-1">
                <Button
                  className="h-7 w-7 p-0 border-border text-muted-foreground hover:text-primary"
                  disabled={currentPage === 0}
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  className="h-7 w-7 p-0 border-border text-muted-foreground hover:text-primary"
                  disabled={(currentPage + 1) * limit >= totalRecords}
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
