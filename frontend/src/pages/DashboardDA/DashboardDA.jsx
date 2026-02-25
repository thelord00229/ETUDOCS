import { useEffect, useMemo, useState } from "react";
import { getDemandes, avancerDemande, downloadDocumentBlob } from "../../services/api";


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a2f5e;
    --navy-dark: #142347;
    --navy-light: #1e3a7a;
    --accent-blue: #1e4db7;
    --accent-gold: #f5a623;
    --teal: #0d9488;
    --bg: #f0f4f8;
    --white: #ffffff;
    --text: #1a2f5e;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
    --sidebar-width: 260px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
  .layout { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--navy);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-logo {
    padding: 24px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .logo-text {
    font-size: 22px; font-weight: 700; color: white;
    letter-spacing: -0.5px;
  }
  .logo-text span {
    color: var(--accent-gold); font-weight: 400; font-size: 14px;
    margin-left: 6px; letter-spacing: 0.5px;
  }
  .sidebar-nav { flex: 1; padding: 16px 12px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 10px;
    cursor: pointer; transition: all 0.2s;
    font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.6);
    margin-bottom: 2px; border: none; background: none;
    width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-item.active {
    background: var(--accent-gold);
    color: var(--navy-dark);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(245,166,35,0.35);
  }
  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    cursor: pointer; color: #f87171;
    font-size: 13px; font-weight: 500;
    transition: background 0.2s;
    border: none; background: none; width: 100%;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.1); }

  /* MAIN */
  .main { margin-left: var(--sidebar-width); flex: 1; display: flex; flex-direction: column; }

  /* TOPBAR */
  .topbar {
    background: white; border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .breadcrumb {
    background: var(--bg); border: 1px solid var(--border);
    padding: 6px 14px; border-radius: 20px;
    font-size: 13px; font-weight: 500; color: var(--accent-blue);
  }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .notif-btn {
    position: relative; background: none; border: none;
    cursor: pointer; padding: 6px; color: var(--text-muted);
    font-size: 20px; display: flex; align-items: center;
  }
  .notif-dot {
    position: absolute; top: 4px; right: 4px;
    width: 8px; height: 8px; background: var(--danger);
    border-radius: 50%; border: 2px solid white;
  }
  .user-info { text-align: right; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .user-org { font-size: 12px; color: var(--text-muted); }
  .avatar {
    width: 38px; height: 38px; background: var(--teal);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white; letter-spacing: 0.5px;
  }

  /* CONTENT */
  .content { padding: 32px; flex: 1; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px;
  }
  .page-title {
    font-size: 28px; font-weight: 700; color: var(--navy);
    letter-spacing: -0.5px;
  }
  .page-subtitle {
    font-size: 14px; color: var(--text-muted);
    margin-top: 4px; font-weight: 400;
  }
  .refresh-btn {
    background: var(--navy); color: white; border: none;
    padding: 10px 22px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .refresh-btn:hover {
    background: var(--accent-blue); transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(30,77,183,0.3);
  }
  .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  /* STAT CARDS */
  .stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; margin-bottom: 24px;
  }
  .stat-card {
    background: white; border-radius: 16px; padding: 24px;
    display: flex; align-items: center; gap: 20px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .stat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .stat-icon.sign { background: #eff6ff; color: var(--accent-blue); }
  .stat-icon.ok { background: #ecfdf5; color: var(--success); }
  .stat-icon.refused { background: #fef2f2; color: var(--danger); }
  .stat-value { font-size: 36px; font-weight: 700; color: var(--navy); letter-spacing: -1px; line-height: 1; }
  .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 4px; }

  /* TABLE CARD */
  .table-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .table-header {
    padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .table-title {
    font-size: 15px; font-weight: 600; color: var(--navy);
    display: flex; align-items: center; gap: 10px;
  }
  .badge-count {
    background: var(--accent-blue); color: white;
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px;
    min-width: 22px; text-align: center;
  }
  .search-box { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 10px; color: var(--text-muted); font-size: 14px; }
  .search-input {
    padding: 8px 12px 8px 32px;
    border: 1px solid var(--border); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: var(--text); background: var(--bg);
    outline: none; width: 220px;
    transition: border-color 0.2s;
  }
  .search-input:focus { border-color: var(--accent-blue); background: white; }
  .search-input::placeholder { color: var(--text-muted); }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    padding: 12px 24px; text-align: left;
    font-size: 11px; font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 1px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  tbody td {
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    vertical-align: middle;
  }
  tbody tr:hover { background: #f8fafc; }

  .mono { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent-blue); }
  .muted { color: var(--text-muted); font-size: 12px; }

  .btn {
    border: none; cursor: pointer; border-radius: 10px;
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 13px;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn.primary { background: var(--navy); color: white; }
  .btn.primary:hover { background: var(--accent-blue); }
  .btn.outline { background: white; color: var(--navy); border: 1px solid var(--border); }
  .btn.outline:hover { border-color: var(--navy); }

  .empty-state { padding: 72px 24px; text-align: center; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.3; }
  .empty-text { font-size: 14px; color: var(--text-muted); font-weight: 500; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,0.55);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: white;
    border-radius: 18px;
    width: 900px;
    max-width: 95vw;
    height: 85vh;
    padding: 18px 18px 16px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .modal-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--navy);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .modal-body {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg);
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: #eff6ff;
    color: #1d4ed8;
  }
`;

const Icon = ({ name }) => {
  const icons = {
    dashboard: "⊞",
    bell: "🔔",
    refresh: "↻",
    search: "⌕",
    logout: "→",
    sign: "✍",
    check: "✓",
    x: "✗",
    eye: "👁",
  };
  return <span>{icons[name] || "•"}</span>;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const getEtudiantLabel = (d) => {
  const u = d?.utilisateur;
  const fallback = d?.etudiant || d?.nomEtudiant || "";
  if (!u) return fallback || "—";
  const prenom = u?.prenom ?? "";
  const nom = u?.nom ?? "";
  const full = `${prenom} ${nom}`.trim();
  return full || fallback || "—";
};

const getNumeroEtudiant = (d) => {
  const u = d?.utilisateur;
  return u?.numeroEtudiant || d?.numeroEtudiant || d?.num || "—";
};

const getReferenceDoc = (d) => {
  const doc = Array.isArray(d?.documents) ? d.documents[0] : null;
  return doc?.reference || d?.reference || d?.ref || "—";
};

export default function DashboardDA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [preview, setPreview] = useState(null); // { url, name }

  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
      (async () => {
          try {
              const data = await getDemandes();
              const list = Array.isArray(data) ? data : (data?.demandes ?? []);
              setDemandes(list);
          } catch (e) {
              console.error(e);
              setDemandes([]);
          }
      })();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const data = await getDemandes();
      const list = Array.isArray(data) ? data : (data?.demandes ?? []);
      setDemandes(list);
    } catch (e) {
      console.error(e);
      setDemandes([]);
      alert(e?.message || "Erreur chargement demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return demandes;

    return demandes.filter((d) => {
      const ref = (getReferenceDoc(d) || "").toLowerCase();
      const etu = (getEtudiantLabel(d) || "").toLowerCase();
      const num = (getNumeroEtudiant(d) || "").toLowerCase();
      const type = ((d?.typeDocument || "") + "").toLowerCase();
      return ref.includes(q) || etu.includes(q) || num.includes(q) || type.includes(q);
    });
  }, [demandes, searchQuery]);

  // ✅ WORKFLOW: ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT => action APPROUVER => ATTENTE_SIGNATURE_DIRECTEUR
  const handleApprouver = async (demande) => {
    if (!demande?.id) return;
    setBusyId(demande.id);
    try {
      await avancerDemande(demande.id, "APPROUVER");
      await charger();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur approbation");
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = async (demande) => {
    const reference = getReferenceDoc(demande);
    if (!reference || reference === "—") {
      alert("Aucune référence de document trouvée pour prévisualisation.");
      return;
    }

    try {
      const blob = await downloadDocumentBlob(reference);
      const url = window.URL.createObjectURL(blob);
      setPreview({ url, name: reference });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Impossible d’ouvrir le document");
    }
  };

  const closePreview = () => {
    if (preview?.url) window.URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const aSigner = demandes.length;
  const stats = [
    { icon: "sign", label: "À SIGNER", value: String(aSigner), iconClass: "sign" },
    { icon: "check", label: "SIGNÉS (MOIS)", value: "—", iconClass: "ok" },
    { icon: "x", label: "REFUSÉS", value: "—", iconClass: "refused" },
  ];

  const handleApprove = async (id) => {
    try {
      await avancerDemande(id, "APPROUVER");

      // recharge la liste après approbation
      const data = await getDemandes();
      const list = Array.isArray(data) ? data : (data?.demandes ?? []);
      setDemandes(list);

    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'approbation");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">EtuDocs <span>Agent</span></div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <Icon name="dashboard" /> Tableau de bord
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn">
              <Icon name="logout" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* TOPBAR */}
          <header className="topbar">
            <div className="breadcrumb">Directeur Adjoint — IFRI</div>

            <div className="topbar-right">
              <button className="notif-btn" title="Notifications">
                <Icon name="bell" />
                <span className="notif-dot" />
              </button>

              <div className="user-info">
                <div className="user-name">Directeur Adjoint</div>
                <div className="user-org">IFRI</div>
              </div>
              <div className="avatar">DA</div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Espace Directeur Adjoint</h1>
                <p className="page-subtitle">Approuvez les documents générés (workflow: APPROUVER).</p>
              </div>

              <button className="refresh-btn" onClick={charger} disabled={loading}>
                <Icon name="refresh" /> {loading ? "Chargement..." : "Actualiser"}
              </button>
            </div>

            {/* STATS */}
            <div className="stats-grid">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className={`stat-icon ${s.iconClass}`}>
                    {s.iconClass === "sign" && "✍"}
                    {s.iconClass === "ok" && "✓"}
                    {s.iconClass === "refused" && "✗"}
                  </div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* TABLE */}
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">
                  Documents en attente de signature
                  <span className="badge-count">{filtered.length}</span>
                </div>

                <div className="search-box">
                  <span className="search-icon"><Icon name="search" /></span>
                  <input
                    className="search-input"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Document</th>
                      <th>Soumission</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {demandes.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                          Aucune demande en attente
                        </td>
                      </tr>
                    ) : (
                      demandes.map((d) => (
                        <tr key={d.id}>
                          <td>{d.documents?.[0]?.reference || "-"}</td>
                          <td>
                            {d.utilisateur?.prenom} {d.utilisateur?.nom}
                          </td>
                          <td>{d.typeDocument}</td>
                          <td>
                            <button
                              onClick={() => handleApprove(d.id)}
                              style={{
                                background: "#1a2f5e",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer"
                              }}
                            >
                              Approuver
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

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>👁</span> Aperçu — <span className="mono">{preview.name}</span>
              </span>
              <button className="btn outline" onClick={closePreview}>Fermer</button>
            </div>

            <div className="modal-body">
              <iframe title="preview" src={preview.url} style={{ width: "100%", height: "100%", border: "none" }} />
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