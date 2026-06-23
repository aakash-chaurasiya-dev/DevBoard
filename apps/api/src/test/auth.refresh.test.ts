import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeWithDb = hasDatabase ? describe : describe.skip;

describeWithDb('auth refresh and logout', () => {
  const app = createApp();
  const testEmail = `refresh-test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId: string;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        displayName: 'Refresh Tester',
      })
      .expect(201);

    userId = registerResponse.body.data.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  });

  it('rotates refresh tokens and invalidates the previous token', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    const originalRefreshToken = loginResponse.body.data.refreshToken as string;
    const originalAccessToken = loginResponse.body.data.accessToken as string;

    expect(originalRefreshToken).toBeTruthy();
    expect(originalAccessToken).toBeTruthy();

    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: originalRefreshToken })
      .expect(200);

    const rotatedAccessToken = refreshResponse.body.data.accessToken as string;
    const rotatedRefreshToken = refreshResponse.body.data
      .refreshToken as string;

    expect(rotatedAccessToken).toBeTruthy();
    expect(rotatedRefreshToken).toBeTruthy();
    expect(rotatedRefreshToken).not.toBe(originalRefreshToken);

    const accessPayload = verifyAccessToken(rotatedAccessToken);
    expect(accessPayload.userId).toBe(userId);
    expect(accessPayload.email).toBe(testEmail);

    const reuseResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: originalRefreshToken })
      .expect(401);

    expect(reuseResponse.body.code).toBe('REFRESH_TOKEN_INVALID');

    const secondRotationResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rotatedRefreshToken })
      .expect(200);

    expect(secondRotationResponse.body.data.refreshToken).toBeTruthy();
    expect(secondRotationResponse.body.data.refreshToken).not.toBe(
      rotatedRefreshToken
    );
  });

  it('revokes a refresh token on logout', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    const refreshToken = loginResponse.body.data.refreshToken as string;

    await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    const refreshAfterLogout = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    expect(refreshAfterLogout.body.code).toBe('REFRESH_TOKEN_INVALID');
  });

  it('returns success when logging out with an already revoked token', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    const refreshToken = loginResponse.body.data.refreshToken as string;

    await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    const secondLogout = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    expect(secondLogout.body.message).toBe('Logout successful');
  });

  it('returns success when logging out with an invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: 'not-a-valid-token' })
      .expect(200);

    expect(response.body.message).toBe('Logout successful');
  });
});

if (!hasDatabase) {
  describe('auth refresh and logout', () => {
    it('skips integration tests when DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
  });
}
