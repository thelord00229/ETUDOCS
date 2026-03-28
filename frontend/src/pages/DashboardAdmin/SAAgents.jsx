import { useState, useEffect } from "react";
import SALayout from "../../components/DashboardAdmin/SALayout.jsx";
import SAToggle from "../../components/DashboardAdmin/SAToggle.jsx";
import api from "../../services/api"; // ✅ AJOUT : axios instance avec token
import {
  getAgents,
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
  .agents-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
  .agents-tbl { width: 100%; border-collapse: collapse; }
  .agents-tbl th {
    text-align: left; padding: 12px 20px;
    font-family: 'Sora', sans-serif; font-weight: 600; font-size: .8rem;
    color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; background: #f8fafc;
  }
  .agents-tbl td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  .agents-tbl tbody tr:last-child td { border-bottom: none; }
  .agents-tbl tbody tr:hover { background: #fafbff; }
  .ag-name  { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .9rem; color: #1a2744; }
  .ag-inst-logo { width: 32px; height: 32px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 2px; }
  .ag-inst-logo-fallback {
    width: 32px; height: 32px; border-radius: 6px; background: #1a2744;
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
  .btn-mail:hover { color: #1a2744; background: #f1f5f9; }

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
  .modal-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.15rem; color: #1a2744; margin-bottom: 6px; }
  .modal-sub { font-size: .88rem; color: #64748b; margin-bottom: 24px; }
  .modal-sub strong { color: #1a2744; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%;}
  .form-field { display: flex; flex-direction: column; gap: 6px; min-width: 0;}
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .78rem; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
  .form-input, .form-select, .form-textarea {
    padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px; width: 100%;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: #1a2744; outline: none;
    transition: border-color .15s; background: #f8fafc;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #1a2744; background: #fff; }
  .form-textarea { resize: vertical; min-height: 90px; }
  .form-hint { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

  /* ── Boutons ── */
  .btn-primary {
    padding: 10px 22px; background: #1a2744; color: #fff; border: none; border-radius: 9px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s;
  }
  .btn-primary:hover { background: #0f172a; }
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
  .btn-ghost:hover { border-color: #94a3b8; color: #1a2744; }

  /* ── Icône alerte ── */
  .delete-icon-wrap {
    width: 52px; height: 52px; border-radius: 50%; background: #fef2f2;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
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

  const set = (k, v) => {
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
      alert("Veuillez sélectionner une institution");
      return;
    }

    if (form.role === "CHEF_DIVISION" && !form.service) {
      alert("Veuillez sélectionner le service du Chef de division");
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
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [toDelete, setToDelete] = useState(null);
  const [toMail, setToMail] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Chargement en cours dans une modal
  const [modalLoading, setModalLoading] = useState(false);

  // ✅ Institutions (pour le select)
  const [institutions, setInstitutions] = useState([]);

  /* ── Chargement agents ── */
  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await getAgents();
      // ✅ CORRECTION : On exclut SUPER_ADMIN et ETUDIANT de l'affichage
      setAgents(
        res.data.filter(
          (a) => a.role !== "SUPER_ADMIN" && a.role !== "ETUDIANT"
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des agents");
    } finally {
      setLoading(false);
    }
  };

  /* ── Chargement institutions ── */
  const loadInstitutions = async () => {
    try {
      const res = await api.get("/api/institutions"); // ✅ IMPORTANT
      setInstitutions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Erreur chargement institutions", e);
      setInstitutions([]);
    }
  };

  useEffect(() => {
    loadInstitutions();
    loadAgents();
  }, []);

  /* ── Toggle actif/inactif ── */
  const handleToggle = async (agent) => {
    try {
      await toggleAgentActif(agent.id);
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, actif: !a.actif } : a))
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut");
    }
  };

  /* ── Suppression ── */
  const handleDeleteConfirm = async () => {
    setModalLoading(true);
    try {
      await deleteAgent(toDelete.id);
      setAgents((prev) => prev.filter((a) => a.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
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
      alert("Mail envoyé avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du mail");
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Création agent ── */
  const handleCreateAgent = async (form) => {
    setModalLoading(true);
    try {
      const res = await createAgent(form);
      setAgents((prev) => [...prev, res.data]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erreur lors de la création de l'agent");
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
            Chargement…
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
                  <td className="ag-name">
                    {a.prenom} {a.nom}
                  </td>
                  <td>
                    <InstLogo sigle={a.institution?.sigle || a.institutionId} />
                  </td>
                  <td className="ag-email">{a.email}</td>
                  <td style={{ fontSize: ".85rem", color: "#475569" }}>{a.role}</td>
                  <td>
                    <span className={a.actif ? "badge-actif" : "badge-inactif"}>
                      {a.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="ag-date">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td>
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
    </SALayout>
  );
}