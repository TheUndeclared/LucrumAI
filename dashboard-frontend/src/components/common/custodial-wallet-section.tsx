"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Plus,Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CustodialWalletDetails from "@/components/common/custodial-wallet-details";
import DeleteCustodialWalletButton from "@/components/common/delete-custodial-wallet-button";
import ProfilePortfolioSection from "@/components/common/profile-portfolio-section";
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
import { Button } from "@/components/ui/button";
import {
  createCustodialWallet,
  CustodialWalletDetailsResponse,
  getCustodialWalletDetails,
  getCustodialWalletStatus,
} from "@/lib/actions/custodial-wallet";

interface CustodialWalletSectionProps {
  // Props are now optional since we fetch data from API
}

export default function CustodialWalletSection({}: CustodialWalletSectionProps) {
  const { connected, publicKey } = useWallet();
  const [hasCustodialWallet, setHasCustodialWallet] = useState<boolean | null>(
    null
  );
  const [walletDetails, setWalletDetails] = useState<
    CustodialWalletDetailsResponse["data"] | null
  >(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const checkWalletStatus = async () => {
      try {
        setIsLoading(true);
        const response = await getCustodialWalletStatus();

        if (response.error) {
          console.error("Error checking wallet status:", response.error);
          setHasCustodialWallet(false);
        } else if (response.data) {
          const hasWallet = response.data.data.has_custodial_wallet;
          const address = response.data.data.wallet_address;
          setHasCustodialWallet(hasWallet);
          setWalletAddress(address);

          // If wallet exists, fetch wallet details
          if (hasWallet) {
            const detailsResponse = await getCustodialWalletDetails();
            if (detailsResponse.data) {
              setWalletDetails(detailsResponse.data.data);
            }
          }
        } else {
          setHasCustodialWallet(false);
        }
      } catch (error) {
        console.error("Error checking wallet status:", error);
        setHasCustodialWallet(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletStatus();
  }, []);

  const refreshWalletDetails = async () => {
    try {
      const detailsResponse = await getCustodialWalletDetails();
      if (detailsResponse.data) {
        setWalletDetails(detailsResponse.data.data);
      }
    } catch (error) {
      console.error("Error refreshing wallet details:", error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);

      if (!connected || !publicKey) {
        toast.error("Please connect your Solana wallet first");
        setOpenCreateDialog(false);
        return;
      }

      const walletAddress = publicKey.toString();
      const response = await createCustodialWallet(walletAddress);

      if (response.error) {
        toast.error(`Failed to create custodial wallet: ${response.error}`);
      } else {
        toast.success("Custodial wallet created successfully!");
        setOpenCreateDialog(false);
        // Refresh the wallet status
        setHasCustodialWallet(true);
        // You might want to fetch wallet details here as well
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create custodial wallet");
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Wallet Status</h3>
        <div className="text-primary text-sm">Checking...</div>
      </div>
    );
  }

  // Show create wallet option if no wallet exists
  if (!hasCustodialWallet) {
    return (
      <>
        <Button variant="secondary"></Button>
        <div className="border rounded-md p-4 bg-background text-center">
          <div className="flex flex-col items-center gap-3">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="text-muted-foreground text-sm mb-2">
                No Custodial Wallet
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {connected
                  ? "Create a custodial wallet to start using LucrumAI's automated trading"
                  : "Connect your Solana wallet first to create a custodial wallet"}
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!connected}
                size="sm"
                onClick={() => setOpenCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {connected ? "Create Wallet" : "Connect Wallet First"}
              </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Do you want to create LucrumAI wallet?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will create a custodial wallet where you can deposit for
                the LucrumAI agent to manage your portfolio on your behalf.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="min-w-22">No</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                disabled={isCreating}
                onClick={handleCreateWallet}
              >
                {isCreating ? "Creating..." : "Yes, create"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Show wallet details and portfolio section if wallet exists
  return (
    <>
      <CustodialWalletDetails />
      <ProfilePortfolioSection
        pnl24Hours={walletDetails?.tradingMetrics?.pnl24Hours || 0}
        totalPnl24Hours={walletDetails?.tradingMetrics?.totalPnl24Hours || 0}
        walletAddress={walletDetails?.wallet_address || walletAddress}
        walletTokens={walletDetails?.tokens}
        onBalanceRefresh={refreshWalletDetails}
      />
      <DeleteCustodialWalletButton hasWallet={hasCustodialWallet} />
    </>
  );
}
