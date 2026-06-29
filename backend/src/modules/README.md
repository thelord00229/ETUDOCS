# `modules/` — domaines métier

Un dossier par domaine, chacun suivant le pattern `routes → controller → service` :
- `*.routes.js` : déclaration des endpoints + middlewares (auth/rôle).
- `*.controller.js` : adaptation HTTP (lecture `req`, réponses, délégation).
- `*.service.js` : logique métier et accès base (Prisma).

Modules : `auth`, `demande`, `document`, `admin`, `agent`, `institution`, `utilisateur`, `notification`, `reclamation`, `verify` (public), `workflow` (machine à états du circuit de validation).

Pour ajouter un domaine : créer `modules/<feature>/` avec les 3 fichiers et monter le routeur dans `server.js`.
