import { useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Toggle from "../../components/DashboardEtudiant/Toggle.jsx";

const css = `
  .profil-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .profil-sub   { color:#475569; font-size:.9rem; }

  .profil-section {
    background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:28px;
  }
  .profil-section__title {
    font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744;
    margin-bottom:20px; display:flex; align-items:center; gap:8px;
  }

  /* AVATAR ZONE */
  .avatar-row { display:flex; align-items:center; gap:20px; margin-bottom:24px; }
  .avatar-big {
    width:72px; height:72px; border-radius:50%; background:#1a2744; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:800; font-size:1.3rem; color:#fff;
    position:relative; cursor:pointer;
  }
  .avatar-big__plus {
    position:absolute; bottom:0; right:0;
    width:22px; height:22px; border-radius:50%; background:#f5a623; border:2px solid #fff;
    display:flex; align-items:center; justify-content:center; font-size:.9rem; font-weight:700; color:#fff;
  }
  .avatar-info__name   { font-family:'Sora',sans-serif; font-weight:700; font-size:1.05rem; color:#1a2744; margin-bottom:4px; display:flex; align-items:center; gap:10px; }
  .avatar-info__sub    { color:#94a3b8; font-size:.85rem; }
  .verified-badge {
    display:inline-flex; align-items:center; gap:5px;
    background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;
    font-size:.75rem; font-weight:700; padding:3px 10px; border-radius:20px;
  }

  /* FORM GRID */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 24px; }
  .form-field { display:flex; flex-direction:column; gap:6px; }
  .form-field label { font-size:.82rem; font-weight:500; color:#475569; display:flex; align-items:center; gap:6px; }
  .form-input {
    padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; color:#334155;
    background:#f8fafc; outline:none; transition:border-color .2s, background .2s;
  }
  .form-input:focus { border-color:#1a2744; background:#fff; }
  .form-input:disabled { background:#f1f5f9; color:#94a3b8; cursor:not-allowed; }
  .form-hint { font-size:.75rem; color:#94a3b8; margin-top:2px; }

  .form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; }
  .btn-cancel {
    padding:10px 22px; border:1.5px solid #e2e8f0; border-radius:10px;
    background:#fff; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500;
    color:#475569; cursor:pointer; transition:border-color .2s;
  }
  .btn-cancel:hover { border-color:#1a2744; color:#1a2744; }
  .btn-save {
    padding:10px 22px; background:#1a2744; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s;
  }
  .btn-save:hover { background:#243057; }
  .btn-pwd {
    padding:10px 22px; background:#1a2744; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s; margin-top:8px;
  }
  .btn-pwd:hover { background:#243057; }

  /* IDENTITY BANNER */
  .identity-banner {
    background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:12px;
    padding:18px 20px; display:flex; align-items:flex-start; gap:14px;
  }
  .identity-banner__icon { width:40px; height:40px; border-radius:10px; background:#16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .identity-banner__title { font-family:'Sora',sans-serif; font-weight:700; color:#16a34a; margin-bottom:4px; }
  .identity-banner__text  { font-size:.85rem; color:#475569; }
`;

export default function MonProfil() {
  const [nom,     setNom]     = useState("Koffi AGUEH");
  const [filiere, setFiliere] = useState("Génie Logiciel");
  const [niveau,  setNiveau]  = useState("Licence 3");

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="profil-title">Mon profil</h2>
        <p className="profil-sub">Gérez vos informations personnelles et vos préférences</p>
      </div>

      {/* Infos personnelles */}
      <div className="profil-section">
        <div className="profil-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Informations personnelles
        </div>

        <div className="avatar-row">
          <div className="avatar-big">
            KA
            <div className="avatar-big__plus">+</div>
          </div>
          <div className="avatar-info">
            <div className="avatar-info__name">
              Koffi AGUEH
              <span className="verified-badge">✓ Identité vérifiée</span>
            </div>
            <div className="avatar-info__sub">Étudiant à l'IFRI • Membre depuis octobre 2022</div>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Numéro étudiant
            </label>
            <input className="form-input" value="20220001" disabled />
            <span className="form-hint">Le numéro étudiant ne peut pas être modifié</span>
          </div>
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Nom complet
            </label>
            <input className="form-input" value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email
            </label>
            <input className="form-input" defaultValue="koffi.agueh@ifri.uac.bj" type="email" />
          </div>
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Institution
            </label>
            <input className="form-input" value="IFRI" disabled />
          </div>
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Filière
            </label>
            <input className="form-input" value={filiere} onChange={e => setFiliere(e.target.value)} />
          </div>
          <div className="form-field">
            <label>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
              Niveau d'études
            </label>
            <input className="form-input" value={niveau} onChange={e => setNiveau(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel">Annuler</button>
          <button className="btn-save">Enregistrer les modifications</button>
        </div>
      </div>

      {/* Sécurité */}
      <div className="profil-section">
        <div className="profil-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Sécurité
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:600 }}>
          <div className="form-field">
            <label>Mot de passe actuel</label>
            <input className="form-input" type="password" defaultValue="12345678" />
          </div>
          <div className="form-field">
            <label>Nouveau mot de passe</label>
            <input className="form-input" type="password" defaultValue="12345678" />
            <span className="form-hint">Minimum 8 caractères</span>
          </div>
          <div className="form-field">
            <label>Confirmer le nouveau mot de passe</label>
            <input className="form-input" type="password" defaultValue="12345678" />
          </div>
          <div>
            <button className="btn-pwd">Modifier le mot de passe</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="profil-section">
        <div className="profil-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Préférences de notification
        </div>
        <Toggle title="Notifications par email" sub="Recevez des emails pour les mises à jour importantes" defaultOn={true} />
        <Toggle title="Demande validée" sub="Notification quand un document est disponible" defaultOn={true} />
        <Toggle title="Demande rejetée" sub="Notification en cas de rejet avec la raison" defaultOn={true} />
        <Toggle title="Rappels de paiement" sub="Rappels pour les paiements en attente" defaultOn={true} />
        <Toggle title="Newsletter EtuDocs" sub="Actualités et nouvelles fonctionnalités" defaultOn={false} />
      </div>

      {/* Identity banner */}
      <div className="identity-banner">
        <div className="identity-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="identity-banner__title">Identité vérifiée ✓</div>
          <div className="identity-banner__text">
            Votre identité a été vérifiée par votre institution. Vous pouvez maintenant soumettre des demandes de documents officiels.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
