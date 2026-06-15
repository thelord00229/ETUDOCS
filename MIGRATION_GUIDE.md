# Guide de migration - Reclamations et paiements de telechargement

## Commandes Prisma

Depuis `backend/` :

```bash
npx prisma migrate dev
npx prisma generate
```

En production Neon :

```bash
npx prisma migrate deploy
npx prisma generate
```

## Seeds

Aucun seed obligatoire.

Verifier cependant que les comptes agents suivants existent pour tester les interfaces :

- `SECRETAIRE_GENERAL`
- `SECRETAIRE_ADJOINT`
- `CHEF_DIVISION`
- `SUPER_ADMIN`

## Variables d'environnement

Optionnelle :

```env
COMPTE_TRESOR_DEFAULT=BJ6600100100000104477437
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

`COMPTE_TRESOR_DEFAULT` est utilise pour generer l'URL de paiement si l'institution n'a pas de compte Tresor configure.

## Tests manuels

1. Se connecter comme etudiant.
2. Aller dans `Mes documents`.
3. Cliquer sur `Reclamer` sur un document disponible.
4. Soumettre une reclamation avec description de 20 caracteres minimum.
5. Se connecter comme `SECRETAIRE_GENERAL`.
6. Ouvrir `/dashboardsg/reclamations`.
7. Prendre en charge la reclamation.
8. Resoudre avec `Expliquer sans doc`.
9. Repeter avec `Regenerer document` et verifier qu'un nouveau document est cree.
10. Epuiser le quota d'un document puis cliquer `Payer a nouveau`.
11. Verifier la redirection vers le Tresor.
12. Aller dans `Mes paiements`, uploader une quittance.
13. Se connecter comme `SECRETAIRE_ADJOINT` ou `SECRETAIRE_GENERAL`.
14. Ouvrir `/dashboardsg/paiements`.
15. Valider la quittance et verifier que `downloadCount` repasse a `0` et que `maxDownloads` augmente de `3`.
16. Tester aussi le rejet de quittance.

## Verification technique

Commandes deja executees :

```bash
npx prisma validate --schema prisma/schema.prisma
npm test -- --runInBand
npm run build
```
