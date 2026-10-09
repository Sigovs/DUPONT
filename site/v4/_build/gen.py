"""V4 page generator — writes site/v4/index.html and site/v4/inventory.html.

Inputs (single sources of truth):
  assets/js/v4-assets.js   window.V4_ASSETS — car layers (path, anchor, width per frame) + scene photos
  assets/data/inventory.js window.DRS       — inventory (copied from V1, generated from data/inventory.json)
  ../_build/us-path.json                    — V1 map drawing (ported, unchanged)

The runtime (assets/js/cars.js) re-positions the car layers from V4_ASSETS, so swapping a cut-out
needs no regeneration. Re-run this only to refresh the no-JS fallback markup or copy:
    python -I site/v4/_build/gen.py
"""
import html as H
import json
import re

ROOT = "C:/____WORK/DU PONT REGESTRY/"
V4 = ROOT + "site/v4/"
VER = "23"


def load_js_obj(path, var):
    s = open(path, encoding="utf-8").read()
    s = s[s.index(var):]
    return json.loads(s[s.index("{"):s.rindex("}") + 1])


DRS = load_js_obj(V4 + "assets/data/inventory.js", "window.DRS")
ASSETS = load_js_obj(V4 + "assets/js/v4-assets.js", "window.V4_ASSETS")
MAP = json.load(open(ROOT + "site/_build/us-path.json"))
# fix1: the shared drawing is simplified (6 % quantile), so true lon/lat projections of Naples and
# Miami land in the water. V4 places each lamp on the simplified land, verified with isPointInFill
# (inland ≥ 7.5 drawing units): Naples just inland of the Gulf shore, Miami just inland of the
# Atlantic shore, Murrieta inland of the LA coast. The shared us-path.json (V1) is untouched.
MAP["pts"] = dict(MAP["pts"], socal=[128.0, 376.0], naples=[799.0, 556.0], miami=[821.0, 567.0])
L = DRS["listings"]
CARS = {c["id"]: c for c in L}
ASOF = DRS["meta"]["asOf"]
TOTAL = len(L)
COUNT = {k: sum(1 for c in L if c["loc"] == k) for k in ("socal", "naples", "miami")}


def esc(s):
    return H.escape(str(s), quote=True)


def money(p):
    return "${:,}".format(p) if p else "Price not listed"


# ------------------------------------------------------------------ showrooms (research/brand/PROVENANCE.md)
SHOWROOMS = [
    dict(key="socal", city="Southern California", short="SoCal", dealer="duPont REGISTRY Select SoCal",
         place="Murrieta, CA", addr1="26900 Jefferson Ave", addr2="Murrieta, CA 92562",
         tel="+19512926100", phone="(951) 292-6100",
         maps="https://www.google.com/maps/dir/?api=1&destination=26900+Jefferson+Ave%2C+Murrieta%2C+CA+92562",
         hours="Mon–Fri 9–6 · Sat 10–5 · Sun closed", hours_note="Published as “ET” — time zone to confirm",
         line="Murrieta, in the Inland Empire."),
    dict(key="naples", city="Naples", short="Naples", dealer="duPont REGISTRY Select Naples",
         place="Naples, FL", addr1="2365 Linwood Ave.", addr2="Naples, FL 34112",
         tel="+12394499191", phone="(239) 449-9191",
         maps="https://www.google.com/maps/dir/?api=1&destination=2365+Linwood+Ave%2C+Naples%2C+FL+34112",
         hours="Hours not published — call ahead", hours_note="",
         line="On Florida’s Gulf coast."),
    dict(key="miami", city="Miami", short="Miami", dealer="duPont REGISTRY Miami",
         place="Miami, FL", addr1="5972 NE 4th Ave", addr2="Miami, FL 33137",
         tel="+16154710221", phone="(615) 471-0221",
         maps="https://www.google.com/maps/dir/?api=1&destination=5972+NE+4th+Ave%2C+Miami%2C+FL+33137",
         hours="Hours not published — call ahead", hours_note="615 number as published — to confirm",
         line="North of Downtown, off NE 4th Avenue."),
]

LOGO = open(V4 + "assets/img/brand/dupont-registry-select_lockup.svg", encoding="utf-8").read()
LOGO = re.sub(r"<\?xml[^>]*>", "", LOGO)
LOGO = re.sub(r"<defs>.*?</defs>", "", LOGO, flags=re.S).replace(' class="cls-1"', "")
LOGO = re.sub(r'<svg[^>]*viewBox="([^"]+)"[^>]*>',
              r'<svg viewBox="168.9 140.9 1708.4 370.3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" focusable="false">', LOGO, count=1).strip()

ARROW = '<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
NEARR = '<span class="nearr" aria-hidden="true">&nearr;</span>'
CHEV = '<svg class="chev" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'


def m(text, cls=""):
    """one line in its own clip: .m (mask) > .l (moving line)"""
    return f'<span class="m"><span class="l{(" " + cls) if cls else ""}">{text}</span></span>'


