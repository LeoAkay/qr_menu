/*
  Warnings:

  - You are about to drop the column `createdByAdminId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedByAdminId` on the `Company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_createdByAdminId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_updatedByAdminId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "createdByAdminId",
DROP COLUMN "updatedByAdminId";
