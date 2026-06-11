import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import api from "../../services/api.js";
import { DocumentCard } from "../../components/DashboardEtudiant/DocumentCard.jsx";
import { EmptyDocuments } from "../../components/DashboardEtudiant/EmptyDocuments.jsx";

export const niveauOrder = [
  "LICENCE",
  "MASTER",
  "LICENCE_1",
  "LICENCE_2",
  "LICENCE_3",
  "MASTER_1",
  "MASTER_2",
];

export const niveauLabels = {
  LICENCE: "Licence",
  MASTER: "Master",
  LICENCE_1: "Licence 1",
  LICENCE_2: "Licence 2",
  LICENCE_3: "Licence 3",
  MASTER_1: "Master 1",
  MASTER_2: "Master 2",
};

const pageCss = `
  .mes-documents-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .mes-documents-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mes-documents-title {
    color: var(--text, #111827);
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
  }

  .mes-documents-subtitle {
    color: var(--text-muted, #4b5563);
    font-size: .92rem;
    margin: 0;
  }

  .documents-level-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .documents-level-heading {
    align-items: center;
    display: flex;
    gap: 14px;
  }

  .documents-level-title {
    color: var(--text, #111827);
    flex: 0 0 auto;
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    margin: 0;
  }

  .documents-level-line {
    background: var(--border, #e5e7eb);
    flex: 1 1 auto;
    height: 1px;
  }

  .documents-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  .documents-state-error {
    background: var(--bg-secondary, #fff);
    border: 1px solid #fecaca;
    border-radius: 16px;
    color: #b91c1c;
    padding: 18px 20px;
  }

  .documents-skeleton-card {
    animation: documentsPulse 1.2s ease-in-out infinite;
    background: var(--bg-secondary, #fff);
    border: 1px solid var(--border, #eef2f7);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, .08);
    min-height: 288px;
    padding: 24px;
  }

  .documents-skeleton-line {
    background: var(--border, #e5e7eb);
    border-radius: 999px;
    height: 12px;
    margin-bottom: 16px;
  }

  .documents-skeleton-line.short { width: 42%; }
  .documents-skeleton-line.medium { width: 66%; }
  .documents-skeleton-line.long { width: 88%; }

  @keyframes documentsPulse {
    0%, 100% { opacity: .58; }
    50% { opacity: 1; }
  }
`;

const getSemesterValue = (document) => {
  const semestres = Array.isArray(document?.semestres) ? document.semestres : [];
  return Number(semestres[0] || 0);
};

const parseSemestresFromReference = (reference) => {
  const match = String(reference || "").match(/_S([0-9-]+)(?=_)/);
  if (!match) return [];
  return match[1]
    .split("-")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
};

const normalizeSemestres = (document, fallbackSemestres) => {
  const fromReference = parseSemestresFromReference(document?.reference);
  if (fromReference.length) return fromReference;
  if (Array.isArray(document?.semestres) && document.semestres.length) {
    return document.semestres;
  }
  return Array.isArray(fallbackSemestres) ? fallbackSemestres : [];
};

const inferNiveauFromSemestres = (semestres) => {
  if (!Array.isArray(semestres) || semestres.length === 0) return "";
  const maxSemestre = Math.max(...semestres.map(Number).filter(Number.isFinite));
  if (!Number.isFinite(maxSemestre)) return "";
  if (maxSemestre >= 7) return "MASTER";
  return "LICENCE";
};

const normalizeDocumentsResponse = (payload) => {
  const documents = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.documents)
      ? payload.documents
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return documents.map((document) => {
    const semestres = normalizeSemestres(document);
    return {
      ...document,
      semestres,
      niveau: inferNiveauFromSemestres(semestres) || document.niveau,
    };
  });
};

const normalizeDemandesDocuments = (payload) => {
  const demandes = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return demandes.flatMap((demande) =>
    (Array.isArray(demande?.documents) ? demande.documents : []).map((document) => {
      const semestres = normalizeSemestres(document, demande.semestres);
      return {
        ...document,
        anneeAcademique: demande.anneeAcademique,
        niveau: inferNiveauFromSemestres(semestres) || document.niveau || demande.niveau,
        semestres,
        serviceCible: demande.serviceCible,
        statut: demande.statut || document.statut,
        typeDocument: document.typeDocument || demande.typeDocument,
      };
    })
  );
};

