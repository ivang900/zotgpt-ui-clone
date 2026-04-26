/**
 * Cleans a captured HTML snapshot for injection via dangerouslySetInnerHTML.
 *  - extracts body inner if a full document is present
 *  - removes <script> tags (we don't want Next.js to try to hydrate)
 *  - removes <link rel="stylesheet"> tags (CSS is imported via Vite)
 *  - rewrites image URLs from Next.js / remote paths to local /assets paths
 */

const REWRITES: Array<[RegExp, string]> = [
  // Next.js image optimizer URL for the white wordmark
  [/\/_next\/image\?url=https%3A%2F%2Fzotgpt\.uci\.edu%2FZotGPT_Logo_Whiteword_nobg\.png[^"\s]*/g, "/assets/zotgpt-wordmark-white.png"],
  // Bare references that already match local paths — leave as-is, but ensure HTML entities don't trip them
];

export function sanitizeHtml(raw: string): string {
  let html = raw;

  // If it's a full document, extract body inner
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];

  // Remove <script> tags (with or without content)
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b[^>]*\/>/gi, "");

  // Remove <link rel="stylesheet"> and <link rel="preload" as="script">
  html = html.replace(/<link\b[^>]*?>/gi, "");

  // Remove <noscript>
  html = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Rewrite image URLs
  for (const [pattern, replacement] of REWRITES) {
    html = html.replace(pattern, replacement);
  }

  return html;
}
