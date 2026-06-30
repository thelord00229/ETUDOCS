# Graph Report - ETUDOCS  (2026-06-16)

## Corpus Check
- 153 files · ~1,321,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1187 nodes · 1668 edges · 81 communities (74 shown, 7 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18403909`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Dependances npm|Dependances npm]]
- [[_COMMUNITY_Module Authentification|Module Authentification]]
- [[_COMMUNITY_Generation PDF et Templates|Generation PDF et Templates]]
- [[_COMMUNITY_Captures ecran hors-projet|Captures ecran hors-projet]]
- [[_COMMUNITY_Layout Dashboard et Utilitaires UI|Layout Dashboard et Utilitaires UI]]
- [[_COMMUNITY_Configuration Backend Node.js|Configuration Backend Node.js]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Types Documents et Institutions|Types Documents et Institutions]]
- [[_COMMUNITY_Dependances Frontend React|Dependances Frontend React]]
- [[_COMMUNITY_Outil Preview Bulletin|Outil Preview Bulletin]]
- [[_COMMUNITY_Dashboard Chef Etablissement|Dashboard Chef Etablissement]]
- [[_COMMUNITY_Gestion des Demandes Frontend|Gestion des Demandes Frontend]]
- [[_COMMUNITY_Interface Verification Dossier|Interface Verification Dossier]]
- [[_COMMUNITY_Photos Etudiants Uploadees|Photos Etudiants Uploadees]]
- [[_COMMUNITY_Super Admin Gestion Agents|Super Admin Gestion Agents]]
- [[_COMMUNITY_Workflow Validation Multi-niveaux|Workflow Validation Multi-niveaux]]
- [[_COMMUNITY_Couche API HTTP Client|Couche API HTTP Client]]
- [[_COMMUNITY_Configuration Vite Frontend|Configuration Vite Frontend]]
- [[_COMMUNITY_Service Metier Demandes|Service Metier Demandes]]
- [[_COMMUNITY_Dashboard Chef de Section|Dashboard Chef de Section]]
- [[_COMMUNITY_Etats Workflow et Permissions|Etats Workflow et Permissions]]
- [[_COMMUNITY_Dashboard Secretaire General|Dashboard Secretaire General]]
- [[_COMMUNITY_Screenshots ETUDOCS Core|Screenshots ETUDOCS Core]]
- [[_COMMUNITY_Mes Documents Frontend|Mes Documents Frontend]]
- [[_COMMUNITY_Dashboard Secretaire Adjoint|Dashboard Secretaire Adjoint]]
- [[_COMMUNITY_Service Document Backend|Service Document Backend]]
- [[_COMMUNITY_Login et Routage Utilisateur|Login et Routage Utilisateur]]
- [[_COMMUNITY_Service Admin et Seeding|Service Admin et Seeding]]
- [[_COMMUNITY_Routes Demandes|Routes Demandes]]
- [[_COMMUNITY_Gestion Institutions|Gestion Institutions]]
- [[_COMMUNITY_Controleur Admin|Controleur Admin]]
- [[_COMMUNITY_Routes Analytics|Routes Analytics]]
- [[_COMMUNITY_Dashboard Directeur Adjoint|Dashboard Directeur Adjoint]]
- [[_COMMUNITY_Dashboard Directeur|Dashboard Directeur]]
- [[_COMMUNITY_Controleur Documents|Controleur Documents]]
- [[_COMMUNITY_Logos et Tampons Institutionnels|Logos et Tampons Institutionnels]]
- [[_COMMUNITY_Super Admin Institutions|Super Admin Institutions]]
- [[_COMMUNITY_Middleware JWT Auth|Middleware JWT Auth]]
- [[_COMMUNITY_Inscription Etudiant|Inscription Etudiant]]
- [[_COMMUNITY_Service et Controleur Agent|Service et Controleur Agent]]
- [[_COMMUNITY_Routes Agents|Routes Agents]]
- [[_COMMUNITY_Template Bulletin Notes|Template Bulletin Notes]]
- [[_COMMUNITY_Client Prisma ORM|Client Prisma ORM]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Super Admin Dashboard|Super Admin Dashboard]]
- [[_COMMUNITY_Routes Documents|Routes Documents]]
- [[_COMMUNITY_Page Accueil et Routing|Page Accueil et Routing]]
- [[_COMMUNITY_Endpoint Verification Publique|Endpoint Verification Publique]]
- [[_COMMUNITY_Routes Admin|Routes Admin]]
- [[_COMMUNITY_Theme Dark Light|Theme Dark Light]]
- [[_COMMUNITY_Super Admin Analytics|Super Admin Analytics]]
- [[_COMMUNITY_Seeder Base de Donnees|Seeder Base de Donnees]]
- [[_COMMUNITY_Automatisation Make.com|Automatisation Make.com]]
- [[_COMMUNITY_Serveur Express Entree|Serveur Express Entree]]
- [[_COMMUNITY_Captures Verification Dossier|Captures Verification Dossier]]
- [[_COMMUNITY_Parametres Claude Code|Parametres Claude Code]]
- [[_COMMUNITY_Permissions Locales|Permissions Locales]]
- [[_COMMUNITY_Service QR Code|Service QR Code]]
- [[_COMMUNITY_Fichiers Non Lies Projet|Fichiers Non Lies Projet]]
- [[_COMMUNITY_Captures Login App|Captures Login App]]
- [[_COMMUNITY_Captures Inscription App|Captures Inscription App]]
- [[_COMMUNITY_Script Exercice|Script Exercice]]
- [[_COMMUNITY_Tests Service Email|Tests Service Email]]
- [[_COMMUNITY_Config App React Vite|Config App React Vite]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)
1. `apiRequest()` - 21 edges
2. `useDemandes()` - 17 edges
3. `useNotifications()` - 17 edges
4. `getDemandes()` - 13 edges
5. `fetchCachedQuery()` - 10 edges
6. `imageToDataUrl()` - 9 edges
7. `toSafeAbsolutePath()` - 9 edges
8. `getMe()` - 9 edges
9. `Collaboration Supabase - EtuDocs` - 9 edges
10. `Depannage` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Bloc signatures Directeur-Adjoint et Directeur avec tampon` --semantically_similar_to--> `Relevé de notes Semestre 1 IFRI — Document généré ETD-2026-IFRI-S1-A7AFA-9DDF`  [INFERRED] [semantically similar]
  bulletin-preview/output.html → backend/uploads/pdfs/ETD-2026-IFRI-S1-A7AFA-9DDF.pdf
- `Relevé de notes semestre 1 — structure UE/ECU avec crédits, cotes et décision jury` --semantically_similar_to--> `Structure UE/ECU avec crédits, moyennes et cotes (bulletin réel généré)`  [INFERRED] [semantically similar]
  bulletin-preview/output.html → backend/uploads/pdfs/ETD-2026-IFRI-S1-A7AFA-9DDF.pdf
- `Zone QR code sur le bulletin (vérification document)` --semantically_similar_to--> `QR code d'authenticité sur attestation d'inscription`  [INFERRED] [semantically similar]
  bulletin-preview/output.html → backend/uploads/pdfs/ETD-2026-IFRI-ATT-40275-3449.pdf
- `Zone QR code sur le bulletin (vérification document)` --semantically_similar_to--> `QR code d'authenticité sur relevé de notes généré`  [INFERRED] [semantically similar]
  bulletin-preview/output.html → backend/uploads/pdfs/ETD-2026-IFRI-S1-A7AFA-9DDF.pdf
- `Barre récapitulative : crédits capitalisés, moyenne pondérée, décision jury` --semantically_similar_to--> `Décision jury : Continue — 96.67% crédits capitalisés, moyenne 13.39/20`  [INFERRED] [semantically similar]
  bulletin-preview/output.html → backend/uploads/pdfs/ETD-2026-IFRI-S1-A7AFA-9DDF.pdf

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline de génération de documents officiels avec QR code et référence unique** — concept_document_ref_numbering, bulletin_preview_output_qr_code_zone, pdfs_etd_2026_ifri_att_attestation_inscription, pdfs_etd_2026_ifri_s1_releve_notes_s1, bulletin_preview_output_bulletin_html [INFERRED 0.90]
- **Composants structurels du bulletin de notes (UE/ECU, récapitulatif, signatures, barème)** — bulletin_preview_output_releve_notes, bulletin_preview_output_summary_bar, bulletin_preview_output_signature_block, concept_grading_scale_lmd, pdfs_etd_2026_ifri_s1_ue_structure [INFERRED 0.90]
- **Fonctionnalités principales d'EtuDocs : auth JWT, workflow multi-niveaux, gestion documents** — etudocs_readme_jwt_auth, etudocs_readme_workflow_multiniveaux, etudocs_readme_gestion_documents, etudocs_readme_techstack [EXTRACTED 1.00]

## Communities (81 total, 7 thin omitted)

### Community 0 - "Dependances npm"
Cohesion: 0.01
Nodes (144): dependencies, accepts, ansi-regex, ansi-styles, anymatch, apache-crypt, apache-md5, arr-diff (+136 more)

### Community 1 - "Module Authentification"
Cohesion: 0.24
Nodes (8): auth, ctrl, { loginRateLimit, resetPasswordRateLimit }, { me }, router, loginRateLimit, rateLimit, resetPasswordRateLimit

### Community 2 - "Generation PDF et Templates"
Cohesion: 0.06
Nodes (34): ASSETS_DIR, bufferToDataUrl(), buildAttestationInscriptionHtml(), { buildHtml }, buildLogoSVG(), buildQRPlaceholder(), buildSemestresLabel(), buildStampSVG() (+26 more)

### Community 3 - "Captures ecran hors-projet"
Cohesion: 0.08
Nodes (38): Windows Display Settings Screenshot (July 2025), Make.com Integration Weather Scenario Screenshot (July 2025), Make.com AI Automation Scenario with Telegram, Mistral, Supabase (July 2025), Make.com Supabase Table 'memoire' Configuration Screenshot (July 2025), TP-Link Repeater 404 Error Page Screenshot (July 2025), Make.com 'recherche' Scenario with Webhooks/Relevance/Google Sheets (July 2025), Make.com Relevance Agent Configuration Screenshot (July 2025), Make.com HTTP OpenAI ChatGPT Completion Module Screenshot (July 2025) (+30 more)

### Community 4 - "Layout Dashboard et Utilitaires UI"
Cohesion: 0.08
Nodes (12): COLORS, ICONS, DashboardLayout(), getInstitutionCodeFromUser(), getUser(), normalizeInst(), MesReclamations(), typeLabels (+4 more)

### Community 5 - "Configuration Backend Node.js"
Cohesion: 0.06
Nodes (33): author, dependencies, bcryptjs, cors, ejs, express, express-rate-limit, jsonwebtoken (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (9): Dashboard(), DetailDemande(), getSteps(), uiIntervenant(), uiRef(), uiStatus(), uiTitle(), STATUS_CLASS (+1 more)

### Community 7 - "Types Documents et Institutions"
Cohesion: 0.12
Nodes (29): Type de document : Attestation d'inscription, Type de document : Attestation de succès, Type de document : Relevé de notes / Bulletin, Institution : EPAC, Institution : FSS, Institution : IFRI, Paiement demande : 2000 FCFA (Mobile Money / Guichet), Fonctionnalité : Vérification QR code des documents (+21 more)

### Community 8 - "Dependances Frontend React"
Cohesion: 0.07
Nodes (28): dependencies, axios, react, react-dom, react-router-dom, recharts, @tanstack/react-query, devDependencies (+20 more)

### Community 9 - "Outil Preview Bulletin"
Cohesion: 0.12
Nodes (22): Outil de prévisualisation du bulletin (index.html), Template HTML rendu du bulletin de notes (output.html), Feuille de style bulletin_preview.css (externe), Zone QR code sur le bulletin (vérification document), Relevé de notes semestre 1 — structure UE/ECU avec crédits, cotes et décision jury, Bloc signatures Directeur-Adjoint et Directeur avec tampon, Barre récapitulative : crédits capitalisés, moyenne pondérée, décision jury, Schéma de numérotation des documents : ETD-{YEAR}-{INST}-{TYPE}-{HASH} (+14 more)

### Community 10 - "Dashboard Chef Etablissement"
Cohesion: 0.09
Nodes (6): ChefDivisionExamens(), defaultPieces, getReferenceDoc(), getStrength(), ModalMotDePasse(), useChefDivisionStats()

### Community 11 - "Gestion des Demandes Frontend"
Cohesion: 0.12
Nodes (14): computeUiStatus(), dbadgeClass(), DetailDemande(), FILTERS, getSteps(), groupKeyForDate(), labelType(), MesDemandes() (+6 more)

### Community 12 - "Interface Verification Dossier"
Cohesion: 0.22
Nodes (20): Document Verification Workflow (CIP, Quittance, Acte Naissance, Justificatif Inscription), ETUDOCS Frontend Application UI, LocalStorage Authentication Data (etudocs_institution, etudocs_token, etudocs_user), Student Profile Photo Upload, ETUDOCS Dossier Treatment UI - Document Verification Screen, ETUDOCS Dashboard with Browser DevTools - LocalStorage View, ETUDOCS Dashboard with Browser DevTools - LocalStorage View (duplicate), ETUDOCS Dashboard with Browser DevTools - LocalStorage View (duplicate) (+12 more)

### Community 13 - "Photos Etudiants Uploadees"
Cohesion: 0.15
Nodes (20): Attestation Document Type (ETUDOCS), Student Profile Photo Upload Type, Unrelated Non-Academic Uploads (test/personal files), Student Profile Photo (male student, blue shirt), Student Profile Photo (male student, blue shirt) - duplicate, Make AI Agents Workflow Builder Screenshot, Ronaldo Manchester United Jersey Number 7 Photo, Student Profile Photo (male student, blue shirt) - variant (+12 more)

### Community 14 - "Super Admin Gestion Agents"
Cohesion: 0.16
Nodes (9): ROLES, SAAgents(), useAgents(), useInstitutions(), createAgent(), deleteAgent(), getAgents(), sendMailToAgent() (+1 more)

### Community 15 - "Workflow Validation Multi-niveaux"
Cohesion: 0.22
Nodes (16): Document Type - Attestation d'inscription, Feature - Workflow Multi-niveaux de Validation des Demandes, ETUDOCS Interactive High-Fidelity Mockup - Secretaire Adjoint Dashboard (Agent Role), ETUDOCS Interactive High-Fidelity Mockup - Chef de Division Scolarite Dashboard (Agent Role), ETUDOCS Interactive High-Fidelity Mockup - Directeur Adjoint Dashboard (Agent Role), ETUDOCS Interactive High-Fidelity Mockup - Directeur Adjoint Dashboard duplicate view, ETUDOCS Interactive High-Fidelity Mockup - Directeur Dashboard (Final Signature), ETUDOCS Interactive High-Fidelity Mockup - Secretaire General Dashboard (Agent Role) (+8 more)

### Community 16 - "Couche API HTTP Client"
Cohesion: 0.29
Nodes (3): SADashboard(), useAdminDashboard(), getDashboard()

### Community 17 - "Configuration Vite Frontend"
Cohesion: 0.13
Nodes (14): author, description, devDependencies, vite, keywords, license, main, name (+6 more)

### Community 18 - "Service Metier Demandes"
Cohesion: 0.11
Nodes (14): {
  assertPermission,
  getNextStatut,
}, { ATTESTATION_INSCRIPTION, RELEVE_NOTES }, DEFAULT_REQUIRED, emailService, { EXAMENS, SCOLARITE }, generateDocumentsOutsideTransaction(), generateUniqueDocumentReference(), getServiceCible() (+6 more)

### Community 19 - "Dashboard Chef de Section"
Cohesion: 0.13
Nodes (6): DashboardCS(), getReferenceDoc(), getStrength(), ModalMotDePasse(), NAV, Topbar()

### Community 20 - "Etats Workflow et Permissions"
Cohesion: 0.16
Nodes (12): avancerStatut(), assertAction(), assertPermission(), assertStatut(), { ETUDIANT, SECRETAIRE_ADJOINT, SECRETAIRE_GENERAL, CHEF_DIVISION, DIRECTEUR_ADJOINT, DIRECTEUR }, getNextStatut(), getStatutMeta(), getTimelineIndex() (+4 more)

### Community 21 - "Dashboard Secretaire General"
Cohesion: 0.15
Nodes (5): DashboardSG(), getStrength(), ModalMotDePasse(), useStatsSG(), getStatsSG()

### Community 22 - "Screenshots ETUDOCS Core"
Cohesion: 0.16
Nodes (14): EtuDocs - Application de gestion administrative académique, Document étudiant uploadé - Photo d'identité / pièce justificative, EtuDocs Dashboard - Tableau de bord avec DevTools (localStorage), EtuDocs - Interface Traitement du Dossier (Vérification des Pièces), Photo d'identité étudiant - Document uploadé (CIP ou justificatif), Photo d'identité étudiant - Document uploadé (CIP ou justificatif), Photo d'identité étudiant - Document uploadé (CIP ou justificatif), EtuDocs Dashboard - Tableau de bord avec DevTools (localStorage) (+6 more)

### Community 23 - "Mes Documents Frontend"
Cohesion: 0.18
Nodes (10): 1. Cloner le projet, Backend, Base de données, 📌 Description, 🚀 Digital Minds – HACKBYIFRI 2026, 🔐 Fonctionnalités principales, Frontend, 🚀 Installation (+2 more)

### Community 24 - "Dashboard Secretaire Adjoint"
Cohesion: 0.18
Nodes (12): badgeLabel(), DashboardSA(), fmtDate(), getStrength(), initials(), ModalMotDePasse(), ModalVerifier(), NAV (+4 more)

### Community 25 - "Service Document Backend"
Cohesion: 0.16
Nodes (10): { assertPermission, getNextStatut }, documentLabel(), emailService, envoyerDocumentDisponible(), getDocumentByReference(), preview(), prisma, supprimer() (+2 more)

### Community 26 - "Login et Routage Utilisateur"
Cohesion: 0.25
Nodes (5): notifService, auth, ctrl, router, prisma

### Community 27 - "Service Admin et Seeding"
Cohesion: 0.20
Nodes (6): AGENT_ROLES, bcrypt, INSTITUTIONS_SEED, normalize(), prisma, resolveInstitutionId()

### Community 28 - "Routes Demandes"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 29 - "Gestion Institutions"
Cohesion: 0.18
Nodes (6): institutionService, express, institutionController, router, INSTITUTIONS_SEED, prisma

### Community 30 - "Controleur Admin"
Cohesion: 0.22
Nodes (7): addDays(), adminService, asyncHandler, { ATTESTATION_INSCRIPTION, RELEVE_NOTES }, computeKpis(), prisma, TERMINAL

### Community 31 - "Routes Analytics"
Cohesion: 0.22
Nodes (7): auth, ctrl, express, prisma, role, router, STEPS

### Community 33 - "Dashboard Directeur"
Cohesion: 0.11
Nodes (13): Topbar(), DashboardDA(), getStrength(), ModalMotDePasse(), Topbar(), DashboardDI(), getStrength(), ModalMotDePasse() (+5 more)

### Community 34 - "Controleur Documents"
Cohesion: 0.20
Nodes (9): documentLabel(), toMailDocument(), asyncHandler, documentService, fs, { toSafeAbsolutePath }, path, toSafeAbsolutePath() (+1 more)

### Community 35 - "Logos et Tampons Institutionnels"
Cohesion: 0.50
Nodes (8): Répertoire des logos d'institutions (backend assets), Répertoire des tampons officiels (backend assets), EPAC - Ecole Polytechnique d'Abomey-Calavi, FSS - Faculté des Sciences de la Santé, Cotonou-Bénin, IFRI - Institut de Formation et de Recherche en Informatique, UAC - Université d'Abomey-Calavi, Tampon Directeur Adjoint - IFRI/UAC, Tampon Le Directeur - IFRI/UAC

### Community 36 - "Super Admin Institutions"
Cohesion: 0.07
Nodes (23): Dashboard, DashboardCE, DashboardCS, DashboardDA, DashboardDI, DashboardSA, DashboardSG, ForgotPassword (+15 more)

### Community 37 - "Middleware JWT Auth"
Cohesion: 0.12
Nodes (11): auth, ctrl, path, role, router, auth, ctrl, role (+3 more)

### Community 38 - "Inscription Etudiant"
Cohesion: 0.12
Nodes (9): FILIERES, NIVEAUX, FALLBACK_INSTITUTIONS, FILIERES, NIVEAUX, ResetPassword(), isPasswordValid(), PASSWORD_RULES (+1 more)

### Community 39 - "Service et Controleur Agent"
Cohesion: 0.22
Nodes (6): adapter, prisma, { PrismaClient }, agentService, emailService, prisma

### Community 40 - "Routes Agents"
Cohesion: 0.29
Nodes (5): agentController, authMiddleware, express, requireSA, router

### Community 41 - "Template Bulletin Notes"
Cohesion: 0.33
Nodes (5): buildHtml(), { buildHtml }, fs, html, mockPayload

### Community 42 - "Client Prisma ORM"
Cohesion: 0.17
Nodes (6): asyncHandler, authService, asyncHandler, prisma, asyncHandler, service

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (10): auth, CHEF_DIVISION_ROLES, ctrl, multer, path, role, router, storage (+2 more)

### Community 44 - "Super Admin Dashboard"
Cohesion: 0.11
Nodes (17): Acces au projet Supabase, Collaboration Supabase - EtuDocs, Commandes quotidiennes, Configuration .env par developpeur, `DATABASE_URL contient encore les placeholders`, `DATABASE_URL est absente du fichier .env`, Depannage, MIGRATION TERMINEE (+9 more)

### Community 45 - "Routes Documents"
Cohesion: 0.29
Nodes (4): FORMAT_FIELDS, NAV, SALayout(), importNotes()

### Community 47 - "Endpoint Verification Publique"
Cohesion: 0.29
Nodes (4): verifyService, router, verifyController, documentService

### Community 48 - "Routes Admin"
Cohesion: 0.29
Nodes (12): color(), colors, fs, ko(), main(), ok(), path, readEnvFile() (+4 more)

### Community 49 - "Theme Dark Light"
Cohesion: 0.53
Nodes (3): ThemeToggle(), useTheme(), Landingpage()

### Community 50 - "Super Admin Analytics"
Cohesion: 0.30
Nodes (11): color(), colors, fs, info(), ko(), main(), maskDatabaseUrl(), ok() (+3 more)

### Community 51 - "Seeder Base de Donnees"
Cohesion: 0.29
Nodes (4): adapter, bcrypt, prisma, { PrismaClient }

### Community 52 - "Automatisation Make.com"
Cohesion: 0.70
Nodes (5): Make.com AI Agent (Atlass Assistant) - Multi-tool Workflow, Make.com AI Agent Configuration UI - Atlass Assistant Workflow, Make.com AI Agent Configuration UI - Atlass Assistant Workflow (duplicate), Make.com AI Agent Configuration UI - Atlass Assistant Workflow (duplicate), Make.com AI Agent Configuration UI - Atlass Assistant Workflow (duplicate)

### Community 53 - "Serveur Express Entree"
Cohesion: 0.33
Nodes (5): allowedOrigins, app, cors, express, path

### Community 54 - "Captures Verification Dossier"
Cohesion: 0.67
Nodes (4): EtuDocs Document Verification Workflow, EtuDocs Traitement du Dossier - Document Verification UI Screenshot, EtuDocs Traitement du Dossier - Document Verification UI Screenshot (duplicate), EtuDocs Dashboard with Browser DevTools Open (localStorage inspection)

### Community 55 - "Parametres Claude Code"
Cohesion: 0.40
Nodes (4): enabledPlugins, frontend-design@claude-plugins-official, hooks, PreToolUse

### Community 57 - "Service QR Code"
Cohesion: 0.09
Nodes (15): service, AGENT_ROLES, documentLabel(), emailService, normalize(), normalizeUpper(), path, pdfService (+7 more)

### Community 58 - "Fichiers Non Lies Projet"
Cohesion: 0.67
Nodes (3): Photo sportif avec trophée Champions League - Fichier non lié au projet, Photo sportif avec trophée Champions League - Fichier non lié au projet, Photo sportif avec trophée Champions League - Fichier non lié au projet

### Community 62 - "Tests Service Email"
Cohesion: 0.15
Nodes (9): bcrypt, crypto, emailService, { ETUDIANT }, jwt, normalize(), prisma, resolveInstitutionId() (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.18
Nodes (10): auth, ctrl, express, multer, path, role, router, storage (+2 more)

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (5): ejs, fs, nodemailer, path, emailService

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (4): asyncHandler, normalize(), normalizeUpper(), service

### Community 75 - "Community 75"
Cohesion: 0.29
Nodes (4): NAV, preloaded, preloadRoute(), routeModules

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (6): Commandes Prisma, Guide de migration - Reclamations et paiements de telechargement, Seeds, Tests manuels, Variables d'environnement, Verification technique

### Community 78 - "Community 78"
Cohesion: 0.10
Nodes (36): api, apiBlob(), apiForm(), apiRequest(), avancerDocument(), buildHeaders(), clearSession(), deleteAllNotifications() (+28 more)

### Community 79 - "Community 79"
Cohesion: 0.12
Nodes (23): NouvelleReclamation(), TYPES, STATUTS, TYPES, useDocuments(), getCachedDemandes(), getCachedMe(), getDemandes() (+15 more)

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (3): KPIS_DEFAULT, miniIcon(), SAAnalytics()

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (4): agentService, bcrypt, emailService, prisma

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (5): asyncHandler, prisma, auth, ctrl, router

## Ambiguous Edges - Review These
- `Campus France - Interface candidature en ligne (formations demandées en licence/DAP)` → `EtuDocs - Application de gestion administrative académique`  [AMBIGUOUS]
  backend/uploads/23b7c837-c2e0-4a6c-9e21-23d776c17882.png · relation: conceptually_related_to
- `MedicaStock - Interface Nouvelle Sortie de Stock (application tierce)` → `EtuDocs - Application de gestion administrative académique`  [AMBIGUOUS]
  backend/uploads/2cd6bdad-0806-4c3d-8d1b-bda163d252f6.png · relation: conceptually_related_to
- `ETUDOCS Project (Academic Administrative Document Management)` → `Make.com Automation Platform`  [AMBIGUOUS]
  frontend/src/assets/Capture d'écran 2025-07-18 184203.png · relation: conceptually_related_to

## Knowledge Gaps
- **501 isolated node(s):** `frontend-design@claude-plugins-official`, `PreToolUse`, `allow`, `name`, `version` (+496 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Campus France - Interface candidature en ligne (formations demandées en licence/DAP)` and `EtuDocs - Application de gestion administrative académique`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `MedicaStock - Interface Nouvelle Sortie de Stock (application tierce)` and `EtuDocs - Application de gestion administrative académique`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `ETUDOCS Project (Academic Administrative Document Management)` and `Make.com Automation Platform`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Dependances npm` to `Configuration Vite Frontend`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useNotifications()` connect `Dashboard Directeur` to `Layout Dashboard et Utilitaires UI`, `Dashboard Chef Etablissement`, `Routes Documents`, `Community 78`, `Dashboard Chef de Section`, `Dashboard Secretaire General`, `Dashboard Secretaire Adjoint`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `toSafeAbsolutePath()` connect `Controleur Documents` to `Service Document Backend`, `Service Metier Demandes`, `Service QR Code`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `frontend-design@claude-plugins-official`, `PreToolUse`, `allow` to the rest of the system?**
  _502 weakly-connected nodes found - possible documentation gaps or missing edges._