import { useCallback, useEffect, useMemo, useState } from "react";
import ReclamationDetailModal from "../../components/DashboardSG/ReclamationDetailModal.jsx";
import { getAllReclamations, prendreEnCharge, resoudreReclamation } from "../../services/reclamation.service";

const css = `
.agent-page{min-height:100vh;background:#f8fafc;padding:28px;font-family:'DM Sans',sans-serif}.head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.title{font-family:Sora,sans-serif;font-size:1.6rem;font-weight:800;color:#1e293b}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px}.card strong{font-size:1.4rem}.filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}.filters input,.filters select{border:1px solid #e2e8f0;border-radius:10px;padding:10px}.wrap{overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px}.table{width:100%;border-collapse:collapse;min-width:1050px}.table th,.table td{padding:13px 14px;border-bottom:1px solid #eef2f7;text-align:left;font-size:.88rem}.badge{display:inline-flex;border-radius:999px;padding:5px 9px;font-size:.72rem;font-weight:800;background:#e2e8f0;color:#334155}.btn{border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;font-weight:800;margin-right:6px}.green{background:#16a34a;color:#fff;border:0}.blue{background:#2563eb;color:#fff;border:0}.modal{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:600}.modal-card{background:#fff;border-radius:14px;padding:18px;width:min(680px,calc(100vw - 24px));display:flex;flex-direction:column;gap:12px}.tabs{display:flex;gap:8px}.tab{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:8px 12px;cursor:pointer}.tab.active{background:#2e7d32;color:#fff}.textarea{width:100%;min-height:130px;border:1px solid #e2e8f0;border-radius:10px;padding:10px}
`;

const STATUTS = ["", "EN_ATTENTE", "EN_COURS", "RESOLUE_DOC_REGENERE", "RESOLUE_SANS_DOC", "REJETEE"];
const TYPES = ["", "ERREUR_IDENTITE", "ERREUR_NOTES", "ERREUR_SEMESTRE", "ERREUR_NIVEAU", "ERREUR_INSTITUTION", "DOCUMENT_ILLISIBLE", "AUTRE"];

export default function GestionReclamations() {
  const [items, setItems] = useState([]);
  const [statut, setStatut] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [resolveItem, setResolveItem] = useState(null);
  const [mode, setMode] = useState("REGENERER_DOC");
  const [reponseAgent, setReponseAgent] = useState("");

  const load = useCallback(() => {
    return getAllReclamations({ statut, type, search }).then(setItems);
  }, [statut, type, search]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => items.reduce((acc, item) => {
    acc[item.statut] = (acc[item.statut] || 0) + 1;
    return acc;
  }, {}), [items]);

  const handlePrendreEnCharge = async (id) => {
    if (!window.confirm("Prendre en charge cette reclamation ?")) return;
    await prendreEnCharge(id);
    load();
  };

  const handleResoudre = async () => {
    await resoudreReclamation(resolveItem.id, { action: mode, reponseAgent });
    setResolveItem(null);
    setReponseAgent("");
    load();
  };

  return (
    <div className="agent-page">
      <style>{css}</style>
      <div className="head"><div><h1 className="title">Gestion des reclamations</h1><p>Traitement des anomalies signalees par les etudiants.</p></div></div>
      <div className="cards">
        {STATUTS.filter(Boolean).map((s) => <div className="card" key={s}><span>{s}</span><br /><strong>{counts[s] || 0}</strong></div>)}
      </div>
      <div className="filters">
        <select value={statut} onChange={(e) => setStatut(e.target.value)}>{STATUTS.map((s) => <option key={s} value={s}>{s || "Tous les statuts"}</option>)}</select>
        <select value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((s) => <option key={s} value={s}>{s || "Tous les types"}</option>)}</select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} onBlur={load} placeholder="Recherche etudiant" />
        <button className="btn" onClick={load} type="button">Rechercher</button>
      </div>
      <div className="wrap">
        <table className="table">
          <thead><tr><th>ID</th><th>Etudiant</th><th>Document</th><th>Type</th><th>Date</th><th>Statut</th><th>Assigne a</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id.slice(0, 8)}</td>
                <td>{item.etudiant?.prenom} {item.etudiant?.nom}<br />{item.etudiant?.email}</td>
                <td>{item.document?.typeDocument}<br />{item.document?.reference}</td>
                <td><span className="badge">{item.type}</span></td>
                <td>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                <td><span className="badge">{item.statut}</span></td>
                <td>{item.traitePar ? `${item.traitePar.prenom} ${item.traitePar.nom}` : "Non assigne"}</td>
                <td>
                  <button className="btn" onClick={() => setDetail(item)} type="button">Voir</button>
                  {item.statut === "EN_ATTENTE" && <button className="btn green" onClick={() => handlePrendreEnCharge(item.id)} type="button">Prendre</button>}
                  {item.statut === "EN_COURS" && <button className="btn blue" onClick={() => setResolveItem(item)} type="button">Resoudre</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReclamationDetailModal reclamation={detail} onClose={() => setDetail(null)} />
      {resolveItem && (
        <div className="modal">
          <div className="modal-card">
            <h3>Resolution - {resolveItem.document?.reference}</h3>
            <div className="tabs">
              <button className={`tab${mode === "REGENERER_DOC" ? " active" : ""}`} onClick={() => setMode("REGENERER_DOC")} type="button">Regenerer document</button>
              <button className={`tab${mode === "EXPLIQUER" ? " active" : ""}`} onClick={() => setMode("EXPLIQUER")} type="button">Expliquer sans doc</button>
            </div>
            <textarea className="textarea" value={reponseAgent} onChange={(e) => setReponseAgent(e.target.value)} placeholder={mode === "REGENERER_DOC" ? "Corrections appliquees..." : "Reponse a l'etudiant..."} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setResolveItem(null)} type="button">Annuler</button>
              <button className="btn green" onClick={handleResoudre} type="button">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
