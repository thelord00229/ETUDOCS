import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/DashboardEtudiant/Dashboard.jsx";

const Router = () => {
        return (
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/register" element={<Register/>}></Route>
                <Route path="/dashboardEtu" element={<Dashboard/>}></Route>
            </Routes>
        );
};

export default Router;