"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

import { getMessage, verifySignedMessage } from "@/lib/actions";

export default function SolanaWalletButton() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle sign message
  const handleSignMessage = useCallback(
    async (message: string) => {
      if (!publicKey || !signMessage) {
        toast.error("Connect wallet first");
        return;
      }

      try {
        const encoded = new TextEncoder().encode(message);

        // Sign the message
        const signed = await signMessage(encoded);

        // Convert to base64 for API transmission
        const sigB64 = Buffer.from(signed).toString("base64");

        toast.success("Message signed successfully");

        try {
          // Verify the signature/signedMessage
          const response = await verifySignedMessage(
            publicKey.toString(),
            sigB64
          );

          if (response?.error || !response.data) {
            console.error("Failed to verify signed message:", response.error);
            toast.error("Failed to verify signed message. Please try again.");
            return;
          }
        } catch (error) {
          console.error("Error verifying signed message:", error);
          toast.error("Error verifying signed message");
        }
      } catch (error) {
        console.error("Error signing message:", error);
        toast.error("Failed to sign message");
      }
    },
    [publicKey, signMessage]
  );

  // Store the latest handleSignMessage function in a ref
  const handleSignMessageRef = useRef(handleSignMessage);
  handleSignMessageRef.current = handleSignMessage;

  // Effect to handle wallet connection and disconnection
  useEffect(() => {
    if (!isClient) return; // Don't run on server side

    if (!connected) {
      // Wallet disconnected - remove auth token and redirect
      Cookies.remove("authToken");

      // Redirect to home page
      router.push("/");
      return;
    }

    // Wallet connected - check if we need to authenticate
    const fetchAndSignMessage = async () => {
      const authToken = Cookies.get("authToken");
      if (authToken) return;

      // Fetch message from API endpoint
      const response = await getMessage();

      if (response?.error || !response.data) {
        console.error("Error fetching message:", response.error);
        toast.error("Error fetching message. Please try again.");
        return;
      }

      // Get the message string
      const { message } = response.data;

      if (!message) {
        toast.error("No message received from the server.");
        return;
      }

      // Sign the message using the ref
      handleSignMessageRef.current(message);
    };
    fetchAndSignMessage();
  }, [connected, router, isClient]); // Removed handleSignMessage from dependencies

  // Don't render anything on server side
  if (!isClient) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded" />;
  }

  return <WalletMultiButton className="px-4" />;
}
