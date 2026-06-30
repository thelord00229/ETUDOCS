# `middlewares/` — middlewares Express transverses

- `auth.middleware.js` : vérifie le JWT, peuple `req.user`.
- `role.middleware.js` : restreint une route à une liste de rôles.
- `requiresa.middleware.js` : réservé au `SUPER_ADMIN`.
- `rateLimit.middleware.js` : limitation de débit.

À appliquer dans les `*.routes.js` des modules, avant les controllers.
