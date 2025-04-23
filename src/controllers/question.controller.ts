import { RequestHandler } from 'express';
import QuestionService from '@/services/question.service';
import { ApiResponse } from '@/types/response.type';
import { ApiError } from '@/utils/ApiError';
import { uploadMultiple } from '@/config/cloudinary';

const QuestionController = {
  create: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const userId = req.user.id;

      const { title, content, existingTags, newTags } = req.body;
      const imageFiles = req.files as Express.Multer.File[];

      const question = await QuestionService.createQuestion({
        userId,
        title,
        content,
        existingTags: JSON.parse(existingTags),
        newTags: JSON.parse(newTags),
        imageFiles,
      });

      res.status(201).json({
        success: true,
        message: 'api:question.created-successfully',
        content: question,
      });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      const updated = await QuestionService.updateQuestion(id, title, content);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'api:question.updated-successfully',
        content: updated,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      const { id } = req.params;

      const question = await QuestionService.deleteQuestion(id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'api:question.deleted-successfully',
        content: question,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default QuestionController;
