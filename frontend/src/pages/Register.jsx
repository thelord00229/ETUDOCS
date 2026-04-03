import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --uac-green:     #2e7d32;
    --uac-green-dk:  #1b5e20;
    --uac-green-bg:  #f1f8e9;
    --uac-green-bd:  #c8e6c9;
    --white:   #ffffff;
    --g50:     #f8fafc;
    --g100:    #f1f5f9;
    --g200:    #e2e8f0;
    --g300:    #cbd5e1;
    --g400:    #94a3b8;
    --g500:    #64748b;
    --g600:    #475569;
    --g700:    #334155;
    --red-bg:  #fef2f2;
    --red-bd:  #fecaca;
    --red-tx:  #991b1b;
    --ok-bg:   #f0fdf4;
    --ok-bd:   #bbf7d0;
    --ok-tx:   #166534;
  }

  html, body, #root { margin:0; padding:0; width:100%; min-height:100%; font-family:'DM Sans',sans-serif; }

  .page {
    min-height: 100vh;
    background: #f4f6f9;
    display: flex; flex-direction: column; align-items: center;
    padding: 40px 16px 60px;
  }

  /* ── HEADER UAC ── */
  .uac-header {
    width: 100%; max-width: 640px;
    display: flex; align-items: center; justify-content: center; gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
  }
  .uac-header__logo {
    width: 52px; height: 52px; object-fit: contain; border-radius: 10px;
  }
  .uac-header__text { text-align: left; }
  .uac-header__title {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.25rem;
    color: var(--uac-green); letter-spacing: -0.3px; line-height: 1.2;
  }
  .uac-header__sub {
    font-size: .75rem; color: var(--g500); margin-top: 2px;
    text-transform: uppercase; letter-spacing: .06em;
  }

  /* ── STEPPER ── */
  .stepper {
    display: flex; align-items: center;
    margin-bottom: 24px; width:100%; max-width:640px;
  }
  .step-item { display:flex; align-items:center; gap:10px; }
  .step-circle {
    width:38px; height:38px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem;
    flex-shrink:0; transition: background .3s, border .3s;
  }
  .step-circle.done   { background:var(--uac-green); color:#fff; }
  .step-circle.active { background:var(--uac-green); color:#fff; }
  .step-circle.idle   { background:#fff; color:var(--g400); border:2px solid var(--g300); }
  .step-label {
    font-family:'Sora',sans-serif; font-size:.88rem; font-weight:600; white-space:nowrap;
  }
  .step-label.active { color:var(--uac-green); }
  .step-label.done   { color:var(--uac-green); }
  .step-label.idle   { color:var(--g400); }
  .step-line { flex:1; height:2px; margin:0 12px; transition: background .3s; }
  .step-line.done { background:var(--uac-green); }
  .step-line.idle { background:var(--g200); }

  /* ── BANNER INFO ── */
  .banner {
    width:100%; max-width:640px;
    background:var(--uac-green-bg); border:1px solid var(--uac-green-bd);
    border-radius:10px; padding:11px 16px;
    display:flex; align-items:flex-start; gap:10px;
    color:var(--uac-green); font-size:.85rem; line-height:1.5;
    margin-bottom:16px;
  }
  .banner svg { flex-shrink:0; margin-top:1px; }

  /* ── ALERTS ── */
  .alert {
    width:100%; max-width:640px;
    border-radius:10px; padding:11px 16px;
    display:flex; align-items:flex-start; gap:10px;
    font-size:.85rem; line-height:1.5; margin-bottom:12px;
  }
  .alert.error { background:var(--red-bg); border:1px solid var(--red-bd); color:var(--red-tx); }
  .alert.ok    { background:var(--ok-bg);  border:1px solid var(--ok-bd);  color:var(--ok-tx); }

  /* ── CARD ── */
  .card {
    background:var(--white); border-radius:16px;
    box-shadow:0 2px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    padding:34px 40px 30px;
    width:100%; max-width:640px;
    border-top: 4px solid var(--uac-green);
  }
  .card__title {
    font-family:'Sora',sans-serif; font-size:1.4rem; font-weight:800;
    color:#1e293b; margin-bottom:24px;
  }

  /* ── FORM ── */
  .form { display:flex; flex-direction:column; gap:18px; }
  .field { display:flex; flex-direction:column; gap:6px; }
  label { font-size:.86rem; font-weight:600; color:var(--g700); }
  .hint { font-size:.76rem; color:var(--g400); margin-top:2px; }

  input, select {
    width:100%; padding:11px 14px;
    border:1.5px solid var(--g200); border-radius:9px;
    font-family:'DM Sans',sans-serif; font-size:.93rem; color:var(--g700);
    background:var(--g50); outline:none; appearance:none;
    transition:border-color .2s, box-shadow .2s, background .2s;
  }
  input:focus, select:focus {
    border-color:var(--uac-green); background:var(--white);
    box-shadow:0 0 0 3px rgba(46,125,50,.1);
  }
  input::placeholder { color:var(--g300); }

  .select-wrap { position:relative; }
  .select-wrap::after {
    content:'▾'; position:absolute; right:14px; top:50%;
    transform:translateY(-50%); color:var(--g400); pointer-events:none;
  }
  .select-wrap select { cursor:pointer; padding-right:36px; }

  /* ── BOUTONS ── */
  .btn-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px; }

  .btn-outline {
    padding:12px; border:1.5px solid var(--g200); background:var(--white);
    border-radius:9px; font-family:'Sora',sans-serif; font-size:.92rem;
    font-weight:600; color:var(--g700); cursor:pointer;
    transition:border-color .2s, color .2s;
  }
  .btn-outline:hover { border-color:var(--uac-green); color:var(--uac-green); }

  .btn-continue {
    width:100%; padding:13px; background:var(--uac-green); color:#fff; border:none;
    border-radius:9px; font-family:'Sora',sans-serif; font-size:.95rem;
    font-weight:700; cursor:pointer;
    transition:background .2s, transform .15s, box-shadow .2s;
  }
  .btn-continue:hover {
    background:var(--uac-green-dk);
    transform:translateY(-1px);
    box-shadow:0 6px 20px rgba(46,125,50,.25);
  }

  .btn-green {
    padding:12px; background:var(--uac-green); color:#fff; border:none;
    border-radius:9px; font-family:'Sora',sans-serif; font-size:.92rem;
    font-weight:700; cursor:pointer;
    transition:background .2s, transform .15s;
  }
  .btn-green:hover { background:var(--uac-green-dk); transform:translateY(-1px); }

  button:disabled { opacity:.55; cursor:not-allowed; transform:none !important; box-shadow:none !important; }

  /* ── FOOTER ── */
  .card__footer {
    border-top:1px solid var(--g100); margin-top:22px; padding-top:16px;
    text-align:center; font-size:.86rem; color:var(--g500);
  }
  .card__footer a { color:var(--uac-green); font-weight:600; text-decoration:none; }
  .card__footer a:hover { text-decoration:underline; }

  .back {
    margin-top:18px; font-size:.86rem; color:var(--g400);
    text-decoration:none; transition:color .2s;
  }
  .back:hover { color:var(--uac-green); }

  .powered {
    margin-top:10px; font-size:.73rem; color:#cbd5e1;
    display:flex; align-items:center; gap:6px;
  }
  .powered__dot { width:5px; height:5px; border-radius:50%; background:var(--uac-green); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .card { animation:fadeUp .3s ease; }
`;

const NIVEAUX = [
  "Licence 1 (L1)", "Licence 2 (L2)", "Licence 3 (L3)",
  "Master 1 (M1)", "Master 2 (M2)",
  "Doctorat 1ère année", "Doctorat 2ème année", "Doctorat 3ème année",
];

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
    "Médecine", "Pharmacie", "Kinésithérapie",
    "Nutrition et diététique", "Assistance sociale",
  ],
};

const normalizeCode = (v) => String(v || "").trim().toUpperCase();

const FALLBACK_INSTITUTIONS = [
  { value: "IFRI", label: "IFRI - Institut de Formation et de Recherche en Informatique" },
  { value: "EPAC", label: "EPAC - École Polytechnique d'Abomey-Calavi" },
  { value: "FSS",  label: "FSS - Faculté des Sciences de la Santé" },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Register() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg]     = useState("");

  const [institutions, setInstitutions] = useState(FALLBACK_INSTITUTIONS);
  const [instLoading, setInstLoading]   = useState(false);

  const [numEtudiant, setNumEtudiant] = useState("");
  const [prenom, setPrenom]           = useState("");
  const [nom, setNom]                 = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");

  const [institution, setInstitution] = useState("");
  const [filiere, setFiliere]         = useState("");
  const [niveau, setNiveau]           = useState("");

  useEffect(() => {
    const load = async () => {
      setInstLoading(true);
      try {
        const res  = await fetch(`${API_URL}/api/institutions`);
        const data = await res.json().catch(() => []);
        if (Array.isArray(data) && data.length) {
          const mapped = data
            .map((x) => {
              const code = normalizeCode(x.sigle);
              return code ? { value: code, label: `${code} - ${x.nom}` } : null;
            })
            .filter(Boolean);
          setInstitutions(mapped.length ? mapped : FALLBACK_INSTITUTIONS);
          setInstitution((prev) => {
            const p = normalizeCode(prev);
            return mapped.some((m) => m.value === p) ? p : (mapped[0]?.value || "IFRI");
          });
        } else {
          setInstitutions(FALLBACK_INSTITUTIONS);
          setInstitution((prev) => normalizeCode(prev) || "IFRI");
        }
      } catch {
        setInstitutions(FALLBACK_INSTITUTIONS);
        setInstitution((prev) => normalizeCode(prev) || "IFRI");
      } finally {
        setInstLoading(false);
      }
    };
    load();
  }, [API_URL]);

  const filieresDisponibles = useMemo(() => FILIERES[institution] || [], [institution]);
  const passwordMismatch    = useMemo(() => confirm.length > 0 && password !== confirm, [password, confirm]);

  const goStep2 = (e) => {
    e.preventDefault();
    setErrorMsg(""); setOkMsg("");
    if (!numEtudiant.trim() || !prenom.trim() || !nom.trim() || !email.trim()) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires."); return;
    }
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères."); return;
    }
    if (passwordMismatch) {
      setErrorMsg("Les mots de passe ne correspondent pas."); return;
    }
    setStep(2); window.scrollTo(0, 0);
  };

  const goBack = () => {
    setErrorMsg(""); setOkMsg(""); setStep(1); window.scrollTo(0, 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setOkMsg("");
    if (!institution || !filiere.trim() || !niveau) {
      setErrorMsg("Veuillez compléter les informations académiques."); return;
    }
    if (passwordMismatch) {
      setErrorMsg("Les mots de passe ne correspondent pas."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroEtudiant: numEtudiant.trim(),
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email.trim().toLowerCase(),
          password,
          institutionSigle: normalizeCode(institution),
          filiere: filiere.trim(),
          niveau,
        }),
      });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data   = isJson ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(data?.message || "Inscription impossible.");
      setOkMsg(data?.message || "Compte créé. Vérifiez votre boîte mail.");
      setTimeout(() => { window.location.href = "/login"; }, 900);
    } catch (err) {
      setErrorMsg(err?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style>{css}</style>

      {/* Header UAC */}
      <div className="uac-header">
        <img src={logo} alt="EtuDocs" className="uac-header__logo" />
        <div className="uac-header__text">
          <div className="uac-header__title">EtuDocs — UAC</div>
          <div className="uac-header__sub">Université d'Abomey-Calavi</div>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper">
        <div className="step-item">
          <div className={`step-circle ${step > 1 ? "done" : "active"}`}>
            {step > 1 ? <CheckIcon /> : "1"}
          </div>
          <span className={`step-label ${step > 1 ? "done" : "active"}`}>
            Informations personnelles
          </span>
        </div>
        <div className={`step-line ${step > 1 ? "done" : "idle"}`} />
        <div className="step-item">
          <div className={`step-circle ${step === 2 ? "active" : "idle"}`}>2</div>
          <span className={`step-label ${step === 2 ? "active" : "idle"}`}>
            Informations académiques
          </span>
        </div>
      </div>

      {/* Banner */}
      <div className="banner">
        <InfoIcon />
        Un email de vérification sera envoyé à votre adresse après l'inscription.
      </div>

      {errorMsg && <div className="alert error"><InfoIcon /> {errorMsg}</div>}
      {okMsg    && <div className="alert ok"><InfoIcon /> {okMsg}</div>}

      {/* ── ÉTAPE 1 ── */}
      {step === 1 && (
        <div className="card" key="step1">
          <h2 className="card__title">Créer un compte étudiant</h2>
          <form className="form" onSubmit={goStep2}>

            <div className="field">
              <label>Numéro étudiant *</label>
              <input type="text" placeholder="Ex: 20220001"
                value={numEtudiant} onChange={(e) => setNumEtudiant(e.target.value)}
                required disabled={loading} />
              <span className="hint">Votre numéro d'identification étudiant</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="field">
                <label>Prénom(s) *</label>
                <input type="text" placeholder="Ex: Jean Michel"
                  value={prenom} onChange={(e) => setPrenom(e.target.value)}
                  required disabled={loading} />
              </div>
              <div className="field">
                <label>Nom *</label>
                <input type="text" placeholder="Ex: DUPONT"
                  value={nom} onChange={(e) => setNom(e.target.value)}
                  required disabled={loading} />
              </div>
            </div>

            <div className="field">
              <label>Email *</label>
              <input type="email" placeholder="votre.email@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={loading} />
            </div>

            <div className="field">
              <label>Mot de passe *</label>
              <input type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                minLength={8} required disabled={loading} />
              <span className="hint">Minimum 8 caractères</span>
            </div>

            <div className="field">
              <label>Confirmer le mot de passe *</label>
              <input type="password" placeholder="••••••••"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required disabled={loading} />
              {passwordMismatch && (
                <span className="hint" style={{ color:"#ef4444" }}>
                  Les mots de passe ne correspondent pas.
                </span>
              )}
            </div>

            <button type="submit" className="btn-continue" disabled={loading}>
              Continuer →
            </button>
          </form>

          <div className="card__footer">
            Vous avez déjà un compte ? <a href="/login">Se connecter</a>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 ── */}
      {step === 2 && (
        <div className="card" key="step2">
          <h2 className="card__title">Informations académiques</h2>
          <form className="form" onSubmit={submit}>

            <div className="field">
              <label>Institution *</label>
              <div className="select-wrap">
                <select value={institution}
                  onChange={(e) => { setInstitution(normalizeCode(e.target.value)); setFiliere(""); }}
                  required disabled={loading || instLoading}>
                  <option value="" disabled>
                    {instLoading ? "Chargement..." : "Sélectionnez votre institution"}
                  </option>
                  {institutions.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Filière *</label>
              <div className="select-wrap">
                <select value={filiere} onChange={(e) => setFiliere(e.target.value)}
                  required disabled={loading || !institution}>
                  <option value="" disabled>
                    {institution ? "Sélectionnez votre filière" : "Choisissez d'abord une institution"}
                  </option>
                  {filieresDisponibles.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Niveau d'études *</label>
              <div className="select-wrap">
                <select value={niveau} onChange={(e) => setNiveau(e.target.value)}
                  required disabled={loading}>
                  <option value="" disabled>Sélectionnez votre niveau</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="btn-row">
              <button type="button" className="btn-outline" onClick={goBack} disabled={loading}>
                ← Retour
              </button>
              <button type="submit" className="btn-green" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </div>
          </form>

          <div className="card__footer">
            Vous avez déjà un compte ? <a href="/login">Se connecter</a>
          </div>
        </div>
      )}

      <a href="/" className="back">← Retour à l'accueil</a>
      <div className="powered">
        <div className="powered__dot" />
        Plateforme numérique UAC · EtuDocs
      </div>
    </div>
  );
}