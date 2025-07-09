/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `C_id` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `Main_Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `Category_No` on the `Main_Category` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `Password_reset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sub_Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `Sub_Order_No` on the `Sub_Category` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `Theme` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Main_Category" DROP CONSTRAINT "Main_Category_Company_id_fkey";

-- DropForeignKey
ALTER TABLE "Password_reset" DROP CONSTRAINT "Password_reset_Company_id_fkey";

-- DropForeignKey
ALTER TABLE "Sub_Category" DROP CONSTRAINT "Sub_Category_MainCategory_ID_fkey";

-- DropForeignKey
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_Company_ID_fkey";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "C_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Company_id_seq";

-- AlterTable
ALTER TABLE "Main_Category" DROP CONSTRAINT "Main_Category_pkey",
ALTER COLUMN "Main_Category_id" DROP DEFAULT,
ALTER COLUMN "Main_Category_id" SET DATA TYPE TEXT,
ALTER COLUMN "Company_id" SET DATA TYPE TEXT,
ALTER COLUMN "Category_No" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Main_Category_pkey" PRIMARY KEY ("Main_Category_id");
DROP SEQUENCE "Main_Category_Main_Category_id_seq";

-- AlterTable
ALTER TABLE "Password_reset" DROP CONSTRAINT "Password_reset_pkey",
ALTER COLUMN "Password_id" DROP DEFAULT,
ALTER COLUMN "Password_id" SET DATA TYPE TEXT,
ALTER COLUMN "Company_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Password_reset_pkey" PRIMARY KEY ("Password_id");
DROP SEQUENCE "Password_reset_Password_id_seq";

-- AlterTable
ALTER TABLE "Sub_Category" DROP CONSTRAINT "Sub_Category_pkey",
ALTER COLUMN "Sub_Category_id" DROP DEFAULT,
ALTER COLUMN "Sub_Category_id" SET DATA TYPE TEXT,
ALTER COLUMN "Sub_Order_No" SET DATA TYPE INTEGER,
ALTER COLUMN "MainCategory_ID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sub_Category_pkey" PRIMARY KEY ("Sub_Category_id");
DROP SEQUENCE "Sub_Category_Sub_Category_id_seq";

-- AlterTable
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_pkey",
ALTER COLUMN "Theme_id" DROP DEFAULT,
ALTER COLUMN "Theme_id" SET DATA TYPE TEXT,
ALTER COLUMN "Company_ID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Theme_pkey" PRIMARY KEY ("Theme_id");
DROP SEQUENCE "Theme_Theme_id_seq";

-- AddForeignKey
ALTER TABLE "Main_Category" ADD CONSTRAINT "Main_Category_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password_reset" ADD CONSTRAINT "Password_reset_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sub_Category" ADD CONSTRAINT "Sub_Category_MainCategory_ID_fkey" FOREIGN KEY ("MainCategory_ID") REFERENCES "Main_Category"("Main_Category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_Company_ID_fkey" FOREIGN KEY ("Company_ID") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
