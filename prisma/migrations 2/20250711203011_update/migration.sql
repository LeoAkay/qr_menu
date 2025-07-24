/*
  Warnings:

  - You are about to drop the column `C_Logo_Image` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `C_Name` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `C_QR_URL` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `C_id` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedByAdmin` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `UpdatedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `UpdatedByAdmin` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `Welcoming_Page` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `role_name` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `Theme` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Background_colour` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Company_ID` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Facebook_URL` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Instagram_URL` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Logo_Area_Colour` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Text_Colour` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Theme_Style` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `Theme_id` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `X_URL` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Main_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Password_reset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sub_Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roleName]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Theme` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Theme` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `style` to the `Theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_CreatedByAdmin_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_UpdatedByAdmin_fkey";

-- DropForeignKey
ALTER TABLE "Main_Category" DROP CONSTRAINT "Main_Category_Company_id_fkey";

-- DropForeignKey
ALTER TABLE "Password_reset" DROP CONSTRAINT "Password_reset_Company_id_fkey";

-- DropForeignKey
ALTER TABLE "Sub_Category" DROP CONSTRAINT "Sub_Category_MainCategory_ID_fkey";

-- DropForeignKey
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_Company_ID_fkey";

-- DropIndex
DROP INDEX "Company_C_id_key";

-- DropIndex
DROP INDEX "Role_role_name_key";

-- DropIndex
DROP INDEX "Theme_Theme_id_key";

-- DropIndex
DROP INDEX "User_user_name_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "C_Logo_Image",
DROP COLUMN "C_Name",
DROP COLUMN "C_QR_URL",
DROP COLUMN "C_id",
DROP COLUMN "CreatedAt",
DROP COLUMN "CreatedByAdmin",
DROP COLUMN "UpdatedAt",
DROP COLUMN "UpdatedByAdmin",
DROP COLUMN "Welcoming_Page",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdByAdmin" TEXT,
ADD COLUMN     "logoImage" BYTEA,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "qrUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedByAdmin" TEXT,
ADD COLUMN     "welcomingPage" BYTEA;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "role_name",
ADD COLUMN     "roleName" TEXT NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_pkey",
DROP COLUMN "Background_colour",
DROP COLUMN "Company_ID",
DROP COLUMN "Facebook_URL",
DROP COLUMN "Instagram_URL",
DROP COLUMN "Logo_Area_Colour",
DROP COLUMN "Text_Colour",
DROP COLUMN "Theme_Style",
DROP COLUMN "Theme_id",
DROP COLUMN "X_URL",
ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "logoAreaColor" TEXT,
ADD COLUMN     "style" TEXT NOT NULL,
ADD COLUMN     "textColor" TEXT,
ADD COLUMN     "xUrl" TEXT,
ADD CONSTRAINT "Theme_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "user_name",
ADD COLUMN     "cId" INTEGER NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Main_Category";

-- DropTable
DROP TABLE "Password_reset";

-- DropTable
DROP TABLE "Sub_Category";

-- CreateTable
CREATE TABLE "MainCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryNo" INTEGER NOT NULL,
    "backgroundImage" BYTEA,

    CONSTRAINT "MainCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "previousPassword" TEXT NOT NULL,
    "newPassword" TEXT NOT NULL,
    "resetTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "mainCategoryId" TEXT NOT NULL,
    "menuImage" BYTEA,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MainCategory_companyId_idx" ON "MainCategory"("companyId");

-- CreateIndex
CREATE INDEX "PasswordReset_companyId_idx" ON "PasswordReset"("companyId");

-- CreateIndex
CREATE INDEX "SubCategory_mainCategoryId_idx" ON "SubCategory"("mainCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");

-- CreateIndex
CREATE INDEX "Theme_companyId_idx" ON "Theme"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cId_key" ON "User"("cId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdByAdmin_fkey" FOREIGN KEY ("createdByAdmin") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_updatedByAdmin_fkey" FOREIGN KEY ("updatedByAdmin") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainCategory" ADD CONSTRAINT "MainCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
