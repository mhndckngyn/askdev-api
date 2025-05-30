import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";
import { uploadMultiple } from "@/config/cloudinary";

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

    return comment;
  },

  updateComment: async (
    id: string,
    content: string,
    userId: string,
    imageFiles: Express.Multer.File[] = []
  ) => {
    const existing = await prisma.comment.findUnique({
      where: { id },
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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        content: true,
        answer: {
          select: {
            questionId: true,
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
