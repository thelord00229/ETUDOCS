import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:    #1a2744;
    --navy2:   #243057;
    --green:   #16a34a;
    --green-lt:#15803d;
    --white:   #ffffff;
    --g50:     #f8fafc;
    --g100:    #f1f5f9;
    --g200:    #e2e8f0;
    --g300:    #cbd5e1;
    --g400:    #94a3b8;
    --g600:    #475569;
    --g700:    #334155;
    --blue-bg: #eff6ff;
    --blue-bd: #bfdbfe;
    --blue-tx: #1e40af;
  }

  html, body, #root { margin:0; padding:0; width:100%; min-height:100%; font-family:'DM Sans',sans-serif; }

  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #eef2f8 0%, #f8fafc 45%, #edf1f7 100%);
    display: flex; flex-direction: column; align-items: center;
    padding: 40px 16px 60px;
  }

  /* BRAND */
  .brand {
    display: flex; align-items: center; gap: 12px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:1.5rem;
    color:var(--navy); text-decoration:none; margin-bottom:32px;
  }
  .brand__icon {
    width:48px; height:48px; border-radius:12px; background:var(--navy);
    display:flex; align-items:center; justify-content:center;
  }

  /* STEPPER */
  .stepper {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 28px; width:100%; max-width:620px;
  }
  .step-item { display:flex; align-items:center; gap:10px; }
  .step-circle {
    width:40px; height:40px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:700; font-size:1rem;
    flex-shrink:0; transition: background .3s, border .3s;
  }
  .step-circle.done   { background:var(--navy); color:#fff; }
  .step-circle.active { background:var(--navy); color:#fff; }
  .step-circle.idle   { background:#fff; color:var(--g400); border:2px solid var(--g300); }
  .step-label {
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:600;
    white-space:nowrap;
  }
  .step-label.active { color:var(--navy); }
  .step-label.idle   { color:var(--g400); }
  .step-label.done   { color:var(--navy); }
  .step-line {
    flex:1; height:2px; margin:0 12px;
    transition: background .3s;
  }
  .step-line.done   { background:var(--navy); }
  .step-line.idle   { background:var(--g200); }

  /* INFO BANNER */
  .banner {
    width:100%; max-width:620px;
    background:var(--blue-bg); border:1px solid var(--blue-bd);
    border-radius:10px; padding:12px 16px;
    display:flex; align-items:flex-start; gap:10px;
    color:var(--blue-tx); font-size:.88rem; line-height:1.5;
    margin-bottom:20px;
  }
  .banner svg { flex-shrink:0; margin-top:1px; }

  /* CARD */
  .card {
    background:var(--white); border-radius:18px;
    box-shadow:0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    padding:36px 40px 32px;
    width:100%; max-width:620px;
  }
  .card__title {
    font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800;
    color:var(--navy); margin-bottom:28px;
  }

  /* FORM */
  .form { display:flex; flex-direction:column; gap:20px; }
  .field { display:flex; flex-direction:column; gap:6px; }
  label { font-size:.88rem; font-weight:500; color:var(--g700); }
  .hint { font-size:.78rem; color:var(--g400); margin-top:2px; }

  input, select {
    width:100%; padding:12px 14px;
    border:1.5px solid var(--g200); border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:.95rem; color:var(--g700);
    background:var(--g50); outline:none; appearance:none;
    transition:border-color .2s, box-shadow .2s, background .2s;
  }
  input:focus, select:focus {
    border-color:var(--navy); background:var(--white);
    box-shadow:0 0 0 3px rgba(26,39,68,.08);
  }
  input::placeholder { color:var(--g300); }

  .select-wrap { position:relative; }
  .select-wrap::after {
    content:'▾'; position:absolute; right:14px; top:50%;
    transform:translateY(-50%); color:var(--g400); pointer-events:none;
  }
  .select-wrap select { cursor:pointer; padding-right:36px; }

  /* BOUTONS */
  .btn-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px; }
  .btn-outline {
    padding:13px; border:1.5px solid var(--g200); background:var(--white);
    border-radius:10px; font-family:'Sora',sans-serif; font-size:.95rem;
    font-weight:600; color:var(--g700); cursor:pointer;
    transition:border-color .2s, color .2s;
  }
  .btn-outline:hover { border-color:var(--navy); color:var(--navy); }

  .btn-primary {
    padding:13px; background:var(--navy); color:#fff; border:none;
    border-radius:10px; font-family:'Sora',sans-serif; font-size:.95rem;
    font-weight:700; cursor:pointer;
    transition:background .2s, transform .15s, box-shadow .2s;
  }
  .btn-primary:hover { background:var(--navy2); transform:translateY(-1px); box-shadow:0 6px 20px rgba(26,39,68,.25); }

  .btn-continue {
    width:100%; padding:14px; background:var(--navy); color:#fff; border:none;
    border-radius:10px; font-family:'Sora',sans-serif; font-size:1rem;
    font-weight:700; cursor:pointer;
    transition:background .2s, transform .15s, box-shadow .2s;
  }
  .btn-continue:hover { background:var(--navy2); transform:translateY(-1px); box-shadow:0 6px 20px rgba(26,39,68,.25); }

  .btn-green {
    padding:13px; background:var(--green); color:#fff; border:none;
    border-radius:10px; font-family:'Sora',sans-serif; font-size:.95rem;
    font-weight:700; cursor:pointer;
    transition:background .2s, transform .15s;
  }
  .btn-green:hover { background:var(--green-lt); transform:translateY(-1px); }

  /* FOOTER */
  .card__footer {
    border-top:1px solid var(--g200); margin-top:24px; padding-top:18px;
    text-align:center; font-size:.88rem; color:var(--g600);
  }
  .card__footer a { color:var(--navy); font-weight:600; text-decoration:none; }
  .card__footer a:hover { text-decoration:underline; }

  .back { margin-top:20px; font-size:.88rem; color:var(--g600); text-decoration:none; transition:color .2s; }
  .back:hover { color:var(--navy); }

  /* ANIM */
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .card { animation:fadeUp .3s ease; }
`;

const NIVEAUX = [
    "Licence 1 (L1)", "Licence 2 (L2)", "Licence 3 (L3)",
    "Master 1 (M1)", "Master 2 (M2)",
    "Doctorat 1ère année", "Doctorat 2ème année", "Doctorat 3ème année",
];

const INSTITUTIONS = [
    { value: "IFRI", label: "IFRI - Institut de Formation et de Recherche en Informatique" },
    { value: "EPAC", label: "EPAC - École Polytechnique d'Abomey-Calavi" },
    { value: "FSS",  label: "FSS - Faculté des Sciences de la Santé" },
];

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

const DocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
);

export default function Register() {
    const [step, setStep] = useState(1);

    // Étape 1
    const [numEtudiant, setNumEtudiant] = useState("");
    const [nomComplet,  setNomComplet]  = useState("");
    const [email,       setEmail]       = useState("");
    const [password,    setPassword]    = useState("");
    const [confirm,     setConfirm]     = useState("");

    // Étape 2
    const [institution, setInstitution] = useState("");
    const [filiere,     setFiliere]     = useState("");
    const [niveau,      setNiveau]      = useState("");

    const goStep2 = (e) => { e.preventDefault(); setStep(2); window.scrollTo(0,0); };
    const goBack  = ()    => setStep(1);
    const submit  = (e)   => { e.preventDefault(); alert("Compte créé !"); };

    return (
        <div className="page">
            <style>{css}</style>

            {/* Brand */}
            <a href="/" className="brand">
                <div className="brand__icon"><DocIcon /></div>
                EtuDocs
            </a>

            {/* Stepper */}
            <div className="stepper">
                <div className="step-item">
                    <div className={`step-circle ${step > 1 ? "done" : "active"}`}>
                        {step > 1 ? <CheckIcon /> : "1"}
                    </div>
                    <span className={`step-label ${step > 1 ? "done" : "active"}`}>Informations personnelles</span>
                </div>

                <div className={`step-line ${step > 1 ? "done" : "idle"}`} />

                <div className="step-item">
                    <div className={`step-circle ${step === 2 ? "active" : "idle"}`}>2</div>
                    <span className={`step-label ${step === 2 ? "active" : "idle"}`}>Informations académiques</span>
                </div>
            </div>

            {/* Banner */}
            <div className="banner">
                <InfoIcon />
                Un email de vérification sera envoyé à votre adresse après l'inscription.
            </div>

            {/* ── ÉTAPE 1 ── */}
            {step === 1 && (
                <div className="card" key="step1">
                    <h2 className="card__title">Créer un compte étudiant</h2>
                    <form className="form" onSubmit={goStep2}>
                        <div className="field">
                            <label>Numéro étudiant *</label>
                            <input
                                type="text" placeholder="Ex: 20220001"
                                value={numEtudiant} onChange={e => setNumEtudiant(e.target.value)}
                                required
                            />
                            <span className="hint">Votre numéro d'identification étudiant</span>
                        </div>
                        <div className="field">
                            <label>Nom complet *</label>
                            <input
                                type="text" placeholder="Prénom(s) NOM"
                                value={nomComplet} onChange={e => setNomComplet(e.target.value)}
                                required
                            />
                        </div>
                        <div className="field">
                            <label>Email *</label>
                            <input
                                type="email" placeholder="votre.email@example.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="field">
                            <label>Mot de passe *</label>
                            <input
                                type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                minLength={8} required
                            />
                            <span className="hint">Minimum 8 caractères</span>
                        </div>
                        <div className="field">
                            <label>Confirmer le mot de passe *</label>
                            <input
                                type="password" placeholder="••••••••"
                                value={confirm} onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-continue">Continuer</button>
                    </form>
                    <div className="card__footer">
                        Vous avez déjà un compte ? <a href="/login">Se connecter</a>
                    </div>
                </div>
            )}

            {/* ── ÉTAPE 2 ── */}
            {step === 2 && (
                <div className="card" key="step2">
                    <h2 className="card__title">Créer un compte étudiant</h2>
                    <form className="form" onSubmit={submit}>
                        <div className="field">
                            <label>Institution *</label>
                            <div className="select-wrap">
                                <select value={institution} onChange={e => setInstitution(e.target.value)} required>
                                    <option value="" disabled>Sélectionnez votre institution</option>
                                    {INSTITUTIONS.map(i => (
                                        <option key={i.value} value={i.value}>{i.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="field">
                            <label>Filière *</label>
                            <input
                                type="text" placeholder="Ex: Génie Logiciel"
                                value={filiere} onChange={e => setFiliere(e.target.value)}
                                required
                            />
                        </div>
                        <div className="field">
                            <label>Niveau d'études *</label>
                            <div className="select-wrap">
                                <select value={niveau} onChange={e => setNiveau(e.target.value)} required>
                                    <option value="" disabled>Sélectionnez votre niveau</option>
                                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="btn-row">
                            <button type="button" className="btn-outline" onClick={goBack}>Retour</button>
                            <button type="submit" className="btn-green">Créer mon compte</button>
                        </div>
                    </form>
                    <div className="card__footer">
                        Vous avez déjà un compte ? <a href="/login">Se connecter</a>
                    </div>
                </div>
            )}

            <a href="/" className="back">← Retour à l'accueil</a>
        </div>
    );
}