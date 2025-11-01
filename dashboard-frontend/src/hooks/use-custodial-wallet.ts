import { useQuery } from "@tanstack/react-query";

import {
  CustodialWalletDetailsResponse,
  getCustodialWalletDetails,
} from "@/lib/actions/custodial-wallet";

export default function useCustodialWallet() {
  const custodialWalletDetailsQuery = useQuery({
    queryKey: ["custodialWalletDetails"],
    queryFn: async () => {
      const response = await getCustodialWalletDetails();

      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error("Failed to fetch wallet details");
      }

      return response.data.data as CustodialWalletDetailsResponse["data"];
    },
    refetchOnWindowFocus: false, // avoid annoying refetches
  });

  return { custodialWalletDetailsQuery };
}
