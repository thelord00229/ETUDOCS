import { useState } from "react";
import logo from "../assets/logo.png";
import { login as apiLogin, setSession, clearSession } from "../services/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    margin: 0; padding: 0; width: 100%; height: 100%;
    font-family: 'DM Sans', sans-serif;
  }

  .page {
    min-height: 100vh;
    background: #f4f6f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 16px 60px;

  }

  /* ── HEADER UAC ── */
  .uac-header {
    width: 100%; max-width: 500px;
    display: flex; align-items: center; justify-content: center; gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
  }
  .uac-header__logo {
    width: 56px; height: 56px; object-fit: contain; border-radius: 10px;
  }
  .uac-header__text { text-align: left; }
  .uac-header__title {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.3rem;
    color: #2e7d32; letter-spacing: -0.3px; line-height: 1.2;
  }
  .uac-header__sub {
    font-size: .78rem; color: #64748b; margin-top: 2px;
    text-transform: uppercase; letter-spacing: .06em;
  }

  /* ── CARD ── */
  .card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    padding: 36px 40px 32px;
    width: 100%; max-width: 460px;
    border-top: 4px solid #2e7d32;
  }

  .card__title {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem; font-weight: 800;
    color: #1e293b; text-align: center; margin-bottom: 6px;
  }
  .card__sub {
    color: #94a3b8; font-size: .9rem;
    text-align: center; margin-bottom: 28px;
  }

  /* ── FORM ── */
  .form { display: flex; flex-direction: column; gap: 16px; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field__row {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 4px;
  }

  label { font-size: .88rem; font-weight: 600; color: #334155; }

  .forgot {
    font-size: .82rem; color: #2e7d32; font-weight: 500;
    text-decoration: none; opacity: .9;
  }
  .forgot:hover { opacity: 1; text-decoration: underline; }

  input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: .93rem; color: #334155;
    background: #f8fafc;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  input:focus {
    border-color: #2e7d32; background: #fff;
    box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
  }
  input::placeholder { color: #cbd5e1; }

  .btn-submit {
    width: 100%; padding: 13px;
    background: #2e7d32; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .95rem;
    border: none; border-radius: 10px; cursor: pointer;
    transition: background .2s, transform .15s, box-shadow .2s;
    margin-top: 4px;
  }
  .btn-submit:hover {
    background: #1b5e20;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(46,125,50,0.25);
  }
  .btn-submit:disabled {
    opacity: .7; cursor: not-allowed;
    transform: none; box-shadow: none;
  }

  /* ── FOOTER ── */
  .card__footer {
    border-top: 1px solid #f1f5f9;
    margin-top: 20px; padding-top: 18px;
    text-align: center; font-size: .88rem; color: #64748b;
  }
  .card__footer a { color: #2e7d32; font-weight: 600; text-decoration: none; }
  .card__footer a:hover { text-decoration: underline; }

  .back {
    margin-top: 20px; font-size: .88rem; color: #94a3b8;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: color .2s;
  }
  .back:hover { color: #2e7d32; }

  .powered {
    margin-top: 12px; font-size: .75rem; color: #cbd5e1;
    display: flex; align-items: center; gap: 6px;
  }
  .powered__dot {
    width: 5px; height: 5px; border-radius: 50%; background: #2e7d32;
  }

  @keyframes fadeIn {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:none; }
  }
  .form { animation: fadeIn .25s ease; }
`;

const routeForUser = (user) => {
  const role = user?.role;
  if (role === "ETUDIANT")            return "/dashboardEtu";
  if (role === "SUPER_ADMIN")         return "/superadmin";
  if (role === "SECRETAIRE_ADJOINT")  return "/dashboardsa";
  if (role === "SECRETAIRE_GENERAL")  return "/dashboardsg";
  if (role === "CHEF_DIVISION") {
    return user?.service === "SCOLARITE" ? "/dashboardsc" : "/dashboardce";
  }
  if (role === "DIRECTEUR_ADJOINT")   return "/dashboardda";
  if (role === "DIRECTEUR")           return "/dashboarddi";
  return "/dashboardsa";
};

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez renseigner l'email et le mot de passe.");
      return;
    }
    setLoading(true);
    try {
      clearSession();
      const data = await apiLogin({ email: String(email).trim(), password });
      setSession({ token: data?.token, user: data?.user });
      window.location.href = routeForUser(data.user);
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg === "UNAUTHORIZED") {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else {
        setError(err?.message || "Erreur réseau (backend éteint ?)");
      }
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

      <div className="card">
        <h1 className="card__title">Connexion</h1>
        <p className="card__sub">Accédez à votre espace personnel</p>
        

        <form className="form" onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="field__row">
              <label>Mot de passe</label>
              <a href="/forgot-password" className="forgot">
                Mot de passe oublié ?
              </a>
            </div>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:-4 }}>
            <input
              id="showpass"
              type="checkbox"
              checked={showPass}
              onChange={(e) => setShowPass(e.target.checked)}
              disabled={loading}
              style={{ width:15, height:15, accentColor:"#2e7d32" }}
            />
            <label htmlFor="showpass" style={{ margin:0, cursor:"pointer", fontSize:".85rem" }}>
              Afficher le mot de passe
            </label>
          </div>

          {error && (
            <div style={{
              background:"#fef2f2", border:"1px solid #fecaca",
              borderRadius:"8px", padding:"10px 14px",
              fontSize:".85rem", color:"#dc2626"
            }}>
              {error}
            </div>
          )}

          <button className="btn-submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="card__footer">
          Vous n'avez pas encore de compte ?{" "}
          <a href="/register">Créer un compte</a>
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