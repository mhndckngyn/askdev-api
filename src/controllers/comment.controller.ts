import { RequestHandler } from "express";
import CommentService from "@/services/comment.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import AIService from "@/services/ai.service";
import { GetCommentsParam } from "@/types/comment.type";

const CommentController = {
  getByAnswerId: (async (req, res, next) => {
    try {
      const { answerId } = req.params;

      const comments = await CommentService.getCommentsByAnswerId(answerId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: comments,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const { answerId, content } = req.body;
      const userId = req.user.id;

      const imageFiles = (req.files as Express.Multer.File[]) || [];

      const comment = await CommentService.createComment({
        userId,
        answerId,
        content,
        imageFiles,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: "api:comment.created-successfully",
        content: comment,
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
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const userId = req.user.id;

      const imageFiles = (req.files as Express.Multer.File[]) || [];

      const updated = await CommentService.updateComment(
        id,
        content,
        userId,
        imageFiles
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:comment.updated-successfully",
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
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const userId = req.user.id;

      const comment = await CommentService.deleteComment(id, userId);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:comment.deleted-successfully",
        content: comment,
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

      const result = await CommentService.voteComment(userId, id, Number(type));

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
      const voteStatus = await CommentService.getVoteStatus(userId, id);

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

  getToxicityGrading: (async (req, res, next) => {
    try {
      const { answer, comment } = req.body;

      if (
        !answer ||
        !comment ||
        typeof answer !== "string" ||
        typeof comment !== "string"
      ) {
        throw new ApiError(400, "comment.toxicity-missing-attributes", true);
      }

      const result = await AIService.getCommentToxicityGrading(answer, comment);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "comment.toxicity-grading-successful",
        content: result,
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
        parentId,
        username,
        hiddenOption,
        startDate,
        endDate,
        page = "1",
        pageSize = "15",
      } = req.query;

      const filterParams: GetCommentsParam = {
        content: content as string | undefined,
        parentId: parentId as string | undefined,
        username: username as string | undefined,
        hiddenOption:
          hiddenOption === "true"
            ? true
            : hiddenOption === "false"
            ? false
            : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
      };

      const result = await CommentService.getComments(filterParams);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "answer.fetch-successful",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  hideComments: (async (req, res, next) => {
    try {
      const { ids } = req.body;

      const result = await CommentService.toggleHideComment(ids, true);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "comment.hide-success",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  unhideComments: (async (req, res, next) => {
    try {
      const { ids } = req.body;

      const result = await CommentService.toggleHideComment(ids, false);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "comment.unhide-success",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default CommentController;
