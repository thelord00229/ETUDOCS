import axios from 'axios';
// Note: VITE_API_URL should NOT include the trailing `/api` segment.
// All requests below append `/api/...` explicitly so that the base URL
// stays consistent and we avoid double `/api/api` problems.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================================
   TOKEN
================================ */
export const getToken = () => localStorage.getItem("etudocs_token") || localStorage.getItem("token");

export const clearSession = () => {
  localStorage.removeItem("etudocs_token");
  localStorage.removeItem("token");
  localStorage.removeItem("etudocs_user");
};

/* ================================
   GENERIC REQUEST (JSON)
================================ */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    console.warn("401 reçu - session potentiellement expirée");
    throw new Error("UNAUTHORIZED");
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    throw new Error((data && data.message) || "Erreur API");
  }

  return data;
};

/* ================================
   AUTH
================================ */
export const getMe = async () => {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const url = `${API_URL}/api/auth/me`;
  console.log("→ getMe() URL appelée :", url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log("→ getMe() status :", res.status);

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("SERVER_ERROR");
  return res.json();
};



/* ================================
   DEMANDES
================================ */

export const getDemandes = async () => {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/demandes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur chargement");
  return res.json();
};

export const getDemandeById = async (id) => apiRequest(`/api/demandes/${id}`);

export const avancerDemande = async (id, action, commentaire = "") => {
  const body = { action };
  if (commentaire) body.commentaire = commentaire;

  return apiRequest(`/api/demandes/${id}/avancer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export const submitDemande = async ({
  typeDocument,
  semestre,
  CIP,
  QUITTANCE,
  ACTE_NAISSANCE,
  JUSTIFICATIF_INSCRIPTION,
}) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const form = new FormData();
  form.append("typeDocument", typeDocument);
  if (semestre) form.append("semestre", String(semestre));

  if (CIP) form.append("CIP", CIP);
  if (QUITTANCE) form.append("QUITTANCE", QUITTANCE);
  if (ACTE_NAISSANCE) form.append("ACTE_NAISSANCE", ACTE_NAISSANCE);
  if (JUSTIFICATIF_INSCRIPTION) form.append("JUSTIFICATIF_INSCRIPTION", JUSTIFICATIF_INSCRIPTION);

  const res = await fetch(`${API_URL}/api/demandes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (res.status === 401) {
    clearSession();
    throw new Error("UNAUTHORIZED");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Erreur API");
  return data;
};

/* ================================
   DOCUMENTS
================================ */

export const downloadDocumentBlob = async (reference) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/documents/download/${reference}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearSession();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : {};
    throw new Error(data?.message || "Erreur téléchargement");
  }

  return await res.blob();
};

export const downloadDocument = async (reference, filename) => {
  const blob = await downloadDocumentBlob(reference);

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${reference}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ✅ Suppression définitive d'un document (déclenché après limite atteinte)
export const deleteDocument = async (reference) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/documents/${reference}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearSession();
    throw new Error("UNAUTHORIZED");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Erreur suppression");
  return data;
};

export const validerPiece = async (pieceId, statut, commentaire = "") => {
  return apiRequest(`/api/demandes/pieces/${pieceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut, commentaire }),
  });
};

export const getChefDivisionStats = async () =>
  apiRequest("/api/demandes/stats/chef-division");

export const downloadPieceBlob = async (pieceId) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/demandes/pieces/${pieceId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearSession();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : {};
    throw new Error(data?.message || "Erreur téléchargement pièce");
  }

  return await res.blob();
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('etudocs_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 reçu - session potentiellement expirée");
      localStorage.removeItem('etudocs_token');
      localStorage.removeItem('token');
      localStorage.removeItem('etudocs_user');
    }
    return Promise.reject(error);
  }
);

export default api;