/**
 * Regroupe les documents par niveau en respectant l'ordre académique attendu.
 * Les documents sans niveau reconnu sont conservés à la fin pour éviter une perte d'affichage.
 */
export const groupByNiveau = (documents) => {
  const grouped = {};

  documents.forEach((document) => {
    const niveau = document?.niveau || inferNiveauFromSemestres(document?.semestres) || "AUTRE";
    if (!grouped[niveau]) grouped[niveau] = [];
    grouped[niveau].push(document);
  });

  Object.keys(grouped).forEach((niveau) => {
    grouped[niveau].sort((a, b) => getSemesterValue(a) - getSemesterValue(b));
  });

  return grouped;
};

function DocumentsSkeleton() {
  return (
    <div className="documents-grid" aria-label="Chargement des documents">
      {[0, 1, 2].map((item) => (
        <div className="documents-skeleton-card" key={item}>
          <div className="documents-skeleton-line medium" />
          <div className="documents-skeleton-line short" />
          <div style={{ height: 24 }} />
          <div className="documents-skeleton-line long" />
          <div className="documents-skeleton-line long" />
          <div className="documents-skeleton-line medium" />
          <div style={{ height: 28 }} />
          <div className="documents-skeleton-line long" />
        </div>
      ))}
    </div>
  );
}

export function MesDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    let alive = true;

    const fetchDocuments = async () => {
      setLoading(true);
      setError("");

      try {
        let response;
        let nextDocuments;

        try {
          response = await api.get("/api/documents");
          nextDocuments = normalizeDocumentsResponse(response.data);
        } catch (err) {
          if (err?.response?.status !== 404) throw err;

          // Compatibilité avec le backend actuel du repo, en attendant GET /api/documents.
          response = await api.get("/api/demandes");
          nextDocuments = normalizeDemandesDocuments(response.data);
        }

        if (!alive) return;
        setDocuments(nextDocuments);
      } catch (err) {
        if (!alive) return;
        const message =
          err?.response?.data?.message ||
          "Impossible de charger vos documents pour le moment.";
        setError(message);
        showToast(message, "error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchDocuments();

    return () => {
      alive = false;
    };
  }, [showToast]);

  const groupedDocuments = useMemo(() => groupByNiveau(documents), [documents]);
  const visibleLevels = useMemo(() => {
    const knownLevels = niveauOrder.filter((niveau) => groupedDocuments[niveau]?.length);
    const otherLevels = Object.keys(groupedDocuments)
      .filter((niveau) => !niveauOrder.includes(niveau))
      .sort();
    return [...knownLevels, ...otherLevels];
  }, [groupedDocuments]);

  const handleDownloadSuccess = (reference) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.reference === reference
          ? {
              ...document,
              downloadCount: Math.min(
                Number(document.downloadCount || 0) + 1,
                Number(document.maxDownloads || 3)
              ),
            }
          : document
      )
    );
    showToast("Téléchargement démarré", "success");
  };

  const handleInfo = (message) => {
    showToast(message, "info");
  };

  const handleError = (message) => {
    showToast(message, "error");
  };

  return (
    <DashboardLayout>
      <style>{pageCss}</style>

      <section className="mes-documents-page">
        <header className="mes-documents-header">
          <h2 className="mes-documents-title">Mes documents</h2>
          <p className="mes-documents-subtitle">Téléchargez vos documents certifiés</p>
        </header>

        {loading && <DocumentsSkeleton />}

        {!loading && error && (
          <div className="documents-state-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && visibleLevels.length === 0 && <EmptyDocuments />}

        {!loading &&
          !error &&
          visibleLevels.map((niveau) => (
            <section className="documents-level-section" key={niveau}>
              {niveau !== "AUTRE" && (
                <div className="documents-level-heading">
                  <h3 className="documents-level-title">
                    {niveauLabels[niveau] || niveau}
                  </h3>
                  <span className="documents-level-line" aria-hidden="true" />
                </div>
              )}

              <div className="documents-grid">
                {groupedDocuments[niveau].map((document) => (
                  <DocumentCard
                    document={document}
                    key={document.id || document.reference}
                    onError={handleError}
                    onDownloadSuccess={handleDownloadSuccess}
                    onInfo={handleInfo}
                  />
                ))}
              </div>
            </section>
          ))}
      </section>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </DashboardLayout>
  );
}

export default MesDocuments;
