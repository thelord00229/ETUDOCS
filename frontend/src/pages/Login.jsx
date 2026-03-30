import { useState } from "react";
import logo from "../assets/logo.png";
import { login as apiLogin, setSession, clearSession } from "../services/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:     #1a2744;
    --navy-dk:  #0f1a33;
    --gold:     #f5a623;
    --white:    #ffffff;
    --g50:      #f8fafc;
    --g100:     #f1f5f9;
    --g200:     #e2e8f0;
    --g300:     #cbd5e1;
    --g400:     #94a3b8;
    --g600:     #475569;
    --g700:     #334155;
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

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    margin-bottom: 40px;
  }
  .brand__logo {
    width: 62px; height: 62px;
    object-fit: contain; border-radius: 16px;
  }
  .brand__name {
    font-family: 'Sora', sans-serif;
    font-weight: 800; font-size: 1.9rem;
    color: var(--navy); letter-spacing: -0.5px;
  }

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

  .form { display: flex; flex-direction: column; gap: 18px; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field__row {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 6px;
  }

  label {
    font-size: 0.9rem; font-weight: 500; color: var(--g700);
  }
  .forgot {
    font-size: 0.85rem; color: var(--navy); font-weight: 500;
    text-decoration: none; opacity: .85;
  }
  .forgot:hover { opacity: 1; text-decoration: underline; }

  input {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid var(--g200); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: var(--g700);
    background: var(--g50);
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  input:focus {
    border-color: var(--navy); background: var(--white);
    box-shadow: 0 0 0 3px rgba(26,39,68,0.08);
  }
  input::placeholder { color: var(--g300); }

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
  .btn-submit:disabled {
    opacity: .75; cursor: not-allowed;
    transform: none; box-shadow: none;
  }

  .card__footer {
    border-top: 1px solid var(--g200);
    margin-top: 24px; padding-top: 20px;
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
      const data = await apiLogin({
        email: String(email).trim(),
        password,
      });

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

      <a href="/" className="brand">
        <img src={logo} alt="EtuDocs logo" className="brand__logo" />
        <span className="brand__name">EtuDocs</span>
      </a>

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

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: -6 }}>
            <input
              id="showpass"
              type="checkbox"
              checked={showPass}
              onChange={(e) => setShowPass(e.target.checked)}
              disabled={loading}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="showpass" style={{ margin: 0, cursor: "pointer" }}>
              Afficher le mot de passe
            </label>
          </div>

          {error && (
            <p style={{ color: "crimson", fontSize: "0.9rem" }}>{error}</p>
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
    </div>
  );
}