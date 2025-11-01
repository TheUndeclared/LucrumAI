"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef,useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getMessage, verifySignedMessage } from "@/lib/actions";
import {
  createCustodialWallet,
  getCustodialWalletStatus,
} from "@/lib/actions/custodial-wallet";

export const SolanaWalletButton = () => {
  const [isClient, setIsClient] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();

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
          console.log({ verifySignedMessage: response });

          if (response?.error || !response.data) {
            console.error("Failed to verify signed message:", response.error);
            toast.error("Failed to verify signed message. Please try again.");
            return;
          }

          // Show "Custodial wallet" confirmation popup if not already created
          if (!response.data.data.custodialWallet.hasCustodialWallet) {
            setOpenConfirmation(true);
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

  // Handle Create Custodial Wallet
  const handleCreateCustodialWallet = useCallback(async () => {
    console.log("Confirmed!");

    if (!publicKey) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const response = await createCustodialWallet(publicKey.toString());
      console.log({ createCustodialWallet: response });

      if (response?.error || !response.data) {
        console.error("Failed to create custodial wallet:", response.error);
        toast.error("Failed to create custodial wallet. Please try again.");
        return;
      }

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error creating custodial wallet:", error);
      toast.error("Error creating custodial wallet");
    }
  }, [publicKey]);

  // Store the latest handleSignMessage function in a ref
  const handleSignMessageRef = useRef(handleSignMessage);
  handleSignMessageRef.current = handleSignMessage;

  // Effect to handle wallet connection and disconnection
  useEffect(() => {
    if (!isClient) return; // Don't run on server side

    if (!connected) {
      // Wallet disconnected - remove auth token and redirect
      Cookies.remove("authToken");
      setHasAuthenticated(false);
      router.push("/");
      return;
    }

    // Wallet connected - check if we need to authenticate
    const checkAndAuthenticate = async () => {
      // Prevent multiple simultaneous authentication attempts
      if (isAuthenticating || hasAuthenticated) return;
      
      const authToken = Cookies.get("authToken");
      
      // If no token exists, we need to authenticate
      if (!authToken) {
        setIsAuthenticating(true);
        setHasAuthenticated(true);
        try {
          await fetchAndSignMessage();
        } finally {
          setIsAuthenticating(false);
        }
        return;
      }

      // If token exists, validate it by making a test API call
      try {
        // Try to fetch custodial wallet status to validate token
        const response = await getCustodialWalletStatus();
        if (response?.error) {
          // Token is invalid, remove it and re-authenticate
          console.log("Invalid token detected, re-authenticating...");
          Cookies.remove("authToken");
          setIsAuthenticating(true);
          setHasAuthenticated(true);
          try {
            await fetchAndSignMessage();
          } finally {
            setIsAuthenticating(false);
          }
        } else {
          // Token is valid, mark as authenticated
          setHasAuthenticated(true);
        }
      } catch (error) {
        // Token validation failed, remove it and re-authenticate
        console.log("Token validation failed, re-authenticating...");
        Cookies.remove("authToken");
        setIsAuthenticating(true);
        setHasAuthenticated(true);
        try {
          await fetchAndSignMessage();
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    const fetchAndSignMessage = async () => {
      // Fetch message from API endpoint
      const response = await getMessage();
      console.log({ getMessage: response });

      if (response?.error || !response.data) {
        console.error("Error fetching message:", response.error);
        toast.error("Error fetching message. Please try again.");
        return;
      }

      // Get the message string
      const { message } = response.data?.data;

      if (!message) {
        toast.error("No message received from the server.");
        return;
      }

      // Sign the message using the ref
      handleSignMessageRef.current(message);
    };

    checkAndAuthenticate();
  }, [connected, router, isClient]); // Only run when connection state changes

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Custodial Wallet status on mount
  useEffect(() => {
    const fetchCustodialWalletStatus = async () => {
      try {
        const response = await getCustodialWalletStatus();
        console.log({ getCustodialWalletStatus: response });

        if (response?.error || !response.data) {
          console.error(
            "Failed to get custodial wallet status:",
            response.error
          );
          return;
        }

        // Show confirmation dialog if no custodial wallet exists
        setOpenConfirmation(!response.data.data.has_custodial_wallet);
      } catch (error) {
        console.error("Error getting custodial wallet status:", error);
      }
    };
    fetchCustodialWalletStatus();
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded" />;
  }

  return (
    <>
      <WalletMultiButton />
      {isAuthenticating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Authenticating...</span>
          </div>
        </div>
      )}
      <AlertDialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
        {/* Popup content */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to create LucrumAI wallet?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will create a custodial wallet where you can deposit for the
              LucrumAI agent to manage your portfolio on your behalf.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="min-w-22">No</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateCustodialWallet}
            >
              Yes, create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
