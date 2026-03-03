import { useEffect, useMemo, useState } from "react";
import SALayout from "../../components/DashboardAdmin/SALayout.jsx";
import api from "../../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

const css = `
  .sa-ana-topbar {
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    margin-bottom: 16px;
  }
  .sa-ana-title h2 {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .sa-ana-title p {
    margin: 6px 0 0 0;
    color: #64748b;
    font-size: .92rem;
  }

  .sa-ana-filters {
    display:flex; align-items:center; gap:10px; flex-wrap: wrap;
  }
  .sa-ana-select {
    display:flex; align-items:center; gap:10px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px 12px;
    color: #0f172a;
    font-size: .9rem;
    min-width: 170px;
    box-shadow: 0 1px 0 rgba(15,23,42,.03);
  }
  .sa-ana-select label {
    color: #64748b;
    font-size: .85rem;
    white-space: nowrap;
  }
  .sa-ana-select select {
    border: none; outline: none;
    width: 100%;
    font-size: .9rem;
    color: #0f172a;
    background: transparent;
  }

  .sa-ana-status {
    display:flex; align-items:center; gap:12px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
    padding: 10px 12px;
    border-radius: 12px;
    margin: 10px 0 18px 0;
  }
  .sa-ana-status strong { font-family: 'Sora', sans-serif; }
  .sa-ana-status .pill {
    margin-left: auto;
    display:flex; gap:8px; flex-wrap: wrap; justify-content:flex-end;
    color: #7c2d12;
    font-size: .85rem;
  }
  .sa-ana-status .pill span {
    background: rgba(124,45,18,.06);
    border: 1px solid rgba(124,45,18,.12);
    padding: 6px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .sa-ana-kpis {
    display:grid;
    grid-template-columns: 1fr 1.35fr 1fr 1fr;
    gap: 14px;
    margin-bottom: 16px;
  }
  .sa-ana-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 1px 0 rgba(15,23,42,.03);
    height: 100%;
  }
  .sa-ana-kpi-top {
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    margin-bottom: 10px;
  }
  .sa-ana-kpi-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display:flex; align-items:center; justify-content:center;
    background: #eff6ff;
  }
  .sa-ana-kpi-trend {
    font-size: .85rem;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    background: #fff;
    white-space: nowrap;
  }
  .trend-up { color: #15803d; border-color: rgba(21,128,61,.18); background: rgba(21,128,61,.06); }
  .trend-down { color: #b91c1c; border-color: rgba(185,28,28,.18); background: rgba(185,28,28,.06); }

  .sa-ana-kpi-value {
    font-family: 'Sora', sans-serif;
    font-weight: 900;
    font-size: 2rem;
    color: #0f172a;
    line-height: 1.05;
  }
  .sa-ana-kpi-label {
    color: #475569;
    font-size: .92rem;
    margin-top: 6px;
  }
  .sa-ana-kpi-sub {
    color: #94a3b8;
    font-size: .82rem;
    margin-top: 6px;
  }

  /* SLA dominant */
  .sa-ana-sla {
    border-color: #fde68a;
    background: linear-gradient(0deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.05)), #fff;
  }
  .sa-ana-sla .badge {
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(245,158,11,.25);
    background: rgba(245,158,11,.08);
    color: #92400e;
    font-size: .82rem;
    font-weight: 700;
  }
  .sa-ana-sla .sa-ana-kpi-value { font-size: 2.1rem; }
  .sa-ana-progress {
    margin-top: 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    height: 10px;
    overflow: hidden;
  }
  .sa-ana-progress > div {
    height: 100%;
    width: var(--w, 0%);
    background: #f59e0b;
  }
  .sa-ana-sla-foot {
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    margin-top: 10px;
    font-size: .82rem;
    color: #64748b;
  }

  /* layout main */
  .sa-ana-main {
    display:grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
    align-items: stretch;
    margin-bottom: 16px;
  }

  .sa-ana-section-title {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
  }
  .sa-ana-section-sub {
    margin: 0 0 14px 0;
    color: #64748b;
    font-size: .88rem;
  }

  .radar-card{
    display:flex;
    flex-direction:column;
    height:100%;
  }

  /* Heatmap table */
  .hm {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;
    flex:1;
  }
  .hm th {
    text-align: left;
    padding: 10px 12px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: .78rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .hm td {
    padding: 8px 12px;
    vertical-align: middle;
  }
  .hm .inst {
    display:flex; align-items:center; gap:10px;
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    color: #0f172a;
  }

  /* ✅ logo */
  .hm-logo {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex: 0 0 auto;
  }
  .hm-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display:block;
  }
  .hm-fallback {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: .8rem;
    flex: 0 0 auto;
  }

  .hm-cell {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 7px 10px;
    min-width: 80px;
    position: relative;
  }
  .hm-cell .v {
    font-family: 'Sora', sans-serif;
    font-weight: 900;
    color: #0f172a;
    display:flex; align-items:baseline; gap:6px;
    font-size: .95rem;
  }
  .hm-cell .p {
    margin-top: 4px;
    font-size: .75rem;
    color: #64748b;
  }
  .hm-eff { background: rgba(22,163,74,.08); border-color: rgba(22,163,74,.18); }
  .hm-mod { background: rgba(245,158,11,.10); border-color: rgba(245,158,11,.22); }
  .hm-risk { background: rgba(239,68,68,.10); border-color: rgba(239,68,68,.20); }

  .hm-legend {
    display:flex; align-items:center; gap:14px; flex-wrap: wrap;
    margin-top: 10px;
    color: #64748b;
    font-size: .82rem;
  }
  .hm-legend span { display:flex; align-items:center; gap:8px; }
  .dot { width: 10px; height: 10px; border-radius: 3px; display:inline-block; }
  .dot-eff { background: rgba(22,163,74,.35); border: 1px solid rgba(22,163,74,.35); }
  .dot-mod { background: rgba(245,158,11,.35); border: 1px solid rgba(245,158,11,.35); }
  .dot-risk { background: rgba(239,68,68,.35); border: 1px solid rgba(239,68,68,.35); }

  /* Right panel */
  .insights {
    display:flex; flex-direction: column; gap: 12px;
  }
  .ins-title {
    font-family: 'Sora', sans-serif;
    font-weight: 900;
    color: #0f172a;
    margin: 0 0 8px 0;
    display:flex; align-items:center; gap:10px;
  }
  .ins-card {
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 10px 12px;
  }
  .ins-card h4 {
    margin: 0 0 6px 0; 
    font-family: 'Sora', sans-serif;
    font-weight: 900;
    font-size: .92rem;
    color: #0f172a;
  }
  .ins-card p { margin: 0; color: #475569; font-size: .84rem; line-height: 1.35; }
  .ins-card .meta {
    margin-top: 8px;
    padding: 8px 10px; 
    border-radius: 12px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(15,23,42,.03);
    font-size: .84rem;
    color: #0f172a;
  }
  .sev-danger { border-left: 4px solid #ef4444; }
  .sev-warn { border-left: 4px solid #f59e0b; }
  .sev-ok { border-left: 4px solid #16a34a; }
  .sev-info { border-left: 4px solid #3b82f6; }

  .quick {
    margin-top: 8px;
    display:flex; flex-direction: column; gap: 8px;
  }
  .btn {
    display:flex; align-items:center; justify-content:center; gap:10px;
    padding: 8px 10px; 
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #0f172a;
    font-weight: 800;
    font-size: .86rem;
    cursor: pointer;
  }
  .btn:hover { background: #f8fafc; }
  .btn-primary {
    border-color: rgba(29,78,216,.25);
    background: rgba(29,78,216,.06);
    color: #1d4ed8;
  }

  /* ✅ bottom charts : maintenant 1 seule colonne */
  .sa-ana-bottom {
    display:grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .sa-ana-wide { grid-column: 1 / -1; }

  /* SLA evolution */
  .line-meta {
    display:flex; align-items:baseline; justify-content:space-between; gap:12px;
    margin-top: 6px;
    color:#64748b; font-size:.82rem;
  }
  .line-meta strong {
    font-family:'Sora', sans-serif;
    font-weight: 900;
    color:#0f172a;
    font-size: 1.05rem;
  }

  @media (max-width: 1100px) {
    .sa-ana-main { grid-template-columns: 1fr; }
    .sa-ana-kpis { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .sa-ana-kpis { grid-template-columns: 1fr; }
    .sa-ana-bottom { grid-template-columns: 1fr; }
    .sa-ana-select { min-width: 100%; }
  }
`;

