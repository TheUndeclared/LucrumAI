"use client";

import React from "react";

import TxActionButtons from "./tx-action-buttons";
import WithdrawHistory from "./withdraw-history";

interface ProfilePortfolioSectionProps {
  totalPnl24Hours: number;
  pnl24Hours: number;
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

export default function ProfilePortfolioSection({
  totalPnl24Hours,
  pnl24Hours,
  walletAddress,
  walletTokens,
  onBalanceRefresh,
}: ProfilePortfolioSectionProps) {
  // Helper function to format PnL value
  const formatPnL = (value: number): string => {
    if (value === 0) return "0";
    
    // For non-zero values, show up to 4 decimal places but remove trailing zeros
    const formatted = value.toFixed(4);
    return parseFloat(formatted).toString();
  };

  return (
    <>
      {/* Total PnL 24h */}
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Total PnL 24h %</h3>
        <div className="text-primary text-2xl">{totalPnl24Hours || 0}%</div>
        {/* <div className="text-primary text-sm">+12.34% (24h)</div> */}
      </div>

      {/* 24h PnL */}
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">24h PnL</h3>
        <div className="text-primary text-2xl">{pnl24Hours >= 0 ? '+' : ''}${formatPnL(pnl24Hours)}</div>
        {/* <div className="text-primary text-sm">+2.61%</div> */}
      </div>

      {/* Action Buttons */}
      <TxActionButtons
        walletAddress={walletAddress}
        walletTokens={walletTokens}
        onBalanceRefresh={onBalanceRefresh}
      />

      {/* Withdraw History */}
      <WithdrawHistory walletAddress={walletAddress} />
    </>
  );
}
