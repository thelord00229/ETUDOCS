import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/DashboardEtudiant/Dashboard.jsx";
import NouvelleDemande from "../pages/DashboardEtudiant/NouvelleDemande.jsx";
import MesDemandes from "../pages/DashboardEtudiant/MesDemandes.jsx";
import MesDocuments from "../pages/DashboardEtudiant/MesDocuments.jsx";
import MonProfil from "../pages/DashboardEtudiant/MonProfil.jsx";


const Router = () => {
        return (
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/register" element={<Register/>}></Route>
                <Route path="/dashboardEtu" element={<Dashboard/>}></Route>
                <Route path="/dashboardEtu/nouvelle"  element={<NouvelleDemande />} />
                <Route path="/dashboardEtu/demandes"  element={<MesDemandes />} />
                <Route path="/dashboardEtu/documents" element={<MesDocuments />} />
                <Route path="/dashboardEtu/profil"    element={<MonProfil />} />
            </Routes>
        );
};

export default Router;