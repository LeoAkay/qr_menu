/*
  Warnings:

  - You are about to drop the column `menuImage` on the `SubCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "menuType" TEXT DEFAULT 'none',
ADD COLUMN     "pdfMenuFile" BYTEA,
ADD COLUMN     "pdfMenuUrl" TEXT;

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "menuImage",
ADD COLUMN     "menuImageUrl" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;
