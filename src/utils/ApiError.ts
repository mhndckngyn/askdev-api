export class ApiError extends Error {
  statusCode: number;
  data?: any;
  silent?: boolean;

  constructor(statusCode = 500, message: string, silent = false, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.silent = silent;
    Error.captureStackTrace(this, this.constructor);
  }
}
