import { createClient, type RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<void> {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  redisClient = createClient({ url });
  redisClient.on('error', (error) => {
    console.error('Redis client error:', error);
  });

  await redisClient.connect();
}

export async function pingRedis(): Promise<boolean> {
  if (!redisClient?.isOpen) {
    return false;
  }

  const response = await redisClient.ping();
  return response === 'PONG';
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = null;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient?.isOpen) {
    throw new Error('Redis client is not connected');
  }
  return redisClient;
}
