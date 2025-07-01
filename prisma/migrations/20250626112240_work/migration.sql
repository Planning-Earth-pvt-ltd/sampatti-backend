/*
  Warnings:

  - The `kycStatus` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `propertyType` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Residential', 'Commercial', 'Industrial', 'Land');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('Listed', 'Active', 'Sold');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PropertyStatus" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kycStatus",
ADD COLUMN     "kycStatus" "KYCStatus" NOT NULL DEFAULT 'PENDING';
