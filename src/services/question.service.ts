import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";
import TagService from "./tag.service";
import { uploadMultiple } from "@/config/cloudinary";
import { Prisma } from "@prisma/client";

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
        createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000), 
      },
      select: {
        id: true,
      },
    });

    return question;
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
