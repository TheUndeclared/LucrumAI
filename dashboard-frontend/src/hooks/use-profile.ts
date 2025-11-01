import {
  useIsFetching,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { withdrawCustodialWallet } from "@/lib/actions/custodial-wallet";

export default function useProfile() {
  // Access the client
  const queryClient = useQueryClient();

  // Mutation create expense
  const withdrawCustodialWalletMutation = useMutation({
    mutationFn: async ({
      targetAddress,
      token,
      amount,
      tokenStandard,
    }: {
      targetAddress: string;
      token: { mint: string };
      amount: string | number;
      tokenStandard: "SPL20" | "SPL22" | "SOL";
    }) => {
      return await withdrawCustodialWallet(
        targetAddress,
        token.mint,
        parseFloat(amount.toString()),
        tokenStandard
      );
    },
    onSuccess: (data) => {
      toast.success("Withdrawal successful!");
      console.log("Withdraw response:", data);
      queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] });
      queryClient.invalidateQueries({ queryKey: ["custodialWalletDetails"] });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Withdrawal failed!");
      console.error("Withdraw error:", error);
    },
  });

  // Function to refetch profile data
  const refetchProfile = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] }),
      queryClient.invalidateQueries({ queryKey: ["custodialWalletDetails"] }),
      queryClient.invalidateQueries({ queryKey: ["tradingHistory"] }),
      queryClient.invalidateQueries({ queryKey: ["lendingHistory"] }),
    ]);
  };

  // Track fetching state of all profile queries
  const isWalletFetching =
    useIsFetching({ queryKey: ["custodialWalletDetails"] }) > 0;
  const isWithdrawFetching =
    useIsFetching({ queryKey: ["withdrawHistory"] }) > 0;
  const isTradingHistoryFetching =
    useIsFetching({ queryKey: ["tradingHistory"] }) > 0;
  const isLendingHistoryFetching =
    useIsFetching({ queryKey: ["lendingHistory"] }) > 0;
  const isFetchingProfile = isWalletFetching || isWithdrawFetching || isTradingHistoryFetching || isLendingHistoryFetching;

  return {
    withdrawCustodialWallet: withdrawCustodialWalletMutation.mutateAsync,
    isWithdrawPending: withdrawCustodialWalletMutation.isPending,
    refetchProfile,
    isFetchingProfile,
  };
}
