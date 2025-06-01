import prisma from "@/prisma";
import { GetAnswersParam } from "@/types/answer.type";
import { Pagination } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import dayjs from "dayjs";
import { uploadMultiple } from "@/config/cloudinary";
import HistoryService from "./history.service";
import { HistoryType } from "@/types/history.type";

type CreateAnswerPayload = {
  userId: string;
  questionId: string;
  content: string;
  imageFiles: Express.Multer.File[];
};

const AnswerService = {
  getAnswersByQuestionId: async (questionId: string) => {
    const answers = await prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        upvotes: true,
        images: true,
        downvotes: true,
        isChosen: true,
        isHidden: true,
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return answers;
  },

  getAnswers: async (params: GetAnswersParam) => {
    const {
      content,
      questionId,
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

    const where: any = {
      ...(content && {
        content: { contains: content, mode: "insensitive" },
      }),
      ...(questionId && {
        questionId,
      }),
      ...(hiddenOption !== undefined && {
        isHidden: hiddenOption,
      }),
      ...(username && {
        user: {
          username: { equals: username },
        },
      }),
      ...(Object.keys(createdAtFilter).length > 0 && {
        createdAt: createdAtFilter,
      }),
    };

    const skip = (page - 1) * pageSize;

    const [total, answers] = await Promise.all([
      prisma.answer.count({ where }),
      prisma.answer.findMany({
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
          questionId: true,
          question: {
            select: {
              title: true,
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
          comments: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    const result = answers.map((a) => ({
      id: a.id,
      content: a.content,
      question: {
        id: a.questionId,
        title: a.question.title,
      },
      isHidden: a.isHidden,
      comments: a.comments.length,
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
      answers: result,
      pagination,
    };
  },

  getAnswerById: async (id: string) => {
    const answer = await prisma.answer.findUnique({
      where: { id },
    });
    if (!answer) {
      throw new ApiError(404, "api:answer.not-found", true);
    }
    return answer;
  },

  createAnswer: async ({
    userId,
    questionId,
    content,
    imageFiles,
  }: CreateAnswerPayload) => {
    const images =
      imageFiles.length > 0 ? await uploadMultiple(imageFiles) : [];

    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId,
        content,
        images,
        createdAt: new Date(),
      },
      select: {
        id: true,
        content: true,
        images: true,
        createdAt: true,
      },
    });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { userId: true, title: true },
    });

    if (question && question.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: question.userId,
          actorId: userId,
          contentTitle: question.title,
          type: "ANSWER",
          questionId,
        },
      });
    }

    if (question) {
      await HistoryService.createHistory({
        userId,
        type: HistoryType.ANSWER_CREATE,
        contentTitle: answer.content,
        questionId,
      });
    }

    return answer;
  },

  updateAnswer: async (
    id: string,
    content: string,
    userId: string,
    imageFiles: Express.Multer.File[] = []
  ) => {
    const existing = await prisma.answer.findUnique({
      where: { id },
      include: {
        question: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "api:answer.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:answer.forbidden", true);
    }

    const images =
      imageFiles.length > 0 ? await uploadMultiple(imageFiles) : [];

    await prisma.answerEdit.create({
      data: {
        answerId: id,
        previousContent: existing.content,
        previousImages: existing.images ?? [],
        createdAt: existing.updatedAt ?? existing.createdAt,
      },
    });

    const updated = await prisma.answer.update({
      where: { id },
      data: {
        content,
        images,
        updatedAt: new Date(),
      },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.ANSWER_EDIT,
      contentTitle: content,
      questionId: existing.question.id,
    });

    return updated;
  },

  deleteAnswer: async (id: string, userId: string) => {
    const existing = await prisma.answer.findUnique({
      where: { id },
      include: {
        question: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "api:answer.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:answer.forbidden", true);
    }

    await prisma.answerEdit.deleteMany({
      where: { answerId: id },
    });

    const answer = await prisma.answer.delete({
      where: { id },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.ANSWER_DELETE,
      contentTitle: answer.content,
      questionId: existing.question.id,
    });

    return answer;
  },

  voteAnswer: async (userId: string, answerId: string, type: number) => {
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        userId: true,
        content: true,
        questionId: true,
        question: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!answer) throw new ApiError(404, "question.not-found", true);

    if (answer.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: answer.userId,
          actorId: userId,
          contentTitle: answer.content,
          type: "ANSWER_VOTE",
          questionId: answer.questionId,
        },
      });
    }

    let action = "";
    let historyType: "ANSWER_VOTE" | "ANSWER_DOWNVOTE" | null = null;

    if (existingVote) {
      if (existingVote.type === type) {
        await prisma.answerVote.delete({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
        });

        await prisma.answer.update({
          where: { id: answerId },
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
        await prisma.answerVote.update({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
          data: { type },
        });

        await prisma.answer.update({
          where: { id: answerId },
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
        historyType = type === 1 ? "ANSWER_VOTE" : "ANSWER_DOWNVOTE";
      }
    } else {
      await prisma.answerVote.create({
        data: {
          userId,
          answerId,
          type,
        },
      });

      await prisma.answer.update({
        where: { id: answerId },
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
      historyType = type === 1 ? "ANSWER_VOTE" : "ANSWER_DOWNVOTE";
    }

    if (historyType && answer.question) {
      await HistoryService.createHistory({
        userId,
        type: historyType as HistoryType,
        contentTitle: answer.content,
        questionId: answer.questionId,
      });
    }

    return { action };
  },

  getVoteStatus: async (userId: string, answerId: string) => {
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });

    if (!existingVote) {
      return { status: "none" };
    }
    return { status: existingVote.type === 1 ? "like" : "dislike" };
  },

  toggleHideAnswers: async (ids: string[], hidden: boolean) => {
    // prisma trả về số bản ghi được cập nhật
    const result = await prisma.answer.updateMany({
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

  markChosen: async (answerId: string, userId: string) => {
    const answer = await prisma.answer.findFirst({
      where: { id: answerId },
      include: {
        question: { select: { id: true, userId: true, title: true } },
      },
    });

    if (!answer) {
      throw new ApiError(404, "answer.not-found", true);
    }

    if (answer.question.userId !== userId) {
      throw new ApiError(403, "answer.mark-chosen-not-allowed", true);
    }

    try {
      await prisma.$transaction([
        prisma.answer.update({
          where: { id: answer.id },
          data: { isChosen: true },
        }),
        prisma.question.update({
          where: { id: answer.question.id },
          data: { isSolved: true },
        }),
      ]);

      await HistoryService.createHistory({
        userId,
        type: HistoryType.ANSWER_CHOSEN,
        contentTitle: answer.content,
        questionId: answer.question.id,
      });
    } catch (err) {
      throw new ApiError(500, "answer.mark-chosen-unexpected-error");
    }
  },
};

export default AnswerService;
