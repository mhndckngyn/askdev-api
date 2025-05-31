/*
  Warnings:

  - You are about to drop the column `isEdited` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "isEdited",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CommentEdit" ADD COLUMN     "previousImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
