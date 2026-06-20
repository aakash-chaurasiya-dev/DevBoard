import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
      statusCode: 401,
    });
  }

  const [schema, token] = authHeader.split(' ');

  if (schema !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Invalid authentication header',
      code: 'INVALID_AUTHENTICATION_HEADER',
      statusCode: 401,
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_OR_EXPIRED_TOKEN',
      statusCode: 401,
    });
  }
}
