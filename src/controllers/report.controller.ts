import { RequestHandler } from "express";
import ReportService from "@/services/report.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";

const ReportController = {
  create: (async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }

      const { contentType, contentId, reason } = req.body;
      const reportedById = req.user.id;

      const report = await ReportService.createReport({
        reportedById,
        contentType,
        contentId,
        reason,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: "api:report.created-successfully",
        content: report,
      };

      res.status(201).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  delete: (async (req, res, next) => {
    try {
      const { id } = req.params;

      const deleted = await ReportService.deleteReport(id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.deleted-successfully",
        content: deleted,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default ReportController;
