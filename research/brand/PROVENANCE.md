# duPont REGISTRY Select — Provenance ledger

brand-extractor (design_dna) · extraction only · accessed **2026-10-08** · Chrome 154, 1920×1080.
Manifest resolved from the Windows working copy `C:\____WORK\_____GDBURO SIGOFF\design_dna\TASTE.md`.

**What source material exists:** no Select brand book, no guidelines PDF, no client-supplied asset pack.
Everything below was measured from live duPont REGISTRY (dR) web properties. A shipped value is evidence of
what a property ships, not a brand mandate, and dR parent/division identity does not automatically bind Select (BRIEF.md).

Source keys:
- **[M]** https://www.dupontregistry.com/ (marketplace, Next.js). Compiled CSS custom properties plus computed styles. Served `data-theme="dark" data-skin="default"` because the browser sent `Sec-CH-Prefers-Color-Scheme: dark`.
- **[L]** https://live.dupontregistry.com/ (dR Live auctions, MUI). Computed styles.
- **[D]** dR dealer directory data on [M] (SRP facet payload, `https://www.dupontregistry.com/cars-for-sale/all`) and the dealer profile pages `/dealer/<alias>/<id>`.
- **[N]** https://news.dupontregistry.com/blogs/dupont-registry-featured/dupont-registry-group-expands-operations-with-acquisition-of-west-coast-exotic-cars-and-new-naples-experience-center

---

## Ledger

| Token | Value | Source | How obtained | Confidence |
|---|---|---|---|---|
| `--dr-red-live` | `#C10E34` | [M] auction skin `--secondary`/`--auction-live` = `hsl(347.26 86.47% 40.59%)`; [L] CTA bg/text `rgb(193,14,52)` | compiled CSS var → hex; computed style | measured (2 sources agree) |
| `--dr-red-live-alt` | `#C10E33` | [L] `rgb(193,14,51)` on 3 elements | computed style | measured (contradiction, see below) |
| `--dr-red-accent` | `#E4002B` | [M] `--secondary-alt` (auction) `hsl(348.68 100% 44.71%)` | compiled CSS | measured |
| `--dr-red-deep` | `#7A0822` | [M] `--auction-live-deep` `hsl(346.32 87.69% 25.49%)` | compiled CSS | measured |
| `--dr-red-glow` / `-deep` | `#820A26` / `#5A061A` | [M] `--auction-glow`, `--auction-glow-deep` | compiled CSS | measured |
| `--select-red` | — | not defined on any in-scope property | — | **absent** |
| `--dr-bg` | `#000000` | [M] `--background` (dark), body computed | CSS + computed | measured |
| `--dr-surface` … `-3` | `#0D0D0D` `#141414` `#1C1C1C` `#212121` | [M] dark `--surface`…`--surface-3` | compiled CSS | measured |
| `--dr-surface-variant` | `#464648` | [M] footer bg computed `rgb(70,70,72)` | computed | measured |
| `--dr-fg` / `--dr-on-surface` | `#FFFFFF` / `#F2F2F2` | [M] dark tokens | compiled CSS | measured |
| `--dr-on-surface-var` | `#C5C5C9` | [M] `240 4% 78%`, used on 61 elements | CSS + computed | measured |
| `--dr-outline` / `-variant` | `#999999` / `#5C5C60` | [M] | compiled CSS | measured |
| `--dr-accent-dark` | `#BDBDFF` (text `#000052`) | [M] dark `--secondary`, the primary pill CTA | CSS + computed | measured |
| `--dr-accent-light` | `#2A2AD5` | [M] light `--secondary` | compiled CSS | measured (not rendered) |
| `--dr-gold` | `#AE9142` | [M] `--gold` | compiled CSS | measured (usage not observed) |
| `--dr-live-navy` | `#1F1F37` | [L] bg computed | computed | measured |
| `--dr-font-heading` | Manrope 500/600/700 | [M] `--font-heading`, h1–h3 computed, FontFace loaded | computed + FontFace API | measured |
| `--dr-font-body` | Roboto 400 (500/600/700 in computed use) | [M] `--font-body` | computed | measured |
| Live fonts | Public Sans 600, Plus Jakarta Sans (variable) | [L] | FontFace API | measured (contradiction with [M]) |
| Wordmark face | — | logo is outlined paths; face not identified | — | **absent** |
| "SELECT" face | — | raster lockup; face not identified | — | **absent** |
| `--dr-h1-size` | 60px @1920 (fluid 32→60) | [M] `--text-h1` + media queries; computed | CSS + computed | measured |
| `--dr-h2-size` | 48px @1920 (fluid 24→48) | [M] `--text-h2` | CSS + computed | measured |
| `--dr-h3-size` / body | 24px / 16px (lh 33.6 / 24) | [M] | computed | measured |
| `--dr-radius` | 0.75rem (cards 12px) | [M] `--radius`; card computed | CSS + computed | measured |
| `--dr-radius-pill` | 9999px | [M] CTA computed | computed | measured |
| `--dr-btn-pad` | 12px 32px (h 50) / 8px 16px (h 42) | [M] CTA computed | computed | measured |
| `--dr-gutter` | 24px | [M] `.container` padding at 1920 | computed | measured |
| `--dr-header-h` | 72px, bg `#000` | [M] | computed | measured |
| `--dr-container-max` | — | full-bleed minus 24px gutters at 1920 | — | **absent** |
| Select type scale / spacing scale | — | — | — | **absent** |

