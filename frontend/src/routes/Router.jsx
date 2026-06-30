import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routeModules } from "./routeModules";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";

const Login = lazy(routeModules["/login"]);
const Register = lazy(routeModules["/register"]);
const ForgotPassword = lazy(routeModules["/forgot-password"]);
const ResetPassword = lazy(routeModules["/reset-password"]);
const VerifyEmail = lazy(routeModules["/auth/verify/:token"]);
const Landingpage = lazy(routeModules["/"]);

const Dashboard = lazy(routeModules["/dashboardEtu"]);
const NouvelleDemande = lazy(routeModules["/dashboardEtu/nouvelle"]);
const MesDemandes = lazy(routeModules["/dashboardEtu/demandes"]);
const MonProfil = lazy(routeModules["/dashboardEtu/profil"]);
const MesReclamations = lazy(routeModules["/dashboardEtu/reclamations"]);
const NouvelleReclamation = lazy(routeModules["/dashboardEtu/nouvelle-reclamation"]);

const DashboardSA = lazy(routeModules["/dashboardsa"]);
const DashboardCS = lazy(routeModules["/dashboardsc"]);
const DashboardDA = lazy(routeModules["/dashboardda"]);
const DashboardDI = lazy(routeModules["/dashboarddi"]);
const DashboardSG = lazy(routeModules["/dashboardsg"]);
const DashboardCE = lazy(routeModules["/dashboardce"]);
const GestionReclamations = lazy(routeModules["/dashboardsg/reclamations"]);

const SADashboard = lazy(routeModules["/superadmin"]);
const SAInstitutions = lazy(routeModules["/superadmin/institutions"]);
const SAAgents = lazy(routeModules["/superadmin/agents"]);
const SAAcademique = lazy(routeModules["/superadmin/academique"]);
const SAAnalytics = lazy(routeModules["/superadmin/analytics"]);

const routeFallback = (
  <div
    style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      color: "#64748b",
      fontFamily: "DM Sans, sans-serif",
    }}
  >
    Chargement...
  </div>
);

const Router = () => {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/verify/:token" element={<VerifyEmail />} />

        <Route path="/dashboardEtu" element={<ProtectedRoute roles={["ETUDIANT"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboardEtu/nouvelle" element={<ProtectedRoute roles={["ETUDIANT"]}><NouvelleDemande /></ProtectedRoute>} />
        <Route path="/dashboardEtu/demandes" element={<ProtectedRoute roles={["ETUDIANT"]}><MesDemandes /></ProtectedRoute>} />
        <Route path="/dashboardEtu/documents" element={<ProtectedRoute roles={["ETUDIANT"]}><Navigate to="/dashboardEtu/reclamations" replace /></ProtectedRoute>} />
        <Route path="/dashboardEtu/profil" element={<ProtectedRoute roles={["ETUDIANT"]}><MonProfil /></ProtectedRoute>} />
        <Route path="/dashboardEtu/reclamations" element={<ProtectedRoute roles={["ETUDIANT"]}><MesReclamations /></ProtectedRoute>} />
        <Route path="/dashboardEtu/nouvelle-reclamation" element={<ProtectedRoute roles={["ETUDIANT"]}><NouvelleReclamation /></ProtectedRoute>} />

        <Route path="/dashboardsa" element={<ProtectedRoute roles={["SECRETAIRE_ADJOINT"]}><DashboardSA /></ProtectedRoute>} />
        <Route path="/dashboardsc" element={<ProtectedRoute roles={["CHEF_DIVISION"]}><DashboardCS /></ProtectedRoute>} />
        <Route path="/dashboardda" element={<ProtectedRoute roles={["DIRECTEUR_ADJOINT"]}><DashboardDA /></ProtectedRoute>} />
        <Route path="/dashboarddi" element={<ProtectedRoute roles={["DIRECTEUR"]}><DashboardDI /></ProtectedRoute>} />
        <Route path="/dashboardsg" element={<ProtectedRoute roles={["SECRETAIRE_GENERAL"]}><DashboardSG /></ProtectedRoute>} />
        <Route path="/dashboardsg/reclamations" element={<ProtectedRoute roles={["SECRETAIRE_GENERAL"]}><GestionReclamations /></ProtectedRoute>} />
        <Route path="/dashboardce" element={<ProtectedRoute roles={["CHEF_DIVISION"]}><DashboardCE /></ProtectedRoute>} />

        <Route path="/superadmin" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SADashboard /></ProtectedRoute>} />
        <Route path="/superadmin/institutions" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SAInstitutions /></ProtectedRoute>} />
        <Route path="/superadmin/agents" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SAAgents /></ProtectedRoute>} />
        <Route path="/superadmin/academique" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SAAcademique /></ProtectedRoute>} />
        <Route path="/superadmin/analytics" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SAAnalytics /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
