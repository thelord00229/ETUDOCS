import { useEffect } from "react";

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const COLORS = {
  success: { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
  error:   { bg: "#fef2f2", border: "#dc2626", text: "#b91c1c" },
  info:    { bg: "#eff6ff", border: "#2563eb", text: "#1d4ed8" },
};

const Toast = ({ message, type = "info", onClose }) => {
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .etd-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px; border-radius: 8px; max-width: 360px;
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          animation: toastIn .25s ease;
          border-left: 4px solid;
          font-family: 'DM Sans', sans-serif; font-size: .9rem; line-height: 1.4;
        }
        .etd-toast-close {
          margin-left: auto; padding-left: 8px; background: none; border: none;
          cursor: pointer; opacity: .55; font-size: 1.1rem; line-height: 1;
          color: inherit;
        }
        .etd-toast-close:hover { opacity: 1; }
        @media (max-width: 480px) {
          .etd-toast { right: 12px; left: 12px; max-width: none; bottom: 16px; }
        }
      `}</style>
      <div
        className="etd-toast"
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
        role="alert"
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[type]}</span>
        <span>{message}</span>
        <button className="etd-toast-close" onClick={onClose} aria-label="Fermer">×</button>
      </div>
    </>
  );
};

export default Toast;
