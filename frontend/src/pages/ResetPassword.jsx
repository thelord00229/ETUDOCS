import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { resetPassword, requestPasswordReset } from "../services/api";
import { PASSWORD_RULES, isPasswordValid, passwordStrength } from "../utils/passwordValidator";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body, #root { margin:0; padding:0; width:100%; height:100%; font-family:'DM Sans',sans-serif; }

  .page { min-height:100vh; background:#f4f6f9; display:flex; flex-direction:column;
          align-items:center; padding:48px 16px 60px; }
  .uac-header { width:100%; max-width:500px; display:flex; align-items:center; justify-content:center;
                gap:16px; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #e2e8f0; }
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
  .card__sub b { color:#334155; }

  .form { display:flex; flex-direction:column; gap:16px; animation:fadeIn .25s ease; }
  .field { display:flex; flex-direction:column; gap:6px; }
  label { font-size:.88rem; font-weight:600; color:#334155; }
  input[type=email], input[type=password], input[type=text] {
          width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:9px;
          font-family:'DM Sans',sans-serif; font-size:.93rem; color:#334155; background:#f8fafc;
          transition:border-color .2s, box-shadow .2s; outline:none; }
  input:focus { border-color:#2e7d32; background:#fff; box-shadow:0 0 0 3px rgba(46,125,50,0.1); }
  input::placeholder { color:#cbd5e1; }

  /* Champ du code OTP */
  .code-input { text-align:center; font-family:'Sora',monospace !important; font-size:1.6rem !important;
                font-weight:800; letter-spacing:.5em; text-transform:uppercase; padding:14px 10px !important;
                color:#1e293b !important; caret-color:#2e7d32; }
  .code-input::placeholder { letter-spacing:.4em; font-size:1.2rem; color:#cbd5e1; }
  .resend-row { display:flex; justify-content:center; align-items:center; gap:6px;
                font-size:.82rem; color:#94a3b8; margin-top:-6px; }
  .resend { background:none; border:none; color:#2e7d32; font-weight:600; font-size:.82rem;
            cursor:pointer; padding:0; font-family:'DM Sans',sans-serif; }
  .resend:hover:not(:disabled) { text-decoration:underline; }
  .resend:disabled { color:#cbd5e1; cursor:not-allowed; }

  /* Indicateur de force (regle reelle = >= 8 caracteres) */
  .meter { display:flex; gap:5px; margin-top:2px; }
  .meter__seg { flex:1; height:4px; border-radius:99px; background:#e2e8f0; transition:background .25s; }
  .meter__seg.on-1 { background:#ef4444; }
  .meter__seg.on-2 { background:#f59e0b; }
  .meter__seg.on-3 { background:#2e7d32; }
  .reqs { display:flex; flex-direction:column; gap:5px; margin-top:2px; }
  .req { display:flex; align-items:center; gap:7px; font-size:.8rem; color:#94a3b8; transition:color .2s; }
  .req.ok { color:#2e7d32; }
  .req__dot { width:14px; height:14px; border-radius:50%; border:1.5px solid currentColor;
              display:grid; place-items:center; flex-shrink:0; }
  .req.ok .req__dot { background:#2e7d32; border-color:#2e7d32; }
  .req__dot svg { width:8px; height:8px; stroke:#fff; stroke-width:3.5; fill:none;
                  stroke-linecap:round; stroke-linejoin:round; }

  .btn-submit { width:100%; padding:13px; background:#2e7d32; color:#fff;
                font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem;
                border:none; border-radius:10px; cursor:pointer;
                transition:background .2s, transform .15s, box-shadow .2s; margin-top:4px; }
  .btn-submit:hover:not(:disabled) { background:#1b5e20; transform:translateY(-1px);
                                     box-shadow:0 6px 20px rgba(46,125,50,0.25); }
  .btn-submit:disabled { opacity:.55; cursor:not-allowed; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .btn-spinner { display:inline-block; width:15px; height:15px; border:2px solid rgba(255,255,255,.35);
                 border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite;
                 vertical-align:middle; margin-right:6px; }

  .alert-err { background:#fef2f2; border:1px solid #fecaca; border-radius:8px;
               padding:10px 14px; font-size:.85rem; color:#dc2626; }
  .alert-ok { background:#e8f5e9; border:1px solid #bbf7d0; border-radius:8px;
              padding:10px 14px; font-size:.85rem; color:#2e7d32; }

  .state { text-align:center; animation:fadeIn .3s ease; }
  .state__icon { width:64px; height:64px; margin:4px auto 18px; border-radius:50%;
                 display:grid; place-items:center; }
  .state__icon.ok { background:#e8f5e9; }
  .state__icon.bad { background:#fef2f2; }
  .state__icon svg { width:30px; height:30px; stroke-width:3; fill:none;
                     stroke-linecap:round; stroke-linejoin:round; }
  .state__icon.ok svg { stroke:#2e7d32; stroke-dasharray:48; stroke-dashoffset:48;
                        animation:draw .5s .15s ease forwards; }
  .state__icon.bad svg { stroke:#dc2626; }
  @keyframes draw { to { stroke-dashoffset:0; } }
  .state__title { font-family:'Sora',sans-serif; font-size:1.25rem; font-weight:800;
                  color:#1e293b; margin-bottom:8px; }
  .state__body { color:#64748b; font-size:.9rem; line-height:1.6; }

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
    .form, .state, .state__icon svg, .btn-spinner { animation:none !important; }
    .state__icon.ok svg { stroke-dashoffset:0; }
  }
  @media (max-width:480px) { .page { padding:24px 12px 40px; } .card { padding:28px 20px 24px; } }
`;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const Check = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
);

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const validPwd = isPasswordValid(password);
  const matches = confirm.length > 0 && password === confirm;
  const codeComplete = code.length === CODE_LENGTH;
  const canSubmit = codeComplete && validPwd && matches && !loading;
  const strength = passwordStrength(password);

  const handleCode = (e) => {
    // Garde uniquement les caractères alphanumériques, en majuscules, max 6
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
    setCode(cleaned);
  };

  const resend = async () => {
    if (cooldown > 0 || loading) return;
    setError("");
    setInfo("");
    try {
      await requestPasswordReset(email);
      setInfo("Un nouveau code vous a été envoyé.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err?.message || "Impossible de renvoyer le code.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!codeComplete) return setError("Saisissez le code à 6 caractères reçu par email.");
    if (!validPwd) return setError("Le mot de passe ne respecte pas tous les critères.");
    if (!matches) return setError("Les deux mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword: password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const invalidLink = !email;

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
        {invalidLink ? (
          <div className="state">
            <div className="state__icon bad">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </div>
            <div className="state__title">Demande introuvable</div>
            <p className="state__body">
              Aucune adresse email associée à cette demande.
              <br />Recommencez la procédure de réinitialisation.
            </p>
            <div className="card__footer"><a href="/forgot-password">Demander un code</a></div>
          </div>
        ) : done ? (
          <div className="state">
            <div className="state__icon ok"><Check /></div>
            <div className="state__title">Mot de passe réinitialisé</div>
            <p className="state__body">
              Vous pouvez maintenant vous connecter.
              <br />Redirection en cours…
            </p>
            <div className="card__footer"><a href="/login">Aller à la connexion</a></div>
          </div>
        ) : (
          <>
            <h1 className="card__title">Réinitialisation</h1>
            <p className="card__sub">
              Entrez le code envoyé à<br /><b>{email}</b>
            </p>

            <form className="form" onSubmit={submit}>
              <div className="field">
                <label>Code de vérification</label>
                <input
                  className="code-input"
                  type="text"
                  inputMode="text"
                  value={code}
                  onChange={handleCode}
                  placeholder="••••••"
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={CODE_LENGTH}
                />
                <div className="resend-row">
                  <span>Code non reçu ?</span>
                  <button type="button" className="resend" onClick={resend} disabled={loading || cooldown > 0}>
                    {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer le code"}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Nouveau mot de passe</label>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <div className="meter" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`meter__seg ${strength >= i ? `on-${strength}` : ""}`} />
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Confirmer le mot de passe</label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:-4 }}>
                <input id="show" type="checkbox" checked={show}
                  onChange={(e) => setShow(e.target.checked)} disabled={loading}
                  style={{ width:15, height:15, accentColor:"#2e7d32" }} />
                <label htmlFor="show" style={{ margin:0, cursor:"pointer", fontSize:".85rem", fontWeight:400 }}>
                  Afficher les mots de passe
                </label>
              </div>

              <div className="reqs">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <div key={rule.key} className={`req ${ok ? "ok" : ""}`}>
                      <span className="req__dot">{ok && <Check />}</span>
                      {rule.label}
                    </div>
                  );
                })}
                <div className={`req ${matches ? "ok" : ""}`}>
                  <span className="req__dot">{matches && <Check />}</span>
                  Les deux mots de passe correspondent
                </div>
              </div>

              {info && <div className="alert-ok">{info}</div>}
              {error && <div className="alert-err">{error}</div>}

              <button className="btn-submit" disabled={!canSubmit}>
                {loading && <span className="btn-spinner" />}
                {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
              </button>
            </form>

            <div className="card__footer"><a href="/login">← Retour à la connexion</a></div>
          </>
        )}
      </div>

      <a href="/" className="back">← Retour à l'accueil</a>
      <div className="powered">
        <div className="powered__dot" />
        Plateforme numérique UAC · EtuDocs
      </div>
    </div>
  );
}
