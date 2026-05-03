import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import logoIfri from "../assets/IFRI.png";
import logoEpac from "../assets/EPAC.png";
import logoFss from "../assets/FSS.png";

// px  → fixe, ne change jamais          → bordures, arrondis, ombres
// rem → relatif à html (1rem = 16px)    → textes, padding, margin
// em  → relatif au parent               → à éviter au début
// vh  → 1% de la hauteur de l'écran     → sections plein écran
// vw  → 1% de la largeur de l'écran     → layouts larges, typo fluide
// %   → relatif au parent direct        → largeurs, colonnes
// ── CONSEILS ──
// 1. Utiliser rem pour la typographie et les espacements principaux
// 2. Utiliser px pour les éléments décoratifs et les détails de design
// 3. Utiliser vh/vw pour les sections qui doivent s'adapter à la taille de l'écran
// 4. Éviter d'utiliser em au début, car il peut être déroutant pour les débutants
//1rem = 16px

// /* =========================
//    MÉMO : :first-child vs :first-of-type
//    ========================= */

// /* :first-child
//    → sélectionne un élément s’il est le TOUT PREMIER enfant de son parent
// */
// p:first-child {
//   /* marche seulement si <p> est le premier élément */
// }

// /* :first-of-type
//    → sélectionne le premier élément d’un type donné (ex: premier <p>)
//    même s’il n’est pas le premier enfant
// */
// p:first-of-type {
//   /* premier <p> du parent */
// }

// /* =========================
//    ⚠️ ERREUR CLASSIQUE
//    ========================= */

// /* ❌ Ceci ne veut PAS dire "premier enfant dans .parent" */
// .parent:first-child {
//   /* signifie : .parent est le premier enfant de son parent */
// }

// /* ✅ Pour cibler le premier enfant DANS .parent */
// .parent :first-child {
//   /* premier enfant à l’intérieur */
// }

// /* ✅ Plus précis (recommandé) */
// .parent p:first-child {
//   /* premier <p> dans .parent */
// }

// .faq-question.active .faq-question-down {
//   max-height: 200px;
// }

// 👉 Ça veut dire :

// “Quand un élément .faq-question a la classe active, alors son enfant .faq-question-down prend une hauteur maximale de 200px”

// /* =========================
//    🧠 ASTUCE
//    ========================= */
// /*
// :first-child  → position (1er élément)
// :first-of-type → type (1er parmi ses semblables)
// */

