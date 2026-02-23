const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  .topbar {
    height: 64px; background: #fff;
    border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 0 32px; gap: 20px;
    position: fixed; top: 0; left: 200px; right: 0; z-index: 40;
  }
  .topbar__notif {
    position: relative; background: none; border: none; cursor: pointer;
    color: #94a3b8; padding: 4px;
  }
  .topbar__badge {
    position: absolute; top: 0; right: 0;
    width: 8px; height: 8px; border-radius: 50%;
    background: #f5a623; border: 2px solid #fff;
  }
  .topbar__user { display: flex; align-items: center; gap: 10px; }
  .topbar__avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #1a2744;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.85rem; color: #fff;
    flex-shrink: 0;
  }
  .topbar__info { line-height: 1.3; }
  .topbar__name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.9rem; color: #1a2744; }
  .topbar__meta { font-size: 0.78rem; color: #94a3b8; }
`;

export default function TopBar({ name = "Koffi AGUEH", meta = "20220001 • IFRI", initials = "KA", notifCount = 1 }) {
    return (
        <>
            <style>{css}</style>
            <header className="topbar">
                <button className="topbar__notif">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {notifCount > 0 && <span className="topbar__badge" />}
                </button>
                <div className="topbar__user">
                    <div className="topbar__avatar">{initials}</div>
                    <div className="topbar__info">
                        <div className="topbar__name">{name}</div>
                        <div className="topbar__meta">{meta}</div>
                    </div>
                </div>
            </header>
        </>
    );
}