# Uplight Labs

Central, internal home for what the corporate marketing team builds with Claude: brand styles, skills, products, templates and prompts.

## Layout

- `index.html`, `styles.css`, `app.js` — the deployable static site (no build step).
- `labs/` — the Claude Design source of the same shell.
- `labs/canvas.json` — canvas index for the design file.
- `assets/fonts/` — local-only MarkOT fonts (gitignored, see its README).

## Notes

- Deploy: import the repo in Vercel as a static site (Framework: Other, no build command, output directory blank).
- Fonts are intentionally not in this repo.
