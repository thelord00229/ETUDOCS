-- Suppression definitive du workflow de renouvellement de telechargement.
DROP TABLE IF EXISTS "PaiementTelechargement";
DROP TYPE IF EXISTS "StatutPaiement";

-- Les documents sont maintenant envoyes par email, sans quota de telechargement.
ALTER TABLE "Document" DROP COLUMN IF EXISTS "downloadCount";
ALTER TABLE "Document" DROP COLUMN IF EXISTS "maxDownloads";
ALTER TABLE "Document" DROP COLUMN IF EXISTS "blockedAt";
