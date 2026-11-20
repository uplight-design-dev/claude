# Uplight Labs

Central, internal home for what the corporate marketing team builds with Claude: brand styles, skills, components, products, templates and prompts.

## Structure

- `index.html`, `styles.css`, `app.js` — the static site shell (no build step).
- `components.js` — source for every component on the Components pages. The live preview and the code shown on each page both come from this file.
- `assets/fonts/` — MarkOT Book, Medium and Bold.
- `labs/` — the original Claude Design source of the shell (reference only).

## Deploy

Import the repo in Vercel as a static site: Framework Preset **Other**, no build command, output directory blank. Every push to `main` redeploys.

## Add a page

Add a `<section class="page" data-id data-group data-title data-desc>` in `index.html`. Add `data-soon` for an empty placeholder or `data-tag="New"` for a badge. To add a component, add an entry to `components.js` and a section with `data-component` set to its key.
