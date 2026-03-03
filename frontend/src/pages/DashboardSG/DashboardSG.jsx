import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDemandes, avancerDemande, downloadDocumentBlob, getStatsSG } from "../../services/api";
import logo from "../../assets/logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

  .sg-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }

  /* ── SIDEBAR ── */
  .sg-sidebar {
    width: 200px; min-height: 100vh; flex-shrink: 0;
    background: #fff; border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    padding: 0 0 24px 0;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
  }
  .sg-sidebar__brand {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 28px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.1rem;
    color: #1a2744; text-decoration: none;
  }
  .sg-sidebar__brand-icon {
    width: 42px; height: 42px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    overflow: hidden; background: transparent;
  }
  .sg-sidebar__nav {
    flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px;
  }
  .sg-sidebar__link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
    color: #475569; text-decoration: none;
    transition: background .15s, color .15s;
    border: none; background: none; cursor: pointer; width: 100%; text-align: left;
  }
  .sg-sidebar__link:hover { background: #f1f5f9; color: #1a2744; }
  .sg-sidebar__link.active { background: #1a2744; color: #fff; }
  .sg-sidebar__link.active svg { stroke: #fff; }
  .sg-sidebar__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .sg-sidebar__link:hover svg { stroke: #1a2744; }
  .sg-sidebar__divider { height: 1px; background: #e2e8f0; margin: 12px 10px; }
  .sg-sidebar__logout {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 22px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
    color: #94a3b8; background: none; border: none; cursor: pointer; width: 100%;
    transition: color .15s;
  }
  .sg-sidebar__logout:hover { color: #ef4444; }
  .sg-sidebar__logout:hover svg { stroke: #ef4444; }
  .sg-sidebar__logout svg { stroke: #94a3b8; transition: stroke .15s; }

  /* ── MAIN ── */
  .sg-main { margin-left: 200px; flex: 1; display: flex; flex-direction: column; }

  /* ── TOPBAR ── */
  .sg-topbar {
    background: #fff; border-bottom: 1px solid #e2e8f0;
    padding: 0 36px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 40;
  }
  .sg-topbar__breadcrumb {
    background: #f8fafc; border: 1px solid #e2e8f0;
    padding: 6px 16px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #1a2744;
  }
  .sg-topbar__right { display: flex; align-items: center; gap: 20px; }
  .sg-topbar__notif {
    position: relative; background: none; border: none; cursor: pointer;
    padding: 4px; color: #64748b; display: flex; align-items: center;
  }
  .sg-topbar__notif-dot {
    position: absolute; top: 2px; right: 2px; width: 9px; height: 9px;
    background: #f59e0b; border-radius: 50%; border: 2px solid white;
  }
  .sg-topbar__user-info { text-align: left; }
  .sg-topbar__user-name { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #1a2744; line-height: 1.3; }
  .sg-topbar__user-org  { font-size: 12px; color: #64748b; }
  .sg-topbar__avatar {
    width: 40px; height: 40px; background: #1a2744;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px;
    color: white; letter-spacing: 0.5px; flex-shrink: 0;
  }

  /* ── CONTENT ── */
  .sg-content { padding: 32px 36px; flex: 1; display: flex; flex-direction: column; gap: 24px; }

  /* ── HERO ── */
  .sg-hero {
    background: linear-gradient(135deg, #1a2744 0%, #243057 100%);
    border-radius: 16px; padding: 32px 36px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .sg-hero::after {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(245,166,35,.08);
  }
  .sg-hero h1 {
    font-family: 'Sora', sans-serif; font-weight: 800;
    font-size: clamp(1.2rem, 2.5vw, 1.55rem);
    color: #fff; margin-bottom: 6px; line-height: 1.3;
  }
  .sg-hero p { color: rgba(255,255,255,.65); font-size: .9rem; margin-bottom: 20px; }
  .sg-hero__btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #f5a623; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    padding: 11px 22px; border-radius: 10px; border: none; cursor: pointer;
    transition: background .2s, transform .15s;
  }
  .sg-hero__btn:hover { background: #fbbf4a; transform: translateY(-1px); }
  .sg-hero__btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── STATS ── */
  .sg-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .sg-stat-card {
    background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
    padding: 20px 22px; display: flex; flex-direction: column; gap: 8px;
    position: relative; overflow: hidden;
  }
  .sg-stat-card__accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; border-radius: 14px 0 0 14px; }
  .sg-stat-card__header { display: flex; align-items: center; justify-content: space-between; }
  .sg-stat-card__label { font-size: 0.85rem; color: #475569; font-family: 'DM Sans', sans-serif; }
  .sg-stat-card__value { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 2rem; color: #1a2744; line-height: 1; }
  .sg-stat-card__sub { font-size: 0.8rem; color: #94a3b8; }

  /* ── TABLE ── */
  .sg-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
  .sg-table-header { padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; }
  .sg-table-title {
    font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700;
    color: #1a2744; display: flex; align-items: center; gap: 10px;
  }
  .sg-badge-count {
    background: #1a2744; color: white; font-size: 11px; font-weight: 700;
    padding: 2px 9px; border-radius: 20px; min-width: 22px; text-align: center;
  }
  .sg-search-box { position: relative; display: flex; align-items: center; }
  .sg-search-icon { position: absolute; left: 12px; color: #64748b; font-size: 15px; pointer-events: none; }
  .sg-search-input {
    padding: 9px 14px 9px 36px; border: 1px solid #e2e8f0; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1a2744; background: #f8fafc;
    outline: none; width: 230px; transition: border-color .2s, background .2s;
  }
  .sg-search-input:focus { border-color: #1a2744; background: white; box-shadow: 0 0 0 3px rgba(26,39,68,.08); }
  .sg-search-input::placeholder { color: #94a3b8; }
  .sg-table-divider { height: 1px; background: #e2e8f0; }
  .sg-table-wrapper { overflow-x: auto; }
  .sg-table { width: 100%; border-collapse: collapse; }
  .sg-table thead th {
    padding: 14px 28px; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    color: #64748b; text-transform: uppercase; letter-spacing: 1.2px;
    background: white; white-space: nowrap;
  }
  .sg-table tbody td {
    padding: 14px 28px; border-top: 1px solid #e2e8f0;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    vertical-align: middle; color: #1a2744;
  }
  .sg-table tbody tr:hover { background: #f8fafc; }
  .sg-mono { font-family: 'DM Mono', monospace; font-size: 12px; color: #1a2744; }
  .sg-muted { color: #64748b; font-size: 12px; }
  .sg-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 20px;
    font-size: .8rem; font-weight: 700;
    background: #f1f5f9; color: #475569;
  }
  .sg-btn {
    border: none; cursor: pointer; border-radius: 10px; padding: 9px 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
    transition: .2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .sg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .sg-btn.primary { background: #1a2744; color: white; }
  .sg-btn.primary:hover { background: #243057; }
  .sg-btn.outline { background: white; color: #334155; border: 1.5px solid #e2e8f0; }
  .sg-btn.outline:hover { border-color: #1a2744; color: #1a2744; }
  .sg-empty { padding: 80px 24px; text-align: center; background: #f8fafc; }
  .sg-empty__icon { font-size: 44px; margin-bottom: 14px; opacity: 0.25; }
  .sg-empty__text { font-size: 14px; color: #64748b; font-weight: 500; }

  /* ── MODAL PREVIEW ── */
  .sg-modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.55);
    z-index: 999; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2px);
  }
  .sg-modal {
    background: white; border-radius: 18px;
    width: 900px; max-width: 95vw; height: 85vh;
    padding: 18px 18px 16px;
    box-shadow: 0 24px 64px rgba(0,0,0,.25);
    display: flex; flex-direction: column; gap: 12px;
  }
  .sg-modal__title {
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #1a2744;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .sg-modal__body { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #f8fafc; }
  .sg-modal__actions { display: flex; justify-content: flex-end; gap: 10px; }

  /* ── MODAL MOT DE PASSE ── */
  .pwd-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.5);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(3px); padding: 16px;
  }
  .pwd-modal {
    background: #fff; border-radius: 16px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 60px rgba(0,0,0,.18); overflow: hidden;
  }
  .pwd-modal__head {
    padding: 22px 26px 18px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .pwd-modal__title {
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.05rem; color: #1a2744;
    display: flex; align-items: center; gap: 10px;
  }
  .pwd-modal__title-icon {
    width: 36px; height: 36px; border-radius: 10px; background: #eff6ff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pwd-modal__close {
    background: none; border: none; cursor: pointer; color: #94a3b8;
    font-size: 1.3rem; line-height: 1; padding: 2px; transition: color .15s;
  }
  .pwd-modal__close:hover { color: #1a2744; }
  .pwd-modal__body { padding: 20px 26px; display: flex; flex-direction: column; gap: 14px; }
  .pwd-field { display: flex; flex-direction: column; gap: 6px; }
  .pwd-label {
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 600;
    color: #475569; text-transform: uppercase; letter-spacing: .04em;
  }
  .pwd-input-wrap { position: relative; }
  .pwd-input {
    width: 100%; padding: 11px 42px 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: #334155;
    outline: none; transition: border-color .2s; box-sizing: border-box;
  }
  .pwd-input:focus { border-color: #1a2744; }
  .pwd-input.pwd-err { border-color: #ef4444; }
  .pwd-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    display: flex; align-items: center; padding: 0; transition: color .15s;
  }
  .pwd-eye:hover { color: #1a2744; }
  .pwd-strength { display: flex; gap: 4px; margin-top: 4px; }
  .pwd-strength__bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }
  .pwd-strength__bar.weak   { background: #ef4444; }
  .pwd-strength__bar.medium { background: #f5a623; }
  .pwd-strength__bar.strong { background: #16a34a; }
  .pwd-hint { font-size: .75rem; color: #94a3b8; margin-top: 2px; }
  .pwd-hint-err { color: #ef4444; }
  .pwd-modal__footer { padding: 0 26px 22px; }
  .pwd-btn-row { display: flex; gap: 10px; }
  .pwd-btn {
    flex: 1; padding: 11px 16px; border-radius: 9px; border: none;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  }
  .pwd-btn:disabled { opacity: .55; cursor: not-allowed; }
  .pwd-btn--ghost   { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; }
  .pwd-btn--ghost:hover:not(:disabled) { border-color: #1a2744; color: #1a2744; }
  .pwd-btn--primary { background: #1a2744; color: #fff; }
  .pwd-btn--primary:hover:not(:disabled) { background: #243057; }

  /* ── TOAST ── */
  .sg-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 300;
    background: #1a2744; color: #fff; padding: 13px 20px; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,.2); animation: sg-toast-in .2s ease;
  }
  .sg-toast--error { background: #dc2626; }
  @keyframes sg-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  @media (max-width: 900px) {
    .sg-stats-grid { grid-template-columns: 1fr 1fr; }
    .sg-main { margin-left: 0; }
  }
`;

/* ── ICÔNES ── */
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ── HELPERS ── */
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};
const getEtudiantLabel = (d) => {
  const u = d?.utilisateur;
  const fallback = d?.etudiant || d?.nomEtudiant || "";
  if (!u) return fallback || "—";
  const full = `${u?.prenom ?? ""} ${u?.nom ?? ""}`.trim();
  return full || fallback || "—";
};
const getNumeroEtudiant = (d) => d?.utilisateur?.numeroEtudiant || d?.numeroEtudiant || d?.num || "—";
const getReferenceDoc = (d) => {
  const doc = Array.isArray(d?.documents) ? d.documents[0] : null;
  return doc?.reference || d?.reference || d?.ref || "—";
};

/* ── Force du mot de passe ── */
function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

/* ── Modal Modifier Mot de Passe ── */
function ModalMotDePasse({ onClose, onSuccess }) {
  const [actuel, setActuel]       = useState("");
  const [nouveau, setNouveau]     = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [showA, setShowA] = useState(false);
  const [showN, setShowN] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState("");

  const strength = getStrength(nouveau);
  const strengthLabel = ["", "Faible", "Faible", "Moyen", "Fort"][strength];
  const strengthClass = strength <= 2 ? "weak" : strength === 3 ? "medium" : "strong";

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );

  const handleSubmit = async () => {
    setErreur("");
    if (!actuel || !nouveau || !confirmer) { setErreur("Tous les champs sont obligatoires."); return; }
    if (nouveau.length < 8) { setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (nouveau !== confirmer) { setErreur("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("etudocs_token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ancienMotDePasse: actuel, nouveauMotDePasse: nouveau }),
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
    <div className="pwd-overlay" onClick={onClose}>
      <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pwd-modal__head">
          <div className="pwd-modal__title">
            <div className="pwd-modal__title-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            Modifier le mot de passe
          </div>
          <button className="pwd-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="pwd-modal__body">
          {/* Actuel */}
          <div className="pwd-field">
            <label className="pwd-label">Mot de passe actuel</label>
            <div className="pwd-input-wrap">
              <input type={showA ? "text" : "password"} className="pwd-input" placeholder="••••••••"
                value={actuel} onChange={(e) => setActuel(e.target.value)} autoFocus />
              <button className="pwd-eye" type="button" onClick={() => setShowA(v => !v)}><EyeIcon show={showA} /></button>
            </div>
          </div>

          {/* Nouveau */}
          <div className="pwd-field">
            <label className="pwd-label">Nouveau mot de passe</label>
            <div className="pwd-input-wrap">
              <input type={showN ? "text" : "password"} className="pwd-input" placeholder="••••••••"
                value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
              <button className="pwd-eye" type="button" onClick={() => setShowN(v => !v)}><EyeIcon show={showN} /></button>
            </div>
            {nouveau && (
              <>
                <div className="pwd-strength">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`pwd-strength__bar ${strength >= i ? strengthClass : ""}`} />
                  ))}
                </div>
                <div className="pwd-hint">{strengthLabel} — minimum 8 caractères</div>
              </>
            )}
          </div>

          {/* Confirmer */}
          <div className="pwd-field">
            <label className="pwd-label">Confirmer le nouveau mot de passe</label>
            <div className="pwd-input-wrap">
              <input type={showC ? "text" : "password"}
                className={`pwd-input ${confirmer && confirmer !== nouveau ? "pwd-err" : ""}`}
                placeholder="••••••••" value={confirmer} onChange={(e) => setConfirmer(e.target.value)} />
              <button className="pwd-eye" type="button" onClick={() => setShowC(v => !v)}><EyeIcon show={showC} /></button>
            </div>
            {confirmer && confirmer !== nouveau && (
              <div className="pwd-hint pwd-hint-err">Les mots de passe ne correspondent pas</div>
            )}
          </div>

          {erreur && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"10px 14px", fontSize:".85rem", color:"#dc2626" }}>
              {erreur}
            </div>
          )}
        </div>

        <div className="pwd-modal__footer">
          <div className="pwd-btn-row">
            <button className="pwd-btn pwd-btn--ghost" onClick={onClose} disabled={loading}>Annuler</button>
            <button className="pwd-btn pwd-btn--primary" onClick={handleSubmit}
              disabled={loading || !actuel || !nouveau || !confirmer}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ── */
export default function DashboardSG() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]         = useState(false);
  const [busyId, setBusyId]           = useState(null);
  const [demandes, setDemandes]       = useState([]);
  const [preview, setPreview]         = useState(null);
  const [showPwd, setShowPwd]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [statsExternes, setStatsExternes] = useState({ transmises: 0, rejetees: 0 });

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const charger = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        getDemandes(),
        getStatsSG().catch(() => ({ transmises: 0, rejetees: 0 })),
      ]);
      const list = Array.isArray(data) ? data : (data?.demandes ?? []);
      const demandesATransmettre = list
        .filter(d => d.statut === "TRANSMISE_SECRETAIRE_ADJOINT")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setDemandes(demandesATransmettre);
      setStatsExternes(statsData);
    } catch (e) {
      console.error(e);
      setDemandes([]);
      alert(e?.message || "Erreur chargement demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return demandes;
    return demandes.filter((d) => {
      const ref  = (getReferenceDoc(d) || "").toLowerCase();
      const etu  = (getEtudiantLabel(d) || "").toLowerCase();
      const num  = (getNumeroEtudiant(d) || "").toLowerCase();
      const type = ((d?.typeDocument || "") + "").toLowerCase();
      return ref.includes(q) || etu.includes(q) || num.includes(q) || type.includes(q);
    });
  }, [demandes, searchQuery]);

  const handleTransmettre = async (demande) => {
    if (!demande?.id) return;
    setBusyId(demande.id);
    try {
      await avancerDemande(demande.id, "TRANSMETTRE");
      await charger();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur transmission");
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = async (demande) => {
    const reference = getReferenceDoc(demande);
    if (!reference || reference === "—") { alert("Aucune référence de document trouvée."); return; }
    try {
      const blob = await downloadDocumentBlob(reference);
      const url = window.URL.createObjectURL(blob);
      setPreview({ url, name: reference });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Impossible d'ouvrir le document");
    }
  };

  const closePreview = () => {
    if (preview?.url) window.URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handleLogout = () => {
    ["etudocs_token","token","etudocs_user"].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`sg-toast${toast.isError ? " sg-toast--error" : ""}`}>{toast.msg}</div>
      )}

      {/* Modal mot de passe */}
      {showPwd && (
        <ModalMotDePasse
          onClose={() => setShowPwd(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      <div className="sg-layout">

        {/* ── SIDEBAR ── */}
        <aside className="sg-sidebar">
          <a href="/" className="sg-sidebar__brand">
            <div className="sg-sidebar__brand-icon">
              <img src={logo} alt="EtuDocs" style={{ width: 52, height: 52, objectFit: "contain" }} />
            </div>
            EtuDocs
          </a>

          <nav className="sg-sidebar__nav">
            <button className="sg-sidebar__link active">
              <GridIcon />
              Tableau de bord
            </button>

            {/* Modifier mot de passe */}
            <button className="sg-sidebar__link" onClick={() => setShowPwd(true)}>
              <LockIcon />
              Modifier mot de passe
            </button>
          </nav>

          <div className="sg-sidebar__divider" />
          <button className="sg-sidebar__logout" onClick={handleLogout} type="button">
            <LogoutIcon />
            Déconnexion
          </button>
        </aside>

        {/* ── MAIN ── */}
        <main className="sg-main">

          {/* TOPBAR */}
          <header className="sg-topbar">
            <div className="sg-topbar__breadcrumb">Secrétaire Général — IFRI</div>
            <div className="sg-topbar__right">
              <button className="sg-topbar__notif" title="Notifications">
                <BellIcon />
                <span className="sg-topbar__notif-dot" />
              </button>
              <div className="sg-topbar__avatar">SG</div>
              <div className="sg-topbar__user-info">
                <div className="sg-topbar__user-name">Secrétaire Général</div>
                <div className="sg-topbar__user-org">IFRI</div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="sg-content">

            {/* HERO */}
            <div className="sg-hero">
              <div>
                <h1>Espace Secrétaire Général</h1>
                <p>Transmission des demandes au Chef de Division</p>
                <button className="sg-hero__btn" onClick={charger} disabled={loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  {loading ? "Chargement..." : "Actualiser"}
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="sg-stats-grid">
              <div className="sg-stat-card">
                <div className="sg-stat-card__accent" style={{ background: "#7c3aed" }} />
                <div className="sg-stat-card__header"><span className="sg-stat-card__label">À transmettre</span></div>
                <div className="sg-stat-card__value">{demandes.length}</div>
                <div className="sg-stat-card__sub">Suivi des transmissions</div>
              </div>
              <div className="sg-stat-card">
                <div className="sg-stat-card__accent" style={{ background: "#22c55e" }} />
                <div className="sg-stat-card__header"><span className="sg-stat-card__label">Transmis (mois)</span></div>
                <div className="sg-stat-card__value">{loading ? "…" : statsExternes.transmises}</div>
                <div className="sg-stat-card__sub">Ce mois-ci</div>
              </div>
              <div className="sg-stat-card">
                <div className="sg-stat-card__accent" style={{ background: "#ef4444" }} />
                <div className="sg-stat-card__header"><span className="sg-stat-card__label">Refusés</span></div>
                <div className="sg-stat-card__value">{loading ? "…" : statsExternes.rejetees}</div>
                <div className="sg-stat-card__sub">Demandes refusées</div>
              </div>
            </div>

            {/* TABLE */}
            <div className="sg-table-card">
              <div className="sg-table-header">
                <div className="sg-table-title">
                  Demandes à transmettre
                  <span className="sg-badge-count">{filtered.length}</span>
                </div>
                <div className="sg-search-box">
                  <span className="sg-search-icon"><SearchIcon /></span>
                  <input className="sg-search-input" placeholder="Rechercher..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="sg-table-divider" />

              <div className="sg-table-wrapper">
                <table className="sg-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Document</th>
                      <th>Soumission ↑</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id || getReferenceDoc(d)}>
                        <td><span className="sg-mono">{getReferenceDoc(d)}</span></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{getEtudiantLabel(d)}</div>
                          <div className="sg-muted">N° {getNumeroEtudiant(d)}</div>
                        </td>
                        <td>{d?.typeDocument || "—"}</td>
                        <td className="sg-muted">{formatDate(d?.createdAt)}</td>
                        <td><span className="sg-chip">{d?.statut || "—"}</span></td>
                        <td style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                          <button className="sg-btn primary" onClick={() => handleTransmettre(d)}
                            disabled={busyId === d.id}>
                            ⏩ Transmettre
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="sg-empty">
                    <div className="sg-empty__icon">📄</div>
                    <div className="sg-empty__text">Aucune demande à transmettre</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="sg-modal-overlay" onClick={closePreview}>
          <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sg-modal__title">
              <span style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>👁</span> Aperçu — <span className="sg-mono">{preview.name}</span>
              </span>
              <button className="sg-btn outline" onClick={closePreview}>Fermer</button>
            </div>
            <div className="sg-modal__body">
              <iframe title="preview" src={preview.url} style={{ width:"100%", height:"100%", border:"none" }} />
            </div>
            <div className="sg-modal__actions">
              <button className="sg-btn outline" onClick={closePreview}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}