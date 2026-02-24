import { useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";

const css = `
  .md-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .md-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .md-sub   { color:#475569; font-size:.9rem; }
  .btn-new-orange {
    display:inline-flex; align-items:center; gap:8px;
    background:#f5a623; color:#fff; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem;
    padding:11px 22px; cursor:pointer; white-space:nowrap;
    transition:background .2s; text-decoration:none;
  }
  .btn-new-orange:hover { background:#fbbf4a; }

  .filter-bar {
    background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:16px 20px;
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  }
  .filter-tab {
    padding:8px 18px; border-radius:8px; border:1.5px solid #e2e8f0;
    font-family:'Sora',sans-serif; font-size:.85rem; font-weight:600; cursor:pointer;
    background:#fff; color:#475569; transition:all .15s;
    white-space:nowrap;
  }
  .filter-tab.active { background:#1a2744; color:#fff; border-color:#1a2744; }
  .filter-tab:not(.active):hover { border-color:#1a2744; color:#1a2744; }
  .search-wrap { flex:1; min-width:200px; position:relative; }
  .search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); }
  .search-input {
    width:100%; padding:9px 14px 9px 36px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    font-family:'DM Sans',sans-serif; font-size:.88rem; color:#334155;
    background:#f8fafc; outline:none; transition:border-color .2s;
  }
  .search-input:focus { border-color:#1a2744; background:#fff; }

  .table-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; }
  .table { width:100%; border-collapse:collapse; }
  .table thead tr { border-bottom:1px solid #f1f5f9; }
  .table th { text-align:left; padding:14px 20px; font-family:'Sora',sans-serif; font-weight:600; font-size:.82rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
  .table td { padding:16px 20px; border-bottom:1px solid #f8fafc; }
  .table tbody tr:last-child td { border-bottom:none; }
  .table tbody tr:hover { background:#fafbff; }
  .td-ref   { font-size:.85rem; color:#94a3b8; font-family:'DM Sans',sans-serif; }
  .td-type  { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:#1a2744; }
  .td-date  { font-size:.88rem; color:#475569; }
  .td-actions { display:flex; align-items:center; gap:6px; justify-content:flex-end; }
  .btn-view {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500; color:#475569;
    background:none; border:none; cursor:pointer; transition:color .2s; padding:4px 0;
  }
  .btn-view:hover { color:#1a2744; }
  .badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-size:.78rem; font-weight:600; white-space:nowrap; }
  .badge--traitement { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .badge--disponible { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
  .badge--attente    { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
  .badge--rejete     { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
`;

const ALL = [
  { ref:"REQ-2026-00142", type:"Attestation d'inscription", date:"14 fév 2026", status:"En traitement" },
  { ref:"REQ-2026-00089", type:"Relevé de notes",           date:"02 fév 2026", status:"Disponible" },
  { ref:"REQ-2026-00034", type:"Attestation de succès",     date:"18 jan 2026", status:"Disponible" },
  { ref:"REQ-2025-00912", type:"Attestation d'inscription", date:"10 déc 2025", status:"Disponible" },
  { ref:"REQ-2025-00845", type:"Relevé de notes",           date:"28 nov 2025", status:"Disponible" },
];

const BADGE = {
  "En traitement": "badge--traitement",
  "Disponible":    "badge--disponible",
  "En attente":    "badge--attente",
  "Rejetée":       "badge--rejete",
};

const FILTERS = ["Toutes", "En attente", "En traitement", "Disponible", "Rejetée"];

export default function MesDemandes() {
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");

  const filtered = ALL.filter(d => {
    const matchFilter = filter === "Toutes" || d.status === filter;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) ||
                        d.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div className="md-header">
        <div>
          <h2 className="md-title">Mes demandes</h2>
          <p className="md-sub">Suivez l'état de toutes vos demandes de documents</p>
        </div>
        <a href="/dashboard/nouvelle" className="btn-new-orange">Nouvelle demande</a>
      </div>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f} className={`filter-tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f}{f === "Toutes" ? ` (${ALL.length})` : ""}
          </button>
        ))}
        <div className="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="search-input" placeholder="Rechercher par référence ou type..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Type de document</th>
              <th>Date de soumission</th>
              <th>Statut</th>
              <th style={{textAlign:"right"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i}>
                <td className="td-ref">{d.ref}</td>
                <td className="td-type">{d.type}</td>
                <td className="td-date">{d.date}</td>
                <td><span className={`badge ${BADGE[d.status] || ""}`}>{d.status}</span></td>
                <td>
                  <div className="td-actions">
                    <button className="btn-view">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Voir détails
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
