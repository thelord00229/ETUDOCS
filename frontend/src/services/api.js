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
export const getMe = async () => apiRequest("/api/auth/me");

/* ================================
   DEMANDES
================================ */

// ✅ Liste des demandes
export const getDemandes = async () => apiRequest("/api/demandes");

// ✅ Détail d'une demande
export const getDemandeById = async (id) => apiRequest(`/api/demandes/${id}`);

// ✅ Avancer dans le workflow (agents)
// action : "TRANSMETTRE" | "DEMANDER_CORRECTION" | ...
// commentaire : requis si DEMANDER_CORRECTION
export const avancerDemande = async (id, action, commentaire = "") => {
  const body = { action };
  if (commentaire) body.commentaire = commentaire;

  return apiRequest(`/api/demandes/${id}/avancer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

// ✅ Soumettre une demande (multipart)
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
    headers: { Authorization: `Bearer ${token}` }, // pas de Content-Type ici
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

// ✅ Option A : récupérer juste le Blob
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

// ✅ Option B : télécharger DIRECTEMENT
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

export const validerPiece = async (pieceId, statut, commentaire = "") => {
  return apiRequest(`/api/demandes/pieces/${pieceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut, commentaire }),
  });
};

export const getChefDivisionStats = async () =>
  apiRequest("/api/demandes/stats/chef-division");

// ✅ Télécharger une pièce jointe (CIP/Quittance...) en blob
export const downloadPieceBlob = async (pieceId) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  // ⚠️ Endpoint à adapter si ton backend a un autre chemin
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