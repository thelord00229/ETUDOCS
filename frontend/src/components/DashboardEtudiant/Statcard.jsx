const css = `
  .stat-card {
    background: #fff; border-radius: 14px;
    border: 1px solid #e2e8f0;
    padding: 20px 22px; display: flex; flex-direction: column; gap: 8px;
    position: relative; overflow: hidden;
  }
  .stat-card__header { display: flex; align-items: center; justify-content: space-between; }
  .stat-card__label { font-size: 0.85rem; color: #475569; font-family: 'DM Sans', sans-serif; }
  .stat-card__icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-card__value {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 2rem; color: #1a2744;
    line-height: 1;
  }
  .stat-card__sub { font-size: 0.8rem; color: #94a3b8; }
  .stat-card__accent {
    position: absolute; top: 0; left: 0; width: 4px; height: 100%; border-radius: 14px 0 0 14px;
  }
`;

export default function StatCard({ label, value, sub, icon, accentColor = "#f5a623", iconBg = "#fffbeb" }) {
    return (
        <>
            <style>{css}</style>
            <div className="stat-card">
                <div className="stat-card__accent" style={{ background: accentColor }} />
                <div className="stat-card__header">
                    <span className="stat-card__label">{label}</span>
                    <div className="stat-card__icon" style={{ background: iconBg }}>
                        {icon}
                    </div>
                </div>
                <div className="stat-card__value">{value}</div>
                {sub && <div className="stat-card__sub">{sub}</div>}
            </div>
        </>
    );
}