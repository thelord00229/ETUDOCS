import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:      #1a2744;
    --navy-dark: #0f1a33;
    --navy-mid:  #243057;
    --gold:      #f5a623;
    --gold-lt:   #fbbf4a;
    --white:     #ffffff;
    --g50:       #f8fafc;
    --g100:      #f1f5f9;
    --g200:      #e2e8f0;
    --g400:      #94a3b8;
    --g600:      #475569;
    --g700:      #334155;
    --g800:      #1e293b;
  }

  html, body, #root, #app { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow-x: hidden; }
  body { font-family: 'DM Sans', sans-serif; color: var(--g800); background: var(--white); }
  h1,h2,h3,h4,h5 { font-family: 'Sora', sans-serif; }

  .root { width: 100%; max-width: 100%; margin: 0; padding: 0; overflow-x: hidden; display: block; }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    width: 100%;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--g200);
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .nav__inner {
    width: 100%; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
  }
  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.2rem;
    color: var(--navy); text-decoration: none;
  }
  .logo__icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .nav__actions { display: flex; align-items: center; gap: 14px; }
  .btn-ghost {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
    color: var(--g700); font-weight: 500;
    padding: 8px 16px; border-radius: 8px; transition: background .2s;
  }
  .btn-ghost:hover { background: var(--g100); }
  .btn-gold {
    background: var(--gold); border: none; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600;
    color: var(--white); padding: 10px 22px; border-radius: 8px;
    transition: background .2s, transform .15s; white-space: nowrap;
  }
  .btn-gold:hover { background: var(--gold-lt); transform: translateY(-1px); }

  /* HERO */
  .hero {
    width: 100%;
    background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-mid) 100%);
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse at 70% 50%, rgba(245,166,35,.09) 0%, transparent 60%),
      radial-gradient(ellipse at 15% 80%, rgba(45,212,191,.06) 0%, transparent 55%);
  }
  .hero__inner {
    position: relative; z-index: 1;
    width: 100%;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
    padding: 80px 48px 90px;
  }
  .hero__title {
    font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800;
    color: var(--white); line-height: 1.15; margin-bottom: 18px;
  }
  .hero__sub {
    color: rgba(255,255,255,.7); font-size: 1.05rem;
    line-height: 1.65; margin-bottom: 36px;
  }
  .btn-cta {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--gold); color: var(--white);
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem;
    padding: 14px 28px; border-radius: 10px; border: none; cursor: pointer;
    text-decoration: none;
    transition: background .2s, transform .2s, box-shadow .2s;
  }
  .btn-cta:hover { background: var(--gold-lt); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,166,35,.35); }
  .hero__card {
    background: rgba(255,255,255,.09); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 16px; padding: 28px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .feat { display: flex; align-items: flex-start; gap: 14px; }
  .feat__icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  }
  .feat__icon--gold  { background: rgba(245,166,35,.22); }
  .feat__icon--green { background: rgba(34,197,94,.22); }
  .feat__icon--teal  { background: rgba(45,212,191,.22); }
  .feat__title { font-family:'Sora',sans-serif; font-weight:600; font-size:.95rem; color:var(--white); margin-bottom:3px; }
  .feat__sub   { font-size:.84rem; color:rgba(255,255,255,.58); }

  /* STATS */
  .stats {
    width: 100%;
    background: var(--g50);
    display: grid; grid-template-columns: repeat(3,1fr);
    border-bottom: 1px solid var(--g200);
  }
  .stat { padding: 40px 20px; text-align: center; }
  .stat + .stat { border-left: 1px solid var(--g200); }
  .stat__num {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family:'Sora',sans-serif; font-size:2.6rem; font-weight:800; color:var(--navy);
  }
  .stat__num--amber { color: #d97706; }
  .stat__label { color:var(--g600); font-size:.9rem; margin-top:4px; }
  .stat__sub   { color:var(--g400); font-size:.78rem; margin-top:2px; }

  /* SECTIONS */
  .section { width:100%; padding: 80px 80px; }
  .section--gray { background: var(--g50); }
  .section__title { font-size:clamp(1.6rem,3vw,2.2rem); font-weight:800; color:var(--navy); text-align:center; margin-bottom:10px; }
  .section__sub   { color:var(--g600); font-size:1rem; text-align:center; margin-bottom:50px; }

  /* STEPS */
  .steps { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .step {
    background:var(--white); border:1px solid var(--g200);
    border-radius:16px; padding:28px 22px;
    transition: box-shadow .2s, transform .2s;
  }
  .step:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform:translateY(-4px); }
  .step__icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:20px; }
  .step__icon--blue   { background:#eff6ff; }
  .step__icon--green  { background:#f0fdf4; }
  .step__icon--amber  { background:#fffbeb; }
  .step__icon--purple { background:#faf5ff; }
  .step__label { font-size:.7rem; font-weight:700; color:var(--g400); letter-spacing:.08em; text-transform:uppercase; margin-bottom:8px; }
  .step__title { font-family:'Sora',sans-serif; font-size:1rem; font-weight:700; color:var(--navy); margin-bottom:8px; }
  .step__desc  { color:var(--g600); font-size:.88rem; line-height:1.6; }

  /* INSTITUTIONS */
  .inst-univ { color:var(--g600); font-size:.95rem; text-align:center; margin-bottom:40px; }
  .inst-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .inst-card { background:var(--white); border-radius:16px; padding:36px 24px; text-align:center; transition:box-shadow .2s, transform .2s; }
  .inst-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform:translateY(-4px); }
  .inst-card--ifri { border:2px solid #1a2744; }
  .inst-card--epac { border:2px solid #0f766e; }
  .inst-card--fss  { border:2px solid #d97706; }
  .inst-avatar { width:72px; height:72px; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:800; font-size:1.1rem; color:#fff; }
  .inst-avatar--ifri { background:#1a2744; }
  .inst-avatar--epac { background:#0f766e; }
  .inst-avatar--fss  { background:#d97706; }
  .inst-name { font-family:'Sora',sans-serif; font-weight:700; font-size:1.1rem; color:var(--navy); margin-bottom:6px; }
  .inst-full { color:var(--g600); font-size:.85rem; line-height:1.5; margin-bottom:14px; }
  .badge { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; color:#16a34a; font-size:.8rem; font-weight:600; padding:5px 12px; border-radius:20px; }

  /* TESTIMONIALS */
  .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .testi-card { background:var(--white); border:1px solid var(--g200); border-left:4px solid var(--gold); border-radius:16px; padding:28px; transition:box-shadow .2s; }
  .testi-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); }
  .stars { color:var(--gold); font-size:.9rem; letter-spacing:2px; margin-bottom:14px; }
  .testi-text { color:var(--g700); font-size:.92rem; line-height:1.7; font-style:italic; margin-bottom:20px; }
  .testi-author { display:flex; align-items:center; gap:12px; }
  .testi-ava { width:40px; height:40px; border-radius:50%; background:var(--navy); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; flex-shrink:0; }
  .testi-name { font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:var(--navy); display:block; }
  .testi-role { color:var(--g400); font-size:.8rem; }

  /* CTA BAND */
  .cta-band {
    width: 100%;
    background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%);
    padding: 80px 48px; text-align: center;
  }
  .cta-band__title { font-size:clamp(1.6rem,3vw,2.4rem); font-weight:800; color:var(--white); margin-bottom:14px; }
  .cta-band__sub   { color:rgba(255,255,255,.7); font-size:1rem; margin-bottom:36px; }

  /* FOOTER */
  .footer { width: 100%; background: var(--navy-dark); }
  .footer__inner { width: 100%; padding: 60px 48px 30px; }
  .footer__top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
  .footer__brand p { color:rgba(255,255,255,.5); font-size:.88rem; line-height:1.7; margin-top:12px; max-width:220px; }
  .footer__col h5 { font-family:'Sora',sans-serif; font-weight:700; color:#fff; font-size:.9rem; margin-bottom:16px; }
  .footer__col a { display:block; color:rgba(255,255,255,.55); font-size:.88rem; margin-bottom:10px; text-decoration:none; transition:color .2s; }
  .footer__col a:hover { color:var(--gold); }
  .footer__bottom { border-top:1px solid rgba(255,255,255,.1); padding-top:24px; display:flex; align-items:center; justify-content:space-between; }
  .footer__copy { color:rgba(255,255,255,.35); font-size:.82rem; }
  .footer__legal { display:flex; gap:20px; }
  .footer__legal a { color:rgba(255,255,255,.35); font-size:.82rem; text-decoration:none; transition:color .2s; }
  .footer__legal a:hover { color:var(--gold); }

  /* RESPONSIVE */
  @media (max-width:1024px) {
    .steps { grid-template-columns:repeat(2,1fr); }
    .testi-grid { grid-template-columns:repeat(2,1fr); }
    .footer__top { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:768px) {
    .nav__inner  { padding:0 20px; }
    .hero__inner { grid-template-columns:1fr; padding:60px 20px 70px; }
    .hero__card  { display:none; }
    .stats { grid-template-columns:1fr; }
    .stat + .stat { border-left:none; border-top:1px solid var(--g200); }
    .section { padding:60px 20px; }
    .steps { grid-template-columns:1fr; }
    .inst-grid { grid-template-columns:1fr; }
    .testi-grid { grid-template-columns:1fr; }
    .cta-band { padding:60px 20px; }
    .footer__inner { padding:40px 20px 24px; }
    .footer__top { grid-template-columns:1fr; }
    .footer__bottom { flex-direction:column; gap:12px; text-align:center; }
  }
`;

const DocIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
);

export default function Home() {
    return (
        <div className="root" style={{width:"100%",maxWidth:"100%",margin:0,padding:0,boxSizing:"border-box"}}>
            <style>{css}</style>

            <nav className="nav">
                <div className="nav__inner">
                    <a href="#" className="logo">
                        <div className="logo__icon"><DocIcon size={20} /></div>
                        EtuDocs
                    </a>
                    <div className="nav__actions">
                        <a href="/login" ><button className="btn-ghost" >Connexion</button></a>
                        <a href="/register" ><button className="btn-gold">Créer un compte</button></a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero__inner">
                    <div>
                        <h1 className="hero__title">
                            Fini les files d'attente. Demandez vos documents universitaires en ligne.
                        </h1>
                        <p className="hero__sub">Vos documents universitaires, en quelques clics.</p>
                        <a href="/login" className="btn-cta">Faire une demande <span>→</span></a>
                    </div>
                    <div className="hero__card">
                        {[
                            { cls: "feat__icon--gold",  icon: "⚡", title: "Rapide et simple",    sub: "Demande en 3 minutes" },
                            { cls: "feat__icon--green", icon: "🔒", title: "100% sécurisé",       sub: "Documents certifiés avec QR code" },
                            { cls: "feat__icon--teal",  icon: "⏱", title: "Suivi en temps réel", sub: "Notifications à chaque étape" },
                        ].map((f, i) => (
                            <div className="feat" key={i}>
                                <div className={`feat__icon ${f.cls}`}>{f.icon}</div>
                                <div>
                                    <div className="feat__title">{f.title}</div>
                                    <div className="feat__sub">{f.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <div className="stats">
                <div className="stat">
                    <div className="stat__num">🏛 3</div>
                    <div className="stat__label">institutions connectées</div>
                    <div className="stat__sub">IFRI • EPAC • FSS</div>
                </div>
                <div className="stat">
                    <div className="stat__num">📄 7</div>
                    <div className="stat__label">types de documents disponibles</div>
                </div>
                <div className="stat">
                    <div className="stat__num stat__num--amber">⏱ 48h</div>
                    <div className="stat__label">délai moyen de traitement</div>
                </div>
            </div>

            <section className="section">
                <h2 className="section__title">Comment ça marche ?</h2>
                <p className="section__sub">Obtenez vos documents en 4 étapes simples</p>
                <div className="steps">
                    {[
                        { col:"blue",   icon:"👤", n:1, title:"Créer un compte",           desc:"Inscrivez-vous avec votre numéro étudiant" },
                        { col:"green",  icon:"📋", n:2, title:"Soumettre une demande",      desc:"Choisissez votre document et uploadez les pièces" },
                        { col:"amber",  icon:"⏱", n:3, title:"Suivre en temps réel",       desc:"Recevez des notifications à chaque étape" },
                        { col:"purple", icon:"📥", n:4, title:"Télécharger votre document", desc:"Document certifié avec QR code de vérification" },
                    ].map(s => (
                        <div className="step" key={s.n}>
                            <div className={`step__icon step__icon--${s.col}`}>{s.icon}</div>
                            <div className="step__label">ÉTAPE {s.n}</div>
                            <div className="step__title">{s.title}</div>
                            <div className="step__desc">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section section--gray">
                <h2 className="section__title">Institutions partenaires</h2>
                <p className="inst-univ">Université d'Abomey-Calavi (UAC)</p>
                <div className="inst-grid">
                    {[
                        { k:"ifri", label:"IFRI", full:"Institut de Formation et de Recherche en Informatique" },
                        { k:"epac", label:"EPAC", full:"École Polytechnique d'Abomey-Calavi" },
                        { k:"fss",  label:"FSS",  full:"Faculté des Sciences de la Santé" },
                    ].map(i => (
                        <div className={`inst-card inst-card--${i.k}`} key={i.k}>
                            <div className={`inst-avatar inst-avatar--${i.k}`}>{i.label}</div>
                            <div className="inst-name">{i.label}</div>
                            <div className="inst-full">{i.full}</div>
                            <span className="badge">✅ Actif</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2 className="section__title">Ce que disent nos étudiants</h2>
                <p className="section__sub">Ils ont adopté EtuDocs</p>
                <div className="testi-grid">
                    {[
                        { q:"Plus besoin de faire la queue pendant des heures. J'ai reçu mon attestation en 2 jours !", name:"Koffi A.",   role:"IFRI · L3 Informatique", l:"K" },
                        { q:"Interface très intuitive. Le suivi en temps réel est vraiment pratique.",                   name:"Mariam S.", role:"EPAC · M1 Génie Civil",   l:"M" },
                        { q:"Enfin une solution moderne pour nos démarches administratives. Bravo !",                    name:"Yves D.",   role:"FSS · L2 Médecine",       l:"Y" },
                    ].map((t, i) => (
                        <div className="testi-card" key={i}>
                            <div className="stars">★★★★★</div>
                            <p className="testi-text">"{t.q}"</p>
                            <div className="testi-author">
                                <div className="testi-ava">{t.l}</div>
                                <div>
                                    <span className="testi-name">{t.name}</span>
                                    <span className="testi-role">{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta-band">
                <h2 className="cta-band__title">Prêt à simplifier vos démarches administratives ?</h2>
                <p className="cta-band__sub">Rejoignez les centaines d'étudiants qui ont déjà adopté EtuDocs</p>
                <a href="/register" className="btn-cta">Créer mon compte gratuitement <span>→</span></a>
            </section>

            <footer className="footer">
                <div className="footer__inner">
                    <div className="footer__top">
                        <div className="footer__brand">
                            <a href="#" className="logo" style={{ color: "#fff" }}>
                                <div className="logo__icon"><DocIcon size={18} /></div>
                                EtuDocs
                            </a>
                            <p>Vos documents universitaires, en quelques clics.</p>
                        </div>
                        <div className="footer__col">
                            <h5>Navigation</h5>
                            <a href="/login">Connexion</a>
                            <a href="/register">Créer un compte</a>
                            <a href="/faq">FAQ</a>
                        </div>
                        <div className="footer__col">
                            <h5>Institutions</h5>
                            <a href="https://ifri-uac.bj/">IFRI</a>
                            <a href="https://epac.uac.bj/">EPAC</a>
                            <a href="https://www.fss-cotonou.com/">FSS</a>
                        </div>
                        <div className="footer__col">
                            <h5>Contact</h5>
                            <a href="#">contact@etudocs.bj</a>
                            <a href="#">+229 XX XX XX XX</a>
                            <a href="#">Abomey-Calavi, Bénin</a>
                        </div>
                    </div>
                    <div className="footer__bottom">
                        <span className="footer__copy">© 2026 EtuDocs. Tous droits réservés.</span>
                        <div className="footer__legal">
                            <a href="#">Mentions légales</a>
                            <a href="#">Politique de confidentialité</a>
                            <a href="#">CGU</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
