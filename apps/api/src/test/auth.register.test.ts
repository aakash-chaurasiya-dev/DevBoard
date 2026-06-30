import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeWithDb = hasDatabase ? describe : describe.skip;

describeWithDb('auth register and login', () => {
  const app = createApp();
  const testEmail = `register-test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId: string;

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('registers a new user and excludes password from the response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        displayName: 'Register Tester',
      })
      .expect(201);

    userId = response.body.data.id;

    expect(response.body.data.email).toBe(testEmail);
    expect(response.body.data.displayName).toBe('Register Tester');
    expect(response.body.data.password).toBeUndefined();
    expect(response.body.message).toBe('User registered successfully');
  });

  it('rejects duplicate email registration', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(409);

    expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects invalid registration input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.refreshToken).toBeTruthy();
    expect(response.body.data.user.email).toBe(testEmail);
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.message).toBe('Login successful');
  });

  it('returns the same error for unknown email and wrong password', async () => {
    const unknownEmailResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'missing-user@example.com',
        password: testPassword,
      })
      .expect(401);

    const wrongPasswordResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'wrong-password',
      })
      .expect(401);

    expect(unknownEmailResponse.body.code).toBe('INVALID_CREDENTIALS');
    expect(wrongPasswordResponse.body.code).toBe('INVALID_CREDENTIALS');
    expect(unknownEmailResponse.body.error).toBe(
      wrongPasswordResponse.body.error
    );
  });
});

if (!hasDatabase) {
  describe('auth register and login', () => {
    it('skips integration tests when DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
  });
}
