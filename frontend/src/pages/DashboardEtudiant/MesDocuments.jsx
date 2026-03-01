import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument } from "../../services/api";

const MAX_DL = 3;

const css = `
  .docs-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .docs-sub   { color:#475569; font-size:.9rem; }

  .docs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

  .doc-file-card {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px;
    display:flex; flex-direction:column; gap:12px;
    border-top:4px solid #16a34a;
    transition:box-shadow .2s, transform .2s, opacity .2s;
  }
  .doc-file-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }

  /* Expiré => grisé/disabled */
  .doc-file-card.expired {
    border-top-color:#94a3b8;
    background:#f8fafc;
    opacity:.92;
  }
  .doc-file-card.expired:hover {
    transform:none;
    box-shadow:none;
  }

  .doc-file-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; }
  .doc-file-card.expired .doc-file-title { color:#64748b; }

  .doc-file-meta  { display:flex; align-items:center; gap:6px; font-size:.82rem; color:#94a3b8; }

  .dl-counter { display:flex; align-items:center; gap:8px; font-size:.8rem; color:#475569; }
  .dl-counter__pips { display:flex; gap:4px; }
  .dl-pip { width:10px; height:10px; border-radius:50%; background:#e2e8f0; transition:background .3s; }
  .dl-pip.used { background:#16a34a; }
  .dl-pip.used.last { background:#dc2626; }

  .limit-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:#f1f5f9; border:1px solid #e2e8f0;
    color:#64748b; font-size:.78rem; font-weight:700;
    padding:5px 10px; border-radius:999px;
  }

  .btn-dl {
    flex:1; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:#16a34a; color:#fff; border:none; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem;
    padding:10px 16px; cursor:pointer; transition:background .2s;
  }
  .btn-dl:hover { background:#15803d; }
  .btn-dl:disabled { opacity:.7; cursor:not-allowed; }

  .btn-dl.expired-btn {
    background:#94a3b8;
  }
  .btn-dl.expired-btn:hover { background:#94a3b8; }

  .qr-banner {
    background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:14px;
    padding:20px 24px; display:flex; align-items:flex-start; gap:16px;
    margin-top:18px;
  }
  .qr-banner__icon { width:44px; height:44px; border-radius:12px; background:#16a34a; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .qr-banner__title { font-family:'Sora',sans-serif; font-weight:700; color:#16a34a; margin-bottom:4px; }
  .qr-banner__text  { font-size:.85rem; color:#475569; line-height:1.6; }

  .state-box { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px 20px; color:#475569; }
  .state-error { color:#dc2626; }

  @media (max-width:1000px) { .docs-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:640px)  { .docs-grid { grid-template-columns:1fr; } }
`;

const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "Relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return t || "Document";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const safeTime = (iso) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

function DlCounter({ count }) {
  const c = Math.max(0, Math.min(MAX_DL, count || 0));
  return (
    <div className="dl-counter">
      <div className="dl-counter__pips">
        {Array.from({ length: MAX_DL }, (_, i) => (
          <div
            key={i}
            className={`dl-pip${i < c ? " used" : ""}${i < c && i === MAX_DL - 1 ? " last" : ""}`}
          />
        ))}
      </div>
      <span>
        {c}/{MAX_DL} téléchargement{c > 1 ? "s" : ""}
      </span>
    </div>
  );
}

function DocCard({ doc, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const [localCount, setLocalCount] = useState(doc.downloadCount ?? 0);

  const expired = localCount >= MAX_DL;

  const handleDl = async () => {
    if (expired) return;
    try {
      setDownloading(true);
      await onDownload(doc.reference);
      setLocalCount((c) => c + 1);
    } catch (e) {
      alert(e?.message || "Téléchargement impossible");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`doc-file-card${expired ? " expired" : ""}`}>
      <div className="doc-file-title">{doc.title}</div>
      <div className="doc-file-meta">{doc.date}</div>
      <div className="doc-file-meta">{doc.reference}</div>

      <DlCounter count={localCount} />

      {expired ? (
        <>
          <div className="limit-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Limite de téléchargement atteinte
          </div>
          <button className="btn-dl expired-btn" type="button" disabled>
            Télécharger
          </button>
        </>
      ) : (
        <button className="btn-dl" disabled={downloading} onClick={handleDl} type="button">
          {downloading ? "Téléchargement..." : "Télécharger"}
        </button>
      )}
    </div>
  );
}

export default function MesDocuments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        await reloadDemandes();
      } catch {
        setError("Échec du chargement des documents.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const docs = useMemo(() => {
    // ✅ On affiche tous les documents des demandes DISPONIBLE
    // y compris ceux expirés (downloadCount >= 3) => ils seront grisés.
    return demandes
      .filter((d) => d?.statut === "DISPONIBLE" && Array.isArray(d?.documents) && d.documents.length > 0)
      .flatMap((d) =>
        (d.documents || [])
          .filter((doc) => doc?.reference)
          .map((doc) => {
            const iso = doc.createdAt || d.updatedAt || d.createdAt || null;

            const sem =
              typeof doc.reference === "string" && doc.reference.includes("-S1-")
                ? " • Semestre 1"
                : typeof doc.reference === "string" && doc.reference.includes("-S2-")
                ? " • Semestre 2"
                : "";

            return {
              id: `${d.id}-${doc.reference}`,
              title: `${labelType(d.typeDocument)}${sem}`,
              date: formatDate(iso),
              ts: safeTime(iso),
              reference: doc.reference,
              downloadCount: doc.downloadCount ?? 0,
            };
          })
      )
      .sort((a, b) => b.ts - a.ts);
  }, [demandes]);

  const reloadDemandes = async () => {
    const list = await getDemandes();
    setDemandes(Array.isArray(list) ? list : []);
  };

  const handleDownload = async (reference) => {
    await downloadDocument(reference);
    // ✅ sync backend : récupère le nouveau downloadCount
    await reloadDemandes();
  };

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="docs-title">Mes documents</h2>
        <p className="docs-sub">Téléchargez et vérifiez vos documents certifiés</p>
      </div>

      {loading && <div className="state-box">Chargement des documents…</div>}
      {!loading && error && <div className="state-box state-error">{error}</div>}

      {!loading && !error && (
        <>
          {docs.length === 0 ? (
            <div className="state-box">
              Aucun document disponible pour le moment.<br />
              (Les documents apparaissent ici dès qu'une demande passe au statut <b>DISPONIBLE</b>.)
            </div>
          ) : (
            <div className="docs-grid">
              {docs.map((d) => (
                <DocCard key={d.id} doc={d} onDownload={handleDownload} />
              ))}
            </div>
          )}

          <div className="qr-banner">
            <div className="qr-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/>
              </svg>
            </div>
            <div>
              <div className="qr-banner__title">Documents certifiés avec QR code</div>
              <div className="qr-banner__text">
                Chaque document téléchargé contient un QR code unique permettant de vérifier son authenticité.
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}