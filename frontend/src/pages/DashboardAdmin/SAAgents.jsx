import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SALayout from "../../components/DashboardAdmin/SALayout.jsx";
import SAToggle from "../../components/DashboardAdmin/SAToggle.jsx";
import { useAgents, useInstitutions } from "../../hooks/queries";
import {
  toggleAgentActif,
  createAgent,
  deleteAgent,
  sendMailToAgent,
} from "../../services/admin.service";

// URL de base du backend pour les logos d'institutions
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Roles disponibles (hors SUPER_ADMIN)
const ROLES = [
  "SECRETAIRE_ADJOINT",
  "SECRETAIRE_GENERAL",
  "CHEF_DIVISION",
  "DIRECTEUR_ADJOINT",
  "DIRECTEUR",
];

const css = `
  /* ── Layout ── */
  .sa-agents-header { display: flex; align-items: flex-start; justify-content: space-between; }

  /* ── Bouton Ajouter ── */
  .btn-add-agent {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px;
    background: #16a34a; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s; white-space: nowrap;
  }
  .btn-add-agent:hover { background: #15803d; }

  /* ── Barre de recherche ── */
  .sa-search-bar {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 12px 18px; display: flex; align-items: center; gap: 10px;
  }
  .sa-search-bar input {
    flex: 1; border: none; outline: none; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; color: #334155; background: none;
  }
  .sa-search-bar input::placeholder { color: #cbd5e1; }

  /* ── Tableau ── */
  .agents-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
  .agents-tbl { width: 100%; border-collapse: collapse; }
  .agents-tbl th {
    text-align: left; padding: 12px 20px;
    font-family: 'Sora', sans-serif; font-weight: 600; font-size: .8rem;
    color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; background: #f8fafc;
  }
  .agents-tbl td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  .agents-tbl tbody tr:last-child td { border-bottom: none; }
  .agents-tbl tbody tr:hover { background: #fafbff; }
  .ag-name  { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .9rem; color: #1e293b; }
  .ag-inst-logo { width: 32px; height: 32px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 2px; }
  .ag-inst-logo-fallback {
    width: 32px; height: 32px; border-radius: 6px; background: #2e7d32;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .7rem; color: #fff;
    border: 1px solid #e2e8f0; flex-shrink: 0;
  }
  .ag-email { font-size: .85rem; color: #475569; }
  .ag-date  { font-size: .88rem; color: #475569; }
  .badge-actif   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 3px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
  .badge-inactif { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; padding: 3px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
  .ag-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
  .btn-delete {
    background: none; border: none; cursor: pointer; color: #fca5a5; padding: 4px;
    transition: color .2s; border-radius: 6px;
  }
  .btn-delete:hover { color: #ef4444; background: #fef2f2; }
  .btn-mail { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; transition: color .2s; border-radius: 6px; }
  .btn-mail:hover { color: #2e7d32; background: #f1f8e9; }

  /* ── Overlay / Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.45);
    display: flex; align-items: center; justify-content: center; z-index: 200;
    animation: fadeIn .15s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal-box {
    background: #fff; border-radius: 18px; padding: 32px;
    width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,.15);
    animation: slideUp .18s ease;
    overflow: hidden;
  }
  .modal-box.modal-sm { max-width: 380px; }
  @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
  .modal-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.15rem; color: #1e293b; margin-bottom: 6px; }
  .modal-sub { font-size: .88rem; color: #64748b; margin-bottom: 24px; }
  .modal-sub strong { color: #1e293b; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%;}
  .form-field { display: flex; flex-direction: column; gap: 6px; min-width: 0;}
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .78rem; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
  .form-input, .form-select, .form-textarea {
    padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px; width: 100%;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: #1e293b; outline: none;
    transition: border-color .15s; background: #f8fafc;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #2e7d32; background: #fff; }
  .form-textarea { resize: vertical; min-height: 90px; }
  .form-hint { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

  /* ── Boutons ── */
  .btn-primary {
    padding: 10px 22px; background: #2e7d32; color: #fff; border: none; border-radius: 9px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s;
  }
  .btn-primary:hover { background: #1b5e20; }
  .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
  .btn-danger {
    padding: 10px 22px; background: #ef4444; color: #fff; border: none; border-radius: 9px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-ghost {
    padding: 10px 18px; background: none; color: #64748b; border: 1.5px solid #e2e8f0;
    border-radius: 9px; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: .88rem;
    cursor: pointer; transition: border-color .2s, color .2s;
  }
  .btn-ghost:hover { border-color: #2e7d32; color: #2e7d32; }

  /* ── Icône alerte ── */
  .delete-icon-wrap {
    width: 52px; height: 52px; border-radius: 50%; background: #fef2f2;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }

  /* ── Toast notifications ── */
  .sa-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    padding: 13px 20px; border-radius: 12px; min-width: 260px; max-width: 380px;
    box-shadow: 0 8px 32px rgba(0,0,0,.14);
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    animation: toastIn .22s ease;
  }
  .sa-toast.success { background: #f0fdf4; color: #15803d; border: 1.5px solid #bbf7d0; }
  .sa-toast.error   { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
  @keyframes toastIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

  /* ── Spinner chargement ── */
  .sa-spinner {
    display: inline-block; width: 20px; height: 20px;
    border: 2px solid #e2e8f0; border-top-color: #2e7d32;
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .sa-agents-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .agents-table-wrap { overflow-x: auto; }
    .modal-box { max-width: 95vw !important; }
    .modal-sm  { max-width: 95vw !important; }
  }
  @media (max-width: 600px) {
    .agents-table-wrap { background: transparent; border: none; overflow: visible; }
    .agents-tbl, .agents-tbl tbody, .agents-tbl tr, .agents-tbl td { display: block; width: 100%; }
    .agents-tbl thead { display: none; }
    .agents-tbl tbody tr { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 4px 14px; margin-bottom: 12px; }
    .agents-tbl td { border: none; padding: 9px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: right; }
    .agents-tbl td + td { border-top: 1px solid #f1f5f9; }
    .agents-tbl td::before {
      content: attr(data-label); font-weight: 700; font-size: .7rem; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .04em; text-align: left; flex-shrink: 0;
    }
    .agents-tbl .ag-actions { justify-content: flex-end; }
    .agents-tbl .ag-email { word-break: break-all; }
  }
  @media (max-width: 480px) {
    .sa-agents-header { padding: 16px; }
    .sa-toast { right: 12px; left: 12px; min-width: unset; }
  }
`;

