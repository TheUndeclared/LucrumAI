"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ComponentProps } from "react";

import { SolanaProvider } from "@/providers/solana-provider";
import WalletProvider from "@/providers/wallet-provider";

export const Providers = ({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) => {
  return (
    <NextThemesProvider {...props}>
      <WalletProvider>
        <SolanaProvider>{children}</SolanaProvider>
      </WalletProvider>
    </NextThemesProvider>
  );
};
