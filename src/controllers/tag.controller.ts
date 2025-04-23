import TagService from '@/services/tag.service';
import { ApiResponse } from '@/types/response.type';
import { ApiError } from '@/utils/ApiError';
import { RequestHandler } from 'express';

const TagController = {
  searchTags: (async (req, res, next) => {
    const termParam = req.query.term;
    const countParam = req.query.count;

    if (termParam !== undefined && typeof termParam !== 'string') {
      throw new ApiError(422, 'api:tag.invalid-params');
    }

    let count: number | undefined;
    if (countParam !== undefined) {
      if (typeof countParam !== 'string' || isNaN(Number(countParam))) {
        throw new ApiError(422, 'api:tag.invalid-params');
      }
      count = parseInt(countParam);
    }

    try {
      let tags;
      if (termParam) {
        tags = await TagService.searchTags(termParam, count);
      } else {
        tags = await TagService.getTags(count);
      }

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: tags,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default TagController;
