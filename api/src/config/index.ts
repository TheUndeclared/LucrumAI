import 'dotenv/config';

const cfg = {
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL,
  },

  auth: {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    validMins: process.env.JWT_VALID_MINS ? parseInt(process.env.JWT_VALID_MINS) : 3600,
    bullBoard: {
      user: process.env.BULLBOARD_USER,
      pass: process.env.BULLBOARD_PASS,
    },
  },
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  ws: {
    port: process.env.WEBSOCKET_PORT,
  },
  mail: {
    mailName: process.env.MAIL_FROM_NAME,
    mailFromAddress: process.env.MAIL_FROM_ADDRESS,
    frontendUrl: process.env.FRONTEND_URL,
    OAuth: {
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    },
    grok: {
      apiKey: process.env.XAI_API_KEY,
      baseUrl: 'https://api.x.ai/v1',
      model: 'grok-3-beta',
    },

    birdeye: {
      apiKey: process.env.BIRDEYE_API_KEY,
      baseUrl: 'https://public-api.birdeye.so',
    },
  },
  trading: {
    privateKey: process.env.SOLANA_PRIVATE_KEY,
    rpc: {
      endpoint: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    },
    raydium: {
      swapHost: "https://transaction-v1.raydium.io",
      baseHost: "https://api-v3.raydium.io",
      priorityFeeEndpoint: "/compute/priority-fee"
    },
    pairs: {
      SOL_USDT: {
        baseToken: {
          symbol: "SOL",
          mint: "So11111111111111111111111111111111111111112",
          decimals: 9,
          name: "Solana"
        },
        quoteToken: {
          symbol: "USDT",
          mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
          decimals: 6,
          name: "Tether USD"
        },
        enabled: true
      },
      BTC_USDT: {
        baseToken: {
          symbol: "BTC",
          mint: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // Wrapped Bitcoin on Solana
          decimals: 6,
          name: "Wrapped Bitcoin"
        },
        quoteToken: {
          symbol: "USDT",
          mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
          decimals: 6,
          name: "Tether USD"
        },
        enabled: true
      }
    },
    risk: {
      lowRiskPercentage: 0.02,  // 2% of balance
      highRiskPercentage: 0.05, // 5% of balance
      maxDailyTrades: 10,
      slippageBps: 1000 // 10% slippage tolerance
    }
  },
  lending: {
    kamino: {
      apiUrl: 'https://api.kamino.finance',
      programId: 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD',
      cluster: 'mainnet-beta'
    },
    tokens: ['SOL', 'USDC', 'USDT', 'ETH', 'WBTC', 'cbBTC'], // Supported lending tokens
    risk: {
      maxLendingPercentage: 0.30,  // 30% max of portfolio for lending
      minApyThreshold: 0.01,       // 1% minimum APY to consider lending
      maxUtilizationRate: 0.85,    // Don't lend if utilization > 85%
      maxLeverageRatio: 2.0        // Maximum 2x leverage for borrowing
    },
    strategies: {
      conservative: {
        maxAllocation: 0.20,  // 20% of portfolio
        minApy: 0.02,         // 2% minimum APY
        maxUtilization: 0.70  // Avoid high utilization pools
      },
      aggressive: {
        maxAllocation: 0.50,  // 50% of portfolio
        minApy: 0.01,         // 1% minimum APY
        maxUtilization: 0.90  // Accept higher utilization for better APY
      }
    }
  },
};

export default cfg;