# ------------------------------------------------------------------------------------------- chrome
def head(title, desc, css, extra=""):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="data:,">
  <script>(function(d){{d.classList.add('js');try{{if(!/inventory/.test(location.pathname)&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches){{d.classList.add('intro');setTimeout(function(){{d.classList.remove('intro');}},3000);}}}}catch(e){{}}}})(document.documentElement);</script>
  <link rel="preload" href="assets/fonts/bodoni-moda-opsz-roman-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/manrope-var-latin.woff2" as="font" type="font/woff2" crossorigin>
{extra}  <link rel="stylesheet" href="assets/vendor/lenis.css">
""" + "".join(f'  <link rel="stylesheet" href="assets/css/{c}?v={VER}">\n' for c in css) + "</head>\n"


def nav(page):
    home = "" if page == "home" else "index.html"
    inv_cur = ' aria-current="page"' if page == "inventory" else ""
    return f"""  <a class="skip t-label" href="#main">Skip to content</a>
  <header class="hdr" data-hdr data-ink="dark">
    <a class="hdr__logo" href="{home or '#top'}" aria-label="duPont REGISTRY Select — home">{LOGO}</a>
    <nav class="hdr__nav t-label" aria-label="Main">
      <ul>
        <li><a href="inventory.html"{inv_cur}>Inventory</a></li>
        <li><a href="{home}#locations">Locations</a></li>
        <li class="has-sub">
          <button type="button" class="hdr__sub-toggle" aria-expanded="false" aria-controls="sub-services" data-sub-toggle>Services{CHEV}</button>
          <ul class="hdr__sub" id="sub-services" hidden>
            <li><a href="{home}#insurance">Insurance</a></li>
            <li><a href="{home}#service">Service</a></li>
            <li><a href="{home}#ppf">Paint protection film</a></li>
          </ul>
        </li>
        <li><a href="{home}#finance">Finance</a></li>
        <li><a href="{home}#about">About</a></li>
        <li><a href="{home}#showrooms">Contact</a></li>
      </ul>
    </nav>
    <button type="button" class="hdr__menu t-label" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>Menu</button>
  </header>
  <div class="mmenu" id="mobile-menu" hidden data-lenis-prevent>
    <nav aria-label="Main (mobile)">
      <ul class="mmenu__list">
        <li><a href="inventory.html">Inventory</a></li>
        <li><a href="{home}#locations">Locations</a></li>
        <li><a href="{home}#services">Services</a>
          <ul class="mmenu__sub t-label">
            <li><a href="{home}#insurance">Insurance</a></li>
            <li><a href="{home}#service">Service</a></li>
            <li><a href="{home}#ppf">Paint protection film</a></li>
          </ul></li>
        <li><a href="{home}#finance">Finance</a></li>
        <li><a href="{home}#about">About</a></li>
        <li><a href="{home}#showrooms">Contact</a></li>
      </ul>
    </nav>
    <p class="t-label mmenu__h">Call a showroom</p>
    <div class="mmenu__calls">
""" + "".join(f'      <a href="tel:{s["tel"]}"><span>{s["city"]}</span><span class="t-num">{s["phone"]}</span></a>\n' for s in SHOWROOMS) + """    </div>
  </div>
"""


def fmark(key):
    """footer location mark: a crop of the V1 map drawing with this showroom lit"""
    if key == "socal":
        vb = (10, 230, 256, 160)
    else:
        vb = (690, 470, 192, 120)
    k = 128 / vb[2]
    dots = ""
    for kk in (["socal"] if key == "socal" else ["naples", "miami"]):
        x, y = MAP["pts"][kk]
        if kk == key:
            dots += f'<circle cx="{x}" cy="{y}" r="{11 / k:.1f}" class="fmark__ring"/><circle cx="{x}" cy="{y}" r="{4 / k:.1f}" class="fmark__core"/>'
        else:
            dots += f'<circle cx="{x}" cy="{y}" r="{2 / k:.1f}" class="fmark__dot"/>'
    return (f'<svg class="fmark" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" width="128" height="80" aria-hidden="true" focusable="false">'
            f'<path class="fmark__land" d="{MAP["d"]}"/>{dots}</svg>')


def footer():
    cards = ""
    for i, s in enumerate(SHOWROOMS):
        note = '<sup class="dag" aria-hidden="true">†</sup>' if s["hours_note"] else ""
        cards += f"""        <article class="loc" aria-labelledby="loc-{s['key']}" data-foot-card>
          <p class="loc__no"><span class="loc__n disp">0{i + 1}</span><span class="t-label">{s["place"]}</span></p>
          <h3 class="loc__city" id="loc-{s['key']}">{s['city']}</h3>
          <p class="loc__dealer">{s['dealer']}</p>
          <address class="loc__addr">{s['addr1']}<br>{s['addr2']}</address>
          <dl class="loc__facts">
            <dt>Hours</dt><dd>{s['hours']}{note}</dd>
            <dt>Phone</dt><dd class="t-num">{s['phone']}{'<sup class="dag" aria-hidden="true">†</sup>' if s['key'] == 'miami' else ''}</dd>
          </dl>
          <div class="loc__actions">
            <a class="btn btn--line" href="tel:{s['tel']}">Call<span class="vh"> {s['city']}</span></a>
            <a class="btn btn--line" href="{esc(s['maps'])}" target="_blank" rel="noopener">Directions {NEARR}<span class="vh"> to {s['city']} (opens Google Maps)</span></a>
          </div>
          <a class="loc__more lnk" href="inventory.html?showroom={s['key']}">See {COUNT[s['key']]} cars here {ARROW}</a>
        </article>
