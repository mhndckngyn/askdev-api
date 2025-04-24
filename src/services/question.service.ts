import prisma from '@/prisma';
import { ApiError } from '@/utils/ApiError';
import TagService from './tag.service';
import { uploadMultiple } from '@/config/cloudinary';

type CreateQuestionPayload = {
  userId: string;
  title: string;
  content: string;
  existingTags: string[];
  newTags: string[];
  imageFiles: Express.Multer.File[];
};

const toUtc7 = 7 * 60 * 60 * 1000;

const QuestionService = {
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
        createdAt: new Date(new Date().getTime() + toUtc7), // UTC+7
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
      throw new ApiError(404, 'question.not-found', true);
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
        createdAt: new Date(new Date().getTime() + toUtc7),
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
      throw new ApiError(404, 'question.not-found', true);
    }

    return question;
  },
};

export default QuestionService;
