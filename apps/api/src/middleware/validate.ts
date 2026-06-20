import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface ValidateSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const bodyResult = schemas.body?.safeParse(req.body);

    if (bodyResult && !bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: z.flattenError(bodyResult.error),
      });
    }

    const paramsResult = schemas.params?.safeParse(req.params);

    if (paramsResult && !paramsResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: z.flattenError(paramsResult.error),
      });
    }

    const queryResult = schemas.query?.safeParse(req.query);

    if (queryResult && !queryResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: z.flattenError(queryResult.error),
      });
    }
    next();
  };
}
