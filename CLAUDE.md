# duPont REGISTRY Select — presentation prototype

Brief: [BRIEF.md](BRIEF.md). Deadline 2026-10-09. Primary viewport 1920×1080.

Design system: design_dna at `C:\____WORK\_____GDBURO SIGOFF\design_dna` (TASTE.md → skills →
.claude/rules/design-dna.md → dialect; `scroll-site` entry for the cinematic build). design_dna is authoritative.
Agent order: brand-extractor → art-director (approval gate) → designer → motion-designer → design-critic → project-recorder.
External skills: **authorized 2026-10-08** as supporting specialists (see BRIEF.md update) — never override design_dna.

## Layout
- `research/` — brand extraction, provenance, reference screens (no design decisions)
- `direction/` — Art Direction package (art-director only)
- `assets/source/` — original client photography (dupontregistry.com, client-authorised, private prototype only)
- `data/` — local structured inventory with provenance
- `site/` — the prototype (designer / motion-designer)

## Feedback log
- **Jarvis memory (2026-10-09):** repo https://github.com/Sigovs/DUPONT (PUBLIC — Alex's choice; media ignored).
  Jarvis reads PROJECT.md, BRIEF.md, CLAUDE.md, docs/*.md, research/*.md from git HEAD. Keep PROJECT.md,
  docs/DECISIONS.md and docs/LESSONS.md current (≤6000 chars each) and commit + push after each major decision.
  **Repo carries ONLY the current version (V4) + memory docs/brief/data** — older versions stay local (.gitignore).
- **US map: ONCE per page (Alex, 2026-10-09)** — V4 used it ~4 times. Only in About + Locations; no map crops in footer
  cards, no map silhouettes as decoration/backgrounds elsewhere.
- **Home inventory reference authorised by Alex (2026-10-09):** the "Available Now." section of his build
  https://sigovs.github.io/robb-francis-v2/v3.html — pinned scene, horizontal scroll-driven card rail, focused card
  larger/lit, neighbours dimmed. Behaviour + layout only; no content/assets/data from that project.
- **INSPIRATION/ (Alex, 2026-10-09):** use it for LAYOUT, COMPOSITION, visual rhythm and pacing of sections — not for
  its pictures (AI-generated, never used/imitated as photos).
- **V4 BUILD AUTHORISED (2026-10-09): stop iterating storyboards — build the complete functional prototype in
  site/v4/.** Storyboard = working foundation, not locked. All sections, fullscreen scroll-driven scenes, GSAP
  ScrollTrigger, directional type, seamless transitions. Car assets independently replaceable; don't improve temp masks
  or resolution (Alex supplies finals). Don't ask approval per frame/section — decide and keep building. Deliver working
  browser prototype + functional nav + full-page scroll recording.
- **V4 refinement (2026-10-09):** F1 promising, NOT final. Three front-facing cars: Ferrari + red Ford GT (centre,
  slightly forward) + **Porsche (replaces 458 Speciale)**; depth via overlap, unequal sizes, cars higher and more
  present, less dead space between type and cars, type + cars = ONE composition. Headline "THE REGISTRY. SELECTED."
  competes with the cars — refine hierarchy. Ivory hero = approved working colour direction. Choreography: pinned; all
  three advance, scale/relationships evolve, side cars leave the viewport, centre car approaches and exits, Collection
  revealed; text slides directionally. **F3/F4/F5 rejected — rethink**: no floating squares/cards/miniature photos, no
  empty transitional screens; Collection = large integrated photography, asymmetry, cinematic crops, not white plates on
  graphite cards. Temporary cut-outs only — Alex will supply final cut-outs; each car an independently replaceable layer.
  Deliverable: F1–F5 1920×1080 + contact sheet; no animation, no rest-of-site until he reviews.
- **TEST FINAL static frames reviewed (Alex, 2026-10-09):** almost all REJECTED as garbage — hero S1–S4, the six-car
  white-cyc Registry stage, bench, Locations, Voice, Journal. Kept FOR NOW (not approved): 08 "Visit a Select showroom"
  (3/10, unfinished), 05 "Beyond the drive" (1/10 — must become a STICKY IMAGE with the column scrolling past), 04 Sell
  (parked). Lesson: never resume from an on-disk storyboard without reconciling it with the latest feedback. Next: HERO ONLY.
- **TEST FINAL hero direction (Alex, 2026-10-09):** TEST FINAL is its own version — never build it from V4. Alex likes how
  his own Prestige, Vegas, Czinger and Pagani builds were done (dark, full-bleed, cinematic, editorial type over the photo,
  chapter index) — the ivory cut-out trio "has nothing in common" with them (moved to `_rejected/hero-trio-ivory/`).
  Hero photography = dark close-ups (his choice). `INSPIRATION/` (AI boards) = LAYOUT, COMPOSITION and VISUAL MOOD only,
  never the pictures. Inventory scene later: https://sigovs.github.io/robb-francis-v2/v3.html "turned out well".
  Chapter transitions = Czinger-style ANGLED slide-in/slide-out (slanted clip-path, scrubbed), not vertical rises.
  Chapter TEXT stays in ONE constant slot on every chapter — never jumps between positions; photos are re-framed to it.
- **V4 (2026-10-09) — `site/v4/`, completely separate; V1/V2/Head-On/Step Back untouched.** Forge interaction principles.
  HERO: exactly THREE front-facing exotic cars TOGETHER in one composition; on scroll they move toward the viewer, grow
  and exit the frame, revealing the next fullscreen scene. No slideshow/image swap/symmetrical wipe. Whole homepage:
  fullscreen scroll-driven sections, pinned scenes, images moving independently, large photo panels travelling
  vertically, directional text, choreographed transitions, distinct compositions. Sections: Hero, Collection, About +
  Locations (SoCal/Naples/Miami), Sell Your Car, Services (Insurance/Service/PPF), Reviews, Instagram, Locations footer.
  Colours #AC1D28 / #303137 + charcoal, metallic silver, soft ivory; no flat pure black. **Storyboard (hero + transition
  into next section) first, inside site/v4/; no code/GSAP until Alex approves.**
- **STEP BACK STORYBOARD REJECTED ENTIRELY (2026-10-09):** "rearranged inventory photographs, not a premium automotive
  digital experience" — the repeated mistake is elaborate transitions on visually ordinary layouts. No coding, animation
  planning or detailed technical QA. Visual design first. Root cause found: Forge rests on commissioned low-key
  photography; our downloaded dR photos are 124/146 bright white-cyc (direction/forge-analysis/ANALYSIS.md).
- **Head-On hero REJECTED (2026-10-08):** repeated centred frontal cars plus a symmetrical centreline-seam wipe slideshow.
  New direction is Forge-level choreography (principles, not artefact): `direction/hero-storyboard/STORYBOARD.md` ("Step back",
  C1 macro → C2 Ford GT peak → C3 daylight → C4 ledger → Collection). Brand: Deep Red #AC1D28 + Graphite #303137, no #000.
- **HEAD-ON REJECTED (2026-10-09) — preserved in prototype/hero-forge/, not developed further.** No repetitive centred
  frontal cars, no symmetrical wipe slideshow. New hero: fullscreen 100vh chapters where ENTIRE COMPOSITIONS transform
  (cars move/overlap/enter/leave; typography participates; mixed scales/angles/crops/details/negative space; every
  stage a genuinely different composition), natural transition into a fullscreen Collection section. Forge = primary
  reference (live site + vault recordings) — storytelling approach, never branding/layout.
  **Colours mandatory: Deep Red #AC1D28, Graphite #303137**; support: charcoal, warm near-black, metallic silver, soft
  ivory. **No pure #000000 backgrounds.** Storyboard of 3–4 desktop compositions (1920×1080) + how each transforms
  into the next BEFORE any code; AD → designer → motion only after Alex approves. No GSAP/prototype before approval.
- **TEST FINAL rebuild (Alex, 2026-10-08):** new separate implementation in `_____TEST FINAL/` (BRIEF-REBUILD.md: 8
  full-screen scenes, red #AC1D28 + graphite #303137). Take the **construction logic of Czinger Miami + Prestige**
  (structure only — see `_____TEST FINAL/STRUCTURE-REFS.md`; authorised cross-project use, no assets/copy/devices).
  Same agents/workflow. No fal.ai. New images allowed from dupontregistry.com + facebook.com/dupontregistry.
  Phase 1 = AD summary + storyboard + static frames, then STOP for Alex's approval.
- **COLOUR REFERENCE (Alex, 2026-10-08):** westcoastexoticcars.com is now the WORKING COLOUR reference for "current colour
  scheme… keep red… dark concept" (pending client confirmation) — colour ONLY: red accent, dark neutrals, light/dark
  contrast. Its layout, typography and design system are still NOT references (supersedes the earlier blanket ban for colour
  only). Apply to the Forge hero concept; no full redesign for colour; V1/V2 untouched.
- **NEW HERO DIRECTION (2026-10-08) — A/B/C dropped.** Forge Automotive = PRIMARY motion & composition reference
  (chapter-like scroll storytelling, strong static typography, image-led motion, premium pacing, deliberate transitions,
  cinematic first impression) — structure only, never copied. Original Select hero from real dR photos, **frontal car
  images as the main visual language**: one car → another → another, revealed in a controlled sequence; cars monumental
  and curated; type stable and editorial. Brief in view (national brand, unified inventory, three showrooms); red accent.
  No blur, fake light tricks, awkward background extensions, generic carousel, single-Porsche scene. Must clearly
  outperform V1/V2. Deliverable: 2–3 key frames at 1920×1080 first; if strong, implement the scroll animation.
  Frontal shots must read at large scale, have strong symmetry, look expensive, and differ in character — three cars,
  three roles (e.g. aggressive/sculptural · clean/elegant · iconic/exotic) so the hero develops emotionally.
- **New AD phase (2026-10-08):** three distinctly different static HERO concepts at 1920×1080 (real photos, real logo,
  nav, type, CTA) for visual review. No motion implementation, no full site, no V3 until Alex selects. Not the dR
  marketplace hero, not Lights On/918, no generic dealer hero/carousel/random full-screen photo. Locations untouched.
  **Marshall Goldman is NOT a design reference.**
- **CREATIVE RESET (2026-10-08): Alex rejected BOTH V1 and V2** — fundamental issues in concept, layout, composition,
  visual identity and design quality. Both prototypes FROZEN as-is (site/, site/v2/); all research, assets, inventory and
  provenance preserved. No polishing, no V3, no autonomous sprint, no global Design DNA rewrite. Next phase = visual
  art-direction exploration from the original client brief, real visual references and original compositions.
  **No frontend implementation until Alex approves a visual direction.** Wait for his instructions.
- **V1 FROZEN (2026-10-08)** — not approved, not rejected; Gate 5 pending Alex's visual review. V2 (`site/v2/`) finishes
  independently. Then a side-by-side V1 vs V2 comparison (hero, full pages, motion recordings). No automatic merge.
  Final design_dna gates only after Alex selects and the chosen version is finalised. Locations unchanged.
- **Hero direction set by Alex (2026-10-08):** scroll-driven cinematic hero — real cars slide into/out of art-directed
  tableaux (sides, overlap, layering), type slides into editorial positions (sometimes opposite direction) then holds;
  pinned GSAP scrub; full stills (pin-stops); several compositions; seamless handover. NOT a scroll carousel. No blur,
  vignettes, random zooms, cheap fades. Order: art-director shot list + choreography → designer → motion-designer.
- **Pin-stop (Alex, 2026-10-08): use pin stops — every text must be readable.** In any pinned/scrubbed sequence the text
  holds completely still (pinned, fully opaque, no motion) for a real dwell long enough to read it before anything moves on.
  No text that is only legible mid-transition; no text passing by while the scroll keeps travelling.
- **Hero REJECTED (2026-10-08):** the SVJ dark-studio hero (dR's own marketing frame) reads as a reproduction of
  dR's marketplace hero. New hero concept required — 2–3 structurally different concepts, Alex chooses before build.
  Not "a different photograph in the same template". 918 peak and Locations stay unchanged.
- **REJECTED (2026-10-08): blurred/feathered photo edges, dark vignettes, artificial shadows at image boundaries, dark
  overlays hiding image integration.** Photos stay clean, sharp, naturally lit. If an effect can't be seamless with the
  photography, simplify the effect — never degrade the image. Design DNA outranks the technical effect. Peak = v1 sharp
  presentation; signature motion revisited later if needed.
- **NO PAID SERVICES (2026-10-08):** no fal.ai or any paid image/video generation, paid API or credit-consuming tool without
  Alex's explicit approval — ask first. Use client photography, local assets, CSS, GSAP, free/local tools. Lights On is a
  frontend technique, never generated video.
- **Project isolation (2026-10-08):** global design knowledge (TASTE, skills, rules, vault judgements, gate lessons) is reusable;
  other clients' research, inventory, photos, concepts, client info and project decisions are NOT — unless Alex authorises.
  Every fact/asset must trace to the duPont REGISTRY ecosystem. Audit: research/ISOLATION-AUDIT.md.
- **Lights On approved as creative direction, NOT as final visual execution (2026-10-08)** — direction/ART-DIRECTION.md
  governs. Build the 918 signature sequence first and show Alex the browser render before the rest of the homepage.
- **Peak provisionally approved (2026-10-08)** — refine at final QA, not now. Build full homepage + map + SRP + responsive,
  then design-critic + anti-patterns, then fix the top issues. Keep moving; ask Alex only for decisions that would change the concept.
- Don't pause for noncritical missing contact details — verified facts or clearly identified placeholders.
- **Red (2026-10-08):** no Select-specific red exists (measured: Live/auction #C10E34 / #E4002B / #7A0822). Alex: open to a
  refresh — red definitely stays, dark concept liked. Art-director may refine the red; derivation stated (color I5).
- **Logo:** the vector "duPont REGISTRY | SELECT" lockup from research/out-of-scope/west-coast/ MAY be used — logo file only.
- **Photography:** real listing photos (studio/daylight, ≤1920px) + the two dark duPont REGISTRY marketing frames
  (assets/source/_dr-cms-marketing-not-inventory/) approved for the hero/cinematic layer; rights origin unknown — private prototype only.
- **West Coast Exotics website is not a reference (2026-10-08)** — don't analyse it or borrow its identity/copy/imagery.
  West Coast stays as a location: three locations — West Coast, Miami, Naples.
- **Reference analysis comes from our design vault** (`design_dna/vault`), not from crawling third-party dealer sites.
  CMC = Chicago Motor Cars (https://www.chicagomotorcars.com/) and Marshall Goldman are cited by the client only as
  footer location-card structure; they enter the vault via vault-curator, then art-director reads them from there.
- Client: keep red as a key accent; dark concept approved; liked the previous iBuy map/locations concept;
  footer location cards may borrow structure from CMC and Marshall Goldman. No "Shop" nav item. No Year filter on SRP.
- Photography: dupontregistry.com is the primary, client-authorised source — private presentation use only.
- **Build stage 1 (2026-10-08, designer):** Alex asked for the 918 "Lights On" peak ALONE first (`site/peak.html`), render and
  stop for review before hero/SRP/map/footer. Shared layer: `site/assets/css/tokens.css`, `base.css`, `js/site.js`.
  I10 type proof run → Encode Sans Expanded kept over Unbounded. Ink over the light re-solves per pixel
  (`mix-blend-mode: difference` on ink) instead of a class swap. Frames registered on the cyc seam (data-reg, source px).
  QA via Playwright (true 1920 CSS viewport) — the Chrome MCP window is zoomed to 1536 CSS px on this machine.
- **Alex, 2026-10-08 (binding, site-wide):** NO blurred / feathered / vignetted / masked photo edges — photos are sharp,
  unaltered rectangles (v2 soft-light peak REJECTED; peak reverted to v1 and frozen). NO paid services or generated imagery.
  PIN STOPS: every pinned text beat holds still ≥40–60vh (peak: 4 stops × 60vh, verified pixel-identical).
  Hero = PLACEHOLDER going back to art-director (isolated: `<section class="hero">` + hero.css + hero-field.css).
- Full build: index.html + inventory.html are GENERATED by `site/_build/gen.py` from shared partials + assets/data/inventory.js
  (itself generated from data/inventory.json). Edit partials there, or hand-edit both pages consistently.
- **Hero "The Floor" built (2026-10-08, designer, awaiting Alex):** HERO-CONCEPTS.md implemented — `<section class="hf">` +
  hero.css + js/hero.js (hero-field.css deleted, SVJ frame off the homepage). Pin 255vh (stops 40vh — Alex's ≥40vh rule beats
  the file's 35), F = y 788 at 1920 (seam registration), overlaps = 6% of the back plate (file's 48px would cut F430 nose /
  ZR1 tail). Hang's opening frame (header + 458 + 765LT) lives in the hero; `.lit--cont` holds the rest. QA: site/_qa/hero/.
- **Hero "Head-On" static structure (2026-10-08, designer → motion-designer next):** `prototype/hero-forge/` (index.html
  GENERATED by `_build/gen.py`; QA `_build/qa.mjs` + `qa_contrast.py`, renders in `_qa/`). The showroom index is fixed top-left
  under the logo (the only band clear of every car top and rail). Chapter type sits in fixed slots, with one set visible per
  stop and none during seams. `[data-whole]` lines appear only when wholly uncovered. Frames ≤16:10 drop the bumper line to
  0.818H. Frames ≤3:2 end the sheets at a hard bottom horizon, with the type on night. All colour lives in
  `assets/css/tokens.css` (measured WCE palette).
- **FIX-DIRECTION pass 1 (2026-10-08, designer, V1 only — site/v2 belongs to another designer):** hang re-hung by seam rows
  (L|S → S|M → M|XS, GT3 out), More-in-SoCal = one line, map panels lead with one plate (sizing only), Services sentence
  section, order Map → Services → Voices → Sell → footer, footer map-crop marks, Voices 1+2 mosaic. Hero off-stage elements are
  visibility:hidden until their entrance (A1 measured them otherwise). Gates: site/.gates/ (G1, G4 pass; G2/G3/hero need humans).