"""
    return f"""  <footer class="scene foot" id="showrooms" data-scene="foot" data-ink="light" aria-labelledby="foot-title">
    <span class="anchor" id="contact" aria-hidden="true"></span>
    <div class="foot__in">
      <div class="foot__head">
        <p class="eyebrow t-label"><span class="rule"></span>09 — Showrooms</p>
        <h2 class="foot__title disp" id="foot-title">Visit a showroom.</h2>
        <p class="foot__asof">As published by duPont REGISTRY.<br>Counts as of {ASOF}.</p>
      </div>
      <div class="foot__locs">
{cards}      </div>
      <div class="foot__grid">
        <a class="foot__logo" href="index.html" aria-label="duPont REGISTRY Select — home">{LOGO}</a>
        <nav aria-label="Inventory"><h3 class="t-label">Inventory</h3><ul>
          <li><a href="inventory.html">All {TOTAL} cars</a></li>
          <li><a href="inventory.html?showroom=socal">Southern California</a></li>
          <li><a href="inventory.html?showroom=naples">Naples</a></li>
          <li><a href="inventory.html?showroom=miami">Miami</a></li></ul></nav>
        <nav aria-label="Services"><h3 class="t-label">Services</h3><ul>
          <li><a href="index.html#insurance">Insurance</a></li>
          <li><a href="index.html#service">Service</a></li>
          <li><a href="index.html#ppf">Paint protection film</a></li>
          <li><a href="index.html#finance">Finance</a></li></ul></nav>
        <nav aria-label="Company"><h3 class="t-label">Company</h3><ul>
          <li><a href="index.html#about">About</a></li>
          <li><a href="index.html#locations">Locations</a></li>
          <li><a href="index.html#sell">Sell your car</a></li>
          <li><a href="index.html#showrooms">Contact</a></li></ul></nav>
        <div><h3 class="t-label">Follow</h3><p class="foot__soc">Instagram<sup class="dag" aria-hidden="true">†</sup></p></div>
      </div>
      <p class="tbc foot__tbc">† To confirm before launch: SoCal hours are published as “ET”; the Miami number is published with a 615 area code; social handles.</p>
      <div class="foot__legal"><span>© 2026 duPont REGISTRY Group</span><span>Prices, miles and counts as of {ASOF}. Private prototype for client presentation — not a live site.</span></div>
    </div>
  </footer>
"""


SCRIPTS = f"""  <script src="assets/data/inventory.js?v={VER}"></script>
  <script src="assets/js/v4-assets.js?v={VER}"></script>
  <script src="assets/vendor/gsap.min.js" defer></script>
  <script src="assets/vendor/ScrollTrigger.min.js" defer></script>
  <script src="assets/vendor/lenis.min.js" defer></script>
  <script src="assets/js/chrome.js?v={VER}" defer></script>
  <script src="assets/js/detail.js?v={VER}" defer></script>
