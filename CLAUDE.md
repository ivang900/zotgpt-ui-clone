# CLAUDE.md — zotgpt-ui

Project: pixel-accurate recreation of `https://chat.zotgpt.uci.edu` as a static React frontend, so the user can iterate on UI in Figma and code side-by-side.

## Owner + intent

- Goal: build both a **Figma design file** and a **frontend codebase** that are mutual mirrors of the real ZotGPT Chat UI. https://chat.zotgpt.uci.edu is the design source of truth; this repo implements it in code and figma.
- Workflow: WE MUST PLAN.
    - Potential usage of playwright mcp or any other mcp thats let you open a site move around and see what it looks like.
    - Source code from inspect element. Unsure if copy full outerhtml or what option is needed
    - Screenshots from the site as a final fallback

## Status (as of 2026-04-26)

### What it is right now
A **static parity atlas**, not a live app. Every route renders one captured snapshot of the live ZotGPT UI verbatim — captured HTML body + captured compiled CSS, dropped into the DOM via `dangerouslySetInnerHTML`. No interpretive components, no rebuilt theme, no live state.

### Hard rules — DO NOT regress these
- **Never** rewrite captured HTML class strings. The captured `research/html/*.html` are the source of truth for DOM and the `research/css/*.css` are the source of truth for styling. Any divergence = parity bug.
- **Never** reintroduce a Tailwind config, `@theme inline` block, or rebuilt token system. The captured CSS already contains the compiled utilities and CSS variables.
- **Never** swap captured `<svg>` icons for Lucide / heroicons / emoji. The captured inline SVGs ship with the HTML.
- **Never** add "design improvements" (welcome heros, gradients, badges) to the static atlas. The atlas exists to be a faithful mirror; design changes happen in the redesign phase, in a separate layer.
- The previous interpretive React-component attempt was deleted on purpose. Don't recreate `src/components/ui/Button.tsx`, `TopBar.tsx`, `Sidebar.tsx`, etc. as paraphrases of the captured DOM.

### Architecture
```
research/
  html/<slug>.html        ← outerHTML captures of <body>, one per state
  css/*.css               ← compiled stylesheets pulled from /_next/static/
  assets/*.png            ← logos & avatars
  screens/                ← reference screenshots (desktop + mobile)
  tokens-{light,dark}.json← computed CSS variable dumps
src/
  styles/site/*.css       ← byte-identical copies of research/css/*.css
  styles/index.css        ← imports the four site CSS files in head order +
                            font imports + .parity-chrome overlay styles
  lib/states.ts           ← Vite ?raw imports of every captured HTML state
  lib/sanitizeHtml.ts     ← strips <script>/<link>/<noscript>, rewrites the
                            one Next.js image-optimizer URL → /assets/...
  lib/theme.ts            ← toggles class="dark" on <html>, persists in
                            localStorage
  components/StateView.tsx← renders one capture verbatim (display: contents
                            wrapper) and intercepts <a>/aria-labelled
                            buttons to route via React Router
  components/ParityChrome.tsx ← floating bottom-left overlay (states list +
                            theme toggle), pointer-events scoped so it never
                            affects captured layout
  pages/StatesIndex.tsx   ← /states — index of every captured state
  App.tsx                 ← router; / → /chat-empty, /chat/:id → chat-with-messages
public/
  assets/zotgpt-wordmark-white.png      ← from research/assets/zotgpt-header.png
  images/ZotGPT_Logo_blueavatar.png     ← from research/assets/agent-avatar.png
  images/ZotGPT_Logo_whiteavatar.png    ← from research/assets/agent-avatar.png
```

### Routes
- `/states` — index
- `/chat-empty` (default for `/`)
- `/chat-with-messages`, `/chat-with-coding-block`, `/reasoning-expanded`
- `/sidebar-open`, `/start-from-prompts`, `/upload-files-modal`
- `/model-picker-open`, `/app-launcher`, `/account-menu`
- `/mobile-sidebar-drawer` (mobile-only DOM differs from desktop)
- `/dark-chat-with-coding-block` (forced dark)

