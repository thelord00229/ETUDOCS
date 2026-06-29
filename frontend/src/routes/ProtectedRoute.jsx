import { Navigate, useLocation } from "react-router-dom";
import { getToken, getStoredUser } from "../services/api";
import { routeForUser } from "../utils/roleRoutes";

/**
 * Garde de route : exige une session valide, et optionnellement un rôle autorisé.
 * - Pas de token / pas d'utilisateur → redirige vers /login.
 * - Rôle non autorisé → redirige vers le tableau de bord propre à l'utilisateur.
 *
 * @param {{ roles?: string[], children: React.ReactNode }} props
 */
export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={routeForUser(user)} replace />;
  }

  return children;
}
