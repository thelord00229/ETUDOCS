import api from "./api";
import {
  fetchCachedQuery,
  getCachedQuery,
  invalidateQuery,
} from "./queryCache";

const MES_RECLAMATIONS_KEY = "student:mes-reclamations";

export const getCachedMesReclamations = () => getCachedQuery(MES_RECLAMATIONS_KEY);

export const getMesReclamations = ({ force = false } = {}) =>
  fetchCachedQuery(
    MES_RECLAMATIONS_KEY,
    () => api.get("/api/reclamations/mes-reclamations").then((r) => r.data),
    { ttl: 45000, force }
  );

export const getAllReclamations = (params = {}) =>
  api.get("/api/reclamations", { params }).then((r) => r.data);

export const createReclamation = (data) => {
  if (data instanceof FormData) {
    return api.post("/api/reclamations", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => {
      invalidateQuery(MES_RECLAMATIONS_KEY);
      return r.data;
    });
  }
  return api.post("/api/reclamations", data).then((r) => {
    invalidateQuery(MES_RECLAMATIONS_KEY);
    return r.data;
  });
};

export const prendreEnCharge = (id) =>
  api.patch(`/api/reclamations/${id}/prendre-en-charge`).then((r) => r.data);

export const resoudreReclamation = (id, data) =>
  api.patch(`/api/reclamations/${id}/resoudre`, data).then((r) => r.data);

export const getReclamationStats = () =>
  api.get("/api/reclamations/stats").then((r) => r.data);
