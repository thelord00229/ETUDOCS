const css = `
  .sa-inst-badge {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 8px; background: #1a2744; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; flex-shrink: 0;
  }
  .sa-inst-badge--lg { width: 52px; height: 52px; border-radius: 12px; font-size: .95rem; }
  .sa-inst-badge--md { width: 36px; height: 36px; font-size: .75rem; }
  .sa-inst-badge--sm { width: 24px; height: 24px; border-radius: 6px; font-size: .65rem; }
`;

export default function SAInstBadge({ code, size = "md" }) {
    return (
        <>
            <style>{css}</style>
            <span className={`sa-inst-badge sa-inst-badge--${size}`}>{code}</span>
        </>
    );
}