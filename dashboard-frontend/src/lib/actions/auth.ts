"use server";

import { fetchWrapper } from "../fetch-wrapper";
import { createSession } from "../session";

type GetMessageResponse = {
  data: {
    message: string;
  };
};

type VerifySignedMessageResponse = {
  data: {
    token: string;
    custodialWallet: {
      createdAt: null;
      hasCustodialWallet: boolean;
      isActive: boolean;
      walletAddress: null;
    };
    user: {
      id: string;
      wallet_address: string;
      createdAt: string;
      updatedAt: string;
    };
  };
};

// Get the message
export const getMessage = async () => {
  // Send request
  const response = await fetchWrapper<GetMessageResponse>("/api/auth/message", {
    method: "GET",
  });

  return response;
};

// Verify the signed message
export const verifySignedMessage = async (
  address: string,
  signedMessage: string
) => {
  // Prepare request data
  const requestData = {
    walletAddress: address,
    signature: signedMessage,
  };

  // Send request
  const response = await fetchWrapper<VerifySignedMessageResponse>(
    "/api/auth/verify",
    {
      method: "POST",
      body: JSON.stringify(requestData),
    }
  );

  if (!response.data.data.token)
    throw new Error("Invalid API response: Token is missing.");

  // Store token in cookie
  await createSession(response.data.data.token);

  return response;
};
