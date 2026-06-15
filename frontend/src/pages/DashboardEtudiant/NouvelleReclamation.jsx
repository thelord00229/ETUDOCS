import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { fetchCachedQuery, getCachedQuery } from "../../services/queryCache";
import { createReclamation } from "../../services/reclamation.service";

const css = `
.nr-page{display:flex;flex-direction:column;gap:18px}.nr-title{font-family:Sora,sans-serif;font-size:1.5rem;font-weight:800;color:#1e293b}.nr-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px}.nr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.nr-card{border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;cursor:pointer;background:#fff}.nr-card.active{border-color:#2e7d32;background:#f0fdf4}.nr-field{display:flex;flex-direction:column;gap:8px}.nr-field select,.nr-field textarea,.nr-field input{border:1.5px solid #e2e8f0;border-radius:10px;padding:11px 12px;font:inherit}.nr-actions{display:flex;justify-content:space-between;gap:12px}.nr-btn{border:0;border-radius:10px;background:#2e7d32;color:#fff;font-weight:800;padding:11px 16px;cursor:pointer}.nr-btn.secondary{background:#fff;color:#475569;border:1px solid #e2e8f0}.nr-btn:disabled{opacity:.45;cursor:not-allowed}

@media (max-width:600px){
  .nr-panel{padding:16px}
  .nr-actions{gap:10px}
  .nr-actions .nr-btn{flex:1;text-align:center}
}
`;

const TYPES = [
  ["ERREUR_IDENTITE", "Identite", "Nom, prenom, date de naissance"],
  ["ERREUR_NOTES", "Notes", "Notes ou moyennes incorrectes"],
  ["ERREUR_SEMESTRE", "Semestre", "Mauvais semestre"],
  ["ERREUR_NIVEAU", "Niveau", "Niveau ou filiere incorrect"],
  ["ERREUR_INSTITUTION", "Institution", "Logo, tampon ou signature"],
  ["DOCUMENT_ILLISIBLE", "Illisible", "PDF corrompu ou flou"],
  ["AUTRE", "Autre", "Autre anomalie"],
];

const DOCUMENTS_CACHE_KEY = "student:documents";

export default function NouvelleReclamation() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const cachedDocuments = useMemo(() => getCachedQuery(DOCUMENTS_CACHE_KEY), []);
  const [documents, setDocuments] = useState(() =>
    Array.isArray(cachedDocuments)
      ? cachedDocuments.filter((doc) => doc.statut === "DISPONIBLE")
      : []
  );
  const [documentId, setDocumentId] = useState(params.get("documentId") || "");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchCachedQuery(
      DOCUMENTS_CACHE_KEY,
      () => api.get("/api/documents").then((res) => res.data || []),
      { ttl: 45000, force: Array.isArray(cachedDocuments) }
    )
      .then((data) => setDocuments((data || []).filter((doc) => doc.statut === "DISPONIBLE")))
      .catch(() => showToast("Impossible de charger vos documents", "error"));
  }, [cachedDocuments, showToast]);

  const canNext = useMemo(() => {
    if (step === 0) return !!documentId;
    if (step === 1) return !!type;
    if (step === 2) return description.trim().length >= 20;
    return true;
  }, [step, documentId, type, description]);

  const submit = async () => {
    try {
      setLoading(true);
      const form = new FormData();
      form.append("documentId", documentId);
      form.append("type", type);
      form.append("description", description);
      files.slice(0, 3).forEach((file) => form.append("piecesJointes", file));
      await createReclamation(form);
      showToast("Reclamation soumise", "success");
      setTimeout(() => navigate("/dashboardEtu/reclamations"), 500);
    } catch (err) {
      showToast(err?.response?.data?.message || "Soumission impossible", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <style>{css}</style>
      <div className="nr-page">
        <div><h2 className="nr-title">Nouvelle reclamation</h2><p>Signalez une anomalie sur un document disponible.</p></div>
        <div className="nr-panel">
          {step === 0 && (
            <div className="nr-field">
              <label>Document concerne</label>
              <select value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                <option value="">Selectionner un document</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.typeDocument} - {doc.reference}</option>
                ))}
              </select>
            </div>
          )}
          {step === 1 && (
            <div className="nr-grid">
              {TYPES.map(([value, title, sub]) => (
                <button key={value} className={`nr-card${type === value ? " active" : ""}`} onClick={() => setType(value)} type="button">
                  <strong>{title}</strong><br /><span>{sub}</span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="nr-field">
              <label>Description detaillee</label>
              <textarea rows="8" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Expliquez l'anomalie en detail..." />
              <small>Minimum 20 caracteres.</small>
            </div>
          )}
          {step === 3 && (
            <div className="nr-field">
              <label>Captures d'ecran ou preuves (max 3 images)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 3))} />
              <small>{files.length} fichier(s) selectionne(s)</small>
            </div>
          )}
        </div>
        <div className="nr-actions">
          <button className="nr-btn secondary" disabled={step === 0 || loading} onClick={() => setStep((s) => s - 1)} type="button">Retour</button>
          {step < 3 ? (
            <button className="nr-btn" disabled={!canNext} onClick={() => setStep((s) => s + 1)} type="button">Continuer</button>
          ) : (
            <button className="nr-btn" disabled={loading} onClick={submit} type="button">{loading ? "Soumission..." : "Soumettre"}</button>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </DashboardLayout>
  );
}
