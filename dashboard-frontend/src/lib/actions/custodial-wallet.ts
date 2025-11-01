"use server";

import { fetchWrapper } from "../fetch-wrapper";
import { verifySession } from "../session";

type CreateCustodialWalletResponse = {
  message: string;
  data: {
    id: string;
    wallet_address: string;
    user_id: string;
    created_at: string;
  };
};

type CustodialWalletStatusResponse = {
  message: string;
  data: {
    has_custodial_wallet: boolean;
    wallet_address: string;
    wallet_id: string;
    created_at: string;
  };
};

export type CustodialWalletDetailsResponse = {
  message: string;
  data: {
    id: string;
    wallet_address: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    tokens: {
      mint: string;
      balance: string;
      decimals: number;
      symbol: string;
      name: string;
    }[];
    tradingMetrics: {
      totalPnl24Hours: number;
      pnl24Hours: number;
      averageAPY: number;
      tradeCount24h: number;
      successRate24h: string;
      lastUpdated: string;
    };
  };
};

// Create Custodial Wallet
export const createCustodialWallet = async (address: string) => {
  // Prepare request data
  const requestData = {
    walletAddress: address,
  };

  // Access authToken from cookies
  const { authToken } = await verifySession();
  if (!authToken) {
    return { error: "No authentication token found" };
  }

  // Send request
  const response = await fetchWrapper<CreateCustodialWalletResponse>(
    "/api/custodial-wallet/create",
    {
      method: "POST",
      headers: {
        // "x-monetai-auth": `Bearer ${authToken}`,
        "x-monetai-auth": authToken,
      },
      body: JSON.stringify(requestData),
    }
  );

  if (response.error) throw new Error(response.error);

  return response;
};

// Get Custodial Wallet Status
export const getCustodialWalletStatus = async () => {
  // Access authToken from cookies
  const { authToken } = await verifySession();
  if (!authToken) {
    return { error: "No authentication token found" };
  }

  // Send request
  const response = await fetchWrapper<CustodialWalletStatusResponse>(
    "/api/custodial-wallet/status",
    {
      method: "GET",
      headers: {
        "x-monetai-auth": authToken,
      },
    }
  );

  if (response.error) throw new Error(response.error);

  return response;
};

// Get Custodial Wallet Details
export const getCustodialWalletDetails = async () => {
  // Access authToken from cookies
  const { authToken } = await verifySession();
  if (!authToken) {
    return { error: "No authentication token found" };
  }

  // Send request
  const response = await fetchWrapper<CustodialWalletDetailsResponse>(
    "/api/custodial-wallet/details",
    {
      method: "GET",
      headers: {
        "x-monetai-auth": authToken,
      },
    }
  );

  if (response.error) throw new Error(response.error);

  return response;
};

// Deactivate Custodial Wallet
export const deactivateCustodialWallet = async () => {
  try {
    // Access authToken from cookies
    const { authToken } = await verifySession();
    if (!authToken) {
      return { error: "No authentication token found" };
    }

    // Send request
    const response = await fetchWrapper<{ message: string; data: { success: boolean } }>(
      "/api/custodial-wallet/deactivate",
      {
        method: "POST",
        headers: {
          "x-monetai-auth": authToken,
        },
      }
    );

    if (response.error) {
      return { error: response.error };
    }

    return response;
  } catch (error) {
    console.error("Error in deactivateCustodialWallet:", error);
    return { error: "Failed to deactivate custodial wallet" };
  }
};

