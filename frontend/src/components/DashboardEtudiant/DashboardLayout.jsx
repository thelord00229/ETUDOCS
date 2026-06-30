// frontend/src/components/DashboardEtudiant/DashboardLayout.jsx
import { useMemo, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./Topbar.jsx";
import { useNotifications } from "../../hooks/useNotifications";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

.dash-layout {
    display:flex; min-height:100vh;
    background:#f4f6f9;
    font-family:'DM Sans',sans-serif;
  }
  .dash-main   { margin-left: var(--sidebar-w, 200px); padding-top:64px; flex:1; min-width:0; transition: margin-left 0.25s ease; }
  .dash-content {
    padding:28px 32px;
    display:flex; flex-direction:column; gap:24px;
    padding-bottom:48px;
  }
  .dash-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 150;
  }
  .dash-overlay--visible { display: block; }

  @media (max-width: 768px) {
    .dash-main { margin-left: 0; }
    .dash-content { padding: 20px 16px; gap: 16px; }
  }
  @media (max-width: 480px) {
    .dash-content { padding: 14px 12px; gap: 12px; }
  }
`;

function getUser() {
  try {
    const raw =
      localStorage.getItem("etudocs_user") ||
      sessionStorage.getItem("etudocs_user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const normalizeInst = (v) =>
  String(v || "")
    .trim()
    .toUpperCase();

function getInstitutionCodeFromUser(user) {
  const sigle = normalizeInst(user?.institution?.sigle);
  if (sigle) return sigle;

  const maybeCode = normalizeInst(user?.institutionId);
  if (["IFRI", "EPAC", "FSS"].includes(maybeCode)) return maybeCode;

  const stored = normalizeInst(localStorage.getItem("etudocs_institution"));
  if (stored) return stored;

  return "IFRI";
}

export default function DashboardLayout({ children }) {
  const user = getUser();

  const prenom = user.prenom || "";
  const nom = user.nom || "";
  const fullName = `${prenom} ${nom}`.trim() || "Étudiant";

  const email = user.email || "";
  const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "EU";

  const meta = email;

  const instCode = useMemo(() => getInstitutionCodeFromUser(user), [user]);

  const { notifications, deleteOne: handleDelete, deleteAll: handleClearAll } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dash-layout">
      <style>{css}</style>

      <div
        className={`dash-overlay${sidebarOpen ? " dash-overlay--visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        institution={instCode}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      <div className="dash-main" style={{ "--sidebar-w": sidebarCollapsed ? "62px" : "200px" }}>
        <TopBar
          name={fullName}
          meta={meta}
          initials={initials}
          institution={instCode}
          notifications={notifications}
          onDeleteNotif={handleDelete}
          onClearAllNotifs={handleClearAll}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
