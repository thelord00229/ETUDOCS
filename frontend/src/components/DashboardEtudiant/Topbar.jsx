import { useEffect, useMemo, useRef, useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  .topbar {
    height: 64px; background: #fff;
    border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 0 32px; gap: 20px;
    position: fixed; top: 0; left: 200px; right: 0; z-index: 40;
  }
  .topbar__notif {
    position: relative; background: none; border: none; cursor: pointer;
    color: #94a3b8; padding: 4px;
  }
  .topbar__badge {
    position: absolute; top: 0; right: 0;
    width: 8px; height: 8px; border-radius: 50%;
    background: #f5a623; border: 2px solid #fff;
  }

  /* ✅ Dropdown notifications */
  .notif-panel {
    position: absolute;
    top: 44px;
    right: 0;
    width: 360px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,.08);
    overflow: hidden;
    z-index: 200;
  }
  .notif-panel__header {
    padding: 14px 14px 10px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
  }
  .notif-panel__title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: .9rem;
    color: #1a2744;
  }
  .notif-panel__actions {
    display: flex; align-items: center; gap: 10px;
  }
  .notif-clear {
    background: none;
    border: none;
    cursor: pointer;
    font-size: .78rem;
    font-weight: 600;
    color: #94a3b8;
    padding: 6px 8px;
    border-radius: 8px;
    transition: background .15s, color .15s;
  }
  .notif-clear:hover {
    background: #f1f5f9;
    color: #1a2744;
  }
  .notif-list {
    max-height: 360px;
    overflow: auto;
  }
  .notif-empty {
    padding: 18px 14px;
    font-size: .85rem;
    color: #64748b;
  }
  .notif-item {
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    border-bottom: 1px solid #f1f5f9;
  }
  .notif-item:last-child { border-bottom: none; }

  .notif-dot {
    width: 9px; height: 9px; border-radius: 50%;
    background: #f5a623;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .notif-body { flex: 1; min-width: 0; }
  .notif-msg {
    font-size: .85rem;
    color: #1e293b;
    line-height: 1.35;
    margin-bottom: 4px;
    word-break: break-word;
  }
  .notif-meta {
    font-size: .75rem;
    color: #94a3b8;
  }
  .notif-del {
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px;
    border-radius: 8px;
    transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  .notif-del:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .topbar__user { display: flex; align-items: center; gap: 10px; }
  .topbar__avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #1a2744;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.85rem; color: #fff;
    flex-shrink: 0;
  }
  .topbar__info { line-height: 1.3; }
  .topbar__name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.9rem; color: #1a2744; }
  .topbar__meta { font-size: 0.78rem; color: #94a3b8; }
`;

function fmtTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function makeInitials(nom, prenom) {
  const a = String(prenom || "").trim()[0] || "";
  const b = String(nom || "").trim()[0] || "";
  const s = (a + b).toUpperCase();
  return s || "??";
}

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("etudocs_user") ||
      sessionStorage.getItem("etudocs_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Props recommandées:
 *  - user: objet renvoyé par /me ou login
 *  - notifications: [{ id, message, createdAt }]
 */
export default function TopBar({
  user = null,
  notifications = [],
  onDeleteNotif = () => {},
  onClearAllNotifs = () => {},
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const notifCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.length : 0),
    [notifications]
  );

  // ✅ user fallback depuis localStorage si non fourni
  const computedUser = useMemo(() => {
    return user || getStoredUser() || null;
  }, [user]);

  const name = useMemo(() => {
    const nom = computedUser?.nom || "";
    const prenom = computedUser?.prenom || "";
    const full = `${prenom} ${nom}`.trim();
    return full || "Utilisateur";
  }, [computedUser]);

  const initials = useMemo(() => {
    return makeInitials(computedUser?.nom, computedUser?.prenom);
  }, [computedUser]);

  // ✅ META: uniquement EMAIL comme tu veux
  const meta = useMemo(() => {
    return computedUser?.email || "";
  }, [computedUser]);

  // fermer si clic dehors
  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <>
      <style>{css}</style>
      <header className="topbar">
        <div ref={wrapRef} style={{ position: "relative" }}>
          <button
            className="topbar__notif"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Notifications"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && <span className="topbar__badge" />}
          </button>

          {open && (
            <div className="notif-panel">
              <div className="notif-panel__header">
                <div className="notif-panel__title">Notifications</div>
                <div className="notif-panel__actions">
                  <button
                    className="notif-clear"
                    type="button"
                    onClick={() => onClearAllNotifs()}
                    disabled={notifCount === 0}
                    style={
                      notifCount === 0
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : undefined
                    }
                  >
                    Tout supprimer
                  </button>
                </div>
              </div>

              <div className="notif-list">
                {notifCount === 0 ? (
                  <div className="notif-empty">Aucune notification.</div>
                ) : (
                  notifications.map((n) => (
                    <div className="notif-item" key={n.id}>
                      <span className="notif-dot" />
                      <div className="notif-body">
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-meta">{fmtTime(n.createdAt)}</div>
                      </div>
                      <button
                        className="notif-del"
                        type="button"
                        onClick={() => onDeleteNotif(n.id)}
                        aria-label="Supprimer"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <div className="topbar__info">
            <div className="topbar__name">{name}</div>
            <div className="topbar__meta">{meta}</div>
          </div>
        </div>
      </header>
    </>
  );
}