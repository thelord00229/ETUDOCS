# `components/` — composants UI réutilisables

Composants présentationnels/partagés, regroupés par zone :
- `DashboardEtudiant/` : `Sidebar`, `Topbar`, `Stepper`, `Statcard`, `DashboardLayout`…
- `DashboardAdmin/` : `SALayout`, `SAStatCard`, `SAToggle`, `SAInstBadge`…
- `DashboardSG/` : modales spécifiques (réclamations).
- racine : `Toast.jsx`, `dark-light-theme.jsx`.

Garder les composants petits et focalisés. La logique d'état complexe va dans un hook (`../hooks/`).