function fmtH(v) {
  if (typeof v !== "number") return "-";
  return `${v.toFixed(1)}h`;
}

function hmClass(p90) {
  if (p90 <= 6) return "hm-cell hm-eff";
  if (p90 <= 12) return "hm-cell hm-mod";
  return "hm-cell hm-risk";
}

const normalize = (v) => String(v || "").trim().toUpperCase();

function miniIcon(kind) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const stroke = "#0f172a";
  if (kind === "clock") {
    return (
      <svg {...common} stroke={stroke}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (kind === "doc") {
    return (
      <svg {...common} stroke={stroke}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (kind === "warn") {
    return (
      <svg {...common} stroke={stroke}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return (
    <svg {...common} stroke={stroke}>
      <path d="M3 3v18h18" />
      <path d="M19 9l-5 5-4-4-3 3" />
    </svg>
  );
}

export default function SAAnalytics() {
  const [period, setPeriod] = useState("30");
  const [inst, setInst] = useState("ALL");
  const [doc, setDoc] = useState("ALL");

  const [slaSeries, setSlaSeries] = useState([]);
  const [slaKpis, setSlaKpis] = useState({ sla: 0, slaTarget: 80, deltaSla: 0 });
  const [loadingSla, setLoadingSla] = useState(false);
  const [errorSla, setErrorSla] = useState("");

  const [radar, setRadar] = useState({ institutions: [], steps: [], heatmap: {} });
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState("");

  const [instMeta, setInstMeta] = useState({});
  const [logoFailed, setLogoFailed] = useState({});

  const [kpis, setKpis] = useState({
    avgTimeH: 0,
    sla: 0,
    slaTarget: 80,
    overdue: 0,
    active: 0,
    deltaAvg: 0,
    deltaSla: 0,
    deltaOverdue: 0,
    deltaActive: 0,
  });
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [errorKpis, setErrorKpis] = useState("");

  const BASE_URL =
    (api?.defaults?.baseURL && String(api.defaults.baseURL)) ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const data = useMemo(() => {
    const institutions = ["IFRI", "EPAC", "FSS"];
    const steps = ["N1", "N2", "N3", "N4", "N5", "N6"];

    const kpis = {
      avgTimeH: 36,
      sla: 78,
      overdue: 23,
      active: 147,
      slaTarget: 80,
      deltaAvg: -12,
      deltaSla: +5,
      deltaOverdue: -8,
      deltaActive: +15,
    };

    const insights = [
      {
        sev: "danger",
        title: "Blocage à l'étape N3 — IFRI",
        impact: "Le traitement est beaucoup plus lent que d'habitude.",
        action: "Proposition : ajouter temporairement 2 agents sur cette étape.",
      },
      {
        sev: "warn",
        title: "FSS : l'étape N4 ralentit",
        impact: "Le traitement devient progressivement plus lent.",
        action: "Proposition : vérifier comment se déroule chaque validation N4.",
      },
      {
        sev: "ok",
        title: "FSS au-dessus de l'objectif",
        impact: "Très bon : 92% des demandes traitées à temps.",
        action: "Proposition : partager cette méthode avec les autres institutions.",
      },
      {
        sev: "info",
        title: "Période chargée à venir",
        impact: "Attention : le mois de mars est souvent très chargé.",
        action: "Proposition : prévoir plus d'agents sur N2/N3 pendant cette période.",
      },
    ];

    return { institutions, steps, kpis, insights };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRadar = async () => {
      setRadarLoading(true);
      setRadarError("");
      try {
        const res = await api.get("/api/admin/analytics/radar", {
          params: { institution: inst, docType: doc },
        });
        if (!alive) return;
        setRadar(res.data || { institutions: [], steps: [], heatmap: {} });
      } catch (e) {
        if (!alive) return;
        setRadarError("Impossible de charger le radar");
      } finally {
        if (alive) setRadarLoading(false);
      }
    };

    loadRadar();
    const t = setInterval(loadRadar, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [inst, doc]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await api.get("/api/institutions");
        const list = Array.isArray(res.data) ? res.data : [];
        const m = {};
        for (const it of list) {
          const sigle = normalize(it.sigle);
          if (!sigle) continue;
          m[sigle] = { sigle, nom: it.nom, logoUrl: it.logoUrl || null };
        }
        if (!alive) return;
        setInstMeta(m);
      } catch {
        if (!alive) return;
        setInstMeta({});
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadKpis = async () => {
      setLoadingKpis(true);
      setErrorKpis("");
      try {
        const { data } = await api.get("/api/admin/analytics/kpis", {
          params: { days: Number(period), institution: inst, docType: doc },
        });
        if (!alive) return;
        setKpis(data?.kpis || {});
      } catch (e) {
        if (!alive) return;
        setErrorKpis("Impossible de charger les KPIs");
      } finally {
        if (alive) setLoadingKpis(false);
      }
    };

    loadKpis();
    const t = setInterval(loadKpis, 15000); // ✅ 15s
    return () => {
      alive = false;
      clearInterval(t);
  };
}, [period, inst, doc]);

  const getLogoSrc = (sigle) => {
    const s = normalize(sigle);
    const meta = instMeta[s];
    if (meta?.logoUrl) return meta.logoUrl;
    return `${BASE_URL}/assets/logos/${s}.png`;
  };

  const criticalInstitutions = useMemo(() => {
    const institutions = radar.institutions.length ? radar.institutions : data.institutions;
    const steps = radar.steps.length ? radar.steps : data.steps;

    return institutions.filter((ins) => {
      const stages = steps.map((s) => radar.heatmap?.[ins]?.[s]?.p90 ?? 0);
      return stages.some((v) => v > 12);
    });
  }, [radar, data]);

  const criticalBottlenecks = useMemo(() => {
    const institutions = radar.institutions.length ? radar.institutions : data.institutions;
    const steps = radar.steps.length ? radar.steps : data.steps;

    let n = 0;
    for (const ins of institutions) {
      for (const s of steps) {
        if ((radar.heatmap?.[ins]?.[s]?.p90 ?? 0) > 12) n += 1;
      }
    }
    return n;
  }, [radar, data]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoadingSla(true);
      setErrorSla("");
      try {
        const days = 20;
        const institution = inst;
        const docType = doc;

        const { data } = await api.get("/api/admin/analytics/sla", {
          params: { days, institution, docType },
        });

        if (!alive) return;

        const series = (data.series || []).map((x) => ({
          date: new Date(x.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          value: x.value,
        }));

        setSlaSeries(series);
        setSlaKpis(data.kpis || { sla: 0, slaTarget: 80, deltaSla: 0 });
      } catch {
        if (!alive) return;
        setErrorSla("Impossible de charger l'évolution SLA");
      } finally {
        if (alive) setLoadingSla(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [inst, doc]);

  return (
    <SALayout>
      <style>{css}</style>

      <div className="sa-ana-topbar">
        <div className="sa-ana-title">
          <h2>Tableau analytique</h2>
          <p>Performance du workflow multi-institutions</p>
        </div>

        <div className="sa-ana-filters" aria-label="Filtres analytics">
          <div className="sa-ana-select">
            <label>Période</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
            </select>
          </div>

          <div className="sa-ana-select">
            <label>Institutions</label>
            <select value={inst} onChange={(e) => setInst(e.target.value)}>
              <option value="ALL">Toutes</option>
              {data.institutions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div className="sa-ana-select">
            <label>Documents</label>
            <select value={doc} onChange={(e) => setDoc(e.target.value)}>
              <option value="ALL">Tous</option>
              <option value="ATTESTATION">Attestation</option>
              <option value="RELEVE">Relevé</option>
              <option value="DIPLOME">Diplôme</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-ana-status" role="status" aria-live="polite">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <strong>Statut système : Risque modéré</strong>
        <div className="pill">
          <span>{criticalInstitutions.length} institution(s) à risque</span>
          <span>{criticalBottlenecks} goulot(s) critique(s)</span>
        </div>
      </div>

      {/* KPI row (inchangé) */}
      <div className="sa-ana-kpis">
        <div className="sa-ana-card">
          <div className="sa-ana-kpi-top">
            <div className="sa-ana-kpi-icon">{miniIcon("clock")}</div>
            <div className={`sa-ana-kpi-trend ${data.kpis.deltaAvg < 0 ? "trend-down" : "trend-up"}`}>
              {data.kpis.deltaAvg < 0 ? "↘" : "↗"} {Math.abs(data.kpis.deltaAvg)}%
            </div>
          </div>
          <div className="sa-ana-kpi-value">
            {data.kpis.avgTimeH}
            <span style={{ fontSize: ".9rem", marginLeft: 6, color: "#64748b" }}>h</span>
          </div>
          <div className="sa-ana-kpi-label">Temps moyen de traitement</div>
          <div className="sa-ana-kpi-sub">Toutes institutions</div>
        </div>

        <div className="sa-ana-card sa-ana-sla">
          <div className="sa-ana-kpi-top">
            <div className="sa-ana-kpi-icon" style={{ background: "rgba(245,158,11,.10)" }}>
              {miniIcon("chart")}
            </div>
            <div style={{ color: slaKpis.deltaSla >= 0 ? "#15803d" : "#b91c1c", fontWeight: 900 }}>
              {slaKpis.deltaSla >= 0 ? "↗" : "↘"} {Math.abs(slaKpis.deltaSla)}% vs période précédente
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div className="sa-ana-kpi-value">
                {data.kpis.sla}
                <span style={{ fontSize: "1rem", marginLeft: 6, color: "#64748b" }}>%</span>
              </div>
              <div className="sa-ana-kpi-label">Demandes livrées en moins de 48h</div>
            </div>
            <div className="badge">Objectif : {data.kpis.slaTarget}%</div>
          </div>

          <div className="sa-ana-progress" aria-label="Progression SLA">
            <div style={{ "--w": `${Math.min(Math.max(data.kpis.sla, 0), 100)}%` }} />
          </div>
          <div className="sa-ana-sla-foot">
            <span>0%</span>
            <span>{data.kpis.sla}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="sa-ana-card">
          <div className="sa-ana-kpi-top">
            <div className="sa-ana-kpi-icon" style={{ background: "rgba(239,68,68,.10)" }}>
              {miniIcon("warn")}
            </div>
            <div className={`sa-ana-kpi-trend ${data.kpis.deltaOverdue < 0 ? "trend-up" : "trend-down"}`}>
              {data.kpis.deltaOverdue < 0 ? "↘" : "↗"} {Math.abs(data.kpis.deltaOverdue)}%
            </div>
          </div>
          <div className="sa-ana-kpi-value">{data.kpis.overdue}</div>
          <div className="sa-ana-kpi-label">Demandes en retard</div>
          <div className="sa-ana-kpi-sub">Risque de dépasser 48h</div>
        </div>

        <div className="sa-ana-card">
          <div className="sa-ana-kpi-top">
            <div className="sa-ana-kpi-icon">{miniIcon("doc")}</div>
            <div className={`sa-ana-kpi-trend ${data.kpis.deltaActive >= 0 ? "trend-up" : "trend-down"}`}>
              {data.kpis.deltaActive >= 0 ? "↗" : "↘"} {Math.abs(data.kpis.deltaActive)}%
            </div>
          </div>
          <div className="sa-ana-kpi-value">{data.kpis.active}</div>
          <div className="sa-ana-kpi-label">Demandes actives</div>
          <div className="sa-ana-kpi-sub">Toutes institutions</div>
        </div>
      </div>

      {/* Main: heatmap + right insights */}
      <div className="sa-ana-main">
        <div className="sa-ana-card radar-card">
          <h3 className="sa-ana-section-title">Radar des goulots</h3>
          {radarLoading && <div style={{ color:"#64748b", fontSize: ".85rem", marginBottom: 8 }}>Mise à jour…</div>}
          {radarError && <div style={{ color:"crimson", fontSize: ".85rem", marginBottom: 8 }}>{radarError}</div>}
          <p className="sa-ana-section-sub">Temps maximum habituel observé par étape</p>

          <div className="radar-content">
            <table className="hm" aria-label="Heatmap performance workflow">
              <thead>
                <tr>
                  <th>Institution</th>
                  {(radar.steps.length ? radar.steps : data.steps).map((s) => (
                    <th key={s}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(radar.institutions.length ? radar.institutions : data.institutions).map((ins) => (
                  <tr key={ins}>
                    <td>
                      <div className="inst">
                        {!logoFailed[ins] ? (
                          <span className="hm-logo" title={instMeta[ins]?.nom || ins}>
                            <img
                              src={getLogoSrc(ins)}
                              alt={`${ins} logo`}
                              onError={() => setLogoFailed((p) => ({ ...p, [ins]: true }))}
                            />
                          </span>
                        ) : (
                          <span className="hm-fallback" title={instMeta[ins]?.nom || ins}>
                            {ins.slice(0, 2)}
                          </span>
                        )}
                        {ins}
                      </div>
                    </td>

                    {(radar.steps.length ? radar.steps : data.steps).map((s) => {
                      const cell = radar.heatmap?.[ins]?.[s] || { p90: 0, pending: 0 };
                      return (
                        <td key={s}>
                          <div
                            className={hmClass(cell.p90)}
                            title={`${ins} ${s} — ${fmtH(cell.p90)} — ${cell.pending} en attente`}
                          >
                            <div className="v">{fmtH(cell.p90)}</div>
                            <div className="p">{cell.pending} en attente</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hm-legend" aria-label="Légende heatmap">
              <span><i className="dot dot-eff" /> Traitement rapide (&lt; 6h)</span>
              <span><i className="dot dot-mod" /> Traitement modéré (6–12h)</span>
              <span><i className="dot dot-risk" /> Traitement lent (&gt; 12h)</span>
            </div>
          </div>
        </div>

        <div className="sa-ana-card">
          <div className="ins-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Aide à la décision (explications simples)
          </div>

          <div className="insights">
            {data.insights.map((x, idx) => (
              <div
                key={idx}
                className={`ins-card ${
                  x.sev === "danger"
                    ? "sev-danger"
                    : x.sev === "warn"
                    ? "sev-warn"
                    : x.sev === "ok"
                    ? "sev-ok"
                    : "sev-info"
                }`}
              >
                <h4>{x.title}</h4>
                <p>{x.impact}</p>
                <div className="meta">{x.action}</div>
              </div>
            ))}
          </div>

          <div className="quick" aria-label="Actions rapides">
            <button className="btn btn-primary" type="button">Exporter un rapport (bientôt)</button>
            <button className="btn" type="button">Alertes (bientôt)</button>
            <button className="btn" type="button">Détails par institution (bientôt)</button>
          </div>
        </div>
      </div>

      {/* ✅ Bottom : uniquement SLA */}
      <div className="sa-ana-bottom">
        <div className="sa-ana-card sa-ana-wide">
          <h3 className="sa-ana-section-title" style={{ marginBottom: 2 }}>
            Évolution conformité SLA
          </h3>
          <p className="sa-ana-section-sub">
            Pourcentage de demandes livrées &lt; 48h (période sélectionnée)
          </p>

          <div style={{ height: 260, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaSeries} margin={{ top: 10, right: 60, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="slaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b2a8f" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0b2a8f" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickMargin={8} />
                <YAxis domain={[65, 85]} tickMargin={8} />

                <ReferenceLine
                  y={slaKpis.slaTarget}
                  stroke="#ef4444"
                  strokeDasharray="6 6"
                  label={{ value: "Cible", position: "insideRight", fill: "#ef4444", fontSize: 12 }}
                />

                <Tooltip formatter={(val) => [`${val}%`, "Conformité"]} labelFormatter={(label) => label} />
                <Area type="monotone" dataKey="value" stroke="none" fill="url(#slaFill)" />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0b2a8f"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive
                  animationDuration={700}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="line-meta">
            <div>
              <strong>{slaKpis.sla}%</strong> conformité actuelle
            </div>
            <div style={{ color: "#15803d", fontWeight: 900 }}>↗ +6,0% vs période précédente</div>
          </div>

          {loadingSla && <div style={{ marginTop: 10, color: "#64748b" }}>Chargement…</div>}
          {errorSla && <div style={{ marginTop: 10, color: "crimson" }}>{errorSla}</div>}
        </div>
      </div>
    </SALayout>
  );
}