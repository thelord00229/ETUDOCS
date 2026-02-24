import { useState } from "react";
import { NavLink } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .agent-layout { display:flex; min-height:100vh; background:#f8fafc; font-family:'DM Sans',sans-serif; }

  .agent-sidebar {
    width:220px; flex-shrink:0; background:#1a2744;
    display:flex; flex-direction:column;
    position:fixed; top:0; left:0; bottom:0; z-index:50; padding-bottom:24px;
  }
  .agent-sidebar__brand {
    display:flex; align-items:center; gap:8px; padding:22px 20px 28px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:1.15rem;
    color:#fff; text-decoration:none;
  }
  .agent-sidebar__brand-icon {
    width:34px; height:34px; border-radius:8px; background:rgba(255,255,255,.15);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .agent-sidebar__brand-tag { font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:500; color:#f5a623; margin-left:2px; }
  .agent-sidebar__nav { flex:1; padding:0 12px; display:flex; flex-direction:column; gap:4px; }
  .agent-sidebar__link {
    display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500;
    color:rgba(255,255,255,.6); text-decoration:none; transition:background .15s, color .15s;
  }
  .agent-sidebar__link:hover { background:rgba(255,255,255,.08); color:#fff; }
  .agent-sidebar__link.active { background:#f5a623; color:#fff; }
  .agent-sidebar__link svg { stroke:rgba(255,255,255,.6); transition:stroke .15s; }
  .agent-sidebar__link:hover svg, .agent-sidebar__link.active svg { stroke:#fff; }
  .agent-sidebar__divider { height:1px; background:rgba(255,255,255,.1); margin:12px 12px; }
  .agent-sidebar__logout {
    display:flex; align-items:center; gap:12px; padding:11px 26px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500;
    color:rgba(255,255,255,.4); background:none; border:none; cursor:pointer; width:100%; transition:color .15s;
  }
  .agent-sidebar__logout:hover { color:#ef4444; }
  .agent-sidebar__logout:hover svg { stroke:#ef4444; }
  .agent-sidebar__logout svg { stroke:rgba(255,255,255,.4); transition:stroke .15s; }

  .agent-main { margin-left:220px; flex:1; min-width:0; display:flex; flex-direction:column; }

  .agent-topbar {
    height:64px; background:#fff; border-bottom:1px solid #e2e8f0;
    display:flex; align-items:center; justify-content:space-between; padding:0 32px;
    position:sticky; top:0; z-index:40;
  }
  .agent-topbar__role {
    display:inline-flex; align-items:center; padding:6px 14px;
    border:1.5px solid #e2e8f0; border-radius:20px;
    font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500; color:#475569;
  }
  .agent-topbar__right { display:flex; align-items:center; gap:16px; }
  .agent-topbar__notif { position:relative; background:none; border:none; cursor:pointer; color:#94a3b8; padding:4px; }
  .agent-topbar__badge { position:absolute; top:0; right:0; width:8px; height:8px; border-radius:50%; background:#f5a623; border:2px solid #fff; }
  .agent-topbar__user { display:flex; align-items:center; gap:10px; }
  .agent-topbar__avatar {
    width:38px; height:38px; border-radius:50%; background:#16a34a;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem; color:#fff; flex-shrink:0;
  }
  .agent-topbar__info { line-height:1.3; text-align:right; }
  .agent-topbar__name { font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; color:#1a2744; }
  .agent-topbar__meta { font-size:.75rem; color:#94a3b8; }

  .agent-content { padding:28px 32px; display:flex; flex-direction:column; gap:24px; padding-bottom:48px; }

  .agent-page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .agent-page-title  { font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; color:#1a2744; margin-bottom:4px; }
  .agent-page-sub    { color:#475569; font-size:.9rem; }
  .btn-actualiser {
    display:inline-flex; align-items:center; gap:8px;
    background:#1a2744; color:#fff; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem;
    padding:11px 24px; cursor:pointer; transition:background .2s; white-space:nowrap;
  }
  .btn-actualiser:hover { background:#243057; }

  .agent-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .agent-stat-card {
    background:#fff; border:1px solid #e2e8f0; border-radius:14px;
    padding:20px 22px; display:flex; align-items:center; gap:16px;
  }
  .agent-stat-card__icon { width:48px; height:48px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .agent-stat-card__value { font-family:'Sora',sans-serif; font-weight:800; font-size:1.8rem; color:#1a2744; line-height:1; }
  .agent-stat-card__label { font-size:.72rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#94a3b8; margin-top:4px; }

  .agent-table-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; }
  .agent-table-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; border-bottom:1px solid #f1f5f9;
  }
  .agent-table-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; display:flex; align-items:center; gap:10px; }
  .count-badge { width:22px; height:22px; border-radius:50%; background:#1a2744; color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
  .search-box { display:flex; align-items:center; gap:8px; border:1.5px solid #e2e8f0; border-radius:8px; padding:7px 12px; background:#f8fafc; }
  .search-box input { border:none; background:none; outline:none; font-family:'DM Sans',sans-serif; font-size:.85rem; color:#334155; width:180px; }
  .search-box input::placeholder { color:#cbd5e1; }

  .agent-table { width:100%; border-collapse:collapse; }
  .agent-table thead tr { background:#f8fafc; }
  .agent-table th { text-align:left; padding:12px 20px; font-family:'Sora',sans-serif; font-weight:600; font-size:.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; white-space:nowrap; }
  .agent-table td { padding:16px 20px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
  .agent-table tbody tr:last-child td { border-bottom:none; }
  .agent-table tbody tr:hover { background:#fafbff; }

  .td-ref   { font-size:.82rem; color:#94a3b8; font-family:'DM Sans',sans-serif; }
  .td-etudiant-name { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:#1a2744; }
  .td-etudiant-num  { font-size:.78rem; color:#94a3b8; margin-top:2px; }
  .td-doc   { font-size:.9rem; color:#334155; }
  .td-date  { font-size:.88rem; color:#475569; }
  .td-delai-urgent { font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; color:#ea580c; }
  .td-delai-ok     { font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; color:#16a34a; }

  .btn-traiter {
    display:inline-flex; align-items:center; gap:7px;
    background:#1a2744; color:#fff; border:none; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem;
    padding:9px 18px; cursor:pointer; transition:background .2s;
    white-space:nowrap;
  }
  .btn-traiter:hover { background:#243057; }
`;

const NAV = [
    { to: "/dashboardsc",label: "Tableau de bord", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
];

const DOSSIERS = [
    { ref:"ETD-2026-IFRI-INS-00234-LM47", nom:"AGBETI Olamidé Ikhlas", num:"22P0045", doc:"Attestation d'inscription", date:"1/10/2026",  delai:"48h",  urgent:true },
    { ref:"ETD-2026-IFRI-RN-00233-KA11",  nom:"KOFFI Amen",            num:"21P0078", doc:"Relevé de notes",           date:"1/09/2026",  delai:"24h",  urgent:true },
    { ref:"ETD-2026-IFRI-SUC-00231-MB07", nom:"MISSEBA Brice",         num:"20P0031", doc:"Attestation de succès",     date:"1/07/2026",  delai:"5 j",  urgent:false },
];

export default function DashboardCS() {
    const [search, setSearch] = useState("");

    const filtered = DOSSIERS.filter(d =>
        d.ref.toLowerCase().includes(search.toLowerCase()) ||
        d.nom.toLowerCase().includes(search.toLowerCase()) ||
        d.doc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="agent-layout">
            <style>{css}</style>

            {/* SIDEBAR */}
            <aside className="agent-sidebar">
                <a href="/chef" className="agent-sidebar__brand">
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
                        <NavLink key={n.to} to={n.to} end={n.to === "/chef"}
                                 className={({ isActive }) => "agent-sidebar__link" + (isActive ? " active" : "")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={n.d} />
                            </svg>
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="agent-sidebar__divider" />
                <button className="agent-sidebar__logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Déconnexion
                </button>
            </aside>

            {/* MAIN */}
            <div className="agent-main">

                {/* TOPBAR */}
                <header className="agent-topbar">
                    <div className="agent-topbar__role">Chef Div. Scolarité — IFRI</div>
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
                            <div className="agent-topbar__info">
                                <div className="agent-topbar__name">Clarisse KPOVIESSI</div>
                                <div className="agent-topbar__meta">IFRI</div>
                            </div>
                            <div className="agent-topbar__avatar">CL</div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="agent-content">

                    {/* Header */}
                    <div className="agent-page-header">
                        <div>
                            <h2 className="agent-page-title">Espace Chef de Division</h2>
                            <p className="agent-page-sub">Validez les pièces et générez les documents officiels.</p>
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
                            { value:"1",  label:"À TRAITER",           iconBg:"#eff6ff",
                                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                            { value:"87", label:"VALIDÉES (MOIS)",      iconBg:"#f0fdf4",
                                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                            { value:"12", label:"REJETÉES",             iconBg:"#fef2f2",
                                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
                            { value:"5",  label:"EN ATTENTE SIGNATURE", iconBg:"#f5f3ff",
                                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
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
                                Dossiers à examiner
                                <span className="count-badge">{filtered.length}</span>
                            </div>
                            <div className="search-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>

                        <table className="agent-table">
                            <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Étudiant</th>
                                <th>Document</th>
                                <th>Date Soumission</th>
                                <th>Délai Écoulé</th>
                                <th style={{ textAlign:"right" }}>Action</th>
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
                                    <td>
                                        <span className={d.urgent ? "td-delai-urgent" : "td-delai-ok"}>{d.delai}</span>
                                    </td>
                                    <td style={{ textAlign:"right" }}>
                                        <button className="btn-traiter">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                 stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="5 3 19 12 5 21 5 3"/>
                                            </svg>
                                            Traiter
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign:"center", padding:"32px", color:"#94a3b8", fontSize:".9rem" }}>
                                        Aucun dossier trouvé
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