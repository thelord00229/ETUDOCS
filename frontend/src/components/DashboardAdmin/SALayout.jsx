import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useNotifications } from "../../hooks/useNotifications";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .sa-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }
  .sa-sidebar {
    width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; padding-bottom: 24px;
    transition: width 0.25s ease, transform .25s ease;
    overflow: hidden;
  }
  /* ── COLLAPSE ── */
  .sa-sidebar--collapsed { width: 62px; }
  .sa-sidebar--collapsed .sa-brand { justify-content: center; padding: 20px 0; }
  .sa-sidebar--collapsed .sa-brand__name { display: none; }
  .sa-sidebar--collapsed .sa-nav__link { justify-content: center; gap: 0; padding: 11px 0; }
  .sa-sidebar--collapsed .sa-nav__link-label { display: none; }
  .sa-sidebar--collapsed .sa-logout { justify-content: center; gap: 0; padding: 11px 0; }
  .sa-sidebar--collapsed .sa-logout-label { display: none; }
  .sa-sidebar__toggle {
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer; width: 100%;
    padding: 8px; color: #94a3b8; transition: color .15s;
  }
  .sa-sidebar__toggle:hover { color: #2e7d32; }
  @media (max-width: 768px) { .sa-sidebar--collapsed { width: 220px; } }
  .sa-brand {
    display: flex; align-items: center; gap: 10px; padding: 20px 20px 20px;
    text-decoration: none;
  }
  .sa-brand__logo {
    height: 48px; width: auto; object-fit: contain;
  }
  .sa-brand__name {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.1rem; color: #1e293b;
    letter-spacing: -.01em;
  }
  .sa-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 2px; }
  .sa-nav__link {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #475569; text-decoration: none; transition: background .15s, color .15s;
  }
  .sa-nav__link:hover { background: #f1f8e9; color: #2e7d32; }
  .sa-nav__link.active { background: #2e7d32; color: #fff; font-weight: 700; box-shadow: 0 4px 14px rgba(46,125,50,.2); }
  .sa-nav__link.active svg { stroke: #fff; }
  .sa-nav__link svg { stroke: #94a3b8; transition: stroke .15s; }
  .sa-nav__link:hover svg { stroke: #2e7d32; }
  .sa-divider { height: 1px; background: #e2e8f0; margin: 12px 12px; }
  .sa-logout {
    display: flex; align-items: center; gap: 12px; padding: 10px 24px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #94a3b8; background: none; border: none; cursor: pointer; width: 100%; transition: color .15s;
  }
  .sa-logout:hover { color: #ef4444; }
  .sa-logout:hover svg { stroke: #ef4444; }
  .sa-logout svg { stroke: #94a3b8; transition: stroke .15s; }
  .sa-sidebar__close {
    display: none;
    position: absolute; top: 14px; right: 12px;
    background: none; border: none; cursor: pointer;
    color: #94a3b8; padding: 6px; border-radius: 8px;
    transition: background .15s, color .15s;
  }
  .sa-sidebar__close:hover { background: #f1f5f9; color: #1e293b; }
  .sa-main { margin-left: 220px; flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .sa-topbar {
    height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between; padding: 0 32px; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .sa-topbar__left { display: flex; align-items: center; gap: 12px; }
  .sa-topbar__right { display: flex; align-items: center; gap: 16px; }
  .sa-topbar__burger {
    display: none;
    background: none; border: none; cursor: pointer;
    color: #475569; padding: 6px; border-radius: 8px;
    transition: background .15s, color .15s;
  }
  .sa-topbar__burger:hover { background: #f1f5f9; color: #1e293b; }
  .sa-topbar__notif { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; }
  .sa-notif-panel {
    position: absolute; top: 44px; right: 0;
    width: min(340px, calc(100vw - 32px)); background: #fff;
    border: 1px solid #e2e8f0; border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,.08);
    overflow: hidden; z-index: 300;
  }
  .sa-notif-panel__header { padding: 12px 14px 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; }
  .sa-notif-panel__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem; color: #1e293b; }
  .sa-notif-clear { background: none; border: none; cursor: pointer; font-size: .75rem; font-weight: 600; color: #94a3b8; padding: 5px 7px; border-radius: 7px; transition: background .15s, color .15s; }
  .sa-notif-clear:hover { background: #f1f8e9; color: #f5a623; }
  .sa-notif-list { max-height: 340px; overflow-y: auto; }
  .sa-notif-empty { padding: 16px 14px; font-size: .83rem; color: #64748b; }
  .sa-notif-item { padding: 11px 14px; display: flex; gap: 10px; align-items: flex-start; border-bottom: 1px solid #f1f5f9; }
  .sa-notif-item:last-child { border-bottom: none; }
  .sa-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #f5a623; margin-top: 5px; flex-shrink: 0; }
  .sa-notif-body { flex: 1; min-width: 0; }
  .sa-notif-msg { font-size: .83rem; color: #1e293b; line-height: 1.35; margin-bottom: 3px; word-break: break-word; }
  .sa-notif-meta { font-size: .73rem; color: #94a3b8; }
  .sa-notif-del { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 3px; border-radius: 6px; transition: background .15s, color .15s; flex-shrink: 0; }
  .sa-notif-del:hover { background: #fef2f2; color: #dc2626; }
  .sa-topbar__user  { display: flex; align-items: center; gap: 10px; }
  .sa-topbar__avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #f5a623;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .82rem; color: #fff;
  }
  .sa-topbar__name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem; color: #1e293b; }
  .sa-topbar__meta { font-size: .75rem; color: #94a3b8; }
  .sa-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; padding-bottom: 48px; }
  .sa-page-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.55rem; color: #1e293b; margin-bottom: 4px; }
  .sa-page-sub { color: #475569; font-size: .9rem; }
  .sa-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 150;
  }
  .sa-overlay--visible { display: block; }

  @media (max-width: 768px) {
    .sa-sidebar { transform: translateX(-220px); box-shadow: none; }
    .sa-sidebar--open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,.12); }
    .sa-sidebar__close { display: flex; align-items: center; justify-content: center; }
    .sa-main { margin-left: 0; }
    .sa-topbar { padding: 0 16px; }
    .sa-topbar__burger { display: flex; align-items: center; justify-content: center; }
    .sa-topbar__name, .sa-topbar__meta { display: none; }
    .sa-content { padding: 20px 16px; gap: 16px; }
  }
  @media (max-width: 480px) {
    .sa-topbar { padding: 0 12px; gap: 8px; }
    .sa-content { padding: 14px 12px; gap: 12px; }
  }
`;

const NAV = [
  {
    to: "/superadmin",
    end: true,
    label: "Tableau de bord",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
  },
  {
    to: "/superadmin/institutions",
    end: false,
    label: "Gestion des institutions",
    d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
  },
  {
    to: "/superadmin/agents",
    end: false,
    label: "Gestion des agents",
    d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
  },
  {
    to: "/superadmin/academique",
    end: false,
    label: "Données académiques",
    d: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
  },
  {
    to: "/superadmin/analytics",
    end: false,
    label: "Analytique",
    d: "M3 3v18h18M7 14l4-4 3 3 6-6"
  }
];

export default function SALayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { notifications, unreadCount, markAllRead, deleteOne: deleteNotif, deleteAll: deleteAllNotifs } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const fmtTime = (ts) => { try { return new Date(ts).toLocaleString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }); } catch { return ""; } };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sa-layout">
      <style>{css}</style>

      <div
        className={`sa-overlay${sidebarOpen ? " sa-overlay--visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sa-sidebar${sidebarOpen ? " sa-sidebar--open" : ""}${sidebarCollapsed ? " sa-sidebar--collapsed" : ""}`}>
        <button className="sa-sidebar__close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <a href="/superadmin" className="sa-brand">
          <img src={logo} alt="EtuDocs" className="sa-brand__logo" />
          <span className="sa-brand__name">EtuDocs</span>
        </a>

        <nav className="sa-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => "sa-nav__link" + (isActive ? " active" : "")}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? n.label : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.d} />
              </svg>
              <span className="sa-nav__link-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sa-divider" />

        <button
          className="sa-sidebar__toggle"
          onClick={() => setSidebarCollapsed(v => !v)}
          type="button"
          aria-label={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          title={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
          </svg>
        </button>

        <button className="sa-logout" type="button" onClick={handleLogout} title={sidebarCollapsed ? "Déconnexion" : undefined}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="sa-logout-label">Déconnexion</span>
        </button>
      </aside>

      <div className="sa-main" style={{ marginLeft: sidebarCollapsed ? 62 : 220, transition: 'margin-left 0.25s ease' }}>
        <header className="sa-topbar">
          <div className="sa-topbar__left">
            <button className="sa-topbar__burger" type="button" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>

          <div className="sa-topbar__right">
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                className="sa-topbar__notif"
                type="button"
                onClick={() => { setNotifOpen(v => !v); if (!notifOpen) markAllRead(); }}
                aria-label="Notifications"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && <span style={{ position:"absolute", top:0, right:0, width:8, height:8, borderRadius:"50%", background:"#f5a623", border:"2px solid #fff" }} />}
              </button>
              {notifOpen && (
                <div className="sa-notif-panel">
                  <div className="sa-notif-panel__header">
                    <span className="sa-notif-panel__title">Notifications</span>
                    <button className="sa-notif-clear" type="button" onClick={deleteAllNotifs}>Tout supprimer</button>
                  </div>
                  <div className="sa-notif-list">
                    {notifications.length === 0 ? (
                      <div className="sa-notif-empty">Aucune notification.</div>
                    ) : notifications.map(n => (
                      <div className="sa-notif-item" key={n.id}>
                        <span className="sa-notif-dot" />
                        <div className="sa-notif-body">
                          <div className="sa-notif-msg">{n.message}</div>
                          <div className="sa-notif-meta">{fmtTime(n.createdAt)}</div>
                        </div>
                        <button className="sa-notif-del" type="button" onClick={() => deleteNotif(n.id)} aria-label="Supprimer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sa-topbar__user">
              <div>
                <div className="sa-topbar__name">Super Admin</div>
                <div className="sa-topbar__meta">EtuDocs</div>
              </div>
              <div className="sa-topbar__avatar">SA</div>
            </div>
          </div>
        </header>

        <div className="sa-content">{children}</div>
      </div>
    </div>
  );
}
