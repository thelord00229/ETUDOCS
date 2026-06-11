import { useState } from "react";
import api from "../../services/api.js";
import { DownloadRing } from "./DownloadRing.jsx";

const typeLabels = {
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
  RELEVE_NOTES: "Relevé de notes",
};

const niveauLabels = {
  LICENCE: "Licence",
  MASTER: "Master",
  LICENCE_1: "Licence 1",
  LICENCE_2: "Licence 2",
  LICENCE_3: "Licence 3",
  MASTER_1: "Master 1",
  MASTER_2: "Master 2",
};

const statusLabels = {
  DISPONIBLE: "Disponible",
  ATTENTE_SIGNATURE_DIRECTEUR: "En attente de signature",
  DOCUMENT_GENERE: "Document généré",
  REJETEE: "Rejeté",
  QUOTA_EXPIRE: "Téléchargements épuisés",
};

const statusClasses = {
  DISPONIBLE: "document-status document-status--available",
  ATTENTE_SIGNATURE_DIRECTEUR: "document-status document-status--pending",
  DOCUMENT_GENERE: "document-status document-status--generated",
  REJETEE: "document-status document-status--rejected",
  QUOTA_EXPIRE: "document-status document-status--rejected",
};

function DownloadIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function RefreshCwIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
      <path d="M3 21v-5h5" />
      <path d="M3 12A9 9 0 0 1 18.4 5.6L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

const cardCss = `
  .document-card {
    background: var(--bg-secondary, #fff);
    border: 1px solid var(--border, #eef2f7);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, .08);
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .document-card__top {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  .document-card__title {
    color: var(--text, #111827);
    font-family: 'Sora', sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    line-height: 1.3;
    margin: 0 0 8px;
  }

  .document-status {
    border-radius: 999px;
    display: inline-flex;
    font-size: .76rem;
    font-weight: 700;
    padding: 4px 10px;
  }

  .document-status--available {
    background: #dcfce7;
    color: #166534;
  }

  .document-status--pending {
    background: #ffedd5;
    color: #9a3412;
  }

  .document-status--generated {
    background: #dbeafe;
    color: #1e40af;
  }

  .document-status--rejected {
    background: #fee2e2;
    color: #991b1b;
  }

  .document-card__details {
    border-top: 1px solid var(--border, #eef2f7);
    display: flex;
    flex-direction: column;
  }

  .document-card__row {
    align-items: center;
    border-bottom: 1px solid var(--border, #eef2f7);
    display: flex;
    gap: 18px;
    justify-content: space-between;
    padding: 12px 0;
  }

  .document-card__label {
    color: var(--text-muted, #4b5563);
    font-size: .88rem;
    font-weight: 700;
  }

  .document-card__value {
    color: var(--text, #1f2937);
    font-size: .9rem;
    font-weight: 700;
    text-align: right;
  }

  .document-card__actions {
    display: flex;
    gap: 12px;
  }

  .document-card__button {
    align-items: center;
    border-radius: 10px;
    border: 0;
    cursor: pointer;
    display: inline-flex;
    flex: 1 1 0;
    font-family: 'Sora', sans-serif;
    font-size: .82rem;
    font-weight: 800;
    gap: 8px;
    justify-content: center;
    min-height: 42px;
    padding: 10px 14px;
    transition: background .18s ease, border-color .18s ease, color .18s ease, opacity .18s ease;
  }

  .document-card__button:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .document-card__button--download {
    background: #16a34a;
    color: #fff;
  }

  .document-card__button--download:not(:disabled):hover {
    background: #15803d;
  }

  .document-card__button--reclaim {
    background: #f97316;
    color: #fff;
  }

  .document-card__button--repay {
    background: transparent;
    border: 2px solid #eab308;
    color: #ca8a04;
  }

  .document-card__button--repay:not(:disabled):hover {
    background: #fefce8;
  }

  @media (max-width: 640px) {
    .document-card {
      padding: 20px;
    }

    .document-card__actions {
      flex-direction: column;
    }

    .document-card__button {
      width: 100%;
    }
  }
`;

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
};

