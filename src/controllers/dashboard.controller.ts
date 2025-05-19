// src/controllers/dashboard.controller.ts
import { RequestHandler } from "express";
import DashboardService from "@/services/dashboard.service";
import { ApiResponse } from "@/types/response.type";

const DashboardController = {
  getWeeklyTrends: (async (req, res, next) => {
    try {
      const trends = await DashboardService.getWeeklyTrends();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.weeklyTrendsSuccess",
        content: trends,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getGeneralStatsWithPercentage: (async (req, res, next) => {
    try {
      const stats = await DashboardService.getGeneralStatsWithPercentage();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.generalStatsSuccess",
        content: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopTagsWithStats: (async (req, res, next) => {
    try {
      const data = await DashboardService.getTop10TagsWithStats();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.topTagsSuccess",
        content: data,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getPostTagStats: (async (req, res, next) => {
    try {
      const stats = await DashboardService.getPostTagStats();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.statsSuccess",
        content: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopUsersByPostCount: (async (req, res, next) => {
    try {
      const topUsers = await DashboardService.getTopUsersByPostCount();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.topUsersByPostCountSuccess",
        content: topUsers,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getPostTagStatsinYear: (async (req, res, next) => {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();

      const stats = await DashboardService.getPostTagStatsinYear(year);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.statsSuccess",
        content: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopTagsWithPostCountInYear: (async (req, res, next) => {
    try {
      const year = parseInt(req.query.year as string);

      if (isNaN(year)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Invalid year",
        });
      }

      const topTags = await DashboardService.getTopTagsWithPostCountInYear(
        year
      );

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.topTagsSuccess",
        content: topTags,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopTagsAllTimeWithOthers: (async (req, res, next) => {
    try {
      const result = await DashboardService.getTopTagsAllTimeWithOthers();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.topTagsWithOthersSuccess",
        content: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getMonthlyReportStats: (async (req, res, next) => {
    try {
      const stats = await DashboardService.getMonthlyReportStats();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.monthlyReportStatsSuccess",
        content: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getDailyReportStatsByMonthYear: (async (req, res, next) => {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Invalid month or year",
        });
      }

      const stats = await DashboardService.getDailyReportStatsByMonthYear(
        month,
        year
      );

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.dailyReportStatsSuccess",
        content: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTotalReportsByType: (async (req, res, next) => {
    try {
      const data = await DashboardService.getTotalReportsByType();

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "dashboard.reportCountsSuccess",
        content: data,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};

export default DashboardController;
