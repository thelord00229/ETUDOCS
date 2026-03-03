import { useEffect, useMemo, useState } from "react";
import { getDemandes, avancerDemande } from "../../services/api";
import { previewDocumentBlob, getStatsDA } from "../../services/api";
import logo from "../../assets/logo.png";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1a2744; --accent-blue: #1e4db7; --bg: #f0f4f8;
    --text: #1a2744; --text-muted: #64748b; --border: #e2e8f0;
    --success: #10b981; --danger: #ef4444; --teal: #0d9488;
    --sidebar-width: 220px;
  }
  body { font-family: "DM Sans", sans-serif; background: var(--bg); color: var(--text); }
  .layout { display: flex; min-height: 100vh; }

  .sidebar { width: var(--sidebar-width); background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; padding-bottom: 24px; }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 20px; text-decoration: none; }
  .sidebar-brand__logo { height: 48px; width: auto; object-fit: contain; }
  .sidebar-brand__name { font-family: "Sora", sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--navy); letter-spacing: -.01em; }
  .sidebar-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background .15s, color .15s; font-family: "DM Sans", sans-serif; font-size: .9rem; font-weight: 500; color: #475569; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: #f1f5f9; color: var(--navy); }
  .nav-item:hover svg { stroke: var(--navy); }
  .nav-item.active { background: var(--navy); color: #fff; }
  .nav-item.active svg { stroke: #fff; }
  .nav-item svg { stroke: #94a3b8; transition: stroke .15s; }
  .sidebar-divider { height: 1px; background: var(--border); margin: 12px; }
  .logout-btn { display: flex; align-items: center; gap: 12px; padding: 10px 24px; font-family: "DM Sans", sans-serif; font-size: .9rem; font-weight: 500; color: #94a3b8; background: none; border: none; cursor: pointer; width: 100%; transition: color .15s; }
  .logout-btn:hover { color: #ef4444; }
  .logout-btn:hover svg { stroke: #ef4444; }
  .logout-btn svg { stroke: #94a3b8; transition: stroke .15s; }

  .main { margin-left: var(--sidebar-width); flex: 1; display: flex; flex-direction: column; }
  .topbar { background: white; border-bottom: 1px solid var(--border); padding: 0 36px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
  .breadcrumb { background: var(--bg); border: 1px solid var(--border); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; color: var(--navy); }
  .topbar-right { display: flex; align-items: center; gap: 20px; }
  .notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-muted); display: flex; align-items: center; }
  .notif-dot { position: absolute; top: 2px; right: 2px; width: 9px; height: 9px; background: #f59e0b; border-radius: 50%; border: 2px solid white; }
  .user-info { text-align: right; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .user-org { font-size: 12px; color: var(--text-muted); }
  .avatar { width: 40px; height: 40px; background: var(--teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: white; flex-shrink: 0; }

  .content { padding: 36px; flex: 1; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
  .page-title { font-size: 28px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 6px; }
  .refresh-btn { background: var(--navy); color: white; border: none; padding: 10px 22px; border-radius: 10px; font-family: "DM Sans", sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .refresh-btn:hover { background: var(--accent-blue); transform: translateY(-1px); }
  .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; border: 1px solid var(--border); transition: transform 0.2s; }
  .stat-card:hover { transform: translateY(-2px); }
  .stat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .stat-icon.sign { background: #eff6ff; color: var(--accent-blue); }
  .stat-icon.ok { background: #ecfdf5; color: var(--success); }
  .stat-icon.refused { background: #fef2f2; color: var(--danger); }
  .stat-value { font-size: 36px; font-weight: 700; color: var(--navy); letter-spacing: -1px; line-height: 1; }
  .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 4px; }

  .table-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .table-header { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .table-title { font-size: 15px; font-weight: 600; color: var(--navy); display: flex; align-items: center; gap: 10px; }
  .badge-count { background: var(--accent-blue); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .search-box { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 10px; color: var(--text-muted); }
  .search-input { padding: 8px 12px 8px 32px; border: 1px solid var(--border); border-radius: 8px; font-family: "DM Sans", sans-serif; font-size: 13px; color: var(--text); background: var(--bg); outline: none; width: 220px; }
  .search-input:focus { border-color: var(--accent-blue); background: white; }
  .search-input::placeholder { color: var(--text-muted); }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 12px 24px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; background: var(--bg); border-bottom: 1px solid var(--border); white-space: nowrap; }
  tbody td { padding: 14px 24px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  tbody tr:hover { background: #f8fafc; }
  .btn { border: none; cursor: pointer; border-radius: 8px; padding: 8px 14px; font-family: "DM Sans", sans-serif; font-weight: 600; font-size: 13px; transition: 0.2s; }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn.primary { background: var(--navy); color: white; }
  .btn.primary:hover { background: var(--accent-blue); }
  .btn.outline { background: white; color: var(--navy); border: 1px solid var(--border); }
  .btn.outline:hover { border-color: var(--navy); }
  .empty-state { padding: 72px 24px; text-align: center; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.3; }
  .empty-text { font-size: 14px; color: var(--text-muted); font-weight: 500; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(2px); }
  .modal-box { background: #fff; border-radius: 18px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,.15); display: flex; flex-direction: column; gap: 16px; }
  .modal-preview { background: white; border-radius: 18px; width: 900px; max-width: 95vw; height: 85vh; padding: 18px; box-shadow: 0 24px 64px rgba(0,0,0,.25); display: flex; flex-direction: column; gap: 12px; }
  .modal-title-txt { font-family: "Sora", sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--navy); }
  .modal-preview-title { font-size: 14px; font-weight: 800; color: var(--navy); display: flex; align-items: center; justify-content: space-between; }
  .modal-body { flex: 1; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-family: "Sora", sans-serif; font-weight: 600; font-size: .78rem; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
  .form-input { padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-family: "DM Sans", sans-serif; font-size: .9rem; color: var(--navy); outline: none; background: #f8fafc; }
  .form-input:focus { border-color: var(--navy); background: #fff; }
  .btn-primary { padding: 10px 22px; background: var(--navy); color: #fff; border: none; border-radius: 9px; font-family: "Sora", sans-serif; font-weight: 700; font-size: .88rem; cursor: pointer; }
  .btn-ghost { padding: 10px 18px; background: none; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 9px; font-family: "DM Sans", sans-serif; font-weight: 500; font-size: .88rem; cursor: pointer; }
`;

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

function ModalMotDePasse({ onClose }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const handleSubmit = () => {
    if (!current || !next || !confirm) return alert("Tous les champs sont requis");
    if (next !== confirm) return alert("Les mots de passe ne correspondent pas");
    alert("Mot de passe modifié avec succès !");
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title-txt">Modifier le mot de passe</p>
        <div className="form-field">
          <label className="form-label">Mot de passe actuel</label>
          <input type="password" className="form-input" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">Nouveau mot de passe</label>
          <input type="password" className="form-input" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">Confirmer le nouveau mot de passe</label>
          <input type="password" className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardDA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null); // { url, name }
  const [showMdp, setShowMdp] = useState(false);

  // ✅ Une ligne par document (pas par demande)
  const [rows, setRows] = useState([]); // [{ reference, etudiant, typeDocument, semestre, createdAt, statut, demandeId }]

  // ✅ Stats réelles
  const [stats, setStats] = useState({ aSigner: 0, signesCeMois: 0, refuses: 0 });

  const charger = async () => {
    setLoading(true);
    try {
      const [demandesData, statsData] = await Promise.all([
        getDemandes(),
        getStatsDA(),
      ]);

      const demandes = Array.isArray(demandesData) ? demandesData : (demandesData?.demandes ?? []);

      // ✅ Aplatir : une ligne par document dans chaque demande
      const lignes = [];
      for (const d of demandes) {
        const docs = Array.isArray(d.documents) ? d.documents : [];
        if (docs.length === 0) {
          // demande sans document encore (cas rare)
          lignes.push({
            reference: "—",
            etudiant: `${d.utilisateur?.prenom ?? ""} ${d.utilisateur?.nom ?? ""}`.trim(),
            typeDocument: d.typeDocument,
            semestre: null,
            createdAt: d.createdAt,
            statut: d.statut,
            demandeId: d.id,
          });
        } else {
          for (const doc of docs) {
            // Extraire le semestre depuis la référence ex: ETD-2026-IFRI-S1-...
            const sMatch = doc.reference?.match(/-S(\d+)-/);
            const semestre = sMatch ? `S${sMatch[1]}` : null;
            lignes.push({
              reference: doc.reference,
              etudiant: `${d.utilisateur?.prenom ?? ""} ${d.utilisateur?.nom ?? ""}`.trim(),
              typeDocument: d.typeDocument,
              semestre,
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.reference || "").toLowerCase().includes(q) ||
      (r.etudiant || "").toLowerCase().includes(q) ||
      (r.typeDocument || "").toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // ✅ Approuver : on avance la demande (une seule fois peu importe le nb de docs)
  const handleApprouver = async (row) => {
    if (!row?.demandeId) return;
    setBusyId(row.reference);
    try {
      await avancerDemande(row.demandeId, "APPROUVER");
      await charger();
    } catch (e) {
      alert(e?.message || "Erreur approbation");
    } finally {
      setBusyId(null);
    }
  };

  // ✅ Preview : blob inline, non téléchargeable
  const openPreview = async (reference) => {
    if (!reference || reference === "—") return alert("Aucune référence trouvée.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="layout">

        <aside className="sidebar">
          <a href="/" className="sidebar-brand">
            <img src={logo} alt="EtuDocs" className="sidebar-brand__logo" />
            <span className="sidebar-brand__name">EtuDocs</span>
          </a>
          <nav className="sidebar-nav">
            <button className="nav-item active"><GridIcon /> Tableau de bord</button>
            <button className="nav-item" onClick={() => setShowMdp(true)}><LockIcon /> Modifier mot de passe</button>
          </nav>
          <div className="sidebar-divider" />
          <button className="logout-btn" onClick={handleLogout}><LogoutIcon /> Déconnexion</button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">Directeur Adjoint — IFRI</div>
            <div className="topbar-right">
              <button className="notif-btn"><BellIcon /><span className="notif-dot" /></button>
              <div className="user-info">
                <div className="user-name">Directeur Adjoint</div>
                <div className="user-org">IFRI</div>
              </div>
              <div className="avatar">DA</div>
            </div>
          </header>

          <div className="content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Espace Directeur Adjoint</h1>
                <p className="page-subtitle">Approuvez les documents générés avant signature finale.</p>
              </div>
              <button className="refresh-btn" onClick={charger} disabled={loading}>
                {loading ? "Chargement..." : "Actualiser"}
              </button>
            </div>

            {/* ✅ Stats réelles */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon sign">✍</div>
                <div>
                  <div className="stat-value">{stats.aSigner}</div>
                  <div className="stat-label">À signer</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon ok">✓</div>
                <div>
                  <div className="stat-value">{stats.signesCeMois}</div>
                  <div className="stat-label">Signés (mois)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon refused">✗</div>
                <div>
                  <div className="stat-value">{stats.refuses}</div>
                  <div className="stat-label">Refusés</div>
                </div>
              </div>
            </div>

            {/* ✅ Tableau : une ligne par document */}
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">
                  Documents en attente de signature
                  <span className="badge-count">{filtered.length}</span>
                </div>
                <div className="search-box">
                  <span className="search-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input className="search-input" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Document</th>
                      <th>Semestre</th>
                      <th>Soumission</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Aucun document en attente</td></tr>
                    ) : (
                      filtered.map((row, i) => (
                        <tr key={`${row.reference}-${i}`}>
                          <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{row.reference}</td>
                          <td>{row.etudiant}</td>
                          <td>{row.typeDocument}</td>
                          <td>{row.semestre ?? "—"}</td>
                          <td>{new Date(row.createdAt).toLocaleString()}</td>
                          <td>{row.statut}</td>
                          <td style={{ display: "flex", gap: 8 }}>
                            <button className="btn outline" onClick={() => openPreview(row.reference)}>
                              Aperçu
                            </button>
                            <button
                              className="btn primary"
                              disabled={busyId === row.reference}
                              onClick={() => handleApprouver(row)}
                            >
                              {busyId === row.reference ? "..." : "Approuver"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <div className="empty-text">Aucun document en attente de signature</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showMdp && <ModalMotDePasse onClose={() => setShowMdp(false)} />}

      {/* ✅ Preview inline non téléchargeable */}
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-preview-title">
              <span>👁 Aperçu — <span style={{ fontFamily: "monospace", color: "var(--accent-blue)" }}>{preview.name}</span></span>
              <button className="btn outline" onClick={closePreview}>Fermer</button>
            </div>
            <div className="modal-body">
              <iframe
                title="preview"
                src={preview.url}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn outline" onClick={closePreview}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}