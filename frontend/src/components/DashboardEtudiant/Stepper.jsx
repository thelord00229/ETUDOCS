const css = `
  .stepper { display:flex; align-items:center; margin-bottom:28px; }
  .stepper__item { display:flex; align-items:center; gap:10px; }
  .stepper__circle {
    width:38px; height:38px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem;
    transition:background .3s;
  }
  .stepper__circle--done   { background:#1a2744; color:#fff; }
  .stepper__circle--active { background:#1a2744; color:#fff; }
  .stepper__circle--idle   { background:#fff; color:#94a3b8; border:2px solid #e2e8f0; }
  .stepper__label { font-family:'Sora',sans-serif; font-size:.88rem; font-weight:600; white-space:nowrap; }
  .stepper__label--active { color:#1a2744; }
  .stepper__label--idle   { color:#94a3b8; }
  .stepper__label--done   { color:#1a2744; }
  .stepper__line { flex:1; height:2px; margin:0 12px; }
  .stepper__line--done { background:#1a2744; }
  .stepper__line--idle { background:#e2e8f0; }
`;

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Stepper({ steps, current }) {
  // current: 0-based index
  return (
    <>
      <style>{css}</style>
      <div className="stepper">
        {steps.map((label, i) => {
          const isDone   = i < current;
          const isActive = i === current;
          const state    = isDone ? "done" : isActive ? "active" : "idle";
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: i < steps.length - 1 ? 1 : "none" }}>
              <div className="stepper__item">
                <div className={`stepper__circle stepper__circle--${state}`}>
                  {isDone ? <Check /> : i + 1}
                </div>
                <span className={`stepper__label stepper__label--${state}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`stepper__line stepper__line--${isDone ? "done" : "idle"}`} style={{flex:1}} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
