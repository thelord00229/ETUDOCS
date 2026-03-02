import api from './api';

// Gestion des agents
export const getAgents = (institutionId) => {
  return api.get('/api/admin/agents', { params: { institutionId } });
};

export const createAgent = (agentData) => {
  return api.post('/api/agents', agentData);
};

export const toggleAgentActif = (userId) => {
  return api.patch(`/api/agents/${userId}/toggle`);
};

export const deleteAgent = (id) => {
  return api.delete(`/api/agents/${id}`);
};

export const sendMailToAgent = (id, payload) => {
  return api.post(`/api/agents/${id}/email`, payload);
};

// Gestion des institutions
export const updateInstitution = (institutionId, data) => {
  return api.put(`/api/admin/institutions/${institutionId}`, data);
};

export const getInstitutions = () => {
  return api.get('/api/institutions');
};

// Statistiques
export const getStatistiques = (institutionId) => {
  return api.get('/api/admin/statistiques', { params: { institutionId } });
};

// Import Excel
export const importNotes = (formData) => {
  return api.post('/api/admin/import-notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};