"use client";

import { Check,Copy } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function DepositModal({ isOpen, onClose, walletAddress }: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  // Generate QR code URL using a QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletAddress)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Deposit to Custodial Wallet</DialogTitle>
          <DialogDescription>
            Scan the QR code or copy the address below to deposit funds
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code */}
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <img 
              alt="Wallet Address QR Code"
              className="w-48 h-48"
              src={qrCodeUrl}
            />
          </div>

          {/* Wallet Address */}
          <div className="w-full space-y-3">
            <div className="text-sm text-muted-foreground text-center">
              Wallet Address
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="text-sm text-primary break-all flex-1">
                {walletAddress}
              </code>
              <Button
                className="shrink-0"
                size="sm"
                variant="ghost"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>• Send SOL or any supported tokens to this address</p>
            <p>• Ensure you have enough SOL for transaction fees</p>
            <p>• Deposits will be available for trading once confirmed</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
