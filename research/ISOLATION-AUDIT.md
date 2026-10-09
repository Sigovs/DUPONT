# Project isolation audit — 2026-10-08

Rule (Alex): **global design knowledge is reusable; client project content is isolated.** Reusable = TASTE.md, design_dna
skills/rules/dialects, vault judgements, gate lessons. Isolated = other clients' research, inventory, photography, concepts,
client info, project-specific decisions.

## 1. Murrieta — verified, from duPont REGISTRY itself
- Listing: https://www.dupontregistry.com/car/porsche/918--spyder/2015/WP0CA2A16FS800439/602202
  Re-verified live in a browser by the orchestrator on 2026-10-08. The page shows: "2015 Porsche 918 Spyder · Murrieta, CA ·
  $2,990,070 · 20,466 miles · VIN WP0CA2A16FS800439 · Stock # DR800439 · Published 09/30/2026", dealer block
  "duPont REGISTRY Select SoCal", "+1 (951) 292-6100", showroom "26900 Jefferson Ave".
- Dealer record: https://www.dupontregistry.com/dealer/dupont--registry--select--socal/814 (brand-extractor, 2026-10-08).
- Note: the inventory record says dateListed 2026-06-28; the page shows "Published: 09/30/2026". Treat as a dR data
  discrepancy; the render uses "as of 8 Oct 2026" only.
- Verdict: **keep.** Murrieta is the location of the client's own "West Coast" Select dealer as published by duPont REGISTRY.
  The public name for that location (SoCal vs West Coast) is still an open question for Alex.

## 2. Data and photography — all from duPont REGISTRY
| Item | Source | Status |
|---|---|---|
| data/inventory.json — 48 listings | all `listingUrl` on www.dupontregistry.com; dealers: Select SoCal 36, Select Naples 7, duPont REGISTRY Miami 5 | clean |
| assets/source/<listing>/ — 155 photos | all 1,605 recorded photo URLs on d2ujs0u2ekt0bo.cloudfront.net (dR listing CDN, `car/car-<listingId>/`) | clean |
| assets/source/_dr-cms-marketing-not-inventory/ — 2 frames | duPont REGISTRY marketing (see §4 for exact URLs) | source URL being recovered |
| research/brand/logos/ | duPont REGISTRY properties | clean |
| research/out-of-scope/west-coast/ | West Coast Exotics site (dR-owned Select dealer) — quarantined; only the Select lockup SVG is authorised (Alex, 2026-10-08) | quarantined |
| Business facts | dupontregistry.com dealer pages, news.dupontregistry.com, live.dupontregistry.com | clean |

No file in this project was copied from another client project folder. No image, listing, price or fact originates outside
the duPont REGISTRY ecosystem.

## 3. References to other projects in direction/ and research/ — classification
| Where | Reference | Kind | Verdict |
|---|---|---|---|
| ART-DIRECTION §1, §2, §6, §7, §13, §14; INPUTS.md | Chicago Motor Cars concept-2 / index2-spine / standing-frames rejections | design_dna gate lessons (TASTE §7a, C20) — used as *principles* (don't make locations the proposition; mono/ruled metadata lowered perceived value; avoid lot/floor metaphor) | allowed — global knowledge; no CMC content reused |
| ART-DIRECTION §1, §8 | lux-cars, Vegas Auto Gallery | `projects:check` self-similarity check — used only to make this build *different* | allowed — global knowledge |
| ART-DIRECTION §1, §10 | vault `chicagomotorcars-com` footer location cards | client-requested structural reference (BRIEF: "footer location cards may take structural inspiration from CMC and Marshall Goldman"). It is Alex's own prior build — flagged, not counted as evidence. Only the information order is used | allowed by the brief — flagged for Alex |
| vault-curator | read `C:\____WORK\CHICAGO MOTOR CARS\index.html` once to establish authorship of the live CMC block | read-only; nothing copied into this project | noted |

## 4. Marketing frames and lockup — source URLs (recovered by brand-extractor, accessed 2026-10-08)
| File | Original URL | Found on |
|---|---|---|
| DR-marketplace-heroimage-desktop-3.webp | https://d2ujs0u2ekt0bo.cloudfront.net/cms_uploads/DR%20marketplace%20heroimage%20desktop%203.webp | www.dupontregistry.com homepage referenced this exact URL (+ -900/-1400/-1920 sizes) |
| desktop-auction-background-image.webp | https://d2ujs0u2ekt0bo.cloudfront.net/cms_uploads/desktop%20auction%20background%20image.webp | homepage referenced only sized variants; original derived by dropping the size suffix (HTTP 200) |
| dupont-registry-select_lockup_white.svg | https://www.westcoastexoticcars.com/wp-content/themes/aanWordpress/assets/images/wcec3.svg | header logo of westcoastexoticcars.com, reached via 301 from https://www.dupontregistry.com/select — logo use authorised by Alex |

Both frames live on duPont REGISTRY's own CMS bucket (`cms_uploads/`) — client marketing assets; rights origin of the
photography itself still unknown, private prototype only. **Audit result: no cross-project contamination found.**
