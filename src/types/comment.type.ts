export type GetCommentsParam = {
  content?: string;
  parentId?: string;
  username?: string;
  hiddenOption?: boolean;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
};
