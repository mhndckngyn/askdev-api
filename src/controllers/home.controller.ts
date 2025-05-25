// src/controllers/home.controller.ts
import { RequestHandler } from "express";
import HomeService from "@/services/home.service";
import { ApiResponse } from "@/types/response.type";

const HomeController = {
  getSummary: (async (req, res, next) => {
    try {
      const summary = await HomeService.getSummary();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: summary,
      };

      res.status(200).json(resBody);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTrendingQuestions: (async (req, res, next) => {
    try {
      const questions = await HomeService.getTrendingQuestions();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: questions,
      };

      res.status(200).json(resBody);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopContributors: (async (req, res, next) => {
    try {
      const topContributors = await HomeService.getTopContributors();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: topContributors,
      };

      res.status(200).json(resBody);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getTopTags: (async (req, res, next) => {
    try {
      const topTags = await HomeService.getTopTags();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: topTags,
      };

      res.status(200).json(resBody);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};

export default HomeController;
