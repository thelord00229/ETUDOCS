/**
 * Route du tableau de bord par défaut selon le rôle (et le service pour CHEF_DIVISION).
 * Source de vérité partagée entre la redirection post-login et le guard de routes.
 * @param {{ role?: string, service?: string }} user
 * @returns {string}
 */
export const routeForUser = (user) => {
  const role = user?.role;
  if (role === "ETUDIANT")            return "/dashboardEtu";
  if (role === "SUPER_ADMIN")         return "/superadmin";
  if (role === "SECRETAIRE_ADJOINT")  return "/dashboardsa";
  if (role === "SECRETAIRE_GENERAL")  return "/dashboardsg";
  if (role === "CHEF_DIVISION") {
    return user?.service === "SCOLARITE" ? "/dashboardsc" : "/dashboardce";
  }
  if (role === "DIRECTEUR_ADJOINT")   return "/dashboardda";
  if (role === "DIRECTEUR")           return "/dashboarddi";
  return "/dashboardsa";
};
