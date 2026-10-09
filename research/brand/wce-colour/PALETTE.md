# West Coast Exotic Cars (duPont REGISTRY Select dealer site): colour extraction

- **Source:** https://www.westcoastexoticcars.com/ (homepage only). Accessed 2026-10-08. This is also where https://www.dupontregistry.com/select 308-redirects to.
- **Agent:** brand-extractor. Extraction only. No value here has been chosen, harmonised or corrected.
- **Why:** Alex, 2026-10-08, named this site as the **working colour reference** for the client note "Current color scheme, but open to refresh — definitely keep red but like the dark concept". **Client confirmation is still pending.**
- **Conflict on record:** the project CLAUDE.md feedback log and PROVENANCE.md (client, 2026-10-08) both say "West Coast Exotics website is not a reference." Alex's new instruction narrows that to **colour only**. Layout, typography, copy and imagery from this site stay **not a reference**.
- **Status of these values:** they are **what a reference site currently ships**. They are **not** brand-mandated values. No duPont REGISTRY Select brand book has been found (see PROVENANCE.md).
- **Method:**
  1. Playwright Chromium, true 1920×1080 CSS viewport, DPR 1.
  2. Read computed styles on every rendered element: text colour, background colour, borders, and SVG fill and stroke.
  3. Weighted text by character count and backgrounds by box area. The area weights include off-screen carousel slides, so they over-count dark slide grounds.
  4. Sampled pixel-area frequency on the full-page render (1920×5756).
  5. Took authored-value frequency from all 27 compiled stylesheets plus inline `<style>`.
  6. Read button and nav colours at rest and on hover (after the 0.7 s transition settled).
  7. Read the header at rest and after scrolling 900 px.
- **Scripts and raw dumps:** in the session scratchpad (`wce.cjs`, `wce2.cjs`, `wce-result*.json`, `wce-css.json`). They are not part of the project.

## 1. Ledger

Confidence key:
- **measured** = a computed style, matched by the authored CSS.
- **measured (incidental)** = a real value, but from a plugin or used fewer than 3 times.
- **raster** = sampled from a PNG, so it carries compression and colour-management error.

### Reds

| Token role | HEX | Where found | How obtained | Frequency | Confidence |
|---|---|---|---|---|---|
| Primary red (brand accent) | **`#AC1D28`** (rgb 172,29,40) | theme `style.css` (`/wp-content/themes/aanWordpress/assets/css/style.css`): `.primary-btn` bg, `a.get-price` bg ("VIEW CAR DETAILS"), `header .navbar-nav li a:hover` and `li.current-menu-item a` bg, dropdown `ul` bg, `a`/`a:hover` colour, `.red-color`, `.section-title:after` 100×5 px underline bars, `.contact-btn` text (white button), `.buy-car .section-title span` ("YOUR CAR", 70 px), scrollbar thumb, preloader, check/compare icons | computed + authored | 51 authored uses in theme CSS. Computed: 12 visible red-ground buttons. **1.39 % of full-page pixels** (exact match). All red-family pixels together ≈ 1.94 % | measured |
| Primary red, near-duplicate | **`#AC1E28`** (rgb 172,30,40) | inline `<style>` (later addition): `#btnSubmit_newsletter_subscribe` bg (`!important`), `.site-footer .footer-col-title::after` 2 px underline, `.footer-copyright` border-top 1 px, `.footer-copyright p` and `p a` text | computed + authored | Footer only. 0.17 % of pixels | measured — **contradiction C1** |
| Deep red (gradient partner) | `#560F14` | theme `style.css`: `.car-detail-slider.owl-theme .owl-nav .owl-prev/.owl-next` = `linear-gradient(#560f14 → #ac1d28)` | authored only. Vehicle-detail page component, **not rendered on the homepage** | 7 authored | measured (authored, not seen rendered) |
| Framework red (unused) | `#DC3545` | `:root --red` (Bootstrap 4 default, bundled in `style.css`) | computed custom property | Defined, not used by any rendered element | measured (incidental) |
| Review-widget star red | `#D32323` | `path.yrw-stars-*` fill (Yelp reviews plugin) | computed SVG fill | 25 paths | measured (incidental, third-party) |
| Logo-raster red | `#EA3323` | red pixels in the PNG inside `select-wcec_wcec.svg` / `wcec2.svg` (West Coast Exotic Cars wordmark) | raster sample | 0.2 % of the logo's opaque pixels | raster |

### Dark neutrals

