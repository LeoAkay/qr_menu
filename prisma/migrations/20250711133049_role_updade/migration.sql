-- AddForeignKey
ALTER TABLE "Main_Category" ADD CONSTRAINT "Main_Category_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password_reset" ADD CONSTRAINT "Password_reset_Company_id_fkey" FOREIGN KEY ("Company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_Company_ID_fkey" FOREIGN KEY ("Company_ID") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
