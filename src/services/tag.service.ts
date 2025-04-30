import prisma from '@/prisma';
import { Prisma } from 'generated/prisma';

const TagService = {
  searchTags: async (
    keyword: string,
    limit: number,
    page: number,
    sortBy: 'name' | 'popularity'
  ) => {
    const where: Prisma.TagWhereInput =
      keyword !== ''
        ? {
            name: {
              startsWith: keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {};

    // sap xep theo Ten (A -> Z) hoac theo so cau hoi
    const orderBy: Prisma.TagOrderByWithRelationInput =
      sortBy === 'name'
        ? {
            name: 'asc',
          }
        : {
            questions: {
              _count: 'desc',
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
};

export default TagService;
