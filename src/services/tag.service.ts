import prisma from '@/prisma';
import { ApiError } from '@/utils/ApiError';

const MAX_TAGS_TO_SEARCH = 5;
const MAX_TAGS_TO_GET = 10;

const TagService = {
  searchTags: async (query: string, count: number = MAX_TAGS_TO_SEARCH) => {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          name: query,
        },
        take: count,
      });

      return tags;
    } catch (error) {
      throw new ApiError(500, 'api:tag.unexpected-error');
    }
  },
  getTags: async (count: number = MAX_TAGS_TO_GET) => {
    try {
      const tags = await prisma.tag.findMany({
        take: count,
      });

      return tags;
    } catch (error) {
      throw new ApiError(500, 'api:tag.unexpected-error');
    }
  },
  createTags: async (values: string[]) => {
    try {
      return prisma.tag.createManyAndReturn({
        data: values.map((name) => ({ name })),
        select: { id: true },
      });
    } catch (error) {
      throw new ApiError(500, 'api:tag.unexpected-error');
    }
  },
};

export default TagService;
