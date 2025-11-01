import {ILendingHistoryData, ILendingHistoryTable,ITradingHistoryData, ITradingHistoryTable} from '@/types';

// Helper function to get token name from symbol.
const _getTokenName = (symbol: string): string => {
  const tokenMap: { [key: string]: string } = {
    'SOL': 'Solana',
    'USDT': 'Tether USD',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDC': 'USD Coin',
  };
  return tokenMap[symbol] || symbol;
};

// Helper function to format amount with proper precision
const formatAmount = (amount: string): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";
  
  // For very small numbers, show more decimal places
  if (num < 0.0001 && num > 0) {
    return num.toFixed(12).replace(/\.?0+$/, '');
  }
  
  // For regular numbers, show up to 6 decimal places
  return num.toFixed(6).replace(/\.?0+$/, '');
};

// Transform the data for data table
export const transformTradingHistoryData = (
    data: ITradingHistoryData[]
): ITradingHistoryTable[] => {
    return data.map((trade) => {
        // Determine the token being traded (the one we're buying/selling)
        const tradedToken = trade.action === 'BUY' ? trade.tokenOut : trade.tokenIn;
        const tradedAmount = trade.action === 'BUY' ? trade.expectedAmountOut : trade.amountIn;
        
        // Determine the token used for payment (the one we're spending)
        const paymentToken = trade.action === 'BUY' ? trade.tokenIn : trade.tokenOut;
        const paymentAmount = trade.action === 'BUY' ? trade.amountIn : trade.expectedAmountOut;
        
        // Create description
        const actionText = trade.action === 'BUY' ? 'Bought' : 'Sold';
        const txDescription = `${actionText} ${tradedToken} for ${formatAmount(paymentAmount)} ${paymentToken}`;
        
        return {
            id: trade.id,
            txDate: trade.timestamp,
            action: trade.action,
            txDescription,
            amount: formatAmount(tradedAmount),
            token: tradedToken,
            txStatus: trade.status,
            txHash: trade.txHash || '-'
        };
    });
};

// Transform lending history data for data table
export const transformLendingHistoryData = (
    data: ILendingHistoryData[]
): ILendingHistoryTable[] => {
    return data.map((lending) => {
        // Debug logging
        console.log('Lending action:', lending.action, 'Token:', lending.token);
        
        // Map action to display values: DEPOSIT -> LEND, WITHDRAW -> BORROW
        const displayAction = lending.action === 'DEPOSIT' ? 'LEND' : lending.action === 'WITHDRAW' ? 'BORROW' : lending.action;
        
        // Create description
        const actionText = lending.action === 'DEPOSIT' ? 'Lent' : lending.action === 'WITHDRAW' ? 'Withdrew' : 'Borrowed';
        const txDescription = `${actionText} ${lending.token}`;
        
        console.log('Generated description:', txDescription);
        
        // Create pair (token-platform)
        const pair = `${lending.token}-${lending.platform}`;
        
        // Format amount to show decimal values properly
        const amount = parseFloat(lending.amount);
        const formattedAmount = amount === 0 ? '0.000000' : formatAmount(lending.amount);
        
        return {
            id: lending.id,
            txDate: lending.timestamp,
            action: displayAction, // Use mapped action (LEND/BORROW)
            txDescription,
            amount: formattedAmount,
            pair,
            apy: lending.apy,
            status: lending.status,
        };
    });
};