// Raw HTML imports (Vite ?raw)
import chatEmpty from "../../research/html/chat-empty.html?raw";
import chatWithMessages from "../../research/html/chat-with-messages.html?raw";
import chatWithCodingBlock from "../../research/html/chat-with-coding-block.html?raw";
import sidebarOpen from "../../research/html/sidebar-open.html?raw";
import modelPickerOpen from "../../research/html/model-picker-open.html?raw";
import startFromPrompts from "../../research/html/start-from-prompts.html?raw";
import uploadFilesModal from "../../research/html/upload-files-modal.html?raw";
import appLauncher from "../../research/html/app-launcher.html?raw";
import accountMenu from "../../research/html/account-menu.html?raw";
import mobileSidebarDrawer from "../../research/html/mobile-sidebar-drawer.html?raw";
import darkChatWithCodingBlock from "../../research/html/dark-chat-with-coding-block.html?raw";
import reasoningExpanded from "../../research/html/reasoning-expanded.html?raw";

export type StateDef = {
  slug: string;
  title: string;
  forcedTheme?: "light" | "dark"; // when present, overrides the user's theme for this route
  raw: string;
  /** Optional DOM transform applied AFTER the captured HTML is injected.
   *  Use this for redesign-style tweaks layered on top of a capture without
   *  modifying the source file under research/html/. */
  transform?: (root: HTMLElement) => void;
};

/** chat-empty redesign:
 *  - Drop the original underlined "Start From Prompts" link
 *  - Repurpose the green emerald "Start New Chat" pill: change its label to
 *    "Start From Prompts" and turn it into a real link to /start-from-prompts. */
const chatEmptyTransform = (root: HTMLElement) => {
  // The two pills sit side-by-side inside this row container.
  const row = root.querySelector<HTMLElement>(".flex.flex-row.space-x-2.justify-start");
  if (!row) return;

  const greenPill = row.querySelector<HTMLElement>("div.bg-emerald-100.text-emerald-800");
  if (greenPill && greenPill.textContent?.trim() === "Start New Chat") {
    // Replace the div with an anchor so the existing link interceptor in
    // StateView routes it via React Router. Preserve the visual classes.
    const link = document.createElement("a");
    link.className = greenPill.className;
    link.textContent = "Start From Prompts";
    link.setAttribute("href", "/start-from-prompts");
    link.setAttribute("aria-label", "Start From Prompts");
    greenPill.replaceWith(link);
  }

  // Remove the original underlined "Start From Prompts" sibling (it becomes
  // redundant once the green pill carries the same label + behavior).
  row.querySelectorAll<HTMLElement>("div").forEach((el) => {
    if (
      el.textContent?.trim() === "Start From Prompts" &&
      el.className.includes("underline")
    ) {
      el.remove();
    }
  });
};

export const STATES: StateDef[] = [
  { slug: "chat-empty", title: "Chat — empty", raw: chatEmpty, transform: chatEmptyTransform },
  { slug: "chat-with-messages", title: "Chat — with messages", raw: chatWithMessages },
  { slug: "chat-with-coding-block", title: "Chat — with code block", raw: chatWithCodingBlock },
  { slug: "reasoning-expanded", title: "Chat — reasoning expanded", raw: reasoningExpanded },
  { slug: "sidebar-open", title: "Sidebar open (with history)", raw: sidebarOpen },
  { slug: "model-picker-open", title: "Model picker open", raw: modelPickerOpen },
  { slug: "start-from-prompts", title: "Start From Prompts", raw: startFromPrompts },
  { slug: "upload-files-modal", title: "Upload Files modal", raw: uploadFilesModal },
  { slug: "app-launcher", title: "App launcher open", raw: appLauncher },
  { slug: "account-menu", title: "Account menu open", raw: accountMenu },
  { slug: "mobile-sidebar-drawer", title: "Mobile — sidebar drawer", raw: mobileSidebarDrawer },
  { slug: "dark-chat-with-coding-block", title: "Dark — chat with code block", forcedTheme: "dark", raw: darkChatWithCodingBlock },
];

export const STATES_BY_SLUG: Record<string, StateDef> = Object.fromEntries(
  STATES.map((s) => [s.slug, s]),
);
