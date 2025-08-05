import { cleanEnv, host, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port({ default: 3000 }),
    
    // MongoDB
    MONGODB_URI: str(),
    
    // JWT
    JWT_SECRET: str(),
    JWT_ISSUER: str(),
    JWT_VALID_MINS: str({ default: '3600' }),
    
    // Redis
    REDIS_HOST: host({ default: 'localhost' }),
    REDIS_PORT: port({ default: 6379 }),
    REDIS_PASSWORD: str({ default: '' }),
    
    // AI Services (optional)
    OPENAI_API_KEY: str({ default: '' }),
    DEEPSEEK_API_KEY: str({ default: '' }),
    XAI_API_KEY: str({ default: '' }),
    OPENAI_MODEL: str({ default: 'gpt-4' }),
    BIRDEYE_API_KEY: str({ default: '' }),
    
    // Trading (optional)
    RPC_URL: str({ default: '' }),
    SOLANA_RPC_URL: str({ default: 'https://api.mainnet-beta.solana.com' }),
    PRIVATE_KEY: str({ default: '' }),
    ZERO_EX_API_KEY: str({ default: '' }),
    WALLET_ADDRESS: str({ default: '' }),
    
    // Bull Board
    BULLBOARD_USER: str({ default: 'admin' }),
    BULLBOARD_PASS: str({ default: 'admin' }),
  });
}

export default validateEnv;
