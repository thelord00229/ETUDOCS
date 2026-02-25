import SALayout from "../components/SALayout.jsx";
import SAToggle from "../components/SAToggle.jsx";
import SAInstBadge from "../components/SAInstBadge.jsx";

const css = `
  .inst-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .inst-card {
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 24px;
    border-top: 4px solid #1a2744; display: flex; flex-direction: column; gap: 14px;
  }
  .inst-card__head  { display: flex; align-items: center; justify-content: space-between; }
  .inst-card__name  { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.05rem; color: #1a2744; margin-bottom: 3px; }
  .inst-card__desc  { font-size: .82rem; color: #94a3b8; line-height: 1.5; }
  .inst-card__stats { display: flex; gap: 24px; }
  .inst-stat-val    { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744; }
  .inst-stat-lbl    { font-size: .75rem; color: #94a3b8; margin-top: 1px; }
  .btn-params {
    width: 100%; padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: border-color .2s, color .2s;
  }
  .btn-params:hover { border-color: #1a2744; color: #1a2744; }
  .add-inst-card {
    border: 2px dashed #e2e8f0; border-radius: 16px; padding: 40px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    background: #fafbff; cursor: pointer; transition: border-color .2s, background .2s;
    grid-column: 1 / -1;
  }
  .add-inst-card:hover { border-color: #1a2744; background: #f0f4ff; }
  .add-inst-card__icon { width: 56px; height: 56px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
  .add-inst-card__title { font-family: 'Sora', sans-serif; font-weight: 700; color: #1a2744; font-size: 1rem; }
  .add-inst-card__sub   { font-size: .85rem; color: #94a3b8; }
  .btn-add-inst {
    padding: 11px 28px; background: #1a2744; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem; cursor: pointer;
    transition: background .2s;
  }
  .btn-add-inst:hover { background: #243057; }
  @media (max-width: 900px) { .inst-grid { grid-template-columns: 1fr; } }
`;

const INSTITUTIONS = [
    { code: "IFRI", nom: "IFRI", desc: "Institut de Formation et de Recherche en Informatique", agents: 5,  docs: 147 },
    { code: "EPAC", nom: "EPAC", desc: "École Polytechnique d'Abomey-Calavi",                   agents: 7,  docs: 203 },
    { code: "FSS",  nom: "FSS",  desc: "Faculté des Sciences de la Santé",                      agents: 4,  docs: 98  },
];

export default function SAInstitutions() {
    return (
        <SALayout>
            <style>{css}</style>

            <div>
                <h2 className="sa-page-title">Gestion des institutions</h2>
                <p className="sa-page-sub">Configurez et gérez les institutions partenaires</p>
            </div>

            <div className="inst-grid">
                {INSTITUTIONS.map(inst => (
                    <div className="inst-card" key={inst.code}>
                        <div className="inst-card__head">
                            <SAInstBadge code={inst.code} size="lg" />
                            <SAToggle defaultOn={true} label="Actif" />
                        </div>
                        <div>
                            <div className="inst-card__name">{inst.nom}</div>
                            <div className="inst-card__desc">{inst.desc}</div>
                        </div>
                        <div className="inst-card__stats">
                            <div>
                                <div className="inst-stat-val">{inst.agents}</div>
                                <div className="inst-stat-lbl">Agents</div>
                            </div>
                            <div>
                                <div className="inst-stat-val">{inst.docs}</div>
                                <div className="inst-stat-lbl">Documents</div>
                            </div>
                        </div>
                        <button className="btn-params">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                            </svg>
                            Paramètres
                        </button>
                    </div>
                ))}

                <div className="add-inst-card">
                    <div className="add-inst-card__icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                        </svg>
                    </div>
                    <div className="add-inst-card__title">Ajouter une institution</div>
                    <div className="add-inst-card__sub">Connectez une nouvelle institution à EtuDocs</div>
                    <button className="btn-add-inst">Ajouter une institution</button>
                </div>
            </div>
        </SALayout>
    );
}