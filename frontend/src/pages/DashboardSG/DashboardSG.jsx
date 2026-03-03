import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDemandes, avancerDemande, downloadDocumentBlob, getStatsSG } from "../../services/api";
import logo from "../../assets/logo.png";

/* ─────────────────────────────────────────────────────────────
   STYLES — calqués sur Dashboard.jsx (étudiant)
───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

  /* ── LAYOUT ── */
  .sg-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }

  /* ── SIDEBAR (identique Dashboard étudiant) ── */
  .sg-sidebar {
    width: 200px; min-height: 100vh; flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e2e8f0;
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
  .sg-content {
    padding: 32px 36px;
    flex: 1;
    display: flex; flex-direction: column; gap: 24px;
  }

  /* ── HERO BANNER (identique Dashboard étudiant) ── */
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

  /* ── STATS GRID ── */
  .sg-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  /* StatCard — reproduction exacte de Statcard.jsx */
  .sg-stat-card {
    background: #fff; border-radius: 14px;
    border: 1px solid #e2e8f0;
    padding: 20px 22px; display: flex; flex-direction: column; gap: 8px;
    position: relative; overflow: hidden;
  }
  .sg-stat-card__accent {
    position: absolute; top: 0; left: 0; width: 4px; height: 100%;
    border-radius: 14px 0 0 14px;
  }
  .sg-stat-card__header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .sg-stat-card__label {
    font-size: 0.85rem; color: #475569; font-family: 'DM Sans', sans-serif;
  }
  .sg-stat-card__value {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 2rem;
    color: #1a2744; line-height: 1;
  }
  .sg-stat-card__sub { font-size: 0.8rem; color: #94a3b8; }

  /* ── TABLE CARD ── */
  .sg-table-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0; overflow: hidden;
  }
  .sg-table-header {
    padding: 22px 28px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sg-table-title {
    font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700;
    color: #1a2744; display: flex; align-items: center; gap: 10px;
  }
  .sg-badge-count {
    background: #1a2744; color: white;
    font-size: 11px; font-weight: 700;
    padding: 2px 9px; border-radius: 20px; min-width: 22px; text-align: center;
  }
  .sg-search-box { position: relative; display: flex; align-items: center; }
  .sg-search-icon { position: absolute; left: 12px; color: #64748b; font-size: 15px; pointer-events: none; }
  .sg-search-input {
    padding: 9px 14px 9px 36px;
    border: 1px solid #e2e8f0; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: #1a2744; background: #f8fafc;
    outline: none; width: 230px;
    transition: border-color .2s, background .2s;
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
    padding: 14px 28px;
    border-top: 1px solid #e2e8f0;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    vertical-align: middle; color: #1a2744;
  }
  .sg-table tbody tr:hover { background: #f8fafc; }

  .sg-mono { font-family: 'DM Mono', monospace; font-size: 12px; color: #1a2744; }
  .sg-muted { color: #64748b; font-size: 12px; }

  /* ── CHIP STATUT ── */
  .sg-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 20px;
    font-size: .8rem; font-weight: 700;
    background: #f1f5f9; color: #475569;
  }

  /* ── BOUTONS ── */
  .sg-btn {
    border: none; cursor: pointer; border-radius: 10px;
    padding: 9px 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
    transition: .2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .sg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .sg-btn.primary { background: #1a2744; color: white; }
  .sg-btn.primary:hover { background: #243057; }
  .sg-btn.outline { background: white; color: #334155; border: 1.5px solid #e2e8f0; }
  .sg-btn.outline:hover { border-color: #1a2744; color: #1a2744; }

  /* ── EMPTY STATE ── */
  .sg-empty { padding: 80px 24px; text-align: center; background: #f8fafc; }
  .sg-empty__icon { font-size: 44px; margin-bottom: 14px; opacity: 0.25; }
  .sg-empty__text { font-size: 14px; color: #64748b; font-weight: 500; }

  /* ── MODAL ── */
  .sg-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.55);
    z-index: 999;
    display: flex; align-items: center; justify-content: center;
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
  .sg-modal__body {
    flex: 1; border: 1px solid #e2e8f0; border-radius: 12px;
    overflow: hidden; background: #f8fafc;
  }
  .sg-modal__actions { display: flex; justify-content: flex-end; gap: 10px; }

  @media (max-width: 900px) {
    .sg-stats-grid { grid-template-columns: 1fr 1fr; }
    .sg-main { margin-left: 0; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   ICÔNES (inchangées depuis DashboardSG.jsx original)
───────────────────────────────────────────────────────────── */
const GridIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
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

const PenIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
      <line x1="16" y1="8" x2="2" y2="22"/>
      <line x1="17.5" y1="15" x2="9" y2="15"/>
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

const XCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────────
   HELPERS (inchangés)
───────────────────────────────────────────────────────────── */
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
  const prenom = u?.prenom ?? "";
  const nom = u?.nom ?? "";
  const full = `${prenom} ${nom}`.trim();
  return full || fallback || "—";
};

const getNumeroEtudiant = (d) => {
  const u = d?.utilisateur;
  return u?.numeroEtudiant || d?.numeroEtudiant || d?.num || "—";
};

const getReferenceDoc = (d) => {
  const doc = Array.isArray(d?.documents) ? d.documents[0] : null;
  return doc?.reference || d?.reference || d?.ref || "—";
};

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────────────────────── */
export default function DashboardSG() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [preview, setPreview] = useState(null);
  const [statsExternes, setStatsExternes] = useState({ transmises: 0, rejetees: 0 });

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
    if (!reference || reference === "—") {
      alert("Aucune référence de document trouvée pour prévisualisation.");
      return;
    }
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
    localStorage.removeItem("etudocs_token");
    localStorage.removeItem("token");
    localStorage.removeItem("etudocs_user");
    sessionStorage.removeItem("etudocs_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("etudocs_user");
    navigate("/", { replace: true });
  };

  const aTransmettre = demandes.length;

  return (
      <>
        <style>{css}</style>

        <div className="sg-layout">

          {/* ── SIDEBAR ── */}
          <aside className="sg-sidebar">
            <a href="/" className="sg-sidebar__brand">
              <div className="sg-sidebar__brand-icon">
                <img src={logo} alt="EtuDocs" style={{ width: 42, height: 42, objectFit: "contain" }} />
              </div>
              EtuDocs
            </a>

            <nav className="sg-sidebar__nav">
              <button className="sg-sidebar__link active">
                <GridIcon />
                Tableau de bord
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

            {/* ── TOPBAR ── */}
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

            {/* ── CONTENT ── */}
            <div className="sg-content">

              {/* HERO */}
              <div className="sg-hero">
                <div>
                  <h1>Espace Secrétaire Général</h1>
                  <p>Transmission des demandes au Chef de Division</p>
                  <button
                      className="sg-hero__btn"
                      onClick={charger}
                      disabled={loading}
                  >
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
                  <div className="sg-stat-card__header">
                    <span className="sg-stat-card__label">À transmettre</span>
                  </div>
                  <div className="sg-stat-card__value">{String(aTransmettre)}</div>
                  <div className="sg-stat-card__sub">Suivi des transmissions</div>
                </div>

                <div className="sg-stat-card">
                  <div className="sg-stat-card__accent" style={{ background: "#22c55e" }} />
                  <div className="sg-stat-card__header">
                    <span className="sg-stat-card__label">Transmis (mois)</span>
                  </div>
                  <div className="sg-stat-card__value">{loading ? "…" : statsExternes.transmises}</div>
                  <div className="sg-stat-card__sub">Ce mois-ci</div>
                </div>

                <div className="sg-stat-card">
                  <div className="sg-stat-card__accent" style={{ background: "#ef4444" }} />
                  <div className="sg-stat-card__header">
                    <span className="sg-stat-card__label">Refusés</span>
                  </div>
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
                    <input
                        className="sg-search-input"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                      <th>Soumission</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((d) => {
                      const ref     = getReferenceDoc(d);
                      const etu     = getEtudiantLabel(d);
                      const num     = getNumeroEtudiant(d);
                      const type    = d?.typeDocument || "—";
                      const created = formatDate(d?.createdAt);
                      const statut  = d?.statut || "—";

                      return (
                          <tr key={d.id || ref}>
                            <td><span className="sg-mono">{ref}</span></td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{etu}</div>
                              <div className="sg-muted">N° {num}</div>
                            </td>
                            <td>{type}</td>
                            <td className="sg-muted">{created}</td>
                            <td><span className="sg-chip">{statut}</span></td>
                            <td style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                              <button
                                  className="sg-btn primary"
                                  onClick={() => handleTransmettre(d)}
                                  disabled={busyId === d.id}
                                  title="Transmettre au Chef de Division"
                              >
                                ⏩ Transmettre
                              </button>
                            </td>
                          </tr>
                      );
                    })}
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
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>👁</span> Aperçu — <span className="sg-mono">{preview.name}</span>
              </span>
                  <button className="sg-btn outline" onClick={closePreview}>Fermer</button>
                </div>
                <div className="sg-modal__body">
                  <iframe title="preview" src={preview.url} style={{ width: "100%", height: "100%", border: "none" }} />
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