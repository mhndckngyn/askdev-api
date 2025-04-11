export type ApiResponse<T = any> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error?: string;
};
