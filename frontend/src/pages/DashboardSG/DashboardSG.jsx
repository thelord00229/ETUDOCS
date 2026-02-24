import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a2f5e;
    --navy-dark: #142347;
    --accent-blue: #1e4db7;
    --accent-gold: #f5a623;
    --teal: #0d9488;
    --bg: #f0f4f8;
    --white: #ffffff;
    --text: #1a2f5e;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
    --orange: #f97316;
    --sidebar-width: 240px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

  .layout { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--navy);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 28px 20px;
  }

  .logo-text {
    font-size: 22px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
  }

  .logo-text span {
    color: var(--accent-gold);
    font-weight: 400;
    font-size: 14px;
    margin-left: 6px;
    letter-spacing: 0.5px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 8px 12px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }

  .nav-item.active {
    background: var(--accent-gold);
    color: var(--navy-dark);
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(245,166,35,0.35);
  }

  .nav-icon {
    width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-footer {
    padding: 20px 12px;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    color: #f87171;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
    border: none;
    background: none;
    width: 100%;
  }

  .logout-btn:hover { background: rgba(239,68,68,0.1); }

  /* MAIN */
  .main {
    margin-left: var(--sidebar-width);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* TOPBAR */
  .topbar {
    background: white;
    border-bottom: 1px solid var(--border);
    padding: 0 36px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .breadcrumb {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    color: var(--navy);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .notif-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
  }

  .notif-dot {
    position: absolute;
    top: 2px; right: 2px;
    width: 9px; height: 9px;
    background: #f59e0b;
    border-radius: 50%;
    border: 2px solid white;
  }

  .user-info { text-align: right; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .user-org { font-size: 12px; color: var(--text-muted); }

  .avatar {
    width: 40px; height: 40px;
    background: var(--teal);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 13px;
    color: white;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }

  /* CONTENT */
  .content {
    padding: 36px;
    flex: 1;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--navy);
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 6px;
    font-weight: 400;
  }

  .actualiser-btn {
    background: var(--navy);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.2px;
    flex-shrink: 0;
  }

  .actualiser-btn:hover {
    background: var(--accent-blue);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(30,77,183,0.28);
  }

  /* STAT CARDS — 4 colonnes */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 26px 22px;
    display: flex;
    align-items: center;
    gap: 18px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  }

  .stat-icon {
    width: 50px; height: 50px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    border: 2px solid;
  }

  .stat-icon.new-dem  { border-color: #bfdbfe; color: #3b82f6; background: #eff6ff; }
  .stat-icon.pending  { border-color: #fed7aa; color: var(--orange); background: #fff7ed; }
  .stat-icon.sent     { border-color: #6ee7b7; color: var(--success); background: #ecfdf5; }
  .stat-icon.refused  { border-color: #fca5a5; color: var(--danger); background: #fef2f2; }

  .stat-value {
    font-size: 36px;
    font-weight: 700;
    color: var(--navy);
    letter-spacing: -1px;
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.3px;
    margin-top: 5px;
  }

  /* TABLE CARD */
  .table-card {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .table-header {
    padding: 22px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .table-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--navy);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .badge-count {
    background: var(--accent-blue);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 20px;
    min-width: 22px;
    text-align: center;
  }

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon-wrap {
    position: absolute;
    left: 12px;
    color: var(--text-muted);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .search-input {
    padding: 9px 14px 9px 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    outline: none;
    width: 230px;
    transition: border-color 0.2s, background 0.2s;
  }

  .search-input:focus {
    border-color: var(--accent-blue);
    background: white;
    box-shadow: 0 0 0 3px rgba(30,77,183,0.08);
  }

  .search-input::placeholder { color: var(--text-muted); }

  .table-divider { height: 1px; background: var(--border); }

  .table-wrapper { overflow-x: auto; }

  table { width: 100%; border-collapse: collapse; }

  thead th {
    padding: 14px 28px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    background: white;
  }

  .empty-state {
    padding: 80px 24px;
    text-align: center;
    background: var(--bg);
  }

  .empty-icon { font-size: 44px; margin-bottom: 14px; opacity: 0.25; }
  .empty-text { font-size: 14px; color: var(--text-muted); font-weight: 500; }
`;

/* ── SVG Icons ── */
const GridIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);

const BellIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

const UsersIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const ClockIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

const AlertCircleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export default function DashboardSG() {
    const [searchQuery, setSearchQuery] = useState("");

    const stats = [
        { icon: <UsersIcon />, cls: "new-dem",  value: 0,   label: "Nouvelles demandes" },
        { icon: <ClockIcon />, cls: "pending",  value: 0,   label: "En attente" },
        { icon: <CheckCircleIcon />, cls: "sent", value: 120, label: "Transmises (mois)" },
        { icon: <AlertCircleIcon />, cls: "refused", value: 5, label: "Refusées" },
    ];

    return (
        <>
            <style>{styles}</style>
            <div className="layout">

                {/* SIDEBAR */}
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <div className="logo-text">EtuDocs <span>Agent</span></div>
                    </div>

                    <nav className="sidebar-nav">
                        <button className="nav-item active">
                            <span className="nav-icon"><GridIcon /></span>
                            Tableau de bord
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn">
                            <LogoutIcon /> Déconnexion
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="main">

                    {/* TOPBAR */}
                    <header className="topbar">
                        <div className="breadcrumb">Secrétaire Général — IFRI</div>
                        <div className="topbar-right">
                            <button className="notif-btn">
                                <BellIcon />
                                <span className="notif-dot" />
                            </button>
                            <div className="user-info">
                                <div className="user-name">Jocelyne AGOSSA</div>
                                <div className="user-org">IFRI</div>
                            </div>
                            <div className="avatar">JO</div>
                        </div>
                    </header>

                    {/* CONTENT */}
                    <div className="content">
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Tableau de bord - Secrétariat Général</h1>
                                <p className="page-subtitle">Supervisez et aiguilllez les demandes vers les divisions.</p>
                            </div>
                            <button className="actualiser-btn">Actualiser</button>
                        </div>

                        {/* STATS — 4 cards */}
                        <div className="stats-grid">
                            {stats.map((s) => (
                                <div className="stat-card" key={s.label}>
                                    <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                                    <div>
                                        <div className="stat-value">{s.value}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TABLE */}
                        <div className="table-card">
                            <div className="table-header">
                                <div className="table-title">
                                    Demandes en attente d'aiguillage
                                    <span className="badge-count">0</span>
                                </div>
                                <div className="search-box">
                                    <span className="search-icon-wrap"><SearchIcon /></span>
                                    <input
                                        className="search-input"
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="table-divider" />

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Référence</th>
                                        <th>Étudiant</th>
                                        <th>Document</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Action requise</th>
                                    </tr>
                                    </thead>
                                </table>
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <div className="empty-text">Aucune demande en attente d'aiguillage</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}