import { RequestHandler } from "express";
import QuestionService from "@/services/question.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";


const QuestionController = {
  create: (async (req, res, next) => {
    try {
      const { title, content } = req.body;

      if (!req.user?.id) {
        throw new ApiError(401, "api:auth.login-first", true);
      }
      
      const userId = req.user.id;
      
      const question = await QuestionService.createQuestion(
        userId,
        title,
        content
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: "api:question.created-successfully",
        data: question,
      };

      res.status(201).json(resBody);
    } catch (err) {
      console.error("Error occurred:", err);
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
        message: "api:question.updated-successfully",
        data: updated,
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
        message: "api:question.deleted-successfully",
        data: question,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default QuestionController;
