import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  getDemandes,
  getDemandeById,
  avancerDemande,
  getChefDivisionStats,
  validerPiece,
} from "../../services/api";

// ── Styles ────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --uac: #2e7d32; --uac-dk: #1b5e20; --uac-lt: #43a047;
    --uac-bg: #f1f8e9; --uac-bd: #c8e6c9;
    --bg: #f4f6f9; --border: #e2e8f0; --muted: #94a3b8;
    --text: #1e293b; --text-muted: #64748b;
    --success: #10b981; --danger: #ef4444;
    --orange: #f97316; --blue: #1e4db7;
  }

  .agent-layout { display:flex; min-height:100vh; background:var(--bg); font-family:'DM Sans',sans-serif; }

  .agent-sidebar { width:220px; flex-shrink:0; background:#fff; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:50; }
  .agent-sidebar__brand { display:flex; align-items:center; gap:10px; padding:22px 20px; font-family:'Sora',sans-serif; font-weight:800; font-size:1.15rem; color:var(--uac); text-decoration:none; border-bottom:1px solid #f1f5f9; }
  .agent-sidebar__brand-icon { width:36px; height:36px; border-radius:10px; background:var(--uac); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .agent-sidebar__brand-tag { font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:500; color:rgba(255,255,255,.8); margin-left:2px; }
  .agent-sidebar__nav { flex:1; padding:14px 12px; display:flex; flex-direction:column; gap:3px; }
  .agent-sidebar__link { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:10px; font-size:.9rem; font-weight:500; color:#475569; text-decoration:none; transition:background .15s, color .15s; background:none; border:none; cursor:pointer; width:100%; text-align:left; }
  .agent-sidebar__link:hover { background:var(--uac-bg); color:var(--uac); }
  .agent-sidebar__link.active { background:var(--uac); color:#fff; font-weight:700; box-shadow:0 4px 14px rgba(46,125,50,.2); }
  .agent-sidebar__divider { height:1px; background:#f1f5f9; margin:4px 12px; }
  .agent-sidebar__logout { display:flex; align-items:center; gap:12px; padding:11px 26px; font-size:.88rem; font-weight:500; color:#ef4444; background:none; border:none; cursor:pointer; width:100%; transition:background .15s; border-top:1px solid #f1f5f9; }
  .agent-sidebar__logout:hover { background:#fef2f2; }

  .agent-main { margin-left:220px; flex:1; min-width:0; display:flex; flex-direction:column; }

  .agent-topbar { height:64px; background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 32px; position:sticky; top:0; z-index:40; }
  .agent-topbar__role { display:inline-flex; align-items:center; padding:6px 14px; border:1.5px solid var(--uac-bd); border-radius:20px; font-size:.85rem; font-weight:500; color:var(--uac); background:var(--uac-bg); }
  .agent-topbar__right { display:flex; align-items:center; gap:16px; }
  .agent-topbar__notif { position:relative; background:none; border:none; cursor:pointer; color:var(--muted); padding:4px; }
  .agent-topbar__badge { position:absolute; top:0; right:0; width:8px; height:8px; border-radius:50%; background:var(--uac); border:2px solid #fff; }
  .agent-topbar__avatar { width:38px; height:38px; border-radius:50%; background:var(--uac); display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem; color:#fff; }
  .agent-topbar__name { font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; color:var(--text); }
  .agent-topbar__meta { font-size:.75rem; color:var(--muted); text-align:right; }

  .agent-content { padding:28px 32px; display:flex; flex-direction:column; gap:24px; padding-bottom:48px; }
  .agent-page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .agent-page-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; color:var(--text); margin-bottom:4px; }
  .agent-page-sub { color:#475569; font-size:.9rem; }

  .btn-actualiser { display:inline-flex; align-items:center; gap:8px; background:var(--uac); color:#fff; border:none; border-radius:10px; font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; padding:11px 24px; cursor:pointer; transition:background .2s; white-space:nowrap; }
  .btn-actualiser:hover { background:var(--uac-dk); }

  .agent-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .agent-stat-card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:20px 22px; display:flex; align-items:center; gap:16px; }
  .agent-stat-card__icon { width:48px; height:48px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .agent-stat-card__value { font-family:'Sora',sans-serif; font-weight:800; font-size:1.8rem; color:var(--text); line-height:1; }
  .agent-stat-card__label { font-size:.72rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-top:4px; }

  .agent-table-card { background:#fff; border:1px solid var(--border); border-radius:16px; overflow:hidden; }
  .agent-table-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f1f5f9; }
  .agent-table-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:var(--text); display:flex; align-items:center; gap:10px; }
  .count-badge { width:22px; height:22px; border-radius:50%; background:var(--uac); color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
  .search-box { display:flex; align-items:center; gap:8px; border:1.5px solid var(--border); border-radius:8px; padding:7px 12px; background:var(--bg); }
  .search-box input { border:none; background:none; outline:none; font-size:.85rem; color:#334155; width:180px; }
  .search-box input::placeholder { color:#cbd5e1; }

  .agent-table { width:100%; border-collapse:collapse; }
  .agent-table thead tr { background:var(--bg); }
  .agent-table th { text-align:left; padding:12px 20px; font-family:'Sora',sans-serif; font-weight:600; font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; white-space:nowrap; }
  .agent-table td { padding:16px 20px; border-bottom:1px solid var(--bg); vertical-align:middle; }
  .agent-table tbody tr:last-child td { border-bottom:none; }
  .agent-table tbody tr:hover { background:#f8fafc; }

  .td-ref { font-size:.82rem; color:var(--muted); }
  .td-etudiant-name { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:var(--text); }
  .td-etudiant-num { font-size:.78rem; color:var(--muted); margin-top:2px; }
  .td-doc { font-size:.9rem; color:#334155; }
  .td-date { font-size:.88rem; color:#475569; }
  .td-delai-urgent { font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; color:var(--orange); }
  .td-delai-ok { font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; color:var(--uac); }

  .btn-traiter { display:inline-flex; align-items:center; gap:7px; background:var(--uac); color:#fff; border:none; border-radius:8px; font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem; padding:9px 18px; cursor:pointer; transition:background .2s; white-space:nowrap; }
  .btn-traiter:hover { background:var(--uac-dk); }

  .traitement-grid { display:grid; grid-template-columns:280px 1fr 290px; gap:20px; align-items:start; }
  .back-btn { display:inline-flex; align-items:center; gap:8px; background:#fff; color:var(--text); border:1.5px solid var(--border); border-radius:8px; font-family:'Sora',sans-serif; font-weight:600; font-size:.85rem; padding:8px 14px; cursor:pointer; transition:border-color .2s; }
  .back-btn:hover { border-color:var(--uac); color:var(--uac); }

  .panel { background:#fff; border:1px solid var(--border); border-radius:16px; overflow:hidden; }
  .panel-header { padding:16px 20px; border-bottom:1px solid var(--border); }
  .panel-title { font-size:.75rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }
  .panel-body { padding:20px; }
  .info-row { margin-bottom:12px; }
  .info-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:3px; }
  .info-value { font-size:14px; font-weight:600; color:var(--text); }
  .info-value.mono { font-family:'DM Mono',monospace; font-size:12px; color:var(--blue); }
  .doc-type-pill { display:inline-flex; align-items:center; gap:6px; background:var(--uac-bg); color:var(--uac); padding:5px 10px; border-radius:7px; font-size:.82rem; font-weight:600; margin-top:3px; }
  .divider-h { height:1px; background:var(--border); margin:14px 0; }
  .divider { height:1px; background:var(--border); margin:14px 0; }

  .piece-card { background:#fff; border:1px solid var(--border); border-radius:14px; margin-bottom:14px; overflow:hidden; }
  .piece-header { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); }
  .piece-name { font-size:.9rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:8px; }
  .piece-body { padding:14px 18px; }
  .piece-actions { display:flex; gap:8px; margin-bottom:10px; }
  .btn-valider { flex:1; padding:9px; border-radius:8px; font-size:.82rem; font-weight:700; cursor:pointer; border:2px solid; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:5px; }
  .btn-valider.valid { border-color:var(--uac); color:var(--uac); background:#fff; }
  .btn-valider.valid.selected, .btn-valider.valid:hover { background:var(--uac); color:#fff; }
  .btn-valider.reject { border-color:var(--danger); color:var(--danger); background:#fff; }
  .btn-valider.reject.selected, .btn-valider.reject:hover { background:var(--danger); color:#fff; }
  textarea.comment { width:100%; padding:8px 10px; border:1.5px solid var(--border); border-radius:7px; font-size:.82rem; resize:none; outline:none; transition:border-color .2s; }
  textarea.comment:focus { border-color:var(--uac); }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:.75rem; font-weight:700; }
  .badge.green { background:var(--uac-bg); color:var(--uac); }
  .badge.red   { background:#fef2f2; color:#dc2626; }
  .badge.gray  { background:#f1f5f9; color:#475569; }
  .badge.blue  { background:var(--uac-bg); color:var(--uac); }

  .check-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:9px; border:1.5px solid var(--border); background:var(--bg); margin-bottom:8px; }
  .check-item.v { border-color:var(--uac-bd); background:var(--uac-bg); }
  .check-item.r { border-color:#fca5a5; background:#fef2f2; }
  .check-name { font-size:.82rem; font-weight:600; color:var(--text); }
  .check-status { font-size:.75rem; font-weight:700; }
  .check-status.v { color:var(--uac); }
  .check-status.r { color:var(--danger); }
  .check-status.p { color:var(--muted); }

  .btn-main { width:100%; padding:13px; border-radius:11px; font-family:'Sora',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; }
  .btn-main.generate { background:var(--uac); color:#fff; }
  .btn-main.generate:hover { background:var(--uac-dk); transform:translateY(-1px); box-shadow:0 6px 18px rgba(46,125,50,.3); }
  .btn-main.generate:disabled { background:var(--uac-bg); color:var(--uac-bd); cursor:not-allowed; transform:none; box-shadow:none; }
  .btn-main.reject-all { background:#fff; color:var(--danger); border:2px solid var(--danger); }
  .btn-main.reject-all:hover { background:var(--danger); color:#fff; }

  .info-box { padding:10px 12px; border-radius:9px; font-size:.78rem; line-height:1.6; }
  .info-box.blue  { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .info-box.green { background:var(--uac-bg); color:var(--uac-dk); border:1px solid var(--uac-bd); }

  .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px); }
  .modal { background:#fff; border-radius:20px; padding:30px; width:460px; max-width:95vw; box-shadow:0 24px 64px rgba(0,0,0,.2); }
  .modal-title { font-family:'Sora',sans-serif; font-size:1.1rem; font-weight:700; color:var(--text); margin-bottom:12px; display:flex; align-items:center; gap:10px; }
  .modal-body { font-size:.88rem; color:#475569; line-height:1.7; margin-bottom:22px; }
  .modal-ref { font-family:monospace; font-size:.82rem; color:var(--uac); background:var(--uac-bg); padding:2px 7px; border-radius:5px; }
  .modal-actions { display:flex; gap:10px; }
  .modal-btn { flex:1; padding:11px; border-radius:9px; font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; }
  .modal-btn.confirm-gen { background:var(--uac); color:#fff; }
  .modal-btn.confirm-gen:hover { background:var(--uac-dk); }
  .modal-btn.confirm-rej { background:var(--danger); color:#fff; }
  .modal-btn.confirm-rej:hover { background:#dc2626; }
  .modal-btn.cancel { background:var(--bg); color:var(--text); border:1.5px solid var(--border); }
  .motif-input { width:100%; padding:9px 11px; border:1.5px solid var(--border); border-radius:7px; font-size:.82rem; resize:none; outline:none; transition:border-color .2s; margin-top:8px; }
  .motif-input:focus { border-color:var(--danger); }

  .btn-preview { width:100%; padding:9px; border-radius:8px; border:1.5px solid var(--border); background:#fff; color:var(--text); font-size:.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:10px; transition:border-color .2s; }
  .btn-preview:hover { border-color:var(--uac); color:var(--uac); }

  .success-card { background:#fff; border:2px solid var(--uac-bd); border-radius:18px; padding:40px; text-align:center; }
  .success-icon { width:68px; height:68px; background:var(--uac-bg); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; border:2px solid var(--uac-bd); }
  .success-title { font-family:'Sora',sans-serif; font-size:1.4rem; font-weight:700; color:var(--uac); margin-bottom:6px; }
  .success-sub { font-size:.88rem; color:var(--muted); margin-bottom:22px; }
  .success-ref { font-family:monospace; color:var(--blue); font-size:.9rem; background:#eff6ff; padding:10px 18px; border-radius:9px; display:inline-block; border:1px solid #bfdbfe; }

  .sa-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:300; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); padding:16px; }
  .pwd-modal { background:#fff; border-radius:16px; width:100%; max-width:420px; box-shadow:0 24px 60px rgba(0,0,0,.18); overflow:hidden; }
  .pwd-modal__head { padding:22px 26px 18px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .pwd-modal__title { font-family:'Sora',sans-serif; font-weight:700; font-size:1.05rem; color:var(--text); display:flex; align-items:center; gap:10px; }
  .pwd-modal__title-icon { width:36px; height:36px; border-radius:10px; background:var(--uac-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .pwd-modal__close { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:1.3rem; line-height:1; padding:2px; flex-shrink:0; transition:color .15s; }
  .pwd-modal__close:hover { color:var(--uac); }
  .pwd-modal__body { padding:20px 26px; display:flex; flex-direction:column; gap:14px; }
  .pwd-field { display:flex; flex-direction:column; gap:6px; }
  .pwd-label { font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:.04em; }
  .pwd-input-wrap { position:relative; }
  .pwd-input { width:100%; padding:11px 42px 11px 14px; border:1.5px solid #e2e8f0; border-radius:9px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:#334155; outline:none; transition:border-color .2s; box-sizing:border-box; }
  .pwd-input:focus { border-color:var(--uac); box-shadow:0 0 0 3px rgba(46,125,50,.08); }
  .pwd-input.error { border-color:var(--danger); }
  .pwd-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; padding:0; transition:color .15s; }
  .pwd-eye:hover { color:var(--uac); }
  .pwd-strength { display:flex; gap:4px; margin-top:4px; }
  .pwd-strength__bar { flex:1; height:3px; border-radius:2px; background:#e2e8f0; transition:background .3s; }
  .pwd-strength__bar.weak   { background:#ef4444; }
  .pwd-strength__bar.medium { background:#f5a623; }
  .pwd-strength__bar.strong { background:var(--uac); }
  .pwd-hint { font-size:.75rem; color:#94a3b8; margin-top:2px; }
  .pwd-hint.error { color:#ef4444; }
  .pwd-modal__footer { padding:0 26px 22px; }
  .sa-btn-row { display:flex; gap:10px; }
  .sa-btn { flex:1; padding:11px 16px; border-radius:9px; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; justify-content:center; gap:7px; }
  .sa-btn:disabled { opacity:.55; cursor:not-allowed; }
  .sa-btn--ghost { background:#f8fafc; color:#475569; border:1.5px solid #e2e8f0; }
  .sa-btn--ghost:hover:not(:disabled) { border-color:var(--uac); color:var(--uac); }
  .sa-btn--primary { background:var(--uac); color:#fff; }
  .sa-btn--primary:hover:not(:disabled) { background:var(--uac-dk); }

  .sa-toast { position:fixed; bottom:28px; right:28px; z-index:400; background:var(--uac); color:#fff; padding:13px 20px; border-radius:11px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500; box-shadow:0 8px 30px rgba(0,0,0,.2); animation:sa-toast-in .2s ease; }
  .sa-toast--error { background:var(--danger); }
  @keyframes sa-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

const NAV = [
  {
    to: "/dashboardsc",
    label: "Tableau de bord",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
  "http://localhost:5000";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const delaiLabel = (createdAt) => {
  if (!createdAt) return { label: "—", urgent: false };
  const h = Math.floor((Date.now() - new Date(createdAt)) / 3600000);
  if (h < 24) return { label: `${h}h`, urgent: h >= 12 };
  const d = Math.floor(h / 24);
  return { label: `${d} j`, urgent: d >= 2 };
};

/* ─── Indicateur de robustesse du mot de passe ─────── */
function getStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0–4
}

/* ─── Icône œil (afficher/masquer mot de passe) ────── */
function EyeToggleIcon({ show }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

/* ─── Modal Modifier Mot de Passe ────────────────────── */
function ModalMotDePasse({ onClose, onSuccess }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [showActuel, setShowActuel] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const strength = getStrength(nouveau);
  const strengthLabel = ["", "Faible", "Faible", "Moyen", "Fort"][strength];
  const strengthClass =
    strength <= 2 ? "weak" : strength === 3 ? "medium" : "strong";

  const handleSubmit = async () => {
    setErreur("");
    if (!actuel || !nouveau || !confirmer) {
      setErreur("Tous les champs sont obligatoires.");
      return;
    }
    if (nouveau.length < 8) {
      setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveau !== confirmer) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse: actuel,
          nouveauMotDePasse: nouveau,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Mot de passe actuel incorrect.");
      }
      onSuccess("Mot de passe modifié avec succès ✓");
      onClose();
    } catch (e) {
      setErreur(e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pwd-modal__head">
          <div className="pwd-modal__title">
            <div className="pwd-modal__title-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            Modifier le mot de passe
          </div>
          <button className="pwd-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pwd-modal__body">
          {/* Mot de passe actuel */}
          <div className="pwd-field">
            <label className="pwd-label">Mot de passe actuel</label>
            <div className="pwd-input-wrap">
              <input
                type={showActuel ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                autoFocus
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowActuel((v) => !v)}
              >
                <EyeToggleIcon show={showActuel} />
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="pwd-field">
            <label className="pwd-label">Nouveau mot de passe</label>
            <div className="pwd-input-wrap">
              <input
                type={showNouveau ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowNouveau((v) => !v)}
              >
                <EyeToggleIcon show={showNouveau} />
              </button>
            </div>
            {nouveau && (
              <>
                <div className="pwd-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pwd-strength__bar ${
                        strength >= i ? strengthClass : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="pwd-hint">
                  {strengthLabel} — minimum 8 caractères
                </div>
              </>
            )}
          </div>

          {/* Confirmer */}
          <div className="pwd-field">
            <label className="pwd-label">
              Confirmer le nouveau mot de passe
            </label>
            <div className="pwd-input-wrap">
              <input
                type={showConfirmer ? "text" : "password"}
                className={`pwd-input ${
                  confirmer && confirmer !== nouveau ? "error" : ""
                }`}
                placeholder="••••••••"
                value={confirmer}
                onChange={(e) => setConfirmer(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowConfirmer((v) => !v)}
              >
                <EyeToggleIcon show={showConfirmer} />
              </button>
            </div>
            {confirmer && confirmer !== nouveau && (
              <div className="pwd-hint error">
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>

          {erreur && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: ".85rem",
                color: "#dc2626",
              }}
            >
              {erreur}
            </div>
          )}
        </div>

        <div className="pwd-modal__footer">
          <div className="sa-btn-row">
            <button
              className="sa-btn sa-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className="sa-btn sa-btn--primary"
              onClick={handleSubmit}
              disabled={loading || !actuel || !nouveau || !confirmer}
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar & Topbar ─────────────────────────────────────
function Sidebar({ onLogout, onChangePwd }) {
  return (
    <aside className="agent-sidebar">
      <NavLink to="/dashboardsc" className="agent-sidebar__brand">
        <div className="agent-sidebar__brand-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        EtuDocs <span className="agent-sidebar__brand-tag">Agent</span>
      </NavLink>

      <nav className="agent-sidebar__nav">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end
            className={({ isActive }) =>
              "agent-sidebar__link" + (isActive ? " active" : "")
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
            >
              <path d={n.d} />
            </svg>
            {n.label}
          </NavLink>
        ))}

        {/* Bouton Modifier mot de passe */}
        <button
          className="agent-sidebar__link"
          onClick={onChangePwd}
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="currentColor"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Modifier mot de passe
        </button>
      </nav>

      <button
        className="agent-sidebar__logout"
        onClick={onLogout}
        type="button"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Déconnexion
      </button>
    </aside>
  );
}

function Topbar({ user }) {
  const initials = useMemo(() => {
    const nom = user?.nom || "";
    const prenom = user?.prenom || "";
    const s = `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase();
    return s || "CS";
  }, [user]);

  const name = user
    ? `${user.prenom || ""} ${user.nom || ""}`.trim()
    : "Chef Scolarité";

  return (
    <header className="agent-topbar">
      <div className="agent-topbar__role">Chef Div. Scolarité — IFRI</div>
      <div className="agent-topbar__right">
        <button
          className="agent-topbar__notif"
          type="button"
          aria-label="Notifications"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="agent-topbar__badge" />
        </button>
        <div>
          <div className="agent-topbar__name">{name}</div>
          <div className="agent-topbar__meta">IFRI</div>
        </div>
        <div className="agent-topbar__avatar">{initials}</div>
      </div>
    </header>
  );
}

// ── Icônes ───────────────────────────────────────────────
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const SparkleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const FileTextIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// ── Composant principal ──────────────────────────────────
export default function DashboardCS() {
  const [view, setView] = useState("dashboard"); // dashboard | traitement | success
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [demandes, setDemandes] = useState([]);

  const [stats, setStats] = useState({
    aTraiter: 0,
    enTraitement: 0,
    generes: 0,
    documentGenere: 0,
    rejetees: 0,
    attenteDirecteur: 0,
  });

  const [selected, setSelected] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [pieceBusy, setPieceBusy] = useState(null);
  const [globalComment, setGlobalComment] = useState("");
  const [modal, setModal] = useState(null); // null | "generate" | "reject"
  const [motif, setMotif] = useState("");
  const [motifError, setMotifError] = useState("");
  const [preview, setPreview] = useState(null);
  const [generatedRef, setGeneratedRef] = useState("");

  // État pour le modal mot de passe et le toast
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("etudocs_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const logout = () => {
    try {
      localStorage.removeItem("etudocs_token");
      localStorage.removeItem("token");
      localStorage.removeItem("etudocs_user");
    } catch {}
    window.location.href = "/login";
  };

  const normalizeStats = (st) => {
    const base = st ?? {};
    const aTraiter = Number(base.aTraiter ?? 0);
    const enTraitement = Number(base.enTraitement ?? 0);
    const documentGenere = Number(base.documentGenere ?? base.generes ?? 0);
    const rejetees = Number(base.rejetees ?? 0);
    const attenteDirecteur = Number(base.attenteDirecteur ?? 0);
    return {
      aTraiter,
      enTraitement,
      documentGenere,
      generes: documentGenere,
      rejetees,
      attenteDirecteur,
    };
  };

  const charger = async () => {
    try {
      const [data, st] = await Promise.all([
        getDemandes(),
        getChefDivisionStats(),
      ]);
      const list = Array.isArray(data) ? data : data?.demandes ?? [];
      setDemandes(list);
      setStats(normalizeStats(st));
    } catch (e) {
      console.error(e);
      setDemandes([]);
      setStats(normalizeStats(null));
    }
  };

  const openTraitement = async (d) => {
    try {
      const full = await getDemandeById(d.id);
      setSelected(full);
      const mapped = (full?.pieces || []).map((p) => ({
        id: p.id,
        name: p.typePiece,
        fileName: p.nom,
        url: p.url,
        status:
          p.statut === "VALIDEE"
            ? "valid"
            : p.statut === "REJETEE"
            ? "reject"
            : null,
        comment: p.commentaire || "",
      }));
      setPieces(mapped);
      setGlobalComment(full?.commentaireChefDivision || "");
      setMotif("");
      setMotifError("");
      setPreview(null);
      setModal(null);
      setView("traitement");
    } catch (e) {
      console.error(e);
      alert("Impossible d'ouvrir le dossier.");
    }
  };

  const openPreview = (piece) => {
    const raw = piece?.url || "";
    if (!raw) {
      alert("Fichier introuvable.");
      return;
    }
    const safe = String(raw).replace(/\\/g, "/");
    const fullUrl = `${API_BASE}/${
      safe.startsWith("/") ? safe.slice(1) : safe
    }`;
    setPreview({
      url: encodeURI(fullUrl),
      name: piece.fileName || piece.name || "Document",
    });
  };

  const setPieceComment = (id, comment) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, comment } : p)));
  };

  const setPieceStatus = async (id, status) => {
    const current = pieces.find((p) => p.id === id);
    const comment = (current?.comment || "").trim();
    if (status === "reject" && comment.length < 5) {
      alert("Motif obligatoire (min 5 caractères) pour rejeter une pièce.");
      return;
    }
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setPieceBusy(id);
    try {
      await validerPiece(
        id,
        status === "valid" ? "VALIDEE" : "REJETEE",
        comment
      );
    } catch (e) {
      console.error(e);
      setPieces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: null } : p))
      );
      alert("Échec validation pièce.");
    } finally {
      setPieceBusy(null);
    }
  };

  const allValidated = useMemo(
    () => pieces.every((p) => p.status === "valid"),
    [pieces]
  );
  const anyRejected = useMemo(
    () => pieces.some((p) => p.status === "reject"),
    [pieces]
  );
  const allDecided = useMemo(
    () => pieces.every((p) => p.status !== null),
    [pieces]
  );

  const handleGenerate = async () => {
    if (!selected?.id) return;
    try {
      await avancerDemande(selected.id, "GENERER_DOCUMENT");
      setGeneratedRef(
        selected.ref || selected.id?.substring(0, 8)?.toUpperCase() || "—"
      );
      await charger();
      setModal(null);
      setView("success");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur lors de la génération.");
    }
  };

  const handleReject = async () => {
    if (!selected?.id) return;
    if (motif.trim().length < 20) {
      setMotifError("Le motif doit contenir au moins 20 caractères.");
      return;
    }
    try {
      await avancerDemande(selected.id, "REJETER", motif);
      await charger();
      setModal(null);
      setView("dashboard");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur lors du rejet.");
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return demandes;
    return demandes.filter((d) => {
      const nom = `${d?.utilisateur?.nom || ""} ${
        d?.utilisateur?.prenom || ""
      }`.toLowerCase();
      const ref = String(d?.ref || d?.id || "").toLowerCase();
      const mat = String(d?.utilisateur?.numeroEtudiant || "").toLowerCase();
      return nom.includes(q) || ref.includes(q) || mat.includes(q);
    });
  }, [demandes, search]);

  // ── Fragment commun : modal mot de passe + toast ─────
  const sharedOverlays = (
    <>
      {toast && (
        <div className={`sa-toast${toast.isError ? " sa-toast--error" : ""}`}>
          {toast.msg}
        </div>
      )}
      {showPwd && (
        <ModalMotDePasse
          onClose={() => setShowPwd(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </>
  );

  // ── DASHBOARD ────────────────────────────────────────
  if (view === "dashboard")
    return (
      <div className="agent-layout">
        <style>{css}</style>
        {sharedOverlays}
        <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
        <div className="agent-main">
          <Topbar user={user} />
          <div className="agent-content">
            <div className="agent-page-header">
              <div>
                <h2 className="agent-page-title">Division de la Scolarité</h2>
                <p className="agent-page-sub">
                  Validez les pièces et générez les attestations d'inscription.
                </p>
              </div>
              <button
                className="btn-actualiser"
                onClick={charger}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Actualiser
              </button>
            </div>

            {/* Stats */}
            <div className="agent-stats">
              {[
                {
                  val: stats.aTraiter,
                  label: "À TRAITER",
                  bg: "#eff6ff",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1d4ed8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                },
                {
                  val: stats.documentGenere,
                  label: "GÉNÉRÉES (MOIS)",
                  bg: "#f0fdf4",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                },
                {
                  val: stats.rejetees,
                  label: "REJETÉES",
                  bg: "#fef2f2",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  ),
                },
                {
                  val: stats.attenteDirecteur,
                  label: "EN ATTENTE SIGNATURE",
                  bg: "#f5f3ff",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <div className="agent-stat-card" key={i}>
                  <div
                    className="agent-stat-card__icon"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="agent-stat-card__value">{s.val}</div>
                    <div className="agent-stat-card__label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="agent-table-card">
              <div className="agent-table-header">
                <div className="agent-table-title">
                  Dossiers à examiner
                  <span className="count-badge">{filtered.length}</span>
                </div>
                <div className="search-box">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <table className="agent-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Étudiant</th>
                    <th>Document</th>
                    <th>Date soumission</th>
                    <th>Délai écoulé</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const nom =
                      `${d.utilisateur?.nom || ""} ${
                        d.utilisateur?.prenom || ""
                      }`.trim() || "—";
                    const num = d.utilisateur?.numeroEtudiant || "—";
                    const { label, urgent } = delaiLabel(d.createdAt);
                    return (
                      <tr key={d.id}>
                        <td className="td-ref">
                          {(d.ref || d.id || "")
                            .toString()
                            .substring(0, 8)
                            .toUpperCase()}
                        </td>
                        <td>
                          <div className="td-etudiant-name">{nom}</div>
                          <div className="td-etudiant-num">{num}</div>
                        </td>
                        <td className="td-doc">Attestation d'inscription</td>
                        <td className="td-date">{formatDate(d.createdAt)}</td>
                        <td>
                          <span
                            className={
                              urgent ? "td-delai-urgent" : "td-delai-ok"
                            }
                          >
                            {label}
                            {urgent ? " ⚠" : ""}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn-traiter"
                            onClick={() => openTraitement(d)}
                            type="button"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Traiter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "#94a3b8",
                          fontSize: ".9rem",
                        }}
                      >
                        Aucun dossier en attente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );

  // ── SUCCESS ──────────────────────────────────────────
  if (view === "success")
    return (
      <div className="agent-layout">
        <style>{css}</style>
        {sharedOverlays}
        <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
        <div className="agent-main">
          <Topbar user={user} />
          <div
            className="agent-content"
            style={{ maxWidth: 580, margin: "60px auto" }}
          >
            <div className="success-card">
              <div className="success-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="success-title">Attestation générée !</div>
              <div className="success-sub">
                L'attestation d'inscription a été générée et transmise au
                Directeur Adjoint pour signature.
              </div>
              <div className="success-ref">{generatedRef}</div>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn-traiter"
                  onClick={() => setView("dashboard")}
                  type="button"
                >
                  ← Retour au tableau de bord
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  // ── TRAITEMENT ───────────────────────────────────────
  const nom = selected
    ? `${selected.utilisateur?.nom || ""} ${
        selected.utilisateur?.prenom || ""
      }`.trim() || "—"
    : "—";

  return (
    <div className="agent-layout">
      <style>{css}</style>
      {sharedOverlays}
      <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
      <div className="agent-main">
        <Topbar user={user} />
        <div className="agent-content">
          {/* Back + header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 8,
            }}
          >
            <button
              className="back-btn"
              type="button"
              onClick={() => {
                setView("dashboard");
                setSelected(null);
                setPieces([]);
                setPreview(null);
                setModal(null);
              }}
            >
              ← Retour
            </button>
            <div>
              <h2 className="agent-page-title" style={{ fontSize: "1.3rem" }}>
                Traitement du dossier
              </h2>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: ".8rem",
                  color: "var(--blue)",
                }}
              >
                {(selected?.ref || selected?.id || "")
                  .toString()
                  .substring(0, 8)
                  .toUpperCase()}
              </div>
            </div>
          </div>

          <div className="traitement-grid">
            {/* ── GAUCHE — Infos ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Informations étudiant</div>
                </div>
                <div className="panel-body">
                  <div className="info-row">
                    <div className="info-label">Nom complet</div>
                    <div className="info-value">
                      {selected?.utilisateur
                        ? `${selected.utilisateur.nom || ""} ${
                            selected.utilisateur.prenom || ""
                          }`.trim() || "—"
                        : "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">N° Étudiant</div>
                    <div className="info-value">
                      {selected?.utilisateur?.numeroEtudiant || "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Filière / Niveau</div>
                    <div className="info-value">
                      {selected?.utilisateur?.filiere
                        ? `${selected.utilisateur.filiere} — ${
                            selected.utilisateur.niveau || ""
                          }`
                        : "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Institution</div>
                    <div className="info-value">
                      {selected?.institution?.nom || "IFRI — UAC"}
                    </div>
                  </div>
                  <div className="divider-h" />
                  <div className="info-row">
                    <div className="info-label">Type de document</div>
                    <div className="doc-type-pill">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {selected?.typeDocument === "ATTESTATION_INSCRIPTION"
                        ? "Attestation d'inscription"
                        : selected?.typeDocument === "RELEVE_NOTES"
                        ? "Relevé de notes"
                        : selected?.typeDocument || "—"}
                    </div>
                  </div>
                  {selected?.typeDocument === "ATTESTATION_INSCRIPTION" &&
                    selected?.anneeAcademique && (
                      <div className="info-row" style={{ marginTop: 10 }}>
                        <div className="info-label">Année académique</div>
                        <div
                          className="info-value"
                          style={{
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            padding: "5px 12px",
                            borderRadius: 7,
                            display: "inline-block",
                            fontWeight: 700,
                          }}
                        >
                          {selected.anneeAcademique}
                        </div>
                      </div>
                    )}
                  <div className="divider-h" />
                  <div className="info-row">
                    <div className="info-label">Date de soumission</div>
                    <div className="info-value">
                      {selected?.createdAt
                        ? new Date(selected.createdAt).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "long", year: "numeric" }
                          )
                        : "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Référence</div>
                    <div className="info-value mono">
                      {selected?.documents?.[0]?.reference || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CENTRE — Pièces ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: ".95rem",
                    color: "var(--navy)",
                  }}
                >
                  Vérification des pièces
                </div>
                <span className="badge blue">
                  {pieces.filter((p) => p.status === "valid").length}/
                  {pieces.length} validées
                </span>
              </div>

              {pieces.map((piece) => (
                <div className="piece-card" key={piece.id}>
                  <div className="piece-header">
                    <div className="piece-name">
                      <FileTextIcon />
                      {piece.name}
                    </div>
                    {piece.status === "valid" && (
                      <span className="badge green">
                        <CheckIcon /> Validée
                      </span>
                    )}
                    {piece.status === "reject" && (
                      <span className="badge red">
                        <XIcon /> Rejetée
                      </span>
                    )}
                    {piece.status === null && (
                      <span className="badge gray">En attente</span>
                    )}
                  </div>
                  <div className="piece-body">
                    <button
                      className="btn-preview"
                      onClick={() => openPreview(piece)}
                      type="button"
                    >
                      <EyeIcon /> Consulter le fichier
                    </button>
                    <div className="piece-actions">
                      <button
                        disabled={pieceBusy === piece.id}
                        className={`btn-valider valid ${
                          piece.status === "valid" ? "selected" : ""
                        }`}
                        onClick={() => setPieceStatus(piece.id, "valid")}
                        type="button"
                      >
                        <CheckIcon /> Valider ✓
                      </button>
                      <button
                        disabled={pieceBusy === piece.id}
                        className={`btn-valider reject ${
                          piece.status === "reject" ? "selected" : ""
                        }`}
                        onClick={() => setPieceStatus(piece.id, "reject")}
                        type="button"
                      >
                        <XIcon /> Rejeter ✗
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {allValidated && (
                <div className="info-box green">
                  ✓ Toutes les pièces sont validées. Vous pouvez générer
                  l'attestation.
                </div>
              )}
              {anyRejected && !allValidated && (
                <div
                  className="info-box"
                  style={{
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                  }}
                >
                  ⚠ Une ou plusieurs pièces rejetées. Rejetez la demande avec un
                  motif.
                </div>
              )}
            </div>

            {/* ── DROITE — Récap + Actions ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Récapitulatif</div>
                </div>
                <div className="panel-body">
                  {pieces.map((p) => (
                    <div
                      key={p.id}
                      className={`check-item ${
                        p.status === "valid"
                          ? "v"
                          : p.status === "reject"
                          ? "r"
                          : ""
                      }`}
                    >
                      <div className="check-name">{p.name}</div>
                      <div
                        className={`check-status ${
                          p.status === "valid"
                            ? "v"
                            : p.status === "reject"
                            ? "r"
                            : "p"
                        }`}
                      >
                        {p.status === "valid" ? (
                          <>
                            <CheckIcon /> Validée
                          </>
                        ) : p.status === "reject" ? (
                          <>
                            <XIcon /> Rejetée
                          </>
                        ) : (
                          "— En attente"
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="divider" />
                  <div
                    style={{
                      fontSize: ".72rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      marginBottom: 6,
                    }}
                  >
                    Commentaire général
                  </div>
                  <textarea
                    className="comment"
                    rows={3}
                    placeholder="Commentaire général (optionnel)..."
                    value={globalComment}
                    onChange={(e) => setGlobalComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Actions</div>
                </div>
                <div className="panel-body">
                  <button
                    className="btn-main generate"
                    disabled={!allValidated}
                    onClick={() => setModal("generate")}
                    type="button"
                  >
                    <SparkleIcon /> Valider et générer l'attestation
                  </button>
                  <button
                    className="btn-main reject-all"
                    type="button"
                    style={{
                      opacity: !allDecided || !anyRejected ? 0.4 : 1,
                      cursor:
                        !allDecided || !anyRejected ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      if (allDecided && anyRejected) setModal("reject");
                    }}
                  >
                    <XIcon /> Rejeter la demande
                  </button>
                  {!allDecided && (
                    <div className="info-box blue" style={{ marginTop: 4 }}>
                      Décidez pour chaque pièce avant de continuer.
                    </div>
                  )}
                  {allValidated && (
                    <div className="info-box green" style={{ marginTop: 4 }}>
                      Les données d'inscription seront injectées
                      automatiquement.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal génération */}
      {modal === "generate" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <SparkleIcon /> Confirmer la génération
            </div>
            <div className="modal-body">
              Vous allez générer l'attestation d'inscription pour{" "}
              <strong>{nom}</strong>.<br />
              <br />
              Le système injectera automatiquement les données d'inscription
              (filière, niveau, année académique) dans le template officiel.{" "}
              <strong>Cette action est irréversible.</strong>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setModal(null)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="modal-btn confirm-gen"
                onClick={handleGenerate}
                type="button"
              >
                ✓ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rejet */}
      {modal === "reject" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <XIcon /> Rejeter la demande
            </div>
            <div className="modal-body">
              Rejeter la demande de <strong>{nom}</strong>. L'étudiant sera
              notifié par email.
            </div>
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
              }}
            >
              Motif de rejet *
            </div>
            <textarea
              className="motif-input"
              rows={4}
              placeholder="Motif précis (minimum 20 caractères)..."
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                setMotifError("");
              }}
            />
            <div
              style={{
                fontSize: ".72rem",
                color: "var(--muted)",
                textAlign: "right",
                marginTop: 3,
              }}
            >
              {motif.length}/20 min
            </div>
            {motifError && (
              <div
                style={{
                  fontSize: ".75rem",
                  color: "var(--red)",
                  marginTop: 3,
                }}
              >
                {motifError}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button
                className="modal-btn cancel"
                type="button"
                onClick={() => {
                  setModal(null);
                  setMotif("");
                  setMotifError("");
                }}
              >
                Annuler
              </button>
              <button
                className="modal-btn confirm-rej"
                onClick={handleReject}
                type="button"
              >
                ✗ Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview fichier */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div
            className="modal"
            style={{ width: "900px", maxWidth: "95vw", height: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              <EyeIcon /> {preview.name}
            </div>
            <div
              style={{
                height: "calc(85vh - 100px)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <iframe
                title="preview"
                src={preview.url}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button
                className="modal-btn cancel"
                onClick={() => setPreview(null)}
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
