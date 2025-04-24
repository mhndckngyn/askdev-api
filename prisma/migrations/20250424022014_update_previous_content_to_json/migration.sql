/*
  Warnings:

  - The `previousContent` column on the `QuestionEdit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionEdit" DROP COLUMN "previousContent",
ADD COLUMN     "previousContent" JSONB;
