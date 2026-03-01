const css = `
  .demand-row {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 0; border-bottom: 1px solid #f1f5f9;
  }
  .demand-row:last-child { border-bottom: none; }
  .demand-row__icon {
    width: 40px; height: 40px; border-radius: 10px; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .demand-row__info { flex: 1; }
  .demand-row__title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 0.9rem; color: #1a2744; }
  .demand-row__meta { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; }
  .demand-row__right { display: flex; align-items: center; gap: 12px; }
  .badge-status {
    display: inline-flex; align-items: center;
    padding: 4px 12px; border-radius: 20px;
    font-size: 0.78rem; font-weight: 600; white-space: nowrap;
  }
  .badge-status--traitement { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .badge-status--disponible { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .badge-status--rejete     { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .badge-status--attente    { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .badge-status--expire     { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

  .btn-details {
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
    color: #475569; background: none; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 6px 14px; cursor: pointer; white-space: nowrap;
    transition: border-color .2s, color .2s;
  }
  .btn-details:hover { border-color: #1a2744; color: #1a2744; }
`;

const STATUS_CLASS = {
  "En traitement": "badge-status--traitement",
  "Disponible": "badge-status--disponible",
  "Expirée": "badge-status--expire",
  "Rejetée": "badge-status--rejete",
  "En attente": "badge-status--attente",
};

export default function DemandRow({ title, ref_, date, status, onDetails }) {
  return (
    <>
      <style>{css}</style>
      <div className="demand-row">
        <div className="demand-row__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div className="demand-row__info">
          <div className="demand-row__title">{title}</div>
          <div className="demand-row__meta">{ref_} • {date}</div>
        </div>
        <div className="demand-row__right">
          <span className={`badge-status ${STATUS_CLASS[status] || "badge-status--traitement"}`}>
            {status}
          </span>
          <button className="btn-details" onClick={onDetails}>Voir détails</button>
        </div>
      </div>
    </>
  );
}