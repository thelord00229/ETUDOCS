# `services/` — accès API & cache

Couche d'appel réseau, consommée par les hooks (`../hooks/`) et les pages :
- `api.js` : client HTTP (axios/fetch) + helpers (`apiBlob`, invalidation de cache…).
- `queryCache.js` : cache léger côté client.
- `admin.service.js`, `reclamation.service.js` : appels groupés par domaine.

Ne pas mettre de logique d'affichage ici ; uniquement la communication avec l'API.
