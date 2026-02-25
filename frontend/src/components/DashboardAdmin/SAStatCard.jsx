const css = `
  .sa-stat-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 20px 22px; position: relative; overflow: hidden;
  }
  .sa-stat-card__accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; border-radius: 14px 0 0 14px; }
  .sa-stat-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sa-stat-card__label  { font-size: .85rem; color: #475569; font-family: 'DM Sans', sans-serif; }
  .sa-stat-card__icon   { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .sa-stat-card__value  { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 2rem; color: #1a2744; line-height: 1; margin-bottom: 4px; }
  .sa-stat-card__sub    { font-size: .8rem; color: #94a3b8; }
`;

export default function SAStatCard({ label, value, sub, icon, accentColor = "#1a2744", iconBg = "#f1f5f9" }) {
    return (
        <>
            <style>{css}</style>
            <div className="sa-stat-card">
                <div className="sa-stat-card__accent" style={{ background: accentColor }} />
                <div className="sa-stat-card__header">
                    <span className="sa-stat-card__label">{label}</span>
                    <div className="sa-stat-card__icon" style={{ background: iconBg }}>{icon}</div>
                </div>
                <div className="sa-stat-card__value">{value}</div>
                {sub && <div className="sa-stat-card__sub">{sub}</div>}
            </div>
        </>
    );
}