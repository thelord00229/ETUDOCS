import { useEffect, useMemo, useState } from "react";
import { getDemandes, avancerDocument, previewDocumentBlob } from "../../services/api";
import logo from "../../assets/logo.png"; // ✅ même logo que SALayout

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a2744;
    --navy-dark: #142347;
    --navy-light: #1e3a7a;
    --accent-blue: #1e4db7;
    --accent-gold: #f5a623;
    --teal: #0d9488;
    --bg: #f0f4f8;
    --white: #ffffff;
    --text: #1a2744;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
    --purple: #7c3aed;
    --sidebar-width: 220px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

  .layout { display: flex; min-height: 100vh; }

  /* ── SIDEBAR (alignée sur SALayout) ── */
  .sidebar {
    width: var(--sidebar-width);
    background: #fff;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    padding-bottom: 24px;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    text-decoration: none;
  }

  .sidebar-brand__logo {
    height: 48px;
    width: auto;
    object-fit: contain;
  }

  .sidebar-brand__name {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--navy);
    letter-spacing: -.01em;
  }

  .sidebar-nav {
    flex: 1;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background .15s, color .15s;
    font-family: 'DM Sans', sans-serif;
    font-size: .9rem;
    font-weight: 500;
    color: #475569;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    text-decoration: none;
  }

  .nav-item:hover { background: #f1f5f9; color: var(--navy); }
  .nav-item:hover svg { stroke: var(--navy); }

  .nav-item.active {
    background: var(--navy);
    color: #fff;
  }

  .nav-item.active svg { stroke: #fff; }
  .nav-item svg { stroke: #94a3b8; transition: stroke .15s; }

  .sidebar-divider { height: 1px; background: var(--border); margin: 12px; }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: .9rem;
    font-weight: 500;
    color: #94a3b8;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: color .15s;
  }

  .logout-btn:hover { color: #ef4444; }
  .logout-btn:hover svg { stroke: #ef4444; }
  .logout-btn svg { stroke: #94a3b8; transition: stroke .15s; }

  /* ── MAIN ── */
  .main { margin-left: var(--sidebar-width); flex: 1; display: flex; flex-direction: column; }

  .topbar {
    background: white;
    border-bottom: 1px solid var(--border);
    padding: 0 36px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .breadcrumb {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    color: var(--navy);
  }

  .topbar-right { display: flex; align-items: center; gap: 20px; }

  .notif-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
  }

  .notif-dot {
    position: absolute;
    top: 2px; right: 2px;
    width: 9px; height: 9px;
    background: #f59e0b;
    border-radius: 50%;
    border: 2px solid white;
  }

  .user-info { text-align: right; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .user-org  { font-size: 12px; color: var(--text-muted); }

  .avatar {
    width: 40px; height: 40px;
    background: #7c3aed;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white;
    letter-spacing: 0.5px; flex-shrink: 0;
  }

  .content { padding: 36px; flex: 1; }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .page-title { font-size: 30px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

  .actualiser-btn {
    background: var(--navy);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .actualiser-btn:hover {
    background: var(--accent-blue);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(30,77,183,0.28);
  }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px; }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 28px;
    display: flex;
    align-items: center;
    gap: 22px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

  .stat-icon {
    width: 54px; height: 54px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; border: 2px solid;
  }

  .stat-icon.sign  { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }
  .stat-icon.ok    { border-color: #6ee7b7; color: var(--success); background: #ecfdf5; }
  .stat-icon.refused { border-color: #fca5a5; color: var(--danger); background: #fef2f2; }

  .stat-value { font-size: 38px; font-weight: 700; color: var(--navy); letter-spacing: -1px; line-height: 1; }
  .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.3px; margin-top: 5px; }

  .table-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }

  .table-header {
    padding: 22px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .table-title { font-size: 15px; font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 10px; }

  .badge-count {
    background: #7c3aed;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 20px;
  }

  .search-box { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; }

  .search-input {
    padding: 9px 14px 9px 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    outline: none;
    width: 230px;
    transition: border-color 0.2s;
  }

  .search-input:focus { border-color: var(--accent-blue); background: white; }
  .search-input::placeholder { color: var(--text-muted); }

  .table-divider { height: 1px; background: var(--border); }
  .table-wrapper { overflow-x: auto; }

  table { width: 100%; border-collapse: collapse; }

  thead th {
    padding: 14px 28px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    background: white;
  }

  .empty-state { padding: 80px 24px; text-align: center; background: var(--bg); }
  .empty-icon  { font-size: 44px; margin-bottom: 14px; opacity: 0.25; }
  .empty-text  { font-size: 14px; color: var(--text-muted); font-weight: 500; }
`;

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
    <line x1="16" y1="8" x2="2" y2="22"/>
    <line x1="17.5" y1="15" x2="9" y2="15"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export default function DashboardDI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyRef, setBusyRef] = useState(null);
  const [preview, setPreview] = useState(null); // { url, name }
  const [rows, setRows] = useState([]); // une ligne par document

  const charger = async () => {
    setLoading(true);
    try {
      const data = await getDemandes();
      const demandes = Array.isArray(data) ? data : (data?.demandes ?? []);

      const lignes = [];
      for (const d of demandes) {
        const docs = Array.isArray(d.documents) ? d.documents : [];
        for (const doc of docs) {
          const sMatch = doc.reference?.match(/-S(\d+)-/);
          const semestre = sMatch ? `S${sMatch[1]}` : null;

          lignes.push({
            reference: doc.reference,
            etudiant: `${d.utilisateur?.prenom ?? ""} ${d.utilisateur?.nom ?? ""}`.trim(),
            typeDocument: d.typeDocument,
            semestre,
            createdAt: doc.createdAt || d.createdAt,
            statutDoc: doc.statut,
          });
        }
      }
      setRows(lignes);
    } catch (e) {
      console.error(e);
      setRows([]);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const openPreview = async (reference) => {
    if (!reference) return;
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
          </nav>
          <div className="sidebar-divider" />
          <button className="logout-btn" onClick={handleLogout}><LogoutIcon /> Déconnexion</button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">Directeur — IFRI</div>
            <div className="topbar-right">
              <button className="notif-btn"><BellIcon /><span className="notif-dot" /></button>
              <div className="user-info">
                <div className="user-name">Prof. Théophile KODJO</div>
                <div className="user-org">IFRI</div>
              </div>
              <div className="avatar">PR</div>
            </div>
          </header>

          <div className="content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Espace Directeur</h1>
                <p className="page-subtitle">Signature finale — par document.</p>
              </div>
              <button className="actualiser-btn" onClick={charger} disabled={loading}>
                {loading ? "Chargement..." : "Actualiser"}
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon sign"><PenIcon /></div>
                <div>
                  <div className="stat-value">{rows.length}</div>
                  <div className="stat-label">À signer</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon ok"><CheckCircleIcon /></div>
                <div>
                  <div className="stat-value">—</div>
                  <div className="stat-label">Validés (mois)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon refused"><XCircleIcon /></div>
                <div>
                  <div className="stat-value">—</div>
                  <div className="stat-label">Refusés</div>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <div className="table-title">
                  Documents en attente de signature finale
                  <span className="badge-count">{filtered.length}</span>
                </div>
                <div className="search-box">
                  <span className="search-icon"><SearchIcon /></span>
                  <input
                    className="search-input"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-divider" />

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Document</th>
                      <th>Semestre</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 24, color: "var(--text-muted)" }}>
                          Aucun document en attente
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr key={r.reference}>
                          <td style={{ padding: "12px 28px", fontFamily: "monospace", fontSize: 12 }}>
                            {r.reference}
                          </td>
                          <td style={{ padding: "12px 28px" }}>{r.etudiant}</td>
                          <td style={{ padding: "12px 28px" }}>{r.typeDocument}</td>
                          <td style={{ padding: "12px 28px" }}>{r.semestre ?? "—"}</td>
                          <td style={{ padding: "12px 28px" }}>{new Date(r.createdAt).toLocaleString()}</td>
                          <td style={{ padding: "12px 28px" }}>{r.statutDoc}</td>
                          <td style={{ padding: "12px 28px", display: "flex", gap: 8 }}>
                            <button className="actualiser-btn" onClick={() => openPreview(r.reference)}>
                              Aperçu
                            </button>
                            <button
                              className="actualiser-btn"
                              disabled={busyRef === r.reference}
                              onClick={async () => {
                                setBusyRef(r.reference);
                                try {
                                  await avancerDocument(r.reference, "APPROUVER");
                                  await charger();
                                } finally {
                                  setBusyRef(null);
                                }
                              }}
                            >
                              {busyRef === r.reference ? "..." : "Approuver"}
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
                    <div className="empty-text">Aucun document en attente de signature finale</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-preview-title">
              <span>👁 Aperçu — <span style={{ fontFamily: "monospace" }}>{preview.name}</span></span>
              <button className="btn outline" onClick={closePreview}>Fermer</button>
            </div>
            <div className="modal-body">
              <iframe title="preview" src={preview.url} style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}