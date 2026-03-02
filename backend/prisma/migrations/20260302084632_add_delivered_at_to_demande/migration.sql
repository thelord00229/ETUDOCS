/*
  Warnings:

  - The values [TRANSMISE_CHEF_DIVISION,ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT] on the enum `StatutDemande` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutDemande_new" AS ENUM ('SOUMISE', 'CORRECTION_DEMANDEE', 'TRANSMISE_SECRETAIRE_ADJOINT', 'TRANSMISE_SECRETAIRE_GENERAL', 'DOCUMENT_GENERE', 'ATTENTE_SIGNATURE_DIRECTEUR', 'DISPONIBLE', 'REJETEE', 'ANNULEE');
ALTER TABLE "public"."Demande" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "Demande" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TABLE "WorkflowHistory" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TYPE "StatutDemande" RENAME TO "StatutDemande_old";
ALTER TYPE "StatutDemande_new" RENAME TO "StatutDemande";
DROP TYPE "public"."StatutDemande_old";
ALTER TABLE "Demande" ALTER COLUMN "statut" SET DEFAULT 'SOUMISE';
COMMIT;

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "deliveredAt" TIMESTAMP(3);
