# duPont REGISTRY Select — project state (for Jarvis)

Updated 2026-10-09. Owner: Alex (GDBuro). Design system: design_dna (`C:\____WORK\_____GDBURO SIGOFF\design_dna`).

## What it is
Presentation prototype (HTML/CSS/JS + GSAP) for **duPont REGISTRY Select** — a national luxury/exotic dealer portal:
three physical showrooms, one unified inventory. Client: duPont REGISTRY. Deadline was 2026-10-09.
Showrooms (verified on dupontregistry.com, see research/brand/PROVENANCE.md):
- **West Coast** = duPont REGISTRY Select SoCal, 26900 Jefferson Ave, Murrieta, CA 92562, (951) 292-6100
- **Naples** = duPont REGISTRY Select Naples, 2365 Linwood Ave., Naples, FL 34112, (239) 449-9191
- **Miami** = duPont REGISTRY Miami, 5972 NE 4th Ave, Miami, FL 33137, (615) 471-0221 (615 area code — to confirm)

## Client brief (verbatim essentials)
Portal, multi-store / national brand. Nav: Inventory · Locations · Services ▾ (Insurance, Service, PPF) · Finance ·
About · Contact — no "Shop". SRP: sticky header, Make, Model, Sort, Keyword — **no Year**. "Current colour scheme, open
to refresh — definitely keep red, likes the dark concept." Homepage: About + Locations combined (client liked Alex's
earlier iBuy map concept), Sell Your Car (no form), Reviews, Instagram, Services, footer location cards like CMC.
Full brief: BRIEF.md.

## Current state
- **Active version: V4** in `site_v1/v4/` (index.html + inventory.html), being built after Alex authorised the build on
  2026-10-09. Hero: three front-facing cars together (Ferrari F430 · red Ford GT centre · Porsche 911 Sport Classic) on
  an ivory studio; pinned scroll — cars advance, grow, side cars leave the frame, Ford exits upward ("The Wake") and the
  Collection rises. Then: Collection, home inventory rail (behaviour borrowed from Alex's Robb Francis v3
  "Available Now."), About + Locations (map used ONCE), Sell Your Car, Services, Reviews (demo), Instagram (demo),
  Locations footer.
- Storyboard: `site_v1/v4/storyboard/` (F1–F5). Car layers are independently replaceable — Alex will supply final
  professional cut-outs; asset map documented in `site_v1/v4/ASSETS.md`.
- Colours: **Deep Red #AC1D28**, **Graphite #303137** + ivory, charcoal, warm near-black, metallic. No flat #000.
  Red measured from westcoastexoticcars.com (colour-only reference, pending client confirmation).
- Frozen, not developed further: V1 `site/`, V2 `site/v2/`, Head-On `prototype/hero-forge/`,
  Step Back `direction/hero-storyboard/`, static concepts `direction/hero-explore/`.

## Status 2026-10-09 (end of autonomous production rounds)
Live: https://sigovs.github.io/DUPONT/ . Independent design-critic (jury rubric) scored V4 6.1 → 6.6 → **7.0/10**:
"presentable to the luxury client once the intro white plates are fixed". Done: map pins on land, editorial ivory-floor
inventory rail with temp cut-outs, Sell/Services recomposed, rear-trio closing bookend, Wake 170vh, header behaviour,
all reading stops pixel-still, 0 console errors / 0 overflow at 6 widths. **Open:** intro white plate under the cars
during the clip reveal (motion round 3 was interrupted by a session limit); closing trio should rhyme with the hero
(Ford on the "SELECTED." axis, same line-mask reveal); Porsche splitter halo; Alex's final high-res cut-outs
(single swap in site_v1/v4/assets/js/v4-assets.js — see site_v1/v4/ASSETS.md). Reviews: review/v4/CRITIQUE-V4*.md (local).

## Where things live
research/ (brand, provenance, colour), data/inventory.json (48 listings with provenance), assets/source/ (dR photos),
direction/ (art-direction files), review/ (critiques, brief compliance, videos), INSPIRATION/ (Alex's AI concept
boards — layout/rhythm reference only), docs/DECISIONS.md (approved/rejected log), docs/LESSONS.md (what we learned).

## Next
Finish V4 build → motion-designer refinement → full-page scroll recording → Alex review → drop in final cut-outs →
design-critic + anti-patterns → design_dna gates only on the version Alex selects.
