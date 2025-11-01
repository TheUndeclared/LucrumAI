"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { deactivateCustodialWallet } from "@/lib/actions/custodial-wallet";

interface DeleteCustodialWalletButtonProps {
  hasWallet: boolean;
}

export default function DeleteCustodialWalletButton({ hasWallet }: DeleteCustodialWalletButtonProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Only render if wallet exists
  if (!hasWallet) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deactivateCustodialWallet();
      
      if (response.error) {
        toast.error(`Failed to delete custodial wallet: ${response.error}`);
      } else {
        toast.success("Custodial wallet deleted successfully!");
        setOpenDeleteDialog(false);
        // Refresh the page to show the create wallet option
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast.error("Failed to delete custodial wallet");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-background">
      <h3 className="text-muted-foreground text-sm mb-3">Danger Zone</h3>
      {/* <p className="text-xs text-muted-foreground mb-3">
        This action cannot be undone. All funds will be lost. Please make sure you have withdrawn all funds from the wallet before deleting.
      </p> */}
      <Button
        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-md transition-colors"
        onClick={() => setOpenDeleteDialog(true)}
      >
        Delete Custodial Wallet
      </Button>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custodial Wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All funds will be lost. Please make sure you have withdrawn all funds from the wallet before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="min-w-22">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
