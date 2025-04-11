/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `profilePicture` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "profilePicture" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerUserId_key" ON "User"("provider", "providerUserId");
