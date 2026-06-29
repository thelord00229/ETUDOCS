# `pages/` — composants de niveau route

Un composant par écran, regroupé par dashboard/rôle :
- `DashboardEtudiant/`, `DashboardAdmin/` (SA), `DashboardDA/`, `DashboardDI/`, `DashboardSG/`, `DashboardCS/`, `DashboardCE/`, `DashboardSA/`
- pages publiques : `Landingpage.jsx` (`/`), `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`

Les pages sont déclarées dans `../routes/`. La logique réutilisable doit être extraite vers `../components/` ou `../hooks/`.
