export const routeModules = {
  "/": () => import("../pages/Landingpage.jsx"),
  "/login": () => import("../pages/Login.jsx"),
  "/register": () => import("../pages/Register.jsx"),
  "/forgot-password": () => import("../pages/ForgotPassword.jsx"),
  "/reset-password": () => import("../pages/ResetPassword.jsx"),
  "/auth/verify/:token": () => import("../pages/VerifyEmail.jsx"),

  "/dashboardEtu": () => import("../pages/DashboardEtudiant/Dashboard.jsx"),
  "/dashboardEtu/nouvelle": () => import("../pages/DashboardEtudiant/NouvelleDemande.jsx"),
  "/dashboardEtu/demandes": () => import("../pages/DashboardEtudiant/MesDemandes.jsx"),
  "/dashboardEtu/profil": () => import("../pages/DashboardEtudiant/MonProfil.jsx"),
  "/dashboardEtu/reclamations": () => import("../pages/DashboardEtudiant/MesReclamations.jsx"),
  "/dashboardEtu/nouvelle-reclamation": () =>
    import("../pages/DashboardEtudiant/NouvelleReclamation.jsx"),

  "/dashboardsa": () => import("../pages/DashboardSA/DashboardSA.jsx"),
  "/dashboardsc": () => import("../pages/DashboardCS/DashboardCS.jsx"),
  "/dashboardda": () => import("../pages/DashboardDA/DashboardDA.jsx"),
  "/dashboarddi": () => import("../pages/DashboardDI/DashboardDI.jsx"),
  "/dashboardsg": () => import("../pages/DashboardSG/DashboardSG.jsx"),
  "/dashboardsg/reclamations": () => import("../pages/DashboardSG/GestionReclamations.jsx"),
  "/dashboardce": () => import("../pages/DashboardCE/DashboardCE.jsx"),

  "/superadmin": () => import("../pages/DashboardAdmin/SADashboard.jsx"),
  "/superadmin/institutions": () => import("../pages/DashboardAdmin/SAInstitutions.jsx"),
  "/superadmin/agents": () => import("../pages/DashboardAdmin/SAAgents.jsx"),
  "/superadmin/academique": () => import("../pages/DashboardAdmin/SAAcadémique.jsx"),
  "/superadmin/analytics": () => import("../pages/DashboardAdmin/SAAnalytics.jsx"),
};

const preloaded = new Set();

export const preloadRoute = (path) => {
  const load = routeModules[path];
  if (!load || preloaded.has(path)) return;
  preloaded.add(path);
  load().catch(() => preloaded.delete(path));
};
