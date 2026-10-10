# V4: "The Approach", revision 2 · hero storyboard F1–F5

This is the art-director artefact, dated 2026-10-09. It supersedes `STORYBOARD-v1.md`, which is kept for the record. Design DNA was resolved from
`C:\____WORK\_____GDBURO SIGOFF\design_dna` (the working copy).

This revision answers Alex's review of the v1 frames (project CLAUDE.md feedback log, "V4 refinement"). F1 is refined. F3, F4 and F5
are **rebuilt from zero**, not patched. Static frames come first. There is no animation build until Alex has seen F1–F5 and the contact sheet.

**Bound by:** no blur, feather, vignette or masked photo edges. Every pinned text beat holds still for at least 40vh. No paid services and no generated imagery.
The rest of the site stays out of scope until he reviews.

---

## 0 · What changed from v1, and why

| v1 | v2 | Reason |
|---|---|---|
| Hero trio: F430 · Ford GT · **458 Speciale** | F430 · Ford GT · **911 Sport Classic** (green, `07_`) | Alex asked for a Porsche. The Sport Classic `07_` is the only front-facing Porsche shot in the same SoCal studio rig as the other two (same cyc ring, light and lens height). Rejected Porsches: the GT3 `08_` (Miami studio, 1024 px source, silver lost on ivory) and the GT2 RS `07_` (yellow outshouts the red). |
| Cars small and low (Ford 575 px wide, tyres at y 928). Dead band y 600–620 between type and cars | Ford **762 px** wide, roof at **y 409**. Type ends at y 312, about 100 px above the cars | "Move the cars higher, increase their presence, reduce the dead space." |
| Headline 112 px, two lines, 190 px tall. It fought the cars | **One line, 76 px**, cap height ≈ 52 px against a 437 px car (1 : 8.4). The red "SELECTED." sits directly over the red car | "Refined hierarchy, confident proportions, part of the scene." |
| Flanks were equal-ish and symmetric (both tucked about 80 px) | **Unequal on purpose.** The Ferrari sits deepest, is smallest and is 35 % tucked behind the Ford. The Porsche stands *alongside*, a 48 px gap away, untucked | Any overlap on the 911's left fender hides a round headlamp, and the headlamps *are* its identity. The F430 keeps its identity with one lamp plus the crest. |
| F3: the Ford sinks; a graphite "aperture" rectangle with miniature photos | F3 **monumental**: Ford at s 0.90 (1039 px), the flanks cropped hard at the edges, asymmetric | "No floating squares, cards or miniature photos." |
| F4: graphite aperture fills; plates offset | F4: **the Ford drives over the lens** and leaves through the top. The Collection's lead image rises **locked to the Ford's own floor** | "The next chapter emerges from the movement of the outgoing composition." |
| F5: white-cyc plates on graphite | F5: **ivory ground, two dark macro photographs bleeding off the edges and overlapping**, strong type, a marque index | "Not white-background inventory photos on graphite cards." |

**Killed:**
- the Aperture;
- plates A/B/C (DBS 3/4, Speedster, small gauges);
- the 458 Speciale as a hero car;
- the top-right showroom register;
- the sinking-camera T2;
- the graphite Collection ground.

---

## 1 · Design Read

```
Reading this as a scroll-driven homepage hero for collector/exotic buyers, editorial cinematic studio.
Mandate: REDESIGN. Carried through untouched: the duPont REGISTRY | SELECT lockup, red as the key accent, real dR listing
photography, the three showrooms (Murrieta CA, Naples FL, Miami FL), the ivory hero (approved as the WORKING colour direction).
Dialect: auction-editorial anchor (didone display, quiet grotesque, air, accent as a setting) + pinned camera choreography.
Dimensionality: MAIN in the hero (the approach IS the composition); every hold must stand as a still.
```

**Concept:** *Three real cars drive toward you. The red one passes over the lens, and the Collection arrives in its wake, close enough to read the dials.*

**Feeling curve**

| Act | Feeling | What causes it |
|---|---|---|
| F1 Arrival | composure | three cars waiting, one title above them |
| T1→F2 Approach | anticipation | the trio comes forward and opens; the flanks start to leave |
| F3 Presence | awe | the Ford alone at near full size, the others passing the lens |
| T3 / F4 Passage | release | the Ford drives over you, and the next chapter is pulled up behind it |
| F5 Collection | intimacy | macro detail: a wheel, a speedometer; the Collection is up close |

