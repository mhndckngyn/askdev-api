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

  updateQuestion: async (id: string, title: string, content: string) => {
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
        createdAt: existing.createdAt,
      },
    });

    const updated = await prisma.question.update({
      where: { id },
      data: {
        title,
        content,
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
};

export default QuestionService;
