import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyTheme, getTheme, toggleTheme, type Theme } from "@/lib/theme";

const VIS_KEY = "zotgpt-parity-chrome-visible";

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function ParityChrome({ forcedTheme }: { forcedTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(getTheme);
  const [visible, setVisible] = useState<boolean>(() => {
    const v = localStorage.getItem(VIS_KEY);
    return v === null ? true : v === "1";
  });

  useEffect(() => {
    if (forcedTheme) {
      applyTheme(forcedTheme);
      setTheme(forcedTheme);
    }
  }, [forcedTheme]);

  // Persist visibility
  useEffect(() => {
    localStorage.setItem(VIS_KEY, visible ? "1" : "0");
  }, [visible]);

  // Global keyboard shortcut: backtick (`) toggles visibility.
  // Ignored when user is typing in an input/textarea/contentEditable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) {
    return (
      <button
        type="button"
        className="parity-ghost"
        onClick={() => setVisible(true)}
        title="Show parity overlay (`)"
        aria-label="Show parity overlay"
      >
        <span className="dot" aria-hidden />
        <span className="hint">press <kbd>`</kbd> to show</span>
      </button>
    );
  }

  return (
    <div className="parity-chrome" aria-label="Parity overlay">
      <Link to="/states" title="All captured states (`)" aria-label="All captured states">
        <span aria-hidden>📋</span>
        <span className="label">States</span>
      </Link>
      <button
        type="button"
        onClick={() => {
          const next = toggleTheme();
          setTheme(next);
        }}
        disabled={Boolean(forcedTheme)}
        title={forcedTheme ? `Locked: ${forcedTheme}` : "Toggle theme"}
        aria-label="Toggle theme"
      >
        <span aria-hidden>{theme === "light" ? "🌙" : "☀️"}</span>
        <span className="label">{theme === "light" ? "Dark" : "Light"}</span>
      </button>
      <button
        type="button"
        onClick={() => setVisible(false)}
        title="Hide overlay (`)"
        aria-label="Hide overlay"
        aria-keyshortcuts="`"
      >
        <span aria-hidden>✕</span>
        <span className="label">Hide</span>
      </button>
    </div>
  );
}