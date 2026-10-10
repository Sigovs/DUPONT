# TEST FINAL — full site build brief (shared by every agent)

Alex, 2026-10-09: autonomous production mode — take TEST FINAL to a presentation-ready, fully functional luxury-automotive
prototype. All 8 homepage scenes + functional inventory page. Work Implement → Render → Inspect → Critique → Improve → Retest.
Visual quality first; never self-certify from automated checks.

## Read first (binding)
- `C:\____WORK\DU PONT REGESTRY\CLAUDE.md` — Feedback log (every rejection there applies to you).
- `_____TEST FINAL\BRIEF-REBUILD.md` (8 scenes, nav, SRP rules), `STRUCTURE-REFS.md`.
- design_dna `C:\____WORK\_____GDBURO SIGOFF\design_dna` (authoritative: academic-composition, typography-taste,
  color-taste, spacing-taste, motion-judgment → motion-taste → gsap-implementation, content-provenance, anti-patterns).
- The hero `_____TEST FINAL\hero\` = the visual system's source (tokens, Bodoni Moda + Manrope, red blade at 16% lean,
  120px gutter, staircase side text entrances, ivory hairline callouts). Your section must look like the same site.

## Alex's standing rules (short form)
- Judge the SEQUENCE: one grid, one rhythm, one visual row across the whole page — not isolated pretty frames.
- Text in a section keeps one constant slot; it enters as a staircase slide from the side (line by line), exits the
  other way, and holds fully still and opaque ≥40vh in any pinned stop. Text never touches photos/cars/viewport edges.
- Transitions: Czinger-style ANGLED clip-path slide-in/out (16% lean) is the house cut; the red blade (#AC1D28 solid
  field, hard edges) is the signature device — use it sparingly (not in every section). Vary motion by composition:
  photos rising from below, panels entering from the side they belong to, sticky image with scrolling column, etc.
  No cheap fades as the default, no bounces/spins/random zooms, no empty transitional screens.
- Photos: real duPont REGISTRY images on disk only (`_____TEST FINAL\assets\source`, `..\assets\source`, data in
  `_____TEST FINAL\data\inventory-rebuild.json`). NO blur, feather, vignette, scrim, darkening, gradient overlays,
  mirroring, distortion, generated imagery, paid services. Legibility from the photo's own dark zone or from type on
  solid ground. Prefer dark/low-key frames and close-ups; white-cyc listing frames read as "catalogue" unless composed
  (letterbox band, tight crop). Keep images modular (one variable/attribute to swap).
- Colours: Deep Red #AC1D28 (fills/CTA/blade only; never thin red text on dark — fails contrast), Graphite #303137,
  charcoal #1D1E22, warm near-black #151413, silver #B9BBC0, ivory #F2EEE6. Never #000.
- Facts: only from inventory-rebuild.json / PROVENANCE files, dated "as of 8 Oct 2026". Unverified = visible
  [bracketed placeholder]. Never invent reviews, prices, hours, promises. Miami phone (615) 471-0221 = as in data.
- Nav: Inventory · Locations · Services ▾ (Insurance, Service, PPF) · Finance · About · Contact. No "Shop". No Year
  filter on the SRP.

## Module contract (so agents never collide)
- You own ONLY your folder(s) `_____TEST FINAL\site\sections\NN-name\` (+ any page you are told to own, e.g.
  `site\inventory.html`). Never edit another section, `assets\js\core.js`, `assets\css\tokens.css`, or `_build\gen.py`
  (ask the orchestrator in your report if the shared layer needs a change).
- `section.html`: one `<section id="name" data-section="NN-name" class="s-name">`; `section.css`: every selector scoped
  under `.s-name`; `section.js`: `Select.register('NN-name', function (ctx) {...})` using ctx.gsap / ctx.ScrollTrigger /
  ctx.lenis — NEVER create Lenis, gsap.ticker loops or requestAnimationFrame loops; use `gsap.context(..., ctx.el)`.
  If `ctx.reduced`, build the designed static state.
- Section-local images go in `sections\NN-name\img\` (optimised WebP/JPEG, ≤1920 wide, copies — never move sources).
- Build with `python site\_build\gen.py` → `site\index.html` and `sections\NN-name\demo.html` (your standalone page).
- Serve with `python -m http.server <your port> --bind 127.0.0.1` from `_____TEST FINAL\site\` (each agent its own
  port, stop it when done). Playwright: `require('C:/____WORK/_____GDBURO SIGOFF/design_dna/node_modules/playwright')`.

## QA you must do on your section (demo.html, true CSS viewport)
1920×1080, 1440, 1024, 768, 390: screenshots of every hold + key transition states (25/50/75%), forward and reverse
scroll; overflow 0; console errors 0; failed requests 0; per-glyph contrast on the composited render; pinned text
pixel-stable during holds; reduced-motion screenshot. Put them in `sections\NN-name\_qa\` plus a left-to-right
`filmstrip.jpg`. Look at every frame yourself as an Art Director; redesign weak frames before reporting.
Report: what you built, screenshots paths, measurements, deviations, honest weakest point. No essay.
# Asset paths: always {P}sections/... — never root-absolute (/sections/...): GitHub Pages serves the site under a sub-path.