### Contrast (colour-taste I1, computed WCAG 2.x)
| Pair | Ratio | Body 4.5 | Large/UI 3.0 |
|---|---|---|---|
| `#FFFFFF` on `#C10E34` | 6.21 | pass | pass |
| `#C10E34` on `#000000` | 3.38 | **fail** | pass |
| `#C10E34` on `#0D0D0D` | 3.13 | **fail** | pass |
| `#E4002B` on `#000000` | 4.33 | **fail** | pass |
| `#FFFFFF` on `#E4002B` | 4.85 | pass | pass |
| `#FFFFFF` on `#7A0822` | 11.14 | pass | pass |
| `#C5C5C9` on `#000000` | 12.20 | pass | pass |
| `#999999` on `#000000` | 7.37 | pass | pass |
| `#5C5C60` on `#0D0D0D` (outline) | 2.92 | n/a | **fail** |
| `#000052` on `#BDBDFF` (CTA) | 10.60 | pass | pass |
| `#FFFFFF` on `#464648` (footer) | 9.42 | pass | pass |

Finding: the red works as a fill under white text. As text or thin rule on black it fails body contrast. Fixing that is a design decision and is left open here.

---

## (1) Verified brand identity

- **Name:** "duPont REGISTRY Select" is the dealer **family** on [D]: `familyName: "Select"`, `familyAlias: "select"` on the dealer object of each Select listing. Casing "duPont REGISTRY" is used consistently in every source.
- **Select dealer records [D]:**
  - `duPont REGISTRY Select SoCal` (id 814)
  - `duPont REGISTRY Select Naples` (id 7426)
  - `duPont REGISTRY Miami` (id 3730). Its display name has **no "Select"**, but its alias is `dupont--registry--select--miami`. See Contradictions.
  - All three have `website: https://www.dupontregistry.com/select` and status `1-Platinum`.
- **`https://www.dupontregistry.com/select`** returns **HTTP 308 → westcoastexoticcars.com**. dR's own nav links "duPont REGISTRY Select" and "Buy" point there. **No in-scope Select website exists.** `dupontregistryselect.com` is a GoDaddy parked domain (screenshot `research/screens/dupontregistryselect-com-parked_2026-10-08.png`).
- **Logos** (`research/brand/logos/`):
  - `dupont-registry_New-Dupont-Logo.svg`: the dR parent wordmark "duPont REGISTRY". **True vector**, viewBox 144×51, single fill `white`. It is a **dark-ground version only**; no dark/black vector was found. Source: `https://d2ujs0u2ekt0bo.cloudfront.net/cms_uploads/New-Dupont-Logo.svg`. Rendered in the [M] header at 112.94×40px.
  - `dr-dealer-logo_select-naples_….jpeg` and `dr-dealer-logo_select-socal_….jpeg` (identical pixels), plus `dr-dealer-logo_miami_privateclients-mp2.png` (served as .webp, actually PNG). Each is the **stacked Select lockup**: "duPont / REGISTRY" over "SELECT", **black on white, raster 600×400**. These are the only Select marks on in-scope properties. **No vector, no reversed (white) version, no clear-space or minimum-size rule.**
  - A horizontal lockup "duPont REGISTRY | SOCAL / NAPLES / MIAMI" (wordmark, vertical rule, wide-tracked location caps) exists **only baked into listing photo #1** (see the photo library). No file exists.
  - No red appears in any logo.