const styles = `

  /* ── LAYOUT ── */
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;

  }

  .nav {
    display: flex;
    flex-direction: row;
    align-items:center;
    justify-content:space-between;
    padding: 16px 52px; 
  }

  #after{

  }

  .nav__logo {
    width: 56px;
    height: 56px; 
    object-fit: contain;
    border-radius: 10px;
  }
  .nav_products {
    display: flex;
    flex-direction: row;
    gap:2.5rem;
    font-size: 0.9rem;
  }

  .nav__buttons {
    font-size: 1rem;
  }

  .nav__buttons--login {

  }

  #nav_button {
    background-color: #2e7d32;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  #nav_button:hover {
    background-color: #1b4d1b;
  }
   
  .nav_products a::after {
    content: "";
    display: block;
    width: 0;
    height: 2px;
    background: #2e7d32;
    transition: width 0.7s;
  }
  .nav_products a:hover::after {
    width: 100%;
  }

  /* ── HERO ── */
  .hero {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 3rem 4rem;
    gap:25px;
  }

  .hero__content {

  }
  .hero_content_left {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 800px;
    width: 80%;
    margin-left:1rem; 
  }

  .hero__content h1 {
    font-weight: 800;
    font-size: 2rem;
    color: #2e7d32;
    letter-spacing: -0.3px;
    line-height: 1.2;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeSlideUp 0.8s ease forwards;
  }

  @keyframes fadeSlideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
    
  #hero_content_left_h1{
     width:100%;
     animation-delay: 0.2s;
  }
  #hero_content_left_h2{
   margin-top: -0.5rem;
    text-align:center;
     animation-delay: 0.5s;
  }

  .hero__content p {
    font-size: 1rem;
    text-align: center;
    opacity: 0;
    animation: fadeIn 0.6s ease 1s forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  
  .hero_buttons{
    display: flex;
    flex-direction: row;
    justify-content:center;
    align-items:center;
    gap: 3rem;
    border-radius: 8px;
    }

  #hero_button_1 {
    background-color: #2e7d32;
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  #hero_button_1:hover {
    background-color: #1b4d1b;
  }
  #hero_button_2 {
    background-color: transparent;
    color: #2e7d32;
    border: 2px solid #2e7d32;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  #hero_button_2:hover {
    background-color: #2e7d32;
    color: #fff;
  }

  .hero_photo {
    width:45%;
    display: flex;
    justify-content: center;
  }
  .hero_photo img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    opacity: 0;
    transform: scale(0.9);
    animation: fadeScale 0.8s ease 0.8s forwards;
  }

  @keyframes fadeScale {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }


  .stats table {
    width: 100%;
    border-collapse: collapse;
  }
  .stats th, .stats td {
    border: 2px solid #000;
    padding: 1rem;
    text-align: center;
  }
  .stats th {
    color:black;
  }
   
  tbody td {
    color:var(--uac-green);
    }

  // .hero_content_left h1:first-of-type {
  //   animation-delay: 0.2s;
  // }
  // .hero_content_left h1:nth-of-type(2) {
  //   animation-delay: 0.5s;
  // }

  .hero_buttons {
    opacity: 0;
    animation: fadeIn 0.6s ease 1.3s forwards;
  }

  .bouton-etudocs {
    background-color:var(--benin-yellow);  
    color: #000;
    border: none;
    padding: 0.3rem 1rem;
    border-radius: 10px;
    text-align: center;
    font-size: 0.7rem;
    margin-left: 50%;
    cursor: auto;
    transform: translateX(-50%);
    transition: transform 0.3s ease;
  } 
  
  .bouton-etudocs:hover {
    transform: translateX(-50%) scale(1.05) rotate(-3deg);
  }

  .services {
    margin-top: 3rem;
    }

  .services button {
    background-color:var(--benin-yellow);  
    color: #000;
    border: none;
    padding: 0.2rem 0.8rem;
    border-radius: 10px;
    text-align: center;
    font-size: 0.7rem;
    cursor: auto;
    transition: transform 0.3s ease;
  } 
  .services-content-right button:first-child {
      width: 22%;
}
  .services button:hover {
    transform: translateX(-50%) scale(1.05) rotate(-3deg);
  }  

  .services_content_up {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width:100%;
    justify-content: center;
    align-items: center;}

  .services_content_up h2 {
    font-size: 1.5rem;
    font-weight: 450;
    color: var(--uac-green);
  }

  .services_content_up p {
    font-size: 1rem;
    position: inline-block;
  }

  .services_content_down {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    }
  .services_content_down_item_1 {
    display: flex;
    flex-direction: row;
    margin-top: 2rem;
    justify-content: center;
    align-items: center;
    gap:5rem;
}
    .services-content-right {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }
    .services-boutons{
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 3rem;
      margin-top: 1rem;
      z-index: 1;
    }

    .services-container-photo {
      width:30%;
      height:450px;
      background-color:#ffffff;
      border-radius: 8px;
      border: 5px solid #f0f0f0;
}
      
#working{
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

 iframe {
  width: 760px;
  height: 450px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

}

#faq{
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

#faq h1 {
text-align: center;
transform: translateX(-50%);
color: var(--uac-green);

}

#faq-real{
  width:80%;
  margin-top:2rem;
  display:flex;
  flex-direction:row;
  gap:3.5rem;
  min-height:500px;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  padding-bottom: 2rem;
}

#faq-images {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

#faq-images img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

#faq-questions{ 
 display:flex;
 flex-direction:column;
 gap:1rem;
 width:50%;
 margin-top:1rem;
 margin-left:1rem;

}
.faq-question {
  background-color:transparent;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction:column;  
  font-size: 0.75rem;
}
.faq-question-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.faq-question-down {
  max-height: 0;
  overflow: hidden;
  transition: max-height 1.2s ease-out;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #555;
}

.faq-question.active .faq-question-down {
  max-height: 200px;
}

.faq-question-header button {
  font-size: 0.9rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 1.2s ease;
}

.faq-question.active .faq-question-header button {
  transform: rotate(45deg);
}

#before-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width:100%;
  justify-content: center;
  margin-top: 5rem; 
  align-items: center;
}
#before-footer h2 {
  font-size: 1.5rem;
  font-weight: 450;
  text-align: center;
  color: var(--uac-green);
}
#before-footer p {
  font-size: 1rem;
  text-align: center;
} 

#footer {
  margin-top: 3rem;
  padding: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap:2rem;
  margin-bottom: 1rem;
  width:80%;
  margin-left:10%;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  box-shadow: 0 2px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  }

  #footer p {
    font-size: 0.8rem;
    color: #555;
  }

#footer a {
    color: #555;
    text-decoration: none;
    font-size: 0.8rem;
    transition: color 0.3s ease;
  }  
#footer h6 {
   font-size: 0.8rem;
    font-weight: 500;
    color: var(--uac-green);
    margin-bottom: 0.5rem;
  }  

#footer a:hover {
    color: var(--uac-green);
  }

#footer1 {
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap:0.6rem;
    font-size: 0.9rem;
  }

#footer1 h6 {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--uac-green);
  }

#footer1-content{
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
`;

