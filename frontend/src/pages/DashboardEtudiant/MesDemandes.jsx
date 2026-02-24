import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument } from "../../services/api";

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  .md-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
  .md-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .md-sub   { color:#475569; font-size:.9rem; }
  .btn-new-orange {
    display:inline-flex; align-items:center; gap:8px;
    background:#f5a623; color:#fff; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem;
    padding:11px 22px; cursor:pointer; white-space:nowrap;
    transition:background .2s; text-decoration:none;
  }
  .btn-new-orange:hover { background:#fbbf4a; }

  .filter-bar {
    background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:16px 20px;
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  }
  .filter-tab {
    padding:8px 18px; border-radius:8px; border:1.5px solid #e2e8f0;
    font-family:'Sora',sans-serif; font-size:.85rem; font-weight:600; cursor:pointer;
    background:#fff; color:#475569; transition:all .15s; white-space:nowrap;
  }
  .filter-tab.active { background:#1a2744; color:#fff; border-color:#1a2744; }
  .filter-tab:not(.active):hover { border-color:#1a2744; color:#1a2744; }
  .search-wrap { flex:1; min-width:200px; position:relative; }
  .search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); }
  .search-input {
    width:100%; padding:9px 14px 9px 36px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    font-family:'DM Sans',sans-serif; font-size:.88rem; color:#334155;
    background:#f8fafc; outline:none; transition:border-color .2s;
  }
  .search-input:focus { border-color:#1a2744; background:#fff; }

  .table-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; }
  .table { width:100%; border-collapse:collapse; }
  .table thead tr { border-bottom:1px solid #f1f5f9; }
  .table th { text-align:left; padding:14px 20px; font-family:'Sora',sans-serif; font-weight:600; font-size:.82rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
  .table td { padding:16px 20px; border-bottom:1px solid #f8fafc; }
  .table tbody tr:last-child td { border-bottom:none; }
  .table tbody tr:hover { background:#fafbff; }
  .td-ref   { font-size:.82rem; color:#94a3b8; font-family:'DM Mono',monospace; }
  .td-type  { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:#1a2744; }
  .td-date  { font-size:.88rem; color:#475569; }
  .td-actions { display:flex; align-items:center; gap:10px; justify-content:flex-end; }
  .btn-view {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500; color:#475569;
    background:none; border:none; cursor:pointer; transition:color .2s; padding:4px 0;
  }
  .btn-view:hover { color:#1a2744; }

  .badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-size:.78rem; font-weight:600; white-space:nowrap; }
  .badge--traitement { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .badge--disponible { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
  .badge--attente    { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
  .badge--rejete     { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

  .state-box { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px 20px; color:#475569; }
  .state-error { color:#dc2626; }

  /* ═══════════════════════════════════════════════════
     PAGE DÉTAIL
  ═══════════════════════════════════════════════════ */
  .detail-back {
    display:inline-flex; align-items:center; gap:7px;
    background:none; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500; color:#475569;
    padding:0; margin-bottom:22px; transition:color .2s;
  }
  .detail-back:hover { color:#1a2744; }

  .detail-toprow { display:flex; align-items:flex-start; gap:14px; margin-bottom:28px; }
  .detail-title {
    font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem;
    color:#1a2744; margin-bottom:6px; line-height:1.2;
  }
  .detail-ref {
    font-family:'DM Mono',monospace; font-size:.82rem; color:#64748b; letter-spacing:.3px;
  }

  .dbadge { display:inline-flex; align-items:center; padding:5px 14px; border-radius:20px; font-size:.8rem; font-weight:700; white-space:nowrap; flex-shrink:0; }
  .dbadge--traitement { background:#1a2744; color:#fff; }
  .dbadge--disponible { background:#dcfce7; color:#166534; }
  .dbadge--rejete     { background:#fee2e2; color:#991b1b; }
  .dbadge--attente    { background:#fffbeb; color:#92400e; border:1px solid #fde68a; }

  .stepper-card {
    background:#fff; border:1px solid #e2e8f0; border-radius:16px;
    padding:28px 32px; margin-bottom:20px;
  }
  .stepper-head {
    font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; margin-bottom:24px;
  }
  .stepper { display:flex; align-items:flex-start; justify-content:space-between; position:relative; }
  .stepper::before {
    content:''; position:absolute; top:17px; left:34px; right:34px;
    height:2px; background:#e2e8f0; z-index:0;
  }
  .step { display:flex; flex-direction:column; align-items:center; gap:8px; flex:1; position:relative; z-index:1; }
  .step-dot {
    width:36px; height:36px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:2px solid transparent; flex-shrink:0; background:#fff;
  }
  .step-dot--done   { background:#1a2744; border-color:#1a2744; }
  .step-dot--active { background:#fff; border-color:#1a2744; box-shadow:0 0 0 4px rgba(26,39,68,.1); }
  .step-dot--todo   { background:#fff; border-color:#cbd5e1; }
  .step-lbl { font-size:.75rem; font-weight:500; color:#94a3b8; text-align:center; max-width:80px; line-height:1.35; }
  .step-lbl--done   { color:#1a2744; font-weight:600; }
  .step-lbl--active { color:#1a2744; font-weight:700; }
  .step-sub { font-size:.7rem; color:#22c55e; font-weight:600; margin-top:2px; }

  .detail-body { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }

  .pieces-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px 26px; }
  .pieces-head { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; margin-bottom:16px; }
  .piece-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 16px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:10px; gap:12px;
  }
  .piece-row:last-child { margin-bottom:0; }
  .piece-left { display:flex; align-items:center; gap:12px; min-width:0; }
  .piece-ico {
    width:36px; height:36px; border-radius:9px; flex-shrink:0;
    background:#f8fafc; border:1px solid #e2e8f0;
    display:flex; align-items:center; justify-content:center; color:#94a3b8;
  }
  .piece-name { font-size:.88rem; font-weight:600; color:#1e293b; }
  .piece-meta { font-size:.75rem; color:#94a3b8; margin-top:2px; }
  .piece-ok   { display:inline-flex; align-items:center; gap:5px; font-size:.8rem; font-weight:600; color:#16a34a; white-space:nowrap; }

  .detail-right { display:flex; flex-direction:column; gap:16px; }
  .meta-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; }
  .meta-label { font-size:.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.8px; margin-bottom:14px; }
  .meta-row { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; gap:8px; }
  .meta-row:last-child { margin-bottom:0; }
  .meta-key { font-size:.85rem; color:#64748b; }
  .meta-val { font-size:.85rem; font-weight:700; color:#1a2744; text-align:right; }

  .help-card { background:#eff6ff; border:1px solid #bfdbfe; border-radius:16px; padding:20px; }
  .help-title { font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; color:#1a2744; margin-bottom:6px; }
  .help-text  { font-size:.82rem; color:#475569; line-height:1.55; }

  .btn-dl {
    width:100%; padding:13px; background:#16a34a; color:#fff;
    border:none; border-radius:11px; cursor:pointer;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background .2s, transform .15s;
  }
  .btn-dl:hover { background:#15803d; transform:translateY(-1px); }
  .btn-dl:disabled { opacity:.75; cursor:not-allowed; transform:none; }
  .btn-dl-count { font-size:.75rem; opacity:.8; font-weight:500; }

  .reject-card { background:#fef2f2; border:1px solid #fecaca; border-radius:14px; padding:18px 20px; margin-bottom:4px; }
  .reject-head { font-size:.82rem; font-weight:700; color:#991b1b; text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .reject-text { font-size:.88rem; color:#7f1d1d; line-height:1.55; }

  @media (max-width:900px) {
    .detail-body { grid-template-columns:1fr; }
    .stepper::before { display:none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const FILTERS = ["Toutes", "En attente", "En traitement", "Disponible", "Rejetée"];

const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "Relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return t || "Document";
};

const labelStatut = (s) => {
  if (s === "DISPONIBLE") return "Disponible";
  if (s === "REJETEE" || s === "REJETE") return "Rejetée";
  // tout le reste = en cours
  return "En traitement";
};

const badgeClass = (l) => {
  if (l === "Disponible") return "badge--disponible";
  if (l === "Rejetée") return "badge--rejete";
  if (l === "En attente") return "badge--attente";
  return "badge--traitement";
};

const dbadgeClass = (l) => {
  if (l === "Disponible") return "dbadge--disponible";
  if (l === "Rejetée") return "dbadge--rejete";
  if (l === "En attente") return "dbadge--attente";
  return "dbadge--traitement";
};

// ✅ IMPORTANT: pas de "fausse" référence. On affiche la référence du document si elle existe, sinon l'id demande.
const uiRef = (_typeDocument, rawRef) => rawRef || "—";

const uiIntervenant = (type) => {
  if (type === "RELEVE_NOTES") return "Serge DOSSOU";
  return "Adéola BOSSOU";
};

/* ─────────────────────────────────────────────────────────────
   STEPPER
───────────────────────────────────────────────────────────── */
const STEPS = [
  { key: "soumise", label: "Soumise" },
  { key: "sec_adj", label: "Reçue (Sec. Adj)" },
  { key: "sec_gen", label: "Transmise (Sec. Gén)" },
  { key: "traitement", label: "En traitement" },
  { key: "sign_da", label: "Signature DA" },
  { key: "sign_dir", label: "Signature DIR" },
  { key: "disponible", label: "Disponible" },
];

const getSteps = (status) => {
  const activeIdx =
    {
      "En traitement": 3,
      Disponible: 6,
      Rejetée: 3,
      "En attente": 1,
    }[status] ?? 3;

  return STEPS.map((s, i) => ({
    ...s,
    state: i < activeIdx ? "done" : i === activeIdx ? "active" : "todo",
  }));
};

/* ─────────────────────────────────────────────────────────────
   ICÔNES
───────────────────────────────────────────────────────────── */
const IcoArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcoCheckGreen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IcoFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IcoDl = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   PAGE DÉTAIL
───────────────────────────────────────────────────────────── */
function DetailDemande({ demande, onBack }) {
  const title = labelType(demande.typeDocument);
  const status = labelStatut(demande.statut);

  const reference = demande.document?.reference || null;
  const ref = reference || demande.id;

  const steps = getSteps(status);
  const isReleve = demande.typeDocument === "RELEVE_NOTES";

  const dateStr = demande.createdAt
    ? new Date(demande.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const updatedStr = demande.updatedAt
    ? new Date(demande.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const pieces = Array.isArray(demande.pieces) ? demande.pieces : [];

  // Télécharger
  const [dlLoading, setDlLoading] = useState(false);
  const [dlError, setDlError] = useState("");

  const handleDownload = async () => {
    if (!reference) {
      setDlError("Aucune référence de document disponible.");
      return;
    }
    setDlError("");
    setDlLoading(true);
    try {
      await downloadDocument(reference);
    } catch (e) {
      setDlError(e?.message || "Erreur téléchargement");
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <>
      <button className="detail-back" onClick={onBack}>
        <IcoArrow /> Retour à mes demandes
      </button>

      <div className="detail-toprow">
        <div style={{ flex: 1 }}>
          <div className="detail-title">{title}</div>
          <div className="detail-ref">Réf : {ref}</div>
        </div>
        <span className={`dbadge ${dbadgeClass(status)}`}>{status}</span>
      </div>

      <div className="stepper-card">
        <div className="stepper-head">Suivi de la demande</div>
        <div className="stepper">
          {steps.map((s) => (
            <div key={s.key} className="step">
              <div className={`step-dot step-dot--${s.state}`}>
                {s.state === "done" && <IcoCheck />}
                {s.state === "active" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a2744" }} />}
              </div>
              <div className={`step-lbl step-lbl--${s.state}`}>
                {s.label}
                {s.state === "active" && <div className="step-sub">En cours</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {status === "Rejetée" && (
        <div className="reject-card">
          <div className="reject-head">
            <IcoAlert /> Motif de rejet
          </div>
          <div className="reject-text">
            {demande.motifRejet ||
              "Pièce justificative non conforme. Veuillez soumettre une nouvelle demande avec une quittance de paiement lisible et en cours de validité."}
          </div>
        </div>
      )}

      <div className="detail-body">
        <div className="pieces-card">
          <div className="pieces-head">Pièces jointes</div>

          {pieces.length === 0 ? (
            <div style={{ color: "#475569" }}>Aucune pièce trouvée.</div>
          ) : (
            pieces.map((p) => {
              const pieceLabel =
                p.typePiece === "CIP" ? "Carte d'Identification Personnelle (CIP)" :
                p.typePiece === "QUITTANCE" ? "Quittance de paiement" :
                p.typePiece || "Pièce";

              const meta = p.nom ? p.nom : (p.url ? String(p.url).split("\\").pop() : "—");
              const statutPiece = p.statut || "SOUMISE";

              return (
                <div key={p.id} className="piece-row">
                  <div className="piece-left">
                    <div className="piece-ico"><IcoFile /></div>
                    <div style={{ minWidth: 0 }}>
                      <div className="piece-name">{pieceLabel}</div>
                      <div className="piece-meta" style={{ wordBreak: "break-word" }}>
                        {meta}
                      </div>
                    </div>
                  </div>

                  <span className="piece-ok">
                    <IcoCheckGreen /> {statutPiece}
                  </span>
                </div>
              );
            })
          )}

          {isReleve && (
            <div className="piece-row" style={{ marginTop: 10 }}>
              <div className="piece-left">
                <div className="piece-ico"><IcoFile /></div>
                <div>
                  <div className="piece-name">Relevé de notes officiel</div>
                  <div className="piece-meta">Généré automatiquement</div>
                </div>
              </div>
              <span className="piece-ok"><IcoCheckGreen /> Système</span>
            </div>
          )}
        </div>

        <div className="detail-right">
          {status === "Disponible" && (
            <>
              <button className="btn-dl" onClick={handleDownload} disabled={dlLoading || !reference}>
                <IcoDl />
                {dlLoading ? "Téléchargement..." : "Télécharger mon document"}
                {typeof demande.document?.downloadCount === "number" && (
                  <span className="btn-dl-count">({demande.document.downloadCount})</span>
                )}
              </button>
              {dlError && <div className="state-box state-error">{dlError}</div>}
            </>
          )}

          <div className="meta-card">
            <div className="meta-label">Détails</div>
            <div className="meta-row">
              <span className="meta-key">Date soumission</span>
              <span className="meta-val">{dateStr}</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Dernière maj</span>
              <span className="meta-val">{updatedStr}</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Intervenant</span>
              <span className="meta-val">{uiIntervenant(demande.typeDocument)}</span>
            </div>
            {isReleve && (
              <div className="meta-row">
                <span className="meta-key">Semestre</span>
                <span className="meta-val">Semestre {demande.semestre ?? "—"}</span>
              </div>
            )}
          </div>

          <div className="help-card">
            <div className="help-title">Besoin d'aide ?</div>
            <div className="help-text">
              Si vous rencontrez un problème avec cette demande, contactez{" "}
              <a href="mailto:support@etudocs.bj" style={{ color: "#1a2744", fontWeight: 600 }}>
                support@etudocs.bj
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────────────────────── */
export default function MesDemandes() {
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandes, setDemandes] = useState([]);

  // null = liste, objet = détail
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getDemandes();
        setDemandes(Array.isArray(list) ? list : []);
      } catch {
        setError("Échec du chargement des demandes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const base = { Toutes: 0, "En attente": 0, "En traitement": 0, Disponible: 0, Rejetée: 0 };
    base.Toutes = demandes.length;
    for (const d of demandes) {
      const s = labelStatut(d?.statut);
      if (base[s] !== undefined) base[s] += 1;
    }
    return base;
  }, [demandes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return demandes
      .map((d) => ({
        raw: d,
        ref: uiRef(d.typeDocument, d.documents?.[0]?.reference || d.id),
        type: labelType(d.typeDocument),
        date: d.createdAt
          ? new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        status: labelStatut(d.statut),
      }))
      .filter((d) => {
        const matchFilter = filter === "Toutes" || d.status === filter;
        const matchSearch = !q || d.ref.toLowerCase().includes(q) || d.type.toLowerCase().includes(q);
        return matchFilter && matchSearch;
      });
  }, [demandes, filter, search]);

  // Vue détail
  if (detailItem) {
    return (
      <DashboardLayout>
        <style>{css}</style>
        <DetailDemande demande={detailItem} onBack={() => setDetailItem(null)} />
      </DashboardLayout>
    );
  }

  // Vue liste
  return (
    <DashboardLayout>
      <style>{css}</style>

      <div className="md-header">
        <div>
          <h2 className="md-title">Mes demandes</h2>
          <p className="md-sub">Suivez l'état de toutes vos demandes de documents</p>
        </div>
        <a href="/dashboardEtu/nouvelle" className="btn-new-orange">
          Nouvelle demande
        </a>
      </div>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-tab${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f} ({counts[f] ?? 0})
          </button>
        ))}

        <div className="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            placeholder="Rechercher par référence ou type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="state-box">Chargement des demandes…</div>}
      {!loading && error && <div className="state-box state-error">{error}</div>}

      {!loading && !error && (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Type de document</th>
                <th>Date de soumission</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "18px 20px", color: "#475569" }}>
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.raw.id}>
                    <td className="td-ref">{d.ref}</td>
                    <td className="td-type">{d.type}</td>
                    <td className="td-date">{d.date}</td>
                    <td>
                      <span className={`badge ${badgeClass(d.status)}`}>{d.status}</span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-view" type="button" onClick={() => setDetailItem(d.raw)}>
                          <IcoEye /> Voir détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

