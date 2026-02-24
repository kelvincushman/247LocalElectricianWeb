module.exports = {
  apps: [
    {
      name: '247electrician',
      script: 'static-server.cjs',
      cwd: '/home/ubuntu-server/dev/247LocalElectricianWeb',
      env: {
        NODE_ENV: 'production',
        PORT: 8084,
        API_URL: 'http://localhost:3247',
      },
    },
    {
      name: '247electrician-api',
      script: 'server.js',
      cwd: '/home/ubuntu-server/dev/247LocalElectricianWeb/server',
      env: {
        NODE_ENV: 'production',
        PORT: 3247,
        DB_HOST: 'localhost',
        DB_PORT: 5438,
        DB_NAME: 'electrician_db',
        DB_USER: 'electrician',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'openclaw-gateway',
      interpreter: '/home/ubuntu-server/.nvm/versions/node/v22.22.0/bin/node',
      script: '/home/ubuntu-server/.nvm/versions/node/v22.22.0/bin/openclaw',
      args: 'gateway --port 18789',
      env: {
        OPENCLAW_HOME: '/home/ubuntu-server/.openclaw',
        OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || '',
        PATH: '/home/ubuntu-server/.nvm/versions/node/v22.22.0/bin:' + process.env.PATH,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
