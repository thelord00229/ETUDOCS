// frontend/src/components/DashboardEtudiant/DashboardLayout.jsx
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./Topbar.jsx";
import { getDemandes } from "../../services/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  .dash-layout { display:flex; min-height:100vh; background:#f8fafc; font-family:'DM Sans',sans-serif; }
  .dash-main   { margin-left:200px; padding-top:64px; flex:1; min-width:0; }
  .dash-content { padding:28px 32px; display:flex; flex-direction:column; gap:24px; padding-bottom:48px; }
`;

const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "Relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return t || "Document";
};

function getUser() {
  try {
    const raw = localStorage.getItem("etudocs_user") || sessionStorage.getItem("etudocs_user");
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

export default function DashboardLayout({ children }) {
  const user = getUser();
  const prenom = user.prenom || "";
  const nom = user.nom || "";
  const fullName = `${prenom} ${nom}`.trim() || "Étudiant";

  // ✅ source fiable
  const email = user.email || "";
  const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "EU";

  // ✅ IMPORTANT : tu voulais plus afficher la filière à côté de l'email
  const meta = email;

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const demandes = await getDemandes();
        if (!Array.isArray(demandes)) return;

        const dismissed = getDismissed();

        // ✅ Uniquement les demandes DISPONIBLES
        const notifs = demandes
          .filter((d) => d.statut === "DISPONIBLE")
          .map((d) => ({
            id: `${d.id}-DISPONIBLE`,
            message: `✅ Votre ${labelType(
              d.typeDocument
            )} est prêt. Rendez-vous dans "Mes documents" pour le télécharger.`,
            createdAt: d.updatedAt || d.createdAt,
          }))
          .filter((n) => !dismissed.includes(n.id))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      <Sidebar />
      <div className="dash-main">
        <TopBar
          name={fullName}
          meta={meta}
          initials={initials}
          notifications={notifications}
          onDeleteNotif={handleDelete}
          onClearAllNotifs={handleClearAll}
        />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}