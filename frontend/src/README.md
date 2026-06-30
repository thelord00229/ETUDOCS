# `frontend/src` — rôle de chaque dossier

SPA React (Vite). Alias `@` → `src/` (voir `vite.config.js` / `jsconfig.json`).

| Dossier | Rôle |
|---|---|
| `routes/` | Déclaration des routes (`Router.jsx`) et lazy-loading (`routeModules.js`) |
| `pages/` | Composants de niveau route, regroupés par dashboard/rôle (`DashboardEtudiant/`, `DashboardAdmin/`…) |
| `components/` | Composants UI réutilisables, regroupés par zone |
| `hooks/` | Hooks React personnalisés (React Query, notifications, toast) |
| `services/` | Accès API & cache : `api.js`, `queryCache.js`, services métier |
| `utils/` | Helpers purs |
| `assets/` | `logo.png`/`react.svg` (marque) · `logos/` (institutions) · `screenshots/` (landing) |

**Conventions :** data-fetching via les hooks React Query (`hooks/queries.js`), pas de `useEffect + fetch`. Pour le nouveau code, importer via l'alias `@` plutôt que des chemins relatifs profonds. Voir `../../ARCHITECTURE.md`.