"""


# ------------------------------------------------------------------------------------- car layers
def car_markup(name):
    """static (no-JS) markup for one car group at frame F1 / M1; runtime cars.js re-applies V4_ASSETS"""
    a = ASSETS["cars"][name]
    ax, ay, W = ASSETS["frames"]["F1"][name]
    mx, my, mW = ASSETS["frames"]["M1"][name]
    b, sh = a["body"], a["shadow"]
    s = W / b["w"]
    bl, bt = -b["anchor"][0] * s, -b["anchor"][1] * s
    k = s / sh.get("scale", 1)
    sl, st = -sh["anchor"][0] * k, -sh["anchor"][1] * k
    return (f'<div class="car car--{name}" data-car-layer="{name}" style="--ax:{ax};--ay:{ay};--mx:{mx};--my:{my};--mk:{mW / W:.4f};z-index:{a["z"]}">'
            f'<img class="car__shadow" src="{sh["src"]}" alt="" width="{sh["w"]}" height="{sh["h"]}" '
            f'style="--l:{sl:.1f};--t:{st:.1f};--w:{sh["w"] * k:.1f};--h:{sh["h"] * k:.1f}" decoding="async">'
            f'<img class="car__body" src="{b["src"]}" alt="{esc(a["alt"])}" width="{b["w"]}" height="{b["h"]}" '
            f'style="--l:{bl:.1f};--t:{bt:.1f};--w:{W:.1f};--h:{b["h"] * s:.1f}"{" fetchpriority=" + chr(34) + "high" + chr(34) if name == "ford" else ""} decoding="async">'
            f'</div>')


def photo(key, cls, alt, sizes="100vw", lazy=True):
    p = ASSETS["photos"][key]
    load = ' loading="lazy"' if lazy else ""
    return (f'<picture class="ph {cls}" data-photo="{key}"><source type="image/webp" srcset="{p["webp"]}">'
            f'<img src="{p["jpg"]}" alt="{esc(alt)}" width="{p["w"]}" height="{p["h"]}" style="object-position:{p.get("pos", "50% 50%")}"{load} decoding="async"></picture>')


# --------------------------------------------------------------------------------------- sections
MARQUES = ["Ferrari", "Porsche", "Lamborghini", "McLaren", "Aston Martin", "Ford"]
for mq in MARQUES:
    assert any(c["make"] == mq for c in L), mq


def hero_and_collection():
    cars = "".join(car_markup(n) for n in ("ferrari", "porsche", "ford"))
    marques = "".join(f'<li><a href="inventory.html?make={esc(mq)}">{mq}</a></li>' for mq in MARQUES)
    showrooms = " ".join(f'<a href="inventory.html?showroom={s["key"]}">{s["short"]}</a>' + ("<span aria-hidden=\"true\">·</span>" if i < 2 else "")
                         for i, s in enumerate(SHOWROOMS))
    return f"""    <!-- 01 + 02 · THE APPROACH — one pinned stage (470vh, STORYBOARD.md §6). Static/no-JS/reduced motion: F1 then F5 in flow. -->
    <div class="approach" id="top" data-approach>
      <section class="scene hero" data-scene="hero" data-ink="dark" aria-labelledby="hero-title">
        <div class="hero__cars" data-car-stage aria-hidden="false">{cars}</div>
        <div class="hero__f1" data-f1>
          <p class="eyebrow t-label at" style="--x:120;--y:200"><span class="rule"></span>{m("SoCal · Naples · Miami")}</p>
          <h1 class="hero__h1 disp at" id="hero-title" style="--x:120;--y:312">{m("The Registry,")} {m("Selected.", "red")}</h1>
          <div class="hero__deck at" style="--x:1360;--y:174" data-f1-deck>
            <p class="deck">{m("Exceptional cars, chosen one at a time —")} {m("and three showrooms to see them in.")}</p>
            <a class="btn btn--red hero__cta" href="#collection" data-goto="collection">View the collection {ARROW}</a>
          </div>
          <p class="hero__rec t-rec at" style="--x:120;--y:1032">{m("2007 Ferrari F430 · 2006 Ford GT · 2023 Porsche 911 Sport Classic — at Select SoCal")}</p>
          <p class="hero__idx t-label at at-r" style="--x:1800;--y:1032" aria-hidden="true" data-idx>01 / 09</p>
        </div>
        <div class="hero__f2 motion-only" data-f2>
          <p class="eyebrow t-label at" style="--x:120;--y:176"><span class="rule" data-rule></span>{m("Select SoCal · Murrieta, CA")}</p>
          <p class="hero__h2 disp at" style="--x:120;--y:256">{m("Three cars.")}</p>
          <p class="hero__h2 disp at" style="--x:120;--y:324">{m("The front row.", "")}</p>
        </div>
        <div class="hero__f3 motion-only" data-f3>
          <p class="eyebrow t-label at" style="--x:120;--y:200"><span class="rule" data-rule></span>{m("2006 Ford GT — Select SoCal")}</p>
        </div>
      </section>

      <section class="scene col" id="collection" data-scene="collection" data-ink="split" aria-labelledby="col-title">
        <div class="col__p1" data-p1>{photo("gauges", "col__img", "Instrument panel of the 2009 Aston Martin DBS, as photographed for its listing")}
          <p class="cap t-label">2009 Aston Martin DBS · Select SoCal</p></div>
        <div class="col__p2" data-p2>{photo("wheel", "col__img", "Wheel and carbon-ceramic brake of the 2015 Ferrari 458 Speciale, as photographed for its listing")}
          <p class="cap t-label">2015 Ferrari 458 Speciale · Select SoCal</p></div>
        <div class="col__text" data-col-text>
          <p class="eyebrow t-label at" style="--x:120;--y:196"><span class="rule"></span>{m("02 — The Collection")}</p>
          <h2 class="col__h disp at" id="col-title" style="--x:120;--y:316">{m("Chosen,")}<br>{m('One at a <span class="red">time.</span>')}</h2>
          <p class="deck at" style="--x:120;--y:468">{m("Every car here was picked by a person.")}</p>
        </div>
        <div class="col__index at" style="--x:120;--y:620" data-col-index>
          <p class="t-label t-mute">Browse by marque</p>
          <ul class="col__marques">{marques}</ul>
          <p class="col__rooms t-label t-mute">{showrooms}</p>
          <a class="btn btn--red" href="inventory.html">View all {TOTAL} cars {ARROW}</a>
        </div>
      </section>
    </div>
