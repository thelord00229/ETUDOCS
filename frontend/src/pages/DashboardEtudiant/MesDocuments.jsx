import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";

const css = `
  .docs-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:4px; }
  .docs-sub   { color:#475569; font-size:.9rem; }

  .docs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .doc-file-card {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px;
    display:flex; flex-direction:column; gap:12px;
    border-top:4px solid #16a34a;
    transition:box-shadow .2s, transform .2s;
  }
  .doc-file-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }
  .doc-file-icon {
    width:56px; height:56px; border-radius:14px; background:#1a2744;
    display:flex; align-items:center; justify-content:center;
  }
  .doc-file-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; }
  .doc-file-meta  { display:flex; align-items:center; gap:6px; font-size:.82rem; color:#94a3b8; }
  .doc-file-meta svg { flex-shrink:0; }
  .doc-file-actions { display:flex; align-items:center; gap:8px; margin-top:4px; }
  .btn-dl {
    flex:1; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:#16a34a; color:#fff; border:none; border-radius:8px;
    font-family:'Sora',sans-serif; font-weight:700; font-size:.85rem;
    padding:10px 16px; cursor:pointer; transition:background .2s;
  }
  .btn-dl:hover { background:#15803d; }
  .btn-qr {
    width:38px; height:38px; border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; display:flex; align-items:center; justify-content:center;
    cursor:pointer; flex-shrink:0; transition:border-color .2s;
  }
  .btn-qr:hover { border-color:#1a2744; }

  .qr-banner {
    background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:14px;
    padding:20px 24px; display:flex; align-items:flex-start; gap:16px;
  }
  .qr-banner__icon {
    width:44px; height:44px; border-radius:12px; background:#16a34a; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .qr-banner__title { font-family:'Sora',sans-serif; font-weight:700; color:#16a34a; margin-bottom:4px; }
  .qr-banner__text  { font-size:.85rem; color:#475569; line-height:1.6; }
`;

const DOCS = [
  { title:"Relevé de notes",          date:"04 fév 2026", ref:"IFRI-2026-RN-00089" },
  { title:"Attestation de succès",    date:"20 jan 2026", ref:"IFRI-2026-ATS-00034" },
  { title:"Attestation d'inscription",date:"12 déc 2025", ref:"IFRI-2025-ATI-00912" },
  { title:"Relevé de notes",          date:"30 nov 2025", ref:"IFRI-2025-RN-00845" },
  { title:"Attestation d'inscription",date:"15 oct 2025", ref:"IFRI-2025-ATI-00712" },
];

const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const QrIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
    <line x1="21" y1="14" x2="21" y2="14"/><line x1="18" y1="21" x2="21" y2="21"/>
    <line x1="21" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function MesDocuments() {
  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="docs-title">Mes documents</h2>
        <p className="docs-sub">Téléchargez et vérifiez vos documents certifiés</p>
      </div>

      <div className="docs-grid">
        {DOCS.map((d, i) => (
          <div className="doc-file-card" key={i}>
            <div className="doc-file-icon"><DocIcon /></div>
            <div className="doc-file-title">{d.title}</div>
            <div className="doc-file-meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {d.date}
            </div>
            <div className="doc-file-meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {d.ref}
            </div>
            <div className="doc-file-actions">
              <button className="btn-dl">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Télécharger
              </button>
              <button className="btn-qr"><QrIcon /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="qr-banner">
        <div className="qr-banner__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="qr-banner__title">Documents certifiés avec QR code</div>
          <div className="qr-banner__text">
            Chaque document téléchargé contient un QR code unique pour vérifier son authenticité.
            Les tiers peuvent scanner ce code pour confirmer que le document a bien été émis par votre institution via EtuDocs.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
