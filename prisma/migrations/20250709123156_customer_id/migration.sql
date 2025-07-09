-- CreateTable
CREATE TABLE "Company" (
    "id" BIGSERIAL NOT NULL,
    "C_id" BIGINT NOT NULL,
    "C_Name" TEXT,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "C_Logo_Image" BYTEA,
    "C_QR_URL" TEXT,
    "Welcoming_Page" BYTEA,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Main_Category" (
    "Main_Category_id" BIGSERIAL NOT NULL,
    "Company_id" BIGINT NOT NULL,
    "Category_Name" TEXT NOT NULL,
    "Category_No" BIGINT NOT NULL,
    "Background_image" BYTEA,

    CONSTRAINT "Main_Category_pkey" PRIMARY KEY ("Main_Category_id")
);

-- CreateTable
CREATE TABLE "Password_reset" (
    "Password_id" BIGSERIAL NOT NULL,
    "old_password" TEXT NOT NULL,
    "new_password" TEXT NOT NULL,
    "rest_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Company_id" BIGINT NOT NULL,

    CONSTRAINT "Password_reset_pkey" PRIMARY KEY ("Password_id")
);

-- CreateTable
CREATE TABLE "Sub_Category" (
    "Sub_Category_id" BIGSERIAL NOT NULL,
    "Sub_Category_Name" TEXT NOT NULL,
    "Sub_Order_No" BIGINT NOT NULL,
    "MainCategory_ID" BIGINT NOT NULL,
    "Menu_Image" BYTEA,

    CONSTRAINT "Sub_Category_pkey" PRIMARY KEY ("Sub_Category_id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "Theme_id" BIGSERIAL NOT NULL,
    "Theme_Style" TEXT NOT NULL,
    "Background_colour" TEXT,
    "Logo_Area_Colour" TEXT,
    "Text_Colour" TEXT,
    "Facebook_URL" TEXT,
    "Instagram_URL" TEXT,
    "X_URL" TEXT,
    "Company_ID" BIGINT NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("Theme_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_id_key" ON "Company"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_C_id_key" ON "Company"("C_id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_Username_key" ON "Company"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Main_Category_Main_Category_id_key" ON "Main_Category"("Main_Category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_reset_Password_id_key" ON "Password_reset"("Password_id");

-- CreateIndex
CREATE UNIQUE INDEX "Sub_Category_Sub_Category_id_key" ON "Sub_Category"("Sub_Category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_Theme_id_key" ON "Theme"("Theme_id");

-- AddForeignKey
ALTER TABLE "Main_Category" ADD CONSTRAINT "Main_Category_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password_reset" ADD CONSTRAINT "Password_reset_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sub_Category" ADD CONSTRAINT "Sub_Category_MainCategory_ID_fkey" FOREIGN KEY ("MainCategory_ID") REFERENCES "Main_Category"("Main_Category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_Company_ID_fkey" FOREIGN KEY ("Company_ID") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
