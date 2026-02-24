import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardEtudiant/DashboardLayout.jsx";
import { getDemandes, downloadDocument } from "../../services/api";

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
  .btn-dl:disabled { opacity:.7; cursor:not-allowed; }

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

  .state-box { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px 20px; color:#475569; }
  .state-error { color:#dc2626; }

  @media (max-width: 1000px) { .docs-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width: 640px)  { .docs-grid { grid-template-columns:1fr; } }
`;

const labelType = (typeDocument) => {
  if (typeDocument === "RELEVE_NOTES") return "Relevé de notes";
  if (typeDocument === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return typeDocument || "Document";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const safeTime = (iso) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

export default function MesDocuments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandes, setDemandes] = useState([]);
  const [downloadingRef, setDownloadingRef] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getDemandes();
        setDemandes(Array.isArray(list) ? list : []);
      } catch {
        setError("Échec du chargement des documents.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🔥 Gestion multi-documents
  // ✅ 2 cartes si 2 documents (S1 + S2)
  const docs = useMemo(() => {
    return demandes
      .filter(
        (d) =>
          d?.statut === "DISPONIBLE" &&
          Array.isArray(d?.documents) &&
          d.documents.length > 0
      )
      .flatMap((d) => {
        const list = Array.isArray(d?.documents) ? d.documents : [];

        // On produit 1 carte par document
        return list
          .filter((doc) => doc?.reference)
          .map((doc) => {
            const iso = doc.createdAt || d.updatedAt || d.createdAt || null;
            const ts = safeTime(iso);

            // petit + chic : si la ref contient "-S1-" / "-S2-" on l'affiche
            const sem =
              typeof doc.reference === "string" && doc.reference.includes("-S1-")
                ? " • Semestre 1"
                : typeof doc.reference === "string" && doc.reference.includes("-S2-")
                ? " • Semestre 2"
                : "";

            return {
              id: `${d.id}-${doc.reference}`,
              title: `${labelType(d.typeDocument)}${sem}`,
              date: formatDate(iso),
              ts,
              ref: doc.reference,
            };
          });
      })
      .sort((a, b) => b.ts - a.ts);
  }, [demandes]);

  const handleDownload = async (reference) => {
    if (!reference) return;
    try {
      setDownloadingRef(reference);
      await downloadDocument(reference);
    } catch (e) {
      alert(e?.message || "Téléchargement impossible");
    } finally {
      setDownloadingRef(null);
    }
  };

  return (
    <DashboardLayout>
      <style>{css}</style>

      <div>
        <h2 className="docs-title">Mes documents</h2>
        <p className="docs-sub">Téléchargez et vérifiez vos documents certifiés</p>
      </div>

      {loading && <div className="state-box">Chargement des documents…</div>}
      {!loading && error && <div className="state-box state-error">{error}</div>}

      {!loading && !error && (
        <>
          {docs.length === 0 ? (
            <div className="state-box">
              Aucun document disponible pour le moment.
              <br />
              (Les documents apparaissent ici dès qu’une demande passe au statut{" "}
              <b>DISPONIBLE</b>.)
            </div>
          ) : (
            <div className="docs-grid">
              {docs.map((d) => (
                <div className="doc-file-card" key={d.id}>
                  <div className="doc-file-title">{d.title}</div>

                  <div className="doc-file-meta">{d.date}</div>
                  <div className="doc-file-meta">{d.ref}</div>

                  <div className="doc-file-actions">
                    <button
                      className="btn-dl"
                      disabled={downloadingRef === d.ref}
                      onClick={() => handleDownload(d.ref)}
                      type="button"
                    >
                      {downloadingRef === d.ref ? "Téléchargement..." : "Télécharger"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="qr-banner">
            <div className="qr-banner__icon"></div>
            <div>
              <div className="qr-banner__title">Documents certifiés avec QR code</div>
              <div className="qr-banner__text">
                Chaque document téléchargé contient un QR code unique permettant
                de vérifier son authenticité.
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