**Peak:** T3, F3 → F4 → F5 (the Passage).

**Signature move: "The Wake."**
- The Collection's lead image (P1) has no entrance of its own.
- Its top edge is locked to the departing Ford: it always sits **36 px below the end of the Ford's floor reflection**.
- The car pulls the next chapter into frame. There is no wipe, no mask and no cut.

---

## 2 · Hero declaration (F1)

| | |
|---|---|
| viewport ownership | Full first screen. The scene owns it. The trio spans x 189–1797 but does not fill the frame. |
| scene treatment | Seamless ivory studio, the cars' own white-cyc light extended. Nothing drawn: no horizon, no texture, no light effect. |
| object scale | Ford s 0.66 (762 px) · Porsche s 0.48 (487 px) · Ferrari s 0.42 (479 px). Heights 437 / 337 / 290, a ranked ratio of 1 : 0.77 : 0.66. |
| focal point | The Ford's nose and grille, around (881, 760). The red "SELECTED." is the second read, set directly above it. |
| negative space | The floor band y 960–1010 (ground) and the right-top band x 1100–1340 between headline and deck. Both are bounded by event masses. |
| text safe zone | Top band y 150–320, x 120–1800. Record line y 1010–1040. Car tops never rise above y 405. |
| desktop crop | None. All three cars are whole. |
| mobile crop | Authored separately (§9). |
| asset suitability | Verified. The three sources are 1920×1280 from the same dR SoCal rig, and every car is ≤ 1 : 1 at F1. |
| event statement | Three cars from one registry, waiting for you to walk up. |
| primary subject | The trio, led by the red Ford GT. |
| headline mass | "THE REGISTRY, SELECTED." (one line) |
| supporting evidence | The record line: real years, makes and models, Select SoCal. |
| CTA cluster | Deck + red CTA, top-right, sharing the headline's baselines. |
| excluded | Persistent chrome (logo, nav), chapter index. |

---

## 3 · Palette and type

| Token | Hex | Role |
|---|---|---|
| Ivory | `#F0EEE9` | Hero and Collection ground |
| Graphite | `#303137` | Ink on ivory |
| Charcoal | `#232428` | Later sections (About/Locations) |
| Warm near-black | `#1B1A18` | Footer and deepest grounds. Never `#000`. |
| Silver | `#A7A9AD` | Metallic neutral: text on charcoal/near-black; hairlines on ivory (non-text only) |
| Pewter | `#66676B` | Secondary text on ivory. Designer verifies ≥ 4.5 on the render (computed ≈ 4.7). |
| Deep red | `#AC1D28` | One headline word, CTA fill, eyebrow rules |

**Computed contrast:**
- graphite on ivory: 11.18
- red on ivory, and ivory on red: 6.12
- ivory on charcoal: 13.37
- silver on charcoal: 6.59
- silver on near-black: 7.39

Red on dark grounds (2.19) is never text and never a thin rule. Ivory captions over photographs are measured on the composited render (colour invariant).

**Type**
- **Display:** Bodoni Moda 400, `opsz` at its maximum, uppercase.
  - Tracking +0.02em at 64–76 px, +0.01em at 88 px.
  - Single-line leading where it is one line, otherwise 1.06.
  - Measured width in the v1 render: 7.05 em for "THE REGISTRY," and 4.96 em for "SELECTED.".
- **Text:** Manrope.
  - Body 400, 17/28.
  - Labels 600, 14 px, uppercase, tracking 0.16em.
  - 14 px is the floor.
- No italic accent in the hero: the colour word already carries the emphasis, and D2 forbids combining the two.

---

## 4 · Car layer system (independently replaceable)

Each car is a group `car--{ferrari|ford|porsche}` holding two layers:
- `.car__shadow`: today the multiply ground plate; later Alex's alpha shadow.
- `.car__body`: the alpha cut-out.

