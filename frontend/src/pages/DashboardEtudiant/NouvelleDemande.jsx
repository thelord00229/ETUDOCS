import { useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Stepper from "../../components/DashboardEtudiant/Stepper.jsx";

const css = `
  /* PAGE HEADER */
  .nd-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.5rem; color:#1a2744; margin-bottom:6px; }
  .nd-sub   { color:#475569; font-size:.9rem; margin-bottom:24px; }

  /* STEP 1 - DOC GRID */
  .doc-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .doc-card {
    border:1.5px solid #e2e8f0; border-radius:14px; padding:18px 20px;
    display:flex; align-items:flex-start; gap:14px; cursor:pointer;
    transition:border-color .2s, box-shadow .2s, background .15s;
    background:#fff;
  }
  .doc-card:hover   { border-color:#1a2744; box-shadow:0 4px 16px rgba(26,39,68,.08); }
  .doc-card.selected { border-color:#1a2744; background:#f0f4ff; box-shadow:0 4px 16px rgba(26,39,68,.1); }
  .doc-card__icon {
    width:44px; height:44px; border-radius:10px; background:#f1f5f9; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .doc-card.selected .doc-card__icon { background:#e0e7ff; }
  .doc-card__title { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; margin-bottom:6px; }
  .doc-card__meta  { display:flex; align-items:center; gap:5px; font-size:.78rem; color:#94a3b8; margin-bottom:4px; }
  .doc-card__pieces { font-size:.78rem; color:#94a3b8; }

  /* STEP 2 - UPLOAD */
  .step2-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
  .upload-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:22px; }
  .upload-card__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .upload-card__title { font-family:'Sora',sans-serif; font-weight:600; font-size:.95rem; color:#1a2744; }
  .upload-card__fmt   { font-size:.78rem; color:#94a3b8; margin-bottom:14px; }
  .upload-zone {
    border:2px dashed #e2e8f0; border-radius:10px; padding:28px 20px;
    display:flex; flex-direction:column; align-items:center; gap:8px;
    cursor:pointer; transition:border-color .2s, background .2s;
    margin-bottom:12px;
  }
  .upload-zone:hover { border-color:#1a2744; background:#fafbff; }
  .upload-zone__text { font-size:.85rem; color:#94a3b8; }
  .btn-browse {
    padding:6px 16px; border:1.5px solid #e2e8f0; border-radius:8px; background:#fff;
    font-family:'DM Sans',sans-serif; font-size:.85rem; color:#334155; cursor:pointer;
    transition:border-color .2s;
  }
  .btn-browse:hover { border-color:#1a2744; }
  .upload-file {
    display:flex; align-items:center; gap:8px;
    background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px;
    font-size:.85rem; color:#16a34a; font-weight:500;
  }
  .check-icon { color:#16a34a; }
  .paiement-card {
    background:#fff; border:1.5px solid #f5a623; border-radius:14px; padding:22px;
  }
  .paiement-card__title { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; display:flex; align-items:center; gap:8px; margin-bottom:14px; }
  .paiement-card__opts  { font-size:.85rem; color:#475569; margin-bottom:12px; font-weight:500; }
  .paiement-card__list  { list-style:none; padding:0; display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
  .paiement-card__list li { font-size:.85rem; color:#475569; display:flex; align-items:center; gap:6px; }
  .paiement-card__list li::before { content:'•'; color:#f5a623; font-size:1.1rem; }
  .paiement-card__note {
    background:#fffbeb; border:1px solid #fde68a; border-radius:8px;
    padding:10px 12px; font-size:.8rem; color:#92400e; display:flex; gap:8px; margin-bottom:14px;
  }
  .paiement-card__amount-label { font-size:.85rem; color:#475569; margin-bottom:4px; }
  .paiement-card__amount { font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; color:#1a2744; }

  /* STEP 3 - RECAP */
  .recap-section { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:22px; }
  .recap-section__title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; margin-bottom:16px; }
  .recap-doc-card { background:#f8fafc; border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:14px; }
  .recap-doc-icon { width:42px; height:42px; border-radius:10px; background:#1a2744; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .recap-doc-title { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; }
  .recap-doc-sub   { font-size:.82rem; color:#94a3b8; margin-top:2px; }
  .recap-piece { background:#f0fdf4; border-radius:8px; padding:10px 14px; display:flex; align-items:center; gap:10px; font-size:.88rem; color:#16a34a; font-weight:500; margin-bottom:8px; }
  .recap-piece:last-child { margin-bottom:0; }
  .recap-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 32px; }
  .recap-field__label { font-size:.8rem; color:#94a3b8; margin-bottom:2px; }
  .recap-field__value { font-family:'Sora',sans-serif; font-weight:700; color:#1a2744; font-size:.9rem; }

  /* NAV BOUTONS */
  .step-nav {
    display:flex; justify-content:space-between; align-items:center; margin-top:8px;
  }
  .btn-back {
    display:inline-flex; align-items:center; gap:8px;
    padding:11px 22px; border:1.5px solid #e2e8f0; border-radius:10px;
    background:#fff; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500;
    color:#475569; cursor:pointer; transition:border-color .2s, color .2s;
    text-decoration:none;
  }
  .btn-back:hover { border-color:#1a2744; color:#1a2744; }
  .btn-next {
    display:inline-flex; align-items:center; gap:8px;
    padding:11px 26px; background:#1a2744; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s, opacity .2s;
  }
  .btn-next:disabled { opacity:.4; cursor:not-allowed; }
  .btn-next:not(:disabled):hover { background:#243057; }
  .btn-submit-green {
    display:inline-flex; align-items:center; gap:8px;
    padding:11px 26px; background:#16a34a; border:none; border-radius:10px;
    font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:#fff;
    cursor:pointer; transition:background .2s;
  }
  .btn-submit-green:hover { background:#15803d; }
`;

const DOCS = [
  { id:1, title:"Attestation d'inscription",        delai:"24-48h",    pieces:"CIP, Quittance" },
  { id:2, title:"Relevé de notes / Bulletin",        delai:"48-72h",    pieces:"CIP, Quittance" },
  { id:3, title:"Attestation de succès",             delai:"24-48h",    pieces:"CIP, Quittance" },
  { id:4, title:"Attestation d'admissibilité",       delai:"24-48h",    pieces:"CIP, Quittance" },
  { id:5, title:"Attestation de diplôme + Licence",  delai:"5-7 jours", pieces:"CIP, Quittance, Photo d'identité" },
  { id:6, title:"Attestation de diplôme + Master",   delai:"5-7 jours", pieces:"CIP, Quittance, Photo d'identité" },
  { id:7, title:"Autre / Demande personnalisée",     delai:"Variable",  pieces:"CIP, Quittance", full:true },
];

const DocIcon = ({ color="#475569" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function NouvelleDemande() {
  const [step, setStep]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [cipFile, setCipFile]   = useState("CIP_Koffi_AGUEH.pdf (1.2 Mo)");
  const [qttFile, setQttFile]   = useState("Quittance_2026.pdf (890 Ko)");

  const selectedDoc = DOCS.find(d => d.id === selected);

  return (
    <DashboardLayout>
      <style>{css}</style>

      <Stepper steps={["Choix du document", "Pièces justificatives", "Récapitulatif"]} current={step} />

      {/* ── ÉTAPE 1 ── */}
      {step === 0 && (
        <>
          <div>
            <h2 className="nd-title">Quel document souhaitez-vous obtenir ?</h2>
            <p className="nd-sub">Sélectionnez le type de document dont vous avez besoin</p>
          </div>
          <div className="doc-grid">
            {DOCS.map(d => (
              <div
                key={d.id}
                className={`doc-card${selected === d.id ? " selected" : ""}${d.full ? " " : ""}`}
                style={d.full ? { gridColumn:"1 / -1" } : {}}
                onClick={() => setSelected(d.id)}
              >
                <div className="doc-card__icon">
                  <DocIcon color={selected === d.id ? "#1a2744" : "#475569"} />
                </div>
                <div>
                  <div className="doc-card__title">{d.title}</div>
                  <div className="doc-card__meta">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Délai estimé: {d.delai}
                  </div>
                  <div className="doc-card__pieces">Pièces requises: {d.pieces}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="step-nav">
            <div />
            <button className="btn-next" disabled={!selected} onClick={() => setStep(1)}>
              Continuer <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ── ÉTAPE 2 ── */}
      {step === 1 && (
        <>
          <div>
            <h2 className="nd-title">Pièces justificatives</h2>
            <p className="nd-sub">Uploadez les documents requis pour votre demande</p>
          </div>
          <div className="step2-grid">
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* CIP */}
              <div className="upload-card">
                <div className="upload-card__header">
                  <span className="upload-card__title">Carte d'Identification Personnelle (CIP) *</span>
                  {cipFile && <CheckCircle />}
                </div>
                <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                <div className="upload-zone">
                  <UploadIcon />
                  <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                  <button className="btn-browse">Parcourir</button>
                </div>
                {cipFile && (
                  <div className="upload-file">
                    <DocIcon color="#16a34a" />
                    {cipFile}
                  </div>
                )}
              </div>

              {/* Quittance */}
              <div className="upload-card">
                <div className="upload-card__header">
                  <span className="upload-card__title">Quittance de paiement *</span>
                  {qttFile && <CheckCircle />}
                </div>
                <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                <div className="upload-zone">
                  <UploadIcon />
                  <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                  <button className="btn-browse">Parcourir</button>
                </div>
                {qttFile && (
                  <div className="upload-file">
                    <DocIcon color="#16a34a" />
                    {qttFile}
                  </div>
                )}
              </div>
            </div>

            {/* Info paiement */}
            <div className="paiement-card">
              <div className="paiement-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Informations de paiement
              </div>
              <div className="paiement-card__opts">Options de paiement:</div>
              <ul className="paiement-card__list">
                <li>Mobile Money (MTN, Moov)</li>
                <li>Guichet de votre institution</li>
              </ul>
              <div className="paiement-card__note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Effectuez votre paiement, puis uploadez la quittance ici pour valider votre demande
              </div>
              <div className="paiement-card__amount-label">Montant:</div>
              <div className="paiement-card__amount">2 000 FCFA</div>
            </div>
          </div>

          <div className="step-nav">
            <button className="btn-back" onClick={() => setStep(0)}>← Retour</button>
            <button className="btn-next" onClick={() => setStep(2)}>Continuer →</button>
          </div>
        </>
      )}

      {/* ── ÉTAPE 3 ── */}
      {step === 2 && (
        <>
          <div>
            <h2 className="nd-title">Récapitulatif de votre demande</h2>
            <p className="nd-sub">Vérifiez les informations avant de soumettre</p>
          </div>

          <div className="recap-section">
            <div className="recap-section__title">Document demandé</div>
            <div className="recap-doc-card">
              <div className="recap-doc-icon"><DocIcon color="white" /></div>
              <div>
                <div className="recap-doc-title">{selectedDoc?.title || "Attestation d'inscription"}</div>
                <div className="recap-doc-sub">Délai estimé: {selectedDoc?.delai || "24-48h"}</div>
              </div>
            </div>
          </div>

          <div className="recap-section">
            <div className="recap-section__title">Pièces justificatives</div>
            <div className="recap-piece"><CheckCircle /> <DocIcon color="#16a34a" /> Carte d'Identification Personnelle (CIP)</div>
            <div className="recap-piece"><CheckCircle /> <DocIcon color="#16a34a" /> Quittance de paiement</div>
          </div>

          <div className="recap-section">
            <div className="recap-section__title">Informations personnelles</div>
            <div className="recap-grid">
              <div className="recap-field">
                <div className="recap-field__label">Nom complet:</div>
                <div className="recap-field__value">Koffi AGUEH</div>
              </div>
              <div className="recap-field">
                <div className="recap-field__label">Numéro étudiant:</div>
                <div className="recap-field__value">20220001</div>
              </div>
              <div className="recap-field">
                <div className="recap-field__label">Institution:</div>
                <div className="recap-field__value">IFRI</div>
              </div>
              <div className="recap-field">
                <div className="recap-field__label">Filière:</div>
                <div className="recap-field__value">Génie Logiciel</div>
              </div>
            </div>
          </div>

          <div className="step-nav">
            <button className="btn-back" onClick={() => setStep(1)}>← Modifier</button>
            <button className="btn-submit-green" onClick={() => alert("Demande soumise !")}>
              <CheckCircle /> Soumettre ma demande
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
