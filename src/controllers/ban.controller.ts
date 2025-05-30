import BanService from '@/services/ban.service';
import { ApiResponse } from '@/types/response.type';
import { RequestHandler } from 'express';

const BanController = {
  getAll: (async (req, res, next) => {
    try {
      const result = await BanService.getAll();

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'ban.get-succesful',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default BanController;
