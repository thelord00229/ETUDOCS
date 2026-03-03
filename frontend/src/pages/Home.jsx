import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import logoIfri from "../assets/IFRI.png";
import logoEpac from "../assets/EPAC.png";
import logoFss  from "../assets/FSS.png";

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

  /* ── NAV ── */
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
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.25rem;
    color: var(--navy); text-decoration: none;
  }
  .logo__img {
    width: 54px; height: 54px;
    border-radius: 12px; object-fit: contain; flex-shrink: 0;
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

  /* ── HERO ── */
  .hero {
    width: 100%;
    background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-mid) 100%);
    position: relative; 
    overflow: hidden;
    min-height: 650px;
    display: flex;
    align-items: center;
  }

  .hero__inner {
    position: relative;
    z-index: 10;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    padding: 120px 48px 140px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-block;
    background: rgba(245, 166, 35, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 166, 35, 0.3);
    color: var(--gold);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 30px;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero__left {
    position: relative;
    z-index: 2;
  }

  .hero__slides-container {
    position: relative;
    min-height: 400px;
  }

  .hero__slide {
    position: absolute;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero__slide.is-active {
    opacity: 1;
    visibility: visible;
    position: relative;
  }

  .hero__slide.is-exit-left {
    animation: slideOutLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .hero__slide.is-enter-right {
    animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes slideOutLeft {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50px);
    }
  }

  @keyframes slideInRight {
    0% {
      opacity: 0;
      transform: translateX(50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .hero__title {
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 800;
    color: var(--white);
    line-height: 1.1;
    margin-bottom: 24px;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  }

  .hero__title-highlight {
    color: var(--gold);
    display: inline-block;
  }

  .hero__sub {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.15rem;
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 560px;
    backdrop-filter: blur(10px);
  }

  .hero__cta-group {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: var(--gold);
    color: var(--white);
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    padding: 16px 32px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 30px rgba(245, 166, 35, 0.3);
    position: relative;
    overflow: hidden;
  }

  .btn-cta:hover {
    background: var(--gold-lt);
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(245, 166, 35, 0.4);
  }

  .btn-cta:hover span {
    transform: translateX(5px);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    padding: 16px 28px;
    border-radius: 12px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  /* Images statiques et grandes */
  .hero__img-panel {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 600px; /* Augmenté pour des images plus grandes */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__img-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__img {
    width: auto;
    height: 100%;
    max-width: 120%; /* Permet à l'image d'être plus grande que le conteneur */
    object-fit: contain;
    object-position: center;
    display: block;
    filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3));
    /* Animation supprimée - image statique */
  }

  .hero__dots {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 40px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.2);
  }

  .dot.is-active {
    background: var(--gold);
    border-color: var(--gold);
    width: 30px;
    transform: scale(1);
  }

  .dot.is-active::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 1px solid var(--gold);
    border-radius: 999px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  /* ── STATS ── */
  .stats {
    width: 100%; background: var(--g50);
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

  /* ── SECTIONS ── */
  .section { width:100%; padding: 80px 80px; }
  .section--gray { background: var(--g50); }
  .section__title { font-size:clamp(1.6rem,3vw,2.2rem); font-weight:800; color:var(--navy); text-align:center; margin-bottom:10px; }
  .section__sub   { color:var(--g600); font-size:1rem; text-align:center; margin-bottom:50px; }

  /* ── COMMENT ÇA MARCHE — Timeline alternée ── */
  .timeline {
    max-width: 860px;
    margin: 0 auto;
    position: relative;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 50%; top: 40px; bottom: 40px;
    width: 3px;
    background: var(--g200);
    transform: translateX(-50%);
    border-radius: 2px;
    z-index: 0;
  }
  .tl-row {
    display: grid;
    grid-template-columns: 1fr 72px 1fr;
    align-items: center;
    min-height: 140px;
    position: relative;
    z-index: 1;
  }
  .tl-particle {
    position: absolute;
    left: 50%;
    top: 40px;
    width: 14px; height: 14px;
    background: var(--gold);
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 12px var(--gold), 0 0 28px var(--gold-lt);
    animation: tlParticle 4s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
    z-index: 3;
    pointer-events: none;
  }
  @keyframes tlParticle {
    0%   { top: 40px;  opacity: 0; transform: translateX(-50%) scale(0.5); }
    10%  { opacity: 1; transform: translateX(-50%) scale(1); }
    90%  { opacity: 1; transform: translateX(-50%) scale(1); }
    100% { top: calc(100% - 40px); opacity: 0; transform: translateX(-50%) scale(0.5); }
  }
  .tl-col-left  { display:flex; justify-content:flex-end; padding-right: 28px; }
  .tl-col-right { display:flex; justify-content:flex-start; padding-left: 28px; }
  .tl-col-center {
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }
  .tl-icon {
    width: 68px; height: 68px; border-radius: 50%;
    background: var(--white);
    border: 3px solid var(--g200);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transition: border-color .3s, transform .3s, box-shadow .3s;
    cursor: default;
    flex-shrink: 0;
  }
  .tl-row:hover .tl-icon {
    border-color: var(--gold);
    transform: scale(1.12) rotate(6deg);
    box-shadow: 0 8px 28px rgba(245,166,35,.3);
  }
  .tl-card {
    background: var(--white);
    border: 1.5px solid var(--g200);
    border-radius: 14px;
    padding: 22px 24px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    transition: transform .3s, box-shadow .3s, border-color .3s;
  }
  .tl-row:hover .tl-card {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.09);
    border-color: rgba(245,166,35,.4);
  }
  .tl-badge {
    display: inline-block;
    font-family: 'Sora', sans-serif;
    font-size: 0.68rem; font-weight: 800; letter-spacing: .1em;
    padding: 4px 12px; border-radius: 20px; margin-bottom: 10px;
  }
  .tl-row:nth-child(odd) .tl-badge  { background: var(--navy); color: #fff; }
  .tl-row:nth-child(even) .tl-badge { background: rgba(245,166,35,.15); color: #d97706; }
  .tl-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:var(--navy); margin-bottom:6px; }
  .tl-desc  { font-size:.85rem; color:var(--g600); line-height:1.6; }

  /* ── INSTITUTIONS ── */
  .inst-univ { color:var(--g600); font-size:.95rem; text-align:center; margin-bottom:40px; }
  .inst-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .inst-card {
    background:var(--white); border-radius:16px; padding:36px 24px;
    text-align:center; transition:box-shadow .2s, transform .2s;
  }
  .inst-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform:translateY(-4px); }
  .inst-card--ifri { border:2px solid #1a2744; }
  .inst-card--epac { border:2px solid #0f766e; }
  .inst-card--fss  { border:2px solid #d97706; }
  .inst-logo-wrap {
    width: 90px; height: 90px; border-radius: 50%;
    margin: 0 auto 18px;
    display: flex; align-items: center; justify-content: center;
    background: var(--g50);
    border: 2px solid var(--g200);
    overflow: hidden;
    padding: 10px;
  }
  .inst-logo-wrap img {
    width: 100%; height: 100%;
    object-fit: contain;
  }
  .inst-name { font-family:'Sora',sans-serif; font-weight:700; font-size:1.1rem; color:var(--navy); margin-bottom:6px; }
  .inst-full { color:var(--g600); font-size:.85rem; line-height:1.5; margin-bottom:14px; }
  .badge { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; color:#16a34a; font-size:.8rem; font-weight:600; padding:5px 12px; border-radius:20px; }

  /* ── TESTIMONIALS ── */
  .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .testi-card { background:var(--white); border:1px solid var(--g200); border-left:4px solid var(--gold); border-radius:16px; padding:28px; transition:box-shadow .2s, transform .2s; }
  .testi-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform: translateY(-3px); }
  .stars { color:var(--gold); font-size:.9rem; letter-spacing:2px; margin-bottom:14px; }
  .testi-text { color:var(--g700); font-size:.92rem; line-height:1.7; font-style:italic; margin-bottom:20px; }
  .testi-author { display:flex; align-items:center; gap:12px; }
  .testi-ava { width:40px; height:40px; border-radius:50%; background:var(--navy); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:700; font-size:.9rem; flex-shrink:0; }
  .testi-name { font-family:'Sora',sans-serif; font-size:.9rem; font-weight:700; color:var(--navy); display:block; }
  .testi-role { color:var(--g400); font-size:.8rem; }

  /* ── CTA BAND ── */
  .cta-band {
    width: 100%;
    background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%);
    padding: 80px 48px; text-align: center;
  }
  .cta-band__title { font-size:clamp(1.6rem,3vw,2.4rem); font-weight:800; color:var(--white); margin-bottom:14px; }
  .cta-band__sub   { color:rgba(255,255,255,.7); font-size:1rem; margin-bottom:36px; }

  /* ── FOOTER ── */
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
  .footer-logo {
    display:flex; align-items:center; gap:10px;
    font-family:'Sora',sans-serif; font-weight:800; font-size:1.2rem;
    color:#fff; text-decoration:none;
  }
  .footer-logo img { width:34px; height:34px; border-radius:8px; object-fit:contain; }

  /* ── RESPONSIVE ── */
  @media (max-width:1024px) {
    .hero__inner { gap: 40px; padding: 100px 30px 120px; }
    .hero__title { font-size: clamp(2.2rem, 3.5vw, 3rem); }
    .hero__img-panel { height: 450px; }
    .testi-grid { grid-template-columns:repeat(2,1fr); }
    .footer__top { grid-template-columns:1fr 1fr; }
  }

  @media (max-width:768px) {
    .nav__inner { padding:0 20px; }
    .hero { min-height: auto; }
    .hero__inner { 
      grid-template-columns:1fr; 
      padding: 80px 20px 100px;
      gap: 40px;
    }
    .hero__img-panel { 
      height: 350px;
      order: -1;
    }
    .hero__img {
      height: auto;
      max-height: 100%;
      max-width: 100%;
    }
    .hero__title { font-size: 2.2rem; }
    .hero__sub { font-size: 1rem; }
    .hero__cta-group { flex-direction: column; align-items: stretch; }
    .btn-cta, .btn-secondary { justify-content: center; }
    .stats { grid-template-columns:1fr; }
    .stat + .stat { border-left:none; border-top:1px solid var(--g200); }
    .section { padding:60px 20px; }
    .inst-grid { grid-template-columns:1fr; }
    .testi-grid { grid-template-columns:1fr; }
    .cta-band { padding:60px 20px; }
    .footer__inner { padding:40px 20px 24px; }
    .footer__top { grid-template-columns:1fr; }
    .footer__bottom { flex-direction:column; gap:12px; text-align:center; }

    .timeline::before { left: 24px; top: 0; bottom: 0; }
    .tl-row { grid-template-columns: 56px 1fr; min-height: auto; margin-bottom: 20px; }
    .tl-col-left { display: none; }
    .tl-col-center { width: 56px; }
    .tl-icon { width: 52px; height: 52px; font-size: 1.3rem; }
    .tl-col-right,
    .tl-row:nth-child(even) .tl-col-right { padding-left: 16px; padding-right: 0; justify-content: flex-start; }
    .tl-row:nth-child(even) { grid-template-columns: 56px 1fr; }
    .tl-row:nth-child(even) .tl-col-left { display: none; }
    .tl-row:nth-child(even) .tl-col-center { order: 1; }
    .tl-row:nth-child(even) .tl-col-right { order: 2; display: flex; }
  }
`;

export default function Home() {
  const slides = useMemo(() => ([
    {
      title: "Fini les files d'attente.",
      titleHighlight: "Demandez vos documents universitaires en ligne.",
      sub: "Vos documents universitaires, en quelques clics. Plus besoin de vous déplacer, tout se fait en ligne.",
      cta: "Faire une demande",
      href: "/login",
      img: "/WhatsApp_Image_2026-03-03_at_04.31.23-removebg-preview.png",
      badge: "Nouveau"
    },
    {
      title: "Suivez chaque étape",
      titleHighlight: "en temps réel, sans stress.",
      sub: "Notifications instantanées + historique clair. Vous savez toujours où en est votre demande.",
      cta: "Se connecter",
      href: "/login",
      img: "/WhatsApp_Image_2026-03-03_at_04.31.23__1_-removebg-preview.png",
      badge: "Suivi en direct"
    },
  ]), []);

  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitSlide, setExitSlide] = useState(null);
  const [enterSlide, setEnterSlide] = useState(null);

  const goToNextSlide = () => {
    if (isAnimating) return;

    const next = (active + 1) % slides.length;
    setIsAnimating(true);
    setExitSlide(active);
    setEnterSlide(next);

    setTimeout(() => {
      setActive(next);
      setExitSlide(null);
      setEnterSlide(null);
      setIsAnimating(false);
    }, 800);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === active) return;

    setIsAnimating(true);
    setExitSlide(active);
    setEnterSlide(index);

    setTimeout(() => {
      setActive(index);
      setExitSlide(null);
      setEnterSlide(null);
      setIsAnimating(false);
    }, 800);
  };

  useEffect(() => {
    const id = setInterval(() => {
      goToNextSlide();
    }, 6000);
    return () => clearInterval(id);
  }, [active, isAnimating]);

  const steps = [
    { n:1, icon:"👤", title:"Créer un compte",         desc:"Inscrivez-vous avec votre numéro étudiant et votre email institutionnel." },
    { n:2, icon:"📋", title:"Soumettre une demande",   desc:"Choisissez votre document et uploadez les pièces justificatives." },
    { n:3, icon:"⏱",  title:"Suivre en temps réel",    desc:"Recevez des notifications par email à chaque étape de validation." },
    { n:4, icon:"📥", title:"Télécharger le document", desc:"Document certifié avec QR code d'authenticité, prêt en 48h." },
  ];

  const getSlideClass = (index) => {
    if (exitSlide === index) return "hero__slide is-exit-left";
    if (enterSlide === index) return "hero__slide is-enter-right";
    if (active === index) return "hero__slide is-active";
    return "hero__slide";
  };

  return (
      <div className="root" style={{width:"100%",maxWidth:"100%",margin:0,padding:0,boxSizing:"border-box"}}>
        <style>{css}</style>

        <nav className="nav">
          <div className="nav__inner">
            <a href="#" className="logo">
              <img src={logo} alt="EtuDocs" className="logo__img" />
              EtuDocs
            </a>
            <div className="nav__actions">
              <a href="/login"><button className="btn-ghost">Connexion</button></a>
              <a href="/register"><button className="btn-gold">Créer un compte</button></a>
            </div>
          </div>
        </nav>

        <section className="hero">
          <div className="hero__inner">
            <div className="hero__left">
              <span className="hero-badge">
                ✨ Plateforme officielle de l'UAC
              </span>

              <div className="hero__slides-container">
                {slides.map((s, i) => (
                    <div className={getSlideClass(i)} key={i}>
                      <h1 className="hero__title">
                        {s.title}{' '}
                        <span className="hero__title-highlight">{s.titleHighlight}</span>
                      </h1>
                      <p className="hero__sub">{s.sub}</p>

                      <div className="hero__cta-group">
                        <a href={s.href} className="btn-cta">
                          {s.cta}
                          <span>→</span>
                        </a>
                        <a href="/demo" className="btn-secondary">
                          <span>🎥</span>
                          Voir la démo
                        </a>
                      </div>
                    </div>
                ))}
              </div>

              <div className="hero__dots">
                {slides.map((_, d) => (
                    <button
                        key={d}
                        type="button"
                        className={`dot ${d === active ? "is-active" : ""}`}
                        onClick={() => goToSlide(d)}
                        disabled={isAnimating}
                        aria-label={`Slide ${d + 1}`}
                    />
                ))}
              </div>
            </div>

            <div className="hero__img-panel">
              <div className="hero__img-container">
                {/* Image statique qui change avec l'index actif */}
                <img
                    src={slides[active].img || ""}
                    alt={`Slide ${active + 1}`}
                    className="hero__img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats section */}
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

        {/* Comment ça marche */}
        <section className="section">
          <h2 className="section__title">Comment ça marche ?</h2>
          <p className="section__sub">Obtenez vos documents en 4 étapes simples</p>

          <div className="timeline">
            <div className="tl-particle" />
            {steps.map((s) => {
              const isOdd = s.n % 2 !== 0;
              const card = (
                  <div className="tl-card">
                    <span className="tl-badge">ÉTAPE {s.n}</span>
                    <h3 className="tl-title">{s.title}</h3>
                    <p className="tl-desc">{s.desc}</p>
                  </div>
              );
              return (
                  <div className="tl-row" key={s.n}>
                    <div className="tl-col-left">
                      {isOdd ? card : null}
                    </div>
                    <div className="tl-col-center">
                      <div className="tl-icon">{s.icon}</div>
                    </div>
                    <div className="tl-col-right">
                      {!isOdd ? card : null}
                    </div>
                  </div>
              );
            })}
          </div>
        </section>

        {/* Institutions partenaires */}
        <section className="section section--gray">
          <h2 className="section__title">Institutions partenaires</h2>
          <p className="inst-univ">Université d'Abomey-Calavi (UAC)</p>
          <div className="inst-grid">
            {[
              { k:"ifri", label:"IFRI", full:"Institut de Formation et de Recherche en Informatique", src: logoIfri },
              { k:"epac", label:"EPAC", full:"École Polytechnique d'Abomey-Calavi", src: logoEpac },
              { k:"fss",  label:"FSS",  full:"Faculté des Sciences de la Santé", src: logoFss },
            ].map(inst => (
                <div className={`inst-card inst-card--${inst.k}`} key={inst.k}>
                  <div className="inst-logo-wrap">
                    <img src={inst.src} alt={`Logo ${inst.label}`} />
                  </div>
                  <div className="inst-name">{inst.label}</div>
                  <div className="inst-full">{inst.full}</div>
                  <span className="badge">✅ Actif</span>
                </div>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        <section className="section">
          <h2 className="section__title">Ce que disent nos étudiants</h2>
          <p className="section__sub">Ils ont adopté EtuDocs</p>
          <div className="testi-grid">
            {[
              { q:"Plus besoin de faire la queue pendant des heures. J'ai reçu mon attestation en 2 jours !", name:"Koffi A.", role:"IFRI · L3 Informatique", l:"K" },
              { q:"Interface très intuitive. Le suivi en temps réel est vraiment pratique.", name:"Mariam S.", role:"EPAC · M1 Génie Civil", l:"M" },
              { q:"Enfin une solution moderne pour nos démarches administratives. Bravo !", name:"Yves D.", role:"FSS · L2 Médecine", l:"Y" },
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

        {/* CTA */}
        <section className="cta-band">
          <h2 className="cta-band__title">Prêt à simplifier vos démarches administratives ?</h2>
          <p className="cta-band__sub">Rejoignez les centaines d'étudiants qui ont déjà adopté EtuDocs</p>
          <a href="/register" className="btn-cta">Créer mon compte gratuitement <span>→</span></a>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer__inner">
            <div className="footer__top">
              <div className="footer__brand">
                <a href="#" className="footer-logo">
                  <img src={logo} alt="EtuDocs" />
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
                <a href="https://epac.uac.bj/">FSS</a>
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