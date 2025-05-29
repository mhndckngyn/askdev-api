import { RequestHandler } from 'express';
import AnswerService from '@/services/answer.service';
import { ApiResponse } from '@/types/response.type';
import { ApiError } from '@/utils/ApiError';
import AIService from '@/services/ai.service';

const AnswerController = {
  getByQuestionId: (async (req, res, next) => {
    try {
      const { questionId } = req.params;

      const answers = await AnswerService.getAnswersByQuestionId(questionId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: answers,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getByParams: (async (req, res, next) => {
    try {
      const {
        content,
        questionId,
        username,
        hiddenOption,
        startDate,
        endDate,
        page = '1',
        pageSize = '15',
      } = req.query;

      const filterParams = {
        content: content as string | undefined,
        questionId: questionId as string | undefined,
        username: username as string | undefined,
        hiddenOption:
          hiddenOption === 'true'
            ? true
            : hiddenOption === 'false'
            ? false
            : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
      };

      const result = await AnswerService.getAnswers(filterParams);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'answer.fetch-successful',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getById: (async (req, res, next) => {
    try {
      const { id } = req.params;

      const answer = await AnswerService.getAnswerById(id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: answer,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const { questionId, content } = req.body;
      const userId = req.user.id;

      const answer = await AnswerService.createAnswer({
        userId,
        questionId,
        content,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'api:answer.created-successfully',
        content: answer,
      };

      res.status(201).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!req.user?.id) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const userId = req.user.id;

      const updated = await AnswerService.updateAnswer(id, content, userId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'api:answer.updated-successfully',
        content: updated,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const userId = req.user.id;

      const { id } = req.params;

      const answer = await AnswerService.deleteAnswer(id, userId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'api:answer.deleted-successfully',
        content: answer,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  vote: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, 'auth.login-first', true);
      }

      const userId = req.user.id;
      const { id } = req.params;
      const { type } = req.query;

      if (![1, -1].includes(Number(type))) {
        throw new ApiError(400, 'vote.invalid-type', true);
      }

      const result = await AnswerService.voteAnswer(userId, id, Number(type));

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: `vote.${result.action}`,
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getVoteStatus: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, 'auth.login-first', true);
      }

      const userId = req.user.id;
      const { id } = req.params;
      const voteStatus = await AnswerService.getVoteStatus(userId, id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: voteStatus,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  hideQuestions: (async (req, res, next) => {
    try {
      const { ids } = req.body;

      const result = await AnswerService.toggleHideQuestions(ids, true);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'answer.hideSuccess',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  unhideQuestions: (async (req, res, next) => {
    try {
      const { ids } = req.body;

      const result = await AnswerService.toggleHideQuestions(ids, false);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'answer.unhideSuccess',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getToxicityGrading: (async (req, res, next) => {
    try {
      const { questionTitle, answer } = req.body;

      if (
        !questionTitle ||
        !answer ||
        typeof questionTitle !== 'string' ||
        typeof answer !== 'string'
      ) {
        throw new ApiError(400, 'answer.toxicity-missing-attributes', true);
      }

      const result = await AIService.getAnswerToxicityGrading(
        questionTitle,
        answer
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'answer.toxicity-grading-successful',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  markChosen: (async (req, res, next) => {
    try {
      const { id: answerId } = req.params;
      const userId = req.user?.id!; // đã có middleware handle

      if (!answerId || typeof answerId !== 'string') {
        throw new ApiError(400, 'answer.mark-chosen-missing-attributes', true);
      }

      await AnswerService.markChosen(answerId, userId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'answer.mark-chosen-successful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default AnswerController;
