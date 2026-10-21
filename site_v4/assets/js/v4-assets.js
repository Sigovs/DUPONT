/* =============================================================================
   V4 ASSETS — the ONE map for every replaceable photographic layer (see ../../ASSETS.md).

   CARS. Each car is a group  .car.car--{ferrari|ford|porsche}  holding two layers:
     body   — the alpha cut-out
     shadow — the ground shadow (today: multiply ground plate; later: Alex's alpha shadow)
   Every asset declares its own pixel size and ANCHOR in its own pixels:
     body.anchor   = bottom-centre of the body bbox (bbox centre-x, tyre contact / splitter lip)
     shadow.anchor = the shadow pixel that sits exactly under body.anchor
     shadow.scale  = shadow pixels per body pixel (1 when both come from the same master)
   LAYOUT never uses source scale: FRAMES store (anchor-x, anchor-y, W) in stage units
   (1920 × 1080 desktop stage; 390-wide mobile stage for M1), W = rendered body width.
   → To drop in a final cut-out: change src / w / h / anchor (and shadow.*) here. Nothing else.
   F1 = Figma "hero" (13:75) and F2 = Figma "hero2" (30:118), anchors measured from the frames 2026-10-09.

   PHOTOS. Rectangular, unaltered crops of dR listing photographs (≤ 1:1 at 1920).
   pos = CSS object-position (focal point), kept on purpose per photo.

   The block between the braces is strict JSON (site_v1/v4/_build/gen.py parses it for the
   no-JS fallback markup). Keep double quotes, no comments inside, no trailing commas.
   ============================================================================= */
window.V4_ASSETS = {
  "stage": { "w": 1920, "h": 1080, "mw": 390, "mh": 250 },
  "cars": {
    "ferrari": {
      "alt": "2015 Ferrari 458 Speciale in black, front view",
      "listing": "626613",
      "z": 1,
      "body":   { "src": "assets/img/hero/f458-speciale_body.webp", "w": 1202, "h": 755, "anchor": [601, 755] },
      "shadow": { "src": "assets/img/hero/f458-speciale_shadow.webp", "w": 1484, "h": 1007, "anchor": [768, 859], "scale": 1, "blend": "normal" }
    },
    "porsche": {
      "alt": "2023 Porsche 911 Sport Classic in green, front view",
      "listing": "636254",
      "z": 2,
      "body":   { "src": "assets/img/hero/p911-green_body.webp", "w": 1188, "h": 811, "anchor": [594, 811] },
      "shadow": { "src": "assets/img/hero/p911-green_shadow.webp", "w": 1522, "h": 996, "anchor": [768, 907], "scale": 1, "blend": "normal" }
    },
    "ford": {
      "alt": "2006 Ford GT in red, front view",
      "listing": "628929",
      "z": 3,
      "body":   { "src": "assets/img/hero/ford-gt_body.webp", "w": 1302, "h": 731, "anchor": [651, 731] },
      "shadow": { "src": "assets/img/hero/ford-gt_shadow.webp", "w": 1718, "h": 804, "anchor": [887, 739], "scale": 1, "blend": "normal" }
    }
  },
  "frames": {
    "F1":   { "ferrari": [605, 694.1, 424.1],  "porsche": [1363.5, 705.6, 419.9], "ford": [982.5, 763, 605.2] },
    "F2":   { "ferrari": [45.5, 677.9, 610.5], "porsche": [1886, 694.1, 604],     "ford": [959.5, 811.9, 975.2] },
    "F3":   { "ferrari": [-323, 900, 1026],  "porsche": [2044.5, 920, 934], "ford": [960, 896, 1039] },
    "EXIT": { "ferrari": [-660, 918, 1120],  "porsche": [2500, 936, 1010],  "ford": [960, -200, 1154] },
    "M1":   { "ferrari": [40, 196, 200],     "porsche": [400, 204, 200],    "ford": [195, 228, 330] }
  },
  "photos": {
    "gauges":    { "jpg": "assets/img/scene/col-gauges.jpg",       "webp": "assets/img/scene/col-gauges.webp",       "w": 1060, "h": 1080, "pos": "0% 0%",    "listing": "635055" },
    "wheel":     { "jpg": "assets/img/scene/col-wheel.jpg",        "webp": "assets/img/scene/col-wheel.webp",        "w": 640,  "h": 940,  "pos": "50% 0%",   "listing": "626613" },
    "sell":      { "jpg": "assets/img/scene/sell-dbs-seats.jpg",   "webp": "assets/img/scene/sell-dbs-seats.webp",   "w": 1120, "h": 1280, "pos": "40% 80%",  "listing": "635055" },
    "insurance": { "jpg": "assets/img/scene/svc-insurance.jpg",    "webp": "assets/img/scene/svc-insurance.webp",    "w": 640, "h": 492,  "pos": "50% 50%",  "listing": "626613" },
    "service":   { "jpg": "assets/img/scene/svc-service.jpg",      "webp": "assets/img/scene/svc-service.webp",      "w": 1400, "h": 854,  "pos": "50% 50%",  "listing": "635055" },
    "ppf":       { "jpg": "assets/img/scene/svc-ppf.jpg",          "webp": "assets/img/scene/svc-ppf.webp",          "w": 1160, "h": 707,  "pos": "50% 50%",  "listing": "617636" }
  }
};
