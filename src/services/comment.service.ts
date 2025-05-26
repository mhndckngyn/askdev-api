import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

type CreateCommentPayload = {
  userId: string;
  answerId: string;
  content: string;
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
        createdAt: true,
        isEdited: true,
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
  }: CreateCommentPayload) => {
    const comment = await prisma.comment.create({
      data: {
        userId,
        answerId,
        content,
        createdAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
      },
    });

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { userId: true },
    });

    if (answer && answer.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: answer.userId,
          actorId: userId,
          contentTitle: content,
          type: "COMMENT",
        },
      });
    }

    return comment;
  },

  updateComment: async (id: string, content: string, userId: string) => {
    const existing = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "api:comment.not-found", true);
    }

    if (existing.userId !== userId) {
      throw new ApiError(403, "api:comment.forbidden", true);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
        createdAt: new Date(),
      },
    });

    return updated;
  },

  deleteComment: async (id: string, userId: string) => {
    const existing = await prisma.comment.findUnique({
      where: { id },
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

        return { action: "removed" };
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

        return { action: "changed" };
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

      return { action: "created" };
    }
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
};

export default CommentService;