// Get Trading History
export const getTradingHistory = async (limit: number = 50, offset: number = 0) => {
  try {
    console.log("getTradingHistory called with:", { limit, offset });
    
    // Get auth token directly from cookies without redirect
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    console.log("Auth token found:", !!authToken);
    if (!authToken) {
      return { error: "No authentication token found" };
    }

    // Send request
    const response = await fetchWrapper<{
      message: string;
      data: {
        tradingHistory: Array<{
          _id: string;
          id: string;
          user_id: string;
          custodial_wallet_address: string;
          action: string;
          base_token: string;
          quote_token: string;
          base_amount: string;
          quote_amount: string;
          price: string;
          confidence: number;
          status: string;
          created_at: string;
          updated_at: string;
          transaction_signature?: string;
          error_message?: string;
          llm_decision_id?: string;
        }>;
        pagination: {
          limit: number;
          offset: number;
          total: number;
        };
      };
    }>(
      `/api/custodial-wallet/trading-history?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "x-monetai-auth": authToken,
        },
      }
    );

    console.log("Trading history API response:", response);
    
    if (response.error) {
      console.error("Trading history API error:", response.error);
      return { error: response.error };
    }

    return response;
  } catch (error) {
    console.error("Error in getTradingHistory:", error);
    return { error: "Failed to fetch trading history" };
  }
};

// Get Lending History
export const getLendingHistory = async (limit: number = 50, offset: number = 0) => {
  try {
    // Access authToken from cookies
    const { authToken } = await verifySession();
    if (!authToken) {
      return { error: "No authentication token found" };
    }

    // Send request
    const response = await fetchWrapper<{
      message: string;
      data: {
        lendingHistory: Array<{
          id: string;
          user_id: string;
          custodial_wallet_address: string;
          action: string;
          token: string;
          amount: string;
          apy: number;
          confidence: number;
          status: string;
          created_at: string;
        }>;
        pagination: {
          limit: number;
          offset: number;
          total: number;
        };
      };
    }>(
      `/api/custodial-wallet/lending-history?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "x-monetai-auth": authToken,
        },
      }
    );

    if (response.error) {
      return { error: response.error };
    }

    return response;
  } catch (error) {
    console.error("Error in getLendingHistory:", error);
    return { error: "Failed to fetch lending history" };
  }
};

export const withdrawCustodialWallet = async (
  targetWallet: string,
  tokenMint: string,
  amount: number,
  tokenStandard: "SPL20" | "SPL22" | "SOL"
) => {
  try {
    // Access authToken from cookies
    const { authToken } = await verifySession();
    if (!authToken) {
      return { error: "No authentication token found" };
    }

    const response = await fetchWrapper<{
      // Success response structure (direct from API)
      message?: string;
      data?: {
        signature: string;
        targetWallet: string;
        tokenMint: string;
        amount: number;
        tokenStandard: string;
      };
      // Error response structure (from fetchWrapper)
      error?: string;
      status?: number;
      details?: string;
      errors?: unknown;
      // Alternative success structure
      signature?: string;
    }>(
      "/api/custodial-wallet/withdraw",
      {
        method: "POST",
        headers: {
          "x-monetai-auth": authToken,
        },
        body: JSON.stringify({
          targetWallet,
          tokenMint,
          amount,
          tokenStandard,
        }),
      }
    );

    return response;
  } catch (error) {
    console.error("Error withdrawing from custodial wallet:", error);
    return { error: "Failed to withdraw from custodial wallet" };
  }
};

export const getWithdrawHistory = async (limit: number = 50, offset: number = 0) => {
  try {
    // Access authToken from cookies
    const { authToken } = await verifySession();
    if (!authToken) {
      return { error: "No authentication token found" };
    }

    const response = await fetchWrapper<{
      data: {
        message: string;
        data: {
          withdrawals: Array<{
            _id: string;
            user_id: string;
            custodial_wallet_address: string;
            target_wallet_address: string;
            token_mint: string;
            token_standard: string;
            amount: number;
            transaction_signature: string;
            status: "PENDING" | "COMPLETED" | "FAILED";
            created_at: string;
            updated_at: string;
          }>;
          pagination: {
            limit: number;
            offset: number;
            total: number;
          };
        };
      };
    }>(
      `/api/custodial-wallet/withdrawal-history?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "x-monetai-auth": authToken,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching withdraw history:", error);
    return { error: "Failed to fetch withdraw history" };
  }
};