const Landingpage = () => {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.setAttribute("data-page", "landingpage");
    tag.innerHTML = styles;
    document.head.appendChild(tag);

    return () => {
      document.head.removeChild(tag);
    };
  }, []);
  const faqData = [
    {
      question: "Comment puis-je accéder à mes documents universitaires ?",
      answer:
        "Vous pouvez accéder à vos documents universitaires en vous connectant à votre compte sur notre plateforme. Une fois connecté, vous trouverez une section dédiée où tous vos documents seront disponibles en quelques clics.",
      img: logoEpac,
    },
    {
      question: "Quels types de documents sont disponibles ?",
      answer:
        "Nous proposons une large gamme de documents universitaires, y compris des attestations, des relevés de notes, des certificats et bien plus encore. Tous les documents sont authentifiés avec QR code pour garantir leur validité.",
      img: logoIfri,
    },
    {
      question: "Comment puis-je suivre le statut de ma demande ?",
      answer:
        "Vous pouvez suivre chaque étape du traitement de votre demande en temps réel. Notre plateforme vous enverra des notifications instantanées pour vous tenir informé de l'avancement de votre demande jusqu'à sa validation.",
      img: logoIfri,
    },
    {
      question: "Puis-je imprimer mes documents ?",
      answer:
        "Oui, vous pouvez imprimer vos documents universitaires directement depuis notre plateforme. Assurez-vous d'avoir un imprimante connectée à votre ordinateur.",
      img: logoEpac,
    },
    {
      question: "Comment puis-je contacter le support ?",
      answer:
        "Vous pouvez contacter notre support à tout moment via le formulaire de contact disponible dans votre espace utilisateur. Notre équipe est là pour vous aider 24h/24 et 7j/7.",
      img: logoIfri,
    },
  ];
  const [openIndex, setOpenIndex] = useState(0);

  const onfaqClick = (index) => {
    setOpenIndex(openIndex === index ? 0 : index);
  };

  return (
    <div className="page">
      <section className="nav">
        <div className="nav__logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="nav_products">
          <a href="">Fonctionnalités</a>
          <a href="#working">Comment ça marche ?</a>
          <a href="">Contact</a>
        </div>
        <div className="nav_buttons">
          <a href="/login" className="nav__buttons--login">
            <button id="nav_button">Se connecter</button>
          </a>
        </div>
      </section>
      <section className="hero">
        <div className="hero__content">
          <div className="hero_content_left">
            <h1 id="hero_content_left_h1">Suivez chaque étape en temps</h1>
            <h1 id="hero_content_left_h2">réel sans stress</h1>
            <p>
              Stop managing reservations on WhatsApp. Plateforme de réservation
              locale Africaine lets professionals across West Africa accept
              bookings and receive Mobile Money payments automatically. Simple,
              fast, and built for Africa.
            </p>
            <div className="hero_buttons">
              <a href="">
                <button id="hero_button_1">Se connecter</button>
              </a>
              <a href="#working">
                <button id="hero_button_2">See how it works</button>
              </a>
            </div>
          </div>
        </div>
        <div className="hero_photo">
          <img
            src="src\assets\screencapture-localhost-5173-dashboardEtu-2026-04-10-00_04_43 1.png"
            alt="image_principale"
          />
        </div>
      </section>
      <section>
        <button className="bouton-etudocs">Etudocs</button>
      </section>
      <section className="services">
        <div className="services_content">
          <div className="services_content_up">
            <h2 id="services_content_up_h1">Suivez chaque étape en temps</h2>
            <h2 id="services_content_up_h2">réel sans stress</h2>
            <p>
              La nouvelle solution pour avoir tous vos documents universitaires
              en quelques clics.
            </p>
          </div>
        </div>
        <div className="services_content_down">
          <div className="services_content_down_item_1">
            <div className="services-container-photo">
              <img src="" alt="" />
            </div>
            <div className="services-content-right">
              <button className="services-bouton">Accès</button>
              <h3>Documents disponibles</h3>
              <p>
                Accédez à tous vos documents universitaires en quelques clics :
                attestations, relevés de notes, certificats et bien plus encore.
              </p>
              <div className="services-boutons">
                <button className="services-bouton">Dossiers</button>
                <button className="services-bouton">Archives</button>
              </div>
            </div>
          </div>
          <div className="services_content_down_item_1">
            <div className="services-content-right">
              <button className="services-bouton">Statut</button>
              <h3>Suivi en temps réel</h3>
              <p>
                Suivez chaque étape du traitement de votre demande et recevez
                des notifications instantanées jusqu’à la validation.
              </p>
              <div className="services-boutons">
                <button className="services-bouton">Notifications</button>
                <button className="services-bouton">Etapes</button>
                <button className="services-bouton">Progression</button>
              </div>
            </div>
            <div className="services-container-photo">
              <img src="" alt="" />
            </div>
          </div>
          <div className="services_content_down_item_1">
            <div className="services-container-photo">
              <img src="" alt="" />
            </div>
            <div className="services-content-right">
              <button className="services-bouton">Authenticité</button>
              <h3>Documents disponibles</h3>
              <p>
                Tous vos documents sont authentifiés avec QR code et protégés
                pour garantir leur validité et éviter toute falsification.
              </p>
              <div className="services-boutons">
                <button className="services-bouton">QR Code</button>
                <button className="services-bouton">Protection</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="working">
        <div className="services_content">
          <div className="services_content_up">
            <h2 id="services_content_up_h1">Comment ça marche ?</h2>
            <p>
              Stop managing reservations on WhatsApp. Plateforme de réservation
              locale Africaine lets professionals
            </p>
          </div>
        </div>
        <div>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/NETb44ylBak?si=gdbSmS_kAGDK_eBl"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </section>
      <section id="faq">
        <div className="services_content">
          <div className="services_content_up">
            <h2 id="services_content_up_h1">FAQs</h2>
            <p>
              Stop managing reservations on WhatsApp. Plateforme de réservation
              locale Africaine lets professionals
            </p>
          </div>
        </div>
        <div id="faq-real">
          <div id="faq-questions">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`faq-question ${openIndex === index ? "active" : ""}`}
                onClick={() => onfaqClick(index)}
              >
                <div className="faq-question-header">
                  <p>{item.question}</p>
                  <button>{openIndex === index ? "×" : "+"}</button>
                </div>
                <div className="faq-question-down">
                  <p className="faq-question-answer">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div id="faq-images">
            <img src={faqData[openIndex ?? 0].img} alt="" />
          </div>
        </div>
      </section>
      <section id="before-footer">
        <h2 id="services_content_up_h1">Demarre maintenant avec Etudocs</h2>
        <p>Gère tes document aisément</p>
        <button id="nav_button">Commencer</button>
      </section>
      <section id="footer">
        <div id="footer1">
          <h6>Etudocs</h6>
          <p>
            La nouvelle solution pour avoir tous vos documents universitaires en
            quelques clics
          </p>
          <div id="footer1-content">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-linkedin-in"></i>
          </div>
        </div>
        <div className="footer-content">
          <h6>Navigation</h6>
          <ul>
            <li>
              <a href="#home">Accueil</a>
            </li>
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#working">Comment ça marche ?</a>
            </li>
            <li>
              <a href="#faq">FAQs</a>
            </li>
          </ul>
        </div>
        <div className="footer-content">
          <h6>Mentions légales</h6>
          <ul>
            <li>
              <a href="#privacy">Politique de confidentialité</a>
            </li>
            <li>
              <a href="#terms">Conditions d'utilisation</a>
            </li>
            <li>
              <a href="#mentions">Mentions</a>
            </li>
          </ul>
        </div>
        <div className="footer-content">
          <h6>Contact</h6>
          <a href="mailto:contact@etudocs.com">contact@etudocs.com</a>
        </div>
      </section>
    </div>
  );
};

export default Landingpage;
