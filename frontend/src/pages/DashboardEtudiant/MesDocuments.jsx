import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument, previewDocumentBlob } from "../../services/api";

const MAX_DL = 3;

const css = `
  .docs-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .docs-sub   { color:#475569; font-size:.9rem; }

  .docs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }

  /* ── CARD ── */
  .doc-file-card {
    background:#2a3647; border-radius:16px;
    overflow:hidden; display:flex; flex-direction:column;
    transition:box-shadow .2s, transform .2s;
    border:1px solid #2d3748;
  }
  .doc-file-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.3); transform:translateY(-2px); }

  /* ── MINIATURE ── */
  .doc-thumb {
    width:100%; height:160px;
    background:#1f2a38; position:relative; overflow:hidden;
  }
  .doc-thumb iframe {
    width:100%; height:400px;
    border:none; pointer-events:none;
    opacity:.85;
  }
  .doc-thumb__overlay {
    position:absolute; inset:0;
    background:linear-gradient(to bottom, rgba(30,37,53,.2) 0%, rgba(30,37,53,.75) 100%);
  }
  .doc-thumb__fallback {
    width:100%; height:100%;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
    background:#161d2e;
  }
  .doc-thumb__fallback-icon {
    width:52px; height:52px; border-radius:12px;
    background:#2d3748; display:flex; align-items:center; justify-content:center;
  }
  .doc-thumb__fallback-lines { display:flex; flex-direction:column; gap:6px; width:80px; }
  .doc-thumb__fallback-line {
    height:6px; border-radius:3px; background:#2d3748;
  }

  /* Overlay "accès restreint" pour les exhausted */
  .doc-thumb__lock {
    position:absolute; inset:0;
    background:rgba(14,18,28,.75);
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  }
  .doc-thumb__lock-icon {
    width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,.08);
    display:flex; align-items:center; justify-content:center;
  }
  .doc-thumb__lock-label {
    font-family:'Sora',sans-serif; font-weight:700; font-size:.65rem;
    color:rgba(255,255,255,.4); letter-spacing:.12em; text-transform:uppercase;
  }

  /* ── BAS DE CARTE ── */
  .doc-card-bottom { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }

  /* ── LIGNE PIPS + BADGE ── */
  .doc-card-top-row {
    display:flex; align-items:center; justify-content:space-between;
  }

  .dl-pips { display:flex; align-items:center; gap:5px; }
  .dl-pip {
    width:9px; height:9px; border-radius:50%;
    background:#2d3748; transition:background .4s, transform .3s;
  }
  .dl-pip.pip-1 { background:#2e7d32; }
  .dl-pip.pip-2 { background:#fcd116; }
  .dl-pip.pip-3 { background:#ef4444; }
  .dl-pip.pip-pulse { animation:pipPulse .5s ease; }
  @keyframes pipPulse {
    0%   { transform:scale(1); }
    50%  { transform:scale(1.6); }
    100% { transform:scale(1); }
  }

  /* Badges statut */
  .doc-badge {
    font-family:'Sora',sans-serif; font-weight:700; font-size:.65rem;
    padding:3px 10px; border-radius:20px; letter-spacing:.04em;
  }
  .doc-badge--valide   { background:rgba(46,125,50,.15); color:#66bb6a; border:1px solid rgba(46,125,50,.3); }
  .doc-badge--expiring { background:rgba(252,209,22,.15);  color:#fcd116; border:1px solid rgba(252,209,22,.3); }
  .doc-badge--expired  { background:rgba(239,68,68,.15);  color:#f87171; border:1px solid rgba(239,68,68,.3); }

  /* ── INFOS DOCUMENT ── */
  .doc-file-name {
    font-family:'Sora',sans-serif; font-weight:700;
    font-size:1rem; color:#f1f5f9;
  }
  .doc-file-date { font-family:'DM Sans', sans-serif; font-size:.78rem; color:#64748b; margin-top:3px; }

  /* ── BUTTONS ── */
  .btn-dl {
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:#2e7d32; color:#fff; border:none; border-radius:9px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem;
    padding:11px 14px; cursor:pointer; transition:background .2s;
  }
  .btn-dl:hover { background:#1b5e20; }
  .btn-dl:disabled { opacity:.6; cursor:not-allowed; }

  .btn-pay {
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:#fcd116;
    border:1px solid #fcd116; border-radius:9px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem;
    padding:11px 14px; cursor:pointer; transition:background .2s;
  }
  .btn-pay:hover { background:rgba(252,209,22,.1); }

  .btn-unavailable {
    width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:rgba(255,255,255,.04); color:#475569;
    border:1px solid rgba(255,255,255,.08); border-radius:9px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem;
    padding:11px 14px; cursor:not-allowed;
  }

  /* ── QR BANNER ── */
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

/* ── Fallback miniature ── */
function ThumbFallback() {
  return (
    <div className="doc-thumb__fallback">
      <div className="doc-thumb__fallback-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div className="doc-thumb__fallback-lines">
        <div className="doc-thumb__fallback-line" style={{ width:"80px" }}/>
        <div className="doc-thumb__fallback-line" style={{ width:"60px" }}/>
        <div className="doc-thumb__fallback-line" style={{ width:"70px" }}/>
      </div>
    </div>
  );
}

/* ── DocCard ── */
function DocCard({ doc, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const [localCount, setLocalCount]   = useState(doc.downloadCount ?? 0);
  const [pulseLast, setPulseLast]     = useState(false);
  const [previewUrl, setPreviewUrl]   = useState(null);

  const exhausted = localCount >= MAX_DL;

  // Badge selon état
  const badge = exhausted
    ? { label: "Expiré",       cls: "doc-badge--expired"  }
    : localCount >= MAX_DL - 1
    ? { label: "Expire bientôt", cls: "doc-badge--expiring" }
    : { label: "Valide",       cls: "doc-badge--valide"   };

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
    <div className="doc-file-card">

      {/* Miniature */}
      <div className="doc-thumb">
        {previewUrl ? (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={doc.title}
          />
        ) : (
          <ThumbFallback />
        )}
        <div className="doc-thumb__overlay" />

        {/* Overlay cadenas si expiré */}
        {exhausted && (
          <div className="doc-thumb__lock">
            <div className="doc-thumb__lock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="doc-thumb__lock-label">Accès restreint</div>
          </div>
        )}
      </div>

      {/* Bas de carte */}
      <div className="doc-card-bottom">

        {/* Pips + badge */}
        <div className="doc-card-top-row">
          <div className="dl-pips">
            {Array.from({ length: MAX_DL }, (_, i) => (
              <div
                key={i}
                className={`dl-pip ${pipColor(i)} ${pulseLast && i === localCount - 1 ? "pip-pulse" : ""}`}
              />
            ))}
          </div>
          <span className={`doc-badge ${badge.cls}`}>{badge.label}</span>
        </div>

        {/* Nom + date */}
        <div>
          <div className="doc-file-name">{doc.title}</div>
          <div className="doc-file-date">{doc.date}</div>
        </div>

        {/* Bouton */}
        {exhausted ? (
          <button className="btn-pay" onClick={handlePay} type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-1.5-5.1"/>
              <polyline points="21 3 21 9 15 9"/>
            </svg>
            Payer à nouveau
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