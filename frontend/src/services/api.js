// src/services/api.js
import axios from "axios";

// VITE_API_URL must NOT include trailing `/api`
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ================================
   SESSION / TOKEN
================================ */
export const getToken = () =>
  localStorage.getItem("etudocs_token") || localStorage.getItem("token");

export const clearSession = () => {
  localStorage.removeItem("etudocs_token");
  localStorage.removeItem("token");
  localStorage.removeItem("etudocs_user");
};

/* ================================
   AXIOS INSTANCE (optional use)
================================ */
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

/* ================================
   LOW-LEVEL FETCH HELPERS
================================ */

const buildHeaders = ({ json = true, extraHeaders = {} } = {}) => {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...extraHeaders,
  };
  return headers;
};

const parseErrorMessage = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : {};
  return data?.message || "Erreur API";
};

const handleUnauthorized = () => {
  clearSession();
  throw new Error("UNAUTHORIZED");
};

/**
 * JSON request helper
 */
const apiRequest = async (endpoint, { method = "GET", body, headers } = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: buildHeaders({ json: true, extraHeaders: headers }),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) return handleUnauthorized();

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new Error(msg);
  }

  return res.json().catch(() => ({}));
};

/**
 * FormData request helper (no JSON content-type)
 */
const apiForm = async (endpoint, formData, { method = "POST", headers } = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: buildHeaders({ json: false, extraHeaders: headers }),
    body: formData,
  });

  if (res.status === 401) return handleUnauthorized();

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    throw new Error((data && data.message) || "Erreur API");
  }

  return data;
};

/**
 * Blob download helper
 */
const apiBlob = async (endpoint, { headers } = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: buildHeaders({ json: false, extraHeaders: headers }),
  });

  if (res.status === 401) return handleUnauthorized();

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new Error(msg);
  }

  return res.blob();
};

/* ================================
   AUTH
================================ */
export const getMe = async () => {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: buildHeaders({ json: false }),
  });

  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("SERVER_ERROR");

  return res.json();
};

/* ================================
   DEMANDES
================================ */
export const getDemandes = async () => apiRequest("/api/demandes");

export const getDemandeById = async (id) => apiRequest(`/api/demandes/${id}`);

export const avancerDemande = async (id, action, commentaire = "") => {
  const body = { action };
  if (commentaire) body.commentaire = commentaire;
  return apiRequest(`/api/demandes/${id}/avancer`, { method: "POST", body });
};

export const submitDemande = async ({
  typeDocument,
  semestre,
  semestres, // si tu veux envoyer plusieurs
  CIP,
  QUITTANCE,
  ACTE_NAISSANCE,
  JUSTIFICATIF_INSCRIPTION,
}) => {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const form = new FormData();
  form.append("typeDocument", typeDocument);

  // Compat: ton backend parse "semestres" (array) mais tu envoyais "semestre"
  if (Array.isArray(semestres)) {
    semestres.forEach((s) => form.append("semestres", String(s)));
  } else if (semestre) {
    form.append("semestres", String(semestre));
  }

  if (CIP) form.append("CIP", CIP);
  if (QUITTANCE) form.append("QUITTANCE", QUITTANCE);
  if (ACTE_NAISSANCE) form.append("ACTE_NAISSANCE", ACTE_NAISSANCE);
  if (JUSTIFICATIF_INSCRIPTION) form.append("JUSTIFICATIF_INSCRIPTION", JUSTIFICATIF_INSCRIPTION);

  return apiForm("/api/demandes", form, { method: "POST" });
};

/* ================================
   DOCUMENTS
================================ */
export const downloadDocumentBlob = async (reference) =>
  apiBlob(`/api/documents/download/${reference}`);

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


export const deleteDocument = async (reference) =>
  apiRequest(`/api/documents/${reference}`, { method: "DELETE" });

/* ================================
   PIECES
================================ */
export const validerPiece = async (pieceId, statut, commentaire = "") =>
  apiRequest(`/api/demandes/pieces/${pieceId}`, {
    method: "PATCH",
    body: { statut, commentaire },
  });

export const getChefDivisionStats = async () =>
  apiRequest("/api/demandes/stats/chef-division");

export const downloadPieceBlob = async (pieceId) =>
  apiBlob(`/api/demandes/pieces/${pieceId}/download`);

/* ================================
   EXPORT DEFAULT (axios instance)
================================ */
export default api;