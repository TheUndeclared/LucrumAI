"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { withdrawCustodialWallet } from "@/lib/actions/custodial-wallet";
import useProfile from "@/hooks/use-profile";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletTokens?: Array<{
    balance: string;
    decimals: number;
    mint: string;
    name: string;
    symbol: string;
  }>;
  onWithdrawalSuccess?: () => void; // Add callback for refreshing balances
}

export default function WithdrawModal({
  isOpen,
  onClose,
  walletTokens,
  onWithdrawalSuccess,
}: WithdrawModalProps) {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<string>("");
  // const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [targetAddress, setTargetAddress] = useState<string>("");

  const { withdrawCustodialWallet, isWithdrawPending } = useProfile();

  const handleClose = () => {
    setAmount("");
    // setIsWithdrawing(false);
    setSelectedToken("");
    setTargetAddress("");
    onClose();
  };

  const handleImportWallet = () => {
    if (publicKey) {
      setTargetAddress(publicKey.toString());
      toast.success("Connected wallet address imported");
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  const handleMaxClick = () => {
    if (selectedToken && walletTokens) {
      const token = walletTokens.find((t) => {
        const tokenSymbol = t.symbol || (() => {
          // Fallback symbol based on mint address
          if (t.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
          if (t.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
          if (t.mint === "So11111111111111111111111111111111111111112") return "SOL";
          return "Unknown";
        })();
        return tokenSymbol === selectedToken;
      });
      if (token) {
        setAmount(token.balance);
      }
    }
  };

  const handleWithdraw = async () => {
    if (!selectedToken || !amount || !targetAddress || !walletTokens) {
      toast.error("Please fill in all fields");
      return;
    }

    const token = walletTokens.find((t) => {
      const tokenSymbol = t.symbol || (() => {
        // Fallback symbol based on mint address
        if (t.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
        if (t.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
        if (t.mint === "So11111111111111111111111111111111111111112") return "SOL";
        if (t.mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") return "BTC";
        if (t.mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") return "RAY";
        if (t.mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") return "JUP";
        if (t.mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") return "GRASS";
        if (t.mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") return "ETH";
        return "Unknown";
      })();
      return tokenSymbol === selectedToken;
    });
    if (!token) {
      toast.error("Token not found");
      return;
    }

    // Determine token standard based on mint address
    let tokenStandard: "SPL20" | "SPL22" | "SOL";
    if (token.mint === "So11111111111111111111111111111111111111112") {
      tokenStandard = "SOL";
    } else {
      // For now, assume SPL20 for other tokens
      // You can enhance this logic based on your needs
      tokenStandard = "SPL20";
    }

    try {
      // setIsWithdrawing(true);

      const response = await withdrawCustodialWallet({
        targetAddress,
        token,
        amount,
        tokenStandard,
      });

      console.log("Full withdrawal response:", response);
      console.log("Response data structure:", {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        nestedDataKeys: response.data?.data
          ? Object.keys(response.data.data)
          : [],
        signature: response.data?.data?.signature,
        message: response.data?.message,
        error: response.data?.error,
        details: response.data?.details,
      });

      if (response.error) {
        toast.error(`Withdrawal failed: ${response.error}`);
        return;
      }

      // Check if the response contains the signature (success indicator)
      // Handle both possible response structures: response.data.signature or response.data.data.signature
      if (response.data?.signature || response.data?.data?.signature) {
        toast.success(
          "Withdrawal successful! Transaction submitted to the network."
        );
        console.log("Withdrawal response:", response.data);

        // Clear form fields
        setAmount("");
        setSelectedToken("");
        setTargetAddress("");

        // Call the callback to refresh balances
        onWithdrawalSuccess?.();

        onClose();
      } else {
        toast.error(`Withdrawal failed due to some reason`);
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
      toast.error("An unexpected error occurred during withdrawal");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">
            Withdraw Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-muted-foreground"
              htmlFor="token"
            >
              Select Token
            </Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Choose a token to withdraw" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {walletTokens?.map((token) => {
                  // Get the display symbol with fallback
                  const displaySymbol = token.symbol || (() => {
                    // Fallback symbol based on mint address
                    if (token.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
                    if (token.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
                    if (token.mint === "So11111111111111111111111111111111111111112") return "SOL";
                    if (token.mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") return "BTC";
                    if (token.mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") return "RAY";
                    if (token.mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") return "JUP";
                    if (token.mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") return "GRASS";
                    if (token.mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") return "ETH";
                    return "Unknown";
                  })();
                  
                  return (
                    <SelectItem key={token.mint} value={displaySymbol}>
                      <div className="flex items-center gap-2">
                        <span>{displaySymbol}</span>
                        <span className="text-muted-foreground text-xs">
                          ({Number(parseFloat(token.balance).toFixed(6))})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-muted-foreground"
              htmlFor="amount"
            >
              Amount
            </Label>
            <div className="flex gap-2">
              <Input
                className="flex-1 bg-background border-border"
                id="amount"
                min="0"
                placeholder="0.00"
                step="any"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button
                className="px-3 border-border text-muted-foreground hover:text-primary"
                disabled={!selectedToken}
                type="button"
                variant="outline"
                onClick={handleMaxClick}
              >
                Max
              </Button>
            </div>
            {selectedToken && walletTokens && (
              <div className="text-xs text-muted-foreground">
                Available:{" "}
                {Number(
                  parseFloat(
                    walletTokens.find((t) => {
                      const tokenSymbol = t.symbol || (() => {
                        // Fallback symbol based on mint address
                        if (t.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
                        if (t.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") return "USDT";
                        if (t.mint === "So11111111111111111111111111111111111111112") return "SOL";
                        if (t.mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") return "BTC";
                        if (t.mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") return "RAY";
                        if (t.mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") return "JUP";
                        if (t.mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") return "GRASS";
                        if (t.mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") return "ETH";
                        return "Unknown";
                      })();
                      return tokenSymbol === selectedToken;
                    })?.balance || "0"
                  ).toFixed(6)
                )}{" "}
                {selectedToken}
              </div>
            )}
          </div>

          {/* Target Wallet Address */}
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-muted-foreground"
              htmlFor="targetAddress"
            >
              Target Wallet Address
            </Label>
            <div className="text-xs text-muted-foreground mb-2">
              Enter recipient wallet address or import your connected wallet
            </div>
            <div className="flex gap-2">
              <Input
                className="flex-1 bg-background border-border"
                id="targetAddress"
                placeholder="Enter Solana wallet address"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
              />
              <Button
                className="px-3 border-border text-muted-foreground hover:text-primary"
                disabled={!publicKey}
                title="Import connected wallet address"
                type="button"
                variant="outline"
                onClick={handleImportWallet}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 border-border text-muted-foreground hover:text-primary"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={
                !selectedToken || !amount || !targetAddress || isWithdrawPending
              }
              onClick={handleWithdraw}
            >
              {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
