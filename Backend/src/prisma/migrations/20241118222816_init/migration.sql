/*
  Warnings:

  - You are about to drop the column `address` on the `client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "client_name_key";

-- AlterTable
ALTER TABLE "client" DROP COLUMN "address",
ADD COLUMN     "addresse" VARCHAR(255) DEFAULT 'Néan',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" SET DEFAULT 'Néan';

-- CreateIndex
CREATE UNIQUE INDEX "client_phone_key" ON "client"("phone");