**Positioning is by anchor and rendered body width, never by source scale**, so a final asset at any resolution drops in unchanged:
- **anchor** = bottom-centre of the body bbox: x = bbox centre, y = the contact line (tyre contact, or the splitter lip where the tyres are hidden).
- **W** = rendered width of the body bbox, mirrors included, in CSS px. The layout stores (anchor-x, anchor-y, W) per frame.
- Each asset carries its own `data-anchor` and `data-bbox` in its own pixels. Scale = W / bbox width.
- The shadow layer shares the body's anchor and scale.

| | Ferrari (back, left) | Ford GT (front, centre) | Porsche (mid, right) |
|---|---|---|---|
| Car | 2007 Ferrari F430, "Silver" (reads gunmetal), Select SoCal, P4092, listing 624911 | 2006 Ford GT, Red, Select SoCal, P4087, listing 628929 | 2023 Porsche 911 Sport Classic, Green, Select SoCal, stock 241, listing 636254 |
| Source | `assets/source/624911_2007-ferrari-f430/08_2007-ferrari-f430-290071-1881447063.jpg` | `assets/source/628929_2006-ford-gt/07_2006-ford-gt-700073-837676577.jpg` | `assets/source/636254_2023-porsche-911-sport-classic/07_2023-porsche-911--sport--classic-720075-396410551.jpg` |
| Temp cut-out | `site_v1/v4/storyboard/build/cutouts/f430_cutout.png` + `f430_plate.png` (exist) | `…/cutouts/ford_cutout.png` + `ford_plate.png` (exist) | **To make:** `…/cutouts/p911_cutout.png` + `p911_plate.png`, using the same `build/cutout.py` method (see below) |
| bbox (src px) | x 390–1530, y 302–992 (1140 × 690) | x 389–1543, y 300–962 (1154 × 662) | x 455–1470, y 357–1060 (1015 × 703). Designer re-measures. |
| anchor (src px) | (960, 992), splitter lip | (966, 962), tyre contact | (962, 1060), splitter lip |
| floor reflection below anchor (src) | 125 px | 164 px | ≈ 75 px |
| px per mm (body width) | 0.578 | 0.589 | 0.534 |
| identity marks that must stay visible | left headlamp, the yellow crest, left intake | both headlamp clusters, the Ford oval, grille | **both round headlamps** (5–18 % in from each side edge), the crest |
| max scale used | 0.90 | 1.00 (exit only) | 0.92 |
| z (body) | 1 | 3 | 2 |

All shadows sit at z 0, under every body.

