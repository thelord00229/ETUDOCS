# `backend/src` — rôle de chaque dossier

API REST Express, architecture **feature-based** (`routes → controller → service`).

| Dossier | Rôle |
|---|---|
| `config/` | Configuration technique (instance Prisma, etc.) |
| `constants/` | Énumérations métier partagées (rôles, statuts, types de document, services) |
| `middlewares/` | Middlewares Express transverses : `auth`, `role`, `requiresa`, `rateLimit` |
| `modules/` | Modules métier — **un dossier par domaine**, chacun avec `*.routes.js`, `*.controller.js`, `*.service.js` |
| `services/` | Services techniques transverses, regroupés par domaine : `email/`, `pdf/`, `qrcode/` (chacun embarque ses templates) |
| `utils/` | Helpers purs (`asyncHandler`, `fileUtils`…) |
| `assets/` | Logos & tampons consommés par la génération PDF |
| `server.js` | Point d'entrée : montage des routes et middlewares globaux |

**Règle :** routes minces → controllers minces → toute la logique métier dans les *services*. Voir `../../ARCHITECTURE.md`.
