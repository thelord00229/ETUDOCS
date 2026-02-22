/*
  Warnings:

  - The values [AGENT,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [EN_COURS,VALIDEE] on the enum `StatutDemande` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qrPayload]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[demandeId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numeroEtudiant]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceCible` to the `Demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeDocument` to the `Demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrPayload` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typePiece` to the `PieceJustificative` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Service" AS ENUM ('EXAMENS', 'SCOLARITE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('ATTESTATION_INSCRIPTION', 'RELEVE_NOTES');

-- CreateEnum
CREATE TYPE "TypePiece" AS ENUM ('CIP', 'QUITTANCE', 'ACTE_NAISSANCE', 'ATTESTATION_INSCRIPTION');

-- CreateEnum
CREATE TYPE "StatutPiece" AS ENUM ('SOUMISE', 'VALIDEE', 'REJETEE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ETUDIANT', 'SECRETAIRE_ADJOINT', 'SECRETAIRE_GENERAL', 'CHEF_DIVISION', 'DIRECTEUR_ADJOINT', 'DIRECTEUR', 'SUPER_ADMIN');
ALTER TABLE "public"."Utilisateur" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Utilisateur" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "Utilisateur" ALTER COLUMN "role" SET DEFAULT 'ETUDIANT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatutDemande_new" AS ENUM ('SOUMISE', 'CORRECTION_DEMANDEE', 'TRANSMISE_SECRETAIRE_GENERAL', 'TRANSMISE_CHEF_DIVISION', 'DOCUMENT_GENERE', 'ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT', 'ATTENTE_SIGNATURE_DIRECTEUR', 'DISPONIBLE', 'REJETEE');
ALTER TABLE "public"."Demande" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "Demande" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TABLE "WorkflowHistory" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TYPE "StatutDemande" RENAME TO "StatutDemande_old";
ALTER TYPE "StatutDemande_new" RENAME TO "StatutDemande";
DROP TYPE "public"."StatutDemande_old";
ALTER TABLE "Demande" ALTER COLUMN "statut" SET DEFAULT 'SOUMISE';
COMMIT;

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "semestre" INTEGER,
ADD COLUMN     "serviceCible" "Service" NOT NULL,
ADD COLUMN     "typeDocument" "TypeDocument" NOT NULL;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxDownloads" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "qrPayload" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "directeurAdjointNom" TEXT,
ADD COLUMN     "directeurAdjointTitre" TEXT,
ADD COLUMN     "directeurNom" TEXT,
ADD COLUMN     "directeurTitre" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "signatureDirecteurAdjointUrl" TEXT,
ADD COLUMN     "signatureDirecteurUrl" TEXT,
ADD COLUMN     "tamponDirecteurAdjointUrl" TEXT,
ADD COLUMN     "tamponDirecteurUrl" TEXT;

-- AlterTable
ALTER TABLE "PieceJustificative" ADD COLUMN     "commentaire" TEXT,
ADD COLUMN     "statut" "StatutPiece" NOT NULL DEFAULT 'SOUMISE',
ADD COLUMN     "typePiece" "TypePiece" NOT NULL,
ADD COLUMN     "valideeAt" TIMESTAMP(3),
ADD COLUMN     "valideeParId" TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "numeroEtudiant" TEXT,
ADD COLUMN     "service" "Service";

-- AlterTable
ALTER TABLE "WorkflowHistory" ADD COLUMN     "actorId" TEXT;

-- CreateTable
CREATE TABLE "PieceRequise" (
    "id" TEXT NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "typePiece" "TypePiece" NOT NULL,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "PieceRequise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PieceRequise_institutionId_typeDocument_typePiece_key" ON "PieceRequise"("institutionId", "typeDocument", "typePiece");

-- CreateIndex
CREATE UNIQUE INDEX "Document_reference_key" ON "Document"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Document_qrPayload_key" ON "Document"("qrPayload");

-- CreateIndex
CREATE UNIQUE INDEX "Document_demandeId_key" ON "Document"("demandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_numeroEtudiant_key" ON "Utilisateur"("numeroEtudiant");

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceJustificative" ADD CONSTRAINT "PieceJustificative_valideeParId_fkey" FOREIGN KEY ("valideeParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceRequise" ADD CONSTRAINT "PieceRequise_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