"""



# fix2: five SoCal studio listings (one cyc), keyed with the non-AI pipeline (_build/rail_cutout.py) and
# standing on the ivory floor. White cars key out with the cyc and daylight frames don't match - they stay in
# inventory.html. Layers: assets/img/rail/{id}-{800,1600}.webp (canvas 100:36, tyre contact at 86 %).
RAIL = ["602202", "626613", "635078", "636828", "617636"]
SHOWNAME = {"socal": "Select SoCal", "naples": "Select Naples", "miami": "Miami"}


def picture_car(img, sizes, alt):
    def ss(ext):
        return ", ".join(f'{img["base"]}-{w}.{ext} {w}w' for w in img["w"])
    mid = img["w"][min(1, len(img["w"]) - 1)]
    return (f'<picture><source type="image/avif" srcset="{ss("avif")}" sizes="{sizes}"><source type="image/webp" srcset="{ss("webp")}" sizes="{sizes}">'
            f'<img src="{img["base"]}-{mid}.jpg" srcset="{ss("jpg")}" sizes="{sizes}" width="1200" height="800" alt="{esc(alt)}" loading="lazy" decoding="async"></picture>')


def rail():
    """fix1: editorial rail — no card chrome, no chips, one quiet link per car, one section CTA.
    Motion (>=1280): scenes.js places every car on one floor line; the car in focus is full size,
    neighbours are smaller photographs with their title and price only (never greyed)."""
    cards = ""
    for i, cid in enumerate(RAIL):
        c = CARS[cid]
        assert c["img"], cid
        miles = "{:,} miles".format(c["miles"]) if c["miles"] is not None else "Miles not listed"
        drive = re.sub(r"^\w+\s*\((.*)\)$", r"\1", c.get("drive") or "")
        spec = " · ".join(x for x in [c.get("ext") if c.get("ext") not in (None, "Other") else None, c.get("trans"), drive.capitalize() if drive and drive != "Unspecified" else None] if x)
        # compound terms never break at their hyphen ("Rear-wheel drive" stays whole)
        spec_html = " · ".join(f'<span class="nw">{esc(x)}</span>' if "-" in x else esc(x) for x in spec.split(" · ")) if spec else ""
        cards += f"""          <li class="rcard" data-rcard>
            <div class="rcard__ph"><img src="assets/img/rail/{cid}-1600.webp" srcset="assets/img/rail/{cid}-800.webp 800w, assets/img/rail/{cid}-1600.webp 1600w" sizes="(min-width: 1280px) 45vw, 80vw" width="1600" height="576" alt="{esc(c["title"])} in profile, from its listing photograph (temporary cut-out)" loading="lazy" decoding="async"></div>
            <div class="rcard__body">
              <p class="rcard__no t-label"><span class="t-num">0{i + 1}</span> {SHOWNAME[c["loc"]]}</p>
              <h3 class="rcard__title disp">{esc(c["title"])}</h3>
              <p class="rcard__price"><span class="t-num">{money(c["price"])}</span><span class="rcard__asof rcard__more">as of {ASOF}</span></p>
              <p class="rcard__spec rcard__more">{esc(miles)}{(" · " + spec_html) if spec else ""}</p>
              <a class="lnk rcard__go rcard__more" href="{esc(c["url"])}" data-car="{cid}" target="_blank" rel="noopener">View this car {ARROW}<span class="vh"> — the {esc(c["title"])}</span></a>
            </div>
          </li>
