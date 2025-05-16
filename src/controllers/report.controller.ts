import { RequestHandler } from "express";
import ReportService from "@/services/report.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";

export type Filter = {
  reasonKeyword?: string;
  reportedusername?: string;
  contentType?: string;
  contentId?: string;
  status?: string;
  hiddenOption?: boolean;
  startDate?: Date;
  endDate?: Date;
};

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

  getAll: (async (req, res, next) => {
    try {
      const {
        reasonKeyword,
        reportedusername,
        contentType,
        contentId,
        status,
        hiddenOption,
        startDate,
        endDate,
        page = "1",
        pageSize = "10",
      } = req.query;

      const filter: Filter & { page?: number; pageSize?: number } = {
        reasonKeyword: reasonKeyword?.toString(),
        reportedusername: reportedusername?.toString(),
        contentType: contentType?.toString(),
        contentId: contentId?.toString(),
        status: status?.toString(),
        hiddenOption:
          hiddenOption === "true"
            ? true
            : hiddenOption === "false"
            ? false
            : undefined,
        startDate: startDate ? new Date(startDate.toString()) : undefined,
        endDate: endDate ? new Date(endDate.toString()) : undefined,
        page: parseInt(page.toString()),
        pageSize: parseInt(pageSize.toString()),
      };

      const result = await ReportService.getAllReports(filter);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.list-successfully",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  hideReports: (async (req, res, next) => {
    try {
      const { ids } = req.body as { ids: string[] };

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "api:report.invalid-ids", true);
      }

      const result = await ReportService.hideReports(ids);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.hidden-successfully",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  unhideReports: (async (req, res, next) => {
    try {
      const { ids } = req.body as { ids: string[] };

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "api:report.invalid-ids", true);
      }

      const result = await ReportService.unhideReports(ids);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.unhidden-successfully",
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateStatus: (async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const validStatuses = ["PENDING", "REVIEWED", "REJECTED"];
      if (!validStatuses.includes(status as string)) {
        throw new ApiError(400, "api:report.invalid-status", true);
      }
      const updatedReport = await ReportService.updateStatus(
        id,
        status as "PENDING" | "REVIEWED" | "REJECTED"
      );

      if (!updatedReport) {
        throw new ApiError(404, "api:report.not-found", true);
      }

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.status-updated",
        content: updatedReport,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getReportedContentDetails: (async (req, res, next) => {
    try {
      const { contentType, contentId } = req.query;

      if (!contentType || !contentId) {
        throw new ApiError(400, "api:report.invalid-query", true);
      }

      const data = await ReportService.getReportedContentDetails(
        contentType.toString() as "QUESTION" | "ANSWER" | "COMMENT",
        contentId.toString()
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:report.content-detail-success",
        content: data,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default ReportController;
