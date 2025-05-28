import { RequestHandler } from "express";
import NotificationService from "@/services/notification.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";

const NotificationController = {
  getAllByUser: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const notifications = await NotificationService.getAllByUserId(
        req.user.id
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: notifications,
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
      const result = await NotificationService.deleteById(
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

  deleteAll: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const result = await NotificationService.deleteAll(req.user.id);
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

  markAsRead: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const result = await NotificationService.markAsRead(
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

  markAllAsRead: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const result = await NotificationService.markAllAsRead(req.user.id);
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

  markAsUnread: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const result = await NotificationService.markAsUnread(
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

  markAllAsUnread: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      const result = await NotificationService.markAllAsUnread(req.user.id);
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
};

export default NotificationController;
