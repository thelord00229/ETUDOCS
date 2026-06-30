import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { requestPasswordReset } from "../services/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { margin:0; padding:0; width:100%; height:100%; font-family:'DM Sans',sans-serif; }

  .page { min-height:100vh; background:#f4f6f9; display:flex; flex-direction:column;
          align-items:center; padding:48px 16px 60px; }

  .uac-header { width:100%; max-width:500px; display:flex; align-items:center;
                justify-content:center; gap:16px; margin-bottom:32px; padding-bottom:20px;
                border-bottom:2px solid #e2e8f0; }
  .uac-header__logo { width:56px; height:56px; object-fit:contain; border-radius:10px; }
  .uac-header__text { text-align:left; }
  .uac-header__title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.3rem;
                       color:#2e7d32; letter-spacing:-0.3px; line-height:1.2; }
  .uac-header__sub { font-size:.78rem; color:#64748b; margin-top:2px;
                     text-transform:uppercase; letter-spacing:.06em; }

  .card { background:#fff; border-radius:16px;
          box-shadow:0 2px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
          padding:36px 40px 32px; width:100%; max-width:460px; border-top:4px solid #2e7d32; }
  .card__title { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800;
                 color:#1e293b; text-align:center; margin-bottom:6px; }
  .card__sub { color:#94a3b8; font-size:.9rem; text-align:center; margin-bottom:28px; line-height:1.5; }

  .form { display:flex; flex-direction:column; gap:16px; animation:fadeIn .25s ease; }
  .field { display:flex; flex-direction:column; gap:6px; }
  label { font-size:.88rem; font-weight:600; color:#334155; }
  input { width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:9px;
          font-family:'DM Sans',sans-serif; font-size:.93rem; color:#334155; background:#f8fafc;
          transition:border-color .2s, box-shadow .2s; outline:none; }
  input:focus { border-color:#2e7d32; background:#fff; box-shadow:0 0 0 3px rgba(46,125,50,0.1); }
  input::placeholder { color:#cbd5e1; }

  .btn-submit { width:100%; padding:13px; background:#2e7d32; color:#fff;
                font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem;
                border:none; border-radius:10px; cursor:pointer;
                transition:background .2s, transform .15s, box-shadow .2s; margin-top:4px; }
  .btn-submit:hover:not(:disabled) { background:#1b5e20; transform:translateY(-1px);
                                     box-shadow:0 6px 20px rgba(46,125,50,0.25); }
  .btn-submit:disabled { opacity:.7; cursor:not-allowed; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .btn-spinner { display:inline-block; width:15px; height:15px; border:2px solid rgba(255,255,255,.35);
                 border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite;
                 vertical-align:middle; margin-right:6px; }

  .alert-err { background:#fef2f2; border:1px solid #fecaca; border-radius:8px;
               padding:10px 14px; font-size:.85rem; color:#dc2626; }

  /* Signature : etat de confirmation */
  .sent { text-align:center; animation:fadeIn .3s ease; }
  .sent__check { width:64px; height:64px; margin:4px auto 18px; border-radius:50%;
                 background:#e8f5e9; display:grid; place-items:center; }
  .sent__check svg { width:30px; height:30px; stroke:#2e7d32; stroke-width:3;
                     fill:none; stroke-linecap:round; stroke-linejoin:round;
                     stroke-dasharray:48; stroke-dashoffset:48; animation:draw .5s .15s ease forwards; }
  @keyframes draw { to { stroke-dashoffset:0; } }
  .sent__title { font-family:'Sora',sans-serif; font-size:1.25rem; font-weight:800;
                 color:#1e293b; margin-bottom:8px; }
  .sent__body { color:#64748b; font-size:.9rem; line-height:1.6; margin-bottom:6px; }
  .sent__email { color:#1e293b; font-weight:600; }
  .sent__hint { color:#94a3b8; font-size:.82rem; margin-top:14px; }
  .resend { background:none; border:none; color:#2e7d32; font-weight:600; font-size:.88rem;
            cursor:pointer; padding:0; font-family:'DM Sans',sans-serif; }
  .resend:hover:not(:disabled) { text-decoration:underline; }
  .resend:disabled { color:#cbd5e1; cursor:not-allowed; }

  .card__footer { border-top:1px solid #f1f5f9; margin-top:24px; padding-top:18px;
                  text-align:center; font-size:.88rem; color:#64748b; }
  .card__footer a { color:#2e7d32; font-weight:600; text-decoration:none; }
  .card__footer a:hover { text-decoration:underline; }

  .back { margin-top:20px; font-size:.88rem; color:#94a3b8; text-decoration:none;
          display:flex; align-items:center; gap:6px; transition:color .2s; }
  .back:hover { color:#2e7d32; }
  .powered { margin-top:12px; font-size:.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; }
  .powered__dot { width:5px; height:5px; border-radius:50%; background:#2e7d32; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  @media (prefers-reduced-motion: reduce) {
    .form, .sent, .sent__check svg, .btn-spinner { animation:none !important; }
    .sent__check svg { stroke-dashoffset:0; }
  }
  @media (max-width:480px) { .page { padding:24px 12px 40px; } .card { padding:28px 20px 24px; } }
`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Veuillez renseigner votre email.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(cleanEmail);
      // Étape 2 : saisie du code + nouveau mot de passe
      navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err) {
      setError(err?.message || "Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style>{css}</style>

      <div className="uac-header">
        <img src={logo} alt="EtuDocs" className="uac-header__logo" />
        <div className="uac-header__text">
          <div className="uac-header__title">EtuDocs — UAC</div>
          <div className="uac-header__sub">Université d'Abomey-Calavi</div>
        </div>
      </div>

      <div className="card">
        <h1 className="card__title">Mot de passe oublié</h1>
        <p className="card__sub">
          Saisissez votre email — nous vous enverrons un code
          <br />à 6 caractères pour réinitialiser votre mot de passe.
        </p>

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && <div className="alert-err">{error}</div>}

          <button className="btn-submit" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? "Envoi…" : "Envoyer le code"}
          </button>
        </form>

        <div className="card__footer">
          <a href="/login">← Retour à la connexion</a>
        </div>
      </div>

      <a href="/" className="back">← Retour à l'accueil</a>
      <div className="powered">
        <div className="powered__dot" />
        Plateforme numérique UAC · EtuDocs
      </div>
    </div>
  );
}
