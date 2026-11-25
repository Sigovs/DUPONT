# duPont REGISTRY Select: pages in this package

25 November 2026. 15 pages, every one in dark and light, desktop and phone. Open `site/` from any static server (see HANDOFF.md).

**Cloned** means the page was copied from the live duPont REGISTRY page: same text word for word, same sections in the same order, same form fields. Only the header, the footer, the "Visit a showroom" block and the Select visual design are ours.

## Approved design (client's Figma, approved 25 November 2026)

| Page | File |
|---|---|
| Home | `index.html` |
| Inventory | `inventory.html` |
| Vehicle | `car.html?id=…` |

## Cloned from duPont REGISTRY

| Page | File | Cloned from |
|---|---|---|
| Sell Your Car | `sell.html` | dupontregistry.com/sell |
| Sell form | `sell-form.html` | dupontregistry.com/sell-form |
| Insurance (menu: Services › Insure) | `insurance.html` | dupontregistry.com/insurance |
| Insurance quote | `insurance-quote.html` | dupontregistry.com/insurance/get-quote |
| Protect (menu: Services › Protect) | `protect.html` | dupontregistry.com/protect |
| Protect quote | `protect-quote.html` | dupontregistry.com/protect/get-quote |
| Ship (menu: Services › Ship) | `ship.html` | dupontregistry.com/ship |
| Ship quote | `ship-quote.html` | dupontregistry.com/ship/get-quote |
| Finance & Lease | `finance.html` | dupontregistry.com/finance |
| About | `about.html` | dupontregistry.com/about |
| Contact | `contact.html` | dupontregistry.com/contact |

## Added by us

| Page | File | What it is |
|---|---|---|
| Paint Protection (menu: Services › Paint Protection) | `paint-protection.html` | Not on dupontregistry.com. The text is from podiumprotectionfilm.com, the paint protection film studio of the SoCal showroom. The photos are from the McLaren 765LT listing. We added four short headings because that page has almost none. |

## Menu items that link out

| Menu item | Goes to |
|---|---|
| Events | dupontregistrygroup.com/events |
| News | news.dupontregistry.com |
| Locations › Southern California, Naples, Miami | Inventory filtered by that showroom (`inventory.html?showroom=…`) |

## Not in this package

Privacy Policy and Terms and Conditions (footer only). "Service" in the footer has no page.

## Notes for development

- Each form has its first step only. The later steps run on duPont REGISTRY systems and connect there (HANDOFF.md, "Not part of this handoff").
- "Most Popular Cars" on Finance shows the six cars listed on duPont REGISTRY on 25 November 2026. Make and model lists in the Sell and Ship forms are in `data/models.json` (131 makes). Both come from live feeds in production.
- Screenshots of every page are in `reference/`.
