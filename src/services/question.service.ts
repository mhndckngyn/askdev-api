import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";
import TagService from "./tag.service";
import { uploadMultiple } from "@/config/cloudinary";

type CreateQuestionPayload = {
  userId: string;
  title: string;
  content: string;
  existingTags: string[];
  newTags: string[];
  imageFiles: Express.Multer.File[];
};

const QuestionService = {
  getQuestionById: async (id: string) => {
    const question = await prisma.question.findFirst({
      where: { id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!question) {
      throw new ApiError(404, "api:question.not-found", true);
    }
    return question;
  },

  createQuestion: async ({
    userId,
    title,
    content,
    existingTags,
    newTags,
    imageFiles,
  }: CreateQuestionPayload) => {
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

    return question;
  },

  updateQuestion: async (
    id: string,
    title: string,
    content: string,
    images: string[]
  ) => {
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "api:question.not-found", true);
    }

    await prisma.questionEdit.create({
      data: {
        questionId: id,
        previousContent: existing.content ?? "",
        previousTitle: existing.title,
        previousImages: existing.images,
        createdAt: existing.createdAt,
      },
    });

    const updated = await prisma.question.update({
      where: { id },
      data: {
        title,
        content,
        images,
        isEdited: true,
        createdAt: new Date(),
      },
    });

    return updated;
  },

  deleteQuestion: async (id: string) => {
    await prisma.questionEdit.deleteMany({
      where: { questionId: id },
    });

    const question = await prisma.question.delete({
      where: { id },
    });

    if (!question) {
      throw new ApiError(404, "question.not-found", true);
    }

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

        return { action: "removed" };
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

        return { action: "changed" };
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

      return { action: "created" };
    }
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

    if (question.createdAt.getTime() === createdAt.getTime()) {
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
            createdAt: question.createdAt,
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
};

export default QuestionService;
