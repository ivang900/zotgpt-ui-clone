import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const sanitized = useMemo(() => {
    let html = sanitizeHtml(state.raw);
    const globalMenuStr = '<div class="flex flex-row justify-between bg-brand relative z-20" id="global-menu">';
    if (html.includes(globalMenuStr)) {
      html = html.replace(
        globalMenuStr,
        globalMenuStr + `<button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-background/80 hover:text-accent-foreground h-10 absolute text-brand p-2 m-0 border-none cursor-pointer dark:text-white right-1 top-14 md:top-18" title="${isHeaderHidden ? 'reveal header' : 'hide header'}" aria-label="Toggle secondary header" id="toggle-secondary-header-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-right-close" style="transform: ${isHeaderHidden ? 'scaleX(-1)' : 'none'};"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M15 3v18"></path><path d="m8 9 3 3-3 3"></path></svg></button>`
      );
    }
    return html;
  }, [state.raw, isHeaderHidden]);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state.forcedTheme) applyTheme(state.forcedTheme);
    else applyTheme(getTheme());
  }, [state.slug, state.forcedTheme]);

  // Per-state DOM transform — runs before paint so there's no flash.
  // Re-runs whenever `sanitized` changes, since dangerouslySetInnerHTML
  // replaces the DOM children and any transform mutations would be lost.
  useLayoutEffect(() => {
    if (state.transform && wrapperRef.current) {
      state.transform(wrapperRef.current);
    }
  }, [state.slug, sanitized, state.transform]);

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

      if (button.id === "toggle-secondary-header-btn") {
        e.preventDefault();
        setIsHeaderHidden((prev) => !prev);
        return;
      }
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

  return (
    <div
      ref={wrapperRef}
      className={`state-view-wrapper ${isHeaderHidden ? "header-hidden" : ""}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
