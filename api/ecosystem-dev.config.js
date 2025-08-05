module.exports = {
  apps: [
    {
      name: 'SolTradeAI-dev',
      script: 'build/server.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
