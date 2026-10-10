# duPont REGISTRY Select · V4 "The Approach": working prototype (private, client presentation)

## Run

```
cd "C:\____WORK\DU PONT REGESTRY\site\v4"
python -m http.server 8744 --bind 127.0.0.1
```

Open http://127.0.0.1:8744/index.html. The inventory page is at http://127.0.0.1:8744/inventory.html, and it takes `?showroom=socal|naples|miami` and `?make=`.

Primary viewport: 1920×1080.

- **≥ 1280 px wide:** pinned, scroll-driven stage (GSAP ScrollTrigger + Lenis, all vendored).
- **< 1280 px:** an authored flow layout with no pins. This covers 1024 and 768 tablets and 390 phones.
- **Reduced motion or no JS:** static composed scenes.

## Build (only needed after content or asset changes)

```
python -I site_v1/v4/_build/prep_assets.py   # copies vendor/fonts/data/photos, cuts 1:1 crops, alpha shadows
python -I site_v1/v4/_build/gen.py           # writes index.html + inventory.html from inventory.js + v4-assets.js
```

## Scene order and scroll budget (desktop)

| # | scene | ground | device | pin |
|---|---|---|---|---|
| 01–02 | The Approach: hero F1 → F2 → F3 → the Wake → Collection F5 | ivory | the three cars advance; the Ford exits through the top; P1 is locked to its shadow | 620vh (holds 50/50/40 · F4 stop 30 · 60 + 100 cover) |
| 03 | Available now: inventory rail | graphite | slides over the held Collection; cars on one floor line, the car in focus full size, neighbours smaller (no chrome, no overlay) | 40 + 5×(12+40) + 100 cover = 400vh |
| 04 | About + Locations: V1 night map (ported) | charcoal | map rises; lamps light west → east; three cities select | 100vh (hold 70) |
| 05 | Sell your car | ivory | the photo panel travels in on its own clock; lines from opposite sides | 60vh hold |
| 06 | Services (Insurance · Service · PPF) + Finance | graphite | three panels rise at three rates | 70vh hold |
| 07 | Reviews (DEMO) | near-black | the quote's lines alternate direction | 60vh hold |
| 08 | Instagram (DEMO) | ivory | three mosaic columns travel at three rates | 100vh (hold 60) |
| 09 | Showrooms footer | near-black | cards rise as it arrives | not pinned |

Every chapter after the Approach arrives as a sheet over the held previous one; each pinned chapter adds a 100vh `cover` segment at its end (the next sheet's travel).

The motion designer works on `assets/js/scenes.js`:

- Every timeline is on `V4.tl.*`, with labels marking the holds.
- Anchor targets are on `V4.targets.*`.
- Tokens are at the top of `assets/css/v4.css`.

## QA

Run the scripts in `_qa/` (they need the server running):

- `shots.cjs` takes stop screenshots.
- `full.cjs` takes full-page screenshots.
- `func.cjs` runs filters, nav, dialog and menu.
- `record2.cjs <w> <h> <out> [dpr]` records deterministically at 30 fps: faked page clock + `?capture` exact scrub; the hero arrival, then a steady camera that eases into a pause at every reading stop (`V4.holds()`).
- `motion-qa.cjs` — overflow/errors at six widths, holds pixel-still, forward == reverse frames, resize after scroll, anchors through Lenis, fast scroll, 390 touch, reduced motion.
- `final-shots.cjs` — every scene and key transition at 1920 and 1440, flow shots at 390 → `_qa/final/`. `frametimes.cjs` — rAF stats during a real wheel scroll.

## Facts

- Inventory facts come from `data/inventory.json` via `assets/data/inventory.js`, as of 8 Oct 2026.
- Showroom facts come from `research/brand/PROVENANCE.md`.
- Reviews and Instagram are visibly labelled **DEMO**.
- Service copy, SoCal's "ET" hours label, the Miami 615 number and the social handles carry a † with one legend line per section.
- Map lamps sit on the simplified drawing's land (gen.py overrides `MAP["pts"]`); `_qa/fix1.cjs` asserts it at five widths.
