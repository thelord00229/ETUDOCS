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
  .hm-cell .v small { color: #64748b; font-weight: 700; font-size: .8rem; }
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

  /* bottom charts */
  .sa-ana-bottom {
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .toggle {
    display:inline-flex;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow:hidden;
    margin-left: auto;
  }
  .toggle button {
    border:none;
    padding: 8px 10px;
    background:#fff;
    cursor:pointer;
    font-weight: 900;
    color:#64748b;
    font-size:.85rem;
  }
  .toggle button.active {
    background: rgba(29,78,216,.08);
    color: #1d4ed8;
  }

  .stack-wrap { margin-top: 14px; }
  .stack-row {
    display:flex; align-items:center; gap: 12px;
    margin-bottom: 12px;
  }
  .stack-row .name {
    width: 70px;
    font-family:'Sora', sans-serif;
    font-weight: 900;
    color:#0f172a;
    font-size:.9rem;
  }
  .stack {
    flex:1;
    height: 14px;
    border-radius: 999px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    overflow:hidden;
    display:flex;
  }
  .seg { height:100%; }
  .seg-slow { background: rgba(239,68,68,.75) !important; }
  .stack-row .tot {
    width: 70px;
    text-align:right;
    font-family:'Sora', sans-serif;
    font-weight: 900;
    color:#0f172a;
    font-size:.88rem;
  }
  .legend-mini {
    display:flex; gap: 10px; flex-wrap: wrap;
    color:#64748b; font-size:.8rem; margin-top: 12px;
  }
  .legend-mini span { display:flex; align-items:center; gap:8px; }
  .chip { width:10px; height:10px; border-radius:3px; display:inline-block; border: 1px solid rgba(15,23,42,.08); }

  .aging-top {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    margin-bottom: 10px;
  }
  .crit {
    display:flex; align-items:center; gap:10px;
    border: 1px solid rgba(239,68,68,.25);
    background: rgba(239,68,68,.08);
    color: #991b1b;
    padding: 8px 10px;
    border-radius: 12px;
    font-weight: 900;
    font-family: 'Sora', sans-serif;
    font-size: .9rem;
  }
  .bars {
    display:flex; gap: 12px; align-items:flex-end;
    height: 160px;
    margin-top: 8px;
    padding: 10px 4px 0 4px;
  }
  .bar {
    flex: 1;
    border-radius: 12px 12px 10px 10px;
    border: 1px solid #e2e8f0;
    background: rgba(29,78,216,.10);
    position: relative;
    min-width: 70px;
  }
  .bar small {
    position:absolute;
    bottom:-26px;
    left:50%;
    transform: translateX(-50%);
    font-size:.78rem;
    color:#64748b;
    white-space: nowrap;
  }
  .bar .val {
    position:absolute;
    top:-22px;
    left:50%;
    transform: translateX(-50%);
    font-size:.8rem;
    color:#0f172a;
    font-weight: 900;
    font-family: 'Sora', sans-serif;
    white-space: nowrap;
  }
  .bar.red { background: rgba(239,68,68,.14); border-color: rgba(239,68,68,.22); }

  .sa-ana-wide {
    grid-column: 1 / -1;
  }

  /* SLA evolution */
  .line-wrap { margin-top: 8px; }
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
  const stroke =
    kind === "blue"
      ? "#1d4ed8"
      : kind === "orange"
      ? "#d97706"
      : kind === "red"
      ? "#ef4444"
      : "#16a34a";
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
  // default: chart
  return (
    <svg {...common} stroke={stroke}>
      <path d="M3 3v18h18" />
      <path d="M19 9l-5 5-4-4-3 3" />
    </svg>
  );
}

export default function SAAnalytics() {
  // UI-only filters
  const [period, setPeriod] = useState("30");
  const [inst, setInst] = useState("ALL");
  const [doc, setDoc] = useState("ALL");
  const [metric, setMetric] = useState("P90");
  const [slaSeries, setSlaSeries] = useState([]);
  const [slaKpis, setSlaKpis] = useState({ sla: 0, slaTarget: 80, deltaSla: 0 });
  const [loadingSla, setLoadingSla] = useState(false);
  const [errorSla, setErrorSla] = useState("");

  // Mock “analytics” data (brancher API plus tard)
  const data = useMemo(() => {
    const institutions = ["IFRI", "EPAC", "FSS"];
    const steps = ["N1", "N2", "N3", "N4", "N5", "N6"];

    const heatmap = {
      IFRI: {
        N1: { p90: 4.2, pending: 12 },
        N2: { p90: 8.5, pending: 18 },
        N3: { p90: 18.3, pending: 34 },
        N4: { p90: 6.1, pending: 15 },
        N5: { p90: 3.8, pending: 8 },
        N6: { p90: 2.1, pending: 5 },
      },
      EPAC: {
        N1: { p90: 3.8, pending: 8 },
        N2: { p90: 6.2, pending: 11 },
        N3: { p90: 12.1, pending: 19 },
        N4: { p90: 7.3, pending: 22 },
        N5: { p90: 4.2, pending: 12 },
        N6: { p90: 2.5, pending: 6 },
      },
      FSS: {
        N1: { p90: 3.2, pending: 10 },
        N2: { p90: 5.8, pending: 14 },
        N3: { p90: 9.7, pending: 16 },
        N4: { p90: 5.9, pending: 13 },
        N5: { p90: 3.5, pending: 9 },
        N6: { p90: 1.9, pending: 4 },
      },
    };

    // “Lead time breakdown” (hours per step), plus slowest highlighted
    const breakdown = {
      IFRI: { N1: 6, N2: 10, N3: 22, N4: 8, N5: 5, N6: 3 },
      EPAC: { N1: 5, N2: 8, N3: 14, N4: 10, N5: 6, N6: 4 },
      FSS: { N1: 4, N2: 7, N3: 11, N4: 7, N5: 5, N6: 3 },
    };

    // Aging
    const aging = [
      { k: "0–24h", v: 52, color: "blue" },
      { k: "24–48h", v: 63, color: "blue" },
      { k: "48–72h", v: 19, color: "blue" },
      { k: ">72h", v: 13, color: "red" },
    ];

    // SLA evolution (% under 48h)
    const slaSeries = [
      { date: "01 Feb", value: 72 },
      { date: "03 Feb", value: 71 },
      { date: "05 Feb", value: 73 },
      { date: "07 Feb", value: 74 },
      { date: "09 Feb", value: 72 },
      { date: "11 Feb", value: 75 },
      { date: "13 Feb", value: 76 },
      { date: "15 Feb", value: 74 },
      { date: "17 Feb", value: 77 },
      { date: "19 Feb", value: 76 },
      { date: "21 Feb", value: 78 },
      { date: "23 Feb", value: 79 },
      { date: "25 Feb", value: 77 },
      { date: "27 Feb", value: 78 },
      { date: "01 Mar", value: 78 },
    ];

    // KPIs
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

    return { institutions, steps, heatmap, breakdown, aging, slaSeries, kpis, insights };
  }, []);

  const criticalInstitutions = useMemo(() => {
    // mock rule: if any stage p90 > 12 => “risk”
    const risky = data.institutions.filter((ins) => {
      const stages = data.steps.map((s) => data.heatmap[ins][s]?.p90 ?? 0);
      return stages.some((v) => v > 12);
    });
    return risky;
  }, [data]);

  const criticalBottlenecks = useMemo(() => {
    // count cells >12
    let n = 0;
    for (const ins of data.institutions) {
      for (const s of data.steps) {
        if ((data.heatmap[ins][s]?.p90 ?? 0) > 12) n += 1;
      }
    }
    return n;
  }, [data]);

  const maxAging = useMemo(() => Math.max(...data.aging.map((x) => x.v), 1), [data]);
  const criticalCount = useMemo(() => data.aging.find((x) => x.k === ">72h")?.v ?? 0, [data]);

  const breakdownLegend = useMemo(() => {
    // simple palette (stable)
    return {
      N1: "rgba(29,78,216,.30)",
      N2: "rgba(29,78,216,.40)",
      N3: "rgba(29,78,216,.55)",
      N4: "rgba(29,78,216,.25)",
      N5: "rgba(29,78,216,.35)",
      N6: "rgba(29,78,216,.20)",
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
        setLoadingSla(true);
        setErrorSla("");
        try {
        const days = 20; // ou period->7/30/90 mais toi tu veux 20 pour le graphe
        const institution = inst; // "ALL" ou IFRI/EPAC/FSS
        const docType = doc; // "ALL"/...

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
        } catch (e) {
        if (!alive) return;
        setErrorSla("Impossible de charger l'évolution SLA");
        } finally {
        if (alive) setLoadingSla(false);
        }
    };

    run();
    return () => { alive = false; };
    }, [inst, doc]);

  return (
    <SALayout>
      <style>{css}</style>

      {/* Header */}
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

      {/* System status strip */}
      <div className="sa-ana-status" role="status" aria-live="polite">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9a3412"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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

      {/* KPI row */}
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
            <p className="sa-ana-section-sub">
                Temps maximum habituel observé par étape
            </p>

            <div className="radar-content">
                <table className="hm" aria-label="Heatmap performance workflow">
                <thead>
                    <tr>
                    <th>Institution</th>
                    {data.steps.map((s) => (
                        <th key={s}>{s}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {data.institutions.map((ins) => (
                    <tr key={ins}>
                        <td>
                        <div className="inst">
                            <span
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f8fafc",
                                color: "#1d4ed8",
                                fontWeight: 900,
                                fontSize: ".8rem"
                            }}
                            >
                            {ins.slice(0, 2)}
                            </span>
                            {ins}
                        </div>
                        </td>

                        {data.steps.map((s) => {
                        const cell = data.heatmap[ins][s];
                        return (
                            <td key={s}>
                            <div
                                className={hmClass(cell.p90)}
                                title={`${ins} ${s} — ${fmtH(cell.p90)} — ${cell.pending} en attente`}
                            >
                                <div className="v">
                                {fmtH(cell.p90)}
                                </div>
                                <div className="p">
                                {cell.pending} en attente
                                </div>
                            </div>
                            </td>
                        );
                        })}
                    </tr>
                    ))}
                </tbody>
                </table>

                <div className="hm-legend" aria-label="Légende heatmap">
                <span>
                    <i className="dot dot-eff" /> Traitement rapide (&lt; 6h)
                </span>
                <span>
                    <i className="dot dot-mod" /> Traitement modéré (6–12h)
                </span>
                <span>
                    <i className="dot dot-risk" /> Traitement lent (&gt; 12h)
                </span>
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
            <button className="btn btn-primary" type="button">
              Exporter un rapport
            </button>
            <button className="btn" type="button">
              Alertes (bientôt)
            </button>
            <button className="btn" type="button">
              Détails par institution
            </button>
          </div>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="sa-ana-bottom">
        <div className="sa-ana-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h3 className="sa-ana-section-title" style={{ marginBottom: 2 }}>
                Décomposition du délai par institution
              </h3>
              <p className="sa-ana-section-sub" style={{ marginBottom: 0 }}>
                Temps total décomposé par étapes (l’étape la plus lente est en rouge)
              </p>
            </div>
            <div className="toggle" role="tablist" aria-label="Choix métrique">
              <button
                className={metric === "P50" ? "active" : ""}
                onClick={() => setMetric("P50")}
                type="button"
                role="tab"
                aria-selected={metric === "P50"}
              >
                Médiane (P50)
              </button>
              <button
                className={metric === "P90" ? "active" : ""}
                onClick={() => setMetric("P90")}
                type="button"
                role="tab"
                aria-selected={metric === "P90"}
              >
                P90
              </button>
            </div>
          </div>

          <div className="stack-wrap">
            {data.institutions.map((ins) => {
              const v = data.breakdown[ins];
              const total = data.steps.reduce((acc, s) => acc + (v[s] || 0), 0);
              const slowestStep = data.steps.reduce(
                (best, s) => (v[s] > (v[best] || 0) ? s : best),
                data.steps[0]
              );

              return (
                <div className="stack-row" key={ins}>
                  <div className="name">{ins}</div>
                  <div className="stack" aria-label={`Décomposition ${ins}`}>
                    {data.steps.map((s) => {
                      const w = total > 0 ? (v[s] / total) * 100 : 0;
                      const isSlow = s === slowestStep;
                      return (
                        <div
                          key={s}
                          className={`seg ${isSlow ? "seg-slow" : ""}`}
                          style={{ width: `${w}%`, background: breakdownLegend[s] }}
                          title={`${ins} ${s} : ${v[s]}h`}
                        />
                      );
                    })}
                  </div>
                  <div className="tot">{Math.round(total)}h</div>
                </div>
              );
            })}
          </div>

          <div className="legend-mini" aria-label="Légende étapes">
            {data.steps.map((s) => (
              <span key={s}>
                <i className="chip" style={{ background: breakdownLegend[s] }} />
                {s}
              </span>
            ))}
            <span>
              <i className="chip" style={{ background: "rgba(239,68,68,.75)" }} /> plus lent
            </span>
          </div>
        </div>

        <div className="sa-ana-card">
          <div className="aging-top">
            <div>
              <h3 className="sa-ana-section-title" style={{ marginBottom: 2 }}>
                Répartition de l’ancienneté
              </h3>
              <p className="sa-ana-section-sub" style={{ marginBottom: 0 }}>
                Demandes actives par tranche de traitement
              </p>
            </div>
            <div className="crit" title="Demandes au-delà de 72h">
              {criticalCount} critiques (&gt;72h)
            </div>
          </div>

          <div className="bars" aria-label="Histogramme ancienneté">
            {data.aging.map((x) => {
              const h = Math.max(8, (x.v / maxAging) * 140);
              return (
                <div
                  key={x.k}
                  className={`bar ${x.k === ">72h" ? "red" : ""}`}
                  style={{ height: `${h}px` }}
                  title={`${x.k}: ${x.v} demandes`}
                >
                  <div className="val">{x.v}</div>
                  <small>{x.k}</small>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 40, color: "#64748b", fontSize: ".82rem" }}>
            &gt;72h = risque de dépasser 48h
          </div>
        </div>

        <div className="sa-ana-card sa-ana-wide">
          <h3 className="sa-ana-section-title" style={{ marginBottom: 2 }}>
            Évolution conformité SLA
          </h3>
          <p className="sa-ana-section-sub">
            Pourcentage de demandes livrées &lt; 48h (période sélectionnée)
          </p>

          {/* ✅ FIX IMPORTANT :
              - defs doit être DANS le LineChart (pas dans ResponsiveContainer)
              - Area doit être DANS le LineChart (pas à côté)
          */}
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

                {/* Ligne cible */}
                <ReferenceLine
                  y={slaKpis.slaTarget}
                  stroke="#ef4444"
                  strokeDasharray="6 6"
                  label={{ value: "Cible", position: "insideRight", fill: "#ef4444", fontSize: 12 }}
                />

                <Tooltip formatter={(val) => [`${val}%`, "Conformité"]} labelFormatter={(label) => label} />

                {/* Dégradé sous la courbe */}
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
        </div>
      </div>
    </SALayout>
  );
}