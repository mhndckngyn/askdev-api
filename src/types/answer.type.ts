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
