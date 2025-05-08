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

export interface ProfileUpdateData {
  userId: string;
  username: string;
  github: string;
  showGithub: boolean;
  aboutMe: string;
  avatar: Express.Multer.File;
}
