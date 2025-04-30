/*
  Warnings:

  - You are about to drop the column `isEdited` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "isEdited",
ADD COLUMN     "editedAt" TIMESTAMP(3);
