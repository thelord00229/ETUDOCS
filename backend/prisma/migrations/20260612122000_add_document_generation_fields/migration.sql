-- CreateEnum
CREATE TYPE "GenerationSource" AS ENUM ('DEMANDE_INITIALE', 'RECLAMATION', 'PAIEMENT_RENOUVELLEMENT');

-- AlterEnum
ALTER TYPE "StatutDocument" ADD VALUE 'REMPLACE';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "generationSource" "GenerationSource" NOT NULL DEFAULT 'DEMANDE_INITIALE',
ADD COLUMN "remplaceParId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_remplaceParId_key" ON "Document"("remplaceParId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_remplaceParId_fkey" FOREIGN KEY ("remplaceParId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
