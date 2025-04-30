// cấu trúc response.body trả về cho frontend
export type ApiResponse<T = any> = {
  success: boolean;
  statusCode: number;
  message?: string;
  content: T | null;
  error?: string;
};

export type Pagination = {
  total: number;
  count: number;
  currentPage: number;
  totalPages: number;
};
