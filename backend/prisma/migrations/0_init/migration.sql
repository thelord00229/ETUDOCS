-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('EXAMENS', 'SCOLARITE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ETUDIANT', 'SECRETAIRE_ADJOINT', 'SECRETAIRE_GENERAL', 'CHEF_DIVISION', 'DIRECTEUR_ADJOINT', 'DIRECTEUR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('ATTESTATION_INSCRIPTION', 'RELEVE_NOTES');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('SOUMISE', 'CORRECTION_DEMANDEE', 'TRANSMISE_SECRETAIRE_ADJOINT', 'TRANSMISE_SECRETAIRE_GENERAL', 'DOCUMENT_GENERE', 'ATTENTE_VALIDATION_DA', 'ATTENTE_SIGNATURE_DIRECTEUR', 'DISPONIBLE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('DOCUMENT_GENERE', 'ATTENTE_SIGNATURE_DIRECTEUR', 'DISPONIBLE', 'REJETEE');

-- CreateEnum
CREATE TYPE "TypePiece" AS ENUM ('CIP', 'QUITTANCE', 'ACTE_NAISSANCE', 'JUSTIFICATIF_INSCRIPTION');

-- CreateEnum
CREATE TYPE "StatutPiece" AS ENUM ('SOUMISE', 'VALIDEE', 'REJETEE');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "sigle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoUrl" TEXT,
    "tamponDirecteurUrl" TEXT,
    "tamponDirecteurAdjointUrl" TEXT,
    "directeurNom" TEXT,
    "directeurTitre" TEXT,
    "directeurAdjointNom" TEXT,
    "directeurAdjointTitre" TEXT,
    "signatureDirecteurUrl" TEXT,
    "signatureDirecteurAdjointUrl" TEXT,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ETUDIANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT,
    "numeroEtudiant" TEXT,
    "service" "Service",
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerification" TEXT,
    "tokenResetPassword" TEXT,
    "tokenResetExpiry" TIMESTAMP(3),
    "filiere" TEXT,
    "niveau" TEXT,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "typeDocument" "TypeDocument" NOT NULL,
    "semestres" INTEGER[],
    "anneeAcademique" TEXT,
    "serviceCible" "Service" NOT NULL,
    "statut" "StatutDemande" NOT NULL DEFAULT 'SOUMISE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "utilisateurId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" TEXT NOT NULL,
    "statut" "StatutDemande" NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "demandeId" TEXT NOT NULL,
    "actorId" TEXT,

    CONSTRAINT "WorkflowHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "qrPayload" TEXT NOT NULL,
    "urlPdf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "statut" "StatutDocument" NOT NULL DEFAULT 'DOCUMENT_GENERE',
    "signedByDAAt" TIMESTAMP(3),
    "signedByDIRAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 3,
    "blockedAt" TIMESTAMP(3),
    "demandeId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceJustificative" (
    "id" TEXT NOT NULL,
    "typePiece" "TypePiece" NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutPiece" NOT NULL DEFAULT 'SOUMISE',
    "commentaire" TEXT,
    "valideeAt" TIMESTAMP(3),
    "valideeParId" TEXT,
    "demandeId" TEXT NOT NULL,

    CONSTRAINT "PieceJustificative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceRequise" (
    "id" TEXT NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "typePiece" "TypePiece" NOT NULL,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "PieceRequise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "demandeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_numeroEtudiant_key" ON "Utilisateur"("numeroEtudiant");

-- CreateIndex
CREATE UNIQUE INDEX "Demande_reference_key" ON "Demande"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Document_reference_key" ON "Document"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Document_qrPayload_key" ON "Document"("qrPayload");

-- CreateIndex
CREATE UNIQUE INDEX "PieceRequise_institutionId_typeDocument_typePiece_key" ON "PieceRequise"("institutionId", "typeDocument", "typePiece");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceJustificative" ADD CONSTRAINT "PieceJustificative_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceJustificative" ADD CONSTRAINT "PieceJustificative_valideeParId_fkey" FOREIGN KEY ("valideeParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceRequise" ADD CONSTRAINT "PieceRequise_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

