import { Link } from "react-router-dom";
import { STATES } from "@/lib/states";
import { applyTheme, getTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export function StatesIndex() {
  // Default to light on the index page
  useEffect(() => { applyTheme(getTheme()); }, []);
  const [theme, setTheme] = useState(getTheme);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.5rem",
        background: "var(--background, #fff)",
        color: "var(--foreground, #090909)",
        fontFamily: "Poppins, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
            ZotGPT — captured states
          </h1>
          <button
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              applyTheme(next);
              setTheme(next);
            }}
            style={{
              padding: "0.5rem 0.875rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            theme: {theme}
          </button>
        </header>
        <p style={{ color: "#71717a", fontSize: 14, marginBottom: "1.5rem" }}>
          Each state below is rendered from the verbatim HTML capture under{" "}
          <code>research/html/</code> against the verbatim CSS under{" "}
          <code>research/css/</code>. No interpretive components.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {STATES.map((s) => (
            <li key={s.slug}>
              <Link
                to={`/${s.slug}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--border, #e4e4e7)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "inherit",
                  background: "var(--card, #fff)",
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {s.title}
                  {s.forcedTheme === "dark" && (
                    <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 6px", background: "#0b1220", color: "#fff", borderRadius: 4 }}>
                      dark
                    </span>
                  )}
                </span>
                <code style={{ fontSize: 12, color: "#71717a" }}>/{s.slug}</code>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
