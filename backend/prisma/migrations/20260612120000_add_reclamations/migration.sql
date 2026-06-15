-- CreateEnum
CREATE TYPE "ReclamationType" AS ENUM ('ERREUR_IDENTITE', 'ERREUR_NOTES', 'ERREUR_SEMESTRE', 'ERREUR_NIVEAU', 'ERREUR_INSTITUTION', 'DOCUMENT_ILLISIBLE', 'AUTRE');

-- CreateEnum
CREATE TYPE "ReclamationStatut" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'RESOLUE_DOC_REGENERE', 'RESOLUE_SANS_DOC', 'REJETEE');

-- CreateTable
CREATE TABLE "Reclamation" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "type" "ReclamationType" NOT NULL,
    "description" TEXT NOT NULL,
    "piecesJointes" TEXT[],
    "statut" "ReclamationStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "traiteParId" TEXT,
    "reponseAgent" TEXT,
    "documentCorrigeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Reclamation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reclamation_documentId_idx" ON "Reclamation"("documentId");

-- CreateIndex
CREATE INDEX "Reclamation_etudiantId_idx" ON "Reclamation"("etudiantId");

-- CreateIndex
CREATE INDEX "Reclamation_traiteParId_idx" ON "Reclamation"("traiteParId");

-- CreateIndex
CREATE INDEX "Reclamation_statut_idx" ON "Reclamation"("statut");

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_documentCorrigeId_fkey" FOREIGN KEY ("documentCorrigeId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
