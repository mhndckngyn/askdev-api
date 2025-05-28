import { RequestHandler } from "express";
import SearchService from "@/services/search.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";

const SearchController: {
  search: RequestHandler;
} = {
  search: async (req, res, next) => {
    try {
      const query = (req.query.query as string)?.trim();

      if (!query) {
        throw new ApiError(400, "api:search.missing-query", true);
      }

      const result = await SearchService.search(query);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "api:answer.search-successfully",
        content: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};

export default SearchController;
