/*
  Warnings:

  - The values [ATTESTATION_INSCRIPTION] on the enum `TypePiece` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypePiece_new" AS ENUM ('CIP', 'QUITTANCE', 'ACTE_NAISSANCE', 'JUSTIFICATIF_INSCRIPTION');
ALTER TABLE "PieceJustificative" ALTER COLUMN "typePiece" TYPE "TypePiece_new" USING ("typePiece"::text::"TypePiece_new");
ALTER TABLE "PieceRequise" ALTER COLUMN "typePiece" TYPE "TypePiece_new" USING ("typePiece"::text::"TypePiece_new");
ALTER TYPE "TypePiece" RENAME TO "TypePiece_old";
ALTER TYPE "TypePiece_new" RENAME TO "TypePiece";
DROP TYPE "public"."TypePiece_old";
COMMIT;
