# CLAUDE.md — zotgpt-ui

Project: pixel-accurate recreation of `https://chat.zotgpt.uci.edu` as a static React frontend, so the user can iterate on UI in Figma and code side-by-side.

## Owner + intent

- Goal: build both a **Figma design file** and a ** frontend codebase** that are mutual mirrors of the real ZotGPT Chat UI. https://chat.zotgpt.uci.edu is the design source of truth; this repo implements it in code and figma.
- Workflow: WE MUST PLAN. 
    - Potential usage of playwright mcp or any other mcp thats let you open a site move around and see what it looks like. 
    - Source code from inspect element. Unsure if copy full outerhtml or what option is needed
    - Screenshots from the site as a final fallback

