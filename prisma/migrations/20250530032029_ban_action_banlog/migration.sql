/*
  Warnings:

  - Added the required column `action` to the `BanLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BanAction" AS ENUM ('BAN', 'UNBAN');

-- AlterTable
ALTER TABLE "BanLog" ADD COLUMN     "action" "BanAction" NOT NULL;
