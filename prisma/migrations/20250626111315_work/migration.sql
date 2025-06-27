/*
  Warnings:

  - You are about to drop the column `PropertyType` on the `properties` table. All the data in the column will be lost.
  - The `status` column on the `properties` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `kycStatus` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `propertyType` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "PropertyType",
ADD COLUMN     "propertyType" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Listed';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kycStatus",
ADD COLUMN     "kycStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "KYCStatus";

-- DropEnum
DROP TYPE "PropertyStatus";

-- DropEnum
DROP TYPE "PropertyType";
