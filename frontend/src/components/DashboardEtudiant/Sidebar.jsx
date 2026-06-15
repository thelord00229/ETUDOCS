import { NavLink, useNavigate } from "react-router-dom";
import logoDefault from "../../assets/logo.png";
import { clearSession } from "../../services/api";
import { preloadRoute } from "../../routes/routeModules";

const css = `
  .sidebar {
    width: 200px; min-height: 100vh; flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    padding: 0 0 24px 0;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 200;
    transition: width 0.25s ease, transform .25s ease;
    overflow: hidden;
  }
  /* ── COLLAPSE ── */
  .sidebar--collapsed { width: 62px; }
  .sidebar--collapsed .sidebar__brand { justify-content: center; padding: 20px 0 28px; }
  .sidebar--collapsed .sidebar__brand-text { display: none; }
  .sidebar--collapsed .sidebar__link { justify-content: center; gap: 0; padding: 11px 0; }
  .sidebar--collapsed .sidebar__label { display: none; }
  .sidebar--collapsed .sidebar__logout { justify-content: center; gap: 0; padding: 11px 0; }
  .sidebar--collapsed .sidebar__logout-label { display: none; }
  .sidebar__toggle {
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer; width: 100%;
    padding: 8px; color: #94a3b8; transition: color .15s;
  }
  .sidebar__toggle:hover { color: #2e7d32; }
  @media (max-width: 768px) { .sidebar--collapsed { width: 200px; } }
  .sidebar__brand {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 28px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.1rem;
    color: #2e7d32; text-decoration: none;
  }
  .sidebar__brand-icon {
    width: 42px; height: 42px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; overflow: hidden; background: transparent;
  }
  .sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }
  .sidebar__link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
    color: #475569; text-decoration: none;
    transition: background .15s, color .15s;
  }
  .sidebar__link:hover { background: #f1f8e9; color: #2e7d32; }
  .sidebar__link.active { background: #2e7d32; color: #fff; }
  .sidebar__link.active svg { stroke: #fff; }
  .sidebar__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .sidebar__link:hover svg { stroke: #2e7d32; }
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
  .sidebar__close {
    display: none;
    position: absolute; top: 14px; right: 12px;
    background: none; border: none; cursor: pointer;
    color: #94a3b8; padding: 6px; border-radius: 8px;
    transition: background .15s, color .15s;
  }
  .sidebar__close:hover { background: #f1f5f9; color: #1e293b; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-200px); box-shadow: none; }
    .sidebar--open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,.12); }
    .sidebar__close { display: flex; align-items: center; justify-content: center; }
  }
`;

const Icon = ({ d }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const NAV = [
  {
    to: "/dashboardEtu",
    label: "Tableau de bord",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/dashboardEtu/nouvelle",
    label: "Nouvelle demande",
    d: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    to: "/dashboardEtu/demandes",
    label: "Mes demandes",
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    to: "/dashboardEtu/reclamations",
    label: "Mes reclamations",
    d: "M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.83L3 20l.9-4.2A7.55 7.55 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    to: "/dashboardEtu/profil",
    label: "Mon profil",
    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    sessionStorage.removeItem("etudocs_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("etudocs_user");
    sessionStorage.removeItem("etudocs_institution");
    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{css}</style>
      <aside className={`sidebar${open ? " sidebar--open" : ""}${collapsed ? " sidebar--collapsed" : ""}`}>
        <button className="sidebar__close" onClick={onClose} type="button" aria-label="Fermer le menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <a href="/dashboardEtu" className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <img
              src={logoDefault}
              alt="EtuDocs"
              style={{ width: 42, height: 42, objectFit: "contain" }}
            />
          </div>
          <span className="sidebar__brand-text">EtuDocs</span>
        </a>

        <nav className="sidebar__nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/dashboardEtu"}
              className={({ isActive }) =>
                "sidebar__link" + (isActive ? " active" : "")
              }
              onClick={onClose}
              onMouseEnter={() => preloadRoute(n.to)}
              onFocus={() => preloadRoute(n.to)}
              title={collapsed ? n.label : undefined}
            >
              <Icon d={n.d} />
              <span className="sidebar__label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__divider" />
        <button
          className="sidebar__toggle"
          onClick={onToggleCollapse}
          type="button"
          aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
          </svg>
        </button>
        <button className="sidebar__logout" onClick={handleLogout} type="button" title={collapsed ? "Déconnexion" : undefined}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="sidebar__logout-label">Déconnexion</span>
        </button>
      </aside>
    </>
  );
}
