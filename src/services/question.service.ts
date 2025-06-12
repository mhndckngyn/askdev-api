import { uploadMultiple } from "@/config/cloudinary";
import prisma from "@/prisma";
import {
  QuestionCreatePayload,
  GetQuestionsParam,
  QuestionUpdatePayload,
} from "@/types/question.type";
import { Pagination } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import TagService from "./tag.service";
import HistoryService from "./history.service";
import dayjs from "dayjs";
import { HistoryType } from "@/types/history.type";
import { Prisma } from "generated/prisma";

const QuestionService = {
  getQuestionById: async (id: string) => {
    const question = await prisma.question.update({
      data: {
        views: {
          increment: 1,
        },
      },
      where: { id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });
    if (!question) {
      throw new ApiError(404, "api:question.not-found", true);
    }
    return question;
  },

  getQuestionsByTag: async (tagId: string) => {
    const questions = await prisma.question.findMany({
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      select: { name: true, descriptionEn: true, descriptionVi: true },
    });

    return {
      tagName: tag?.name,
      descriptionVi: tag?.descriptionVi,
      descriptionEn: tag?.descriptionEn,
      questions,
    };
  },

  getQuestions: async (params: GetQuestionsParam) => {
    const {
      titleKeyword,
      tags,
      username,
      isAnswered,
      hiddenOption,
      isEdited,
      startDate,
      endDate,
      page,
      pageSize,
    } = params;

    const createdAtFilter: Record<string, Date> = {};
    if (startDate)
      createdAtFilter.gte = dayjs(startDate).startOf("day").toDate();
    if (endDate) createdAtFilter.lte = dayjs(endDate).endOf("day").toDate();

    const where: Prisma.QuestionWhereInput = {
      ...(titleKeyword && {
        OR: [
          { title: { contains: titleKeyword, mode: "insensitive" } },
          { id: { contains: titleKeyword, mode: "insensitive" } },
        ],
      }),
      ...(isAnswered !== undefined && { isSolved: isAnswered }),
      ...(hiddenOption !== undefined && { isHidden: hiddenOption }),
      ...(isEdited !== undefined && { isEdited }),
      ...(Object.keys(createdAtFilter).length > 0 && {
        createdAt: createdAtFilter,
      }),
      ...(tags?.length && {
        tags: {
          some: {
            name: { in: tags },
          },
        },
      }),
      ...(username && {
        user: {
          username: { equals: username },
        },
      }),
    };

    const skip = (page - 1) * pageSize;

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          images: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isSolved: true,
          views: true,
          upvotes: true,
          downvotes: true,
          isHidden: true,
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          answers: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    const result = questions.map((q) => ({
      id: q.id,
      title: q.title,
      tags: q.tags,
      views: q.views,
      votes: q.upvotes - q.downvotes,
      answers: q.answers.length,
      user: q.user,
      userId: q.userId,
      images: q.images,
      content: q.content,
      updatedAt: q.updatedAt,
      isSolved: q.isSolved,
      upvotes: q.upvotes,
      downvotes: q.downvotes,
      isAnswered: q.isSolved,
      isHidden: q.isHidden,
      createdAt: q.createdAt.toISOString(),
      editedAt: q.updatedAt?.toISOString() || "",
    }));

    const pagination: Pagination = {
      total,
      count: result.length,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      questions: result,
      pagination,
    };
  },

  create: async ({
    userId,
    title,
    content,
    existingTags,
    newTags,
    imageFiles,
  }: QuestionCreatePayload) => {
    const [imageUrls, createdNewTags] = await Promise.all([
      uploadMultiple(imageFiles),
      newTags.length > 0 ? TagService.createTags(newTags) : Promise.resolve([]),
    ]);

    const question = await prisma.question.create({
      data: {
        userId,
        title,
        content,
        tags: {
          connect: [
            ...existingTags.map((tagId) => ({ id: tagId })),
            ...createdNewTags.map((tag) => ({ id: tag.id })),
          ],
        },
        images: imageUrls,
        createdAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.QUESTION_CREATE,
      contentTitle: title,
      questionId: question.id,
    });

    return question;
  },

  update: async ({
    id,
    title,
    content,
    userId,
    existingTags,
    newTags,
    currentImages,
    imageFiles,
  }: QuestionUpdatePayload) => {
    const [imageUrls, createdNewTags] = await Promise.all([
      uploadMultiple(imageFiles),
      newTags.length > 0 ? TagService.createTags(newTags) : Promise.resolve([]),
    ]);

    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "api:question.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:question.forbidden", true);
    }

    await prisma.questionEdit.create({
      data: {
        questionId: id,
        previousContent: existing.content ?? "",
        previousTitle: existing.title,
        previousImages: existing.images,
        createdAt: existing.updatedAt ?? existing.createdAt,
      },
    });

    const images = [...currentImages, ...imageUrls];
    const tags = [
      ...existingTags.map((tag) => ({ id: tag })),
      ...createdNewTags,
    ];

    const updated = await prisma.question.update({
      where: { id },
      data: {
        title,
        content,
        tags: {
          connect: tags,
        },
        images,
        updatedAt: new Date(),
      },
    });

    await HistoryService.createHistory({
      userId,
      type: HistoryType.QUESTION_EDIT,
      contentTitle: title,
      questionId: id,
    });

    return updated;
  },

  deleteQuestion: async (id: string, userId: string) => {
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "api:question.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:question.forbidden", true);
    }

    await prisma.questionEdit.deleteMany({
      where: { questionId: id },
    });

    const question = await prisma.question.delete({
      where: { id },
    });

    if (!question) {
      throw new ApiError(404, "question.not-found", true);
    }

    await HistoryService.createHistory({
      userId,
      type: HistoryType.QUESTION_DELETE,
      contentTitle: existing.title,
      questionId: id,
    });

    return question;
  },

  voteQuestion: async (userId: string, questionId: string, type: number) => {
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { userId: true, title: true },
    });

    if (!question) throw new ApiError(404, "question.not-found", true);

    if (question.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: question.userId,
          actorId: userId,
          contentTitle: question.title,
          type: "QUESTION_VOTE",
          questionId: questionId,
        },
      });
    }

    let action = "";
    let historyType: "QUESTION_VOTE" | "QUESTION_DOWNVOTE" | null = null;

    if (existingVote) {
      if (existingVote.type === type) {
        await prisma.questionVote.delete({
          where: {
            userId_questionId: {
              userId,
              questionId,
            },
          },
        });
        await prisma.question.update({
          where: { id: questionId },
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
        await prisma.questionVote.update({
          where: {
            userId_questionId: {
              userId,
              questionId,
            },
          },
          data: { type },
        });

        await prisma.question.update({
          where: { id: questionId },
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
        historyType = type === 1 ? "QUESTION_VOTE" : "QUESTION_DOWNVOTE";
      }
    } else {
      await prisma.questionVote.create({
        data: {
          userId,
          questionId,
          type,
        },
      });

      await prisma.question.update({
        where: { id: questionId },
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
      historyType = type === 1 ? "QUESTION_VOTE" : "QUESTION_DOWNVOTE";
    }

    if (historyType) {
      await HistoryService.createHistory({
        userId,
        type: historyType as HistoryType,
        contentTitle: question.title,
        questionId,
      });
    }

    return { action };
  },

  getVoteStatus: async (userId: string, questionId: string) => {
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (!existingVote) {
      return { status: "none" };
    }

    return { status: existingVote.type === 1 ? "like" : "dislike" };
  },

  getEditHistory: async (
    questionId: string,
    createdAt: Date,
    direction: number
  ) => {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new ApiError(404, "api:question.not-found", true);
    }

    const updatedAt = question.updatedAt
      ? question.updatedAt
      : question.createdAt;

    if (updatedAt.getTime() === createdAt.getTime()) {
      if (direction === -1) {
        const edit = await prisma.questionEdit.findFirst({
          where: {
            questionId,
            createdAt: { lt: createdAt },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return edit
          ? {
              title: edit.previousTitle,
              content: edit.previousContent,
              images: edit.previousImages,
              createdAt: edit.createdAt,
            }
          : null;
      } else if (direction === 1) {
        return null;
      }
    } else {
      const edit = await prisma.questionEdit.findFirst({
        where: {
          questionId,
          createdAt,
        },
      });

      if (!edit) {
        return null;
      }

      if (direction === -1) {
        const prevEdit = await prisma.questionEdit.findFirst({
          where: {
            questionId,
            createdAt: { lt: createdAt },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return prevEdit
          ? {
              title: prevEdit.previousTitle,
              content: prevEdit.previousContent,
              images: prevEdit.previousImages,
              createdAt: prevEdit.createdAt,
            }
          : null;
      } else if (direction === 1) {
        const nextEdit = await prisma.questionEdit.findFirst({
          where: {
            questionId,
            createdAt: { gt: createdAt },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        if (!nextEdit) {
          return {
            title: question.title,
            content: question.content,
            images: question.images,
            createdAt: updatedAt,
          };
        }

        return {
          title: nextEdit.previousTitle,
          content: nextEdit.previousContent,
          images: nextEdit.previousImages,
          createdAt: nextEdit.createdAt,
        };
      }
    }
    return null;
  },

  toggleHideQuestions: async (ids: string[], hidden: boolean) => {
    const result = await prisma.question.updateMany({
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

export default QuestionService;
