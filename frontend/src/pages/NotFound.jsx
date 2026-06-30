import { Link } from "react-router-dom";

/**
 * Page 404 — affichée pour toute route inconnue (path="*").
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "'DM Sans', sans-serif",
        color: "#1f2937",
        textAlign: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#166534" }}>404</div>
        <h1 style={{ fontSize: 22, margin: "8px 0" }}>Page introuvable</h1>
        <p style={{ color: "#64748b", marginBottom: 20 }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            background: "#166534",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
