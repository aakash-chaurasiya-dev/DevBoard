import 'dotenv/config.js';
import { createApp } from './app.js';
import { validateEnv } from './config/env.js';
import { connectRedis } from './lib/redis.js';

async function start() {
  validateEnv();
  await connectRedis();

  const app = createApp();
  const port = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});
