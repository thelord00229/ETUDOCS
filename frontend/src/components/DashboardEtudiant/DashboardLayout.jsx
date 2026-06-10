// frontend/src/components/DashboardEtudiant/DashboardLayout.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./Topbar.jsx";
import { getDemandes } from "../../services/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  .dash-layout {
    display:flex; min-height:100vh;
    background:#f4f6f9;
    font-family:'DM Sans',sans-serif;
  }
  .dash-main   { margin-left:200px; padding-top:64px; flex:1; min-width:0; }
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

const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "Relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return t || "Document";
};

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

const NOTIF_KEY = "etudocs_notifs_dismissed";

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDismissed(ids) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(ids));
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

  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const demandes = await getDemandes();
        if (!Array.isArray(demandes)) return;

        const dismissed = getDismissed();
        const notifs = [];

        for (const d of demandes) {
          if (d.statut === "DISPONIBLE") {
            const id = `${d.id}-DISPONIBLE`;
            if (!dismissed.includes(id)) {
              notifs.push({
                id,
                message: `✅ Votre ${labelType(
                  d.typeDocument
                )} est prêt. Rendez-vous dans "Mes documents" pour le télécharger.`,
                createdAt: d.updatedAt || d.createdAt,
              });
            }
          }

          if (d.statut === "REJETEE" || d.statut === "REJETE") {
            const id = `${d.id}-REJET`;
            if (!dismissed.includes(id)) {
              const motif = d.motifRejet || "";
              const suffix = motif ? ` — ${motif}` : "";
              notifs.push({
                id,
                message: `❌ Rejet de demande : ${labelType(
                  d.typeDocument
                )}${suffix}`,
                createdAt: d.updatedAt || d.createdAt,
              });
            }
          }
        }

        notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(notifs);
      } catch {
        /* silencieux */
      }
    };
    load();
  }, []);

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const dismissed = getDismissed();
    if (!dismissed.includes(id)) saveDismissed([...dismissed, id]);
  };

  const handleClearAll = () => {
    const ids = notifications.map((n) => n.id);
    saveDismissed([...new Set([...getDismissed(), ...ids])]);
    setNotifications([]);
  };

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

      <div className="dash-main" style={{ marginLeft: sidebarCollapsed ? 62 : 200, transition: 'margin-left 0.25s ease' }}>
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
