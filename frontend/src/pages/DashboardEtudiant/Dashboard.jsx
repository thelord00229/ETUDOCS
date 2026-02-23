import Sidebar from "../../components/DashboardEtudiant/Sidebar.jsx"
import TopBar from "../../components/DashboardEtudiant/Topbar.jsx"
import StatCard from "../../components/DashboardEtudiant/Statcard.jsx"
import DemandRow from "../../components/DashboardEtudiant/Demandrow.jsx"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .dash-layout {
    display: flex; min-height: 100vh;
    background: #f8fafc;
    font-family: 'DM Sans', sans-serif;
  }
  .dash-main {
    margin-left: 200px;
    padding-top: 64px;
    flex: 1; min-width: 0;
    padding-bottom: 40px;
  }
  .dash-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

  /* HERO BANNER */
  .dash-hero {
    background: linear-gradient(135deg, #1a2744 0%, #243057 100%);
    border-radius: 16px; padding: 32px 36px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .dash-hero::after {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(245,166,35,.08);
  }
  .dash-hero h1 {
    font-family: 'Sora', sans-serif; font-weight: 800;
    font-size: clamp(1.2rem, 2.5vw, 1.55rem);
    color: #fff; margin-bottom: 6px; line-height: 1.3;
  }
  .dash-hero p { color: rgba(255,255,255,.65); font-size: .9rem; margin-bottom: 20px; }
  .btn-new-demand {
    display: inline-flex; align-items: center; gap: 8px;
    background: #f5a623; color: #fff;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: .9rem;
    padding: 11px 22px; border-radius: 10px; border: none; cursor: pointer;
    transition: background .2s, transform .15s;
    text-decoration: none;
  }
  .btn-new-demand:hover { background: #fbbf4a; transform: translateY(-1px); }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  /* DEMANDES RECENTES */
  .card-section {
    background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
    padding: 24px 26px;
  }
  .card-section__header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
  }
  .card-section__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #1a2744; }
  .card-section__link { font-size: .85rem; color: #475569; text-decoration: none; transition: color .2s; }
  .card-section__link:hover { color: #1a2744; }

  /* BOTTOM GRID */
  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .promo-card {
    border-radius: 14px; padding: 24px;
    border: 1px solid #e2e8f0; background: #fff;
  }
  .promo-card__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
  }
  .promo-card__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
  .promo-card__sub { font-size: .85rem; color: #475569; margin-bottom: 18px; line-height: 1.5; }
  .btn-outline-sm {
    display: inline-flex; align-items: center;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    color: #334155; background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 8px; padding: 8px 18px; cursor: pointer;
    transition: border-color .2s, color .2s;
    text-decoration: none;
  }
  .btn-outline-sm:hover { border-color: #1a2744; color: #1a2744; }

  /* SUPPORT */
  .support-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 28px; text-align: center;
  }
  .support-card h3 { font-family: 'Sora', sans-serif; font-weight: 700; color: #1a2744; margin-bottom: 8px; }
  .support-card p  { color: #475569; font-size: .9rem; margin-bottom: 16px; }
  .support-card__links { display: flex; align-items: center; justify-content: center; gap: 24px; font-size: .9rem; }
  .support-card__links a { color: #1a2744; font-weight: 500; text-decoration: none; }
  .support-card__links a:hover { text-decoration: underline; }
  .support-card__sep { color: #cbd5e1; }

  @media (max-width: 900px) {
    .stats-grid  { grid-template-columns: 1fr 1fr; }
    .bottom-grid { grid-template-columns: 1fr; }
  }
`;

const DEMANDES = [
    { title: "Attestation d'inscription", ref_: "REQ-2026-00142", date: "14 fév 2026", status: "En traitement" },
    { title: "Relevé de notes",           ref_: "REQ-2026-00089", date: "02 fév 2026", status: "Disponible" },
    { title: "Attestation de succès",     ref_: "REQ-2026-00034", date: "18 jan 2026", status: "Disponible" },
];

const SvgClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);
const SvgDownload = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const SvgX = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);

export default function Dashboard() {
    return (
        <div className="dash-layout">
            <style>{css}</style>
            <Sidebar />
            <div className="dash-main">
                <TopBar name="Koffi AGUEH" meta="20220001 • IFRI" initials="KA" notifCount={1} />
                <div className="dash-content">

                    {/* Hero */}
                    <div className="dash-hero">
                        <div>
                            <h1>Bonjour Koffi, que pouvons-nous faire pour vous aujourd'hui ?</h1>
                            <p>Bienvenue sur votre espace personnel EtuDocs</p>
                            <a href="/dashboard/nouvelle" className="btn-new-demand">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                Nouvelle demande
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <StatCard
                            label="Demandes en cours"
                            value="2"
                            sub="↗ +1 cette semaine"
                            icon={<SvgClock />}
                            accentColor="#f59e0b"
                            iconBg="#fffbeb"
                        />
                        <StatCard
                            label="Documents disponibles"
                            value="5"
                            sub="Prêts à être téléchargés"
                            icon={<SvgDownload />}
                            accentColor="#22c55e"
                            iconBg="#f0fdf4"
                        />
                        <StatCard
                            label="Demandes rejetées"
                            value="0"
                            sub="Aucune demande rejetée"
                            icon={<SvgX />}
                            accentColor="#ef4444"
                            iconBg="#fef2f2"
                        />
                    </div>

                    {/* Demandes récentes */}
                    <div className="card-section">
                        <div className="card-section__header">
                            <span className="card-section__title">Demandes récentes</span>
                            <a href="/dashboard/demandes" className="card-section__link">Voir tout</a>
                        </div>
                        {DEMANDES.map((d, i) => (
                            <DemandRow key={i} {...d} onDetails={() => alert(`Détails : ${d.title}`)} />
                        ))}
                    </div>

                    {/* Bottom promo cards */}
                    <div className="bottom-grid">
                        <div className="promo-card">
                            <div className="promo-card__icon" style={{ background: "#eff6ff" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                     stroke="#1a2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            </div>
                            <div className="promo-card__title" style={{ color: "#1a2744" }}>Besoin d'un document ?</div>
                            <div className="promo-card__sub">Soumettez une nouvelle demande en quelques clics</div>
                            <a href="/dashboard/nouvelle" className="btn-outline-sm">Faire une demande</a>
                        </div>

                        <div className="promo-card">
                            <div className="promo-card__icon" style={{ background: "#f0fdf4" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                     stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="9 11 12 14 22 4"/>
                                </svg>
                            </div>
                            <div className="promo-card__title" style={{ color: "#16a34a" }}>Documents prêts</div>
                            <div className="promo-card__sub">5 documents sont disponibles au téléchargement</div>
                            <a href="/dashboard/documents" className="btn-outline-sm">Télécharger</a>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="support-card">
                        <h3>Besoin d'aide ?</h3>
                        <p>Notre équipe est là pour vous accompagner dans vos démarches</p>
                        <div className="support-card__links">
                            <a href="mailto:support@etudocs.bj">support@etudocs.bj</a>
                            <span className="support-card__sep">|</span>
                            <a href="tel:+22900000000">+229 XX XX XX XX</a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}