- **Voice, verbatim** ([M] home unless noted). These are marketplace (parent) voice, not Select-specific:
  - "Driving Luxury Since 1985" (H1)
  - "Exclusive offers to sell or trade in with confidence and discretion"
  - "Enjoy a refined path to ownership with tailored financing & leasing."
  - "OWN THE DREAM WITH THE / LEADERS IN EXOTIC INVENTORY"; "Trusted by collectors, nationwide."
  - "Sell with confidence alongside trusted duPont REGISTRY partner dealers nationwide."
  - "Exclusive inventory from duPont REGISTRY Select" ([M] SRP CMS payload)
  - "Welcome to duPont REGISTRY Select Naples." ([D] Naples profile, the only Select-authored line found)
  - [N]: "physical extensions of the duPont REGISTRY brand"; Naples "will serve as a premier destination".
  - CP6 warning: "leaders", "14-DAY Return Policy" and "100% SELL-THROUGH GUARANTEE" are dR marketplace/Live claims. They are **not** Select promises and need a client statement before use.
- **Group ownership:** footer "duPont REGISTRY Group"; © 2026.

## (2) Client-provided requirements (BRIEF.md + client instructions)

- Keep **red** as an important accent. The dark concept was well received. The client liked the previous **iBuy map/locations** concept. Open to a refreshed direction.
- Locations: **West Coast, Miami, Naples** (verify before publishing as fact).
- Nav: Inventory · Locations · Services (Insurance, Service, PPF) · Finance · About · Contact. No "Shop". SRP: Make, Model, Sort By, Keyword. **No Year filter.**
- Photography: dupontregistry.com is the client-authorised primary source, for a **private presentation prototype only**.
- **2026-10-08 (client):** "West Coast Exotics site is not a reference; West Coast remains a Select location." Everything captured from westcoastexoticcars.com was moved to `research/out-of-scope/west-coast/` and is unused. This includes a white vector "duPont REGISTRY | SELECT" horizontal lockup hosted on that site (`dupont-registry-select_lockup_white.svg`). Original URL: `https://www.westcoastexoticcars.com/wp-content/themes/aanWordpress/assets/images/wcec3.svg`, found as the header logo (alt "duPont REGISTRY Select - West Coast Exotic Cars") on https://www.westcoastexoticcars.com/, which I reached via the 308 redirect from https://www.dupontregistry.com/select; accessed 2026-10-08. It is the only vector Select mark found. **Whether it may be used is Alex's call.**
- **2026-10-08 (client):** Reference analysis deferred to design vault (client instruction 2026-10-08).
- West Coast location facts may be recorded only from dR / dR Select properties (done, via [D]).
- **2026-10-08 (Alex, colour only; client confirmation pending):** westcoastexoticcars.com was named the **working colour reference**. Layout, type, copy and imagery remain not a reference. Colour extraction (computed styles @1920, homepage): [wce-colour/PALETTE.md](wce-colour/PALETTE.md) + [wce-colour/tokens-wce.css](wce-colour/tokens-wce.css).
  - Primary red: `#AC1D28`, with a footer twin `#AC1E28`.
  - Dark grounds: `#000000` + `#303137`. Ink: `#FFFFFF`.
  - Distance from dR Live `#C10E34`: ΔE76 9.8.
  - These are shipped site values, not brand-mandated.

## (3) Creative interpretations

None. This is extraction only.

## (4) Unverified assumptions

