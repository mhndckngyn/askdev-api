import prisma from "@/prisma";
import { uploadMultiple } from "@/config/cloudinary";
import { GetCommentsParam } from "@/types/comment.type";
import { Pagination } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import dayjs from "dayjs";
import { Prisma } from "generated/prisma";
import HistoryService from "./history.service";
import { HistoryType } from "@/types/history.type";

type CreateCommentPayload = {
  userId: string;
  answerId: string;
  content: string;
  imageFiles: Express.Multer.File[];
};

const CommentService = {
  getCommentsByAnswerId: async (answerId: string) => {
    const comments = await prisma.comment.findMany({
      where: { answerId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        content: true,
        images: true,
        createdAt: true,
        upvotes: true,
        downvotes: true,
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return comments;
  },

  createComment: async ({
    userId,
    answerId,
    content,
    imageFiles,
  }: CreateCommentPayload) => {
    const images =
      imageFiles.length > 0 ? await uploadMultiple(imageFiles) : [];

    const comment = await prisma.comment.create({
      data: {
        userId,
        answerId,
        content,
        images,
        createdAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        content: true,
        images: true,
        createdAt: true,
      },
    });

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        userId: true,
        questionId: true,
        question: { select: { title: true } },
      },
    });

    if (answer && answer.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: answer.userId,
          actorId: userId,
          contentTitle: answer.question.title,
          type: "COMMENT",
          questionId: answer.questionId,
        },
      });
    }

    if (answer) {
      await HistoryService.createHistory({
        userId,
        type: HistoryType.COMMENT_CREATE,
        contentTitle: content,
        questionId: answer.questionId,
      });
    }

    return comment;
  },

  getComments: async (params: GetCommentsParam) => {
    const {
      content,
      parentId,
      username,
      hiddenOption,
      startDate,
      endDate,
      page,
      pageSize,
    } = params;

    const createdAtFilter: Record<string, Date> = {};
    if (startDate) {
      createdAtFilter.gte = dayjs(startDate).startOf("day").toDate();
    }
    if (endDate) {
      createdAtFilter.lte = dayjs(endDate).endOf("day").toDate();
    }

    const where: Prisma.CommentWhereInput = {
      ...(content && {
        OR: [
          { content: { contains: content, mode: "insensitive" } },
          { id: { contains: content, mode: "insensitive" } },
        ],
      }),
      ...(parentId && {
        OR: [
          { answerId: parentId },
          {
            answer: {
              questionId: parentId,
            },
          },
        ],
      }),
      ...(hiddenOption !== undefined && {
        isHidden: hiddenOption,
      }),
      ...(username && {
        user: {
          username: { contains: username },
        },
      }),
      ...(Object.keys(createdAtFilter).length > 0 && {
        createdAt: createdAtFilter,
      }),
    };

    const skip = (page - 1) * pageSize;

    const [total, comments] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isHidden: true,
          answerId: true,
          answer: {
            select: {
              content: true,
              questionId: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          upvotes: true,
          downvotes: true,
        },
      }),
    ]);

    const result = comments.map((a) => ({
      id: a.id,
      content: a.content,
      answer: {
        id: a.answerId,
        content: a.answer.content,
      },
      question: {
        id: a.answer.questionId,
      },
      isHidden: a.isHidden,
      votes: a.upvotes - a.downvotes,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt?.toISOString() || "",
      user: a.user,
    }));

    const pagination: Pagination = {
      total,
      count: result.length,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      comments: result,
      pagination,
    };
  },

  updateComment: async (
    id: string,
    content: string,
    userId: string,
    imageFiles: Express.Multer.File[]
  ) => {
    const existing = await prisma.comment.findUnique({
      where: { id },
      include: {
        answer: {
          select: {
            questionId: true,
            question: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "api:comment.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:comment.forbidden", true);
    }

    const images =
      imageFiles.length > 0 ? await uploadMultiple(imageFiles) : [];

    await prisma.commentEdit.create({
      data: {
        commentId: id,
        previousContent: existing.content,
        previousImages: existing.images ?? [],
        createdAt: existing.updatedAt ?? existing.createdAt,
      },
    });

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content,
        images,
        updatedAt: new Date(),
      },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.COMMENT_EDIT,
      contentTitle: content,
      questionId: existing.answer.questionId,
    });

    return updated;
  },

  deleteComment: async (id: string, userId: string) => {
    const existing = await prisma.comment.findUnique({
      where: { id },
      include: {
        answer: {
          select: {
            questionId: true,
            question: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "api:comment.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:comment.forbidden", true);
    }

    const comment = await prisma.comment.delete({
      where: { id },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.COMMENT_DELETE,
      contentTitle: comment.content,
      questionId: existing.answer.questionId,
    });

    return comment;
  },

  voteComment: async (userId: string, commentId: string, type: number) => {
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        content: true,
        answer: {
          select: {
            questionId: true,
            question: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!comment) throw new ApiError(404, "comment.not-found", true);

    if (comment.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: comment.userId,
          actorId: userId,
          contentTitle: comment.content,
          questionId: comment.answer.questionId,
          type: "COMMENT_VOTE",
        },
      });
    }

    let action = "";
    let historyType: "COMMENT_VOTE" | "COMMENT_DOWNVOTE" | null = null;

    if (existingVote) {
      if (existingVote.type === type) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
        });

        await prisma.comment.update({
          where: { id: commentId },
          data: {
            upvotes: {
              decrement: type === 1 ? 1 : 0,
            },
            downvotes: {
              decrement: type === -1 ? 1 : 0,
            },
          },
        });

        action = "removed";
      } else {
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: { type },
        });

        await prisma.comment.update({
          where: { id: commentId },
          data: {
            upvotes: {
              increment: type === 1 ? 1 : -1,
            },
            downvotes: {
              increment: type === -1 ? 1 : -1,
            },
          },
        });

        action = "changed";
        historyType = type === 1 ? "COMMENT_VOTE" : "COMMENT_DOWNVOTE";
      }
    } else {
      await prisma.commentVote.create({
        data: {
          userId,
          commentId,
          type,
        },
      });

      await prisma.comment.update({
        where: { id: commentId },
        data: {
          upvotes: {
            increment: type === 1 ? 1 : 0,
          },
          downvotes: {
            increment: type === -1 ? 1 : 0,
          },
        },
      });

      action = "created";
      historyType = type === 1 ? "COMMENT_VOTE" : "COMMENT_DOWNVOTE";
    }

    if (historyType && comment.answer.question) {
      await HistoryService.createHistory({
        userId,
        type: historyType as HistoryType,
        contentTitle: comment.content,
        questionId: comment.answer.questionId,
      });
    }

    return { action };
  },

  getVoteStatus: async (userId: string, commentId: string) => {
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (!existingVote) {
      return { status: "none" };
    }
    return { status: existingVote.type === 1 ? "like" : "dislike" };
  },

  toggleHideComment: async (ids: string[], hidden: boolean) => {
    // prisma trả về số bản ghi được cập nhật
    const result = await prisma.comment.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isHidden: hidden,
      },
    });

    return result;
  },
};

export default CommentService;
