export interface GetQuestionsParam {
  titleKeyword?: string;
  tags?: string[];
  username?: string;
  isAnswered?: boolean;
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
