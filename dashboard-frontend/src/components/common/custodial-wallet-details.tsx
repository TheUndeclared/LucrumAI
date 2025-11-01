"use client";

import Image from "next/image";
import React from "react";

// import {
//   CustodialWalletDetailsResponse,
//   getCustodialWalletDetails,
// } from "@/lib/actions/custodial-wallet";
import useCustodialWallet from "@/hooks/use-custodial-wallet";

export default function CustodialWalletDetails() {
  // const [walletDetails, setWalletDetails] = useState<
  //   CustodialWalletDetailsResponse["data"] | null
  // >(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const { custodialWalletDetailsQuery } = useCustodialWallet();

  const walletDetails = custodialWalletDetailsQuery?.data || null;
  const isLoading = custodialWalletDetailsQuery.isLoading;
  const error = custodialWalletDetailsQuery.error
    ? (custodialWalletDetailsQuery.error as Error).message
    : null;

  // useEffect(() => {
  //   // Fetch wallet details from the server
  //   const fetchWalletDetails = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       const response = await getCustodialWalletDetails();
  //       console.log({ getCustodialWalletDetails: response });

  //       if (response.error) {
  //         console.error("Error fetching wallet details:", response.error);
  //         setError(response.error);
  //         return;
  //       } else if (!response.data) {
  //         console.error("Failed to fetch wallet details");
  //         setError("Failed to fetch wallet details");
  //         return;
  //       }

  //       setWalletDetails(response.data.data);
  //     } catch (error) {
  //       console.error("Error fetching wallet details:", error);
  //       setError("Failed to load wallet details");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchWalletDetails();
  // }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Wallet Details</h3>
        <div className="text-primary text-sm">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Wallet Details</h3>
        <div className="text-red-400 text-sm">
          {error === "User in provided token does not exist!"
            ? "Please connect your wallet to view details"
            : error}
        </div>
      </div>
    );
  }

  // Show wallet details if available
  if (!walletDetails) {
    return (
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Wallet Details</h3>
        <div className="text-primary text-sm">No wallet details available</div>
      </div>
    );
  }

  return (
    <>
      {/* Wallet Address */}
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-muted-foreground text-sm">Wallet Address</h3>
        <p className="text-primary text-sm break-all">
          {walletDetails?.wallet_address}
        </p>
      </div>

      {/* SOL Warning Card */}
      {(() => {
        const hasSOL = walletDetails?.tokens?.some(
          (token) =>
            token.mint === "So11111111111111111111111111111111111111112"
        );
        const hasAnyTokens =
          walletDetails?.tokens && walletDetails.tokens.length > 0;

        // Show warning if no tokens at all, or if there are tokens but SOL is missing
        if (!hasAnyTokens || !hasSOL) {
          return (
            <div className="border border-yellow-500/50 rounded-md p-4 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <div className="text-yellow-500 text-lg">⚠️</div>
                <div>
                  <h3 className="text-yellow-500 text-sm font-medium mb-1">
                    SOL Required
                  </h3>
                  <p className="text-yellow-400 text-xs">
                    Please have at least 0.0009 SOL in your wallet to keep your
                    wallet active
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Tokens */}
      <div className="border rounded-md p-4 bg-background space-y-3">
        <h3 className="text-muted-foreground text-sm mb-2">Tokens</h3>
        <div className="space-y-2">
                     {walletDetails?.tokens && walletDetails.tokens.length > 0 ? (
             walletDetails.tokens.map((token) => {
               try {
                 // Validate token data to prevent crashes
                 if (!token || typeof token !== 'object') {
                   console.warn('Invalid token data:', token);
                   return null;
                 }
                 
                 const balance = parseFloat(token.balance || '0');
                 if (isNaN(balance)) {
                   console.warn('Invalid balance for token:', token);
                   return null;
                 }

              return (
                <div
                  key={token.mint}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                                         {/* Token icon with fallback handling */}
                     {(() => {
                       try {
                         // Handle different token symbols and file formats
                         const symbol = token.symbol?.toLowerCase() || 'unknown';
                         const mint = token.mint || '';
                         
                         console.log('Token symbol:', token.symbol, 'Lowercase:', symbol, 'Mint:', mint);
                         
                         // Check by mint address first (most reliable)
                         if (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
                           return (
                             <Image
                               alt={token.symbol || 'USDC'}
                               className="rounded-full"
                               height={20}
                               src="/images/usdc.png"
                               width={20}
                               onError={(e) => {
                                 console.log('USDC image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") {
                           return (
                             <Image
                               alt={token.symbol || 'USDT'}
                               className="rounded-full"
                               height={20}
                               src="/images/usdt.png"
                               width={20}
                               onError={(e) => {
                                 console.log('USDT image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "So11111111111111111111111111111111111111112") {
                           return (
                             <Image
                               alt={token.symbol || 'SOL'}
                               className="rounded-full"
                               height={20}
                               src="/images/solana.avif"
                               width={20}
                               onError={(e) => {
                                 console.log('SOL image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E") {
                           return (
                             <Image
                               alt={token.symbol || 'BTC'}
                               className="rounded-full"
                               height={20}
                               src="/images/btc.png"
                               width={20}
                               onError={(e) => {
                                 console.log('BTC image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R") {
                           return (
                             <Image
                               alt={token.symbol || 'RAY'}
                               className="rounded-full"
                               height={20}
                               src="/images/raydium.png"
                               width={20}
                               onError={(e) => {
                                 console.log('RAY image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN") {
                           return (
                             <Image
                               alt={token.symbol || 'JUP'}
                               className="rounded-full"
                               height={20}
                               src="/images/jupiter.png"
                               width={20}
                               onError={(e) => {
                                 console.log('JUP image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "Grass2wTp2tSyYLu7Hh4a6h3rJzxK4rn3g3c6Hza7bPi") {
                           return (
                             <Image
                               alt={token.symbol || 'GRASS'}
                               className="rounded-full"
                               height={20}
                               src="/images/grass.png"
                               width={20}
                               onError={(e) => {
                                 console.log('GRASS image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (mint === "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs") {
                           return (
                             <Image
                               alt={token.symbol || 'ETH'}
                               className="rounded-full"
                               height={20}
                               src="/images/ethereum.avif"
                               width={20}
                               onError={(e) => {
                                 console.log('ETH image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         
                         // Then check by symbol for known tokens
                         if (symbol === "sol") {
                           return (
                             <Image
                               alt={token.symbol || 'SOL'}
                               className="rounded-full"
                               height={20}
                               src="/images/solana.avif"
                               width={20}
                               onError={(e) => {
                                 console.log('SOL image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "usdt") {
                           return (
                             <Image
                               alt={token.symbol || 'USDT'}
                               className="rounded-full"
                               height={20}
                               src="/images/usdt.png"
                               width={20}
                               onError={(e) => {
                                 console.log('USDT image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "usdc") {
                           return (
                             <Image
                               alt={token.symbol || 'USDC'}
                               className="rounded-full"
                               height={20}
                               src="/images/usdc.png"
                               width={20}
                               onError={(e) => {
                                 console.log('USDC image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "btc" || symbol === "wbtc") {
                           return (
                             <Image
                               alt={token.symbol || 'BTC'}
                               className="rounded-full"
                               height={20}
                               src="/images/btc.png"
                               width={20}
                               onError={(e) => {
                                 console.log('BTC image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "ray") {
                           return (
                             <Image
                               alt={token.symbol || 'RAY'}
                               className="rounded-full"
                               height={20}
                               src="/images/raydium.png"
                               width={20}
                               onError={(e) => {
                                 console.log('RAY image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "jup") {
                           return (
                             <Image
                               alt={token.symbol || 'JUP'}
                               className="rounded-full"
                               height={20}
                               src="/images/jupiter.png"
                               width={20}
                               onError={(e) => {
                                 console.log('JUP image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "grass") {
                           return (
                             <Image
                               alt={token.symbol || 'GRASS'}
                               className="rounded-full"
                               height={20}
                               src="/images/grass.png"
                               width={20}
                               onError={(e) => {
                                 console.log('GRASS image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "eth" || symbol === "weth") {
                           return (
                             <Image
                               alt={token.symbol || 'ETH'}
                               className="rounded-full"
                               height={20}
                               src="/images/ethereum.avif"
                               width={20}
                               onError={(e) => {
                                 console.log('ETH image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         if (symbol === "kamino") {
                           return (
                             <Image
                               alt={token.symbol || 'Kamino'}
                               className="rounded-full"
                               height={20}
                               src="/images/kamino.png"
                               width={20}
                               onError={(e) => {
                                 console.log('Kamino image failed to load');
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = "none";
                               }}
                             />
                           );
                         }
                         
                         // For unknown tokens, don't show any image - just show the symbol
                         console.log('Unknown token, showing symbol only:', token.symbol, 'Mint:', mint);
                         return null;
                         
                       } catch (error) {
                         console.error('Error rendering token icon:', error, 'Token:', token);
                         return null; // Don't crash, just don't show the icon
                       }
                     })()}
                                         <span className="text-white">
                       {token.symbol || (() => {
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
                       })()}
                     </span>
                  </div>
                                     <span className="text-gray-300">
                     {Number(balance.toFixed(6))} {/* Remove trailing zeros */}
                   </span>
                 </div>
               );
               } catch (error) {
                 console.error('Error rendering token:', error, 'Token data:', token);
                 return null; // Skip this token if there's an error
               }
             }).filter(Boolean) // Remove null entries
          ) : (
            <div className="text-gray-400 text-sm">No tokens found</div>
          )}
        </div>
      </div>
    </>
  );
}
