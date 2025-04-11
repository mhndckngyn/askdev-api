import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (!err.silent) {
    console.error(err);
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message =
    err instanceof ApiError ? err.message : 'api:common.internal-server-error';

  res.status(statusCode).json({
    success: false,
    message,
    data: err.data || null,
    error: err.stack,
    statusCode,
  });
}
