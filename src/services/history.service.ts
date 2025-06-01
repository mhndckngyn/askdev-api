import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

enum HistoryType {
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

interface HistoryFilters {
  searchQuery?: string;
  types?: HistoryType[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

const HistoryService = {
  getAllByUserId: async (
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: HistoryFilters
  ) => {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters?.searchQuery) {
      where.contentTitle = {
        contains: filters.searchQuery,
        mode: "insensitive",
      };
    }

    if (filters?.types && filters.types.length > 0) {
      where.type = {
        in: filters.types,
      };
    }

    if (filters?.dateRange?.start || filters?.dateRange?.end) {
      where.createdAt = {};
      if (filters.dateRange.start) {
        where.createdAt.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [items, total] = await Promise.all([
      prisma.history.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.history.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + items.length < total,
      },
    };
  },

  deleteById: async (id: string, userId: string) => {
    const historyItem = await prisma.history.findUnique({ where: { id } });
    if (!historyItem || historyItem.userId !== userId)
      throw new ApiError(404, "api:history.not-found-or-no-permission");

    await prisma.history.delete({ where: { id } });
    return { message: "api:history.deleted-success" };
  },

  deleteMultiple: async (ids: string[], userId: string) => {
    const items = await prisma.history.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    const invalidItems = items.filter((item) => item.userId !== userId);
    if (invalidItems.length > 0) {
      throw new ApiError(403, "api:history.no-permission-some-items");
    }

    if (items.length !== ids.length) {
      throw new ApiError(404, "api:history.some-items-not-found");
    }

    await prisma.history.deleteMany({
      where: { id: { in: ids }, userId },
    });

    return {
      message: "api:history.deleted-multiple-success",
      deletedCount: items.length,
    };
  },

  deleteAll: async (userId: string) => {
    const result = await prisma.history.deleteMany({ where: { userId } });
    return {
      message: "api:history.deleted-all-success",
      deletedCount: result.count,
    };
  },

  create: async (data: {
    type: HistoryType;
    userId: string;
    contentTitle: string;
    questionId?: string;
  }) => {
    return await prisma.history.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  },

  getHistoryTypes: () => {
    return Object.values(HistoryType);
  },
};

export default HistoryService;
