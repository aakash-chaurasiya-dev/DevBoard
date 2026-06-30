import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

const PASSWORD_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