/* ─── Composant logo institution ─── */
function InstLogo({ sigle }) {
  const [error, setError] = useState(false);
  if (!sigle || error) {
    return (
      <div className="ag-inst-logo-fallback">
        {sigle ? sigle.slice(0, 2).toUpperCase() : "?"}
      </div>
    );
  }
  return (
    <img
      src={`${API_BASE}/assets/logos/${sigle}.png`}
      alt={sigle}
      className="ag-inst-logo"
      onError={() => setError(true)}
    />
  );
}

/* ─── Modal Confirmation Suppression ─── */
function ModalDelete({ agent, onCancel, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="delete-icon-wrap">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>
        <p className="modal-title" style={{ textAlign: "center" }}>
          Supprimer l'agent ?
        </p>
        <p className="modal-sub" style={{ textAlign: "center" }}>
          Le compte de{" "}
          <strong>
            {agent.prenom} {agent.nom}
          </strong>{" "}
          sera définitivement supprimé. Ses actions passées sur la plateforme
          seront conservées.
        </p>
        <div className="modal-actions" style={{ justifyContent: "center" }}>
          <button className="btn-ghost" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Suppression…" : "Confirmer la suppression"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Envoyer un mail ─── */
function ModalMail({ agent, onClose, onSend, loading }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    onSend({ subject, body });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Envoyer un mail</p>
        <p className="modal-sub">
          À :{" "}
          <strong>
            {agent.prenom} {agent.nom}
          </strong>{" "}
          — {agent.email}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-field">
            <label className="form-label">Objet</label>
            <input
              className="form-input"
              placeholder="Objet du message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder="Écrivez votre message ici…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={loading || !subject.trim() || !body.trim()}
          >
            {loading ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Ajouter un agent ─── */
function ModalAddAgent({ onClose, onSubmit, loading, institutions }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    institutionId: "",
    service: "",
  });
  const [fieldError, setFieldError] = useState("");

  const set = (k, v) => {
    setFieldError("");
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "role" && v !== "CHEF_DIVISION" ? { service: "" } : {}),
    }));
  };

  const handleSubmit = () => {
    if (!form.nom || !form.prenom || !form.email || !form.role) return;

    // ✅ Institution obligatoire
    if (!form.institutionId) {
      setFieldError("Veuillez sélectionner une institution");
      return;
    }

    if (form.role === "CHEF_DIVISION" && !form.service) {
      setFieldError("Veuillez sélectionner le service du Chef de division");
      return;
    }

    onSubmit(form);
  };

  // ✅ CORRECTION : Liste des rôles sans ETUDIANT ni SUPER_ADMIN
  const AGENT_ROLES = [
    "SECRETAIRE_ADJOINT",
    "SECRETAIRE_GENERAL",
    "CHEF_DIVISION",
    "DIRECTEUR_ADJOINT",
    "DIRECTEUR",
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="modal-title">Ajouter un agent</p>
        <p className="modal-sub">
          Mot de passe par défaut <strong>Password123!</strong>
        </p>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Prénom *</label>
            <input
              className="form-input"
              value={form.prenom}
              onChange={(e) => set("prenom", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Nom *</label>
            <input
              className="form-input"
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Rôle *</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="">-- Choisir --</option>
              {/* ✅ CORRECTION : On utilise AGENT_ROLES à la place de ROLES */}
              {AGENT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ INSTITUTION : SELECT (ID UUID envoyé) */}
          <div className="form-field">
            <label className="form-label">Institution *</label>
            <select
              className="form-select"
              value={form.institutionId}
              onChange={(e) => set("institutionId", e.target.value)}
              disabled={loading}
            >
              <option value="">-- Choisir --</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.sigle ? `${inst.sigle} — ${inst.nom}` : inst.nom}
                </option>
              ))}
            </select>
          </div>

          {/* 👇 SERVICE UNIQUEMENT POUR CHEF_DIVISION */}
          {form.role === "CHEF_DIVISION" && (
            <div className="form-field full">
              <label className="form-label">Service *</label>
              <select
                className="form-select"
                value={form.service}
                onChange={(e) => set("service", e.target.value)}
              >
                <option value="">-- Choisir --</option>
                <option value="EXAMENS">EXAMENS</option>
                <option value="SCOLARITE">SCOLARITE</option>
              </select>
            </div>
          )}
        </div>

        {fieldError && (
          <p style={{ color: "#dc2626", fontSize: ".82rem", marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>
            {fieldError}
          </p>
        )}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Création…" : "Créer le compte"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
export default function SAAgents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // ── Agents (React Query) ──
  const { data: agentsData, isLoading: loading } = useAgents();
  // ✅ On exclut SUPER_ADMIN et ETUDIANT de l'affichage
  const agentsRaw = Array.isArray(agentsData) ? agentsData : agentsData ?? [];
  const agents = agentsRaw.filter(
    (a) => a.role !== "SUPER_ADMIN" && a.role !== "ETUDIANT"
  );

  // ── Institutions (React Query, pour le select) ──
  const { data: institutionsData } = useInstitutions();
  const institutions = Array.isArray(institutionsData) ? institutionsData : [];

  // Modals
  const [toDelete, setToDelete] = useState(null);
  const [toMail, setToMail] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Chargement en cours dans une modal
  const [modalLoading, setModalLoading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Toggle actif/inactif ── */
  const handleToggle = async (agent) => {
    try {
      await toggleAgentActif(agent.id);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du changement de statut", "error");
    }
  };

  /* ── Suppression ── */
  const handleDeleteConfirm = async () => {
    setModalLoading(true);
    try {
      await deleteAgent(toDelete.id);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setToDelete(null);
      showToast("Agent supprimé avec succès", "success");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Envoi mail ── */
  const handleSendMail = async ({ subject, body }) => {
    setModalLoading(true);
    try {
      await sendMailToAgent(toMail.id, { subject, body });
      setToMail(null);
      showToast("Mail envoyé avec succès !", "success");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'envoi du mail", "error");
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Création agent ── */
  const handleCreateAgent = async (form) => {
    setModalLoading(true);
    try {
      await createAgent(form);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Erreur lors de la création de l'agent", "error");
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Filtrage ── */
  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      `${a.prenom} ${a.nom}`.toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.role || "").toLowerCase().includes(q)
    );
  });

  /* ── Rendu ── */
  return (
    <SALayout>
      <style>{css}</style>

      {/* ── En-tête ── */}
      <div className="sa-agents-header">
        <div>
          <h2 className="sa-page-title">Gestion des agents</h2>
          <p className="sa-page-sub">
            Gérez les comptes agents de toutes les institutions
          </p>
        </div>
        <button className="btn-add-agent" onClick={() => setShowAddModal(true)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Ajouter un agent
        </button>
      </div>

      {/* ── Recherche ── */}
      <div className="sa-search-bar">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Rechercher par nom, email ou rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tableau ── */}
      <div className="agents-table-wrap">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            <span className="sa-spinner" />
          </div>
        ) : (
          <table className="agents-tbl">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Institution</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="ag-name" data-label="Nom">
                    {a.prenom} {a.nom}
                  </td>
                  <td data-label="Institution">
                    <InstLogo sigle={a.institution?.sigle || a.institutionId} />
                  </td>
                  <td className="ag-email" data-label="Email">{a.email}</td>
                  <td data-label="Rôle" style={{ fontSize: ".85rem", color: "#475569" }}>{a.role}</td>
                  <td data-label="Statut">
                    <span className={a.actif ? "badge-actif" : "badge-inactif"}>
                      {a.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="ag-date" data-label="Créé le">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td data-label="">
                    <div className="ag-actions">
                      <SAToggle defaultOn={a.actif} onChange={() => handleToggle(a)} />

                      {/* Supprimer */}
                      <button
                        className="btn-delete"
                        title="Supprimer l'agent"
                        onClick={() => setToDelete(a)}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                      {/* Mail */}
                      <button
                        className="btn-mail"
                        title="Envoyer un mail"
                        onClick={() => setToMail(a)}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    Aucun agent trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ── */}
      {toDelete && (
        <ModalDelete
          agent={toDelete}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDeleteConfirm}
          loading={modalLoading}
        />
      )}

      {toMail && (
        <ModalMail
          agent={toMail}
          onClose={() => setToMail(null)}
          onSend={handleSendMail}
          loading={modalLoading}
        />
      )}

      {showAddModal && (
        <ModalAddAgent
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateAgent}
          loading={modalLoading}
          institutions={institutions} // ✅ PASSER LA LISTE
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`sa-toast ${toast.type}`}>
          {toast.type === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </SALayout>
  );
}