**Porsche temp cut-out (designer):**
- Use the same non-AI pipeline.
- Seeds: the four corners, plus floor points left and right of the car, above *and* below the ring (the ring is at y ≈ 700 at the frame edges).
- Green against white keys cleanly.
- Pockets: between the mirror stalks and the A-pillars; below the splitter (src y 1060–1130 is the car's dark under-shadow, so it goes on the plate, not the body).
- Choke 1 px. No feather.
- Every plate border pixel must read 255.
- Add the provenance row: https://www.dupontregistry.com/car/porsche/911--sport--classic/2023/WP0AG2A99PS252241/636254

**Final assets from Alex:**
- Deliver body width ≥ 2× the largest W in this file: Ford ≥ 2310 px, Ferrari ≥ 2060 px, Porsche ≥ 1870 px.
- Alpha body plus a separate alpha shadow.
- Include an anchor note.
- Nothing else in the layout changes.

---

## 5 · Frames (1920 × 1080). All coordinates are viewport px.

The chrome is the same in every frame unless a frame says otherwise:
- **Logo:** SVG lockup, fill graphite, x 120, top 40, height 48.
- **Nav:** Inventory · Locations · Services ▾ · Finance · About · Contact. Manrope 600 14 px, tracking .16em, graphite. Right edge 1800, baseline 70, 40 px gaps.
- **Chapter index** "01 / 08": a label, right edge 1800, baseline 1032.

### F1 · Arrival · hold 50vh

**Ground:** ivory.

**Type** (one top band; everything shares two baselines, y 200 and y 312):

| Element | Spec |
|---|---|
| Eyebrow rule | red, 24×2, x 120, y 174 |
| Eyebrow | "SOUTHERN CALIFORNIA · NAPLES · MIAMI". Label, graphite, x 120, baseline 200 |
| Headline | Bodoni Moda 76 px, +0.02em, **one line**, baseline 312, x 120. "THE REGISTRY," in graphite + "SELECTED." in red. It ends at ≈ x 1085. **Alignment rule:** the optical centre of "SELECTED." sits on the Ford's centreline ±24 px. Adjust the *car group* x (within the margins), never the type. |
| Deck | Manrope 17/28, graphite, x 1360, baselines 200 / 228, max 440. "Exceptional cars, chosen one at a time — / and three showrooms to see them in." (placeholder) |
| CTA | Red field 268×52, x 1360, y 260–312 (its bottom sits on the headline baseline). Label "VIEW THE COLLECTION →" in ivory. |
| Record line | Manrope 500 14 px, tracking .04em, graphite, x 120, baseline 1032. "2007 Ferrari F430 · 2006 Ford GT · 2023 Porsche 911 Sport Classic — at Select SoCal" |

**Cars**

| Layer | s | W | anchor (x, y) | bbox x | top y | z | relation |
|---|---|---|---|---|---|---|---|
| car--ferrari | 0.42 | 479 | (428.5, 763) | 189–668 | 473 | 1 | **168 px (35 %) tucked behind the Ford.** Its right lamp is hidden; the left lamp, crest and left intake read. |
| car--porsche | 0.48 | 487 | (1553.5, 787) | 1310–1797 | 450 | 2 | **Alongside, untucked:** 48 px clear of the Ford's right mirror tip. Both round lamps fully visible. |
| car--ford | 0.66 | 762 | (881, 846) | 500–1262 | 409 | 3 | Front, lowest contact line, widest, the only red. |

- Shadow ends: Ford y 954 · Porsche ≈ 823 · Ferrari ≈ 816.
- The contact lines step up toward the back (846 → 787 → 763): the depth is read off the floor, not drawn.

**Checks:**
- type-to-roof air 97 px (Ford) and 122 px (Porsche under the CTA);
- no tangency under 40 px anywhere;
- all three cars whole;
- every car ≤ 1 : 1.

### T1 · F1 → F2 · 70vh

1. **0–30 %:** the headline exits **up**, each word in its own line clip. "SELECTED." leads (0–24 %), "THE REGISTRY," follows (6–30 %). The eyebrow exits up, 0–20 %.
2. **0–30 %:** the deck and CTA exit **right** inside the column clip (x 1360–1800). This is the opposite direction.
3. **0–25 %:** the record line exits **down** in its line clip.
4. **8–92 %:** the cars move F1 → F2 (anchor, W). Start times are deliberately unequal: Porsche 8 %, Ford 12 %, Ferrari 20 %. All three land by 92 %.
5. **58–100 %:** the F2 type enters **from the left** in line clips. Line 1 58–86 %, line 2 64–92 %, eyebrow 72–100 %.
6. Everything is landed and still at 100 %. The chrome stays fixed and graphite.

### F2 · Approach · hold 50vh (the whole frame is still)

**Type:**
- Eyebrow: red rule at x 120, y 150. Label "MURRIETA, CA · NAPLES, FL · MIAMI, FL" (verified cities), baseline 176.
- Headline: Bodoni Moda 64 px, +0.02em, graphite, x 120.
  - "THREE SHOWROOMS." at baseline 256.
  - "ONE COLLECTION." at baseline 324.
  - Line 2 ends at ≈ x 670, left of the Ford's roof shoulder (x 675, y 403).
  - It sits 76 px above the Ferrari roof.
- Index "01 / 08" stays.

**Cars**

| Layer | s | W | anchor | bbox x | top y | relation |
|---|---|---|---|---|---|---|
| car--ferrari | 0.64 | 730 | (182, 842) | −183–547 | 400 | 25 % cut by the left edge; tucked 80 px (11 %), so both lamps now read (the right lamp is 66 px clear) |
| car--porsche | 0.70 | 711 | (1824.5, 875) | 1469–2180 | 383 | 37 % cut by the right edge; 56 px clear of the Ford; the left round lamp is whole |
| car--ford | 0.82 | 946 | (940, 905) | 467–1413 | 362 | shadow to y 1039 |

**What changed since F1:**
- the trio opens: the Ferrari comes out from behind the Ford;
- both flanks start to leave, and not by the same amount;
- the type moves from a full-width masthead to a stacked block on the left.

### T2 · F2 → F3 · 80vh

1. **0–26 %:** the F2 type exits **up**. Line 2 leads 0–22 %, line 1 4–26 %, eyebrow 0–18 %.
2. **0–75 %:** the Ferrari accelerates out to the left (ease-in) to its F3 position. It leaves earlier and further than the Porsche, so the exits are **not mirrored**.
3. **10–85 %:** the Porsche moves to its F3 position.
4. **0–100 %:** the Ford moves to its F3 position. It drifts right 70 px and the top rises 62 px.
5. **76–100 %:**
   - the F3 caption enters from the left in its line clip;
   - its red rule extends from the left (scaleX), 76–88 %.

### F3 · Presence · hold 40vh (the monumental frame)

**Type:**
- Red rule at x 120, y 174.
- Caption "2006 FORD GT — SELECT SOCAL": label, graphite, baseline 200.
- Index "01 / 08".
- The caption is the only text; the image is the beat.

**Cars**

| Layer | s | W | anchor | bbox x | top y | relation |
|---|---|---|---|---|---|---|
| car--ferrari | 0.90 | 1026 | (−323, 900) | −836–190 | 279 | **Only 18 % in frame:** the right lamp and mirror at the left edge. A 301 px ivory gap to the Ford. |
| car--porsche | 0.92 | 934 | (2044.5, 920) | 1578–2511 | 273 | **37 % in frame**, close to the Ford (49 px). The left round lamp is whole at x 1629–1748. |
| car--ford | 0.90 | 1039 | (1010, 896) | 491–1529 | 300 | Right of centre. Shadow to y 1044. |

**Composition:**
- Left: air plus a sliver of car. Right: density.
- The Ford, 54 % of the width and 55 % of the height, is the whole event.
- The flanks read as cars *passing the lens*: both are nearer than the Ford now (depth factor ≈ 1.0) and cropped hard.
- Nothing floats; nothing is a card.

### T3 · F3 → F5 · 120vh (the Peak: the Passage and the Wake)

1. **0–12 %:** the header (logo + nav) retracts **up**, scrubbed. The index exits down. The header leaves *before* the Ford reaches the nav band.
2. **0–15 %:** the F3 caption exits up.
3. **0–35 %:** the Ferrari exits fully left (scale held at 0.90; bbox right edge ≤ −40).
4. **5–40 %:** the Porsche exits fully right (scale held at 0.92; bbox left edge ≥ 1960).
5. **12–80 %:** the Ford drives over the lens.
   - s 0.90 → 1.00; anchor (1010, 896) → (1010, −200), i.e. up and out of the top.
   - Its floor plate travels with it.
   - **1.00 is the cap**: past that it translates, it never upscales.
6. **12–80 %: the Wake.** P1's top edge = the Ford's plate end + 36 px, on the same progress.
   - At 12 % that is 1044 + 36 = 1080, just off-stage.
   - At 80 % it is −36 + 36 = 0.
   - So P1 enters exactly as the car leaves, and lands exactly when the car's floor clears the frame.
7. **20–60 %:** P2 rises from below to y 560, faster than P1. It lands first, and P1 then slides up *behind* it (P2 z 2, P1 z 1).
   - Measured clearance from the Ford's shadow: ≥ 180 px at every sampled point (30 / 40 / 60 %).
8. **30–70 %:** the marque index, showroom row and CTA rise from below as one block (offset +470 → 0).
9. **72–94 %:** the Collection type enters **from the left** in line clips. By then the Ford's plate end is above y 90, clear of the type zone.
   - Eyebrow 72–86 %, line 1 72–90 %, line 2 76–94 %, deck 80–98 %.
10. **84–100 %:** the header returns. Its ink is solved per element against what is under it: the logo stays graphite (over ivory) and the nav turns ivory (over P1).
11. At 100 % everything is still.

### F4 · the Passage, frozen at T3 = 50 % (a waypoint, but a designed still)

The motion designer may ease freely, but **the timeline must pass through exactly this frame at T3 50 %.**

**Layers:**
- **car--ford:** s 0.956, W 1103, anchor (1010, 283), bbox x 459–1561, top −350.
  - Visible: the face only, from the headlamp clusters (y ≈ 70) down to the splitter (283).
  - Its own reflection and shadow reach y 440.
- **P1 (gauges):** x 860–1920, top y 476. The steering-wheel rim enters first, the speedometer below it.
- **P2 (wheel):** x 520–1160, top y 690, still rising.
- **Index block:** x 120, the first rows entering from the bottom edge (offset +235).
- **Not present:** headline (not in yet); flanks (gone); chrome (retracted).

**Reading:**
- A diagonal runs from the departing red face (top centre), down the dark P1 (right), to the wheel and the index (bottom left).
- There is no colour split: the ground stays ivory.
- No empty screen: four live masses.
- No rectangle floats: both photos are anchored to the bottom edge.

### F5 · Collection · hold 60vh. The pin ends after it.

**Ground:** ivory, the same field as the hero. The chapter changes through its photography, not its ground.

**Photographs** (sharp, unaltered rectangles at s 1.00, i.e. 1 : 1 at 1920):

| Layer | Source | Source window (src px) | Viewport | z | Caption |
|---|---|---|---|---|---|
| `col--gauges` (P1, dominant) | `assets/source/635055_2009-aston-martin-dbs/06_2009-aston--martin-dbs-187875-827962918.jpg` | x 0–1060, y 200–1280 | x 860–1920, y 0–1080. Bleeds top, right and bottom. | 1 | "2009 ASTON MARTIN DBS · SELECT SOCAL": label, ivory, right edge 1800, baseline 1040 |
| `col--wheel` (P2) | `assets/source/626613_2015-ferrari-458-speciale/07_2015-ferrari-458--speciale-1369075-1861828170.jpg` | x 640–1280, y 340–860 | x 520–1160, y 560–1080. Bleeds the bottom; overlaps P1 by 300 × 520 over P1's dark lower-left (fuel gauge and leather). The speedometer stays whole. | 2 | "2015 FERRARI 458 SPECIALE · SELECT SOCAL": label, ivory, x 544, baseline 1040 |

**About the crops:**
- **Speedometer:** whole, centred near (1530, 510). The tachometer is cut by the right edge, an intended asymmetric crop.
- **Wheel:** whole width. The tyre is cut by the viewport bottom, so the cut is hidden in the bleed.
- **Rhyme:** the two circles (wheel and dial) rhyme at two scales.
- **Tones:** both frames are all-dark. There is no white cyc anywhere in F5. The only red is the stitching, the "Ferrari" caliper script and the CTA.
- **Mileage:** the odometer shows the real reading in the listing photo. That is not a claim, and no other figures appear.

**Type**

| Element | Spec |
|---|---|
| Eyebrow | red rule 24×2 at x 120, y 170; "02 — THE COLLECTION", label, graphite, baseline 196 |
| Headline | Bodoni Moda 88 px, +0.01em, graphite, x 120. "CHOSEN," at baseline 316; "ONE AT A TIME." at baseline 404. It ends at ≈ x 761, 99 px clear of P1. (placeholder voice) |
| Deck | Manrope 17/28, graphite, x 120, baseline 468, one line. "Every car here was picked by a person, at one of three showrooms." (placeholder) |
| Index label | "BROWSE BY MARQUE", pewter, baseline 640 |
| Marques | Manrope 500 15 px, uppercase, .08em, graphite, x 120, baselines 680 → 840 every 32 px: FERRARI · PORSCHE · LAMBORGHINI · McLAREN · ASTON MARTIN · FORD. Every one is in `data/inventory.json`. Each links to `inventory.html` filtered. **No counts.** |
| Showroom row | "SOCAL · NAPLES · MIAMI", pewter label, baseline 896. Each name is a filter link. |
| CTA | Red 268×52, x 120, y 960–1012, "VIEW ALL INVENTORY →" in ivory |
| Chrome | Logo graphite (over ivory). Nav ivory (over P1's dark leather): verify AA where "INVENTORY" crosses the rim's red stitching, around x 1070–1140. No chapter index (the eyebrow carries "02"). |

**Masses:**
- dominant: P1;
- subordinate: the headline (top-left) and P2 (bottom-centre, overlapping);
- support: the index and CTA (bottom-left).

**Eye path:** headline → speedometer → wheel → CTA.

**Discovery is visible without hover:** marques, showrooms and one CTA.

---

## 6 · Pin budget

| Segment | vh |
|---|---|
| F1 hold | 50 |
| T1 | 70 |
| F2 hold | 50 |
| T2 | 80 |
| F3 hold | 40 |
| T3 | 120 |
| F5 hold | 60 |
| **Total pin** | **470vh** |

- Every reading stop is at least 40vh and pixel-still.
- No text is readable only while it moves.
- All motion is transform-only and scrubbed. No opacity on reading text.
- The one time-based exception is the nav ink swap at its return, and it is chrome.
- LCP is the Ford cut-out; preload it. P1 and P2 load lazily, before T3.

## 7 · Resolution

At 1x every layer is ≤ 1 : 1 (largest: Ford s 1.00 at the exit; P1 and P2 at 1.00).

At DPR 2 the following are upsampled:
- F1 Ford 1.32×;
- F2 Ford 1.64×;
- F3 Ford 1.80×, Porsche 1.84×, Ferrari 1.80×;
- P1 and P2 2.0×.

These are accepted for the 1920 presentation (the primary viewport), and are resolved by Alex's final cut-outs at the sizes in §4. **Growth always ends in an exit or a crop, never in an upscale past 1.00.**

## 8 · Forge: what the recorded frames gave us (`vault/shots/forgeautomotive-co-uk/scroll-1920.webm`, 1.5 fps)

| Forge frames | What happens there | What we take |
|---|---|---|
| 48–53 s | The lead car rises from the bottom edge between flanking vehicles, grows, and travels up *through* the headline plane, which holds | The Ford leaves through the top (T3) while the flanks pass the lens at the sides |
| 54–57 s | The next chapter enters as a hard-edged, full-width photograph rising from the bottom while the previous state holds | The Wake: P1 rises, but locked to the departing car rather than on its own clock |
| 36–47 s | Chapter grammar: a text column on the left; an image column bleeding three edges; a second image overlaps a corner and rises over the first | F5's P1/P2 overlap and their independent rates |
| 59–68 s | Finale: three cars, headline centred above, CTA on the red car's spoiler line | **Not** for the hero (too symmetric). Held for the footer close (outline only, not in this review). |
| type | Serif lines enter in line clips, then hold completely still | All type beats |

**Not taken:**
- low-key commissioned photography (we have none);
- grain;
- overhead angles;
- the hamburger-only nav.

The INSPIRATION screens are AI-generated, so they gave taste cues only: the didone uppercase with a red last word, the 24×2 red eyebrow rule, one red rectangular CTA, and the numbered chapter eyebrow. No pixel was used.

## 9 · Mobile (390): authored later, not in this review

- Headline on two lines at 44 px.
- The Ford alone and whole at about 300 px. The Ferrari tucked behind it at the left edge. The Porsche cut 50 % at the right edge.
- The pin shortens to 260vh, with holds of 40 / 40 / 40 / 50.
- F5 stacks P1 → headline → P2 → index, each full-bleed.

## 10 · Reduced motion

- F1 renders as a static section, with no pin.
- F5 follows as a static ivory section at its F5 layout.
- There is no approach and no Wake. The meaning (three cars, then the Collection up close) is kept.

## 11 · Hand-off to the designer (in this order)

1. Make the Porsche temp cut-out (§4) and add its provenance row.
2. Render F1, F2, F3, F4 and F5 at 1920×1080 (1x and @2x), plus the contact sheet, into `site_v1/v4/storyboard/`. Overwrite the v1 PNGs.
3. Verify on the render:
   - the alignment rule for "SELECTED." over the Ford;
   - both Porsche lamps whole in F1, F2 and F3;
   - no tangency under 40 px;
   - nav AA in F5;
   - captions ≥ 4.5 : 1 composited.
4. Report deviations in `PROVENANCE.txt`. Do not change the composition without a note back to art direction.

**Decisions taken, and their cost:**
- **(a) The Collection stays on ivory.** It rejects the inspiration's ivory/graphite alternation at this seam, and buys a handover with no colour split. Graphite starts at About/Locations.
- **(b) The Porsche is alongside, not overlapped.** Alex asked for "controlled overlap", and the Ferrari alone carries it, because any tuck hides a 911 headlamp.
- **(c) All copy is placeholder voice except the car names, years and cities.** Alex is to confirm.
