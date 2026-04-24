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
  // priorité : user.institution.sigle
  const sigle = normalizeInst(user?.institution?.sigle);
  if (sigle) return sigle;

  // fallback : parfois on stocke le code dans institutionId par erreur
  const maybeCode = normalizeInst(user?.institutionId);
  if (["IFRI", "EPAC", "FSS"].includes(maybeCode)) return maybeCode;

  // fallback localStorage (défini au login)
  const stored = normalizeInst(localStorage.getItem("etudocs_institution"));
  if (stored) return stored;

  return "IFRI";
}

export default function DashboardLayout({ children }) {
  const user = getUser();

  const prenom = user.prenom || "";
  const nom = user.nom || "";
  const fullName = `${prenom} ${nom}`.trim() || "Étudiant";

  // ✅ source fiable
  const email = user.email || "";
  const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "EU";

  // ✅ TU VEUX TOUJOURS L'EMAIL
  const meta = email;

  // ✅ institution code pour adapter branding
  const instCode = useMemo(() => getInstitutionCodeFromUser(user), [user]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const demandes = await getDemandes();
        if (!Array.isArray(demandes)) return;

        const dismissed = getDismissed();
        const notifs = [];

        for (const d of demandes) {
          // ✅ Notification document disponible
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

          // ✅ Notification rejet avec commentaire
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

      {/* ✅ on passe l'institution pour branding */}
      <Sidebar institution={instCode} />

      <div className="dash-main">
        <TopBar
          name={fullName}
          meta={meta}
          initials={initials}
          institution={instCode}
          notifications={notifications}
          onDeleteNotif={handleDelete}
          onClearAllNotifs={handleClearAll}
        />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
