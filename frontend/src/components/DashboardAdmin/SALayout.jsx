import { NavLink } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .sa-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }
  .sa-sidebar {
    width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; padding-bottom: 24px;
  }
  .sa-brand {
    display: flex; align-items: center; gap: 10px; padding: 20px 20px 14px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.15rem;
    color: #1a2744; text-decoration: none;
  }
  .sa-brand__icon {
    width: 36px; height: 36px; border-radius: 8px; background: #1a2744;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sa-role-badge {
    margin: 0 16px 18px; padding: 6px 12px; border-radius: 8px;
    background: #fffbeb; border: 1px solid #fde68a;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .72rem;
    color: #d97706; letter-spacing: .06em; text-transform: uppercase;
  }
  .sa-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 2px; }
  .sa-nav__link {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #475569; text-decoration: none; transition: background .15s, color .15s;
  }
  .sa-nav__link:hover { background: #f1f5f9; color: #1a2744; }
  .sa-nav__link.active { background: #1a2744; color: #fff; }
  .sa-nav__link.active svg { stroke: #fff; }
  .sa-nav__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .sa-nav__link:hover svg { stroke: #1a2744; }
  .sa-divider { height: 1px; background: #e2e8f0; margin: 12px 12px; }
  .sa-logout {
    display: flex; align-items: center; gap: 12px; padding: 10px 24px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #94a3b8; background: none; border: none; cursor: pointer; width: 100%; transition: color .15s;
  }
  .sa-logout:hover { color: #ef4444; }
  .sa-logout:hover svg { stroke: #ef4444; }
  .sa-logout svg { stroke: #94a3b8; transition: stroke .15s; }
  .sa-main { margin-left: 220px; flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .sa-topbar {
    height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: flex-end; padding: 0 32px; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .sa-topbar__notif { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; }
  .sa-topbar__user  { display: flex; align-items: center; gap: 10px; }
  .sa-topbar__avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #f5a623;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .82rem; color: #fff;
  }
  .sa-topbar__name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem; color: #1a2744; }
  .sa-topbar__meta { font-size: .75rem; color: #94a3b8; }
  .sa-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; padding-bottom: 48px; }
  .sa-page-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.55rem; color: #1a2744; margin-bottom: 4px; }
  .sa-page-sub { color: #475569; font-size: .9rem; }
`;

const NAV = [
    { to: "/superadmin",              end: true,  label: "Tableau de bord",          d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/superadmin/institutions", end: false, label: "Gestion des institutions", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { to: "/superadmin/agents",       end: false, label: "Gestion des agents",       d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
    { to: "/superadmin/academique",   end: false, label: "Données académiques",      d: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
];

export default function SALayout({ children }) {
    return (
        <div className="sa-layout">
            <style>{css}</style>
            <aside className="sa-sidebar">
                <a href="/superadmin" className="sa-brand">
                    <div className="sa-brand__icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    EtuDocs
                </a>
                <div className="sa-role-badge">Super Admin</div>
                <nav className="sa-nav">
                    {NAV.map(n => (
                        <NavLink key={n.to} to={n.to} end={n.end}
                                 className={({ isActive }) => "sa-nav__link" + (isActive ? " active" : "")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={n.d} />
                            </svg>
                            {n.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sa-divider" />
                <button className="sa-logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Déconnexion
                </button>
            </aside>
            <div className="sa-main">
                <header className="sa-topbar">
                    <button className="sa-topbar__notif">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                    <div className="sa-topbar__user">
                        <div>
                            <div className="sa-topbar__name">Super Admin</div>
                            <div className="sa-topbar__meta">EtuDocs</div>
                        </div>
                        <div className="sa-topbar__avatar">SA</div>
                    </div>
                </header>
                <div className="sa-content">{children}</div>
            </div>
        </div>
    );
}