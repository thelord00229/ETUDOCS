// frontend/src/services/admin.service.js
import api from "./api";

/* ================================
   GESTION DES AGENTS (SUPER_ADMIN)
================================ */

// ✅ GET /api/agents
export const getAgents = () => {
  return api.get("/api/agents");
};

// ✅ POST /api/agents
export const createAgent = (agentData) => {
  return api.post("/api/agents", agentData);
};

// ✅ PATCH /api/agents/:userId/toggle
export const toggleAgentActif = (userId) => {
  return api.patch(`/api/agents/${userId}/toggle`);
};

// ✅ DELETE /api/agents/:id
export const deleteAgent = (id) => {
  return api.delete(`/api/agents/${id}`);
};

// ✅ POST /api/agents/:id/email
export const sendMailToAgent = (id, payload) => {
  return api.post(`/api/agents/${id}/email`, payload);
};

/* ================================
   GESTION DES INSTITUTIONS (SUPER_ADMIN)
================================ */

// ✅ PUT /api/admin/institutions/:institutionId
export const updateInstitution = (institutionId, data) => {
  return api.put(`/api/admin/institutions/${institutionId}`, data);
};

// ✅ GET /api/admin/institutions
export const getInstitutions = () => {
  return api.get("/api/admin/institutions");
};

/* ================================
   STATISTIQUES (SUPER_ADMIN)
================================ */

// ✅ GET /api/admin/statistiques?institutionId=...
export const getStatistiques = (institutionId) => {
  return api.get("/api/admin/statistiques", { params: { institutionId } });
};

// ✅ GET /api/admin/analytics/sla
export const getSlaEvolution = ({ days = 20, institution = "ALL", docType = "ALL" } = {}) => {
  return api.get("/api/admin/analytics/sla", {
    params: { days, institution, docType },
  });
};

/* ================================
   IMPORT
================================ */

// ✅ POST /api/admin/import-notes
export const importNotes = (formData) => {
  return api.post("/api/admin/import-notes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ GET /api/admin/dashboard
export const getDashboard = () => {
  return api.get("/api/admin/dashboard");
};