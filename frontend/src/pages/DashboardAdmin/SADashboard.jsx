import { useState, useEffect } from "react";
import SALayout from "../../components/DashboardAdmin/SALayout.jsx";
import SAStatCard from "../../components/DashboardAdmin/SAStatCard.jsx";
import SAInstBadge from "../../components/DashboardAdmin/SAInstBadge.jsx";
import { getDashboard } from "../../services/admin.service";

const css = `
  .sa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .sa-2col { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
  .sa-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
  .sa-card__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1e293b; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
  .inst-tbl { width: 100%; border-collapse: collapse; }
  .inst-tbl th { text-align: left; padding: 10px 0; font-family: 'Sora', sans-serif; font-weight: 600; font-size: .8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #f1f5f9; }
  .inst-tbl td { padding: 14px 0; border-bottom: 1px solid #f8fafc; font-size: .9rem; color: #334155; vertical-align: middle; }
  .inst-tbl tbody tr:last-child td { border-bottom: none; }
  .td-inst-name { display: flex; align-items: center; gap: 10px; }
  .num-orange { color: #f59e0b; font-weight: 700; font-family: 'Sora', sans-serif; }
  .num-green  { color: #16a34a; font-weight: 700; font-family: 'Sora', sans-serif; }
  .activity-list { display: flex; flex-direction: column; gap: 16px; }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; }
  .activity-dot  { width: 8px; height: 8px; border-radius: 50%; background: #2e7d32; flex-shrink: 0; margin-top: 5px; }
  .activity-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .88rem; color: #1e293b; margin-bottom: 2px; }
  .activity-sub   { font-size: .8rem; color: #475569; margin-bottom: 2px; }
  .activity-time  { font-size: .75rem; color: #94a3b8; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sa-spinner {
    display: inline-block; width: 28px; height: 28px;
    border: 3px solid #e2e8f0; border-top-color: #2e7d32; border-radius: 50%;
    animation: spin .7s linear infinite;
    margin: 40px auto; display: block;
  }
  .sa-error-block {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
    padding: 14px 18px; color: #b91c1c; font-size: .9rem;
    display: flex; align-items: center; gap: 10px;
  }
  @media (max-width: 900px) {
    .sa-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .sa-2col { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .sa-card { overflow-x: auto; }
  }
  @media (max-width: 600px) {
    .inst-tbl, .inst-tbl tbody, .inst-tbl tr, .inst-tbl td { display: block; width: 100%; }
    .inst-tbl thead { display: none; }
    .inst-tbl tbody tr { border: 1px solid #e2e8f0; border-radius: 12px; padding: 4px 12px; margin-bottom: 10px; }
    .inst-tbl td { border: none; padding: 8px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: right; }
    .inst-tbl td + td { border-top: 1px solid #f1f5f9; }
    .inst-tbl td::before {
      content: attr(data-label); font-weight: 700; font-size: .7rem; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .04em; text-align: left; flex-shrink: 0;
    }
  }
  @media (max-width: 480px) {
    .sa-stats-grid { grid-template-columns: 1fr; }
    .sa-card { padding: 16px; }
  }
`;

export default function SADashboard() {
  const [stats, setStats] = useState(null); // {kpis, parInstitution}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getDashboard();
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total demandes",
          value: stats.kpis?.totalDemandes ?? 0,
          sub: "Toutes institutions",
          accentColor: "#2e7d32",
          iconBg: "#eff6ff",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ),
        },
        {
          label: "Demandes en attente",
          value: stats.kpis?.demandesEnAttente ?? 0,
          sub: "Toutes institutions",
          accentColor: "#f59e0b",
          iconBg: "#fffbeb",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        },
        {
          label: "Documents générés",
          value: stats.kpis?.docsCeMois ?? 0,
          sub: "Ce mois",
          accentColor: "#16a34a",
          iconBg: "#f0fdf4",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
          ),
        },
        {
          label: "Agents actifs",
          value: stats.kpis?.agentsActifs ?? 0,
          sub: "Toutes institutions",
          accentColor: "#3b82f6",
          iconBg: "#eff6ff",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <SALayout>
      <style>{css}</style>

      <div>
        <h2 className="sa-page-title">Tableau de bord Super Admin</h2>
        <p className="sa-page-sub">Vue d'ensemble de toutes les institutions</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <span className="sa-spinner" />
        </div>
      ) : !stats ? (
        <div className="sa-error-block">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Impossible de charger les statistiques.
        </div>
      ) : (
        <>
          <div className="sa-stats-grid">
            {statCards.map((s, i) => (
              <SAStatCard key={i} {...s} />
            ))}
          </div>

          <div className="sa-2col">
            <div className="sa-card">
              <div className="sa-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
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
                  {(stats.parInstitution || []).map((row) => (
                    <tr key={row.code}>
                      <td data-label="Institution">
                        <div className="td-inst-name">
                          <SAInstBadge code={row.code} size="md" />
                          {row.code}
                        </div>
                      </td>
                      <td data-label="En attente">
                        <span className="num-orange">{row.attente}</span>
                      </td>
                      <td data-label="Traitées">
                        <span className="num-green">{row.traitees}</span>
                      </td>
                      <td data-label="Agents">{row.agents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sa-card">
              <div className="sa-card__title">Activité système</div>
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: ".9rem", padding: "8px 0" }}>
                Aucune activité récente
              </p>
            </div>
          </div>
        </>
      )}
    </SALayout>
  );
}