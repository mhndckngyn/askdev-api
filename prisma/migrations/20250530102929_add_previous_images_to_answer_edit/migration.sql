-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "AnswerEdit" ADD COLUMN     "previousImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
