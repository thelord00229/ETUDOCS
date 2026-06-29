ALTER TABLE "PieceJustificative"
ADD COLUMN IF NOT EXISTS "quittanceFingerprint" TEXT,
ADD COLUMN IF NOT EXISTS "ocrStatut" TEXT,
ADD COLUMN IF NOT EXISTS "ocrTexte" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "PieceJustificative_quittanceFingerprint_key"
ON "PieceJustificative"("quittanceFingerprint");
