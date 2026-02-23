-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "sigle" TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenResetExpiry" TIMESTAMP(3),
ADD COLUMN     "tokenResetPassword" TEXT,
ADD COLUMN     "tokenVerification" TEXT;
