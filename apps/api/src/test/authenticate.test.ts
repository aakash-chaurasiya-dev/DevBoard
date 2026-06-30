import express from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { authenticate } from '../middleware/authenticate.js';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { signAccessToken } from '../utils/jwt.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeWithDb = hasDatabase ? describe : describe.skip;

describeWithDb('authenticate middleware', () => {
  const authApp = createApp();
  const testEmail = `auth-mw-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId: string;
  let accessToken: string;

  const protectedApp = express();
  protectedApp.get('/protected', authenticate, (req, res) => {
    res.status(200).json({
      userId: req.user!.userId,
      email: req.user!.email,
    });
  });

  beforeAll(async () => {
    const registerResponse = await request(authApp)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    userId = registerResponse.body.data.id;
    accessToken = signAccessToken({ userId, email: testEmail });
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('rejects requests without an authorization header', async () => {
    const response = await request(protectedApp).get('/protected').expect(401);

    expect(response.body.code).toBe('NOT_AUTHENTICATED');
  });

  it('rejects malformed authorization headers', async () => {
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', 'Token abc')
      .expect(401);

    expect(response.body.code).toBe('INVALID_TOKEN_FORMAT');
  });

  it('rejects invalid access tokens', async () => {
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.code).toBe('TOKEN_INVALID');
  });

  it('attaches authenticated user context for valid tokens', async () => {
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.userId).toBe(userId);
    expect(response.body.email).toBe(testEmail);
  });
});

if (!hasDatabase) {
  describe('authenticate middleware', () => {
    it('skips integration tests when DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
  });
}
