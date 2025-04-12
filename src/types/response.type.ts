export type ApiResponse<T = any> = {
  success: boolean;
  statusCode: number;
  message?: string;
  content: T | null;
  error?: string;
};
