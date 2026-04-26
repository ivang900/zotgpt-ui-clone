import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { applyTheme, getTheme } from "@/lib/theme";
import type { StateDef } from "@/lib/states";

/**
 * Maps captured-DOM buttons (which are inert because we strip the live JS
 * bundle) to the state slug whose capture shows them in the "open" position.
 * Match is checked against aria-label OR title, case-insensitive substring.
 */
const BUTTON_TO_SLUG: Array<{ match: string; slug: string }> = [
  { match: "Toggle menu", slug: "sidebar-open" },
  { match: "ZotGPT app switcher", slug: "app-launcher" },
  { match: "User menu", slug: "account-menu" },
  { match: "Select model", slug: "model-picker-open" },
];

/**
 * Renders one captured state verbatim. The captured HTML body is dropped into
 * the DOM via dangerouslySetInnerHTML; the imported CSS files do the styling.
 *
 * The wrapper uses `display: contents` so it disappears from the layout tree
 * — this is critical because the captured root <div id="app-root"> uses
 * `h-full`/`w-full`, which only resolve correctly if every ancestor up to
 * <html> participates in the height chain.
 */
export function StateView({ state }: { state: StateDef }) {
  const sanitized = useMemo(() => sanitizeHtml(state.raw), [state.raw]);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.forcedTheme) applyTheme(state.forcedTheme);
    else applyTheme(getTheme());
  }, [state.slug, state.forcedTheme]);

  // Intercept clicks inside the captured DOM:
  //  - <a href="/..."> → route via React Router instead of full reload
  //  - <button aria-label="…"> with no live JS → route to the slug whose
  //    capture shows that button's "open" state
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;

      // Anchor → router navigation
      const anchor = el.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && !/^(https?:|mailto:|#)/i.test(href)) {
          e.preventDefault();
          navigate(href);
          return;
        }
        return;
      }

      // Button → look up by aria-label/title
      const button = el.closest("button, [role='button']");
      if (!button) return;
      const label = (
        button.getAttribute("aria-label") ||
        button.getAttribute("title") ||
        button.textContent ||
        ""
      ).toLowerCase();

      for (const { match, slug } of BUTTON_TO_SLUG) {
        if (label.includes(match.toLowerCase())) {
          e.preventDefault();
          navigate(`/${slug}`);
          return;
        }
      }

      // Upload-files button: aria-label varies — match by visible text "Upload"
      if (/upload\s*files?/i.test(button.textContent || "")) {
        e.preventDefault();
        navigate("/upload-files-modal");
        return;
      }

      // "Reasoning" disclosure inside an assistant bubble → expanded capture
      if (
        button.getAttribute("aria-controls") === "reasoning-content" ||
        /^reasoning$/i.test((button.textContent || "").trim())
      ) {
        e.preventDefault();
        navigate("/reasoning-expanded");
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return <div className="state-view-wrapper" dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
