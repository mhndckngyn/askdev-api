import TagService from '@/services/tag.service';
import {ApiResponse} from '@/types/response.type';
import {RequestHandler} from 'express';

const TagController = {
  searchTags: (async (req, res, next) => {
    const keyword = (req.query.keyword as string)?.trim() || '';
    const count = parseInt(req.query.count as string) || 5;
    const page = parseInt(req.query.page as string) || 1;
    const sortBy = (req.query.sortBy as 'name' | 'popularity') || 'name';

    try {
      const content = await TagService.searchTags(keyword, count, page, sortBy);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default TagController;