- That the brief's "West Coast" = dR's **"duPont REGISTRY Select SoCal"** (Murrieta, CA). This is the only West-Coast Select record, but the naming differs.
- That `#C10E34` (dR Live / auction red) is "the red" the client means. **No Select-specific red exists.** The red the client saw may have come from the previous concept or from the out-of-scope West Coast Exotics site, which was not measured.
- Business hours for Naples and Miami: not published.
- Font licensing beyond the published OFL/Apache terms of Manrope, Roboto, Public Sans and Plus Jakarta Sans (all free for web). The logo faces are unidentified, so their licence is unknown.

---

## Business facts (accessed 2026-10-08)

| Location | Exact name (dR) | Address | Phone | Hours | Source | Status |
|---|---|---|---|---|---|---|
| West Coast | duPont REGISTRY Select SoCal (id 814) | 26900 Jefferson Ave, Murrieta, CA 92562 (metro "Riverside") | (951) 292-6100 | Mon–Fri 9:00 AM–6:00 PM; Sat 10:00 AM–5:00 PM; Sun Closed. Labelled "Business Hours **ET**" on the page | [D] https://www.dupontregistry.com/dealer/dupont--registry--select--socal/814 + SRP payload | verified as published (ET label suspect) |
| Naples | duPont REGISTRY Select Naples (id 7426) | 2365 Linwood Ave., Naples, FL 34112 | (239) 449-9191 | all days "-" (not published) | [D] https://www.dupontregistry.com/dealer/dupont--registry--select--naples/7426; listing JSON-LD; [N] names it "duPont REGISTRY Naples Experience Center", grand opening Feb 3 (2026) | address/phone verified; hours **absent** |
| Miami | duPont REGISTRY Miami (id 3730) | 5972 NE 4th Ave, Miami, FL 33137 | (615) 471-0221 | not published | [D] https://www.dupontregistry.com/dealer/dupont--registry--select--miami/3730 + SRP payload | verified as published; Select status by alias only |

- The profile page shows no street address for Naples or Miami (city/ZIP only). The street addresses come from the [D] JSON payload on the same domain.
- dR Live (id 6469) and duPont REGISTRY Exchange (id 4589, disabled) share the Miami address 5972 NE 4th Ave(nue).
- Relationship to dR: [N] (dated Jan 29 / Feb 2, 2026) says the dR Group acquired West Coast Exotic Cars. Eric Curran becomes "President of Sales" for dR, overseeing "existing California, Naples, Nashville and Miami showrooms".
- Nashville exists (dR record at 1006 Flagpole Ct., TN 37067) but is not a Select-family dealer and is not in the brief.
- Staff email addresses appear in [D]. They were deliberately not recorded.
- **iBuy map concept:** nothing found on any dR property or by web search. **Absent.**

## Gap list

1. No Select brand book, colour spec, type spec, spacing system or tone-of-voice rules exist.
2. No Select red. Red exists only in dR Live/auction tokens.
3. No vector Select mark on in-scope properties. The only Select mark is a raster 600×400 black-on-white lockup. No reversed version for dark grounds, no clear-space or minimum-size rule.
4. No dark/black version of the dR wordmark SVG; only a white one.
5. Logo typefaces unidentified.
6. Naples and Miami hours are absent.
7. No container max-width; no Select spacing scale.
8. No photo ≥2000px wide in Select inventory. CloudFront originals top out at **1920×1280** (Miami 1024px; Naples 639px; one Miami listing 767px).
9. **No dark/moody inventory photography.** All Select inventory shots are white-cyclorama studio or daylight outdoor (Naples). The only dark frames are 2 dR marketing images that are not tied to any listing.
10. 6 of 7 Naples listings and 2 of 5 Miami listings have no own photos.
11. No Select-specific reviews or Instagram handle found on in-scope properties.

## Contradictions (reported, not resolved)

