import { useState } from "react";

const css = `
  .sa-toggle { width: 42px; height: 23px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
  .sa-toggle--on  { background: #1a2744; }
  .sa-toggle--off { background: #e2e8f0; }
  .sa-toggle__knob { position: absolute; top: 3px; width: 17px; height: 17px; border-radius: 50%; background: #fff; transition: left .2s; }
  .sa-toggle__knob--on  { left: 22px; }
  .sa-toggle__knob--off { left: 3px; }
  .sa-toggle-wrap { display: flex; align-items: center; gap: 8px; }
  .sa-toggle-label { font-size: .82rem; color: #475569; font-family: 'DM Sans', sans-serif; }
`;

export default function SAToggle({ defaultOn = true, label, onChange }) {
    const [on, setOn] = useState(defaultOn);
    const toggle = () => { setOn(v => !v); onChange && onChange(!on); };
    return (
        <>
            <style>{css}</style>
            <div className="sa-toggle-wrap">
                <button className={`sa-toggle sa-toggle--${on ? "on" : "off"}`} onClick={toggle}>
                    <div className={`sa-toggle__knob sa-toggle__knob--${on ? "on" : "off"}`} />
                </button>
                {label && <span className="sa-toggle-label">{label}</span>}
            </div>
        </>
    );
}