import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import 'dotenv/config.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenType: 'refresh';
  exp: number;
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

export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'tokenType'>
): string {
  return jwt.sign({ ...payload, tokenType: 'access' }, getJwtSecret(), {
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
    tokenType: 'access',
  };
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, tokenType: 'refresh', jti: randomUUID() },
    getJwtSecret(),
    {
      expiresIn: '7d',
    }
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded === 'string' ||
    typeof decoded.userId !== 'string' ||
    decoded.tokenType !== 'refresh' ||
    typeof decoded.exp !== 'number'
  ) {
    throw new Error('Invalid token payload');
  }
  return {
    userId: decoded.userId,
    tokenType: 'refresh',
    exp: decoded.exp,
  };
}
