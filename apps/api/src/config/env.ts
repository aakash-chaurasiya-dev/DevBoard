const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'PORT',
  'NODE_ENV',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}

export function getCorsOrigin(): string {
  return process.env.CORS_ORIGIN!.trim();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
