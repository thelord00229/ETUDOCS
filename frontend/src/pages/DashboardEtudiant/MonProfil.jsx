import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Toggle from "../../components/DashboardEtudiant/Toggle.jsx";
import { getMe } from "../../services/api.js";

const css = `
  .profil-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .profil-sub   { color:#475569; font-size:.9rem; }

  .profil-section {
    background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:32px;
    margin-bottom:20px;
  }
  .profil-section__title {
    font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744;
    margin-bottom:24px; padding-bottom:14px; border-bottom:1px solid #f1f5f9;
  }

  /* Avatar row */
  .avatar-row {
    display:flex; align-items:center; gap:20px; margin-bottom:28px;
    padding:18px 20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;
  }
  .avatar-big {
    width:64px; height:64px; border-radius:50%; background:#1a2744; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:800; font-size:1.2rem; color:#fff;
  }
  .avatar-info__name {
    font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744;
    margin-bottom:5px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  }
  .avatar-info__sub { color:#94a3b8; font-size:.82rem; }
  .verified-badge {
    display:inline-flex; align-items:center; gap:4px;
    background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;
    font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:20px;
  }

  /* Section groupes */
  .form-group {
    margin-bottom:24px;
  }
  .form-group__label {
    font-family:'Sora',sans-serif; font-weight:700; font-size:.78rem;
    color:#94a3b8; text-transform:uppercase; letter-spacing:.6px;
    margin-bottom:12px; display:block;
  }
  .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }

  .form-field { display:flex; flex-direction:column; gap:5px; }
  .form-field label { font-size:.8rem; font-weight:500; color:#64748b; }

  .form-input {
    padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; color:#334155;
    background:#fff; outline:none; transition:border-color .2s;
    width:100%; box-sizing:border-box;
  }
  .form-input:focus { border-color:#1a2744; }
  .form-input:disabled { background:#f8fafc; color:#94a3b8; cursor:not-allowed; border-color:#f1f5f9; }

  .form-select {
    padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; color:#334155;
    background:#fff; outline:none; transition:border-color .2s;
    width:100%; box-sizing:border-box; cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 14px center; padding-right:36px;
  }
  .form-select:focus { border-color:#1a2744; }

  .field-readonly {
    padding:10px 14px; border:1.5px solid #f1f5f9; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.9rem; color:#94a3b8;
    background:#f8fafc; width:100%; box-sizing:border-box;
    display:flex; align-items:center; gap:8px;
  }
  .field-readonly__lock {
    flex-shrink:0; opacity:.5;
  }

  .divider { height:1px; background:#f1f5f9; margin:20px 0; }

  .form-actions {
    display:flex; justify-content:flex-end; gap:10px; margin-top:24px;
    padding-top:20px; border-top:1px solid #f1f5f9;
  }
  .btn-cancel {
    padding:10px 22px; border:1.5px solid #e2e8f0; border-radius:10px;
    background:#fff; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500;
    color:#475569; cursor:pointer; transition:border-color .2s;
  }
  .btn-cancel:hover { border-color:#1a2744; color:#1a2744; }
  .btn-save {
    padding:10px 24px; background:#1a2744; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.88rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s;
  }
  .btn-save:hover:not(:disabled) { background:#243057; }
  .btn-save:disabled { opacity:.6; cursor:not-allowed; }

  .btn-pwd {
    padding:10px 24px; background:#1a2744; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.88rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s; margin-top:4px; align-self:flex-start;
  }
  .btn-pwd:hover { background:#243057; }

  .toast-ok  { background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; padding:10px 16px; border-radius:10px; font-size:.85rem; font-weight:600; margin-bottom:16px; }
  .toast-err { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:10px 16px; border-radius:10px; font-size:.85rem; font-weight:600; margin-bottom:16px; }

  .identity-banner {
    background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:12px;
    padding:18px 20px; display:flex; align-items:center; gap:14px;
  }
  .identity-banner__icon {
    width:40px; height:40px; border-radius:10px; background:#16a34a;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .identity-banner__title { font-family:'Sora',sans-serif; font-weight:700; color:#16a34a; margin-bottom:2px; }
  .identity-banner__text  { font-size:.82rem; color:#475569; }
`;

