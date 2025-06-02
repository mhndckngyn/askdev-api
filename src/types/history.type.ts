export enum HistoryType {
  QUESTION_CREATE = "QUESTION_CREATE",
  ANSWER_CREATE = "ANSWER_CREATE",
  COMMENT_CREATE = "COMMENT_CREATE",
  QUESTION_EDIT = "QUESTION_EDIT",
  ANSWER_EDIT = "ANSWER_EDIT",
  COMMENT_EDIT = "COMMENT_EDIT",
  QUESTION_VOTE = "QUESTION_VOTE",
  ANSWER_VOTE = "ANSWER_VOTE",
  COMMENT_VOTE = "COMMENT_VOTE",
  QUESTION_DOWNVOTE = "QUESTION_DOWNVOTE",
  ANSWER_DOWNVOTE = "ANSWER_DOWNVOTE",
  COMMENT_DOWNVOTE = "COMMENT_DOWNVOTE",
  ANSWER_CHOSEN = "ANSWER_CHOSEN",
  REPORT_CREATE = "REPORT_CREATE",
  QUESTION_DELETE = "QUESTION_DELETE",
  ANSWER_DELETE = "ANSWER_DELETE",
  COMMENT_DELETE = "COMMENT_DELETE",
}

export interface HistoryFilters {
  searchQuery?: string;
  types?: HistoryType[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export type CreateHistoryPayload = {
  userId: string;
  type: HistoryType;
  contentTitle: string;
  questionId?: string;
};
