export interface EmailSignupData {
  username: string;
  email: string;
  password: string;
}

export interface GetUsersParam {
  username?: string;
  page: number;
  pageSize: number;
}
