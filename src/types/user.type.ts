import { Tag } from './answer.type';

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

export default interface ProfileGetData {
  info: {
    userId: string;
    username: string;
    avatar: string;
    github?: string;
    bio: string;
  };
  stats: {
    questions: number;
    answers: number;
    upvotesReceived: number;
    joinedOn: string; // ISO date string
  };
  questions: PostPreview[];
  answers: PostPreview[];
  interestTags: InterestTags[];
}

interface PostPreview {
  id: string;
  questionTitle: string;
  upvotes: number;
  tags: Tag[];
  // isSolved: boolean;
  postedOn: string; // ISO date string
}

export interface InterestTags {
  id: string;
  name: string;
  upvotes: number;
  contributions: number;
}

export type ProfileInfo = {
  username: string;
  github: string | null;
  showGithub: boolean;
  profilePicture: string;
  bio: string | null;
  createdAt: Date;
};
