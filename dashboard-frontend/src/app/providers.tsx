"use client";

import { SolanaProvider } from "@/providers/solana-provider";
import TanstackProvider from "@/providers/tanstack-provider";
import WalletProvider from "@/providers/wallet-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <TanstackProvider>
        <SolanaProvider>{children}</SolanaProvider>
      </TanstackProvider>
    </WalletProvider>
  );
};
