export interface TokenPayload {
  id: string;
  role: string;
  username: string;
  avatar: string;
}

export type OAuthProvider = 'GITHUB' | 'GOOGLE';
