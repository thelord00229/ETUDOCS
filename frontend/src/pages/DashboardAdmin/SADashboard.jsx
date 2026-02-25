import SALayout from "../components/SALayout.jsx";
import SAStatCard from "../components/SAStatCard.jsx";
import SAInstBadge from "../components/SAInstBadge.jsx";

const css = `
  .sa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .sa-2col { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
  .sa-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
  .sa-card__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
  .inst-tbl { width: 100%; border-collapse: collapse; }
  .inst-tbl th { text-align: left; padding: 10px 0; font-family: 'Sora', sans-serif; font-weight: 600; font-size: .8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #f1f5f9; }
  .inst-tbl td { padding: 14px 0; border-bottom: 1px solid #f8fafc; font-size: .9rem; color: #334155; vertical-align: middle; }
  .inst-tbl tbody tr:last-child td { border-bottom: none; }
  .td-inst-name { display: flex; align-items: center; gap: 10px; }
  .num-orange { color: #f59e0b; font-weight: 700; font-family: 'Sora', sans-serif; }
  .num-green  { color: #16a34a; font-weight: 700; font-family: 'Sora', sans-serif; }
  .activity-list { display: flex; flex-direction: column; gap: 16px; }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; }
  .activity-dot  { width: 8px; height: 8px; border-radius: 50%; background: #1a2744; flex-shrink: 0; margin-top: 5px; }
  .activity-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .88rem; color: #1a2744; margin-bottom: 2px; }
  .activity-sub   { font-size: .8rem; color: #475569; margin-bottom: 2px; }
  .activity-time  { font-size: .75rem; color: #94a3b8; }
  @media (max-width: 900px) {
    .sa-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .sa-2col { grid-template-columns: 1fr; }
  }
`;

const STATS = [
    {
        label: "Total demandes", value: "448", sub: "Toutes institutions",
        accentColor: "#1a2744", iconBg: "#eff6ff",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    {
        label: "Demandes en attente", value: "25", sub: "↗ Toutes institutions",
        accentColor: "#f59e0b", iconBg: "#fffbeb",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    {
        label: "Documents ce mois", value: "448", sub: "Février 2026",
        accentColor: "#16a34a", iconBg: "#f0fdf4",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
    },
    {
        label: "Agents actifs", value: "16", sub: "3 institutions",
        accentColor: "#3b82f6", iconBg: "#eff6ff",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
    },
];

const INSTS = [
    { code: "IFRI", attente: 8,  traitees: 147, agents: 5 },
    { code: "EPAC", attente: 12, traitees: 203, agents: 7 },
    { code: "FSS",  attente: 5,  traitees: 98,  agents: 4 },
];

const ACTIVITY = [
    { title: "Nouvel agent ajouté",           sub: "Marie TOSSA • IFRI",           time: "Il y a 5 min" },
    { title: "Signature mise à jour",         sub: "EPAC • Nouveau directeur",     time: "Il y a 30 min" },
    { title: "Import de données académiques", sub: "FSS • 234 étudiants importés", time: "Il y a 1h" },
    { title: "Nouvelle demande validée",      sub: "IFRI • REQ-2026-00142",        time: "Il y a 2h" },
];

export default function SADashboard() {
    return (
        <SALayout>
            <style>{css}</style>

            <div>
                <h2 className="sa-page-title">Tableau de bord Super Admin</h2>
                <p className="sa-page-sub">Vue d'ensemble de toutes les institutions</p>
            </div>

            <div className="sa-stats-grid">
                {STATS.map((s, i) => <SAStatCard key={i} {...s} />)}
            </div>

            <div className="sa-2col">
                {/* Par institution */}
                <div className="sa-card">
                    <div className="sa-card__title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                        </svg>
                        Par institution
                    </div>
                    <table className="inst-tbl">
                        <thead>
                        <tr>
                            <th>Institution</th>
                            <th>En attente</th>
                            <th>Traitées</th>
                            <th>Agents</th>
                        </tr>
                        </thead>
                        <tbody>
                        {INSTS.map((r, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="td-inst-name">
                                        <SAInstBadge code={r.code} size="md" />
                                        {r.code}
                                    </div>
                                </td>
                                <td><span className="num-orange">{r.attente}</span></td>
                                <td><span className="num-green">{r.traitees}</span></td>
                                <td>{r.agents}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Activité système */}
                <div className="sa-card">
                    <div className="sa-card__title">Activité système</div>
                    <div className="activity-list">
                        {ACTIVITY.map((a, i) => (
                            <div className="activity-item" key={i}>
                                <div className="activity-dot" />
                                <div>
                                    <div className="activity-title">{a.title}</div>
                                    <div className="activity-sub">{a.sub}</div>
                                    <div className="activity-time">{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SALayout>
    );
}