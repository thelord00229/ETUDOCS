import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument, previewDocumentBlob } from "../../services/api";

const MAX_DL = 3;

const css = `
  .docs-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .docs-sub   { color:#475569; font-size:.9rem; }

  .docs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

  .doc-file-card {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:14px;
    overflow:hidden; display:flex; flex-direction:column;
    border-top:4px solid #16a34a;
    transition:box-shadow .2s, transform .2s;
  }
  .doc-file-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }
  .doc-file-card.exhausted { border-top-color:#f5a623; }

  .doc-thumb {
    width:100%; height:160px;
    background:#f1f5f9; position:relative; overflow:hidden;
    border-bottom:1px solid #e2e8f0;
  }
  .doc-thumb iframe {
    width:100%; height:400px;
    border:none; pointer-events:none;
  }
  .doc-thumb__overlay {
    position:absolute; inset:0;
    background:linear-gradient(to bottom, transparent 50%, rgba(248,250,252,.7) 100%);
  }
  .doc-thumb__fallback {
    width:100%; height:100%;
    display:flex; align-items:center; justify-content:center;
  }

  .doc-card-bottom { padding:12px 14px; display:flex; flex-direction:column; gap:10px; }

  .doc-card-row {
    display:flex; align-items:center; justify-content:space-between; gap:8px;
  }
  .doc-file-name {
    font-family:'Sora',sans-serif; font-weight:700;
    font-size:.82rem; color:#1a2744;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    flex:1; min-width:0;
  }
  .doc-file-date { font-size:.75rem; color:#94a3b8; margin-top:1px; }

  .dl-pips { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .dl-pip {
    width:9px; height:9px; border-radius:50%;
    background:#e2e8f0; transition:background .4s, transform .3s;
  }
  .dl-pip.pip-1 { background:#16a34a; }
  .dl-pip.pip-2 { background:#eab308; }
  .dl-pip.pip-3 { background:#ef4444; }
  .dl-pip.pip-pulse { animation:pipPulse .5s ease; }
  @keyframes pipPulse {
    0%   { transform:scale(1); }
    50%  { transform:scale(1.6); }
    100% { transform:scale(1); }
  }

  .btn-dl {
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:#16a34a; color:#fff; border:none; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem;
    padding:10px 14px; cursor:pointer; transition:background .2s;
  }
  .btn-dl:hover { background:#15803d; }
  .btn-dl:disabled { opacity:.7; cursor:not-allowed; }

  .btn-pay {
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:#fff7ed; color:#c2410c;
    border:1.5px solid #fed7aa; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem;
    padding:10px 14px; cursor:pointer; transition:background .2s;
  }
  .btn-pay:hover { background:#ffedd5; }

  .qr-banner {
    background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:14px;
    padding:16px 20px; display:flex; align-items:center; gap:14px;
    margin-top:8px;
  }
  .qr-banner__icon {
    width:38px; height:38px; border-radius:10px; background:#16a34a;
    flex-shrink:0; display:flex; align-items:center; justify-content:center;
  }
  .qr-banner__title { font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; color:#16a34a; margin-bottom:2px; }
  .qr-banner__text  { font-size:.8rem; color:#475569; line-height:1.5; }

  .state-box { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px 20px; color:#475569; }
  .state-error { color:#dc2626; }

  @keyframes spin { to { transform:rotate(360deg); } }
  @media (max-width:1000px) { .docs-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:640px)  { .docs-grid { grid-template-columns:1fr; } }
`;

/* ── Helpers ── */
const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "Relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return t || "Document";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
};

const safeTime = (iso) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

/* ── DocCard ── */
function DocCard({ doc, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const [localCount, setLocalCount]   = useState(doc.downloadCount ?? 0);
  const [pulseLast, setPulseLast]     = useState(false);
  const [previewUrl, setPreviewUrl]   = useState(null);

  const exhausted = localCount >= MAX_DL;

  useEffect(() => {
    let objectUrl = null;
    (async () => {
      try {
        const blob = await previewDocumentBlob(doc.reference);
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        setPreviewUrl(null);
      }
    })();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [doc.reference]);

  const handleDl = async () => {
    if (exhausted || downloading) return;
    try {
      setDownloading(true);
      await onDownload(doc.reference);
      const next = localCount + 1;
      setLocalCount(next);
      setPulseLast(true);
      setTimeout(() => setPulseLast(false), 600);
    } catch (e) {
      alert(e?.message || "Téléchargement impossible");
    } finally {
      setDownloading(false);
    }
  };

  const handlePay = () => {
    alert("Redirection vers le paiement — à intégrer.");
  };

  const pipColor = (i) => {
    if (i >= localCount) return "";
    if (i === 0) return "pip-1";
    if (i === 1) return "pip-2";
    return "pip-3";
  };

  return (
    <div className={`doc-file-card${exhausted ? " exhausted" : ""}`}>

      <div className="doc-thumb">
        {previewUrl ? (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={doc.title}
          />
        ) : (
          <div className="doc-thumb__fallback">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        )}
        <div className="doc-thumb__overlay" />
      </div>

      <div className="doc-card-bottom">
        <div className="doc-card-row">
          <div style={{ flex:1, minWidth:0 }}>
            <div className="doc-file-name">{doc.title}</div>
            <div className="doc-file-date">{doc.date}</div>
          </div>
          <div className="dl-pips">
            {Array.from({ length: MAX_DL }, (_, i) => (
              <div
                key={i}
                className={`dl-pip ${pipColor(i)} ${pulseLast && i === localCount - 1 ? "pip-pulse" : ""}`}
              />
            ))}
          </div>
        </div>

        {exhausted ? (
          <button className="btn-pay" onClick={handlePay} type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Renouveler l'accès
          </button>
        ) : (
          <button className="btn-dl" disabled={downloading} onClick={handleDl} type="button">
            {downloading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation:"spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Téléchargement…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Télécharger
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function MesDocuments() {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [demandes, setDemandes] = useState([]);

  const reloadDemandes = async () => {
    const list = await getDemandes();
    setDemandes(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try { await reloadDemandes(); }
      catch { setError("Échec du chargement des documents."); }
      finally { setLoading(false); }
    })();
  }, []);

  const docs = useMemo(() => {
    return demandes
      .filter((d) =>
        d?.statut === "DISPONIBLE" &&
        Array.isArray(d?.documents) &&
        d.documents.length > 0
      )
      .flatMap((d) =>
        (d.documents || [])
          .filter((doc) => doc?.reference)
          .map((doc) => {
            const iso = doc.createdAt || d.updatedAt || d.createdAt || null;
            const sem =
              doc.reference?.includes("-S1-") ? " · Semestre 1"
              : doc.reference?.includes("-S2-") ? " · Semestre 2"
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

  const handleDownload = async (reference) => {
    await downloadDocument(reference);
    await reloadDemandes();
  };

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="docs-title">Mes documents</h2>
        <p className="docs-sub">Téléchargez vos documents certifiés</p>
      </div>

      {loading && <div className="state-box">Chargement des documents…</div>}
      {!loading && error && <div className="state-box state-error">{error}</div>}

      {!loading && !error && (
        <>
          {docs.length === 0 ? (
            <div className="state-box">
              Aucun document disponible pour le moment.<br />
              Vos documents apparaissent ici dès qu'une demande est validée.
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <path d="M14 14h3v3h-3z"/>
                <path d="M17 17h4"/><path d="M17 21v-4"/>
              </svg>
            </div>
            <div>
              <div className="qr-banner__title">Documents certifiés avec QR code</div>
              <div className="qr-banner__text">
                Chaque document contient un QR code unique permettant de vérifier son authenticité.
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}