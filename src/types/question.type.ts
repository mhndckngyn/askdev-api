export interface GetQuestionsParam {
  titleKeyword?: string;
  tags?: string[];
  username?: string;
  isAnswered?: boolean;
  hiddenOption?: boolean;
  isEdited?: boolean;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
}

export interface GetQuestionReturn {
  id: string;
  title: string;
  tags: {
    id: string;
    name: string;
  }[];
  views: number;
  votes: number; // upvotes - downvotes
  answers: number;
  user: {
    id: string;
    username: string;
  };
  isAnswered: boolean;
  createdAt: string;
  editedAt: string;
}

export type QuestionCreatePayload = {
  userId: string;
  title: string;
  content: string;
  existingTags: string[];
  newTags: string[];
  imageFiles: Express.Multer.File[];
};

export type QuestionUpdatePayload = QuestionCreatePayload & {
  id: string;
  currentImages: string[];
};

export type QuestionForProfile = {
  id: string;
  createdAt: Date;
  title: string;
  upvotes: number;
  downvotes: number;
  tags: {
    id: string;
    name: string;
  }[];
};
