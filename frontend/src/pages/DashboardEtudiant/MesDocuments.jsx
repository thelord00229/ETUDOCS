import { useEffect, useMemo, useState, useRef } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument } from "../../services/api";

const MAX_DL = 3;
const COUNTDOWN_SEC = 10;

const css = `
  .docs-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .docs-sub   { color:#475569; font-size:.9rem; }

  .docs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

  /* ── CARD ── */
  .doc-file-card {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px;
    display:flex; flex-direction:column; gap:12px;
    border-top:4px solid #16a34a;
    transition:box-shadow .2s, transform .2s, opacity .4s, max-height .5s;
    overflow:hidden;
  }
  .doc-file-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }

  /* Destruction animation */
  .doc-file-card.destroying {
    border-top-color:#ef4444;
    animation: cardDestroy 0.5s ease forwards;
  }
  @keyframes cardDestroy {
    0%   { opacity:1; transform:scale(1); }
    60%  { opacity:.3; transform:scale(.97); }
    100% { opacity:0; transform:scale(.93); max-height:0; padding:0; margin:0; border:0; }
  }

  .doc-file-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; }
  .doc-file-meta  { display:flex; align-items:center; gap:6px; font-size:.82rem; color:#94a3b8; }

  /* ── PIPS ── */
  .dl-counter { display:flex; align-items:center; gap:8px; font-size:.8rem; color:#475569; }
  .dl-counter__pips { display:flex; gap:5px; }
  .dl-pip {
    width:11px; height:11px; border-radius:50%;
    background:#e2e8f0;
    transition: background .4s, transform .3s;
  }
  .dl-pip.pip-1 { background:#16a34a; } /* vert */
  .dl-pip.pip-2 { background:#eab308; } /* jaune */
  .dl-pip.pip-3 { background:#ef4444; } /* rouge */
  .dl-pip.pip-pulse { animation: pipPulse .5s ease; }
  @keyframes pipPulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.5); }
    100% { transform: scale(1); }
  }

  /* ── COUNTDOWN BAR ── */
  .countdown-wrap {
    display:flex; flex-direction:column; gap:6px;
    padding:12px 14px;
    background:#fff5f5; border:1.5px solid #fecaca;
    border-radius:10px;
    animation: fadeInUp .3s ease;
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .countdown-top {
    display:flex; align-items:center; justify-content:space-between;
  }
  .countdown-label {
    display:flex; align-items:center; gap:6px;
    font-size:.78rem; font-weight:700; color:#ef4444;
  }
  .countdown-sec {
    font-family:'Sora',sans-serif; font-weight:800;
    font-size:1.1rem; color:#ef4444;
    min-width:28px; text-align:right;
  }
  .countdown-bar-track {
    width:100%; height:6px; border-radius:999px;
    background:#fee2e2; overflow:hidden;
  }
  .countdown-bar-fill {
    height:100%; border-radius:999px;
    background: linear-gradient(90deg, #f87171, #ef4444);
    transition: width 1s linear;
  }
  .countdown-msg {
    font-size:.75rem; color:#94a3b8; text-align:center;
  }

  /* ── BUTTONS ── */
  .btn-dl {
    flex:1; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:#16a34a; color:#fff; border:none; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem;
    padding:10px 16px; cursor:pointer; transition:background .2s;
  }
  .btn-dl:hover { background:#15803d; }
  .btn-dl:disabled { opacity:.7; cursor:not-allowed; }

  /* ── QR BANNER ── */
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
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

const safeTime = (iso) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

/* ── Pips colorés ────────────────────────────────────────── */
function DlCounter({ count, pulseLast }) {
  const c = Math.max(0, Math.min(MAX_DL, count || 0));
  const pipColor = (i) => {
    if (i >= c) return "";          // gris (non utilisé)
    if (i === 0) return "pip-1";    // vert
    if (i === 1) return "pip-2";    // jaune
    return "pip-3";                 // rouge
  };
  return (
    <div className="dl-counter">
      <div className="dl-counter__pips">
        {Array.from({ length: MAX_DL }, (_, i) => (
          <div
            key={i}
            className={`dl-pip ${pipColor(i)} ${pulseLast && i === c - 1 ? "pip-pulse" : ""}`}
          />
        ))}
      </div>
      <span>{c}/{MAX_DL} téléchargement{c > 1 ? "s" : ""}</span>
    </div>
  );
}

/* ── Countdown bar ────────────────────────────────────────── */
function CountdownBar({ onDone }) {
  const [sec, setSec] = useState(COUNTDOWN_SEC);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pct = (sec / COUNTDOWN_SEC) * 100;

  return (
    <div className="countdown-wrap">
      <div className="countdown-top">
        <div className="countdown-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Limite atteinte
        </div>
        <div className="countdown-sec">{sec}s</div>
      </div>
      <div className="countdown-bar-track">
        <div className="countdown-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="countdown-msg">Ce document sera retiré dans {sec} seconde{sec > 1 ? "s" : ""}</div>
    </div>
  );
}

/* ── DocCard ─────────────────────────────────────────────── */
function DocCard({ doc, onDownload, onDestroyed }) {
  const [downloading, setDownloading] = useState(false);
  const [localCount, setLocalCount] = useState(doc.downloadCount ?? 0);
  const [pulseLast, setPulseLast] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [hidden, setHidden] = useState(false);

  const expired = localCount >= MAX_DL;

  const handleDl = async () => {
    if (expired || downloading) return;
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

  const handleCountdownDone = () => {
    setDestroying(true);
    // après la durée de l'animation CSS (0.5s) → retirer du DOM
    setTimeout(() => {
      setHidden(true);
      onDestroyed?.(doc.id);
    }, 500);
  };

  if (hidden) return null;

  return (
    <div className={`doc-file-card${destroying ? " destroying" : ""}`}>
      <div className="doc-file-title">{doc.title}</div>
      <div className="doc-file-meta">{doc.date}</div>
      <div className="doc-file-meta">{doc.reference}</div>

      <DlCounter count={localCount} pulseLast={pulseLast} />

      {expired ? (
        <CountdownBar onDone={handleCountdownDone} />
      ) : (
        <button className="btn-dl" disabled={downloading} onClick={handleDl} type="button">
          {downloading
            ? <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Téléchargement…
              </>
            : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Télécharger
              </>
          }
        </button>
      )}
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────── */
export default function MesDocuments() {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [demandes, setDemandes] = useState([]);
  const [destroyed, setDestroyed] = useState(new Set());

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
      .filter((d) => d?.statut === "DISPONIBLE" && Array.isArray(d?.documents) && d.documents.length > 0)
      .flatMap((d) =>
        (d.documents || [])
          .filter((doc) => doc?.reference)
          .map((doc) => {
            const iso = doc.createdAt || d.updatedAt || d.createdAt || null;
            const sem =
              typeof doc.reference === "string" && doc.reference.includes("-S1-") ? " • Semestre 1"
              : typeof doc.reference === "string" && doc.reference.includes("-S2-") ? " • Semestre 2"
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
      .sort((a, b) => b.ts - a.ts)
      .filter((d) => d.downloadCount < MAX_DL && !destroyed.has(d.id));
  }, [demandes, destroyed]);

  const reloadDemandes = async () => {
    const list = await getDemandes();
    setDemandes(Array.isArray(list) ? list : []);
  };

  const handleDownload = async (reference) => {
    await downloadDocument(reference);
    await reloadDemandes();
  };

  const handleDestroyed = (id) => {
    setDestroyed((prev) => new Set([...prev, id]));
  };

  return (
    <DashboardLayout>
      <style>{css}
        {`@keyframes spin { to { transform:rotate(360deg); } }`}
      </style>

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
                <DocCard
                  key={d.id}
                  doc={d}
                  onDownload={handleDownload}
                  onDestroyed={handleDestroyed}
                />
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