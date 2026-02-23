import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:     #1a2744;
    --navy-dk:  #0f1a33;
    --gold:     #f5a623;
    --gold-lt:  #fbbf4a;
    --white:    #ffffff;
    --g50:      #f8fafc;
    --g100:     #f1f5f9;
    --g200:     #e2e8f0;
    --g300:     #cbd5e1;
    --g400:     #94a3b8;
    --g600:     #475569;
    --g700:     #334155;
    --blue-link:#1a2744;
  }

  html, body, #root {
    margin: 0; padding: 0; width: 100%; height: 100%;
    font-family: 'DM Sans', sans-serif;
  }

  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #eef2f8 0%, #f8fafc 40%, #edf1f7 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 16px 60px;
  }

  /* LOGO */
  .brand {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.5rem;
    color: var(--navy); text-decoration: none; margin-bottom: 40px;
  }
  .brand__icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
  }

  /* CARD */
  .card {
    background: var(--white);
    border-radius: 20px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    padding: 40px 44px 36px;
    width: 100%; max-width: 460px;
  }

  .card__title {
    font-family: 'Sora', sans-serif;
    font-size: 1.9rem; font-weight: 800;
    color: var(--navy); text-align: center; margin-bottom: 8px;
  }
  .card__sub {
    color: var(--g400); font-size: 0.95rem;
    text-align: center; margin-bottom: 32px;
  }

  /* TABS */
  .tabs {
    display: grid; grid-template-columns: repeat(3, 1fr);
    background: var(--g100); border-radius: 12px;
    padding: 4px; gap: 2px; margin-bottom: 28px;
  }
  .tab {
    font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600;
    color: var(--g600); background: none; border: none; cursor: pointer;
    padding: 10px 0; border-radius: 9px;
    transition: background .2s, color .2s, box-shadow .2s;
  }
  .tab.active {
    background: var(--white); color: var(--navy);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .tab:hover:not(.active) { color: var(--navy); }

  /* FORM */
  .form { display: flex; flex-direction: column; gap: 18px; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field__row {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
  }
  label {
    font-size: 0.9rem; font-weight: 500; color: var(--g700);
  }
  .forgot {
    font-size: 0.85rem; color: var(--navy); font-weight: 500;
    text-decoration: none; opacity: .85;
  }
  .forgot:hover { opacity: 1; text-decoration: underline; }

  input, select {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid var(--g200); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: var(--g700);
    background: var(--g50);
    transition: border-color .2s, box-shadow .2s;
    outline: none; appearance: none;
  }
  input:focus, select:focus {
    border-color: var(--navy); background: var(--white);
    box-shadow: 0 0 0 3px rgba(26,39,68,0.08);
  }
  input::placeholder { color: var(--g300); }

  .select-wrap { position: relative; }
  .select-wrap::after {
    content: '▾'; position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%); color: var(--g400); pointer-events: none; font-size: 1rem;
  }
  .select-wrap select { cursor: pointer; padding-right: 36px; }

  /* SUBMIT */
  .btn-submit {
    width: 100%; padding: 14px;
    background: var(--navy); color: var(--white);
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem;
    border: none; border-radius: 12px; cursor: pointer;
    transition: background .2s, transform .15s, box-shadow .2s;
    margin-top: 4px;
  }
  .btn-submit:hover {
    background: #243057;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26,39,68,0.25);
  }

  /* FOOTER CARD */
  .card__footer {
    border-top: 1px solid var(--g200); margin-top: 24px; padding-top: 20px;
    text-align: center; font-size: 0.9rem; color: var(--g600);
  }
  .card__footer a { color: var(--navy); font-weight: 600; text-decoration: none; }
  .card__footer a:hover { text-decoration: underline; }

  .back {
    margin-top: 24px; font-size: 0.9rem; color: var(--g600);
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: color .2s;
  }
  .back:hover { color: var(--navy); }

  /* FADE ANIM */
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  .form { animation: fadeIn .25s ease; }
`;

const TABS = ["Étudiant", "Agent", "Admin"];

const INSTITUTIONS = ["IFRI", "EPAC", "FSS"];

export default function Login() {
    const [active, setActive] = useState(0);
    const [institution, setInstitution] = useState("IFRI");
    const [showPass, setShowPass] = useState(false);

    const isEtudiant = active === 0;
    const isAgent    = active === 1;
    const isAdmin    = active === 2;

    return (
        <div className="page">
            <style>{css}</style>

            {/* Logo */}
            <a href="/" className="brand">
                <div className="brand__icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                         stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                </div>
                EtuDocs
            </a>


            <div className="card">
                <h1 className="card__title">Connexion</h1>
                <p className="card__sub">Accédez à votre espace personnel</p>

                {/* Tabs */}
                <div className="tabs">
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            className={`tab${active === i ? " active" : ""}`}
                            onClick={() => setActive(i)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Form — change selon l'onglet */}
                <div className="form" key={active}>

                    {/* Institution — visible pour Étudiant et Agent */}
                    {(isEtudiant || isAgent) && (
                        <div className="field">
                            <label>Institution</label>
                            <div className="select-wrap">
                                <select value={institution} onChange={e => setInstitution(e.target.value)}>
                                    {INSTITUTIONS.map(i => <option key={i}>{i}</option>)}
                                </select>
                            </div>
                        </div>
                    )}


                    {isEtudiant && (
                        <div className="field">
                            <label>Numéro étudiant</label>
                            <input type="text" placeholder="Ex: 20220001" />
                        </div>
                    )}

                    {/* Email — Agent et Admin */}
                    {(isAgent || isAdmin) && (
                        <div className="field">
                            <label>Email</label>
                            <input type="email" placeholder="votre.email@example.com" />
                        </div>
                    )}

                    {/* Mot de passe — tous */}
                    <div className="field">
                        <div className="field__row">
                            <label>Mot de passe</label>
                            <a href="#" className="forgot">Mot de passe oublié ?</a>
                        </div>
                        <input
                            type={showPass ? "text" : "password"}
                            defaultValue="12345678"
                            placeholder="••••••••"
                        />
                    </div>

                    <button className="btn-submit">Se connecter</button>
                </div>

                {/* Footer card — uniquement Étudiant */}
                {isEtudiant && (
                    <div className="card__footer">
                        Vous n'avez pas encore de compte ? <a href="/register">Créer un compte</a>
                    </div>
                )}
            </div>

            <a href="/" className="back">← Retour à l'accueil</a>
        </div>
    );
}