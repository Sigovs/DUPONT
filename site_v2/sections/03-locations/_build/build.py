"""Builds sections/03-locations/section.html (map paths are long — kept out of hand-edited markup).
Run: python site/sections/03-locations/_build/build.py   (then python site/_build/gen.py)

Facts: data/inventory-rebuild.json (accessed 8 Oct 2026). Counts = listings per inScopeLocation in that file,
which equal the dealer-SRP pass-2 counts recorded 8 Oct 2026 (SoCal 52 · Miami 5 · Naples 7).
Map: us.json from map.mjs (us-atlas states-10m, Albers) — see map.mjs header.
Photo: listing 607112 frame 009 (1960 Corvette) photographed at the Naples building, 2365 Linwood Ave. — identified by
the duPont REGISTRY pillar signs + the street number on the glazing (research/PROVENANCE-REBUILD.md §8.2).
"""
import json, pathlib, html, urllib.parse, collections

HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent
ROOT = SEC.parents[2]                      # _____TEST FINAL
MAP = json.loads((HERE / "us.json").read_text())
INV = json.loads((ROOT / "data" / "inventory-rebuild.json").read_text(encoding="utf-8"))
COUNT = collections.Counter(l["inScopeLocation"] for l in INV["listings"])
DATE = "8 Oct 2026"

# west → east, the order the drawing reads. lab: where the label sits (r = right, l = lower-left leader, d = lower-right leader)
ROOMS = [
    dict(k="socal", key="SOCAL", city="Southern California", l1="26900 Jefferson Ave,", l2="Murrieta, CA 92562",
         tel="+19512926100", phone="(951) 292-6100", lab="r"),
    dict(k="naples", key="NAPLES", city="Naples", l1="2365 Linwood Ave.,", l2="Naples, FL 34112",
         tel="+12394499191", phone="(239) 449-9191", lab="l"),
    dict(k="miami", key="MIAMI", city="Miami", l1="5972 NE 4th Ave,", l2="Miami, FL 33137",
         tel="+16154710221", phone="(615) 471-0221", lab="d"),
]
e = html.escape
ARR = '<svg class="ic" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6h9.5M6.5 2l4 4-4 4"/></svg>'
OUT = '<svg class="ic" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9l6.5-6.5M4 2.5h5.5V8"/></svg>'
IMG = "{P}sections/03-locations/img/naples-showroom"
SRCSET = f"{IMG}-1080.webp 1080w, {IMG}-1920.webp 1920w"
ALT = ("The duPont REGISTRY Select Naples showroom at 2365 Linwood Ave.: a red 1960 Corvette on the paved forecourt, "
       "a duPont REGISTRY sign on the dark entrance pillar, red Ferraris visible through the glazing")


def maps_url(r):
    return "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote_plus(
        f"duPont REGISTRY Select, {r['l1']} {r['l2']}")


def kern(t):
    """Bodoni Moda caps open a hole between N and A (the N's hairline diagonal + the A's left stroke): tighten the pair."""
    import re
    t = re.sub(r"([A-Za-z])(?=[Nn])", r'<span class="kpn">\1</span>', t)   # any letter before N: N's hairline left stem reads as a gap
    return re.sub(r"([Nn])(?=[Aa])", r'<span class="kna">\1</span>', t)


def m(t, cls=""):
    return f'<span class="m"><span class="ln{(" " + cls) if cls else ""}">{t}</span></span>'


markers, rows = [], []
for r in ROOMS:
    x, y = MAP["pts"][r["k"]]
    n = COUNT[r["key"]]
    markers.append(
        f'<button type="button" class="loc-mk loc-mk--{r["lab"]} loc-mk--{r["k"]}" data-room="{r["k"]}" '
        f'style="left:{x / MAP["W"] * 100:.2f}%;top:{y / MAP["H"] * 100:.2f}%" aria-controls="loc-{r["k"]}" aria-pressed="false" '
        f'aria-label="{e(r["city"])} showroom, {n} cars listed">'
        f'<span class="loc-mk__dot" aria-hidden="true"></span><span class="loc-mk__lead" aria-hidden="true"></span>'
        f'<span class="loc-mk__l" aria-hidden="true">{e(r["city"])}</span></button>')
    rows.append(f'''
          <li class="loc-room" id="loc-{r["k"]}" data-room="{r["k"]}">
            <div class="loc-room__in">
              <h3 class="loc-room__city">{kern(e(r["city"]))}</h3>
              <p class="loc-room__addr">{e(r["l1"])}<br>{e(r["l2"])}</p>
              <p class="loc-room__tel"><a href="tel:{r["tel"]}" aria-label="Call {e(r["city"])}, {r["phone"]}">{r["phone"]}</a></p>
              <p class="loc-room__n"><span class="loc-room__fig">{n}</span> cars listed<br>as of {DATE}</p>
              <p class="loc-room__acts">
                <a class="loc-link loc-link--go" href="inventory.html?showroom={r["k"]}">See inventory here {ARR}</a>
                <a class="loc-link" href="{e(maps_url(r))}" target="_blank" rel="noopener">Directions {OUT}<span class="sr"> (opens Google Maps in a new tab)</span></a>
              </p>
            </div>
          </li>''')

total = sum(COUNT[r["key"]] for r in ROOMS)
TEMPLATE = (HERE / "section.tpl.html").read_text(encoding="utf-8")
out = (TEMPLATE
       .replace("{{EYEBROW_A}}", m("About Select") + m('<span class="nw">One registry ·</span> <span class="nw">three showrooms</span>'))
       .replace("{{HEAD_A}}", m(kern("One name.")))
       .replace("{{CAP_A}}", m("In the frame: the Naples showroom") + m("2365 Linwood Ave., Naples, Florida"))
       .replace("{{EYEBROW_B}}", m("Locations") + m(f'<span class="nw">{total} cars ·</span> <span class="nw">three showrooms ·</span> <span class="nw">as of {DATE}</span>'))
       .replace("{{HEAD_B}}", m("Three") + m(kern("destinations.")))
       .replace("{{CAP_PLATE}}", m("The Naples showroom · 2365 Linwood Ave."))
       .replace("{{IMG}}", IMG).replace("{{SRCSET}}", SRCSET).replace("{{ALT}}", e(ALT))
       .replace("{{W}}", str(MAP["W"])).replace("{{H}}", str(MAP["H"]))
       .replace("{{STATES}}", MAP["states"]).replace("{{NATION}}", MAP["nation"])
       .replace("{{MARKERS}}", "".join(markers)).replace("{{ROOMS}}", "".join(rows)))
assert "{{" not in out
(SEC / "section.html").write_text(out, encoding="utf-8")
print("section.html written", dict(COUNT), total)
