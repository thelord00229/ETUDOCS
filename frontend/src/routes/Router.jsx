import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routeModules } from "./routeModules";

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

        <Route path="/dashboardEtu" element={<Dashboard />} />
        <Route path="/dashboardEtu/nouvelle" element={<NouvelleDemande />} />
        <Route path="/dashboardEtu/demandes" element={<MesDemandes />} />
        <Route path="/dashboardEtu/documents" element={<Navigate to="/dashboardEtu/reclamations" replace />} />
        <Route path="/dashboardEtu/profil" element={<MonProfil />} />
        <Route path="/dashboardEtu/reclamations" element={<MesReclamations />} />
        <Route path="/dashboardEtu/nouvelle-reclamation" element={<NouvelleReclamation />} />

        <Route path="/dashboardsa" element={<DashboardSA />} />
        <Route path="/dashboardsc" element={<DashboardCS />} />
        <Route path="/dashboardda" element={<DashboardDA />} />
        <Route path="/dashboarddi" element={<DashboardDI />} />
        <Route path="/dashboardsg" element={<DashboardSG />} />
        <Route path="/dashboardsg/reclamations" element={<GestionReclamations />} />
        <Route path="/dashboardce" element={<DashboardCE />} />

        <Route path="/superadmin" element={<SADashboard />} />
        <Route path="/superadmin/institutions" element={<SAInstitutions />} />
        <Route path="/superadmin/agents" element={<SAAgents />} />
        <Route path="/superadmin/academique" element={<SAAcademique />} />
        <Route path="/superadmin/analytics" element={<SAAnalytics />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
