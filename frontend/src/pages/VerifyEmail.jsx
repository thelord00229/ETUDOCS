import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import { verifyEmail } from "../services/api";

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
          padding:40px; width:100%; max-width:460px; border-top:4px solid #2e7d32; }

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
  .state__title { font-family:'Sora',sans-serif; font-size:1.4rem; font-weight:800;
                  color:#1e293b; margin-bottom:8px; }
  .state__body { color:#64748b; font-size:.92rem; line-height:1.6; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner { width:48px; height:48px; margin:8px auto 20px; border:4px solid #e2e8f0;
             border-top-color:#2e7d32; border-radius:50%; animation:spin .7s linear infinite; }

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
    .state, .state__icon svg, .spinner { animation:none !important; }
    .state__icon.ok svg { stroke-dashoffset:0; }
  }
  @media (max-width:480px) { .page { padding:24px 12px 40px; } .card { padding:28px 20px 24px; } }
`;

const Check = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export default function VerifyEmail() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  // "loading" | "success" | "error" | "invalid"
  const [status, setStatus] = useState(token && email ? "loading" : "invalid");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token || !email || ran.current) return;
    ran.current = true; // évite le double-appel en StrictMode

    verifyEmail({ token, email })
      .then((res) => {
        setStatus("success");
        setMessage(res?.message || "Votre email a été vérifié.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "Le lien est invalide ou a expiré.");
      });
  }, [token, email]);

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
        {status === "loading" && (
          <div className="state">
            <div className="spinner" />
            <div className="state__title">Vérification en cours…</div>
            <p className="state__body">Un instant, nous validons votre adresse email.</p>
          </div>
        )}

        {status === "success" && (
          <div className="state">
            <div className="state__icon ok"><Check /></div>
            <div className="state__title">Email vérifié</div>
            <p className="state__body">{message}<br />Vous pouvez maintenant vous connecter.</p>
            <div className="card__footer"><a href="/login">Aller à la connexion</a></div>
          </div>
        )}

        {(status === "error" || status === "invalid") && (
          <div className="state">
            <div className="state__icon bad"><Cross /></div>
            <div className="state__title">Vérification impossible</div>
            <p className="state__body">
              {status === "invalid"
                ? "Ce lien de vérification est incomplet."
                : message}
              <br />Connectez-vous pour obtenir un nouveau lien.
            </p>
            <div className="card__footer"><a href="/login">← Retour à la connexion</a></div>
          </div>
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