Mobile chat-empty was byte-identical to desktop (timestamps only) — responsive CSS handles it.

### Click-to-state map
Buttons in the captured DOM are inert (the live site's JS bundle is stripped on sanitize). `StateView.tsx` intercepts clicks and routes by `aria-label`/`title`/text:
- `Toggle menu` → `/sidebar-open`
- `Open ZotGPT app switcher` → `/app-launcher`
- `User menu` → `/account-menu`
- `Select model` → `/model-picker-open`
- visible text "Upload Files" → `/upload-files-modal`
- `aria-controls="reasoning-content"` (or text "Reasoning") → `/reasoning-expanded`

### Keyboard shortcuts
- **`** (backtick) — toggle the parity overlay (states + theme buttons). When hidden, a small dot in the bottom-left corner is the only thing visible; hovering it shows the shortcut hint, and clicking it (or pressing the key) brings the overlay back. Suppressed when typing in an input/textarea so the captured composer isn't hijacked. Visibility persists in `localStorage` under `zotgpt-parity-chrome-visible`.

### Tooling
- Vite 6 + React 19 + TypeScript + react-router 7. **No Tailwind CLI** — captured CSS is imported as-is.
- `npm run dev` → http://localhost:5173/
- `npm run build` → typecheck + production bundle. KaTeX font 404 warnings are expected (math fonts referenced in captured CSS that we don't ship).

### Open work / next phase
The user has approved a **hybrid** next step: keep verbatim HTML/CSS as the parity baseline, but layer small JS handlers on top of the captured DOM to bring back five interactions:
1. Composer textarea typing + submit → append captured-style user bubble + stub assistant bubble
2. Sidebar toggle → flip the open/closed class on the captured sidebar
3. Modal close (X button) → remove modal subtree
4. Dropdowns (model, style, app-launcher, account) → toggle visibility of the open subtree
5. Theme toggle — already real

Each is a small handler that operates on the captured DOM by selector. Do not introduce JSX components, do not rewrite captured class strings. If a behavior can't be added without touching captured HTML, prefer leaving it static.

### Per-state runtime DOM transforms
For redesign tweaks (removing/replacing elements, swapping copy, rewiring buttons), do **not** edit the captured HTML files under `research/html/`. Instead, attach a `transform?: (root: HTMLElement) => void` to the relevant `StateDef` in `src/lib/states.ts`. `StateView` runs the transform inside `useLayoutEffect` so the captured DOM is mutated before paint (no flash). The transform re-runs whenever `sanitized` changes, since `dangerouslySetInnerHTML` replaces children. Selectors should be precise (combine multiple class names + a text check) so they don't accidentally match other parts of the captures.

If a transform needs the click to navigate, prefer rewriting the element to an `<a href="/some-slug">` — the existing link interceptor in `StateView` already routes anchors via React Router.

Examples already in place:
- `chatEmptyTransform` — turns the green emerald "Start New Chat" pill into a "Start From Prompts" link, and removes the original underlined "Start From Prompts" sibling. Demonstrates: tag-replace + textContent change + sibling removal.

### Recent fixes
- **Layout chain** (2026-04-26): added `className="contents"` to the `StateView` wrapper. The captured `#app-root` uses `h-full`/`w-full`; without `display: contents` the wrapper broke the height inheritance from `<html>` → `<body>` → `#app-root`, collapsing all content to the top of the viewport.
- **Inert button navigation** (2026-04-26): added the aria-label/title click map above so most captured buttons feel responsive instead of dead.
- **Parity chrome** (2026-04-26): moved to bottom-left, compact icon-only by default with hover-expand label, `pointer-events: none` on container so it never absorbs clicks intended for the captured DOM.