| Token role | HEX | Where found | How obtained | Frequency | Confidence |
|---|---|---|---|---|---|
| Page ground | **`#303137`** | `html, body { background-color }`. Also `.slider .home-slider .item`, `.inventory-car-details` (card body), `.header-shadow`, `footer .map .direction`, `.id-new-block` | computed + authored | **16.0 % of pixels**. Plus a cloud of photographic near-neighbours (`#2F3035`, `#303136`, `#2E2F34` …) from the textured section background images | measured |
| Header / footer / price-plate ground | **`#000000`** | `header#header.fixed-top` bg, at rest **and** scrolled (`.shrink.addbg`, unchanged). `footer.site-footer` bg. `a.view-details` (price plate). `.car-name` (card title band) | computed + authored | **16.2 % of pixels** (largest single value) | measured |
| Review card ground | `#333333` | `.rplg-box` (business-reviews plugin) | computed | 2.0 % of pixels, 54 elements | measured (third-party widget) |
| Form field ground (newsletter) | `#303030` | `input#fname`, `input#email` | computed | 2 elements | measured (incidental) |
| Popout form ground | `#181818` | `.popout-section .inner .form .body` | authored only, not rendered | 1 | measured (authored, not seen) |
| Bootstrap dark (unused) | `#343A40` | `:root --dark` / `--gray-dark` | computed custom property | defined, unused | measured (incidental) |

### Light / ink

| Token role | HEX | Where found | How obtained | Frequency | Confidence |
|---|---|---|---|---|---|
| Primary ink on dark | **`#FFFFFF`** | nav links (Oswald 16 px), headings, body copy, card values, button labels | computed | 103 text elements, ~5,300 chars (≈ 65 % of all rendered text). 10.7 % of pixels (includes white photo backdrops and the Instagram band) | measured |
| Secondary ink (About paragraph) | `#CECECE` | `.about-section p`, 15 px / 300 | computed | 2 paragraphs, 662 chars | measured |
| Footer link ink | `#AFAFAF` | `footer` colour and footer `a`, 17 px / 600 | computed | 15 links | measured |
| Label ink | `#ACACAC` | `.label-text` ("YEAR" / "MILES") | computed | 12 | measured |
| Review name ink | `#EEEEEE` | `.rplg-review-name` | computed | 18 | measured (third-party) |
| Feature heading ink | `#E6E6E6` | `.feature-section h3`, 36 px / 500. Also `footer .map .direction` authored | computed | 2 | measured |
| Body default (overridden) | `#000000` | `html, body { color }`. Overridden almost everywhere | computed | — | measured |
| Light field ground | `#EBEBEB` | `select#year/#make`, `input#model` … (Sell-your-car form) | computed | 5 fields, 1.07 % of pixels | measured |
| White surfaces | `#FFFFFF` | `.inventory-card` photo area, `.contact-btn` bg, form inputs | computed | 21 elements | measured |

### Rules, borders, other accents

| Token role | HEX | Where found | How obtained | Frequency | Confidence |
|---|---|---|---|---|---|
| Red rule | `#AC1D28` (bars) / `#AC1E28` (footer lines) | see the Reds table | computed | 5 section underlines + footer lines | measured |
| Card divider | `#474A5A` | `.view-details-btn` border top and bottom | computed | 12 sides | measured |
| Field border | `#8D8D8D` | newsletter inputs | computed | 8 sides | measured (incidental) |
| Neutral border | `#707070` | `.popout … .body`, `.id-new-block` | authored only | 17 authored | measured (authored) |
| Review box border | `#EDEDED` | `.rplg-box` | computed | 72 sides | measured (third-party) |
| Step-label yellow | `#FFC400` | "Step" micro-label, 10 px (Sell section) | computed | 3 | measured (incidental) |
| Review star orange | `#E7711B` | `.rplg-stars` fill (Google stars) | computed | 95 | measured (third-party) |
| Instagram button blue | `#0068A0` | Smash Balloon plugin "Follow on Instagram" | computed | 1 | measured (third-party) |
| Accessibility widget blue | `#2D68FF` | `#userwayAccessibilityIcon` | computed | 1 | measured (third-party) |
| Bootstrap primary (unused) | `#007BFF` | `:root --primary` | computed custom property | defined, unused | measured (incidental) |

### Overlays and gradients

- No `::before` / `::after` scrim on the hero.
- The hero is a raw `<video>` (`new-video-final-HD-1080p…mp4`) with no overlay.
- No CSS gradient renders on the homepage. The only red gradient is the authored `#560F14 ↔ #AC1D28` gallery arrow on the vehicle-detail page.
- Darkness in the About, Sell and Feature sections comes from **background photographs** (`about-bg.jpg`, `feature-bg.png`, the `.buy-car` image). It does not come from colour tokens.
- Shadows (authored): `rgba(0,0,0,.27)` `.header-shadow`, `rgba(0,0,0,.4)` cards. Recorded for completeness only.

