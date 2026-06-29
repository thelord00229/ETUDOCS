# `constants/` — énumérations métier partagées

Valeurs de référence utilisées côté backend (et alignées avec le frontend) :
- `roles.js` : les 7 rôles (`ETUDIANT` → `SUPER_ADMIN`).
- `statuts.js` : états du workflow d'une demande / d'un document.
- `typeDocument.js` : types de documents (`ATTESTATION_INSCRIPTION`, `RELEVE_NOTES`…).
- `services.js` : services cibles (`EXAMENS`, `SCOLARITE`…).

Importer ces constantes plutôt que de coder les chaînes en dur.
