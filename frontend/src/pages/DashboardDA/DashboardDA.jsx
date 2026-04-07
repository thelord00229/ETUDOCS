import { useEffect, useMemo, useState } from "react";
import {
  getDemandes,
  previewDocumentBlob,
  getStatsDA,
  avancerDocument,
} from "../../services/api";

// ── Styles ────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --uac: #2e7d32; --uac-dk: #1b5e20; --uac-lt: #43a047;
    --uac-bg: #f1f8e9; --uac-bd: #c8e6c9;
    --bg: #f4f6f9; --border: #e2e8f0; --muted: #94a3b8;
    --text: #1e293b; --text-muted: #64748b;
    --success: #10b981; --danger: #ef4444;
    --orange: #f97316; --blue: #1e4db7;
  }

  .agent-layout { display:flex; min-height:100vh; background:var(--bg); font-family:'DM Sans',sans-serif; }

  .agent-sidebar { width:220px; flex-shrink:0; background:#fff; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:50; }
  .agent-sidebar__brand { display:flex; align-items:center; gap:10px; padding:22px 20px; font-family:'Sora',sans-serif; font-weight:800; font-size:1.15rem; color:var(--uac); text-decoration:none; border-bottom:1px solid #f1f5f9; }
  .agent-sidebar__brand-icon { width:36px; height:36px; border-radius:10px; background:var(--uac); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .agent-sidebar__brand-tag { font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:500; color:rgba(255,255,255,.8); margin-left:2px; }
  .agent-sidebar__nav { flex:1; padding:14px 12px; display:flex; flex-direction:column; gap:3px; }
  .agent-sidebar__link { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:10px; font-size:.9rem; font-weight:500; color:#475569; text-decoration:none; transition:background .15s, color .15s; background:none; border:none; cursor:pointer; width:100%; text-align:left; }
  .agent-sidebar__link:hover { background:var(--uac-bg); color:var(--uac); }
  .agent-sidebar__link.active { background:var(--uac); color:#fff; font-weight:700; box-shadow:0 4px 14px rgba(46,125,50,.2); }
  .agent-sidebar__divider { height:1px; background:#f1f5f9; margin:4px 12px; }
  .agent-sidebar__logout { display:flex; align-items:center; gap:12px; padding:11px 26px; font-size:.88rem; font-weight:500; color:#ef4444; background:none; border:none; cursor:pointer; width:100%; transition:background .15s; border-top:1px solid #f1f5f9; }
  .agent-sidebar__logout:hover { background:#fef2f2; }

  .agent-main { margin-left:220px; flex:1; min-width:0; display:flex; flex-direction:column; }

  .agent-topbar { height:64px; background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 32px; position:sticky; top:0; z-index:40; }
  .agent-topbar__role { display:inline-flex; align-items:center; padding:6px 14px; border:1.5px solid var(--uac-bd); border-radius:20px; font-size:.85rem; font-weight:500; color:var(--uac); background:var(--uac-bg); }
  .agent-topbar__right { display:flex; align-items:center; gap:16px; }
  .agent-topbar__notif { position:relative; background:none; border:none; cursor:pointer; color:var(--muted); padding:4px; }
  .agent-topbar__badge { position:absolute; top:0; right:0; width:8px; height:8px; border-radius:50%; background:var(--uac); border:2px solid #fff; }
  .agent-topbar__avatar { width:38px; height:38px; border-radius:50%; background:var(--uac); display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:700; font-size:.82rem; color:#fff; }
  .agent-topbar__name { font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; color:var(--text); }
  .agent-topbar__meta { font-size:.75rem; color:var(--muted); text-align:right; }

  .agent-content { padding:28px 32px; display:flex; flex-direction:column; gap:24px; padding-bottom:48px; }
  .agent-page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .agent-page-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; color:var(--text); margin-bottom:4px; }
  .agent-page-sub { color:#475569; font-size:.9rem; }

  .btn-actualiser { display:inline-flex; align-items:center; gap:8px; background:var(--uac); color:#fff; border:none; border-radius:10px; font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; padding:11px 24px; cursor:pointer; transition:background .2s; white-space:nowrap; }
  .btn-actualiser:hover { background:var(--uac-dk); }

  .agent-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .agent-stat-card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:20px 22px; display:flex; align-items:center; gap:16px; }
  .agent-stat-card__icon { width:48px; height:48px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .agent-stat-card__value { font-family:'Sora',sans-serif; font-weight:800; font-size:1.8rem; color:var(--text); line-height:1; }
  .agent-stat-card__label { font-size:.72rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-top:4px; }

  .agent-table-card { background:#fff; border:1px solid var(--border); border-radius:16px; overflow:hidden; }
  .agent-table-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f1f5f9; }
  .agent-table-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:var(--text); display:flex; align-items:center; gap:10px; }
  .count-badge { width:22px; height:22px; border-radius:50%; background:var(--uac); color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
  .search-box { display:flex; align-items:center; gap:8px; border:1.5px solid var(--border); border-radius:8px; padding:7px 12px; background:var(--bg); }
  .search-box input { border:none; background:none; outline:none; font-size:.85rem; color:#334155; width:180px; }
  .search-box input::placeholder { color:#cbd5e1; }

  .agent-table { width:100%; border-collapse:collapse; }
  .agent-table thead tr { background:var(--bg); }
  .agent-table th { text-align:left; padding:12px 20px; font-family:'Sora',sans-serif; font-weight:600; font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; white-space:nowrap; }
  .agent-table td { padding:16px 20px; border-bottom:1px solid var(--bg); vertical-align:middle; }
  .agent-table tbody tr:last-child td { border-bottom:none; }
  .agent-table tbody tr:hover { background:#f8fafc; }

  .td-ref { font-size:.82rem; color:var(--muted); font-family:'DM Mono',monospace; }
  .td-etudiant-name { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:var(--text); }
  .td-etudiant-num { font-size:.78rem; color:var(--muted); margin-top:2px; }
  .td-doc { font-size:.9rem; color:#334155; }
  .td-date { font-size:.88rem; color:#475569; }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:.75rem; font-weight:700; }
  .badge.green { background:var(--uac-bg); color:var(--uac); }
  .badge.gray  { background:#f1f5f9; color:#475569; }

  .btn-traiter { display:inline-flex; align-items:center; gap:7px; background:var(--uac); color:#fff; border:none; border-radius:8px; font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem; padding:9px 18px; cursor:pointer; transition:background .2s; white-space:nowrap; }
  .btn-traiter:hover { background:var(--uac-dk); }
  .btn-traiter:disabled { opacity:.55; cursor:not-allowed; }

  .btn-outline { display:inline-flex; align-items:center; gap:7px; background:#fff; color:var(--text); border:1.5px solid var(--border); border-radius:8px; font-family:'Sora',sans-serif; font-weight:600; font-size:.85rem; padding:9px 18px; cursor:pointer; transition:border-color .2s, color .2s; white-space:nowrap; }
  .btn-outline:hover { border-color:var(--uac); color:var(--uac); }

  .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px); }
  .modal { background:#fff; border-radius:20px; padding:30px; width:460px; max-width:95vw; box-shadow:0 24px 64px rgba(0,0,0,.2); }
  .modal-title { font-family:'Sora',sans-serif; font-size:1.1rem; font-weight:700; color:var(--text); margin-bottom:12px; display:flex; align-items:center; gap:10px; }
  .modal-body { font-size:.88rem; color:#475569; line-height:1.7; margin-bottom:22px; }
  .modal-actions { display:flex; gap:10px; }
  .modal-btn { flex:1; padding:11px; border-radius:9px; font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; }
  .modal-btn.confirm-gen { background:var(--uac); color:#fff; }
  .modal-btn.confirm-gen:hover { background:var(--uac-dk); }
  .modal-btn.cancel { background:var(--bg); color:var(--text); border:1.5px solid var(--border); }

  .sa-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:300; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); padding:16px; }
  .pwd-modal { background:#fff; border-radius:16px; width:100%; max-width:420px; box-shadow:0 24px 60px rgba(0,0,0,.18); overflow:hidden; }
  .pwd-modal__head { padding:22px 26px 18px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .pwd-modal__title { font-family:'Sora',sans-serif; font-weight:700; font-size:1.05rem; color:var(--text); display:flex; align-items:center; gap:10px; }
  .pwd-modal__title-icon { width:36px; height:36px; border-radius:10px; background:var(--uac-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .pwd-modal__close { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:1.3rem; line-height:1; padding:2px; flex-shrink:0; transition:color .15s; }
  .pwd-modal__close:hover { color:var(--uac); }
  .pwd-modal__body { padding:20px 26px; display:flex; flex-direction:column; gap:14px; }
  .pwd-field { display:flex; flex-direction:column; gap:6px; }
  .pwd-label { font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:.04em; }
  .pwd-input-wrap { position:relative; }
  .pwd-input { width:100%; padding:11px 42px 11px 14px; border:1.5px solid #e2e8f0; border-radius:9px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:#334155; outline:none; transition:border-color .2s; box-sizing:border-box; }
  .pwd-input:focus { border-color:var(--uac); box-shadow:0 0 0 3px rgba(46,125,50,.08); }
  .pwd-input.error { border-color:var(--danger); }
  .pwd-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; padding:0; transition:color .15s; }
  .pwd-eye:hover { color:var(--uac); }
  .pwd-strength { display:flex; gap:4px; margin-top:4px; }
  .pwd-strength__bar { flex:1; height:3px; border-radius:2px; background:#e2e8f0; transition:background .3s; }
  .pwd-strength__bar.weak   { background:#ef4444; }
  .pwd-strength__bar.medium { background:#f5a623; }
  .pwd-strength__bar.strong { background:var(--uac); }
  .pwd-hint { font-size:.75rem; color:#94a3b8; margin-top:2px; }
  .pwd-hint.error { color:#ef4444; }
  .pwd-modal__footer { padding:0 26px 22px; }
  .sa-btn-row { display:flex; gap:10px; }
  .sa-btn { flex:1; padding:11px 16px; border-radius:9px; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:.88rem; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; justify-content:center; gap:7px; }
  .sa-btn:disabled { opacity:.55; cursor:not-allowed; }
  .sa-btn--ghost { background:#f8fafc; color:#475569; border:1.5px solid #e2e8f0; }
  .sa-btn--ghost:hover:not(:disabled) { border-color:var(--uac); color:var(--uac); }
  .sa-btn--primary { background:var(--uac); color:#fff; }
  .sa-btn--primary:hover:not(:disabled) { background:var(--uac-dk); }

  .sa-toast { position:fixed; bottom:28px; right:28px; z-index:400; background:var(--uac); color:#fff; padding:13px 20px; border-radius:11px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500; box-shadow:0 8px 30px rgba(0,0,0,.2); animation:sa-toast-in .2s ease; }
  .sa-toast--error { background:var(--danger); }
  @keyframes sa-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

/* ─── Indicateur de robustesse du mot de passe ─────── */
function getStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

/* ─── Icône œil ────── */
function EyeToggleIcon({ show }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

/* ─── Modal Modifier Mot de Passe ────────────────────── */
function ModalMotDePasse({ onClose, onSuccess }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [showActuel, setShowActuel] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const strength = getStrength(nouveau);
  const strengthLabel = ["", "Faible", "Faible", "Moyen", "Fort"][strength];
  const strengthClass =
    strength <= 2 ? "weak" : strength === 3 ? "medium" : "strong";

  const handleSubmit = async () => {
    setErreur("");
    if (!actuel || !nouveau || !confirmer) {
      setErreur("Tous les champs sont obligatoires.");
      return;
    }
    if (nouveau.length < 8) {
      setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveau !== confirmer) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse: actuel,
          nouveauMotDePasse: nouveau,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Mot de passe actuel incorrect.");
      }
      onSuccess("Mot de passe modifié avec succès ✓");
      onClose();
    } catch (e) {
      setErreur(e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pwd-modal__head">
          <div className="pwd-modal__title">
            <div className="pwd-modal__title-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            Modifier le mot de passe
          </div>
          <button className="pwd-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pwd-modal__body">
          {/* Actuel */}
          <div className="pwd-field">
            <label className="pwd-label">Mot de passe actuel</label>
            <div className="pwd-input-wrap">
              <input
                type={showActuel ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                autoFocus
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowActuel((v) => !v)}
              >
                <EyeToggleIcon show={showActuel} />
              </button>
            </div>
          </div>
          {/* Nouveau */}
          <div className="pwd-field">
            <label className="pwd-label">Nouveau mot de passe</label>
            <div className="pwd-input-wrap">
              <input
                type={showNouveau ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowNouveau((v) => !v)}
              >
                <EyeToggleIcon show={showNouveau} />
              </button>
            </div>
            {nouveau && (
              <>
                <div className="pwd-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pwd-strength__bar ${
                        strength >= i ? strengthClass : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="pwd-hint">
                  {strengthLabel} — minimum 8 caractères
                </div>
              </>
            )}
          </div>
          {/* Confirmer */}
          <div className="pwd-field">
            <label className="pwd-label">
              Confirmer le nouveau mot de passe
            </label>
            <div className="pwd-input-wrap">
              <input
                type={showConfirmer ? "text" : "password"}
                className={`pwd-input ${
                  confirmer && confirmer !== nouveau ? "error" : ""
                }`}
                placeholder="••••••••"
                value={confirmer}
                onChange={(e) => setConfirmer(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowConfirmer((v) => !v)}
              >
                <EyeToggleIcon show={showConfirmer} />
              </button>
            </div>
            {confirmer && confirmer !== nouveau && (
              <div className="pwd-hint error">
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>
          {erreur && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: ".85rem",
                color: "#dc2626",
              }}
            >
              {erreur}
            </div>
          )}
        </div>

        <div className="pwd-modal__footer">
          <div className="sa-btn-row">
            <button
              className="sa-btn sa-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className="sa-btn sa-btn--primary"
              onClick={handleSubmit}
              disabled={loading || !actuel || !nouveau || !confirmer}
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────
function Sidebar({ onLogout, onChangePwd }) {
  return (
    <aside className="agent-sidebar">
      <div className="agent-sidebar__brand">
        <div className="agent-sidebar__brand-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        EtuDocs <span className="agent-sidebar__brand-tag">DA</span>
      </div>

      <nav className="agent-sidebar__nav">
        <button className="agent-sidebar__link active" type="button">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="currentColor"
          >
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Tableau de bord
        </button>
        <button
          className="agent-sidebar__link"
          onClick={onChangePwd}
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="currentColor"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Modifier mot de passe
        </button>
      </nav>

      <button
        className="agent-sidebar__logout"
        onClick={onLogout}
        type="button"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Déconnexion
      </button>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────
function Topbar({ user }) {
  const initials = useMemo(() => {
    const nom = user?.nom || "";
    const prenom = user?.prenom || "";
    return `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase() || "DA";
  }, [user]);

  const name = user
    ? `${user.prenom || ""} ${user.nom || ""}`.trim()
    : "Directeur Adjoint";

  return (
    <header className="agent-topbar">
      <div className="agent-topbar__role">Directeur Adjoint — IFRI</div>
      <div className="agent-topbar__right">
        <button
          className="agent-topbar__notif"
          type="button"
          aria-label="Notifications"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="agent-topbar__badge" />
        </button>
        <div>
          <div className="agent-topbar__name">{name}</div>
          <div className="agent-topbar__meta">IFRI</div>
        </div>
        <div className="agent-topbar__avatar">{initials}</div>
      </div>
    </header>
  );
}

// ── Icônes ────────────────────────────────────────────────
const EyeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Composant principal ───────────────────────────────────
export default function DashboardDA() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    aSigner: 0,
    signesCeMois: 0,
    refuses: 0,
  });
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmRow, setConfirmRow] = useState(null);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("etudocs_user") || localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("etudocs_token");
    localStorage.removeItem("etudocs_user");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const charger = async () => {
    try {
      const [demandesData, statsData] = await Promise.all([
        getDemandes(),
        getStatsDA(),
      ]);
      const demandes = Array.isArray(demandesData)
        ? demandesData
        : demandesData?.demandes ?? [];
      const lignes = [];
      for (const d of demandes) {
        const docs = Array.isArray(d.documents) ? d.documents : [];
        if (docs.length === 0) {
          lignes.push({
            reference: "—",
            etudiant: `${d.utilisateur?.prenom ?? ""} ${
              d.utilisateur?.nom ?? ""
            }`.trim(),
            typeDocument: d.typeDocument,
            semestre: null,
            createdAt: d.createdAt,
            statut: d.statut,
            demandeId: d.id,
          });
        } else {
          for (const doc of docs) {
            const sMatch = doc.reference?.match(/-S(\d+)-/);
            lignes.push({
              reference: doc.reference,
              etudiant: `${d.utilisateur?.prenom ?? ""} ${
                d.utilisateur?.nom ?? ""
              }`.trim(),
              typeDocument: d.typeDocument,
              semestre: sMatch ? `S${sMatch[1]}` : null,
              createdAt: d.createdAt,
              statut: d.statut,
              demandeId: d.id,
            });
          }
        }
      }
      setRows(lignes);
      setStats(statsData ?? { aSigner: 0, signesCeMois: 0, refuses: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.reference || "").toLowerCase().includes(q) ||
        (r.etudiant || "").toLowerCase().includes(q) ||
        (r.typeDocument || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const openPreview = async (reference) => {
    if (!reference || reference === "—")
      return alert("Aucune référence trouvée.");
    try {
      const blob = await previewDocumentBlob(reference);
      const url = window.URL.createObjectURL(blob);
      setPreview({ url, name: reference });
    } catch (e) {
      alert(e?.message || "Impossible d'ouvrir le document");
    }
  };

  const closePreview = () => {
    if (preview?.url) window.URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handleApprouver = async (row) => {
    if (!row?.reference || row.reference === "—") return;
    setBusyId(row.reference);
    try {
      await avancerDocument(row.reference, "APPROUVER");
      showToast("Document approuvé avec succès ✓");
      await charger();
    } catch (e) {
      showToast(e?.message || "Erreur lors de l'approbation", true);
    } finally {
      setBusyId(null);
      setConfirmRow(null);
    }
  };

  // ── Fragment overlays partagés ─────────────────────────
  const sharedOverlays = (
    <>
      {toast && (
        <div className={`sa-toast${toast.isError ? " sa-toast--error" : ""}`}>
          {toast.msg}
        </div>
      )}
      {showPwd && (
        <ModalMotDePasse
          onClose={() => setShowPwd(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </>
  );

  return (
    <div className="agent-layout">
      <style>{css}</style>
      {sharedOverlays}
      <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
      <div className="agent-main">
        <Topbar user={user} />
        <div className="agent-content">
          {/* En-tête page */}
          <div className="agent-page-header">
            <div>
              <h2 className="agent-page-title">Signature des documents</h2>
              <p className="agent-page-sub">
                Consultez et approuvez les documents en attente de signature.
              </p>
            </div>
            <button className="btn-actualiser" onClick={charger} type="button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Actualiser
            </button>
          </div>

          {/* Stats */}
          <div className="agent-stats">
            {[
              {
                val: stats.aSigner,
                label: "À SIGNER",
                bg: "#eff6ff",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
              },
              {
                val: stats.signesCeMois,
                label: "TRANSMIS AU DIR. (MOIS)",
                bg: "#f0fdf4",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
              {
                val: stats.refuses,
                label: "REFUSÉS",
                bg: "#fef2f2",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <div className="agent-stat-card" key={i}>
                <div
                  className="agent-stat-card__icon"
                  style={{ background: s.bg }}
                >
                  {s.icon}
                </div>
                <div>
                  <div className="agent-stat-card__value">{s.val}</div>
                  <div className="agent-stat-card__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="agent-table-card">
            <div className="agent-table-header">
              <div className="agent-table-title">
                Documents en attente
                <span className="count-badge">{filtered.length}</span>
              </div>
              <div className="search-box">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <table className="agent-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Étudiant</th>
                  <th>Document</th>
                  <th>Semestre</th>
                  <th>Date soumission</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.reference}>
                    <td className="td-ref">{row.reference}</td>
                    <td>
                      <div className="td-etudiant-name">{row.etudiant}</div>
                    </td>
                    <td className="td-doc">{row.typeDocument}</td>
                    <td className="td-date">{row.semestre ?? "—"}</td>
                    <td className="td-date">{formatDate(row.createdAt)}</td>
                    <td>
                      <span className="badge gray">{row.statut}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          className="btn-outline"
                          onClick={() => openPreview(row.reference)}
                          type="button"
                        >
                          <EyeIcon /> Aperçu
                        </button>
                        <button
                          className="btn-traiter"
                          disabled={busyId === row.reference}
                          onClick={() => setConfirmRow(row)}
                          type="button"
                        >
                          {busyId === row.reference ? "…" : "Approuver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "#94a3b8",
                        fontSize: ".9rem",
                      }}
                    >
                      Aucun document en attente de signature
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal confirmation approbation */}
      {confirmRow && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approuver le document
            </div>
            <div className="modal-body">
              Approuver le document <strong>{confirmRow.typeDocument}</strong>{" "}
              pour <strong>{confirmRow.etudiant}</strong> ?
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setConfirmRow(null)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="modal-btn confirm-gen"
                onClick={() => handleApprouver(confirmRow)}
                type="button"
              >
                ✓ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview document */}
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal"
            style={{ width: "900px", maxWidth: "95vw", height: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              <EyeIcon /> {preview.name}
            </div>
            <div
              style={{
                height: "calc(85vh - 100px)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <iframe
                title="preview"
                src={preview.url}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button
                className="modal-btn cancel"
                onClick={closePreview}
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
