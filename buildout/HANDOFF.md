# duPont REGISTRY Select — front-end handoff

Approved design, 25 November 2026. Dark and light themes, desktop and phone.

- **Home**, **Inventory** (SRP), **Vehicle** (VDP): the approved design.
- **Sub pages from the side menu**, carried over from the live duPont REGISTRY pages (same text, sections and order) in the Select design:
  Sell + Sell form, Insurance + quote form, Protect + quote form, Ship + quote form, Finance & Lease, About, Contact; plus Paint Protection and Service, added by us (both are in the client's Figma navigation).
  The full list, with what was cloned and what was added, is in **PAGES.md**.
- **Events** and **News** in the menu link to dupontregistrygroup.com/events and news.dupontregistry.com. **Locations** link to Inventory filtered by showroom.

`site/` is a clean rebuild of the approved preview (https://sigovs.github.io/DUPONT/site_v6/): same pixels, one set of tokens, readable class names, car data in one JSON file.
Home, Inventory and Vehicle were compared with the approved preview element by element (geometry and computed style) at 6 widths, in both themes, with everything closed and everything open: 80 runs, about 47,000 elements, no differences.

### Page sources

| Page | File | Source |
|---|---|---|
| Sell, Sell form | `sell.html`, `sell-form.html` | dupontregistry.com/sell, /sell-form |
| Insurance, quote | `insurance.html`, `insurance-quote.html` | dupontregistry.com/insurance, /insurance/get-quote |
| Protect, quote | `protect.html`, `protect-quote.html` | dupontregistry.com/protect, /protect/get-quote |
| Ship, quote | `ship.html`, `ship-quote.html` | dupontregistry.com/ship, /ship/get-quote |
| Finance & Lease | `finance.html` | dupontregistry.com/finance (the Customers, Lease, Collectors and Dealers tabs link to the live pages) |
| Paint Protection | `paint-protection.html` | podiumprotectionfilm.com (West Coast Exotic Cars' PPF site); photos are the 765LT listing |
| Service | `service.html` | westcoastexoticcars.com/services (West Coast Exotic Cars' service page); photos are our SoCal showroom and the 765LT listing |
| About | `about.html` | dupontregistry.com/about |
| Contact | `contact.html` | dupontregistry.com/contact (their form is a HubSpot embed; the fields and texts are the same) |

Texts are word for word as on those pages, including their wording. "Most Popular Cars" on Finance shows the six cars listed there on 25 November 2026, with their links.

## Contents

| Folder | What it is |
|---|---|
| `site/` | The front end: plain HTML, CSS and JavaScript. No framework, no build step |
| `reference/` | Full-page screenshots (1440, 1920, 390, dark and light) and key states |
| `source-assets/` | Original photo exports and marque logos, for re-cropping |

Run it from any static server, for example `cd site && python3 -m http.server 8000`. Opening the files directly will not work, because the car data is fetched.

## Not part of this handoff

Outside links and outgoing data are a separate topic. The design is final, the wiring is not:

- Links in the header and footer that leave the site are blocked on purpose (`externalLinks: false` in `config.js`), `tel:` links too. Links that must work in the preview carry `data-external-ok`: Events, News, and the links and phone numbers inside the sub pages. The URLs in the footer still need checking; "Luxury Rally Club" has none.
- Forms validate and show their final state, then stop. They raise an event and send nothing.
- **Only the first step of each form is built.** The later steps run on duPont REGISTRY systems and connect there: Sell (offer flow), Insurance (Modern Metric form, steps Your Vehicle and Background & Goals), Ship (Options, Book, Delivery, Review), Finance pre-qualification (soft credit pull), Finance payment estimator (the Carffordability™ figures show "$--" until it is connected).
- Accounts, search engine settings (`noindex` is on), analytics and cookie consent are not set up.

Remove the "Prototype — nothing was sent" lines in `car.html`, `vehicle.js` and `site.js` when the forms go live.

### Where to connect

```js
document.addEventListener('site:inquiry', e => { /* e.detail */ });
```

| Event | `detail` |
|---|---|
| `site:inquiry` | `{ carId, showroom, intent, fields, replyBy }`. `intent`: `availability`, `viewing`, `trade`, `finance`, `video` |
| `site:send-to-phone` | `{ carId, phone }` |
| `site:subscribe` | `{ email }` |
| `site:account` | none (Log In / Sign Up, and the header account icon) |
| `site:sell` | `{ by: 'plate' \| 'vin' \| 'make', fields }` |
| `site:insurance-quote`, `site:protect-quote`, `site:ship-quote`, `site:paint-quote` | `{ fields }` |
| `site:prequalify` | `{ fields }` (Finance window, includes both consent checkboxes) |
| `site:contact` | `{ fields }` (Contact form, includes the two optional SMS consents) |
| `site:service-appointment` | `{ fields }` (Service appointment request) |

The events fire after validation. The pages show "thank you" straight away, so add sending and error states when connecting.

## Files

```
site/
  index.html  inventory.html  car.html?id=…
  sell.html  sell-form.html  insurance.html  insurance-quote.html  protect.html  protect-quote.html
  ship.html  ship-quote.html  paint-protection.html  service.html  finance.html  about.html  contact.html
  data/inventory.json          cars + showrooms
  data/models.json             makes and models for the Sell and Ship forms (131 makes, as listed on duPont REGISTRY on 25 Nov 2026; replace with the live feed)
  assets/css/  tokens.css → site.css → home.css (Home), catalog.css (Inventory, Vehicle) or pages.css (sub pages). Order matters
  assets/js/   config.js → lenis → site.js → home.js / inventory.js / vehicle.js / pages.js
  assets/img/  hero, marque, marque-logos, showrooms, cars, gallery, instagram, icons, brand
  assets/vendor/lenis          smooth scroll, the only dependency
```

The header, drawer menu, showrooms block and footer are the same markup on all three pages: make them shared partials. Links inside them differ only by an `index.html` prefix. Showroom details appear in this markup and in `inventory.json`; keep one source.

`home.css` is the cleanest starting point. `catalog.css` is long and still has 42 `!important` declarations, because the two pages went through several rounds. It matches the design exactly; treat it as a spec if you rebuild the components in your own stack.

## Tokens (`tokens.css`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--s0` | `#0D0D0D` | `#FAFAFA` | Page |
| `--s1` … `--s4` | `#C6C6C6` at 4, 8, 11, 12% over `--s0` | `#5E5E5E` at 4, 8, 11, 12% | Raised surfaces |
| `--sv` | `#464648` | `#DFDFE5` | Footer |
| `--on` / `--on-strong` | `#F2F2F2` / `#FFFFFF` | `#0D0D0D` / `#000000` | Text / headings |
| `--on-v` | `#C3C3C9` | `#464648` | Secondary text |
| `--outline` / `--outline-v` | `#999999` / `#5C5C5F` | `#747478` / `#C3C3C9` | Control borders / dividers |
| `--acc` / `--on-acc` / `--acc-hi` | `#93CEFF` / `#001D34` / `#B3DCFF` | `#194A71` / `#FFFFFF` / `#123A5A` | Accent fill / text on it / hover |

The accent is defined only here, so a color change is one edit. The exception is the hero button, which has its own values in `home.css`.

**Layout:** content up to 1872px with 24px gutters (16px below 760). 80px between sections (56px below 760). Corners 12px. Header 80px (64px below 760), always visible.
**Theme:** `<html data-theme="dark|light">`, stored in `localStorage` as `dr-theme`; dark is the default. A small inline script in `<head>` sets it before the first paint: keep it there.

### Type

Manrope for headings, Roboto for everything else (self-hosted, Latin subset, variable).

| Role | Desktop | Below 760 |
|---|---|---|
| Hero title | Manrope 700, 60/60 | 32/40 |
| Section title (`.heading`) | Manrope 700, 48/49 | 28/36 |
| Page title, Inventory | Manrope 600, 48/56 | 32/40 |
| Vehicle section titles | Manrope 600, 40/48 | 28/36 |
| Card title | Manrope 600, 20/27 | same |
| Body | Roboto 400, 16/22–29 | 14/20 |
| Labels, meta (minimum size) | Roboto, 14/20 | same |
| Button (`.button`) | Roboto 500, 16/24, 56px high | 14/20, 46px high |

### Breakpoints

`1280` filters go from six to three per row, Inventory grid 4 → 3 · `1152` Vehicle and marques become one column · `1024` Instagram stops pinning, showrooms stack, grid 3 → 2 · `760` phone header and type, filters fold behind one button · `560` grid 2 → 1 · `480`, `360` small fixes. Checked from 320 to 2560.

## Components

| Block | Class | Notes |
|---|---|---|
| Header, drawer menu, search | `.header`, `.drawer` | Drawer 240px, traps focus, closes on Esc. Search goes to `inventory.html?q=` |
| Button | `.button`, `.button--line`, `.button--w` | Filled, outlined, minimum 238px. Hover, pressed and focus are defined; loading and disabled are not designed |
| Catalog button | `.btn`, `.sub__btn` | Older button on the Vehicle page, same look. Worth merging into `.button` |
| Car card | `.car-card` | Photo 2 wipes in on hover. The heart saves to `localStorage` (`sel-saved`) |
| Car rail | `.rail` | Native scroll with snap; arrows and counter follow it |
| Hero | `.hero` | Three photos, separate phone crops, 7s autoplay |
| Marques | `.marques` | Logos are black; the dark theme inverts them |
| Sell | `.sell` | Video plays only in view |
| Reviews | `.reviews` | Sample text, marked as such |
| Instagram | `.instagram` | See Motion |
| Locations | `.locations` | Accordion, one open at a time; the pressed bar stays under the pointer |
| Showrooms, footer | `.showrooms`, `.site-footer` | |
| Sub page blocks | `.page-hero`, `.intro`, `.cover`, `.why`, `.faq`, `.band`, `.vband`, `.ab`, `.duo` | `pages.css`. `.why` pins and swaps photos on wide screens (≥1200×720), stacks elsewhere. `.cover` cards open "Read More" on hover or tap |
| Forms on sub pages | `.sell-form`, `.quote`, `.field`, `.dlg` | Floating labels, inline errors, make → model lists from `data/models.json`. `.dlg` is a native `<dialog>` |
| Filters | `.inv__*` | All state is in the URL: `showroom, make, model, year, pmin, pmax, mi, body, trans, drive, color, q, sort, saved` |
| Vehicle | `.vehicle-grid`, `.vdp__*` | Right column stays in view down to "Estimate a payment" |
| Inquire drawer | `.inq` | Five intents, pre-written message |
| Photo viewer, video | `.lbox`, `.vbox` | Arrow keys, Esc, swipe |

JavaScript hooks are `data-*` attributes; classes are for styling, plus states (`is-on`, `is-open`, `is-in`).

## Motion

- **Smooth scroll:** Lenis. Nested scrollers carry `data-lenis-prevent`.
- **Entrances:** headings rise inside a mask (900ms) and photos open with a hard edge (1000ms), once per section. No fades or blurs on photos.
- **Hero:** hard-edged wipe, 900ms. Autoplay pauses on hover, focus and out of view, and ends after the first interaction.
- **Instagram, 1024 and up:** the heading holds still. All three columns move up at the same speed as the page scrolls and pass under the section above, with a clean edge.
- **Drawer menu:** groups open and close by height (420 ms), so the items below glide.
- **Reduced motion:** no Lenis, no pinning, no entrances, no autoplay. Everything is visible and usable.

## Data (`data/inventory.json`)

`{ meta, showrooms, cars }`. Change `dataUrl` in `config.js` to load a feed of the same shape.

| Car field | Type | Notes |
|---|---|---|
| `id`, `title`, `year`, `make`, `model`, `vin`, `miles`, `drive`, `int` | required | |
| `loc` | `socal`, `naples`, `miami` | Key in `showrooms` |
| `price` | number or `null` | `null` shows "Price on request" |
| `stock`, `body`, `trans`, `ext` | text or `null` | Empty fields are left out of the page |
| `img` | three path stems | Each has `-640.webp` and `-1200.webp`. The card uses photos 2 and 3, because photo 1 carries the dealer logo |
| `gallery` | path stems, optional | `-480.webp` and `-1920.webp`. Without it the page uses `img` |
| `engine`, `headline`, `overview`, `options`, `closing` | optional | From the listing text |
| `basePrice`, `docFee` | optional | Shows the price breakdown |
| `video` | optional | `{ youtube }` or `{ mp4, poster, sample }` |

States to keep: no search results, car no longer listed (`car.html?id=0`), data failed to load. Screenshots are in `reference/`.

Data is as listed on 21 October 2026, 13 cars. Only the 2021 McLaren 765LT (`635078`) has a full gallery (93 photos); four cars have full descriptions. The home page picks its six cars by `id` in `home.js`, and its line "Six of 13 · prices and miles as of 21 Oct 2026" is fixed text.

## To confirm with the client before launch

1. **Photo rights**, including the marque photos (two Figma layers are named like listing photos: Aston Martin and Ford GT) and Instagram posts.
2. **Hours** for Naples and Miami. The pages say "Hours not published"; the Figma file shows the SoCal hours for all three.
3. **Reviews:** the five quotes are samples.
4. **Video:** the Vehicle page uses sample footage (`sample: true`). The Sell video on the home page is 10 MB; compress it or stream it.
5. **Marques:** Lamborghini and Ford are shown, but none of the 13 cars are. "View All" opens the full list for those two.
6. **Pages not built** (footer only): Privacy Policy, Terms and Conditions.

## Two differences from the live preview

Both are fixes: links to a section now stop below the fixed header on every page, and an unknown car id shows "This car is no longer listed" instead of another car. The load-error states are new as well.
