# 📄 EtuDocs

> Plateforme web de digitalisation du processus de demande, de traitement et de délivrance des documents administratifs universitaires à l'UAC.

---

## 🎯 Contexte & Problème

À l’Université d’Abomey-Calavi (UAC), l’obtention d’un document administratif (attestation, relevé de notes, etc.) repose encore sur un processus physique :

- Déplacements multiples
- Dépôt de dossier papier
- Absence de suivi en temps réel
- Délais longs (1 à 2 semaines)
- Aucune notification

**EtuDocs** digitalise entièrement ce processus en respectant le workflow administratif réel.

---

## ✨ Fonctionnalités (MVP)

### 🎓 Côté Étudiant
- Création de compte avec numéro étudiant
- Authentification sécurisée (JWT)
- Soumission de demande en 3 étapes :
  1. Choix du type de document
  2. Upload des pièces justificatives
  3. Confirmation
- Suivi en temps réel du statut
- Timeline détaillée des étapes de validation
- Téléchargement du document (limité à 3 fois)
- QR code d’authenticité
- Notifications email automatiques

---

### 🏛 Workflow administratif (6 niveaux)

1. Secrétaire adjoint
2. Secrétaire général
3. Chef de division (Examens / Scolarité)
4. Directeur adjoint
5. Directeur
6. Notification à l’étudiant

Chaque action est tracée via un historique complet (`WorkflowHistory`).

---

### 📄 Documents disponibles (MVP uniquement)

- ✅ Attestation d’inscription
- ✅ Relevé de notes (par semestre)

Les autres documents seront ajoutés en V2.

---

### 🔎 Vérification d’authenticité

- Référence unique générée par document
- QR code intégré dans le PDF
- Page publique `/verify/:reference`
- Vérification sans connexion

---

## 👥 Rôles utilisateurs

| Rôle | Description |
|------|------------|
| ETUDIANT | Soumet et suit ses demandes |
| SECRETAIRE_ADJOINT | Vérifie complétude du dossier |
| SECRETAIRE_GENERAL | Transmet vers le bon service |
| CHEF_DIVISION | Valide les pièces et génère le document |
| DIRECTEUR_ADJOINT | Signe le document |
| DIRECTEUR | Signature finale |
| SUPER_ADMIN | Configure institutions et comptes |

---

## 🏗️ Architecture Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Authentification | JWT |
| Génération PDF | Puppeteer |
| QR Code | qrcode |
| Emails | Nodemailer + Brevo |
| Déploiement | Vercel (frontend) + Railway (backend & DB) |

Architecture 3 couches :

Client → API REST → PostgreSQL + Services (PDF, Email, QR)

---

## 🗄️ Base de données

La base est gérée via **Prisma ORM**.

Les principales entités :

- Institution
- Utilisateur
- Demande
- PieceJustificative
- WorkflowHistory
- Document
- PieceRequise

Les migrations sont versionnées dans `backend/prisma/migrations`.

⚠️ La base PostgreSQL n’est pas versionnée.  
Chaque développeur recrée sa base localement via Prisma.

---

## 🚀 Installation & Lancement

### Prérequis

- Node.js >= 18
- PostgreSQL installé localement
- npm

---

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/thelord00229/Digital_Minds_HACKBYIFRI_2026.git
cd Digital_Minds_HACKBYIFRI_2026

2️⃣ Configuration Backend
Bash
Copier le code
cd backend
npm install
Créer un fichier .env :
Env
Copier le code
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/etudocs"
JWT_SECRET=change_me
Créer la base PostgreSQL :
SQL
Copier le code
CREATE DATABASE etudocs;
Appliquer les migrations :
Bash
Copier le code
npx prisma migrate dev
Lancer le serveur :
Bash
Copier le code
npm run dev
3️⃣ Configuration Frontend
Bash
Copier le code
cd frontend
npm install
npm run dev
Application disponible sur :
Copier le code

http://localhost:3000
🌍 Institutions supportées (MVP)
IFRI
EPAC
FSS
Architecture extensible pour d’autres universités.
⚠️ Limites actuelles (MVP)
Paiement non intégré (upload de quittance)
Signature scannée (non cryptographique)
Pas encore d’OCR
Pas encore d’application mobile
📁 Structure du projet
Copier le code

Digital_Minds_HACKBYIFRI_2026/
│
├── frontend/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   └── package.json
│
└── README.md

📜 Licence
MIT
