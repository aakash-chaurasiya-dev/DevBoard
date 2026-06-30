import type { Request, Response, NextFunction } from 'express';
import type {
  RegistrationInput,
  LoginInput,
  RefreshTokenInput,
} from '../schemas/auth.schema.js';
import {
  registerUser,
  EmailAlreadyExistsError,
  loginUser,
  InvalidCredentialsError,
  refreshAuthToken,
  InvalidRefreshTokenError,
  logoutUser,
} from '../services/auth.service.js';

export async function register(
  req: Request<unknown, unknown, RegistrationInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      data: user,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return res.status(409).json({
        error: error.message,
        code: 'EMAIL_ALREADY_EXISTS',
        statusCode: 409,
      });
    }
    return next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({
        error: error.message,
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    }
    return next(error);
  }
}

export async function refresh(
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await refreshAuthToken(req.body);

    return res.status(200).json({
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      return res.status(401).json({
        error: error.message,
        code: 'REFRESH_TOKEN_INVALID',
        statusCode: 401,
      });
    }
    return next(error);
  }
}

export async function logout(
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response,
  next: NextFunction
) {
  try {
    await logoutUser(req.body);

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    return next(error);
  }
}
