/*
  Warnings:

  - You are about to drop the column `isEdited` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "isEdited",
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
