import { useState, useEffect } from "react";

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return getSystemTheme();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      root.style.setProperty("--bg", "#121212");
      root.style.setProperty("--bg-secondary", "#1e1e1e");
      root.style.setProperty("--text", "#e0e0e0");
      root.style.setProperty("--text-muted", "#a0a0a0");
      root.style.setProperty("--border", "#333");
      root.style.setProperty("--white", "#1e1e1e");
    } else {
      root.style.setProperty("--bg", "#f8fafc");
      root.style.setProperty("--bg-secondary", "#ffffff");
      root.style.setProperty("--text", "#1a2744");
      root.style.setProperty("--text-muted", "#64748b");
      root.style.setProperty("--border", "#e2e8f0");
      root.style.setProperty("--white", "#ffffff");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggleTheme };
}

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light", icon: "fa-sun", label: "Clair" },
    { id: "dark", icon: "fa-moon", label: "Sombre" },
    { id: "system", icon: "fa-desktop", label: "Système" },
  ];

  const styles = {
    toggle: {
      display: "flex",
      background: "var(--g200, #e5e5e5)",
      borderRadius: "20px",
      padding: "3px",
      gap: "3px",
    },
    btn: {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.85rem",
      color: "var(--text-muted, #666)",
      transition: "all 0.2s ease",
    },
    btnActive: {
      background: "var(--bg-secondary, #fff)",
      color: "var(--text, #333)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    },
  };

  return (
    <div className={className || ""} style={styles.toggle}>
      {themes.map((t) => (
        <button
          key={t.id}
          style={{
            ...styles.btn,
            ...(theme === t.id ? styles.btnActive : {}),
          }}
          onClick={() => setTheme(t.id)}
          aria-label={`Mode ${t.label}`}
          title={t.label}
        >
          <i className={`${t.id === "system" ? "fa-solid" : "fa-regular"} ${t.icon}`}></i>
        </button>
      ))}
    </div>
  );
}