"""
    return f"""    <!-- 03 · AVAILABLE NOW — ivory studio floor (fix2). Pinned rail: the car in focus is full size and lit by its own type;
         neighbours are smaller photographs (behaviour after Alex's Robb Francis "Available Now." scene). -->
    <section class="scene rail" id="available" data-scene="rail" data-ink="dark" aria-labelledby="rail-title">
      <div class="rail__head">
        <p class="eyebrow t-label"><span class="rule"></span>{m("03 — Available now")}</p>
        <h2 class="rail__h disp" id="rail-title">{m("Available now.")}</h2>
        <p class="rail__asof">Five of {TOTAL} · prices and miles as of {ASOF}</p>
        <a class="btn btn--red rail__all" href="inventory.html">View all {TOTAL} cars {ARROW}</a>
      </div>
      <div class="rail__view" data-rail-view data-lenis-prevent-touch>
        <ul class="rail__track" data-rail-track>
{cards}        </ul>
      </div>
    </section>
"""


def locations():
    lamps, tabs, panels = "", "", ""
    for i, s in enumerate(SHOWROOMS):
        k = s["key"]
        x, y = MAP["pts"][k]
        on = "true" if k == "socal" else "false"
        lamps += (f'<button type="button" class="lamp lamp--{k}" style="left:{x / MAP["W"] * 100:.2f}%;top:{y / MAP["H"] * 100:.2f}%" '
                  f'aria-pressed="{on}" aria-controls="panel-{k}" data-lamp="{k}" tabindex="-1">'
                  f'<span class="lamp__dot"><span class="lamp__ring"></span><span class="lamp__core"></span></span><span class="vh">{s["city"]}</span></button>')
        tabs += (f'<li><button type="button" class="city" aria-pressed="{on}" aria-controls="panel-{k}" data-lamp="{k}">'
                 f'<span class="city__no t-label">0{i + 1}</span><span class="city__name">{s["city"]}</span>'
                 f'<span class="city__line">{s["line"]}</span></button></li>')
        cars = [c for c in L if c["loc"] == k][:3]
        rows = "".join(f'<li><a href="{esc(c["url"])}" data-car="{c["id"]}" target="_blank" rel="noopener"><span>{esc(c["title"])}</span>'
                       f'<span class="t-num t-mute">{money(c["price"])}</span></a></li>' for c in cars)
        panels += f"""            <div class="spanel" id="panel-{k}" data-panel="{k}" role="region" aria-label="{s['city']} showroom"{'' if k == 'socal' else ' hidden'}>
              <p class="spanel__dealer t-label">{s['dealer']} · {s['place']}</p>
              <p class="spanel__count">{COUNT[k]} cars<span class="spanel__asof t-label">as of {ASOF}</span></p>
              <ul class="spanel__cars">{rows}</ul>
              <div class="spanel__go">
                <a class="lnk" href="inventory.html?showroom={k}">See all {COUNT[k]} {ARROW}</a>
                <a class="lnk" href="{esc(s['maps'])}" target="_blank" rel="noopener">Directions {NEARR}<span class="vh"> (opens Google Maps)</span></a>
                <a class="lnk" href="tel:{s['tel']}">Call <span class="t-num">{s['phone']}</span></a>
              </div>
            </div>
"""
    return f"""    <!-- 03 · ABOUT + LOCATIONS — charcoal. Slides over the held Collection; V1 night-map ported (map.js), framed in a V4 scene. -->
    <section class="scene locs" id="locations" data-scene="locs" data-ink="light" aria-labelledby="locs-title">
      <span class="anchor" id="about" aria-hidden="true"></span>
      <div class="locs__text" data-locs-text>
        <p class="eyebrow t-label"><span class="rule"></span>{m("04 — About · Locations")}</p>
        <h2 class="locs__h disp" id="locs-title">{m("Three")}<br>{m("showrooms.")}</h2>
        <p class="locs__about deck">{m("duPont REGISTRY Select is the showroom side of duPont REGISTRY — three locations the group calls “physical extensions of the duPont REGISTRY brand.”")}</p>
        <p class="locs__src t-mute">Quoted from duPont REGISTRY News, 2026.</p>
      </div>
      <div class="locs__map" data-locs-map>
        <div class="usmap" data-usmap>
          <svg viewBox="0 0 {MAP['W']} {MAP['H']}" role="img" aria-label="Map of the contiguous United States with three showrooms: Southern California, Naples and Miami">
            <path class="usmap__land" d="{MAP['d']}"/>
          </svg>
          {lamps}
        </div>
      </div>
      <ul class="locs__cities" data-locs-cities aria-label="Choose a showroom">{tabs}</ul>
      <div class="locs__panels" data-locs-panels>
{panels}      </div>
    </section>
"""


def sell():
    return f"""    <!-- 05 · SELL YOUR CAR — asymmetric: type on ivory in the Collection's column, a dark close-up on the right 58 %,
         bleeding right and down from under the header band (the nav stays on ivory). One action, no form. -->
    <section class="scene sell" id="sell" data-scene="sell" data-ink="dark" aria-labelledby="sell-title">
      <div class="sell__ph" data-sell-ph>{photo("sell", "sell__img", "Black leather seats with red stitching in the 2009 Aston Martin DBS, as photographed for its listing")}
</div>
      <p class="sell__cap t-label t-mute">2009 Aston Martin DBS · Select SoCal</p>
      <div class="sell__text" data-sell-text>
        <p class="eyebrow t-label"><span class="rule"></span>{m("05 — Sell your car")}</p>
        <h2 class="sell__h disp" id="sell-title">{m("Selling a car")}<br>{m('like <span class="red">these?</span>')}</h2>
        <p class="deck">{m("Talk to the showroom nearest you about")} {m("selling or trading a car of this calibre.")}</p>
        <div class="sell__act">{m(f'<a class="btn btn--red" href="#showrooms" data-goto="showrooms">Talk to a showroom {ARROW}</a>')}</div>
      </div>
    </section>
"""


SERVICES = [
    ("service", "Service", "Maintenance and preparation, before delivery and after it.", "service",
     "V12 engine bay of the 2009 Aston Martin DBS, as photographed for its listing", "2009 Aston Martin DBS"),
    ("insurance", "Insurance", "Cover for collector and exotic cars, arranged through the showroom.", "insurance",
     "Door and shield of the black 2015 Ferrari 458 Speciale, as photographed for its listing", "2015 Ferrari 458 Speciale"),
    ("ppf", "Paint protection film", "Clear film over the paint, fitted before the car leaves.", "ppf",
     "Bonnet and headlamps of the 2018 Porsche 911 GT2 RS, as photographed for its listing", "2018 Porsche 911 GT2 RS"),
]


def services():
    panels = ""
    for i, (sid, name, line, ph, alt, car) in enumerate(SERVICES):
        panels += f"""        <article class="svc__panel{' svc__panel--lead' if i == 0 else ''}" id="{sid}" data-svc-panel aria-labelledby="svc-{sid}">
          <div class="svc__ph">{photo(ph, "svc__img", alt)}</div>
          <div class="svc__body">
            <p class="svc__no t-label">0{i + 1}</p>
            <h3 class="svc__name disp" id="svc-{sid}">{name}</h3>
            <p class="svc__line">{line}<sup class="dag" aria-hidden="true">†</sup></p>
            <a class="lnk" href="#showrooms" data-goto="showrooms">Ask a showroom {ARROW}</a>
            <p class="svc__cap t-mute">{car} · Select SoCal</p>
          </div>
        </article>
"""
    return f"""    <!-- 05 · SERVICES — graphite. Three-panel band (Insurance · Service · PPF); Finance as its own line. -->
    <section class="scene svc" id="services" data-scene="svc" data-ink="light" aria-labelledby="svc-title">
      <div class="svc__head" data-svc-head>
        <p class="eyebrow t-label"><span class="rule"></span>{m("06 — Services")}</p>
        <h2 class="svc__h disp" id="svc-title">{m("Ownership, looked after.")}</h2>
        <p class="svc__tbc tbc">† Service descriptions to confirm with each showroom.</p>
      </div>
      <div class="svc__band" data-svc-band>
{panels}      </div>
      <div class="svc__fin" id="finance" data-svc-fin>
        <p class="t-label">Finance</p>
        <p class="svc__fin-line">Ways to own the car, arranged with the showroom.</p>
        <a class="lnk" href="#showrooms" data-goto="showrooms">Ask about finance {ARROW}</a>
      </div>
    </section>
"""


QUOTES = [
    ("The car was exactly as described, down to the last mark on the sill.", "Sample review — owner, Southern California"),
    ("They found the car we had been looking for, and told us what it needed.", "Sample review — owner, Naples"),
    ("Delivery was arranged around our schedule, not theirs.", "Sample review — owner, Miami"),
]


def reviews():
    q1, q2, q3 = QUOTES
    return f"""    <!-- 06 · REVIEWS — ivory. DEMO: sample copy, not real customer reviews (content-provenance CP4). -->
    <section class="scene rev" id="reviews" data-scene="rev" data-ink="light" aria-labelledby="rev-title">
      <div class="rev__head">
        <p class="eyebrow t-label"><span class="rule"></span>07 — From owners</p>
        <h2 class="vh" id="rev-title">Reviews</h2>
        <p class="demo demo--dark">Demo · sample reviews — not real customer quotes. Review source to confirm.</p>
      </div>
      <figure class="rev__q rev__q--1" data-rev="1">
        <blockquote class="disp"><p>{m("“The car was exactly")} {m("as described, down to the")} {m('last mark on the <span class="red">sill.</span>”')}</p></blockquote>
        <figcaption class="t-label t-mute">{q1[1]}</figcaption>
      </figure>
      <figure class="rev__q rev__q--2" data-rev="2">
        <blockquote class="disp"><p>“{q2[0]}”</p></blockquote>
        <figcaption class="t-label t-mute">{q2[1]}</figcaption>
      </figure>
      <figure class="rev__q rev__q--3" data-rev="3">
        <blockquote class="disp"><p>“{q3[0]}”</p></blockquote>
        <figcaption class="t-label t-mute">{q3[1]}</figcaption>
      </figure>
    </section>
"""


IG = [
    ("ig-dbs-cabin", "635055", "Cabin, 2009 Aston Martin DBS"),
    ("ig-sto-rear", "619511", "2021 Lamborghini Huracán STO"),
    ("ig-190sl", "602011", "1961 Mercedes-Benz 190 SL"),
    ("ig-458-front", "626613", "2015 Ferrari 458 Speciale"),
    ("ig-sto-front", "619511", "2021 Lamborghini Huracán STO"),
    ("ig-revuelto-doors", "616146", "2024 Lamborghini Revuelto"),
    ("ig-190sl-top", "602011", "1961 Mercedes-Benz 190 SL, top up"),
    ("ig-fordgt-rear", "628929", "2006 Ford GT"),
    ("ig-sto-side", "619511", "2021 Lamborghini Huracán STO"),
]


def instagram():
    cols = [IG[0:3], IG[3:6], IG[6:9]]
    shapes = [["t", "s", "w"], ["w", "t", "s"], ["s", "w", "t"]]
    html_cols = ""
    for ci, col in enumerate(cols):
        items = ""
        for ti, (f, cid, cap) in enumerate(col):
            c = CARS[cid]
            items += (f'<li class="ig__tile ig__tile--{shapes[ci][ti]}"><a href="{esc(c["url"])}" data-car="{cid}" target="_blank" rel="noopener">'
                      f'<img src="assets/img/scene/{f}.jpg" alt="{esc(cap)}, as photographed for its listing" loading="lazy" decoding="async">'
                      f'<span class="ig__cap t-mute">{esc(cap)}</span></a></li>')
        html_cols += f'<ul class="ig__col ig__col--{ci + 1}" data-ig-col="{ci + 1}">{items}</ul>'
    return f"""    <!-- 07 · INSTAGRAM — charcoal. DEMO feed: real dR listing photographs, handle to confirm. -->
    <section class="scene ig" id="instagram" data-scene="ig" data-ink="dark" aria-labelledby="ig-title">
      <div class="ig__head" data-ig-head>
        <p class="eyebrow t-label"><span class="rule"></span>08 — Instagram</p>
        <h2 class="ig__h disp" id="ig-title">{m("Seen at Select.")}</h2>
        <p class="demo">Demo feed · listing photographs from duPont REGISTRY. Instagram handle to confirm.</p>
      </div>
      <div class="ig__wall" data-ig-wall>{html_cols}</div>
    </section>
"""


# fix2 · closing bookend (STORYBOARD §8, the Forge finale held for the close): the hero trio from the REAR,
# small, on the ivory floor. Rear frames 04 of the three listings, keyed like the hero (rear_cutout.py).
# Stage: Ford centre-front (contact y 900), flanks a step back (y 884) and tucked 48 px behind it.
CLOSE = [("624911", 490, 884, 500, 1), ("628929", 960, 900, 600, 3), ("636254", 1430, 884, 500, 2)]


def closer():
    cars = ""
    for cid, cx, cy, w, z in CLOSE:
        c = CARS[cid]
        cars += (f'<img class="close__car" data-close-car="{cid}" src="assets/img/rail/rear-{cid}-1200.webp" '
                 f'srcset="assets/img/rail/rear-{cid}-600.webp 600w, assets/img/rail/rear-{cid}-1200.webp 1200w" sizes="(min-width: 1280px) 32vw, 40vw" '
                 f'width="1200" height="960" style="--cx:{cx};--cy:{cy};--w:{w};z-index:{z}" '
                 f'alt="{esc(c["title"])} from behind (temporary cut-out of its listing photograph)" loading="lazy" decoding="async">')
    return f"""    <!-- 08b · CLOSE — ivory. The page ends on the three cars it opened with, now seen from behind (bookend). -->
    <section class="scene close" id="close" data-scene="close" data-ink="dark" aria-labelledby="close-title">
      <div class="close__text" data-close-text>
        <h2 class="close__h disp" id="close-title">{m("See them in person.")}</h2>
        <p class="close__line">{m("2007 Ferrari F430 · 2006 Ford GT · 2023 Porsche 911 Sport Classic — at Select SoCal")}</p>
        <a class="btn btn--red close__cta" href="#showrooms" data-goto="showrooms">Find a showroom {ARROW}</a>
      </div>
      <div class="close__cars" data-close-cars>{cars}</div>
    </section>
"""


def index_page():
    preload = ('  <link rel="preload" as="image" href="assets/img/hero/ford_body.webp" type="image/webp" fetchpriority="high">\n')
    out = head("duPont REGISTRY Select — Exotic and collector cars",
               "duPont REGISTRY Select: exotic and collector cars at three showrooms — Southern California, Naples and Miami.",
               ["v4.css"], preload)
    out += '<body class="home">\n' + nav("home") + '  <main id="main">\n'
    out += hero_and_collection() + rail() + locations() + sell() + services() + reviews() + instagram() + closer()
    out += "  </main>\n" + footer()
    out += SCRIPTS + f"""  <script src="assets/js/cars.js?v={VER}" defer></script>
  <script src="assets/js/map.js?v={VER}" defer></script>
  <script src="assets/js/scenes.js?v={VER}" defer></script>
</body>
</html>
"""
    open(V4 + "index.html", "w", encoding="utf-8").write(out)


def inventory_page():
    makes = {}
    for c in L:
        makes[c["make"]] = makes.get(c["make"], 0) + 1
    opts = "".join(f'<option value="{esc(k)}">{esc(k)} ({v})</option>' for k, v in sorted(makes.items()))
    recs = "".join(f'<li class="rec"><a href="{esc(c["url"])}" target="_blank" rel="noopener"><span class="rec__title">{esc(c["title"])}</span>'
                   f'<span class="rec__meta t-num">{"{:,} miles".format(c["miles"]) if c["miles"] is not None else "Miles not listed"}</span>'
                   f'<span class="rec__meta t-num">{money(c["price"])}</span><span class="rec__meta">{ {"socal": "Southern California", "naples": "Naples", "miami": "Miami"}[c["loc"]]}</span>'
                   f'<span class="rec__go">View listing {NEARR}</span></a></li>\n' for c in L)
    out = head("Inventory — duPont REGISTRY Select", f"All {TOTAL} cars at duPont REGISTRY Select — Southern California, Naples and Miami.",
               ["v4.css", "srp.css"])
    out += '<body class="srp-page">\n' + nav("inventory") + f"""  <main id="main">
    <header class="srp-head">
      <p class="eyebrow t-label"><span class="rule"></span>Inventory</p>
      <h1 class="srp-head__h disp">The <span class="red">collection.</span></h1>
      <p class="srp-head__line t-num" data-result-line>{TOTAL} cars · as of {ASOF}</p>
    </header>

    <form class="filters" data-filters role="search" aria-label="Filter inventory" action="inventory.html" method="get">
      <div class="filters__in">
        <div class="field"><label class="field__label" for="f-make">Make</label>
          <select class="select" id="f-make" name="make"><option value="">All makes ({TOTAL})</option>{opts}</select></div>
        <div class="field"><label class="field__label" for="f-model">Model</label>
          <select class="select" id="f-model" name="model" disabled><option value="">Choose a make first</option></select></div>
        <div class="field"><label class="field__label" for="f-sort">Sort by</label>
          <select class="select" id="f-sort" name="sort">
            <option value="featured">Featured</option><option value="price-desc">Price, high to low</option><option value="price-asc">Price, low to high</option>
            <option value="miles-asc">Mileage, low to high</option><option value="newest">Newest listed</option></select></div>
        <div class="field filters__q"><label class="field__label" for="f-q">Keyword</label>
          <input class="input" id="f-q" name="q" type="search" placeholder="Make, model or keyword" autocomplete="off"></div>
        <input type="hidden" name="showroom" id="f-showroom">
        <noscript><button class="btn btn--line" type="submit">Apply</button></noscript>
      </div>
      <div class="filters__chips" data-chips hidden></div>
    </form>

    <section class="results" aria-labelledby="results-title">
      <h2 class="vh" id="results-title">Results</h2>
      <p class="results__status t-num" data-status role="status" aria-live="polite"></p>
      <ul class="results__grid" data-grid hidden></ul>
      <div class="results__empty" data-empty hidden>
        <p class="disp results__empty-h">No cars match.</p>
        <button type="button" class="btn btn--line" data-clear>Clear filters</button>
      </div>
      <section class="records" data-records-wrap aria-labelledby="records-title">
        <div class="records__head"><h2 class="t-label" id="records-title">Photography in preparation</h2><p class="t-mute" data-records-note>Listed on duPont REGISTRY; photographs are not yet available here for these cars.</p></div>
        <ul class="records__list" data-records>
{recs}        </ul>
      </section>
    </section>
  </main>
""" + footer() + SCRIPTS + f"""  <script src="assets/js/srp.js?v={VER}" defer></script>
</body>
</html>
"""
    open(V4 + "inventory.html", "w", encoding="utf-8").write(out)


if __name__ == "__main__":
    index_page()
    inventory_page()
    print("written", TOTAL, COUNT)
