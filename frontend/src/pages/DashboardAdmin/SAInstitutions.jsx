import { useState, useEffect, useMemo } from "react";
import SALayout from "../../components/DashboardAdmin/SALayout.jsx";
import SAToggle from "../../components/DashboardAdmin/SAToggle.jsx";
import SAInstBadge from "../../components/DashboardAdmin/SAInstBadge.jsx";
import { getInstitutions } from "../../services/admin.service"; // à créer si besoin

const css = `
  .inst-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .inst-card {
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 24px;
    border-top: 4px solid #1a2744; display: flex; flex-direction: column; gap: 14px;
    min-width: 0;
  }
  .inst-card__head  { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .inst-card__name  { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.05rem; color: #1a2744; margin-bottom: 3px; }
  .inst-card__desc  { font-size: .82rem; color: #94a3b8; line-height: 1.5; }
  .inst-card__stats { display: flex; gap: 24px; flex-wrap: wrap; }
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
    min-width: 0;
  }
  /* .add-inst-card:hover { border-color: #1a2744; background: #f0f4ff; }
  .add-inst-card__icon { width: 56px; height: 56px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
  .add-inst-card__title { font-family: 'Sora', sans-serif; font-weight: 700; color: #1a2744; font-size: 1rem; text-align:center; }
  .add-inst-card__sub   { font-size: .85rem; color: #94a3b8; text-align:center; } */
  .btn-add-inst {
    padding: 11px 28px; background: #1a2744; color: #fff; border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem; cursor: pointer;
    transition: background .2s;
  }
  .btn-add-inst:hover { background: #243057; }
  .sa-empty {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:16px; padding:18px;
    color:#64748b; font-size:.9rem;
  }
  @media (max-width: 900px) { .inst-grid { grid-template-columns: 1fr; } }
`;

// ✅ Seed MVP (toujours 3 institutions)
const INSTITUTIONS_SEED = [
  {
    code: "IFRI",
    nom: "Institut de Formation et de Recherche en Informatique",
    sigle: "IFRI",
    description: "Institut de Formation et de Recherche en Informatique",
  },
  {
    code: "EPAC",
    nom: "École Polytechnique d'Abomey-Calavi",
    sigle: "EPAC",
    description: "École Polytechnique d'Abomey-Calavi",
  },
  {
    code: "FSS",
    nom: "Faculté des Sciences de la Santé",
    sigle: "FSS",
    description: "Faculté des Sciences de la Santé",
  },
];

function normalizeCode(v) {
  return String(v || "").trim().toUpperCase();
}

function mergeInstitutions(apiList) {
  const list = Array.isArray(apiList) ? apiList : [];

  // map by sigle/code
  const byCode = new Map();
  list.forEach((i) => {
    const code = normalizeCode(i.sigle || i.code || i.nom);
    if (!code) return;
    byCode.set(code, i);
  });

  // ensure seed exists
  const merged = INSTITUTIONS_SEED.map((seed) => {
    const existing = byCode.get(seed.code);
    if (existing) {
      return {
        ...seed,
        ...existing,
        code: normalizeCode(existing.sigle || existing.code || seed.code) || seed.code,
        sigle: normalizeCode(existing.sigle || seed.sigle),
      };
    }
    // fallback for missing from API
    return {
      ...seed,
      id: seed.code, // stable key if API has no id yet
      _isSeed: true,
      _count: { utilisateurs: 0, demandes: 0 },
    };
  });

  // add any extra institutions from API (future-proof)
  list.forEach((i) => {
    const code = normalizeCode(i.sigle || i.code || i.nom);
    const alreadyInSeed = merged.some((m) => normalizeCode(m.sigle || m.code) === code);
    if (!alreadyInSeed) merged.push(i);
  });

  return merged;
}

export default function SAInstitutions() {
  const [institutionsApi, setInstitutionsApi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await getInstitutions();
        // Supporte res.data ou res (selon ton admin.service)
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setInstitutionsApi(data);
      } catch (err) {
        console.error("[SAInstitutions] getInstitutions error:", err);
        setInstitutionsApi([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const institutions = useMemo(
    () => mergeInstitutions(institutionsApi),
    [institutionsApi]
  );

  return (
    <SALayout>
      <style>{css}</style>

      <div>
        <h2 className="sa-page-title">Gestion des institutions</h2>
        <p className="sa-page-sub">Configurez et gérez les institutions partenaires</p>
      </div>

      {loading ? (
        <div className="sa-empty">Chargement...</div>
      ) : institutions.length === 0 ? (
        <div className="sa-empty">
          Aucune institution trouvée. Vérifie l’API <code>/api/admin/institutions</code>.
        </div>
      ) : (
        <div className="inst-grid">
          {institutions.map((inst) => {
            const code = normalizeCode(inst.sigle || inst.code || inst.nom);

            return (
              <div className="inst-card" key={inst.id || code}>
                <div className="inst-card__head">
                  <SAInstBadge code={code || "??"} size="lg" />
                  <SAToggle defaultOn={true} label="Actif" />
                </div>

                <div>
                  <div className="inst-card__name">{inst.nom || code}</div>
                  <div className="inst-card__desc">
                    {inst.description || "Aucune description"}
                  </div>
                </div>

                <div className="inst-card__stats">
                  <div>
                    <div className="inst-stat-val">{inst._count?.utilisateurs || 0}</div>
                    <div className="inst-stat-lbl">Utilisateurs</div>
                  </div>
                  <div>
                    <div className="inst-stat-val">{inst._count?.demandes || 0}</div>
                    <div className="inst-stat-lbl">Demandes</div>
                  </div>
                </div>

                <button className="btn-params" type="button">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                  </svg>
                  Paramètres
                </button>
              </div>
            );
          })}

          {/* <div className="add-inst-card">
            <div className="add-inst-card__icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div className="add-inst-card__title">Ajouter une institution</div>
            <div className="add-inst-card__sub">
              Connectez une nouvelle institution à EtuDocs
            </div>
            <button className="btn-add-inst" type="button">
              Ajouter une institution
            </button>
          </div> */}
        </div>
      )}
    </SALayout>
  );
}