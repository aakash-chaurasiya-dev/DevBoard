import { Router } from 'express';

export const router = Router();

router.get('/health', (_req, res) => {
  res
    .status(200)
    .json({ status: 'ok', service: 'devboard-api', version: 'v1' });
});

export default router;
