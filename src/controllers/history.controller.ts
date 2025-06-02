import { RequestHandler } from "express";
import HistoryService from "@/services/history.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";

enum HistoryType {
  QUESTION_CREATE = "QUESTION_CREATE",
  ANSWER_CREATE = "ANSWER_CREATE",
  COMMENT_CREATE = "COMMENT_CREATE",
  QUESTION_EDIT = "QUESTION_EDIT",
  ANSWER_EDIT = "ANSWER_EDIT",
  COMMENT_EDIT = "COMMENT_EDIT",
  QUESTION_VOTE = "QUESTION_VOTE",
  ANSWER_VOTE = "ANSWER_VOTE",
  COMMENT_VOTE = "COMMENT_VOTE",
  QUESTION_DOWNVOTE = "QUESTION_DOWNVOTE",
  ANSWER_DOWNVOTE = "ANSWER_DOWNVOTE",
  COMMENT_DOWNVOTE = "COMMENT_DOWNVOTE",
  ANSWER_CHOSEN = "ANSWER_CHOSEN",
  REPORT_CREATE = "REPORT_CREATE",
  QUESTION_DELETE = "QUESTION_DELETE",
  ANSWER_DELETE = "ANSWER_DELETE",
  COMMENT_DELETE = "COMMENT_DELETE",
}

const HistoryController = {
  getAllByUser: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Parse filters from query params
      const filters: any = {};

      if (req.query.search) {
        filters.searchQuery = req.query.search as string;
      }

      if (req.query.types) {
        const typesParam = req.query.types as string;
        const typesArray = typesParam
          .split(",")
          .filter((type) =>
            Object.values(HistoryType).includes(type as HistoryType)
          ) as HistoryType[];
        if (typesArray.length > 0) {
          filters.types = typesArray;
        }
      }

      if (req.query.startDate || req.query.endDate) {
        filters.dateRange = {};
        if (req.query.startDate) {
          filters.dateRange.start = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
          filters.dateRange.end = new Date(req.query.endDate as string);
        }
      }

      const result = await HistoryService.getAllByUserId(
        req.user.id,
        page,
        limit,
        filters
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: result,
      };
      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  deleteById: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const result = await HistoryService.deleteById(
        req.params.id,
        req.user.id
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: result,
      };
      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  deleteMultiple: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "api:history.invalid-ids");
      }

      const result = await HistoryService.deleteMultiple(ids, req.user.id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: result,
      };
      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  deleteAll: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const result = await HistoryService.deleteAll(req.user.id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: result,
      };
      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getHistoryTypes: (async (req, res, next) => {
    try {
      const types = HistoryService.getHistoryTypes();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: { types },
      };
      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default HistoryController;
