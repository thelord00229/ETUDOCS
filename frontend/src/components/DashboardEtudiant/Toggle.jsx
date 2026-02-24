import { useState } from "react";

const css = `
  .toggle-wrap { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #f1f5f9; }
  .toggle-wrap:last-child { border-bottom:none; }
  .toggle-info {}
  .toggle-info__title { font-family:'Sora',sans-serif; font-weight:600; font-size:.9rem; color:#1a2744; margin-bottom:2px; }
  .toggle-info__sub   { font-size:.8rem; color:#94a3b8; }
  .toggle-btn {
    width:44px; height:24px; border-radius:12px; border:none; cursor:pointer;
    position:relative; flex-shrink:0; transition:background .2s;
  }
  .toggle-btn--on  { background:#1a2744; }
  .toggle-btn--off { background:#e2e8f0; }
  .toggle-knob {
    position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff;
    transition:left .2s;
  }
  .toggle-knob--on  { left:23px; }
  .toggle-knob--off { left:3px; }
`;

export default function Toggle({ title, sub, defaultOn = true }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <>
      <style>{css}</style>
      <div className="toggle-wrap">
        <div className="toggle-info">
          <div className="toggle-info__title">{title}</div>
          {sub && <div className="toggle-info__sub">{sub}</div>}
        </div>
        <button className={`toggle-btn toggle-btn--${on ? "on" : "off"}`} onClick={() => setOn(!on)}>
          <div className={`toggle-knob toggle-knob--${on ? "on" : "off"}`} />
        </button>
      </div>
    </>
  );
}
