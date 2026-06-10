/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('DOCUMENT_GENERE', 'ATTENTE_SIGNATURE_DIRECTEUR', 'DISPONIBLE', 'REJETEE');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "signedByDAAt" TIMESTAMP(3),
ADD COLUMN     "signedByDIRAt" TIMESTAMP(3),
ADD COLUMN     "statut" "StatutDocument" NOT NULL DEFAULT 'DOCUMENT_GENERE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
