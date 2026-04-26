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
};

export const STATES: StateDef[] = [
  { slug: "chat-empty", title: "Chat — empty", raw: chatEmpty },
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
