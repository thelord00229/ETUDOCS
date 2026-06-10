/*
  Warnings:

  - You are about to drop the column `semestre` on the `Demande` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Document_demandeId_key";

-- AlterTable
ALTER TABLE "Demande" DROP COLUMN "semestre",
ADD COLUMN     "semestres" INTEGER[];
