import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import axios from 'axios';
import bs58 from 'bs58';
import { logger } from '@utils/logger';
import config from '@config';
import BaseService from './baseService.service';
import { TradingHistory } from '../database/mongodb/models/tradingHistory.model';

interface TradingPair {
  baseToken: {
    symbol: string;
    mint: string;
    decimals: number;
    name: string;
  };
  quoteToken: {
    symbol: string;
    mint: string;
    decimals: number;
    name: string;
  };
  enabled: boolean;
}

interface TradeResult {
  success: boolean;
  txIds?: string[];
  error?: string;
  expectedOutput?: number;
  actualOutput?: number;
  pair?: string;
  recordId?: string;
}

interface TokenBalance {
  symbol: string;
  mint: string;
  balance: number;
  decimals: number;
}

class SolanaTrading extends BaseService {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private availablePairs: Record<string, TradingPair> = {};
  private rpcEndpoint: string;
  private raydiumConfig: any;

  constructor() {
    super(TradingHistory);
    
    // Initialize from config
    this.rpcEndpoint = config.trading.rpc.endpoint;
    this.raydiumConfig = config.trading.raydium;
    this.availablePairs = config.trading.pairs;
    
    this.connection = new Connection(this.rpcEndpoint, 'confirmed');
    this.initializeWallet();
    this.logAvailablePairs();
  }

  private initializeWallet(): void {
    try {
      if (!config.trading.privateKey) {
        logger.warn({
          message: 'Solana private key not configured. Trading will be disabled.',
          labels: { origin: 'SolanaTrading' }
        });
        return;
      }

      const secretKey = bs58.decode(config.trading.privateKey);
      this.wallet = Keypair.fromSecretKey(secretKey);
      
      logger.info({
        message: 'Solana wallet initialized successfully',
        wallet: this.wallet.publicKey.toString(),
        labels: { origin: 'SolanaTrading' }
      });
    } catch (error) {
      logger.error({
        message: `Failed to initialize Solana wallet: ${error.message}`,
        labels: { origin: 'SolanaTrading' }
      });
    }
  }

  private logAvailablePairs(): void {
    const enabledPairs = Object.entries(this.availablePairs)
      .filter(([_, pair]) => pair.enabled)
      .map(([pairName, pair]) => ({
        name: pairName,
        base: pair.baseToken.symbol,
        quote: pair.quoteToken.symbol
      }));

    logger.info({
      message: 'Initialized Solana Trading Service',
      rpcEndpoint: this.rpcEndpoint,
      enabledPairs,
      totalPairs: enabledPairs.length,
      labels: { origin: 'SolanaTrading' }
    });
  }

  private async getPriorityFee(): Promise<number> {
    try {
      const { data } = await axios.get(`${this.raydiumConfig.baseHost}${this.raydiumConfig.priorityFeeEndpoint}`);
      return data.data.default.h; // high priority
    } catch (e) {
      logger.warn({
        message: 'Failed to get priority fee, using default',
        labels: { origin: 'SolanaTrading' }
      });
      return 100000; // fallback priority fee
    }
  }

