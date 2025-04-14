import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/types/response.type';

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
    err instanceof ApiError ? err.message : 'common.internal-server-error';

  const resBody: ApiResponse = {
    success: false,
    message,
    content: err.data || null,
    error: err.stack,
    statusCode,
  };

  res.status(statusCode).json(resBody);
}
