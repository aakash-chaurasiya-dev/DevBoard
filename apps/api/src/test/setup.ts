import 'dotenv/config';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '4000';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.REDIS_URL ??= 'redis://localhost:6379';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
}