export const formatSemestre = (document) => {
  if (document?.typeDocument === "ATTESTATION_INSCRIPTION") {
    return "Semestre 1 & 2";
  }
  const semestres = Array.isArray(document?.semestres) ? document.semestres : [];
  if (semestres.length === 0) return "Semestre —";
  if (semestres.length === 1) return `Semestre ${semestres[0]}`;
  const last = semestres[semestres.length - 1];
  const others = semestres.slice(0, -1).join(", ");
  return `Semestres ${others} et ${last}`;
};

const downloadBlob = async (document) => {
  const response = await api.get(`/api/documents/download/${document.reference}`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = blobUrl;
  link.download = `${document.reference || "document"}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

/**
 * @param {{
 *   document: {
 *     id?: string,
 *     reference: string,
 *     typeDocument: string,
 *     semestres?: number[],
 *     anneeAcademique?: string,
 *     niveau?: string,
 *     statut?: string,
 *     downloadCount?: number,
 *     maxDownloads?: number,
 *     deliveredAt?: string
 *   },
 *   onDownloadSuccess?: (reference: string) => void,
 *   onError?: (message: string) => void,
 *   onInfo?: (message: string) => void
 * }} props
 */
export function DocumentCard({ document, onDownloadSuccess, onError, onInfo }) {
  const [downloadCount, setDownloadCount] = useState(Number(document.downloadCount || 0));
  const [downloading, setDownloading] = useState(false);
  const maxDownloads = Number(document.maxDownloads || 3);
  const downloadsExhausted = downloadCount >= maxDownloads;
  const canDownload = document.statut === "DISPONIBLE" && !downloadsExhausted;
  const canRepay = downloadsExhausted;
  const displayStatus = downloadsExhausted ? "QUOTA_EXPIRE" : document.statut;

  const handleDownload = async () => {
    if (!canDownload || downloading) return;

    try {
      setDownloading(true);
      await downloadBlob(document);
      const nextCount = Math.min(downloadCount + 1, maxDownloads);
      setDownloadCount(nextCount);
      onDownloadSuccess?.(document.reference);
    } catch (err) {
      onError?.(
        err?.response?.data?.message ||
          "Téléchargement impossible pour le moment."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleReclaim = () => {
    onInfo?.("Fonctionnalité bientôt disponible");
  };

  const handleRepay = () => {
    if (!canRepay) return;
    onInfo?.("Redirection vers le paiement...");
  };

  return (
    <article className="document-card">
      <style>{cardCss}</style>

      <div className="document-card__top">
        <div>
          <h4 className="document-card__title">
            {typeLabels[document.typeDocument] || "Document académique"}
          </h4>
          <span className={statusClasses[displayStatus] || "document-status document-status--generated"}>
            {statusLabels[displayStatus] || displayStatus || "Statut inconnu"}
          </span>
        </div>

        <DownloadRing downloadCount={downloadCount} maxDownloads={maxDownloads} />
      </div>

      <div className="document-card__details">
        <div className="document-card__row">
          <span className="document-card__label">Niveau :</span>
          <span className="document-card__value">
            {niveauLabels[document.niveau] || document.niveau || "—"}
          </span>
        </div>
        <div className="document-card__row">
          <span className="document-card__label">Semestre :</span>
          <span className="document-card__value">{formatSemestre(document)}</span>
        </div>
        <div className="document-card__row">
          <span className="document-card__label">Date de délivrance :</span>
          <span className="document-card__value">{formatDate(document.deliveredAt)}</span>
        </div>
      </div>

      <div className="document-card__actions">
        <button
          className="document-card__button document-card__button--download"
          disabled={!canDownload || downloading}
          onClick={handleDownload}
          type="button"
        >
          <DownloadIcon />
          {downloading ? "Téléchargement..." : "Télécharger"}
        </button>

        <button
          className="document-card__button document-card__button--reclaim"
          disabled
          onClick={handleReclaim}
          title="Fonctionnalité bientôt disponible"
          type="button"
        >
          <MessageSquareIcon />
          Réclamer
        </button>

        {canRepay && (
          <button
            className="document-card__button document-card__button--repay"
            onClick={handleRepay}
            type="button"
          >
            <RefreshCwIcon />
            Payer à nouveau
          </button>
        )}
      </div>
    </article>
  );
}
