export type GetAnswersParam = {
  content?: string;
  questionId?: string;
  username?: string;
  hiddenOption?: boolean;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
};

export type AnswerForProfile = {
  id: string;
  createdAt: Date;
  question: {
    title: string;
    tags: {
      id: string;
      name: string;
    }[];
  };
  upvotes: number;
  downvotes: number;
};

export type Tag = {
  id: string;
  name: string;
}