### Hover states (measured after the transition)

- **Nav links:** `#FFFFFF` text on transparent → `#FFFFFF` on `#AC1D28`, with 5 px top radius.
- **`.primary-btn`, `a.get-price`, `.contact-btn`:** no colour change on hover. Computed values are identical at rest and on hover.
- **`.banner-content .action-item`:** authored `#AC1D28` bg with **`#000`** text → hover `#000` bg with `#AC1D28` text. This is not rendered on the current homepage (the hero is video).

### Type families (note only, **not a reference**)

- Arial 300–700: ~80 % of text.
- Oswald 400/500: nav, buttons, card titles.
- Plus Jakarta Sans 300–600: footer and newsletter.

## 2. Contrast pairs actually used

Ratios are WCAG 2.x relative luminance, computed from the computed RGB values. Thresholds per color-taste I1: 4.5 normal, 3.0 large (≥ 24 px, or ≥ 19 px bold).

| Text | Ground | Ratio | Size / weight | Used on | AA |
|---|---|---|---|---|---|
| `#FFFFFF` | `#000000` | 21.00 | 14–21 px | header utility, nav, price plates | pass |
| `#FFFFFF` | `#303137` | 12.96 | 14–50 px | card values, headings, body | pass |
| `#FFFFFF` | `#333333` | 12.63 | 14 px | review text | pass |
| `#FFFFFF` | `#AC1D28` | **7.09** | 16 px / 400 | "VIEW CAR DETAILS", "VIEW ALL INVENTORY", nav hover, form submit | pass |
| `#FFFFFF` | `#AC1E28` | 7.07 | 16 px / 600 | newsletter "Subscribe" | pass |
| `#AC1D28` | `#FFFFFF` | 7.09 | 18 px | "CALL US" white button | pass |
| `#EEEEEE` | `#303137` | 11.17 | 16 px / 700 | review names | pass |
| `#E6E6E6` | `#303137`\* | 10.39 | 36 px | Feature headings (over a background image) | pass\* |
| `#AFAFAF` | `#000000` | 9.57 | 17 px / 600 | footer links | pass |
| `#CECECE` | `#303137`\* | 8.24 | 15 px / 300 | About body (over a background image) | pass\* |
| `#ACACAC` | `#303137` | 5.71 | 16 px | YEAR / MILES labels | pass |
| `#777777` | `#FFFFFF` | **4.48** | 14 px | review text (white review variant) | **fail** (normal) |
| **`#AC1E28`** | **`#000000`** | **2.97** | 13 px | footer copyright and legal links | **fail** (normal and large) |
| **`#AC1D28`** | **`#303137`**\* | **1.83** | 70 px / 400 | "YOUR CAR" (Sell heading, over a background image) | **fail** (large 3.0) |
| `#FFC400` | `#303137`\* | 8.12 | 10 px | "Step" label | pass, but 10 px is under the 14 px floor (typography-taste) |
| `#427FED` | `#FFFFFF` | 3.82 | 12 px / 700 | review author links (plugin) | **fail** |
| `#00A3FF` | `#FFFFFF` | 2.73 | 13 px / 600 | review flash name (plugin) | **fail** |

\* The ground is the nearest opaque ancestor colour. A **background photograph sits between the text and that ground**. These rows are **not glyph-pixel measured (color-taste I6)**, so the ratio on the real render may be higher or lower. Treat them as nominal.

Reference pairs the site does not use, computed for comparison only:
- `#AC1D28` on `#000000`: 2.96. This **fails** as text, and also fails the 3:1 UI-boundary threshold by 0.04.
- `#560F14` on `#000000`: 1.47.
- `#FFFFFF` on `#560F14`: 14.25.

## 3. Gaps (what the source does not define)

