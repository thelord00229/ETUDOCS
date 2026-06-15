import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast";
import {
  getCachedMesReclamations,
  getMesReclamations,
} from "../../services/reclamation.service";

const css = `
.edt-page{display:flex;flex-direction:column;gap:18px}.edt-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.edt-title{font-family:Sora,sans-serif;font-size:1.5rem;font-weight:800;color:#1e293b}.edt-btn{border:0;border-radius:10px;background:#2e7d32;color:#fff;font-weight:800;padding:11px 16px;cursor:pointer}.edt-table-wrap{overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px}.edt-table{width:100%;border-collapse:collapse;min-width:840px}.edt-table th,.edt-table td{padding:14px 16px;text-align:left;border-bottom:1px solid #eef2f7;font-size:.9rem}.edt-table th{color:#64748b;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em}.badge{display:inline-flex;border-radius:999px;padding:5px 10px;font-size:.75rem;font-weight:800}.b-EN_ATTENTE{background:#ffedd5;color:#9a3412}.b-EN_COURS{background:#dbeafe;color:#1d4ed8}.b-RESOLUE_DOC_REGENERE{background:#dcfce7;color:#166534}.b-RESOLUE_SANS_DOC{background:#f1f5f9;color:#475569}.b-REJETEE{background:#fee2e2;color:#991b1b}.link-btn{border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;color:#1e293b;font-weight:700}

@media (max-width:600px){
  .edt-head{flex-direction:column;align-items:stretch}
  .edt-btn{width:100%}
  .edt-table-wrap{border:none;background:transparent;overflow:visible}
  .edt-table{min-width:0}
  .edt-table,.edt-table tbody,.edt-table tr,.edt-table td{display:block;width:100%}
  .edt-table thead{display:none}
  .edt-table tbody tr{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:6px 14px;margin-bottom:12px}
  .edt-table td{border:none;padding:9px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:right}
  .edt-table td+td{border-top:1px solid #eef2f7}
  .edt-table td::before{content:attr(data-label);font-weight:700;font-size:.72rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em;text-align:left;flex-shrink:0}
}
`;

const typeLabels = {
  ERREUR_IDENTITE: "Identite",
  ERREUR_NOTES: "Notes",
  ERREUR_SEMESTRE: "Semestre",
  ERREUR_NIVEAU: "Niveau/filiere",
  ERREUR_INSTITUTION: "Institution",
  DOCUMENT_ILLISIBLE: "Document illisible",
  AUTRE: "Autre",
};

export default function MesReclamations() {
  const cachedItems = useMemo(() => getCachedMesReclamations(), []);
  const [items, setItems] = useState(() =>
    Array.isArray(cachedItems) ? cachedItems : []
  );
  const [loading, setLoading] = useState(() => !Array.isArray(cachedItems));
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    let alive = true;
    setLoading(!Array.isArray(cachedItems));
    getMesReclamations({ force: Array.isArray(cachedItems) })
      .then((data) => alive && setItems(Array.isArray(data) ? data : []))
      .catch((err) => showToast(err?.response?.data?.message || "Chargement impossible", "error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [cachedItems, showToast]);

  return (
    <DashboardLayout>
      <style>{css}</style>
      <div className="edt-page">
        <div className="edt-head">
          <div>
            <h2 className="edt-title">Mes reclamations</h2>
            <p>Suivez les anomalies signalees sur vos documents.</p>
          </div>
          <button className="edt-btn" onClick={() => navigate("/dashboardEtu/nouvelle-reclamation")} type="button">
            Nouvelle reclamation
          </button>
        </div>
        <div className="edt-table-wrap">
          <table className="edt-table">
            <thead><tr><th>Document</th><th>Type d'anomalie</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="5">Chargement...</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan="5">Aucune reclamation.</td></tr>}
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Document"><strong>{item.document?.typeDocument}</strong><br />{item.document?.reference}</td>
                  <td data-label="Type">{typeLabels[item.type] || item.type}</td>
                  <td data-label="Date">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td data-label="Statut"><span className={`badge b-${item.statut}`}>{item.statut}</span></td>
                  <td data-label=""><button className="link-btn" type="button" onClick={() => showToast(item.description, "info")}>Voir detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </DashboardLayout>
  );
}
