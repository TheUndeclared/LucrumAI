"use client";

import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";

import DepositModal from "@/components/common/deposit-modal";
import WithdrawModal from "@/components/common/withdraw-modal";
import { Button } from "@/components/ui/button";

interface TxActionButtonsProps {
  walletAddress?: string;
  walletTokens?: Array<{
    mint: string;
    balance: string;
    decimals: number;
    symbol: string;
    name: string;
  }>;
  onBalanceRefresh?: () => void; // Add callback for refreshing balances
}

export default function TxActionButtons({
  walletAddress,
  walletTokens,
  onBalanceRefresh,
}: TxActionButtonsProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const handleDepositClick = () => {
    if (!walletAddress) {
      // You could show a toast here if needed
      return;
    }
    setIsDepositModalOpen(true);
  };

  const handleWithdrawClick = () => {
    if (!walletAddress || !walletTokens || walletTokens.length === 0) {
      // You could show a toast here if needed
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  return (
    <>
      <div className="flex gap-4">
        {/* Deposit Button */}
        <Button
          className="w-full h-12 bg-primary hover:bg-primary/90 shadow-[0_0_10px_rgba(34,197,94,0.2)] rounded-lg text-white flex items-center justify-center gap-2"
          disabled={!walletAddress}
          onClick={handleDepositClick}
        >
          <Plus className="text-white" size={16} />
          Deposit
        </Button>

        {/* Withdraw Button */}
        <Button
          className="w-full h-12 bg-[#374151] hover:bg-[#4b5563] rounded-lg text-white flex items-center justify-center gap-2"
          disabled={
            !walletAddress || !walletTokens || walletTokens.length === 0
          }
          onClick={handleWithdrawClick}
        >
          <Minus className="text-white" size={16} />
          Withdraw
        </Button>
      </div>

      {/* Deposit Modal */}
      {walletAddress && (
        <DepositModal
          isOpen={isDepositModalOpen}
          walletAddress={walletAddress}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}

      {/* Withdraw Modal */}
      {walletAddress && walletTokens && (
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          walletTokens={walletTokens}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdrawalSuccess={onBalanceRefresh}
        />
      )}
    </>
  );
}
