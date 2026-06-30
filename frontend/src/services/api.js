// src/services/api.js
import axios from "axios";
import {
  clearQueryCache,
  fetchCachedQuery,
  getCachedQuery,
  invalidateQuery,
  setCachedQuery,
} from "./queryCache";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ================================
   SESSION / TOKEN
================================ */
export const getToken = () =>
  localStorage.getItem("etudocs_token") ||
  sessionStorage.getItem("etudocs_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

export const getStoredUser = () => {
  const raw =
    localStorage.getItem("etudocs_user") ||
    sessionStorage.getItem("etudocs_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeInst = (v) =>
  String(v || "")
    .trim()
    .toUpperCase();

export const getInstitutionCode = () => {
  const u = getStoredUser();
  const code =
    normalizeInst(u?.institutionCode) ||
    normalizeInst(u?.institution?.sigle) ||
    normalizeInst(u?.institutionId);
  if (code) return code;
  return (
    normalizeInst(localStorage.getItem("etudocs_institution")) ||
    normalizeInst(sessionStorage.getItem("etudocs_institution")) ||
    null
  );
};

export const setSession = ({ token, user }) => {
  const previousToken = getToken();
  if (token && previousToken && previousToken !== token) {
    clearQueryCache();
  }
  if (token) {
    localStorage.setItem("etudocs_token", token);
    sessionStorage.setItem("etudocs_token", token);
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
  }
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem("etudocs_user", serialized);
    sessionStorage.setItem("etudocs_user", serialized);
    const code =
      normalizeInst(user?.institutionCode) ||
      normalizeInst(user?.institution?.sigle) ||
      normalizeInst(user?.institutionId) ||
      null;
    if (code) {
      localStorage.setItem("etudocs_institution", code);
      sessionStorage.setItem("etudocs_institution", code);
    }
    setCachedQuery("auth:me", user);
  }
};

// ✅ Avancer un document (DA / Directeur)
export const avancerDocument = async (reference, action, commentaire = "") => {
  const body = { action };
  if (commentaire) body.commentaire = commentaire;
  return apiRequest(`/api/documents/${reference}/avancer`, {
    method: "POST",
    body,
  });
};

// Redirige vers /login une seule fois quand la session expire (401),
// sauf si l'on est déjà sur une page publique (évite les boucles).
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (PUBLIC_PATHS.includes(path) || path.startsWith("/auth/verify")) return;
  window.location.assign("/login?expired=1");
};

export const clearSession = () => {
  clearQueryCache();
  localStorage.removeItem("etudocs_token");
  localStorage.removeItem("token");
  localStorage.removeItem("etudocs_user");
  localStorage.removeItem("etudocs_institution");
  sessionStorage.removeItem("etudocs_token");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("etudocs_user");
  sessionStorage.removeItem("etudocs_institution");
};

/* ================================
   AXIOS INSTANCE
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
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

/* ================================
   LOW-LEVEL FETCH HELPERS
================================ */
const buildHeaders = ({ json = true, extraHeaders = {} } = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...extraHeaders,
  };
};

const parseErrorMessage = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : {};
  return data?.message || "Erreur API";
};

const handleUnauthorized = () => {
  clearSession();
  redirectToLogin();
  throw new Error("UNAUTHORIZED");
};

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

const apiForm = async (
  endpoint,
  formData,
  { method = "POST", headers } = {}
) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: buildHeaders({ json: false, extraHeaders: headers }),
    body: formData,
  });
  if (res.status === 401) return handleUnauthorized();
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new Error((data && data.message) || "Erreur API");
  return data;
};

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
export const login = async ({ email, password }) => {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (data?.token) setSession({ token: data.token, user: data.user });
  return data;
};

export const register = async (payload) =>
  apiRequest("/api/auth/register", { method: "POST", body: payload });

// ── Réinitialisation de mot de passe ──
export const requestPasswordReset = (email) =>
  apiRequest("/api/auth/reset-password", { method: "POST", body: { email } });

export const resetPassword = ({ email, code, newPassword }) =>
  apiRequest("/api/auth/reset-password/confirm", {
    method: "POST",
    body: { email, code, newPassword },
  });

