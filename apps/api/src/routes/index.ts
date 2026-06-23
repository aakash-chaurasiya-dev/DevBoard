import { Router } from 'express';
import 'dotenv/config.js';
import { pingRedis } from '../lib/redis.js';
import authRouter from './auth.routes.js';

export const router = Router();

router.get('/health', async (_req, res) => {
  const redisOk = await pingRedis();

  res.status(200).json({
    status: 'ok',
    service: 'devboard-api',
    version: 'v1',
    redis: redisOk ? 'ok' : 'unavailable',
  });
});

router.use('/auth', authRouter);

export default router;
