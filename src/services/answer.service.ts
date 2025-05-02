import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

type CreateAnswerPayload = {
  userId: string;
  questionId: string;
  content: string;
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
        isEdited: true,
        upvotes: true,
        downvotes: true,
        isChosen: true,
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
  }: CreateAnswerPayload) => {
    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId,
        content,
        createdAt: new Date(),
      },
      select: {
        id: true,
      },
    });
    return answer;
  },

  updateAnswer: async (id: string, content: string, userId: string) => {
    const existing = await prisma.answer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "api:answer.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:answer.forbidden", true);
    }

    await prisma.answerEdit.create({
      data: {
        answerId: id,
        previousContent: existing.content,
      },
    });

    const updated = await prisma.answer.update({
      where: { id },
      data: {
        content,
        isEdited: true,
        createdAt: new Date(),
      },
    });

    return updated;
  },

  deleteAnswer: async (id: string, userId: string) => {
    const existing = await prisma.answer.findUnique({
      where: { id },
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

        return { action: "removed" };
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

        return { action: "changed" };
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

      return { action: "created" };
    }
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
};

export default AnswerService;
