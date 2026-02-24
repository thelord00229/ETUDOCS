import { useState } from "react";
import { NavLink } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .agent-layout {
    display: flex; min-height: 100vh;
    background: #f8fafc; font-family: 'DM Sans', sans-serif;
  }

  /* ── SIDEBAR ── */
  .agent-sidebar {
    width: 220px; flex-shrink: 0;
    background: #1a2744;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    padding-bottom: 24px;
  }
  .agent-sidebar__brand {
    display: flex; align-items: center; gap: 8px;
    padding: 22px 20px 28px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.15rem;
    color: #fff; text-decoration: none;
  }
  .agent-sidebar__brand-icon {
    width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,.15);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .agent-sidebar__brand-tag {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 500;
    color: #f5a623; margin-left: 2px;
  }
  .agent-sidebar__nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }
  .agent-sidebar__link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: rgba(255,255,255,.6); text-decoration: none;
    transition: background .15s, color .15s;
  }
  .agent-sidebar__link:hover { background: rgba(255,255,255,.08); color: #fff; }
  .agent-sidebar__link.active { background: #f5a623; color: #fff; }
  .agent-sidebar__link.active svg { stroke: #fff; }
  .agent-sidebar__link svg { stroke: rgba(255,255,255,.6); transition: stroke .15s; }
  .agent-sidebar__link:hover svg { stroke: #fff; }

  .agent-sidebar__divider { height: 1px; background: rgba(255,255,255,.1); margin: 12px 12px; }
  .agent-sidebar__logout {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 26px; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 500; color: rgba(255,255,255,.4);
    background: none; border: none; cursor: pointer; width: 100%;
    transition: color .15s;
  }
  .agent-sidebar__logout:hover { color: #ef4444; }
  .agent-sidebar__logout:hover svg { stroke: #ef4444; }
  .agent-sidebar__logout svg { stroke: rgba(255,255,255,.4); transition: stroke .15s; }

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
  .badge--attente    { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .badge--correction { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
  .badge--transmis   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .badge--rejete     { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  .td-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
  .btn-verifier {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500; color: #1a2744;
    background: none; border: none; cursor: pointer; transition: color .2s;
  }
  .btn-verifier:hover { color: #f5a623; }
  .btn-verifier:hover svg { stroke: #f5a623; }
  .btn-verifier svg { stroke: #1a2744; transition: stroke .2s; }
  .btn-more {
    width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid #e2e8f0;
    background: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: border-color .2s;
  }
  .btn-more:hover { border-color: #1a2744; }
`;

const NAV = [
    { to: "/dashboardsa", label: "Tableau de bord", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
];

const STATUTS = {
    "Nouvelle":            "badge--new",
    "En attente":          "badge--attente",
    "Correction demandée": "badge--correction",
    "Transmis":            "badge--transmis",
    "Rejeté":              "badge--rejete",
};

const DEMANDES = [
    { ref: "ETD-2026-IFRI-INS-00235-LM48", nom: "HOUNHOUI Darina", num: "22P0045", doc: "Attestation d'inscription", date: "11/20/2025", status: "Correction demandée" },
    { ref: "ETD-2026-IFRI-RN-00234-KA12",  nom: "KOFFI Amen",      num: "21P0078", doc: "Relevé de notes",           date: "11/19/2025", status: "En attente" },
    { ref: "ETD-2026-IFRI-SUC-00233-MB09", nom: "MISSEBA Brice",   num: "20P0031", doc: "Attestation de succès",     date: "11/18/2025", status: "Nouvelle" },
];

export default function DashboardSA() {
    const [search, setSearch] = useState("");

    const filtered = DEMANDES.filter(d =>
        d.ref.toLowerCase().includes(search.toLowerCase()) ||
        d.nom.toLowerCase().includes(search.toLowerCase()) ||
        d.doc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="agent-layout">
            <style>{css}</style>

            {/* ── SIDEBAR ── */}
            <aside className="agent-sidebar">
                <a href="/agent" className="agent-sidebar__brand">
                    <div className="agent-sidebar__brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    EtuDocs <span className="agent-sidebar__brand-tag">Agent</span>
                </a>

                <nav className="agent-sidebar__nav">
                    {NAV.map(n => (
                        <NavLink key={n.to} to={n.to} end={n.to === "/agent"}
                                 className={({ isActive }) => "agent-sidebar__link" + (isActive ? " active" : "")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={n.d} />
                            </svg>
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="agent-sidebar__divider" />
                <button className="agent-sidebar__logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Déconnexion
                </button>
            </aside>

            {/* ── MAIN ── */}
            <div className="agent-main">

                {/* TOPBAR */}
                <header className="agent-topbar">
                    <div className="agent-topbar__role">Secrétaire Adjoint — IFRI</div>
                    <div className="agent-topbar__right">
                        <button className="agent-topbar__notif">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <span className="agent-topbar__badge" />
                        </button>
                        <div className="agent-topbar__user">
                            <div className="agent-topbar__info" style={{ textAlign:"right" }}>
                                <div className="agent-topbar__name">Adéola BOSSOU</div>
                                <div className="agent-topbar__meta">IFRI</div>
                            </div>
                            <div className="agent-topbar__avatar">AD</div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="agent-content">

                    {/* Page header */}
                    <div className="agent-page-header">
                        <div>
                            <h2 className="agent-page-title">Tableau de bord</h2>
                            <p className="agent-page-sub">Gérez les nouvelles demandes des étudiants.</p>
                        </div>
                        <button className="btn-actualiser">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                 stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            Actualiser
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="agent-stats">
                        {[
                            { value: "0",  label: "NOUVELLES DEMANDES",    iconBg: "#eff6ff", iconColor: "#1d4ed8",
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg> },
                            { value: "1",  label: "EN ATTENTE",             iconBg: "#fffbeb", iconColor: "#d97706",
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                            { value: "45", label: "TRANSMISES (MOIS)",      iconBg: "#f0fdf4", iconColor: "#16a34a",
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                            { value: "1",  label: "CORRECTIONS DEMANDÉES",  iconBg: "#fff7ed", iconColor: "#ea580c",
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
                        ].map((s, i) => (
                            <div className="agent-stat-card" key={i}>
                                <div className="agent-stat-card__icon" style={{ background: s.iconBg }}>{s.icon}</div>
                                <div>
                                    <div className="agent-stat-card__value">{s.value}</div>
                                    <div className="agent-stat-card__label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="agent-table-card">
                        <div className="agent-table-header">
                            <div className="agent-table-title">
                                Demandes à traiter
                                <span className="count-badge">{filtered.length}</span>
                            </div>
                            <div className="agent-table-actions">
                                <div className="search-box">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <button className="btn-filter">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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
                                <th>Date</th>
                                <th>Statut</th>
                                <th style={{ textAlign:"right" }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((d, i) => (
                                <tr key={i}>
                                    <td className="td-ref">{d.ref}</td>
                                    <td>
                                        <div className="td-etudiant-name">{d.nom}</div>
                                        <div className="td-etudiant-num">{d.num}</div>
                                    </td>
                                    <td className="td-doc">{d.doc}</td>
                                    <td className="td-date">{d.date}</td>
                                    <td><span className={`badge ${STATUTS[d.status] || ""}`}>{d.status}</span></td>
                                    <td>
                                        <div className="td-actions">
                                            <button className="btn-verifier">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                                Vérifier
                                            </button>
                                            <button className="btn-more">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign:"center", padding:"32px", color:"#94a3b8", fontSize:".9rem" }}>
                                        Aucune demande trouvée
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
}