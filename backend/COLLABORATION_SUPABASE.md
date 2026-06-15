# Collaboration Supabase - EtuDocs

## MIGRATION TERMINEE

Base de donnees : Supabase
Date de migration : 14/06/2026
La base Supabase est la seule base officielle du projet. Ne pas tenter de revenir en arriere.

Ce guide decrit la configuration commune pour travailler sur EtuDocs avec Supabase PostgreSQL.

## Acces au projet Supabase

1. Demander une invitation au proprietaire du projet Supabase EtuDocs.
2. Se connecter a https://supabase.com/dashboard.
3. Ouvrir le projet EtuDocs, puis verifier l'acces aux sections Database, Table Editor, SQL Editor et Project Settings.
4. Recuperer les informations de connexion dans Project Settings > Database > Connection string.
5. Utiliser le pooler transactionnel pour `DATABASE_URL` et une connexion directe ou session pooler pour `DIRECT_URL`.

Format attendu :

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
```

Remplacer `[PASSWORD]` par le mot de passe de base de donnees, `[PROJECT_REF]` par la reference du projet Supabase et `[REGION]` par la region du pooler.

## Roles et permissions

- Owner : gere la facturation, les integrations, les secrets et les permissions.
- Administrator : gere la base, les migrations et les parametres techniques.
- Developer : consulte les tables, execute des requetes SQL et travaille sur les migrations.
- Read-only : consulte les donnees sans modification.

Les migrations Prisma doivent etre lancees uniquement par un membre designe pour eviter les executions concurrentes.

## Configuration .env par developpeur

1. Copier `backend/.env.supabase.example` vers `backend/.env`.
2. Remplacer `DATABASE_URL` avec la connexion Supabase personnelle ou partagee par l'equipe.
3. Remplacer `DIRECT_URL` avec la connexion directe ou session pooler utilisee par Prisma Migrate.
4. Remplir les variables sensibles locales : `JWT_SECRET`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `MAIL_FROM`.
5. Ne jamais commiter `backend/.env`, `backend/.env.supabase` ou un dump SQL.

## Commandes quotidiennes

Depuis `backend` :

```bash
npm install
npx prisma generate
node scripts/verify-supabase.js
npm run dev
```

Pour appliquer les migrations sur Supabase :

```bash
node scripts/migrate-supabase.js
```

Commandes Prisma utiles :

```bash
npx prisma migrate deploy
npx prisma migrate status
npx prisma studio
npm run seed
```

## Workflow d'equipe

1. Creer ou modifier les migrations Prisma en local.
2. Relire `backend/prisma/schema.prisma` sans modifier les models hors du besoin fonctionnel.
3. Ouvrir une pull request avec les fichiers de migration.
4. Une seule personne applique `npx prisma migrate deploy` sur Supabase apres validation.
5. Tous les developpeurs executent ensuite `npx prisma generate`.

## Depannage

### `DATABASE_URL est absente du fichier .env`

Verifier que `backend/.env` existe et contient une ligne `DATABASE_URL=...` non commentee.

### `DATABASE_URL contient encore les placeholders`

Remplacer `[PASSWORD]` et `[PROJECT_REF]` dans `backend/.env`.

### `P1001: Can't reach database server`

Verifier la connexion internet, le project ref Supabase, le port `5432` et `sslmode=require`.

### `prepared statement "s0" already exists`

Cette erreur arrive quand Prisma utilise le pooler transactionnel Supabase sans configuration PgBouncer, ou quand Prisma Migrate passe par le port `6543`. Verifier que `DATABASE_URL` contient `pgbouncer=true` et que `DIRECT_URL` utilise la connexion directe ou le pooler de session en port `5432`.

### `password authentication failed`

Verifier le mot de passe Database dans Supabase. Ne pas confondre le mot de passe du compte Supabase et celui de PostgreSQL.

### `P3009` ou migration echouee

Executer :

```bash
npx prisma migrate status
```

Identifier la migration en erreur, corriger la cause, puis relancer `node scripts/migrate-supabase.js`.

### `permission denied for schema public`

Verifier que l'utilisateur PostgreSQL utilise par `DATABASE_URL` a les droits necessaires. Pour les migrations, utiliser le role recommande par l'equipe.

### Tables absentes apres connexion OK

La base est accessible mais les migrations n'ont pas encore ete appliquees. Lancer :

```bash
node scripts/migrate-supabase.js
```

## Verification finale

Avant de demarrer le backend, executer :

```bash
node scripts/verify-supabase.js
```

Le rapport doit afficher `OK Connexion etablie` et la liste des tables du schema `public`.