- **Red drift:** `#C10E34` vs `#C10E33` on [L].
- **Fonts:** [M] uses Manrope + Roboto; [L] uses Public Sans + Plus Jakarta Sans.
- **Founding year:** [M] H1 says "Since 1985"; [M] SRP CMS copy says "Since 1984".
- **Miami naming:** display name "duPont REGISTRY Miami" vs alias `…select--miami`.
- **Miami phone:** area code 615 (Nashville) for a Miami location.
- **SoCal hours:** labelled "ET" for a California location.
- **"West Coast" (brief) vs "SoCal" (dR):** the location naming differs.
- **Photo location labels vs dealer:** listings 619511, 628930 and 602011 sit under dealer SoCal, but their photo #1 is branded "NAPLES" (619511 and 602011 were shot outdoors in a Florida setting). Listing 626362 sits under dealer Miami but its photo #1 is branded "SOCAL".
- **Placeholder reassignment on dR itself:** 6 Naples listings display a photo of a different car (car-577122, a 2019 911 GT3 RS). **Never use it for those listings (CP7).**
- **Model naming:** listing 573723 is titled "2000 Nissan GT-R"; the VIN prefix BNR34 indicates an R34 Skyline GT-R. Recorded as listed.

---

## Photo library index

Originals sit in `assets/source/<listingId>_<slug>/NN_<cdn-name>.(jpg|png)`. Downloaded from `https://d2ujs0u2ekt0bo.cloudfront.net/car/car-<id>/photo/<name>.jpg`, which is the CDN original with the `/cache/width_N/` prefix removed. Larger widths return 403. 9 files are PNG originals. No file was AI-modified or re-encoded. First 8 frames in gallery order per listing; full photo-URL lists are in `data/inventory.json → allPhotoSourceUrls`. **Totals: 20 listings with photos, 155 images** (48 Select listings recorded). Prices and mileage are dated 2026-10-08 (CP5). **Every photo #1 has a baked "duPont REGISTRY | LOCATION" lockup.**

| ID | Loc (dealer) | Vehicle | Price | Miles | Images | Flags |
|---|---|---|---|---|---|---|
| 635440 | Naples | 2018 Porsche 911 GT2 RS | $869,950 | 4,074 | 3 (639px) | low-res |
| 626362 | Miami | 2024 Cadillac CT5 | $109,950 | 1,812 | 8 (767px) | #1 says SOCAL |
| 598087 | Miami | 2024 Mercedes-Benz Maybach S 580 | $136,950 | 19,531 | 8 (1024px) | — |
| 584674 | Miami | 2024 Porsche 911 GT3 | $309,980 | 977 | 8 (1024px) | — |
| 628929 | SoCal | 2006 Ford GT | $700,073 | 9,181 | 8 (1920) | — |
| 635055 | SoCal | 2009 Aston Martin DBS | $187,875 | 25,406 | 8 (1920) | interiors #5–8 |
| 628930 | SoCal | 2027 Chevrolet Corvette ZR1 | $350,055 | 25 | 8 (1920) | #1 says NAPLES |
| 626613 | SoCal | 2015 Ferrari 458 Speciale | $1,369,075 | 6,042 | 8 (1920) | — |
| 635078 | SoCal | 2021 McLaren 765LT | $799,987 | 8,195 | 8 (1920) | — |
| 573723 | SoCal | 2000 Nissan GT-R (R34) | $285,075 | 41,863 | 8 (1920) | naming |
| 619511 | SoCal | 2021 Lamborghini Huracán STO | null (data = 0) | 7,051 | 8 (1920) | outdoor; #1 says NAPLES |
| 636828 | SoCal | 2019 Porsche 911 Speedster | $580,075 | 3,110 | 8 (1920) | — |
| 602202 | SoCal | 2015 Porsche 918 Spyder | $2,990,070 | 20,466 | 8 (1920) | — |
| 638928 | SoCal | 2020 Ferrari 488 Pista | $1,029,955 | 9,226 | 8 (1920) | — |
| 602011 | SoCal | 1961 Mercedes-Benz 190 SL | $150,479 | 28,026 | 8 (1920) | outdoor; #1 says NAPLES |
| 636254 | SoCal | 2023 Porsche 911 Sport Classic | $720,075 | 3,028 | 8 (1920) | — |
| 624911 | SoCal | 2007 Ferrari F430 | $290,071 | 6,988 | 8 (1920) | — |
| 621645 | SoCal | 2017 Ferrari 488 Spider | $430,075 | 5,037 | 8 (1920) | — |
| 617636 | SoCal | 2018 Porsche 911 GT2 RS | $739,955 | 6,395 | 8 (1920) | — |
| 616146 | SoCal | 2024 Lamborghini Revuelto | $660,075 | 1,409 | 8 (1920) | — |