- **No brand colour system.** The theme defines no custom properties of its own. The only `:root` colour variables are Bootstrap 4 defaults (`--red #dc3545`, `--primary #007bff`, `--dark #343a40` …), and none of them is used by rendered elements. Every brand value is a hard-coded literal.
- **No hover or active red.** Primary buttons do not change colour on hover. No darker or lighter red is defined for pressed, hover or disabled states. `#560F14` exists only as a gallery-arrow gradient stop.
- **No focus state colour** was found for buttons or links. Focus rings were not tested by keyboard in this pass, so this is **not verified**.
- **No red that passes AA as text on the dark grounds.** `#AC1D28` reaches only 1.83 on `#303137` and 2.96 on `#000`. The site uses red as text on dark anyway (footer legal text, the "YOUR CAR" heading).
- **No dark ladder.** There are two hard grounds (`#000000`, `#303137`) plus plugin greys (`#333333`, `#303030`). No raised-surface step or rule colour is defined for dark grounds, except `#474A5A` on card dividers.
- **No ink ladder.** The greys `#CECECE`, `#AFAFAF`, `#ACACAC`, `#EEEEEE` and `#E6E6E6` are one-off literals, not a scale.
- **Inner pages not measured** (inventory, VDP, financing, sell). Only the homepage was scanned. `#560F14` and the `.action-item` hover are known from CSS only.
- **The logo's red is a raster.** `#EA3323` from an embedded PNG is approximate. The vector Select lockup (`dupont-registry-select_lockup_white.svg`) is a **single fill `#fff`** and carries no red.
- **Mobile / 390 px** not measured. The palette is not expected to change, but this is not verified.

## 4. Contradictions (not normalised)

- **C1, primary red drift:** `#AC1D28` (theme `style.css`, 51 uses) vs `#AC1E28` (inline footer and newsletter styles). They differ by 1 in G and are visually identical (ΔE76 ≈ 0.2). These are two hand-typed literals, not one token.
- **C2, two dark grounds:** `#000000` (header, footer, price plates) and `#303137` (page body, cards) carry about equal pixel area (16.2 % vs 16.0 %). Neither is declared primary.
- **C3, framework red vs brand red:** `:root --red: #DC3545` (Bootstrap) coexists with the hard-coded `#AC1D28`. The variable is dead.
- **C4, three third-party reds/oranges:** `#D32323` (Yelp stars) and `#E7711B` (Google stars) sit beside the brand red on the same page. Also `#EA3323` in the WCE logo raster.
- **C5, body ink:** authored `html, body { color: #000 }` on a `#303137` ground (1.6:1 if it ever surfaced). It is overridden to `#FFFFFF` on nearly every element.
- **C6, red on black:** `.action-item` authors `#000` text on `#AC1D28` (2.96, fails). The rendered buttons use `#FFF` on `#AC1D28` (7.09, passes). These are two conventions for the same red.

## 5. Comparison with the duPont REGISTRY Live / auction reds (PROVENANCE.md)

Reported only. No choice is made here.

| Red | HSL | CIELAB L / a / b | ΔE76 to `#AC1D28` | White-on ratio | On `#000` |
|---|---|---|---|---|---|
| WCE `#AC1D28` | 355.4°, 71 %, 39 % | 37.5 / 55.7 / 32.1 | — | 7.09 | 2.96 |
| dR Live `#C10E34` | 347.3°, 86 %, 41 % | 41.1 / 64.6 / 30.0 | **9.8** | 6.21 | 3.38 |
| dR accent `#E4002B` | 348.7°, 100 %, 45 % | 47.8 / 74.2 / 44.7 | 24.7 | 4.85 | 4.33 |
| dR deep `#7A0822` | 346.3°, 88 %, 25 % | 25.0 / 45.9 / 18.6 | 20.8 | 11.14 | — |
| WCE deep `#560F14` | 355.8°, 70 %, 20 % | 17.3 / 32.2 / 17.0 | — (ΔE 15.8 to `#7A0822`) | 14.25 | 1.47 |

- WCE's red is **warmer** than the dR Live red: hue 355° vs 347°, so less crimson and more brick.
- It is **less saturated** (71 % vs 86 %) and **slightly darker** (L 37.5 vs 41.1).
- The nearest dR value is `#C10E34`, at ΔE 9.8. The difference is clearly visible, not a rounding drift.

## 6. What this source makes non-negotiable, and what it leaves open

**Non-negotiable:** nothing. This is a dealer site's shipped CSS, not a brand mandate.

**Facts it establishes:**
- The red the client is likely looking at is `#AC1D28` (with the `#AC1E28` twin).
- It is used as a **solid ground for white labels** (7.09:1) and as thin rules.
- It sits on a **two-ground dark scheme**, `#000000` + `#303137`, with `#FFFFFF` as the dominant ink.
- Red covers about 2 % of the page area.

**What it leaves open:**
- the red's hover, pressed and focus values;
- any red usable as text on dark (none of the measured reds passes 4.5 on `#000`/`#303137`);
- a dark ladder;
- an ink ladder;
- whether `#000` or `#303137` is "the" dark.
