import AIService from "@/services/ai.service";
import QuestionService from "@/services/question.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import { RequestHandler } from "express";

const QuestionController = {
  getById: (async (req, res, next) => {
    try {
      const { id } = req.params;

      const question = await QuestionService.getQuestionById(id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: question,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getByTag: (async (req, res, next) => {
    try {
      const { tagId } = req.params;

      const questions = await QuestionService.getQuestionsByTag(tagId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: questions,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getByParams: (async (req, res, next) => {
    try {
      const {
        titleKeyword,
        tags,
        username,
        isAnswered,
        hiddenOption,
        isEdited,
        startDate,
        endDate,
        page = "1",
        pageSize = "10",
      } = req.query;

      // ép kiểu về string
      const filterParams = {
        titleKeyword: titleKeyword as string | undefined,
        tags: typeof tags === "string" ? tags.split(",") : undefined,
        username: username as string | undefined,
        isAnswered:
          isAnswered === "true"
            ? true
            : isAnswered === "false"
            ? false
            : undefined,
        hiddenOption:
          hiddenOption === "true"
            ? true
            : hiddenOption === "false"
            ? false
            : undefined,
        isEdited:
          isEdited === "true" ? true : isEdited === "false" ? false : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
      };

      const result = await QuestionService.getQuestions(filterParams);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.fetched",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "auth.login-first", true);
      }

      const userId = req.user.id;

      const { title, content, existingTags, newTags } = req.body;
      const imageFiles = req.files as Express.Multer.File[];

      const question = await QuestionService.create({
        userId,
        title,
        content,
        existingTags: JSON.parse(existingTags),
        newTags: JSON.parse(newTags),
        imageFiles,
      });

      const resBody: ApiResponse = {
        success: true,
        message: "question.created-successfully",
        statusCode: 201,
        content: question,
      };

      res.status(201).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "auth.login-first", true);
      }

      const { id } = req.params;
      const { title, content, existingTags, newTags, currentImages } = req.body;
      const imageFiles = req.files as Express.Multer.File[];

      const userId = req.user.id;

      const updated = await QuestionService.update({
        id,
        userId,
        title,
        content,
        existingTags: JSON.parse(existingTags),
        newTags: JSON.parse(newTags),
        currentImages: JSON.parse(currentImages),
        imageFiles,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.updated-successfully",
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

      if (!req.user?.id) {
        throw new ApiError(401, "auth.login-first", true);
      }

      const userId = req.user.id;

      const question = await QuestionService.deleteQuestion(id, userId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.deleted-successfully",
        content: question,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  vote: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "auth.login-first", true);
      }
      const userId = req.user.id;
      const { id } = req.params;
      const { type } = req.query;

      if (![1, -1].includes(Number(type))) {
        throw new ApiError(400, "vote.invalid-type", true);
      }

      const result = await QuestionService.voteQuestion(
        userId,
        id,
        Number(type)
      );

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
        throw new ApiError(401, "auth.login-first", true);
      }

      const userId = req.user.id;
      const { id } = req.params;
      const existingVote = await QuestionService.getVoteStatus(userId, id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: existingVote,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getEditHistory: (async (req, res, next) => {
    try {
      const { id } = req.params;
      const { createdAt, direction } = req.query;

      if (!createdAt || !direction) {
        throw new ApiError(400, "edit-history.missing-params", true);
      }

      const parsedCreatedAt = new Date(createdAt as string);
      const parsedDirection = parseInt(direction as string, 10);

      if (![1, -1].includes(parsedDirection)) {
        throw new ApiError(400, "edit-history.invalid-direction", true);
      }

      const edit = await QuestionService.getEditHistory(
        id,
        parsedCreatedAt,
        parsedDirection
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: edit,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  hideQuestions: (async (req, res, next) => {
    try {
      const { ids } = req.body;

      const result = await QuestionService.toggleHideQuestions(ids, true);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.hideSuccess",
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

      const result = await QuestionService.toggleHideQuestions(ids, false);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.hideSuccess",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getContentSuggestion: (async (req, res, next) => {
    try {
      const { questionTitle } = req.body;

      if (!questionTitle || typeof questionTitle !== "string") {
        throw new ApiError(400, "question.question-title-required", true);
      }

      const result = await AIService.getContentSuggestion(questionTitle);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "question.suggestion-fetch-success",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default QuestionController;
