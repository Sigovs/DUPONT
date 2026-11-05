# V3 — plan from the manager's notes (2026-10-12). Review only — nothing coded yet.

Source: `site_v3/` = copy of the delivered V4 (`site_v1/v4/`, incl. the 10/10–10/12 tweaks: dark "All 48 cars" box,
grey Collection photos). Build scripts in `site_v3/_build/` are repointed to `site_v3/` (they used to write into
site_v1/v4 — running them from the copy would have overwritten the client's version). The delivered link stays untouched.

## Manager's notes (verbatim)
1. "Solid start… the client is going to go nuts with the scrolling. It's too much to get to each section. He's going to
   want to be able to access each section seamlessly and not have it basically show in separate sections."
2. "Inventory section — he's going to want actual vehicle tiles, not cut-outs. Move it so it's under the main homepage slider."

## What the page costs today (measured, 1920×1080)
Page = 28,844 px ≈ **26.7 screens**. Eight pinned scenes:

| Section | Starts at (screens) | Pinned length |
|---|---|---|
| Hero + Wake + Collection | 0 | **7.4 screens (740vh)** |
| Available Now (rail) | 7.4 | 4.0 |
| Locations | 11.4 | 3.25 |
| Sell | 14.7 | 1.6 |
| Services | 16.3 | 2.3 |
| Reviews | 18.7 | 1.6 |
| Instagram | 20.2 | 2.5 |
| Close (rear trio) | 22.7 | 2.2 |
| Showrooms footer | 24.9 | — |

Inventory is reached only after ~7.4 screens; the footer after ~25. Every section is its own pinned "stage" — exactly
what the manager describes as "separate sections".

## Proposed V3 (to approve before coding)
**A. Scroll budget — one continuous page, not a chain of stages**
- Target ≈ **9–11 screens** total (from 26.7). Sections flow into each other in normal scroll; motion stays but rides on
  the scroll (reveals, parallax, image slides) instead of stopping the page.
- Keep at most ONE short pin: the hero (≤ 150vh: three cars advance and part, then release). No other pins.
- Remove the Wake as a separate 170vh chapter and the 30vh F4 stop; the Collection stops being a pinned stage.
- Locations, Sell, Services, Reviews, Instagram, Close: unpinned; each ≈ 1 screen or less. Text still never moves while
  it is meant to be read (it simply isn't pinned).
- Nav anchors jump straight to each section (already wired) — with no pins in the way they land instantly.

**B. Inventory under the hero — same section, photos instead of cut-outs** (details below were options; Alex: only the photos change)
- New order: **Hero → Inventory → Collection (by marque) → About+Locations → Sell → Services → Reviews → Instagram → Showrooms**.
- Tiles use the real listing photos (full frame, not cut-outs): `assets/img/cars/` already holds 336 listing photos for
  the 48 cars; data from `assets/data/inventory.js` (price, miles, showroom, dated "as of 8 Oct 2026").
- Layout: a horizontal row of large tiles (Robb Francis "Available Now" rhythm that Alex approved — photo, model, price,
  miles, showroom, one link), scrolling sideways by drag/arrows, NOT scroll-jacked; "All 48 cars" end tile stays (dark, outline button).
- Decide: tile photos = the listing's best 3/4 frame, photo #1 excluded (baked location lockup); white-cyc frames are fine
  inside a tile — that is what tiles are.
- The hero's exit hands over to the inventory row instead of the Collection.

**C. What goes away / is kept**
- Cut-outs stay only in the hero (three cars) and possibly the closing trio — or the closing trio goes (open question).
- The ivory-floor cut-out rail is retired (manager: "not cut-outs").
- Collection (gauges + marque list) stays, unpinned, after inventory.

## Alex's answers (2026-10-12) — final scope
1. **Hero: no pin — intro on load only.** The three cars arrive with the existing ~1.9s intro, then the page scrolls normally.
2. **Inventory: keep the section as it is — only the photos change: real listing photos instead of cut-outs.**
   Move it directly under the hero. No other redesign of the inventory (not a "global question").
3. **Closing rear trio: keep, with a small entrance intro** (short, unpinned).
Everything else per section A: remove the stage-by-stage pins so the page reads as one continuous flow.

## Process
Copy is ready. On approval: designer restructures order + inventory tiles + removes pins → motion-designer re-times
light scroll-linked motion → design-critic → push as `site_v3/` (separate link; the client link `site_v1/v4/` unchanged).
