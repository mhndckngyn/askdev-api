import TagService from "@/services/tag.service";
import { ApiResponse } from "@/types/response.type";
import { RequestHandler } from "express";

const TagController = {
  searchTags: (async (req, res, next) => {
    const keyword = (req.query.keyword as string)?.trim() || "";
    const count = parseInt(req.query.count as string) || 12;
    const page = parseInt(req.query.page as string) || 1;
    const sortBy = (req.query.sortBy as "name" | "popularity") || "name";

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

  createTag: (async (req, res, next) => {
    const { name, descriptionVi, descriptionEn } = req.body;

    if (!name || !descriptionVi || !descriptionEn) {
      return;
    }

    try {
      const newTag = await TagService.createTag(
        name,
        descriptionVi,
        descriptionEn
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        content: newTag,
      };

      res.status(201).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateTag: (async (req, res, next) => {
    const { id } = req.params;
    const { name, descriptionVi, descriptionEn } = req.body;

    if (!id || !name || !descriptionVi || !descriptionEn) {
      return;
    }

    try {
      const updatedTag = await TagService.updateTag(
        id,
        name,
        descriptionVi,
        descriptionEn
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: updatedTag,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  mergeTags: (async (req, res, next) => {
    const { sourceTagIds, name, descriptionVi, descriptionEn } = req.body;

    if (!sourceTagIds || !name || !descriptionVi || !descriptionEn) {
      return;
    }

    try {
      const newTag = await TagService.mergeTags(
        sourceTagIds,
        name,
        descriptionVi,
        descriptionEn
      );

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: newTag,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default TagController;
