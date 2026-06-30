import { useQuery } from "@tanstack/react-query";
import {
  getMe,
  getDemandes,
  getCachedMe,
  getCachedDemandes,
  getStatsSG,
  getStatsDA,
  getStatsDI,
  getChefDivisionStats,
} from "../services/api";
import {
  getMesReclamations,
  getCachedMesReclamations,
} from "../services/reclamation.service";
import api from "../services/api";
import { getDashboard, getAgents } from "../services/admin.service";

// queryFn force l'appel réseau ; c'est React Query (staleTime) qui décide QUAND il s'exécute.
// placeholderData = affichage instantané depuis le cache sessionStorage existant.

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => getMe({ force: true }),
    placeholderData: () => getCachedMe() || undefined,
  });

export const useDemandes = (options = {}) =>
  useQuery({
    queryKey: ["demandes"],
    queryFn: () => getDemandes({ force: true }),
    placeholderData: () => getCachedDemandes() ?? undefined,
    ...options,
  });

export const useMesReclamations = () =>
  useQuery({
    queryKey: ["reclamations"],
    queryFn: () => getMesReclamations({ force: true }),
    placeholderData: () => getCachedMesReclamations() ?? undefined,
  });

export const useStatsSG = () =>
  useQuery({ queryKey: ["statsSG"], queryFn: getStatsSG });

export const useStatsDA = () =>
  useQuery({ queryKey: ["statsDA"], queryFn: getStatsDA });

export const useStatsDI = () =>
  useQuery({ queryKey: ["statsDI"], queryFn: getStatsDI });

export const useChefDivisionStats = () =>
  useQuery({ queryKey: ["statsChefDivision"], queryFn: getChefDivisionStats });

// ── Admin / Super-admin ──
// getDashboard() et getAgents() renvoient la réponse axios complète → on déballe .data
export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => getDashboard().then((r) => r.data),
  });

export const useAgents = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: () => getAgents().then((r) => r.data),
  });

export const useInstitutions = () =>
  useQuery({
    queryKey: ["institutions"],
    queryFn: () => api.get("/api/institutions").then((r) => r.data),
  });

export const useDocuments = () =>
  useQuery({
    queryKey: ["documents"],
    queryFn: () => api.get("/api/documents").then((r) => r.data || []),
  });
