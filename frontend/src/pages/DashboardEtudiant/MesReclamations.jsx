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
                  <td><strong>{item.document?.typeDocument}</strong><br />{item.document?.reference}</td>
                  <td>{typeLabels[item.type] || item.type}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td><span className={`badge b-${item.statut}`}>{item.statut}</span></td>
                  <td><button className="link-btn" type="button" onClick={() => showToast(item.description, "info")}>Voir detail</button></td>
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
