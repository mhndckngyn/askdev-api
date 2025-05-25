export interface TokenPayload {
  id: string;
  role: string;
  username: string;
  avatar: string;
}

export type OAuthProvider = 'GITHUB' | 'GOOGLE';

export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
