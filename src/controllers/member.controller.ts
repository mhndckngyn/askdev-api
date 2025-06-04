import { RequestHandler } from "express";
import MemberService from "@/services/member.service";
import { ApiResponse } from "@/types/response.type";
import { ApiError } from "@/utils/ApiError";
import { RankingType } from "@/types/member.type";

const MemberController = {
  getMembers: (async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const rankingType = (req.query.ranking as RankingType) || "reputation";

      const validRankingTypes = MemberService.getRankingTypes();
      if (!validRankingTypes.includes(rankingType)) {
        throw new ApiError(400, "api:member.invalid-ranking-type");
      }

      const searchQuery = req.query.search as string;

      const result = await MemberService.getMembers(
        page,
        limit,
        rankingType,
        searchQuery
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
};

export default MemberController;
