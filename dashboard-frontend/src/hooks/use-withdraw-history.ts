import { useQuery } from "@tanstack/react-query";

import { getWithdrawHistory } from "@/lib/actions/custodial-wallet";

export function useWithdrawHistory(
  walletAddress?: string,
  page = 0,
  limit = 5
) {
  return useQuery({
    queryKey: ["withdrawHistory", walletAddress, page, limit],
    queryFn: async () => {
      if (!walletAddress) return null;
      const offset = page * limit;
      const response = await getWithdrawHistory(limit, offset);

      if (response.error) {
        throw new Error(response.error);
      }

      return (
        response.data?.data ?? { withdrawals: [], pagination: { total: 0 } }
      );
    },
    enabled: !!walletAddress, // don’t run unless walletAddress exists
    // keepPreviousData: true, // smooth pagination
  });
}
