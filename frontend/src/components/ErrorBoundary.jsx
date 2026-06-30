import { Component } from "react";

/**
 * Frontière d'erreur globale : capture les exceptions de rendu React
 * pour éviter l'écran blanc total et présenter une UI de repli.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // En dev, on garde la trace en console ; en prod, le drop esbuild la retire.
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Une erreur est survenue</h1>
          <p style={{ color: "#64748b", marginBottom: 20 }}>
            Quelque chose s'est mal passé. Vous pouvez recharger la page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: "#166534",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
}
