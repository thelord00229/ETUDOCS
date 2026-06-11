function EmptyFileIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="34"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6" />
    </svg>
  );
}

export function EmptyDocuments() {
  return (
    <div className="empty-documents">
      <style>{`
        .empty-documents {
          align-items: center;
          background: var(--bg-secondary, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          color: var(--text-muted, #4b5563);
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
          min-height: 220px;
          padding: 32px 20px;
          text-align: center;
        }

        .empty-documents__icon {
          align-items: center;
          background: #f0fdf4;
          border-radius: 999px;
          color: #16a34a;
          display: flex;
          height: 72px;
          justify-content: center;
          width: 72px;
        }

        .empty-documents__title {
          color: var(--text, #111827);
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
        }
      `}</style>

      <span className="empty-documents__icon">
        <EmptyFileIcon />
      </span>
      <p className="empty-documents__title">Aucun document disponible pour le moment</p>
    </div>
  );
}
