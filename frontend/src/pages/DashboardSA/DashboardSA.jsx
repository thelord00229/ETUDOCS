import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { getDemandes, avancerDemande, clearSession } from "../../services/api";
import logo from "../../assets/logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .agent-layout {
    display: flex; min-height: 100vh;
    background: #f8fafc; font-family: 'DM Sans', sans-serif;
  }

  /* ── SIDEBAR (style unifié blanc) ── */
  .agent-sidebar {
    width: 220px; flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    padding-bottom: 24px;
  }
  .agent-sidebar__brand {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 20px;
    text-decoration: none;
  }
  .agent-sidebar__brand-logo {
    height: 52px; width: auto; object-fit: contain;
  }
  .agent-sidebar__brand-name {
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.15rem;
    color: #1a2744; letter-spacing: -.01em;
  }
  .agent-sidebar__nav {
    flex: 1; padding: 0 12px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .agent-sidebar__link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #475569; text-decoration: none;
    transition: background .15s, color .15s;
    background: none; border: none; cursor: pointer; width: 100%; text-align: left;
  }
  .agent-sidebar__link:hover { background: #f1f5f9; color: #1a2744; }
  .agent-sidebar__link.active { background: #1a2744; color: #fff; }
  .agent-sidebar__link.active svg { stroke: #fff; }
  .agent-sidebar__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .agent-sidebar__link:hover svg { stroke: #1a2744; }
  .agent-sidebar__link.active:hover svg { stroke: #fff; }

  .agent-sidebar__divider { height: 1px; background: #e2e8f0; margin: 12px 12px; }
  .agent-sidebar__logout {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 24px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #94a3b8; background: none; border: none; cursor: pointer; width: 100%;
    transition: color .15s;
  }
  .agent-sidebar__logout:hover { color: #ef4444; }
  .agent-sidebar__logout:hover svg { stroke: #ef4444; }
  .agent-sidebar__logout svg { stroke: #94a3b8; transition: stroke .15s; }

  /* ── MAIN ── */
  .agent-main { margin-left: 220px; flex: 1; min-width: 0; display: flex; flex-direction: column; }

  /* ── TOPBAR ── */
  .agent-topbar {
    height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px;
    position: sticky; top: 0; z-index: 40;
  }
  .agent-topbar__role {
    display: inline-flex; align-items: center;
    padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500; color: #475569;
  }
  .agent-topbar__right { display: flex; align-items: center; gap: 16px; }
  .agent-topbar__notif {
    position: relative; background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;
  }
  .agent-topbar__badge {
    position: absolute; top: 0; right: 0; width: 8px; height: 8px;
    border-radius: 50%; background: #f5a623; border: 2px solid #fff;
  }
  .agent-topbar__user { display: flex; align-items: center; gap: 10px; }
  .agent-topbar__avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #1a2744;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .82rem; color: #fff; flex-shrink: 0;
  }
  .agent-topbar__info { line-height: 1.3; }
  .agent-topbar__name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem; color: #1a2744; }
  .agent-topbar__meta { font-size: .75rem; color: #94a3b8; }

  /* ── CONTENT ── */
  .agent-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; padding-bottom: 48px; }

  /* PAGE HEADER */
  .agent-page-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .agent-page-title  { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.6rem; color: #1a2744; margin-bottom: 4px; }
  .agent-page-sub    { color: #475569; font-size: .9rem; }
  .btn-actualiser {
    display: inline-flex; align-items: center; gap: 8px;
    background: #1a2744; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    padding: 11px 24px; cursor: pointer; transition: background .2s;
    white-space: nowrap;
  }
  .btn-actualiser:hover { background: #243057; }
  .btn-actualiser:disabled { opacity: .6; cursor: not-allowed; }

  /* STATS GRID */
  .agent-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .agent-stat-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 20px 22px; display: flex; align-items: center; gap: 16px;
  }
  .agent-stat-card__icon {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .agent-stat-card__value {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.8rem; color: #1a2744; line-height: 1;
  }
  .agent-stat-card__label {
    font-size: .72rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #94a3b8; margin-top: 4px;
  }

  /* TABLE CARD */
  .agent-table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
  .agent-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid #f1f5f9;
    gap: 12px;
  }
  .agent-table-title {
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744;
    display: flex; align-items: center; gap: 10px;
  }
  .count-badge {
    width: 22px; height: 22px; border-radius: 50%; background: #1a2744; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .75rem;
    display: flex; align-items: center; justify-content: center;
  }
  .agent-table-actions { display: flex; align-items: center; gap: 8px; }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 12px;
    background: #f8fafc;
  }
  .search-box input {
    border: none; background: none; outline: none; font-family: 'DM Sans', sans-serif;
    font-size: .85rem; color: #334155; width: 160px;
  }
  .search-box input::placeholder { color: #cbd5e1; }
  .btn-filter {
    width: 36px; height: 36px; border: 1.5px solid #e2e8f0; border-radius: 8px;
    background: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: border-color .2s;
  }
  .btn-filter:hover { border-color: #1a2744; }

  /* TABLE */
  .agent-table { width: 100%; border-collapse: collapse; }
  .agent-table thead tr { background: #f8fafc; }
  .agent-table th {
    text-align: left; padding: 12px 20px;
    font-family: 'Sora', sans-serif; font-weight: 600; font-size: .75rem;
    color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap;
  }
  .agent-table td { padding: 16px 20px; border-bottom: 1px solid #f8fafc; }
  .agent-table tbody tr:last-child td { border-bottom: none; }
  .agent-table tbody tr:hover { background: #fafbff; }

  .td-ref   { font-size: .82rem; color: #94a3b8; font-family: 'DM Sans', sans-serif; }
  .td-etudiant-name { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .9rem; color: #1a2744; }
  .td-etudiant-num  { font-size: .78rem; color: #94a3b8; margin-top: 2px; }
  .td-doc   { font-size: .9rem; color: #334155; }
  .td-date  { font-size: .88rem; color: #475569; }

  .badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600; white-space: nowrap; }
  .badge--new        { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .badge--correction { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
  .badge--other      { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

  .td-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
  .btn-verifier {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500; color: #1a2744;
    background: none; border: none; cursor: pointer; transition: color .2s;
  }
  .btn-verifier:hover { color: #f5a623; }
  .btn-verifier:hover svg { stroke: #f5a623; }
  .btn-verifier svg { stroke: #1a2744; transition: stroke .2s; }

  /* STATE */
  .state-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 24px; color: #475569; font-size: .9rem; }
  .state-error { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

  /* ── MODAL VÉRIFIER ── */
  .sa-modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.5);
    z-index: 100; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(3px); padding: 16px;
  }
  .sa-modal {
    background: #fff; border-radius: 16px; width: 100%; max-width: 520px;
    box-shadow: 0 24px 60px rgba(0,0,0,.18); overflow: hidden;
  }
  .sa-modal__head {
    padding: 22px 26px 18px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  }
  .sa-modal__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.05rem; color: #1a2744; }
  .sa-modal__ref   { font-size: .78rem; color: #94a3b8; margin-top: 3px; font-family: 'DM Sans', sans-serif; }
  .sa-modal__close {
    background: none; border: none; cursor: pointer; color: #94a3b8;
    font-size: 1.3rem; line-height: 1; padding: 2px; flex-shrink: 0;
    transition: color .15s;
  }
  .sa-modal__close:hover { color: #1a2744; }
  .sa-modal__body { padding: 20px 26px; display: flex; flex-direction: column; gap: 14px; }

  .sa-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .sa-info-item {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;
  }
  .sa-info-key   { font-size: .72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
  .sa-info-val   { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .88rem; color: #1a2744; }

  .sa-pieces-label { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .85rem; color: #1a2744; margin-bottom: 6px; }
  .sa-piece-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 9px; margin-bottom: 6px; gap: 10px;
  }
  .sa-piece-row:last-child { margin-bottom: 0; }
  .sa-piece-name { font-size: .85rem; font-weight: 600; color: #334155; }
  .sa-piece-meta { font-size: .75rem; color: #94a3b8; margin-top: 2px; }
  .sa-piece-tag  {
    font-size: .75rem; font-weight: 600; color: #475569;
    background: #f1f5f9; border-radius: 6px; padding: 3px 8px; white-space: nowrap;
  }

  .sa-modal__footer { padding: 0 26px 22px; display: flex; flex-direction: column; gap: 10px; }

  .sa-correction-area {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; color: #334155;
    resize: vertical; min-height: 80px; outline: none;
    transition: border-color .2s; box-sizing: border-box;
  }
  .sa-correction-area:focus { border-color: #1a2744; }
  .sa-correction-area::placeholder { color: #cbd5e1; }

  .sa-btn-row { display: flex; gap: 10px; }
  .sa-btn {
    flex: 1; padding: 11px 16px; border-radius: 9px; border: none;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  }
  .sa-btn:disabled { opacity: .55; cursor: not-allowed; }
  .sa-btn--ghost  { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; }
  .sa-btn--ghost:hover:not(:disabled)  { border-color: #1a2744; color: #1a2744; }
  .sa-btn--warn   { background: #fff7ed; color: #c2410c; border: 1.5px solid #fed7aa; }
  .sa-btn--warn:hover:not(:disabled)   { background: #ffedd5; }
  .sa-btn--primary { background: #1a2744; color: #fff; }
  .sa-btn--primary:hover:not(:disabled) { background: #243057; }
  .sa-btn--danger  { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
  .sa-btn--danger:hover:not(:disabled)  { background: #fee2e2; }

  /* ── MODAL MOT DE PASSE ── */
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
  .pwd-input.error { border-color: #ef4444; }
  .pwd-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    display: flex; align-items: center; padding: 0;
    transition: color .15s;
  }
  .pwd-eye:hover { color: #1a2744; }
  .pwd-strength { display: flex; gap: 4px; margin-top: 4px; }
  .pwd-strength__bar {
    flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0;
    transition: background .3s;
  }
  .pwd-strength__bar.weak   { background: #ef4444; }
  .pwd-strength__bar.medium { background: #f5a623; }
  .pwd-strength__bar.strong { background: #16a34a; }
  .pwd-hint { font-size: .75rem; color: #94a3b8; margin-top: 2px; }
  .pwd-hint.error { color: #ef4444; }
  .pwd-modal__footer { padding: 0 26px 22px; }

  /* Toast */
  .sa-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 200;
    background: #1a2744; color: #fff;
    padding: 13px 20px; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,.2);
    animation: sa-toast-in .2s ease;
  }
  .sa-toast--error { background: #dc2626; }
  @keyframes sa-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

const NAV = [
  {
    to: "/dashboardsa",
    label: "Tableau de bord",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

/* ─── helpers ─────────────────────────────────────────── */
const TYPE_LABEL = {
  RELEVE_NOTES: "Relevé de notes",
  ATTESTATION_INSCRIPTION: "Attestation d'inscription",
};

const PIECE_LABEL = {
  CIP: "Carte d'Identité Personnelle",
  QUITTANCE: "Quittance de paiement",
  ACTE_NAISSANCE: "Acte de naissance",
  JUSTIFICATIF_INSCRIPTION: "Justificatif d'inscription",
};

const SA_STATUTS = ["SOUMISE", "CORRECTION_DEMANDEE"];

const badgeClass = (statut) => {
  if (statut === "SOUMISE") return "badge--new";
  if (statut === "CORRECTION_DEMANDEE") return "badge--correction";
  return "badge--other";
};

const badgeLabel = (statut) => {
  if (statut === "SOUMISE") return "Nouvelle";
  if (statut === "CORRECTION_DEMANDEE") return "Correction demandée";
  return statut;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const initials = (nom = "", prenom = "") =>
  `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();

/* ─── Force/indicateur de robustesse du mot de passe ─── */
function getStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
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
  const strengthClass = strength <= 1 ? "weak" : strength <= 2 ? "weak" : strength === 3 ? "medium" : "strong";

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
      // Appel API — adapter selon votre endpoint
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pwd-modal__head">
          <div className="pwd-modal__title">
            <div className="pwd-modal__title-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            Modifier le mot de passe
          </div>
          <button className="sa-modal__close" onClick={onClose}>×</button>
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
              <button className="pwd-eye" type="button" onClick={() => setShowActuel((v) => !v)}>
                <EyeIcon show={showActuel} />
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
              <button className="pwd-eye" type="button" onClick={() => setShowNouveau((v) => !v)}>
                <EyeIcon show={showNouveau} />
              </button>
            </div>
            {nouveau && (
              <>
                <div className="pwd-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pwd-strength__bar ${strength >= i ? strengthClass : ""}`}
                    />
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
              <input
                type={showConfirmer ? "text" : "password"}
                className={`pwd-input ${confirmer && confirmer !== nouveau ? "error" : ""}`}
                placeholder="••••••••"
                value={confirmer}
                onChange={(e) => setConfirmer(e.target.value)}
              />
              <button className="pwd-eye" type="button" onClick={() => setShowConfirmer((v) => !v)}>
                <EyeIcon show={showConfirmer} />
              </button>
            </div>
            {confirmer && confirmer !== nouveau && (
              <div className="pwd-hint error">Les mots de passe ne correspondent pas</div>
            )}
          </div>

          {erreur && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", fontSize: ".85rem", color: "#dc2626" }}>
              {erreur}
            </div>
          )}
        </div>

        <div className="pwd-modal__footer">
          <div className="sa-btn-row">
            <button className="sa-btn sa-btn--ghost" onClick={onClose} disabled={loading}>
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

/* ─── Modal vérification demande ─────────────────────── */
function ModalVerifier({ demande, onClose, onSuccess }) {
  const [step, setStep] = useState("actions");
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);

  if (!demande) return null;

  const peutTransmettre =
    demande.statut === "SOUMISE" || demande.statut === "CORRECTION_DEMANDEE";

  const handleTransmettre = async () => {
    setLoading(true);
    try {
      await avancerDemande(demande.id, "TRANSMETTRE");
      onSuccess("Demande transmise au Secrétaire Général ✓");
      onClose();
    } catch (e) {
      onSuccess(e?.message || "Erreur lors de la transmission", true);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = async () => {
    if (!motif.trim()) return;
    setLoading(true);
    try {
      await avancerDemande(demande.id, "DEMANDER_CORRECTION", motif.trim());
      onSuccess("Correction demandée à l'étudiant ✓");
      onClose();
    } catch (e) {
      onSuccess(e?.message || "Erreur", true);
    } finally {
      setLoading(false);
    }
  };

  const etudiant = demande.utilisateur || {};
  const pieces = Array.isArray(demande.pieces) ? demande.pieces : [];

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal__head">
          <div>
            <div className="sa-modal__title">
              {TYPE_LABEL[demande.typeDocument] || demande.typeDocument}
            </div>
            <div className="sa-modal__ref">
              Réf : {demande.id} · soumise le {fmtDate(demande.createdAt)}
            </div>
          </div>
          <button className="sa-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="sa-modal__body">
          <div className="sa-info-grid">
            <div className="sa-info-item">
              <div className="sa-info-key">Étudiant</div>
              <div className="sa-info-val">{etudiant.prenom} {etudiant.nom}</div>
            </div>
            <div className="sa-info-item">
              <div className="sa-info-key">N° Étudiant</div>
              <div className="sa-info-val">{etudiant.numeroEtudiant || "—"}</div>
            </div>
            <div className="sa-info-item">
              <div className="sa-info-key">Document</div>
              <div className="sa-info-val">{TYPE_LABEL[demande.typeDocument] || demande.typeDocument}</div>
            </div>
            <div className="sa-info-item">
              <div className="sa-info-key">Statut</div>
              <div className="sa-info-val">{badgeLabel(demande.statut)}</div>
            </div>
          </div>

          {pieces.length > 0 && (
            <div>
              <div className="sa-pieces-label">Pièces justificatives ({pieces.length})</div>
              {pieces.map((p) => (
                <div key={p.id} className="sa-piece-row">
                  <div>
                    <div className="sa-piece-name">{PIECE_LABEL[p.typePiece] || p.typePiece}</div>
                    <div className="sa-piece-meta">{p.nom || "Fichier uploadé"}</div>
                  </div>
                  <span className="sa-piece-tag">{p.statut || "SOUMISE"}</span>
                </div>
              ))}
            </div>
          )}

          {step === "correction" && (
            <div>
              <div className="sa-pieces-label">Motif de la correction demandée</div>
              <textarea
                className="sa-correction-area"
                placeholder="Ex : La quittance est illisible. Merci de soumettre une version claire."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="sa-modal__footer">
          {step === "actions" ? (
            <div className="sa-btn-row">
              <button className="sa-btn sa-btn--ghost" onClick={onClose}>Fermer</button>
              <button className="sa-btn sa-btn--warn" onClick={() => setStep("correction")} disabled={!peutTransmettre}>
                ⚠ Correction
              </button>
              <button className="sa-btn sa-btn--primary" onClick={handleTransmettre} disabled={loading || !peutTransmettre}>
                {loading ? "Envoi…" : "Transmettre au SG →"}
              </button>
            </div>
          ) : (
            <div className="sa-btn-row">
              <button className="sa-btn sa-btn--ghost" onClick={() => setStep("actions")} disabled={loading}>← Retour</button>
              <button className="sa-btn sa-btn--warn" onClick={handleCorrection} disabled={loading || !motif.trim()}>
                {loading ? "Envoi…" : "Envoyer la correction"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Component principal ─────────────────────────────── */
export default function DashboardSA() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("etudocs_user")) || {};
    } catch {
      return {};
    }
  })();

  const displayName =
    user.prenom && user.nom ? `${user.prenom} ${user.nom}` : "Agent";
  const avatarText = initials(user.nom || "", user.prenom || "");
  const institution =
    user.institution?.sigle || user.institution?.nom || "IFRI";

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDemandes();
      const list = Array.isArray(data) ? data : data?.demandes || [];
      const filtered = list.filter((d) => SA_STATUTS.includes(d.statut));
      setDemandes(filtered);
    } catch (e) {
      if (e?.message === "UNAUTHORIZED") {
        clearSession();
        window.location.href = "/login";
      } else {
        setError("Impossible de charger les demandes.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = {
    nouvelles: demandes.filter((d) => d.statut === "SOUMISE").length,
    corrections: demandes.filter((d) => d.statut === "CORRECTION_DEMANDEE").length,
    total: demandes.length,
    transmises: 0,
  };

  // ✅ Filtrage + tri du plus ancien au plus récent
  const filtered = demandes
    .filter((d) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const u = d.utilisateur || {};
      const nom = `${u.prenom || ""} ${u.nom || ""}`.toLowerCase();
      const ref = String(d.id || "").toLowerCase();
      const doc = String(TYPE_LABEL[d.typeDocument] || d.typeDocument || "").toLowerCase();
      const num = String(u.numeroEtudiant || "").toLowerCase();
      return nom.includes(q) || ref.includes(q) || doc.includes(q) || num.includes(q);
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Plus ancien → plus récent

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <div className="agent-layout">
      <style>{css}</style>

      {toast && (
        <div className={`sa-toast${toast.isError ? " sa-toast--error" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal vérification demande */}
      {selected && (
        <ModalVerifier
          demande={selected}
          onClose={() => { setSelected(null); load(); }}
          onSuccess={(msg, isErr) => { showToast(msg, isErr); if (!isErr) load(); }}
        />
      )}

      {/* Modal modifier mot de passe */}
      {showPwd && (
        <ModalMotDePasse
          onClose={() => setShowPwd(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="agent-sidebar">
        {/* Logo identique au dashboard étudiant */}
        <a href="/dashboardsa" className="agent-sidebar__brand">
          <img src={logo} alt="EtuDocs" className="agent-sidebar__brand-logo" />
          <span className="agent-sidebar__brand-name">EtuDocs</span>
        </a>

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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.d} />
              </svg>
              {n.label}
            </NavLink>
          ))}

          {/* Modifier mot de passe */}
          <button
            className="agent-sidebar__link"
            onClick={() => setShowPwd(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Modifier mot de passe
          </button>
        </nav>

        <div className="agent-sidebar__divider" />

        <button className="agent-sidebar__logout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="agent-main">
        <header className="agent-topbar">
          <div className="agent-topbar__role">
            Secrétaire Adjoint — {institution}
          </div>
          <div className="agent-topbar__right">
            <button className="agent-topbar__notif">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {stats.nouvelles > 0 && <span className="agent-topbar__badge" />}
            </button>
            <div className="agent-topbar__user">
              <div className="agent-topbar__info" style={{ textAlign: "right" }}>
                <div className="agent-topbar__name">{displayName}</div>
                <div className="agent-topbar__meta">{institution}</div>
              </div>
              <div className="agent-topbar__avatar">{avatarText || "AG"}</div>
            </div>
          </div>
        </header>

        <div className="agent-content">
          <div className="agent-page-header">
            <div>
              <h2 className="agent-page-title">Tableau de bord</h2>
              <p className="agent-page-sub">Gérez les nouvelles demandes des étudiants.</p>
            </div>
            <button className="btn-actualiser" onClick={load} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {loading ? "Chargement…" : "Actualiser"}
            </button>
          </div>

          <div className="agent-stats">
            {[
              {
                value: stats.nouvelles, label: "NOUVELLES DEMANDES", iconBg: "#eff6ff",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>,
              },
              {
                value: stats.corrections, label: "CORRECTIONS DEMANDÉES", iconBg: "#fff7ed",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
              },
              {
                value: stats.total, label: "TOTAL À TRAITER", iconBg: "#f1f5f9",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
              },
              {
                value: stats.transmises, label: "TRANSMISES", iconBg: "#f0fdf4",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
              },
            ].map((s, i) => (
              <div className="agent-stat-card" key={i}>
                <div className="agent-stat-card__icon" style={{ background: s.iconBg }}>{s.icon}</div>
                <div>
                  <div className="agent-stat-card__value">{loading ? "…" : s.value}</div>
                  <div className="agent-stat-card__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="state-box state-error">{error}</div>}

          <div className="agent-table-card">
            <div className="agent-table-header">
              <div className="agent-table-title">
                Demandes à traiter <span className="count-badge">{filtered.length}</span>
              </div>
              <div className="agent-table-actions">
                <div className="search-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="btn-filter" type="button">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </button>
              </div>
            </div>

            <table className="agent-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Étudiant</th>
                  <th>Document</th>
                  <th>Date ↑</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: ".9rem" }}>
                      Chargement…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: ".9rem" }}>
                      {search ? "Aucune demande trouvée" : "Aucune demande en attente"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    const u = d.utilisateur || {};
                    return (
                      <tr key={d.id}>
                        <td className="td-ref">{d.id}</td>
                        <td>
                          <div className="td-etudiant-name">{u.prenom} {u.nom}</div>
                          <div className="td-etudiant-num">{u.numeroEtudiant || "—"}</div>
                        </td>
                        <td className="td-doc">{TYPE_LABEL[d.typeDocument] || d.typeDocument}</td>
                        <td className="td-date">{fmtDate(d.createdAt)}</td>
                        <td>
                          <span className={`badge ${badgeClass(d.statut)}`}>
                            {badgeLabel(d.statut)}
                          </span>
                        </td>
                        <td>
                          <div className="td-actions">
                            <button className="btn-verifier" onClick={() => setSelected(d)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              Vérifier
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}