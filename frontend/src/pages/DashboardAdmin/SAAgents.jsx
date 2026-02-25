import { useState } from "react";
import SALayout from "../components/SALayout.jsx";
import SAToggle from "../components/SAToggle.jsx";
import SAInstBadge from "../components/SAInstBadge.jsx";

const css = `
  .sa-agents-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .btn-add-agent {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px;
    background: #16a34a; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s; white-space: nowrap;
  }
  .btn-add-agent:hover { background: #15803d; }
  .sa-search-bar {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 12px 18px; display: flex; align-items: center; gap: 10px;
  }
  .sa-search-bar input {
    flex: 1; border: none; outline: none; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; color: #334155; background: none;
  }
  .sa-search-bar input::placeholder { color: #cbd5e1; }
  .agents-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
  .agents-tbl { width: 100%; border-collapse: collapse; }
  .agents-tbl th {
    text-align: left; padding: 12px 20px;
    font-family: 'Sora', sans-serif; font-weight: 600; font-size: .8rem;
    color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; background: #f8fafc;
  }
  .agents-tbl td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  .agents-tbl tbody tr:last-child td { border-bottom: none; }
  .agents-tbl tbody tr:hover { background: #fafbff; }
  .ag-name  { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .9rem; color: #1a2744; }
  .ag-inst-cell { display: flex; align-items: center; gap: 8px; font-size: .9rem; color: #334155; }
  .ag-email { font-size: .85rem; color: #475569; }
  .ag-date  { font-size: .88rem; color: #475569; }
  .badge-actif   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 3px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
  .badge-inactif { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;  padding: 3px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
  .ag-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
  .btn-reinit {
    display: inline-flex; align-items: center; gap: 5px; font-size: .82rem;
    color: #475569; background: none; border: none; cursor: pointer;
    transition: color .2s; white-space: nowrap; font-family: 'DM Sans', sans-serif;
  }
  .btn-reinit:hover { color: #1a2744; }
  .btn-mail { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 2px; transition: color .2s; }
  .btn-mail:hover { color: #1a2744; }
`;

const INITIAL_AGENTS = [
    { nom: "Marie TOSSA",   inst: "IFRI", ic: "IFRI", email: "marie.tossa@ifri.uac.bj",   actif: true,  date: "12 jan 2024" },
    { nom: "Jean AKPO",     inst: "IFRI", ic: "IFRI", email: "jean.akpo@ifri.uac.bj",     actif: true,  date: "08 fév 2024" },
    { nom: "Sophie GBENOU", inst: "EPAC", ic: "EPAC", email: "sophie.gbenou@epac.uac.bj", actif: true,  date: "15 mar 2024" },
    { nom: "Paul DOSSOU",   inst: "EPAC", ic: "EPAC", email: "paul.dossou@epac.uac.bj",   actif: true,  date: "20 mar 2024" },
    { nom: "Koffi HOUNNOU", inst: "FSS",  ic: "FSS",  email: "koffi.hounnou@fss.uac.bj",  actif: false, date: "05 avr 2024" },
];

export default function SAAgents() {
    const [search, setSearch] = useState("");
    const [agents, setAgents] = useState(INITIAL_AGENTS);

    const toggle = (email) => setAgents(a => a.map(ag => ag.email === email ? { ...ag, actif: !ag.actif } : ag));

    const filtered = agents.filter(a =>
        a.nom.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.inst.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SALayout>
            <style>{css}</style>

            <div className="sa-agents-header">
                <div>
                    <h2 className="sa-page-title">Gestion des agents</h2>
                    <p className="sa-page-sub">Gérez les comptes agents de toutes les institutions</p>
                </div>
                <button className="btn-add-agent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Ajouter un agent
                </button>
            </div>

            <div className="sa-search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    placeholder="Rechercher par nom, email ou institution..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="agents-table-wrap">
                <table className="agents-tbl">
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Institution</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Date de création</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((a, i) => (
                        <tr key={i}>
                            <td className="ag-name">{a.nom}</td>
                            <td>
                                <div className="ag-inst-cell">
                                    <SAInstBadge code={a.ic.slice(0,1)} size="sm" />
                                    {a.inst}
                                </div>
                            </td>
                            <td className="ag-email">{a.email}</td>
                            <td>
                  <span className={a.actif ? "badge-actif" : "badge-inactif"}>
                    {a.actif ? "Actif" : "Inactif"}
                  </span>
                            </td>
                            <td className="ag-date">{a.date}</td>
                            <td>
                                <div className="ag-actions">
                                    <SAToggle defaultOn={a.actif} onChange={() => toggle(a.email)} />
                                    <button className="btn-reinit">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                                            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                                        </svg>
                                        Réinitialiser
                                    </button>
                                    <button className="btn-mail">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: ".9rem" }}>
                                Aucun agent trouvé
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </SALayout>
    );
}