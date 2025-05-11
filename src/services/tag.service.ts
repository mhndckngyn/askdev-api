import prisma from "@/prisma";
import { Prisma } from "generated/prisma";
import { ApiError } from "@/utils/ApiError";

const TagService = {
  searchTags: async (
    keyword: string,
    limit: number,
    page: number,
    sortBy: "name" | "popularity"
  ) => {
    const where: Prisma.TagWhereInput =
      keyword !== ""
        ? {
            name: {
              startsWith: keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {};

    // sap xep theo Ten (A -> Z) hoac theo so cau hoi
    const orderBy: Prisma.TagOrderByWithRelationInput =
      sortBy === "name"
        ? {
            name: "asc",
          }
        : {
            questions: {
              _count: "desc",
            },
          };

    const results = await prisma.tag.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy,
    });

    const total = await prisma.tag.count({ where });

    const pagination = {
      total,
      count: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    const tags = results.map((tag) => ({
      ...tag,
      questionCount: tag._count.questions,
    }));

    return { tags, pagination };
  },

  createTags: async (values: string[]) => {
    return prisma.tag.createManyAndReturn({
      data: values.map((name) => ({ name })),
      select: { id: true },
      skipDuplicates: true,
    });
  },

  updateTag: async (
    id: string,
    name: string,
    descriptionVi: string,
    descriptionEn: string
  ) => {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new ApiError(404, "api:tag.not-found", true);
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        descriptionVi,
        descriptionEn,
      },
    });

    return updatedTag;
  },

  mergeTags: async (
    sourceTagIds: string[],
    name: string,
    descriptionVi: string,
    descriptionEn: string
  ) => {
    let targetTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (targetTag) {
      await prisma.tag.update({
        where: { id: targetTag.id },
        data: {
          descriptionVi,
          descriptionEn,
        },
      });
    } else {
      targetTag = await prisma.tag.create({
        data: {
          name,
          descriptionVi,
          descriptionEn,
        },
      });
    }

    const questions = await prisma.question.findMany({
      where: {
        tags: {
          some: {
            id: { in: sourceTagIds },
          },
        },
      },
    });

    for (const question of questions) {
      await prisma.question.update({
        where: {
          id: question.id,
        },
        data: {
          tags: {
            connect: [{ id: targetTag.id }],
            disconnect: sourceTagIds
              .filter((id) => id !== targetTag!.id)
              .map((id) => ({ id })),
          },
        },
      });
    }

    await prisma.tag.deleteMany({
      where: {
        id: {
          in: sourceTagIds.filter((id) => id !== targetTag!.id),
        },
      },
    });

    return targetTag;
  },
};

export default TagService;
