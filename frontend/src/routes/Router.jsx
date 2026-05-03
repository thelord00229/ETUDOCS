import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Landingpage from "../pages/Landingpage.jsx";

import Dashboard from "../pages/DashboardEtudiant/Dashboard.jsx";
import NouvelleDemande from "../pages/DashboardEtudiant/NouvelleDemande.jsx";
import MesDemandes from "../pages/DashboardEtudiant/MesDemandes.jsx";
import MesDocuments from "../pages/DashboardEtudiant/MesDocuments.jsx";
import MonProfil from "../pages/DashboardEtudiant/MonProfil.jsx";

import DashboardSA from "../pages/DashboardSA/DashboardSA.jsx";
import DashboardCS from "../pages/DashboardCS/DashboardCS.jsx";
import DashboardDA from "../pages/DashboardDA/DashboardDA.jsx";
import DashboardDI from "../pages/DashboardDI/DashboardDI.jsx";
import DashboardSG from "../pages/DashboardSG/DashboardSG.jsx";
import DashboardCE from "../pages/DashboardCE/DashboardCE.jsx";

// Super Admin (DashboardAdmin)
import SADashboard from "../pages/DashboardAdmin/SADashboard.jsx";
import SAInstitutions from "../pages/DashboardAdmin/SAInstitutions.jsx";
import SAAgents from "../pages/DashboardAdmin/SAAgents.jsx";
import SAAcademique from "../pages/DashboardAdmin/SAAcadémique.jsx";
import SAAnalytics from "../pages/DashboardAdmin/SAAnalytics.jsx";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Etudiant */}
      <Route path="/dashboardEtu" element={<Dashboard />} />
      <Route path="/dashboardEtu/nouvelle" element={<NouvelleDemande />} />
      <Route path="/dashboardEtu/demandes" element={<MesDemandes />} />
      <Route path="/dashboardEtu/documents" element={<MesDocuments />} />
      <Route path="/dashboardEtu/profil" element={<MonProfil />} />

      {/* Dashboards rôles */}
      <Route path="/dashboardsa" element={<DashboardSA />} />
      <Route path="/dashboardsc" element={<DashboardCS />} />
      <Route path="/dashboardda" element={<DashboardDA />} />
      <Route path="/dashboarddi" element={<DashboardDI />} />
      <Route path="/dashboardsg" element={<DashboardSG />} />
      <Route path="/dashboardce" element={<DashboardCE />} />

      {/* Super Admin */}
      <Route path="/superadmin" element={<SADashboard />} />
      <Route path="/superadmin/institutions" element={<SAInstitutions />} />
      <Route path="/superadmin/agents" element={<SAAgents />} />
      <Route path="/superadmin/academique" element={<SAAcademique />} />
      <Route path="/superadmin/analytics" element={<SAAnalytics />} />
    </Routes>
  );
};

export default Router;
