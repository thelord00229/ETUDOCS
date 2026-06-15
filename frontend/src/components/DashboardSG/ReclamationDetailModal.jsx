const css = `
.modal{position:fixed;inset:0;background:rgba(15,23,42,.5);display:flex;align-items:center;justify-content:center;z-index:800}.card{background:#fff;border-radius:14px;width:min(760px,calc(100vw - 24px));max-height:90vh;overflow:auto;padding:20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.box{border:1px solid #e2e8f0;border-radius:12px;padding:12px}.badge{display:inline-flex;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:6px 10px;font-weight:800;font-size:.78rem}.gallery{display:flex;gap:8px;flex-wrap:wrap}.gallery img{width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0}.actions{display:flex;justify-content:flex-end;margin-top:14px}.btn{border:0;border-radius:10px;background:#2e7d32;color:#fff;font-weight:800;padding:10px 14px;cursor:pointer}
`;

export default function ReclamationDetailModal({ reclamation, onClose }) {
  if (!reclamation) return null;
  return (
    <div className="modal">
      <style>{css}</style>
      <div className="card">
        <h3>Detail de la reclamation</h3>
        <div className="grid">
          <div className="box">
            <strong>Etudiant</strong>
            <p>{reclamation.etudiant?.prenom} {reclamation.etudiant?.nom}</p>
            <p>{reclamation.etudiant?.email}</p>
            <p>{reclamation.etudiant?.niveau || ""}</p>
          </div>
          <div className="box">
            <strong>Document</strong>
            <p>{reclamation.document?.typeDocument}</p>
            <p>{reclamation.document?.reference}</p>
          </div>
        </div>
        <p><span className="badge">{reclamation.type}</span></p>
        <div className="box"><strong>Description</strong><p>{reclamation.description}</p></div>
        <div className="box">
          <strong>Pieces jointes</strong>
          <div className="gallery">
            {(reclamation.piecesJointes || []).map((src) => (
              <a href={`http://localhost:5000/${src}`} target="_blank" rel="noreferrer" key={src}>
                <img src={`http://localhost:5000/${src}`} alt="Piece jointe" />
              </a>
            ))}
          </div>
        </div>
        <div className="box">
          <strong>Historique</strong>
          <p>Creation : {new Date(reclamation.createdAt).toLocaleString("fr-FR")}</p>
          {reclamation.traitePar && <p>Prise en charge : {reclamation.traitePar.prenom} {reclamation.traitePar.nom}</p>}
          {reclamation.resolvedAt && <p>Resolution : {new Date(reclamation.resolvedAt).toLocaleString("fr-FR")}</p>}
          {reclamation.reponseAgent && <p>Reponse : {reclamation.reponseAgent}</p>}
          {reclamation.documentCorrige && <p>Nouveau document : {reclamation.documentCorrige.reference}</p>}
        </div>
        <div className="actions"><button className="btn" onClick={onClose} type="button">Fermer</button></div>
      </div>
    </div>
  );
}
