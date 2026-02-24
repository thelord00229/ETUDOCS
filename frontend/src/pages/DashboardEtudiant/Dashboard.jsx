import { useEffect, useMemo, useState } from "react";
import { getMe, getDemandes } from "../../services/api";

import Sidebar from "../../components/DashboardEtudiant/Sidebar.jsx";
import TopBar from "../../components/DashboardEtudiant/Topbar.jsx";
import StatCard from "../../components/DashboardEtudiant/Statcard.jsx";
import DemandRow from "../../components/DashboardEtudiant/Demandrow.jsx";

/* ─────────────────────────────────────────────────────────────
   STYLES GLOBAUX
───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

  .dash-layout {
    display: flex; min-height: 100vh;
    background: #f8fafc;
    font-family: 'DM Sans', sans-serif;
  }
  .dash-main {
    margin-left: 200px;
    padding-top: 64px;
    flex: 1; min-width: 0;
    padding-bottom: 40px;
  }
  .dash-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

  /* HERO BANNER */
  .dash-hero {
    background: linear-gradient(135deg, #1a2744 0%, #243057 100%);
    border-radius: 16px; padding: 32px 36px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .dash-hero::after {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(245,166,35,.08);
  }
  .dash-hero h1 {
    font-family: 'Sora', sans-serif; font-weight: 800;
    font-size: clamp(1.2rem, 2.5vw, 1.55rem);
    color: #fff; margin-bottom: 6px; line-height: 1.3;
  }
  .dash-hero p { color: rgba(255,255,255,.65); font-size: .9rem; margin-bottom: 20px; }
  .btn-new-demand {
    display: inline-flex; align-items: center; gap: 8px;
    background: #f5a623; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    padding: 11px 22px; border-radius: 10px; border: none; cursor: pointer;
    transition: background .2s, transform .15s;
    text-decoration: none;
  }
  .btn-new-demand:hover { background: #fbbf4a; transform: translateY(-1px); }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  /* DEMANDES RECENTES */
  .card-section {
    background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
    padding: 24px 26px;
  }
  .card-section__header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
  }
  .card-section__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744; }
  .card-section__link { font-size: .85rem; color: #475569; text-decoration: none; transition: color .2s; }
  .card-section__link:hover { color: #1a2744; }

  /* BOTTOM GRID */
  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .promo-card {
    border-radius: 14px; padding: 24px;
    border: 1px solid #e2e8f0; background: #fff;
  }
  .promo-card__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
  }
  .promo-card__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
  .promo-card__sub { font-size: .85rem; color: #475569; margin-bottom: 18px; line-height: 1.5; }
  .btn-outline-sm {
    display: inline-flex; align-items: center;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    color: #334155; background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 8px; padding: 8px 18px; cursor: pointer;
    transition: border-color .2s, color .2s;
    text-decoration: none;
  }
  .btn-outline-sm:hover { border-color: #1a2744; color: #1a2744; }

  /* SUPPORT */
  .support-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 28px; text-align: center;
  }
  .support-card h3 { font-family: 'Sora', sans-serif; font-weight: 700; color: #1a2744; margin-bottom: 8px; }
  .support-card p  { color: #475569; font-size: .9rem; margin-bottom: 16px; }
  .support-card__links { display: flex; align-items: center; justify-content: center; gap: 24px; font-size: .9rem; }
  .support-card__links a { color: #1a2744; font-weight: 500; text-decoration: none; }
  .support-card__links a:hover { text-decoration: underline; }
  .support-card__sep { color: #cbd5e1; }

  .hint-error {
    background:#fff; border:1px solid #fecaca; color:#991b1b;
    padding:12px 14px; border-radius:12px; font-size:.9rem;
  }

  /* ═══════════════════════════════════════════════════════
     PAGE DÉTAIL DEMANDE
  ═══════════════════════════════════════════════════════ */

  /* Bouton retour */
  .detail-back {
    display: inline-flex; align-items: center; gap: 7px;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .88rem;
    font-weight: 500; color: #475569;
    padding: 0; margin-bottom: 22px;
    transition: color .2s;
  }
  .detail-back:hover { color: #1a2744; }

  /* En-tête de la demande */
  .detail-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
  .detail-header-title {
    font-family: 'Sora', sans-serif; font-weight: 800;
    font-size: 1.55rem; color: #1a2744; margin-bottom: 6px; line-height: 1.2;
  }
  .detail-ref {
    font-family: 'DM Mono', monospace; font-size: .82rem;
    color: #64748b; letter-spacing: .3px;
  }

  /* Badges statut */
  .badge {
    display: inline-flex; align-items: center;
    padding: 5px 13px; border-radius: 20px;
    font-size: .8rem; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
  }
  .badge--traitement { background: #1a2744; color: #fff; }
  .badge--disponible { background: #dcfce7; color: #166534; }
  .badge--rejete    { background: #fee2e2; color: #991b1b; }
  .badge--soumise   { background: #f1f5f9; color: #475569; }
  .badge--signature { background: #ede9fe; color: #5b21b6; }

  /* Stepper */
  .stepper-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 28px 32px; margin-bottom: 20px;
  }
  .stepper-title {
    font-family: 'Sora', sans-serif; font-weight: 700;
    font-size: .95rem; color: #1a2744; margin-bottom: 24px;
  }
  .stepper {
    display: flex; align-items: flex-start; justify-content: space-between;
    position: relative;
  }
  .stepper::before {
    content: ''; position: absolute; top: 17px; left: 34px; right: 34px;
    height: 2px; background: #e2e8f0; z-index: 0;
  }
  .stepper-step {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; flex: 1; position: relative; z-index: 1;
  }
  .stepper-dot {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid transparent; flex-shrink: 0;
    background: #fff;
  }
  .stepper-dot--done {
    background: #1a2744; border-color: #1a2744;
  }
  .stepper-dot--active {
    background: #fff; border-color: #1a2744;
    box-shadow: 0 0 0 4px rgba(26,39,68,.1);
  }
  .stepper-dot--todo {
    background: #fff; border-color: #cbd5e1;
  }
  .stepper-label {
    font-size: .75rem; font-weight: 500; color: #64748b;
    text-align: center; max-width: 80px; line-height: 1.35;
  }
  .stepper-label--done  { color: #1a2744; font-weight: 600; }
  .stepper-label--active { color: #1a2744; font-weight: 700; }
  .stepper-label--sub {
    font-size: .7rem; color: #22c55e; font-weight: 600;
    margin-top: 2px;
  }

  /* Corps 2 colonnes */
  .detail-body {
    display: grid; grid-template-columns: 1fr 300px; gap: 20px;
    align-items: start;
  }

  /* Pièces jointes */
  .pieces-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 24px 26px;
  }
  .pieces-title {
    font-family: 'Sora', sans-serif; font-weight: 700;
    font-size: .95rem; color: #1a2744; margin-bottom: 16px;
  }
  .piece-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 12px;
    border: 1px solid #e2e8f0; margin-bottom: 10px;
    gap: 12px;
  }
  .piece-row:last-child { margin-bottom: 0; }
  .piece-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .piece-icon-wrap {
    width: 36px; height: 36px; border-radius: 9px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    color: #94a3b8;
  }
  .piece-name { font-size: .88rem; font-weight: 600; color: #1e293b; }
  .piece-meta { font-size: .75rem; color: #94a3b8; margin-top: 2px; }
  .piece-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: .8rem; font-weight: 600;
    color: #16a34a; white-space: nowrap;
  }

  /* Panneau droit */
  .detail-right { display: flex; flex-direction: column; gap: 16px; }

  .detail-meta-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 22px;
  }
  .detail-meta-label {
    font-size: .72rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .8px; margin-bottom: 14px;
  }
  .detail-meta-row {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 12px; gap: 8px;
  }
  .detail-meta-row:last-child { margin-bottom: 0; }
  .detail-meta-key { font-size: .85rem; color: #64748b; }
  .detail-meta-val { font-size: .85rem; font-weight: 700; color: #1a2744; text-align: right; }

  .detail-help-card {
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px;
    padding: 20px;
  }
  .detail-help-title {
    font-family: 'Sora', sans-serif; font-weight: 700;
    font-size: .9rem; color: #1a2744; margin-bottom: 6px;
  }
  .detail-help-text { font-size: .82rem; color: #475569; line-height: 1.55; }

  /* Bouton télécharger (si Disponible) */
  .btn-download {
    width: 100%; padding: 13px;
    background: #16a34a; color: #fff;
    border: none; border-radius: 11px; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: .9rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s, transform .15s;
  }
  .btn-download:hover { background: #15803d; transform: translateY(-1px); }
  .btn-download-count { font-size: .75rem; opacity: .8; font-weight: 500; }

  /* Motif rejet */
  .rejection-card {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 14px;
    padding: 18px 20px; margin-top: 4px;
  }
  .rejection-title {
    font-size: .82rem; font-weight: 700; color: #991b1b;
    text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .rejection-text { font-size: .88rem; color: #7f1d1d; line-height: 1.55; }

  @media (max-width: 900px) {
    .stats-grid  { grid-template-columns: 1fr 1fr; }
    .bottom-grid { grid-template-columns: 1fr; }
    .detail-body { grid-template-columns: 1fr; }
    .stepper { flex-wrap: wrap; gap: 16px; }
    .stepper::before { display: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const getInitials = (prenom = "", nom = "") => {
  const a = (prenom || "").trim()[0]?.toUpperCase() || "";
  const b = (nom    || "").trim()[0]?.toUpperCase() || "";
  return `${a}${b}` || "U";
};

const uiStatus = (s) => {
  if (s === "DISPONIBLE") return "Disponible";
  if (s === "REJETEE" || s === "REJETE") return "Rejeté";
  return "En traitement";
};

const uiTitle = (type) => {
  if (type === "RELEVE_NOTES") return "Relevé de notes";
  if (type === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return type || "Demande";
};

/* Choisit la référence fictive selon le type */
const uiRef = (type, rawRef) => {
  if (type === "RELEVE_NOTES") return rawRef || "ETD-2026-IFRI-S1-00847-XK29";
  if (type === "ATTESTATION_INSCRIPTION") return rawRef || "ETD-2026-IFRI-INS-00234-LM47";
  return rawRef || "ETD-2026-IFRI-INS-00234-LM47";
};

/* Intermédiaire de traitement fictif selon le type */
const uiIntervenant = (type) => {
  if (type === "RELEVE_NOTES") return "Serge DOSSOU";
  return "Adéola BOSSOU";
};

/* ─────────────────────────────────────────────────────────────
   ICÔNES SVG
───────────────────────────────────────────────────────────── */
const SvgClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);
const SvgDownload = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const SvgX = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);
const SvgArrowLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
);
const SvgCheckCircle = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);
const SvgFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
);
const SvgDlBtn = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const SvgStepDone = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const SvgAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────────
   DONNÉES DES ÉTAPES DU STEPPER selon statut
───────────────────────────────────────────────────────────── */
const getSteps = (status) => {
  const all = [
    { key: "soumise",   label: "Soumise" },
    { key: "sec_adj",   label: "Reçue (Sec. Adj)" },
    { key: "sec_gen",   label: "Transmise (Sec. Gén)" },
    { key: "traitement",label: "En traitement" },
    { key: "sign_da",   label: "Signature DA" },
    { key: "sign_dir",  label: "Signature DIR" },
    { key: "disponible",label: "Disponible" },
  ];

  const activeMap = {
    "En traitement": 3,
    "Disponible":    6,
    "Rejeté":        3,
  };
  const activeIdx = activeMap[status] ?? 3;

  return all.map((s, i) => ({
    ...s,
    state: i < activeIdx ? "done" : i === activeIdx ? "active" : "todo",
  }));
};

/* ─────────────────────────────────────────────────────────────
   PAGE DÉTAIL
───────────────────────────────────────────────────────────── */
function DetailDemande({ demande, onBack }) {
  const title    = uiTitle(demande.typeDocument || demande.title);
  const status   = demande.statut ? uiStatus(demande.statut) : demande.status;
  const ref      = uiRef(demande.typeDocument, demande.document?.reference || demande.ref_);
  const steps    = getSteps(status);
  const isReleve = (demande.typeDocument === "RELEVE_NOTES") || title.includes("Relevé");

  const badgeClass =
      status === "Disponible"    ? "badge--disponible" :
          status === "Rejeté"        ? "badge--rejete"     :
              status === "En traitement" ? "badge--traitement" : "badge--soumise";

  const dateStr = demande.createdAt
      ? new Date(demande.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })
      : demande.date || "—";

  return (
      <div className="dash-content">
        {/* Bouton retour */}
        <button className="detail-back" onClick={onBack}>
          <SvgArrowLeft /> Retour
        </button>

        {/* En-tête */}
        <div className="detail-header">
          <div style={{ flex: 1 }}>
            <div className="detail-header-title">{title}</div>
            <div className="detail-ref">Réf : {ref}</div>
          </div>
          <span className={`badge ${badgeClass}`}>{status}</span>
        </div>

        {/* Stepper */}
        <div className="stepper-card">
          <div className="stepper-title">Suivi de la demande</div>
          <div className="stepper">
            {steps.map((s) => (
                <div key={s.key} className="stepper-step">
                  <div className={`stepper-dot stepper-dot--${s.state}`}>
                    {s.state === "done" && <SvgStepDone />}
                    {s.state === "active" && (
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a2744" }} />
                    )}
                  </div>
                  <div className={`stepper-label stepper-label--${s.state}`}>
                    {s.label}
                    {s.state === "active" && (
                        <div className="stepper-label--sub">En cours</div>
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Motif rejet */}
        {status === "Rejeté" && (
            <div className="rejection-card">
              <div className="rejection-title"><SvgAlert /> Motif de rejet</div>
              <div className="rejection-text">
                {demande.motifRejet || "Pièce justificative non conforme. Veuillez soumettre une nouvelle demande avec une quittance de paiement lisible et en cours de validité."}
              </div>
            </div>
        )}

        {/* Corps : pièces + métadonnées */}
        <div className="detail-body">

          {/* Pièces jointes */}
          <div className="pieces-card">
            <div className="pieces-title">Pièces jointes</div>

            {[
              { name: "Carte d'Identification Personnelle (CIP)", meta: "PDF • 1.2 Mo" },
              { name: "Quittance de paiement", meta: "PDF • 1.2 Mo" },
              ...(isReleve ? [{ name: "Relevé de notes officiel", meta: "Généré automatiquement" }] : []),
            ].map((p, i) => (
                <div key={i} className="piece-row">
                  <div className="piece-left">
                    <div className="piece-icon-wrap"><SvgFile /></div>
                    <div>
                      <div className="piece-name">{p.name}</div>
                      <div className="piece-meta">{p.meta}</div>
                    </div>
                  </div>
                  <span className="piece-status">
                <SvgCheckCircle /> Validée
              </span>
                </div>
            ))}
          </div>

          {/* Panneau droit */}
          <div className="detail-right">

            {/* Bouton télécharger si Disponible */}
            {status === "Disponible" && (
                <button className="btn-download">
                  <SvgDlBtn />
                  Télécharger mon document
                  <span className="btn-download-count">(1/3)</span>
                </button>
            )}

            {/* Métadonnées */}
            <div className="detail-meta-card">
              <div className="detail-meta-label">Détails</div>
              <div className="detail-meta-row">
                <span className="detail-meta-key">Date soumission</span>
                <span className="detail-meta-val">{dateStr}</span>
              </div>
              <div className="detail-meta-row">
                <span className="detail-meta-key">Dernière maj</span>
                <span className="detail-meta-val">Il y a 2h</span>
              </div>
              <div className="detail-meta-row">
                <span className="detail-meta-key">Intervenant</span>
                <span className="detail-meta-val">{uiIntervenant(demande.typeDocument)}</span>
              </div>
              {isReleve && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-key">Semestre</span>
                    <span className="detail-meta-val">Semestre 1</span>
                  </div>
              )}
            </div>

            {/* Aide */}
            <div className="detail-help-card">
              <div className="detail-help-title">Besoin d'aide ?</div>
              <div className="detail-help-text">
                Si vous rencontrez un problème avec cette demande, contactez notre support à{" "}
                <a href="mailto:support@etudocs.bj" style={{ color: "#1a2744", fontWeight: 600 }}>support@etudocs.bj</a>.
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD PRINCIPAL
───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [user,      setUser]      = useState(null);
  const [demandes,  setDemandes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [errorMsg,  setErrorMsg]  = useState("");

  /* Vue détail : null = dashboard, sinon objet demande */
  const [detailDemande, setDetailDemande] = useState(null);

  /* ── Stats calculées ── */
  const nbEnCours    = useMemo(() => demandes.filter(d => d.statut !== "DISPONIBLE" && d.statut !== "REJETEE" && d.statut !== "REJETE").length, [demandes]);
  const nbDisponibles= useMemo(() => demandes.filter(d => d.statut === "DISPONIBLE").length, [demandes]);
  const nbRejetees   = useMemo(() => demandes.filter(d => d.statut === "REJETEE" || d.statut === "REJETE").length, [demandes]);

  /* ── Demandes récentes ── */
  const demandesRecentes = useMemo(() => {
    const list = Array.isArray(demandes) ? demandes : [];
    return [...list]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 3)
        .map(d => ({
          ...d,                                  // on garde l'objet complet pour le détail
          title:  uiTitle(d.typeDocument),
          ref_:   uiRef(d.typeDocument, d.document?.reference || d.id),
          date:   new Date(d.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" }),
          status: uiStatus(d.statut),
        }));
  }, [demandes]);

  /* ── Chargement données ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true); setErrorMsg("");
      try {
        const me   = await getMe();
        localStorage.setItem("etudocs_user", JSON.stringify(me));
        setUser(me);
        const list = await getDemandes();
        setDemandes(Array.isArray(list) ? list : []);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fullName = useMemo(() => (!user ? "…" : `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || "Étudiant"), [user]);
  const meta     = useMemo(() => (!user ? "…" : `${user.numeroEtudiant || "—"} • IFRI`), [user]);
  const initials = useMemo(() => (!user ? "…" : getInitials(user.prenom, user.nom)), [user]);

  /* ── Vue Détail ── */
  if (detailDemande) {
    return (
        <div className="dash-layout">
          <style>{css}</style>
          <Sidebar />
          <div className="dash-main">
            <TopBar name={fullName} meta={meta} initials={initials} notifCount={1} />
            <DetailDemande demande={detailDemande} onBack={() => setDetailDemande(null)} />
          </div>
        </div>
    );
  }

  /* ── Vue Dashboard ── */
  return (
      <div className="dash-layout">
        <style>{css}</style>
        <Sidebar />

        <div className="dash-main">
          <TopBar name={fullName} meta={meta} initials={initials} notifCount={1} />

          <div className="dash-content">

            {/* Hero */}
            <div className="dash-hero">
              <div>
                <h1>Bonjour {user ? user.prenom : "…"}, que pouvons-nous faire pour vous aujourd'hui ?</h1>
                <p>Bienvenue sur votre espace personnel EtuDocs</p>
                <a href="/dashboardEtu/nouvelle" className="btn-new-demand">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Nouvelle demande
                </a>
              </div>
            </div>

            {errorMsg && <div className="hint-error">{errorMsg}</div>}

            {/* Stats */}
            <div className="stats-grid">
              <StatCard
                  label="Demandes en cours"
                  value={loading ? "…" : String(nbEnCours)}
                  sub="Suivi de vos demandes"
                  icon={<SvgClock />}
                  accentColor="#f59e0b"
                  iconBg="#fffbeb"
              />
              <StatCard
                  label="Documents disponibles"
                  value={loading ? "…" : String(nbDisponibles)}
                  sub="Prêts à être téléchargés"
                  icon={<SvgDownload />}
                  accentColor="#22c55e"
                  iconBg="#f0fdf4"
              />
              <StatCard
                  label="Demandes rejetées"
                  value={loading ? "…" : String(nbRejetees)}
                  sub={nbRejetees === 0 ? "Aucune demande rejetée" : "Certaines demandes ont été rejetées"}
                  icon={<SvgX />}
                  accentColor="#ef4444"
                  iconBg="#fef2f2"
              />
            </div>

            {/* Demandes récentes */}
            <div className="card-section">
              <div className="card-section__header">
                <span className="card-section__title">Demandes récentes</span>
                <a href="/dashboardEtu/demandes" className="card-section__link">Voir tout</a>
              </div>

              {!loading && demandesRecentes.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: ".9rem", padding: "10px 0" }}>
                    Aucune demande pour le moment.
                  </div>
              )}

              {demandesRecentes.map((d, i) => (
                  <DemandRow
                      key={i}
                      title={d.title}
                      ref_={d.ref_}
                      date={d.date}
                      status={d.status}
                      /* ← on passe l'objet complet au détail */
                      onDetails={() => setDetailDemande(d)}
                  />
              ))}
            </div>

            {/* Bottom promo cards */}
            <div className="bottom-grid">
              <div className="promo-card">
                <div className="promo-card__icon" style={{ background: "#eff6ff" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="promo-card__title" style={{ color: "#1a2744" }}>Besoin d'un document ?</div>
                <div className="promo-card__sub">Soumettez une nouvelle demande en quelques clics</div>
                <a href="/dashboardEtu/nouvelle" className="btn-outline-sm">Faire une demande</a>
              </div>

              <div className="promo-card">
                <div className="promo-card__icon" style={{ background: "#f0fdf4" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="9 11 12 14 22 4"/>
                  </svg>
                </div>
                <div className="promo-card__title" style={{ color: "#16a34a" }}>Documents prêts</div>
                <div className="promo-card__sub">{loading ? "Chargement..." : `${nbDisponibles} document(s) disponible(s)`}</div>
                <a href="/dashboardEtu/documents" className="btn-outline-sm">Télécharger</a>
              </div>
            </div>

            {/* Support */}
            <div className="support-card">
              <h3>Besoin d'aide ?</h3>
              <p>Notre équipe est là pour vous accompagner dans vos démarches</p>
              <div className="support-card__links">
                <a href="mailto:support@etudocs.bj">support@etudocs.bj</a>
                <span className="support-card__sep">|</span>
                <a href="tel:+22900000000">+229 XX XX XX XX</a>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}