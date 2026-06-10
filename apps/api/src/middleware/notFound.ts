import type { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json({
      error: 'Not Found',
      code: `ROUTE_NOT_FOUND`,
      statusCode: 404,
      path: req.originalUrl,
    });
}
