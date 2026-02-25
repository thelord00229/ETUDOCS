import { useState } from "react";
import SALayout from "../components/SALayout.jsx";

const css = `
  .da-filter-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 24px; }
  .da-filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .da-field { display: flex; flex-direction: column; gap: 6px; }
  .da-field label { font-size: .85rem; font-weight: 500; color: #475569; font-family: 'DM Sans', sans-serif; }
  .da-select {
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: #334155;
    background: #f8fafc; outline: none; appearance: none; cursor: pointer;
    transition: border-color .2s;
  }
  .da-select:focus { border-color: #1a2744; background: #fff; }

  .da-tabs { display: flex; gap: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px; width: fit-content; }
  .da-tab {
    padding: 9px 26px; border-radius: 8px; border: none; background: none;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    color: #475569; cursor: pointer; transition: background .15s, color .15s;
  }
  .da-tab.active { background: #1a2744; color: #fff; }

  .da-import-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; display: flex; flex-direction: column; gap: 20px; }
  .da-import-title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744; }

  .btn-dl-model {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    color: #475569; cursor: pointer; transition: border-color .2s, color .2s; width: fit-content;
  }
  .btn-dl-model:hover { border-color: #1a2744; color: #1a2744; }

  .da-format-box {
    background: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 10px;
    padding: 18px 20px; font-size: .85rem; color: #334155; line-height: 2;
  }
  .da-format-box .da-fmt-title { font-weight: 700; color: #1a2744; margin-bottom: 4px; }
  .da-format-box strong { color: #1a2744; }

  .da-upload-zone {
    border: 2px dashed #e2e8f0; border-radius: 12px; padding: 44px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    cursor: pointer; transition: border-color .2s, background .2s;
  }
  .da-upload-zone:hover { border-color: #1a2744; background: #fafbff; }
  .da-upload-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: .95rem; color: #334155; }
  .da-upload-sub   { font-size: .82rem; color: #94a3b8; }
  .da-upload-hint  { font-size: .78rem; color: #94a3b8; }

  .btn-parcourir {
    padding: 11px 30px; background: #1a2744; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    cursor: pointer; transition: background .2s;
  }
  .btn-parcourir:hover { background: #243057; }

  .da-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
  .btn-annuler {
    padding: 10px 24px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
    color: #475569; cursor: pointer; transition: border-color .2s;
  }
  .btn-annuler:hover { border-color: #1a2744; }
  .btn-importer {
    padding: 10px 24px; background: #16a34a; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    cursor: pointer; opacity: .45; transition: opacity .2s, background .2s;
  }
  .btn-importer.ready { opacity: 1; }
  .btn-importer.ready:hover { background: #15803d; }

  .da-saisie-placeholder {
    text-align: center; padding: 48px 20px; color: #94a3b8; font-size: .9rem;
  }
`;

const FORMAT_FIELDS = [
    ["N° Étudiant", "Numéro d'identification"],
    ["Nom",         "Nom complet de l'étudiant"],
    ["Code UE",     "Code de l'unité d'enseignement"],
    ["Intitulé UE", "Nom complet de l'UE"],
    ["Crédits",     "Nombre de crédits"],
    ["Note",        "Note obtenue (0-20)"],
    ["Résultat",    '"Validé" ou "Ajourné"'],
];

export default function SAAcademique() {
    const [tab, setTab] = useState("excel");
    const [fileReady, setFileReady] = useState(false);

    return (
        <SALayout>
            <style>{css}</style>

            <div>
                <h2 className="sa-page-title">Gestion des données académiques</h2>
                <p className="sa-page-sub">Importez ou saisissez les notes et UE par institution</p>
            </div>

            {/* Filtres */}
            <div className="da-filter-card">
                <div className="da-filter-grid">
                    <div className="da-field">
                        <label>Institution</label>
                        <select className="da-select">
                            <option>IFRI</option>
                            <option>EPAC</option>
                            <option>FSS</option>
                        </select>
                    </div>
                    <div className="da-field">
                        <label>Année académique</label>
                        <select className="da-select">
                            <option>2025-2026</option>
                            <option>2024-2025</option>
                            <option>2023-2024</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className="da-tabs">
                <button className={`da-tab${tab === "excel"  ? " active" : ""}`} onClick={() => setTab("excel")}>Import Excel</button>
                <button className={`da-tab${tab === "manuel" ? " active" : ""}`} onClick={() => setTab("manuel")}>Saisie manuelle</button>
            </div>

            {/* Import Excel */}
            {tab === "excel" && (
                <div className="da-import-card">
                    <div className="da-import-title">Import via fichier Excel</div>

                    <button className="btn-dl-model">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Télécharger le modèle Excel
                    </button>

                    <div className="da-format-box">
                        <div className="da-fmt-title">Format attendu :</div>
                        {FORMAT_FIELDS.map(([k, v], i) => (
                            <div key={i}>• <strong>{k} :</strong> {v}</div>
                        ))}
                    </div>

                    <div className="da-upload-zone" onClick={() => setFileReady(true)}>
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16"/>
                            <line x1="12" y1="12" x2="12" y2="21"/>
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                        </svg>
                        <div className="da-upload-title">Glissez-déposez votre fichier Excel ici</div>
                        <div className="da-upload-sub">ou cliquez pour parcourir</div>
                        <button className="btn-parcourir" onClick={e => { e.stopPropagation(); setFileReady(true); }}>
                            Parcourir les fichiers
                        </button>
                        <div className="da-upload-hint">Format: .xlsx, .xls • Max: 10 Mo</div>
                    </div>

                    <div className="da-footer">
                        <button className="btn-annuler" onClick={() => setFileReady(false)}>Annuler</button>
                        <button className={`btn-importer${fileReady ? " ready" : ""}`}>Importer les données</button>
                    </div>
                </div>
            )}

            {/* Saisie manuelle */}
            {tab === "manuel" && (
                <div className="da-import-card">
                    <div className="da-import-title">Saisie manuelle des données</div>
                    <div className="da-saisie-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Fonctionnalité en cours de développement.
                    </div>
                </div>
            )}
        </SALayout>
    );
}