import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

const QuestionService = {
  createQuestion: async (userId: string, title: string, content: string) => {
    try {
      const question = await prisma.question.create({
        data: {
          userId,
          title,
          content,
          createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
        },
      });
      return question;
    } catch (error) {
      throw new ApiError(500, "api:question.create-failed", true);
    }
  },

  updateQuestion: async (id: string, title: string, content: string) => {
    try {
      const existing = await prisma.question.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new ApiError(404, "api:question.not-found", true);
      }

      await prisma.questionEdit.create({
        data: {
          questionId: id,
          previousContent: existing.content,
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
          createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
        },
      });

      return updated;
    } catch (error: any) {
      console.error("❌ updateQuestion error:", error);
      throw new ApiError(500, "api:question.update-failed", true);
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      await prisma.questionEdit.deleteMany({
        where: { questionId: id },
      });

      const question = await prisma.question.delete({
        where: { id },
      });

      return question;
    } catch (error) {
      throw new ApiError(404, "api:question.not-found", true);
    }
  },
};

export default QuestionService;