`assets/source/_dr-cms-marketing-not-inventory/`: dR homepage CMS hero images. They are **not listings**, cannot be attributed to any vehicle for sale, and their rights origin is unknown (possibly OEM or third-party):
- `DR-marketplace-heroimage-desktop-3.webp`, 2792×1400. Dark studio, Lamborghini Aventador SVJ.
  - Downloaded from `https://d2ujs0u2ekt0bo.cloudfront.net/cms_uploads/DR%20marketplace%20heroimage%20desktop%203.webp`.
  - Found on https://www.dupontregistry.com/ (homepage DOM; this exact unsuffixed URL was referenced there alongside the -900x451/-1400x702/-1920x963 variants), accessed 2026-10-08.
- `desktop-auction-background-image.webp`, 2994×1367. White Porsche 918 Spyder on black, with a baked red gradient.
  - Downloaded from `https://d2ujs0u2ekt0bo.cloudfront.net/cms_uploads/desktop%20auction%20background%20image.webp`.
  - Found on https://www.dupontregistry.com/ (homepage DOM), accessed 2026-10-08.
  - Note: my record shows only the sized variants (-900x411, -1400x639, -1920x877) on the page. I derived the unsuffixed URL by removing the size suffix (HTTP 200); my record does not show whether the page references the unsuffixed URL itself.

### Hero shortlist

This is a report on the frames, not a selection. **No inventory frame is dark or moody, and none reaches 2000px.**

1. `assets/source/_dr-cms-marketing-not-inventory/DR-marketplace-heroimage-desktop-3.webp`. The only true dark frame ≥2000px. Profile view; subject in the upper-centre band; large dark negative space in the lower ~40%. Not inventory.
2. `assets/source/_dr-cms-marketing-not-inventory/desktop-auction-background-image.webp`. Black ground; subject lower-centre-right; open upper-left and top band (red gradient baked in). Not inventory.
3. `assets/source/626613_2015-ferrari-458-speciale/06_2015-ferrari-458--speciale-1369075-1059166736.jpg`, 1920×1280. Black car, front three-quarter, on a white cyc. Subject in the centre band; open top third and floor.
4. `assets/source/635055_2009-aston-martin-dbs/04_2009-aston--martin-dbs-187875-1649375302.jpg`, 1920×1280. Black DBS front three-quarter on white cyc. Subject centre-right; open left and top.
5. `assets/source/619511_2021-lamborghini-huracan-sto/02_2021-lamborghini-huracan--sto-0-2026409407.jpg`, 1920×1280. Outdoor daylight profile (Florida setting). Subject in the centre band; busy palms and fence behind; paving fills the lower third.
6. `assets/source/628929_2006-ford-gt/06_2006-ford-gt-700073-1935098049.jpg`, 1920×1280. Red car, front three-quarter, white cyc. Subject centre-right.
7. `assets/source/616146_2024-lamborghini-revuelto/06_2024-lamborghini-revuelto-660075-1172014235.jpg`, 1920×1280. Doors up, front three-quarter; vertical mass reaches the upper frame.
8. `assets/source/602011_1961-mercedes-benz-190-sl/02_1961-mercedes-benz-190--sl-150479-1923690470.jpg`, 1920×1280. Outdoor profile; low subject; upper half is background.

## Screens (`research/screens/`)

- `dupontregistry-home_1920_2026-10-08.png`
- `dr-live-home_1920_2026-10-08.png`
- `dr-dealer-select-socal_1920_…`, `dr-dealer-select-naples_1920_…`, `dr-dealer-miami_1920_…`
- `dupontregistryselect-com-parked_2026-10-08.png`

## Reference notes

Reference analysis deferred to design vault (client instruction 2026-10-08).
Previous "iBuy" map concept: **absent**. No trace was found on dR properties or the web.

---

**Non-negotiable vs open.** The brand's own material makes only these things non-negotiable:
- the name and casing "duPont REGISTRY Select" (and the per-location dealer names as published);
- the stacked Select lockup and the dR wordmark as drawn, in monochrome;
- the verified location facts above.

Everything else is open, and it is undefined rather than mandated: the red value, typography, spacing, voice, and the treatment of photography. Choosing among them is a design decision.
