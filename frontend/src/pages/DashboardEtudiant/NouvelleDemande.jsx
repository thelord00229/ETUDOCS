import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Stepper from "../../components/DashboardEtudiant/Stepper.jsx";
import { submitDemande } from "../../services/api";

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
    background:#fff; position:relative;
  }
  .coming-badge {
    position:absolute; top:14px; right:14px;
    background:#fee2e2; border:1px solid #fecaca; color:#b91c1c;
    font-size:.72rem; font-weight:800; padding:6px 10px; border-radius:999px; letter-spacing:.2px;
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
  .step2-grid { display:grid; grid-template-columns:1fr 360px; gap:20px; align-items:start; }
  .upload-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:22px; }
  .upload-card__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .upload-card__title { font-family:'Sora',sans-serif; font-weight:600; font-size:.95rem; color:#1a2744; }
  .upload-card__fmt   { font-size:.78rem; color:#94a3b8; margin-bottom:14px; }
  .upload-zone {
    border:2px dashed #e2e8f0; border-radius:10px; padding:28px 20px;
    display:flex; flex-direction:column; align-items:center; gap:8px;
    cursor:pointer; transition:border-color .2s, background .2s; margin-bottom:12px;
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

  /* PAIEMENT CARD */
  .paiement-card {
    background:#fff; border:1.5px solid #f5a623; border-radius:14px; padding:22px;
  }
  .paiement-card__title {
    font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744;
    display:flex; align-items:center; gap:8px; margin-bottom:6px;
  }
  .paiement-card__opts { font-size:.82rem; color:#94a3b8; margin-bottom:16px; }

  .paiement-account-box {
    background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;
    padding:12px 14px; margin-bottom:12px;
  }
  .paiement-account-label {
    font-size:.72rem; color:#94a3b8; font-weight:700;
    text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px;
  }
  .paiement-account-row {
    display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;
  }
  .paiement-account-num {
    font-family:'DM Mono',monospace; font-size:.88rem; font-weight:700;
    color:#1a2744; letter-spacing:.5px;
  }
  .paiement-copy-btn {
    background:#1a2744; color:#fff; border:none; border-radius:6px;
    font-size:.75rem; font-weight:700; padding:5px 12px; cursor:pointer;
    flex-shrink:0; transition:background .2s;
  }
  .paiement-copy-btn:hover { background:#243057; }
  .paiement-account-sub { font-size:.78rem; color:#64748b; }

  .paiement-online-link {
    display:flex; align-items:center; gap:7px;
    background:#eff6ff; border:1px solid #bfdbfe; border-radius:9px;
    padding:10px 14px; color:#1d4ed8; font-size:.85rem; font-weight:600;
    text-decoration:none; margin-bottom:12px; transition:background .2s;
  }
  .paiement-online-link:hover { background:#dbeafe; }

  .paiement-card__note {
    background:#fffbeb; border:1px solid #fde68a; border-radius:8px;
    padding:10px 12px; font-size:.8rem; color:#92400e;
    display:flex; gap:8px; margin-bottom:14px; line-height:1.5;
  }
  .paiement-card__amount-label { font-size:.82rem; color:#94a3b8; margin-bottom:4px; }
  .paiement-card__amount {
    font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; color:#1a2744;
  }

  /* STEP 3 - RECAP */
  .recap-section { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:22px; }
  .recap-section__title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:#1a2744; margin-bottom:16px; }
  .recap-doc-card { background:#f8fafc; border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:14px; }
  .recap-doc-icon { width:42px; height:42px; border-radius:10px; background:#1a2744; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .recap-doc-title { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:#1a2744; }
  .recap-doc-sub   { font-size:.82rem; color:#94a3b8; margin-top:2px; }
  .recap-piece { background:#f0fdf4; border-radius:8px; padding:10px 14px; display:flex; align-items:center; gap:10px; font-size:.88rem; color:#16a34a; font-weight:500; margin-bottom:8px; }
  .recap-piece:last-child { margin-bottom:0; }

  /* NAV BOUTONS */
  .step-nav { display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
  .btn-back {
    display:inline-flex; align-items:center; gap:8px;
    padding:11px 22px; border:1.5px solid #e2e8f0; border-radius:10px;
    background:#fff; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500;
    color:#475569; cursor:pointer; transition:border-color .2s, color .2s; text-decoration:none;
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
  { id:1, title:"Attestation d'inscription", delai:"24-48h", pieces:"Fiche de préinscription / Attestation d'inscription (année concernée), Acte de naissance, CIP, Quittance", enabled:true },
  { id:2, title:"Relevé de notes / Bulletin", delai:"48-72h", pieces:"Fiche de préinscription validée / Attestation d'inscription, Acte de naissance, CIP, Quittance", enabled:true },
  { id:3, title:"Attestation de succès", delai:"24-48h", pieces:"CIP, Quittance", enabled:false },
  { id:4, title:"Attestation d'admissibilité", delai:"24-48h", pieces:"CIP, Quittance", enabled:false },
  { id:5, title:"Attestation de diplôme + Licence", delai:"5-7 jours", pieces:"CIP, Quittance, Photo d'identité", enabled:false },
  { id:6, title:"Attestation de diplôme + Master", delai:"5-7 jours", pieces:"CIP, Quittance, Photo d'identité", enabled:false },
  { id:7, title:"Autre / Demande personnalisée", delai:"Variable", pieces:"CIP, Quittance", enabled:false, full:true },
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

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink:0, marginTop:1 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const RIB = "BJ6600100100000104477437";

export default function NouvelleDemande() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cipFile, setCipFile] = useState(null);
  const [qttFile, setQttFile] = useState(null);
  const [acteFile, setActeFile] = useState(null);
  const [justifFile, setJustifFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [anneeAcademique, setAnneeAcademique] = useState("");
  const navigate = useNavigate();

  const cipInputRef  = useRef(null);
  const qttInputRef  = useRef(null);
  const acteInputRef = useRef(null);
  const justifInputRef = useRef(null);

  const selectedDoc = DOCS.find(d => d.id === selected);
  const needFourPieces = selectedDoc?.id === 1 || selectedDoc?.id === 2;

  const PRIX_ATTESTATION    = 1000;
  const PRIX_RELEVE_PAR_SEM = 500;

  const [semestreChoix, setSemestreChoix] = useState([]);

  const isAttestation = selectedDoc?.id === 1;
  const isReleve      = selectedDoc?.id === 2;

  const montant = (() => {
    if (isAttestation) return PRIX_ATTESTATION;
    if (isReleve)      return semestreChoix.length * PRIX_RELEVE_PAR_SEM;
    return 0;
  })();

  const toggleSemestre = (s) =>
    setSemestreChoix(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const step1Ok = !!selected && (!isReleve || semestreChoix.length > 0) && (!isAttestation || !!anneeAcademique);
  const step2Ok = !!cipFile && !!qttFile && (!needFourPieces || (!!acteFile && !!justifFile));

  const handleCopy = () => {
    navigator.clipboard.writeText(RIB).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout>
      <style>{css}</style>

      <Stepper
        steps={["Choix du document", "Pièces justificatives", "Récapitulatif"]}
        current={step}
      />

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
                className={`doc-card${selected === d.id ? " selected" : ""}`}
                style={d.full ? { gridColumn: "1 / -1" } : {}}
                onClick={() => { if (!d.enabled) return; setSelected(d.id); setSemestreChoix([]); setAnneeAcademique(""); }}
              >
                {!d.enabled && <span className="coming-badge">Bientôt disponible</span>}
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

          {isReleve && (
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginTop:14 }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, color:"#1a2744", marginBottom:10 }}>
                Pour quel(s) semestre(s) ?
              </div>
              {["S1","S2","S3","S4","S5","S6"].map(s => (
                <label key={s} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8, color:"#475569", cursor:"pointer" }}>
                  <input type="checkbox" checked={semestreChoix.includes(s)} onChange={() => toggleSemestre(s)} />
                  {`Semestre ${s.replace("S","")}`}
                </label>
              ))}
            </div>
          )}

          {isAttestation && (
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginTop:14 }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, color:"#1a2744", marginBottom:10 }}>
                Pour quelle année académique ?
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {["2022-2023","2023-2024","2024-2025","2025-2026"].map(a => (
                  <label key={a} style={{
                    display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                    padding:"8px 14px", borderRadius:8, border:"1.5px solid",
                    borderColor: anneeAcademique === a ? "#1a2744" : "#e2e8f0",
                    background: anneeAcademique === a ? "#f0f4ff" : "#fff",
                    fontWeight: anneeAcademique === a ? 700 : 400,
                    color:"#1a2744", fontSize:".88rem", transition:"all .15s"
                  }}>
                    <input
                      type="radio" name="annee" value={a}
                      checked={anneeAcademique === a}
                      onChange={() => setAnneeAcademique(a)}
                      style={{ display:"none" }}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="step-nav">
            <div />
            <button className="btn-next" disabled={!step1Ok} onClick={() => setStep(1)} type="button">
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

              {needFourPieces && (
                <div className="upload-card">
                  <div className="upload-card__header">
                    <span className="upload-card__title">Fiche de préinscription / Attestation d'inscription *</span>
                    {justifFile && <CheckCircle />}
                  </div>
                  <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                  <div className="upload-zone" onClick={() => justifInputRef.current?.click()}>
                    <UploadIcon />
                    <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                    <button type="button" className="btn-browse" onClick={e => { e.stopPropagation(); justifInputRef.current?.click(); }}>Parcourir</button>
                    <input ref={justifInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={e => setJustifFile(e.target.files?.[0] || null)} />
                  </div>
                  {justifFile && <div className="upload-file"><DocIcon color="#16a34a" />{justifFile.name}</div>}
                </div>
              )}

              {needFourPieces && (
                <div className="upload-card">
                  <div className="upload-card__header">
                    <span className="upload-card__title">Acte de naissance *</span>
                    {acteFile && <CheckCircle />}
                  </div>
                  <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                  <div className="upload-zone" onClick={() => acteInputRef.current?.click()}>
                    <UploadIcon />
                    <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                    <button type="button" className="btn-browse" onClick={e => { e.stopPropagation(); acteInputRef.current?.click(); }}>Parcourir</button>
                    <input ref={acteInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={e => setActeFile(e.target.files?.[0] || null)} />
                  </div>
                  {acteFile && <div className="upload-file"><DocIcon color="#16a34a" />{acteFile.name}</div>}
                </div>
              )}

              <div className="upload-card">
                <div className="upload-card__header">
                  <span className="upload-card__title">Carte d'Identification Personnelle (CIP) *</span>
                  {cipFile && <CheckCircle />}
                </div>
                <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                <div className="upload-zone" onClick={() => cipInputRef.current?.click()}>
                  <UploadIcon />
                  <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                  <button type="button" className="btn-browse" onClick={e => { e.stopPropagation(); cipInputRef.current?.click(); }}>Parcourir</button>
                  <input ref={cipInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={e => setCipFile(e.target.files?.[0] || null)} />
                </div>
                {cipFile && <div className="upload-file"><DocIcon color="#16a34a" />{cipFile.name}</div>}
              </div>

              <div className="upload-card">
                <div className="upload-card__header">
                  <span className="upload-card__title">Quittance de paiement *</span>
                  {qttFile && <CheckCircle />}
                </div>
                <div className="upload-card__fmt">Format: JPG, PNG, PDF • Max: 5 Mo</div>
                <div className="upload-zone" onClick={() => qttInputRef.current?.click()}>
                  <UploadIcon />
                  <span className="upload-zone__text">Glissez-déposez votre fichier ici ou</span>
                  <button type="button" className="btn-browse" onClick={e => { e.stopPropagation(); qttInputRef.current?.click(); }}>Parcourir</button>
                  <input ref={qttInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }} onChange={e => setQttFile(e.target.files?.[0] || null)} />
                </div>
                {qttFile && <div className="upload-file"><DocIcon color="#16a34a" />{qttFile.name}</div>}
              </div>
            </div>

            {/* ── CARTE PAIEMENT ── */}
            <div className="paiement-card">
              <div className="paiement-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Informations de paiement
              </div>
              <div className="paiement-card__opts">Frais d'étude de dossier</div>

              <div className="paiement-account-box">
                <div className="paiement-account-label">Compte IFRI — Trésor Public</div>
                <div className="paiement-account-row">
                  <span className="paiement-account-num">{RIB}</span>
                  <button type="button" className="paiement-copy-btn" onClick={handleCopy}>
                    {copied ? "✓ Copié" : "Copier"}
                  </button>
                </div>
                <div className="paiement-account-sub">Intitulé : <b>IFRI</b></div>
              </div>

              <a
                href="https://equittancetresor.finances.bj:9051/paiement/"
                target="_blank"
                rel="noreferrer"
                className="paiement-online-link"
              >
                <ExternalLinkIcon />
                Payer via eQuittance Trésor
              </a>

              <div className="paiement-card__note">
                <InfoIcon />
                Sur le site, choisissez <b style={{ margin:"0 3px" }}>DÉPÔT SUR COMPTE DES CORRESPONDANTS (SERVICE ÉPARGNE)</b>, puis saisissez le numéro ci-dessus.
              </div>

              <div className="paiement-card__amount-label">Montant à payer</div>
              <div className="paiement-card__amount">
                {montant.toLocaleString("fr-FR")} <span style={{ fontSize:"1rem", fontWeight:600 }}>FCFA</span>
              </div>
            </div>
          </div>

          <div className="step-nav">
            <button className="btn-back" onClick={() => setStep(0)} type="button">← Retour</button>
            <button className="btn-next" disabled={!step2Ok} onClick={() => setStep(2)} type="button">Continuer →</button>
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
                {isAttestation && anneeAcademique && (
                  <div className="recap-doc-sub" style={{ marginTop:6 }}>
                    Année académique : <b>{anneeAcademique}</b>
                  </div>
                )}
                <div className="recap-doc-sub" style={{ marginTop:6 }}>
                  Frais : <b>{montant.toLocaleString("fr-FR")} FCFA</b>
                </div>
              </div>
            </div>
          </div>

          <div className="recap-section">
            <div className="recap-section__title">Pièces justificatives</div>
            {needFourPieces && (
              <>
                <div className="recap-piece"><CheckCircle /><DocIcon color="#16a34a" /> Fiche de préinscription / Attestation d'inscription</div>
                <div className="recap-piece"><CheckCircle /><DocIcon color="#16a34a" /> Acte de naissance</div>
              </>
            )}
            <div className="recap-piece"><CheckCircle /><DocIcon color="#16a34a" /> Carte d'Identification Personnelle (CIP)</div>
            <div className="recap-piece"><CheckCircle /><DocIcon color="#16a34a" /> Quittance de paiement</div>
          </div>

          <div className="step-nav">
            <button className="btn-back" onClick={() => setStep(1)} type="button">← Modifier</button>
            <button
              className="btn-submit-green"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  const payload = {
                    typeDocument: selectedDoc?.id === 1 ? "ATTESTATION_INSCRIPTION" : "RELEVE_NOTES",
                    semestres: selectedDoc?.id === 2 ? semestreChoix : [],
                    anneeAcademique: selectedDoc?.id === 1 ? anneeAcademique : null,
                    CIP: cipFile,
                    QUITTANCE: qttFile,
                    ACTE_NAISSANCE: acteFile,
                    JUSTIFICATIF_INSCRIPTION: justifFile,
                  };
                  await submitDemande(payload);
                  navigate("/dashboardEtu/demandes");
                } catch (e) {
                  alert(e?.message || "Erreur lors de la soumission");
                } finally {
                  setLoading(false);
                }
              }}
              type="button"
            >
              <CheckCircle /> {loading ? "Soumission..." : "Soumettre ma demande"}
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}