  private async getTokenAccount(mint: string, owner: PublicKey): Promise<string | null> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(new PublicKey(mint), owner);
      return tokenAccount.toBase58();
    } catch (e) {
      return null;
    }
  }

  private async checkTransaction(txId: string): Promise<boolean> {
    try {
      logger.info({
        message: `Checking transaction: ${txId}`,
        labels: { origin: 'SolanaTrading' }
      });

      const transaction = await this.connection.getTransaction(txId, {
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction) {
        logger.info({
          message: 'Transaction not found or still processing',
          txId,
          labels: { origin: 'SolanaTrading' }
        });
        return false;
      }
      
      if (transaction.meta?.err) {
        logger.error({
          message: 'Transaction failed',
          txId,
          error: transaction.meta.err,
          labels: { origin: 'SolanaTrading' }
        });
        return false;
      }
      
      logger.info({
        message: 'Transaction succeeded',
        txId,
        labels: { origin: 'SolanaTrading' }
      });
      return true;
    } catch (e) {
      logger.error({
        message: 'Could not verify transaction status',
        txId,
        error: e.message,
        labels: { origin: 'SolanaTrading' }
      });
      return false;
    }
  }

  /**
   * Get trading pair configuration by name
   */
  private getTradingPair(pairName: string): TradingPair | null {
    const normalizedPairName = pairName.toUpperCase().replace(/[/_-]/g, '_');
    
    // Try exact match first
    if (this.availablePairs[normalizedPairName] && this.availablePairs[normalizedPairName].enabled) {
      return this.availablePairs[normalizedPairName];
    }
    
    // Try to find by base_quote pattern
    for (const [configPairName, pairConfig] of Object.entries(this.availablePairs)) {
      if (pairConfig.enabled) {
        const baseSymbol = pairConfig.baseToken.symbol;
        const quoteSymbol = pairConfig.quoteToken.symbol;
        
        if (normalizedPairName === `${baseSymbol}_${quoteSymbol}` || 
            normalizedPairName === `${baseSymbol}${quoteSymbol}` ||
            normalizedPairName === `${baseSymbol}_USD` && quoteSymbol.includes('USD')) {
          return pairConfig;
        }
      }
    }
    
    logger.warn({
      message: 'Trading pair not found or disabled',
      requestedPair: pairName,
      normalizedPair: normalizedPairName,
      availablePairs: Object.keys(this.availablePairs),
      labels: { origin: 'SolanaTrading' }
    });
    
    return null;
  }

  /**
   * Execute a trade based on LLM decision
   * @param action - 'BUY' or 'SELL'
   * @param pair - Trading pair (e.g., 'SOL_USDT', 'BTC_USDT', 'SOL_USD')
   * @param amount - Amount to trade
   * @param decisionId - ID of the LLM decision that triggered this trade
   */
  public async executeTrade(
    action: 'BUY' | 'SELL', 
    pair: string, 
    amount: number,
    decisionId?: string
  ): Promise<TradeResult> {
    if (!this.wallet) {
      const error = 'Wallet not initialized. Cannot execute trade.';
      logger.error({
        message: error,
        labels: { origin: 'SolanaTrading' }
      });
      return { success: false, error };
    }

    try {
      logger.info({
        message: `Executing ${action} order for ${amount} tokens`,
        action,
        pair,
        amount,
        decisionId,
        labels: { origin: 'SolanaTrading' }
      });

      // Get trading pair configuration
      const tradingPair = this.getTradingPair(pair);
      if (!tradingPair) {
        const error = `Trading pair ${pair} not found or disabled`;
        logger.error({
          message: error,
          labels: { origin: 'SolanaTrading' }
        });
        return { success: false, error };
      }

      // Determine input/output tokens based on action
      let inputToken: any, outputToken: any;
      if (action === 'BUY') {
        // Buying base token with quote token (e.g., buying SOL with USDT)
        inputToken = tradingPair.quoteToken;
        outputToken = tradingPair.baseToken;
      } else {
        // Selling base token for quote token (e.g., selling SOL for USDT)
        inputToken = tradingPair.baseToken;
        outputToken = tradingPair.quoteToken;
      }

      // Convert amount to smallest units
      const rawAmount = Math.floor(amount * Math.pow(10, inputToken.decimals));
      
      logger.info({
        message: `Swapping ${amount} ${inputToken.symbol} for ${outputToken.symbol}`,
        inputToken: inputToken.symbol,
        outputToken: outputToken.symbol,
        rawAmount,
        inputMint: inputToken.mint,
        outputMint: outputToken.mint,
        labels: { origin: 'SolanaTrading' }
      });

      // Step 1: Get quote from Raydium API
      logger.info({
        message: 'Getting quote from Raydium API',
        labels: { origin: 'SolanaTrading' }
      });

      const slippageBps = config.trading.risk.slippageBps;
      const { data: swapResponse } = await axios.get(
        `${this.raydiumConfig.swapHost}/compute/swap-base-in?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${rawAmount}&slippageBps=${slippageBps}&txVersion=V0`
      );
      
      const expectedOutput = swapResponse.data.outputAmount / Math.pow(10, outputToken.decimals);
      
      logger.info({
        message: `Quote received. Expected output: ${expectedOutput.toFixed(6)} ${outputToken.symbol}`,
        expectedOutput,
        slippageBps,
        labels: { origin: 'SolanaTrading' }
      });

      // Step 2: Get priority fee
      const priorityFee = await this.getPriorityFee();
      logger.info({
        message: `Priority fee: ${priorityFee} microLamports`,
        labels: { origin: 'SolanaTrading' }
      });

      // Step 3: Build transaction
      logger.info({
        message: 'Building transaction',
        labels: { origin: 'SolanaTrading' }
      });
      
      // Get token accounts
      const isInputSol = inputToken.mint === "So11111111111111111111111111111111111111112";
      const isOutputSol = outputToken.mint === "So11111111111111111111111111111111111111112";
      
      let inputAccount = null;
      let outputAccount = null;
      
      if (!isInputSol) {
        inputAccount = await this.getTokenAccount(inputToken.mint, this.wallet.publicKey);
      }
      
      if (!isOutputSol) {
        outputAccount = await this.getTokenAccount(outputToken.mint, this.wallet.publicKey);
      }
      
      const swapTransactionsResponse = await axios.post(`${this.raydiumConfig.swapHost}/transaction/swap-base-in`, {
        computeUnitPriceMicroLamports: String(priorityFee),
        swapResponse,
        txVersion: 'V0',
        wallet: this.wallet.publicKey.toBase58(),
        wrapSol: isInputSol,
        unwrapSol: isOutputSol,
        inputAccount: inputAccount,
        outputAccount: outputAccount,
      });
      
      if (!swapTransactionsResponse.data.success) {
        throw new Error(`API Error: ${swapTransactionsResponse.data.message || 'Unknown error'}`);
      }
      
      const swapTransactions = swapTransactionsResponse.data;
      logger.info({
        message: `Transaction built (${swapTransactions.data.length} transaction(s))`,
        labels: { origin: 'SolanaTrading' }
      });

      // Step 4: Deserialize and sign transactions
      logger.info({
        message: 'Signing transactions',
        labels: { origin: 'SolanaTrading' }
      });

      const allTxBuf = swapTransactions.data.map((tx: any) => Buffer.from(tx.transaction, 'base64'));
      const allTransactions = allTxBuf.map((txBuf: Buffer) => VersionedTransaction.deserialize(txBuf));

      // Sign all transactions
      allTransactions.forEach(transaction => {
        transaction.sign([this.wallet!]);
      });

      // Step 5: Send and confirm transactions
      logger.info({
        message: 'Sending transactions',
        labels: { origin: 'SolanaTrading' }
      });

      const txIds: string[] = [];
      
      for (let i = 0; i < allTransactions.length; i++) {
        const transaction = allTransactions[i];
        logger.info({
          message: `Sending transaction ${i + 1}/${allTransactions.length}`,
          labels: { origin: 'SolanaTrading' }
        });
        
        const txId = await this.connection.sendTransaction(transaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        
        txIds.push(txId);
        logger.info({
          message: `Transaction ${i + 1} sent: ${txId}`,
          txId,
          labels: { origin: 'SolanaTrading' }
        });
        
        // Wait for confirmation
        try {
          const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
          const confirmation = await this.connection.confirmTransaction(
            {
              signature: txId,
              blockhash,
              lastValidBlockHeight,
            },
            'confirmed'
          );
          
          if (confirmation.value.err) {
            throw new Error(`Transaction ${i + 1} failed: ${JSON.stringify(confirmation.value.err)}`);
          }
          
          logger.info({
            message: `Transaction ${i + 1} confirmed!`,
            txId,
            labels: { origin: 'SolanaTrading' }
          });
        } catch (confirmError) {
          logger.warn({
            message: `Transaction ${i + 1} confirmation timed out, but may still succeed`,
            txId,
            labels: { origin: 'SolanaTrading' }
          });
        }
      }

      // Save successful trade to database
      const tradeRecord = await TradingHistory.create({
        timestamp: new Date(),
        pair,
        action,
        tokenIn: inputToken.symbol,
        tokenOut: outputToken.symbol,
        amountIn: amount.toString(),
        expectedAmountOut: expectedOutput.toString(),
        txHash: txIds.join(','),
        status: 'COMPLETED',
        decisionId,
        message: 'Trade execution completed successfully'
      });

      logger.info({
        message: 'Trade completed successfully and saved to database!',
        pair,
        action,
        inputToken: inputToken.symbol,
        outputToken: outputToken.symbol,
        expectedOutput,
        txIds,
        recordId: tradeRecord.id,
        labels: { origin: 'SolanaTrading' }
      });
      
      return { 
        success: true, 
        txIds,
        expectedOutput,
        pair: `${inputToken.symbol}_${outputToken.symbol}`,
        recordId: tradeRecord.id
      };
      
    } catch (error) {
      logger.error({
        message: 'Trade execution failed',
        error: error.message,
        action,
        pair,
        amount,
        labels: { origin: 'SolanaTrading' }
      });

      // Optionally save failed trades to database for analysis
      try {
        await TradingHistory.create({
          timestamp: new Date(),
          pair,
          action,
          tokenIn: 'UNKNOWN', // We may not have gotten this far
          tokenOut: 'UNKNOWN',
          amountIn: amount.toString(),
          expectedAmountOut: '0',
          status: 'FAILED',
          decisionId,
          error: error.message,
          message: 'Trade execution failed'
        });
      } catch (dbError) {
        logger.warn({
          message: 'Failed to save failed trade record',
          dbError: dbError.message,
          labels: { origin: 'SolanaTrading' }
        });
      }

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get current balances for all configured tokens
   */
  public async getAllBalances(): Promise<TokenBalance[]> {
    if (!this.wallet) {
      return [];
    }

    const balances: TokenBalance[] = [];
    const processedMints = new Set<string>();

    try {
      // Collect all unique tokens from configured pairs
      for (const pairConfig of Object.values(this.availablePairs)) {
        if (!pairConfig.enabled) continue;

        // Add base token
        if (!processedMints.has(pairConfig.baseToken.mint)) {
          processedMints.add(pairConfig.baseToken.mint);
          const balance = await this.getTokenBalance(pairConfig.baseToken);
          balances.push(balance);
        }

        // Add quote token
        if (!processedMints.has(pairConfig.quoteToken.mint)) {
          processedMints.add(pairConfig.quoteToken.mint);
          const balance = await this.getTokenBalance(pairConfig.quoteToken);
          balances.push(balance);
        }
      }

      logger.info({
        message: 'Current balances retrieved',
        balances: balances.map(b => ({
          symbol: b.symbol,
          balance: b.balance.toFixed(6)
        })),
        labels: { origin: 'SolanaTrading' }
      });

      return balances;
    } catch (error) {
      logger.error({
        message: 'Failed to get balances',
        error: error.message,
        labels: { origin: 'SolanaTrading' }
      });
      return [];
    }
  }

  /**
   * Get balance for a specific token
   */
  private async getTokenBalance(token: any): Promise<TokenBalance> {
    try {
      let balance = 0;

      if (token.mint === "So11111111111111111111111111111111111111112") {
        // SOL balance
        const solBalance = await this.connection.getBalance(this.wallet!.publicKey);
        balance = solBalance / Math.pow(10, token.decimals);
      } else {
        // SPL Token balance
        try {
          const tokenAccount = await this.getTokenAccount(token.mint, this.wallet!.publicKey);
          if (tokenAccount) {
            const tokenBalance = await this.connection.getTokenAccountBalance(new PublicKey(tokenAccount));
            balance = parseFloat(tokenBalance.value.amount) / Math.pow(10, token.decimals);
          }
        } catch (e) {
          // Token account might not exist yet
          balance = 0;
        }
      }

      return {
        symbol: token.symbol,
        mint: token.mint,
        balance,
        decimals: token.decimals
      };
    } catch (error) {
      logger.warn({
        message: `Failed to get balance for ${token.symbol}`,
        error: error.message,
        labels: { origin: 'SolanaTrading' }
      });
      return {
        symbol: token.symbol,
        mint: token.mint,
        balance: 0,
        decimals: token.decimals
      };
    }
  }

  /**
   * Get current balances (legacy method for backward compatibility)
   */
  public async getBalances(): Promise<{ sol: number; usdt: number }> {
    const allBalances = await this.getAllBalances();
    
    const solBalance = allBalances.find(b => b.symbol === 'SOL')?.balance || 0;
    const usdtBalance = allBalances.find(b => b.symbol === 'USDT')?.balance || 0;

    return { sol: solBalance, usdt: usdtBalance };
  }

  /**
   * Calculate trade amount based on balance and risk level for a specific pair
   */
  public async calculateTradeAmount(
    action: 'BUY' | 'SELL', 
    pair: string,
    riskLevel: 'HIGH' | 'LOW' = 'LOW'
  ): Promise<number> {
    const tradingPair = this.getTradingPair(pair);
    if (!tradingPair) {
      logger.warn({
        message: 'Cannot calculate trade amount for unknown pair',
        pair,
        labels: { origin: 'SolanaTrading' }
      });
      return 0;
    }

    const allBalances = await this.getAllBalances();
    const percentage = riskLevel === 'HIGH' ? 
      config.trading.risk.highRiskPercentage : 
      config.trading.risk.lowRiskPercentage;
    
    let amount: number;
    let relevantToken: any;
    
    if (action === 'BUY') {
      // Calculate based on quote token balance (how much quote token to spend)
      relevantToken = tradingPair.quoteToken;
      const quoteBalance = allBalances.find(b => b.mint === relevantToken.mint)?.balance || 0;
      amount = quoteBalance * percentage;
    } else {
      // Calculate based on base token balance (how much base token to sell)
      relevantToken = tradingPair.baseToken;
      const baseBalance = allBalances.find(b => b.mint === relevantToken.mint)?.balance || 0;
      amount = baseBalance * percentage;
    }

    logger.info({
      message: 'Calculated trade amount',
      action,
      pair,
      riskLevel,
      percentage: `${(percentage * 100).toFixed(1)}%`,
      relevantToken: relevantToken.symbol,
      amount: amount.toFixed(6),
      labels: { origin: 'SolanaTrading' }
    });

    return amount;
  }

  /**
   * Get list of available trading pairs
   */
  public getAvailablePairs(): string[] {
    return Object.entries(this.availablePairs)
      .filter(([_, pair]) => pair.enabled)
      .map(([pairName, _]) => pairName);
  }

  /**
   * Get pair configuration
   */
  public getPairConfig(pairName: string): TradingPair | null {
    return this.getTradingPair(pairName);
  }
}

export default SolanaTrading;