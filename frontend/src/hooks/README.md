# `hooks/` — hooks React personnalisés

- `queries.js` : couche de data-fetching via **React Query** (source unique pour lire les données serveur). À privilégier — ne pas utiliser `useEffect + fetch` dans le nouveau code.
- `useNotifications.js` : notifications in-app.
- `useToast.js` : toasts UI.
