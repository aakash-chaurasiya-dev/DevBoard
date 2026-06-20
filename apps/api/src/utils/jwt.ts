import jwt from 'jsonwebtoken';
import 'dotenv/config.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET is not defined and must be at least 32 characters long'
    );
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1h',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded === 'string' ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}
