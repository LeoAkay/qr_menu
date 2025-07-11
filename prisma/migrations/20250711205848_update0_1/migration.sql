/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `createdByAdmin` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `logoImage` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `qrUrl` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedByAdmin` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `welcomingPage` on the `Company` table. All the data in the column will be lost.
  - Added the required column `UpdatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_createdByAdmin_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_updatedByAdmin_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "createdAt",
DROP COLUMN "createdByAdmin",
DROP COLUMN "logoImage",
DROP COLUMN "name",
DROP COLUMN "qrUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedByAdmin",
DROP COLUMN "welcomingPage",
ADD COLUMN     "C_Logo_Image" BYTEA,
ADD COLUMN     "C_Name" TEXT,
ADD COLUMN     "C_QR_URL" TEXT,
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Welcoming_Page" BYTEA,
ADD COLUMN     "createdByAdminId" TEXT,
ADD COLUMN     "updatedByAdminId" TEXT;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
