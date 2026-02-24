import { NavLink } from "react-router-dom";

const css = `
  .sidebar {
    width: 200px; min-height: 100vh; flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    padding: 0 0 24px 0;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
  }
  .sidebar__brand {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 28px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.1rem;
    color: #1a2744; text-decoration: none;
  }
  .sidebar__brand-icon {
    width: 34px; height: 34px; border-radius: 8px; background: #1a2744;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }
  .sidebar__link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
    color: #475569; text-decoration: none;
    transition: background .15s, color .15s;
  }
  .sidebar__link:hover { background: #f1f5f9; color: #1a2744; }
  .sidebar__link.active { background: #1a2744; color: #fff; }
  .sidebar__link.active svg { stroke: #fff; }
  .sidebar__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .sidebar__link:hover svg { stroke: #1a2744; }
  .sidebar__divider { height: 1px; background: #e2e8f0; margin: 12px 10px; }
  .sidebar__logout {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 22px; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 500; color: #94a3b8;
    background: none; border: none; cursor: pointer; width: 100%;
    transition: color .15s;
  }
  .sidebar__logout:hover { color: #ef4444; }
  .sidebar__logout:hover svg { stroke: #ef4444; }
  .sidebar__logout svg { stroke: #94a3b8; transition: stroke .15s; }
`;

const Icon = ({ d, d2 }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />{d2 && <path d={d2} />}
    </svg>
);

const NAV = [
    { to: "/dashboardEtu",          label: "Tableau de bord", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/dashboardEtu/nouvelle", label: "Nouvelle demande", d: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { to: "/dashboardEtu/demandes", label: "Mes demandes",     d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { to: "/dashboardEtu/documents",label: "Mes documents",    d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    { to: "/dashboardEtu/profil",   label: "Mon profil",       d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function Sidebar() {
    return (
        <>
            <style>{css}</style>
            <aside className="sidebar">
                <a href="/dashboard" className="sidebar__brand">
                    <div className="sidebar__brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    EtuDocs
                </a>

                <nav className="sidebar__nav">
                    {NAV.map(n => (
                        <NavLink key={n.to} to={n.to} end={n.to === "/dashboard"}
                                 className={({ isActive }) => "sidebar__link" + (isActive ? " active" : "")}>
                            <Icon d={n.d} />
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__divider" />
                <button className="sidebar__logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Déconnexion
                </button>
            </aside>
        </>
    );
}