// ── Vérification de l'email (lien reçu à l'inscription) ──
export const verifyEmail = ({ token, email }) =>
  apiRequest(
    `/api/auth/verify/${token}?email=${encodeURIComponent(email)}`
  );

export const getCachedMe = () => getCachedQuery("auth:me") || getStoredUser();

export const getMe = async ({ force = false } = {}) => {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  return fetchCachedQuery(
    "auth:me",
    async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: buildHeaders({ json: false }),
      });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("SERVER_ERROR");
      const me = await res.json();
      if (me) setSession({ token, user: me });
      return me;
    },
    { ttl: 120000, force }
  );
};

/* ================================
   DEMANDES
================================ */
export const getCachedDemandes = () => getCachedQuery("student:demandes");

export const invalidateStudentData = () => {
  invalidateQuery("student:demandes");
  invalidateQuery("student:mes-reclamations");
};

export const getDemandes = async ({ force = false } = {}) =>
  fetchCachedQuery("student:demandes", () => apiRequest("/api/demandes"), {
    ttl: 45000,
    force,
  });

export const getDemandeById = async (id) => apiRequest(`/api/demandes/${id}`);

export const getStatsSG = () =>
  api.get("/api/demandes/stats/secretaire-general").then((r) => r.data);

// ✅ Stats Directeur Adjoint
export const getStatsDA = () =>
  apiRequest("/api/demandes/stats/directeur-adjoint");

// ✅ Stats Directeur
export const getStatsDI = () => apiRequest("/api/demandes/stats/directeur");

export const avancerDemande = async (id, action, commentaire = "") => {
  const body = { action };
  if (commentaire) body.commentaire = commentaire;
  return apiRequest(`/api/demandes/${id}/avancer`, { method: "POST", body });
};

export const submitDemande = async ({
  typeDocument,
  semestre,
  semestres,
  anneeAcademique,
  CIP,
  QUITTANCE,
  ACTE_NAISSANCE,
  JUSTIFICATIF_INSCRIPTION,
}) => {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const form = new FormData();
  form.append("typeDocument", typeDocument);
  if (anneeAcademique) form.append("anneeAcademique", anneeAcademique);

  if (Array.isArray(semestres)) {
    semestres.forEach((s) =>
      form.append("semestres", String(s).replace("S", ""))
    );
  } else if (semestre) {
    form.append("semestres", String(semestre));
  }

  if (CIP) form.append("CIP", CIP);
  if (QUITTANCE) form.append("QUITTANCE", QUITTANCE);
  if (ACTE_NAISSANCE) form.append("ACTE_NAISSANCE", ACTE_NAISSANCE);
  if (JUSTIFICATIF_INSCRIPTION)
    form.append("JUSTIFICATIF_INSCRIPTION", JUSTIFICATIF_INSCRIPTION);

  const data = await apiForm("/api/demandes", form, { method: "POST" });
  invalidateStudentData();
  return data;
};

/* ================================
   DOCUMENTS
================================ */
// Téléchargement (incrémente le compteur, réservé à l'étudiant)
export const downloadDocumentBlob = async (reference) =>
  apiBlob(`/api/documents/download/${reference}`);

// ✅ Preview inline (sans compteur, réservé aux agents)
export const previewDocumentBlob = async (reference) =>
  apiBlob(`/api/documents/preview/${reference}`);

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

export const resendDocumentEmail = async (reference) =>
  apiRequest(`/api/documents/resend-email/${reference}`, { method: "POST" });

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
   NOTIFICATIONS
================================ */
export const getNotifications = () => apiRequest("/api/notifications");

export const markAllNotificationsRead = () =>
  apiRequest("/api/notifications/read-all", { method: "PATCH" });

export const deleteNotification = (id) =>
  apiRequest(`/api/notifications/${id}`, { method: "DELETE" });

export const deleteAllNotifications = () =>
  apiRequest("/api/notifications", { method: "DELETE" });

/* ================================
   EXPORT DEFAULT (axios instance)
================================ */
export default api;