const FILIERES = {
  IFRI: [
    "Génie Logiciel (GL)",
    "Intelligence Artificielle (IA)",
    "Sécurité Informatique (SI)",
    "Systèmes Embarqués et Internet des Objets (SE-IoT)",
    "Internet et Multimédia (IM)",
  ],
  EPAC: [
    "Génie Civil (GC)",
    "Génie Électrique (GE)",
    "Génie Informatique et Télécommunication (GIT)",
    "Génie Mécanique et Énergétique (GME)",
    "Génie Chimique - Procédés (GC-P)",
    "Maintenance Biomédicale et Hospitalière (MBH)",
    "Génie Biomédical (GBM)",
    "Machinisme Agricole (MA)",
  ],
  FSS: [
    "Médecine",
    "Pharmacie",
    "Kinésithérapie",
    "Nutrition et diététique",
    "Assistance sociale",
  ],
};

const NIVEAUX = ["Licence 1","Licence 2","Licence 3","Master 1","Master 2"];

const resolveInstKey = (sigle = "", nom = "") => {
  const s = (sigle || nom || "").toUpperCase();
  if (s.includes("IFRI")) return "IFRI";
  if (s.includes("EPAC")) return "EPAC";
  if (s.includes("FSS"))  return "FSS";
  return null;
};

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function MonProfil() {
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [errMsg,    setErrMsg]    = useState("");
  const [user,      setUser]      = useState(null);

  const [nom,         setNom]         = useState("");
  const [prenom,      setPrenom]      = useState("");
  const [email,       setEmail]       = useState("");
  const [filiere,     setFiliere]     = useState("");
  const [niveau,      setNiveau]      = useState("");
  const [matricule,   setMatricule]   = useState("");
  const [institution, setInstitution] = useState("");
  const [instKey,     setInstKey]     = useState("");

  const [pwdActuel,  setPwdActuel]  = useState("");
  const [pwdNew,     setPwdNew]     = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdMsg,     setPwdMsg]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMe();
        setUser(data);
        setNom(data.nom || "");
        setPrenom(data.prenom || "");
        setEmail(data.email || "");
        setFiliere(data.filiere || "");
        setNiveau(data.niveau || "");
        setMatricule(data.numeroEtudiant || "");
        const sigle = data.institution?.sigle || "";
        const nomInst = data.institution?.nom || "";
        setInstitution(sigle || nomInst);
        setInstKey(resolveInstKey(sigle, nomInst));
      } catch (err) {
        console.error(err);
        setErrMsg("Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filiereOptions = instKey ? FILIERES[instKey] || [] : [];

  const handleSave = async () => {
    setSaving(true); setSuccess(""); setErrMsg("");
    try {
      const token = localStorage.getItem("etudocs_token") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/utilisateurs/profil`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nom, prenom, filiere, niveau }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur serveur");
      setSuccess("Profil mis à jour avec succès.");
      const cached = localStorage.getItem("etudocs_user");
      if (cached) localStorage.setItem("etudocs_user", JSON.stringify({ ...JSON.parse(cached), nom, prenom, filiere, niveau }));
    } catch (e) {
      setErrMsg(e?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setNom(user.nom || ""); setPrenom(user.prenom || "");
    setFiliere(user.filiere || ""); setNiveau(user.niveau || "");
    setSuccess(""); setErrMsg("");
  };

  const handleChangePwd = async () => {
    setPwdMsg("");
    if (!pwdActuel || !pwdNew || !pwdConfirm) { setPwdMsg("error:Remplissez tous les champs."); return; }
    if (pwdNew !== pwdConfirm) { setPwdMsg("error:Les mots de passe ne correspondent pas."); return; }
    if (pwdNew.length < 8) { setPwdMsg("error:Minimum 8 caractères requis."); return; }
    try {
      const token = localStorage.getItem("etudocs_token") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ motDePasseActuel: pwdActuel, nouveauMotDePasse: pwdNew }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur serveur");
      setPwdMsg("ok:Mot de passe modifié avec succès.");
      setPwdActuel(""); setPwdNew(""); setPwdConfirm("");
    } catch (e) {
      setPwdMsg(`error:${e?.message}`);
    }
  };

  if (loading) {
    return <DashboardLayout><div style={{ padding:40, color:"#64748b" }}>Chargement...</div></DashboardLayout>;
  }

  const initials = `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase() || "EU";

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="profil-title">Mon profil</h2>
        <p className="profil-sub">Gérez vos informations personnelles et vos préférences</p>
      </div>

      {/* ── INFORMATIONS PERSONNELLES ── */}
      <div className="profil-section">
        <div className="profil-section__title">Informations personnelles</div>

        <div className="avatar-row">
          <div className="avatar-big">{initials}</div>
          <div>
            <div className="avatar-info__name">
              {prenom} {nom}
              <span className="verified-badge">✓ Identité vérifiée</span>
            </div>
            <div className="avatar-info__sub">{institution && `${institution}`} • {email}</div>
          </div>
        </div>

        {success && <div className="toast-ok">✓ {success}</div>}
        {errMsg  && <div className="toast-err">✗ {errMsg}</div>}

        {/* Infos fixes */}
        <div className="form-group">
          <span className="form-group__label">Identité</span>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Prénoms</label>
              <input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Nom</label>
              <input className="form-input" value={nom} onChange={e => setNom(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <span className="form-group__label">Informations de compte</span>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Email</label>
              <div className="field-readonly">
                <span className="field-readonly__lock"><LockIcon /></span>
                {email || "—"}
              </div>
            </div>
            <div className="form-field">
              <label>Numéro étudiant</label>
              <div className="field-readonly">
                <span className="field-readonly__lock"><LockIcon /></span>
                {matricule || "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <span className="form-group__label">Parcours académique</span>
          <div className="form-grid-3">
            <div className="form-field">
              <label>Institution</label>
              <div className="field-readonly">
                <span className="field-readonly__lock"><LockIcon /></span>
                {institution || "—"}
              </div>
            </div>
            <div className="form-field">
              <label>Filière</label>
              {filiereOptions.length > 0 ? (
                <select className="form-select" value={filiere} onChange={e => setFiliere(e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  {filiereOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              ) : (
                <input className="form-input" value={filiere} onChange={e => setFiliere(e.target.value)} placeholder="Votre filière" />
              )}
            </div>
            <div className="form-field">
              <label>Niveau d'études</label>
              <select className="form-select" value={niveau} onChange={e => setNiveau(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel" onClick={handleCancel} type="button">Annuler</button>
          <button className="btn-save" onClick={handleSave} disabled={saving} type="button">
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>

      {/* ── SÉCURITÉ ── */}
      <div className="profil-section">
        <div className="profil-section__title">Sécurité — Changer le mot de passe</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:560 }}>
          {pwdMsg && (
            <div className={pwdMsg.startsWith("ok:") ? "toast-ok" : "toast-err"}>
              {pwdMsg.replace(/^(ok:|error:)/, "")}
            </div>
          )}
          <div className="form-grid-2" style={{ gridTemplateColumns:"1fr" }}>
            <div className="form-field">
              <label>Mot de passe actuel</label>
              <input className="form-input" type="password" value={pwdActuel} onChange={e => setPwdActuel(e.target.value)} />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Nouveau mot de passe</label>
              <input className="form-input" type="password" value={pwdNew} onChange={e => setPwdNew(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Confirmer le nouveau mot de passe</label>
              <input className="form-input" type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} />
            </div>
          </div>
          <button className="btn-pwd" onClick={handleChangePwd} type="button">Modifier le mot de passe</button>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="profil-section">
        <div className="profil-section__title">Préférences de notification</div>
        <Toggle title="Notifications par email" sub="Recevez des emails pour les mises à jour importantes" defaultOn />
        <Toggle title="Demande validée" sub="Notification quand un document est disponible" defaultOn />
        <Toggle title="Demande rejetée" sub="Notification en cas de rejet avec la raison" defaultOn />
        <Toggle title="Rappels de paiement" sub="Rappels pour les paiements en attente" defaultOn />
        <Toggle title="Newsletter EtuDocs" sub="Actualités et nouvelles fonctionnalités" defaultOn={false} />
      </div>

      <div className="identity-banner">
        <div className="identity-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="identity-banner__title">Identité vérifiée ✓</div>
          <div className="identity-banner__text">Votre identité a été vérifiée par votre institution.</div>
        </div>
      </div>

    </DashboardLayout>
  );
}