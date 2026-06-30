# Architecture — ETUDOCS

Monorepo full-stack de gestion administrative académique : un étudiant demande un document officiel, qui suit un circuit de validation multi-niveaux, est généré en PDF signé, puis **livré par email** (le PDF n'est pas conservé sur le serveur).

```
ETUDOCS/
├── backend/      API REST Node.js + Express + Prisma (PostgreSQL)
└── frontend/     SPA React (Vite)
```

## Backend (`backend/src`)

Architecture **feature-based** : chaque domaine métier est un *module* auto-contenu suivant le trio `routes → controller → service`. Les couches transverses (config, middlewares, services techniques) sont partagées.

```
backend/src/
├── server.js          Point d'entrée Express (montage des routes, middlewares globaux)
├── config/            Configuration technique (client Prisma…)
├── constants/         Énumérations métier (rôles, statuts, types de document, services)
├── middlewares/       Middlewares Express transverses (auth, rôles, rate-limit)
├── modules/           Modules métier — un dossier par domaine
│   └── <feature>/     <feature>.routes.js → .controller.js → .service.js
├── services/          Services techniques transverses, regroupés par domaine
│   ├── email/         email.service.js + templates/ (*.ejs)
│   ├── pdf/           pdf.service.js + templates/ (HTML/JS de génération)
│   └── qrcode/        qrcode.service.js
├── utils/             Helpers purs (asyncHandler, fileUtils…)
└── assets/            Logos & tampons utilisés par la génération PDF
```

**Règle de couches :** une route est mince (validation + délégation), un controller est mince (orchestration HTTP), toute la logique métier vit dans le *service*. Les services techniques (`services/email|pdf|qrcode`) ne connaissent pas le HTTP.

**Modules :** `auth`, `demande`, `document`, `admin`, `agent`, `institution`, `utilisateur`, `notification`, `reclamation`, `verify` (public, sans auth), `workflow` (machine à états de validation).

## Frontend (`frontend/src`)

```
frontend/src/
├── main.jsx / App.jsx   Bootstrap React
├── routes/              Définition des routes (Router.jsx) + lazy-loading (routeModules.js)
├── pages/               Composants de niveau route, regroupés par dashboard/rôle
├── components/          Composants UI réutilisables, regroupés par zone
├── hooks/               Hooks React personnalisés (React Query, notifications, toast)
├── services/            Accès API & cache (api.js, queryCache.js, *.service.js)
├── utils/               Helpers purs
├── styles (index.css, App.css)
└── assets/
    ├── logo.png, react.svg   Marque principale (racine)
    ├── logos/                Logos d'institutions (IFRI, EPAC, FSS…)
    └── screenshots/          Captures affichées sur la landing page
```

**Alias d'import :** `@` pointe vers `src/` (configuré dans `vite.config.js` + `jsconfig.json`).
Convention pour le **nouveau code** : `import X from "@/components/..."` plutôt que des `../../..` relatifs.

**Données :** le data-fetching passe par les hooks React Query (`src/hooks/queries.js`) — ne pas utiliser `useEffect + fetch` dans le nouveau code.

## Conventions transverses
- Réponses & commentaires en **français**.
- Branches : `feature/`, `fix/`, `refactor/` — jamais de commit direct sur `main`.
- Commits : `type(scope): description` (`feat`, `fix`, `refactor`, `style`, `test`, `chore`, `docs`).
