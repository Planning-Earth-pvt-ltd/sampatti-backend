/*
  Warnings:

  - You are about to drop the column `propertyType` on the `properties` table. All the data in the column will be lost.
  - Added the required column `PropertyType` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "propertyType",
ADD COLUMN     "PropertyType" "PropertyType" NOT NULL;
