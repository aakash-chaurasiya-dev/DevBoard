import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(
    `Error occurred while processing request ${req.method} ${req.originalUrl}:`,
    err
  );

  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    message: err.message,
  });
}
