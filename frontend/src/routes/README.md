# `routes/` — routage

- `Router.jsx` : arbre des routes (React Router v6), avec `lazy()` pour le code-splitting.
- `routeModules.js` : table `chemin → import()` paresseux des pages.

Pour ajouter une page : créer le composant dans `../pages/`, ajouter son import dans `routeModules.js`, puis la `<Route>` dans `Router.jsx`.
