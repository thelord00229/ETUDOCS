const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ================================
   TOKEN
================================ */
export const getToken = () => localStorage.getItem("etudocs_token");

export const clearSession = () => {
  localStorage.removeItem("etudocs_token");
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
    clearSession();
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
export const getMe = async () => apiRequest("/api/auth/me");

/* ================================
   DEMANDES
================================ */

// ✅ Liste des demandes
export const getDemandes = async () => apiRequest("/api/demandes");

// ✅ Détail d’une demande
export const getDemandeById = async (id) => apiRequest(`/api/demandes/${id}`);

// ✅ Soumettre une demande (multipart: CIP + QUITTANCE)
export const submitDemande = async ({ typeDocument, semestre, CIP, QUITTANCE }) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const form = new FormData();
  form.append("typeDocument", typeDocument);
  if (semestre) form.append("semestre", String(semestre));
  if (CIP) form.append("CIP", CIP);
  if (QUITTANCE) form.append("QUITTANCE", QUITTANCE);

  const res = await fetch(`${API_URL}/api/demandes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // ❌ surtout pas Content-Type ici
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

// ✅ Télécharger un PDF (si tu veux gérer ça côté front plus tard)
export const downloadDocument = async (reference) => {
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
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Erreur téléchargement");
  }

  return res.blob(); // le PDF en blob
};