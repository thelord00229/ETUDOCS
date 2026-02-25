import api from './api';

// Gestion des agents
export const getAgents = (institutionId) => {
  return api.get('/api/admin/agents', { params: { institutionId } });
};

export const createAgent = (agentData) => {
  return api.post('/api/admin/agents', agentData);
};

export const toggleAgentActif = (userId) => {
  return api.patch(`/api/admin/agents/${userId}/toggle`);
};

// Gestion des institutions
export const updateInstitution = (institutionId, data) => {
  return api.put(`/api/admin/institutions/${institutionId}`, data);
};

export const getInstitutions = () => {
  // Si pas de route dédiée, on peut récupérer depuis /institutions (à créer)
  return api.get('/api/institutions'); // à implémenter côté backend si nécessaire
};

// Statistiques
export const getStatistiques = (institutionId) => {
  return api.get('/api/admin/statistiques', { params: { institutionId } });
};

// Import Excel (à adapter selon le backend)
export const importNotes = (formData) => {
  return api.post('/api/admin/import-notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};