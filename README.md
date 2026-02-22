# 📄 EtuDocs

> La plateforme qui permet aux étudiants de l'UAC de demander, suivre et télécharger leurs documents administratifs universitaires en ligne, sans déplacement ni attente.

---

## 🎯 Contexte & Problème

Au sein de l'Université d'Abomey-Calavi, l'obtention d'un document administratif (attestation, relevé, diplôme…) repose encore majoritairement sur un processus physique :

- Dépôt de dossier papier
- Déplacements répétés
- Absence de suivi en temps réel
- Délais de traitement longs

EtuDocs digitalise intégralement ce processus pour supprimer ces frictions.

---

## ✨ Fonctionnalités principales

### Côté Étudiant
- Création de compte & authentification sécurisée
- Soumission de demande en ligne (formulaire multi-étapes)
- Upload des pièces justificatives
- Suivi en temps réel (Soumise → En traitement → Validée / Rejetée)
- Téléchargement du document final en PDF
- Notifications email automatiques

### Côté Administration
- Dashboard avec indicateurs et alertes (demandes > 48h)
- Vérification et validation des pièces une par une
- Validation ou rejet global de la demande
- Génération automatique du document officiel avec signature institutionnelle

### Documents disponibles
- Attestation d'inscription
- Relevé de notes / Bulletin
- Attestation de succès
- Attestation d'admissibilité
- Attestation de diplôme + Diplôme Licence
- Attestation de diplôme + Diplôme Master
- Autre / Demande personnalisée

### Vérification d'authenticité
- QR code unique sur chaque document
- Page publique de vérification (sans connexion requise)

---

## 👥 Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| **Étudiant** | Soumet des demandes, suit l'évolution, télécharge les documents |
| **Agent administratif** | Vérifie les pièces, valide ou rejette les demandes |
| **Super Admin** | Gère les comptes agents, configure les templates et signatures par institution |
| **Vérificateur externe** | Scanne le QR code pour vérifier l'authenticité d'un document |

---

## 🏗️ Architecture technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Base de données | PostgreSQL |
| Authentification | JWT |
| Génération PDF | Puppeteer |
| QR Code | qrcode.js |
| Emails | Nodemailer + Brevo |
| Déploiement | Vercel + Railway |

Architecture 3 couches : `Client → API REST → Base de données + Services (PDF, QR, Email)`

---

## 🚀 Installation & lancement

### Prérequis
- Node.js >= 18
- PostgreSQL
- npm ou yarn

### Cloner le projet
```bash
git clone https://github.com/ton-username/etudocs.git](https://github.com/thelord00229/Digital_Minds_HACKBYIFRI_2026.git
cd etudocs
```

### Backend
```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

---

## 🌍 Institutions supportées

- IFRI
- EPAC
- FSS

> Architecture extensible pour intégrer de nouvelles institutions facilement.

---

## ⚠️ Limites actuelles (MVP)

- Paiement non intégré (upload de quittance à la place)
- Signature non cryptographique
- Données fictives utilisées pour la démonstration

---

## 📁 Structure du projet

```
etudocs/
├── frontend/        # Application Next.js
├── backend/         # API Express.js
├── .env.example     # Variables d'environnement (modèle)
└── README.md
```

---

## 📜 Licence

MIT
