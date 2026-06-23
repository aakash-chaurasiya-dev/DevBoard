import { Prisma } from '../generated/prisma/client.js';
import type { User } from '@devboard/types';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, hashToken } from '../utils/hash.js';
import type {
  RegistrationInput,
  LoginInput,
  RefreshTokenInput,
} from '../schemas/auth.schema.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { toUserResponse } from '../utils/user.js';

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('An account with this email already exists');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid or expired refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}

export async function registerUser(input: RegistrationInput): Promise<User> {
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  const hashedPassword = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: input.displayName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return toUserResponse(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new EmailAlreadyExistsError();
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  user: User;
}> {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken(user.id);
  const refreshTokenPayload = verifyRefreshToken(refreshToken);
  const refreshTokenExpiresAt = new Date(refreshTokenPayload.exp * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: toUserResponse(user),
  };
}

export async function refreshAuthToken(input: RefreshTokenInput): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  try {
    const refreshTokenPayload = verifyRefreshToken(input.refreshToken);
    const currentTokenHash = hashToken(input.refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: currentTokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !storedToken ||
      storedToken.expiresAt < new Date() ||
      storedToken.userId !== refreshTokenPayload.userId
    ) {
      throw new InvalidRefreshTokenError();
    }

    const newRefreshToken = signRefreshToken(storedToken.user.id);
    const newRefreshTokenPayload = verifyRefreshToken(newRefreshToken);
    const newRefreshTokenExpiresAt = new Date(
      newRefreshTokenPayload.exp * 1000
    );

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: {
          id: storedToken.id,
        },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          token: hashToken(newRefreshToken),
          expiresAt: newRefreshTokenExpiresAt,
        },
      }),
    ]);

    const accessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      throw error;
    }
    throw new InvalidRefreshTokenError();
  }
}

export async function logoutUser(input: RefreshTokenInput): Promise<void> {
  const tokenHash = hashToken(input.refreshToken);

  await prisma.refreshToken.deleteMany({
    where: { token: tokenHash },
  });
}
