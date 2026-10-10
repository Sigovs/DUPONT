"""V4 storyboard revision 2 - frame generator (static frames only, no site code).

Car layers are independently replaceable: each car is a group  .car.car--{ferrari|ford|porsche}
holding .car__shadow (multiply ground plate today; Alex's alpha shadow later) and .car__body (alpha cut-out).
Positioning is by ANCHOR (bottom-centre of the body bbox: bbox centre-x, contact line) and rendered
body width W, never by source scale. Each asset declares data-anchor / data-bbox in its own pixels.
To drop in a final cut-out: replace ASSETS[...] (file, bbox, anchor, shadow file/box); the layout
table FRAMES does not change.
"""
import json, os, re, sys
from PIL import Image

ROOT = "C:/____WORK/DU PONT REGESTRY/"
B = ROOT + "site_v1/v4/storyboard/build/"
IMG = B + "img2/"
os.makedirs(IMG, exist_ok=True)
META = json.load(open(B + "cutouts/cutouts_meta.json"))

IVORY, GRAPHITE, RED, PEWTER, SILVER = "#F0EEE9", "#303137", "#AC1D28", "#66676B", "#A7A9AD"


def asset(key, metakey):
    m = META[metakey]
    x0, y0, x1, y1 = m["cut_bbox"]
    return dict(body=B + f"cutouts/{metakey}_cutout.png", bbox=(x0, y0, x1, y1),
                anchor=((x0 + x1) / 2, m["cut_line"]),
                shadow=B + f"cutouts/{metakey}_plate.png", shadow_box=tuple(m["plate_box"]))


ASSETS = {"ferrari": asset("ferrari", "f430"), "ford": asset("ford", "ford"), "porsche": asset("porsche", "p911")}
ZBODY = {"ferrari": 1, "porsche": 2, "ford": 3}

# per-frame layout: (anchor x, anchor y, W)  - from STORYBOARD.md rev 2 section 5
FRAMES = {
    "F1": {"ferrari": (428.5, 763, 479), "porsche": (1553.5, 787, 487), "ford": (881, 846, 762)},
    "F2": {"ferrari": (182, 842, 730), "porsche": (1824.5, 875, 711), "ford": (940, 905, 946)},
    "F3": {"ferrari": (-323, 900, 1026), "porsche": (2044.5, 920, 934), "ford": (1010, 896, 1039)},
    "F4": {"ford": (1010, 283, 1103)},
    "F5": {},
}
F1_DX = float(os.environ.get("F1_DX", "0"))   # car-group shift for the SELECTED. alignment rule

GAUGES = ROOT + "assets/source/635055_2009-aston-martin-dbs/06_2009-aston--martin-dbs-187875-827962918.jpg"
WHEEL = ROOT + "assets/source/626613_2015-ferrari-458-speciale/07_2015-ferrari-458--speciale-1369075-1861828170.jpg"
P1_WIN, P2_WIN = (0, 200, 1060, 1280), (640, 340, 1280, 860)

_done = set()
REPORT = {}


def _save(key, fn):
    if key not in _done:
        fn()
        _done.add(key)


def car_group(name, ax, ay, W, dpr, fid):
    a = ASSETS[name]
    x0, y0, x1, y1 = a["bbox"]
    bw = x1 - x0
    s = W / bw
    acx, acy = a["anchor"]
    out = [f'<div class="car car--{name}" data-anchor-x="{ax}" data-anchor-y="{ay}" data-w="{W}">']
    for layer, path, box in (("car__shadow", a["shadow"], a["shadow_box"]), ("car__body", a["body"], a["bbox"])):
        bx0, by0, bx1, by1 = box
        L = round(ax + (bx0 - acx) * s)
        T = round(ay + (by0 - acy) * s)
        Wd = round((bx1 - bx0) * s)
        Hd = round((by1 - by0) * s)
        ds = min(s * dpr, 1.0)
        pw, ph = round((bx1 - bx0) * ds), round((by1 - by0) * ds)
        key = f"{name}_{layer}_{pw}x{ph}.png"
        if layer == "car__body":
            _save(key, lambda: Image.open(path).convert("RGBa").resize((pw, ph), Image.LANCZOS).convert("RGBA").save(IMG + key))
        else:
            _save(key, lambda: Image.open(path).convert("RGB").resize((pw, ph), Image.LANCZOS).save(IMG + key))
        z = 0 if layer == "car__shadow" else ZBODY[name]
        out.append(f'<img class="{layer}" src="img2/{key}" alt="" data-anchor="{acx:.1f},{acy}" data-bbox="{bx0},{by0},{bx1},{by1}" '
                   f'style="left:{L}px;top:{T}px;width:{Wd}px;height:{Hd}px;z-index:{z}">')
        if dpr == 1:
            REPORT.setdefault(fid, {})[f"{name}.{layer}"] = dict(scale=round(s, 4), dpr2_upsample=round(max(1, s * 2), 2),
                                                                box=[L, T, L + Wd, T + Hd])
    out.append("</div>")
    return "".join(out)


def photo(name, src, win, x, y, dpr, z):
    wx0, wy0, wx1, wy1 = win
    w, h = wx1 - wx0, wy1 - wy0
    key = f"{name}_{w}x{h}.jpg"           # 1:1 window; at DPR 2 the browser upsamples (noted in report)
    _save(key, lambda: Image.open(src).convert("RGB").crop(win).save(IMG + key, quality=95))
    return f'<img class="col col--{name}" src="img2/{key}" alt="" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:{z}">'


def logo_svg(fill):
    s = open(ROOT + "research/out-of-scope/west-coast/logos/dupont-registry-select_lockup_white.svg", encoding="utf-8").read()
    s = re.sub(r"<\?xml[^>]*>", "", s).replace("fill: #fff;", f"fill: {fill};")
    return s.replace("<svg ", '<svg class="logo" aria-label="duPont REGISTRY | SELECT" role="img" ', 1)


CHEV = '<svg class="chev" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
ARROW = '<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'


def chrome(logo_ink, nav_ink, index=True):
    nav = ["Inventory", "Locations", "Services", "Finance", "About", "Contact"]
    items = "".join(f'<li>{n}{CHEV if n == "Services" else ""}</li>' for n in nav)
    h = '<div class="chrome">'
    h += f'<a class="logo-wrap">{logo_svg(logo_ink)}</a>'
    h += f'<ul class="nav lbl" data-right="1800" data-baseline="70" style="color:{nav_ink}">{items}</ul>'
    if index:
        h += f'<div class="lbl idx" data-right="1800" data-baseline="1032" style="color:{GRAPHITE}">01 / 08</div>'
    return h + "</div>"


def t(cls, content, x=None, baseline=None, right=None, style="", ident=""):
    a = f' data-baseline="{baseline}"' if baseline is not None else ""
    if right is not None:
        a += f' data-right="{right}"'
    if ident:
        a += f' id="{ident}"'
    st = f"left:{x}px;" if x is not None else ""
    return f'<div class="abs {cls}"{a} style="{st}{style}">{content}</div>'


def rule(x, y):
    return f'<div class="rule" style="left:{x}px;top:{y}px"></div>'


CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:{IVORY}}}
body{{font-family:Manrope,"Helvetica Neue",Arial,sans-serif;color:{GRAPHITE};-webkit-font-smoothing:antialiased}}
.stage{{position:relative;width:1920px;height:1080px;overflow:hidden;background:{IVORY};isolation:isolate}}
.abs{{position:absolute;white-space:nowrap;z-index:20}}
.car{{position:absolute;inset:0;pointer-events:none}}
.car img,.col{{position:absolute;display:block}}
.car__shadow{{mix-blend-mode:multiply}}
.lbl{{font-size:14px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;line-height:1}}
.disp{{font-family:"Bodoni Moda",serif;font-variation-settings:"opsz" 96;font-weight:400;text-transform:uppercase;line-height:1}}
.chrome{{position:absolute;inset:0;z-index:50;pointer-events:none}}
.logo-wrap{{position:absolute;left:120px;top:40px;height:48px;display:block}}
.logo{{height:48px;width:auto;display:block}}
.nav{{position:absolute;list-style:none;display:flex;gap:40px;white-space:nowrap}}
.nav li{{display:flex;align-items:center;gap:8px}}
.idx{{position:absolute}}
.rule{{position:absolute;width:24px;height:2px;background:{RED};z-index:20}}
.deck{{font-size:17px;line-height:28px;font-weight:400}}
.cta{{position:absolute;display:flex;align-items:center;justify-content:center;gap:12px;background:{RED};color:{IVORY};width:268px;height:52px;z-index:20}}
.mq{{font-size:15px;font-weight:500;letter-spacing:.08em;line-height:1}}
.rec{{font-size:14px;font-weight:500;letter-spacing:.04em;line-height:1}}
"""


def page(fid, dpr):
    body = ['<div class="stage">']
    for name, (ax, ay, W) in FRAMES[fid].items():
        if fid == "F1":
            ax += F1_DX
        body.append(car_group(name, ax, ay, W, dpr, fid))
    if fid == "F1":
        body.append(rule(120, 174))
        body.append(t("lbl", "Southern California · Naples · Miami", x=120, baseline=200))
        body.append(t("disp", f'The Registry, <span id="sel" style="color:{RED}">Selected.</span>', x=120, baseline=312,
                      style="font-size:76px;letter-spacing:.02em"))
        body.append(t("deck", "Exceptional cars, chosen one at a time —", x=1360, baseline=200))
        body.append(t("deck", "and three showrooms to see them in.", x=1360, baseline=228))
        body.append(f'<div class="cta lbl" style="left:1360px;top:260px">View the collection{ARROW}</div>')
        body.append(t("rec", "2007 Ferrari F430 · 2006 Ford GT · 2023 Porsche 911 Sport Classic — at Select SoCal", x=120, baseline=1032))
    elif fid == "F2":
        body.append(rule(120, 150))
        body.append(t("lbl", "Murrieta, CA · Naples, FL · Miami, FL", x=120, baseline=176))
        body.append(t("disp", "Three showrooms.", x=120, baseline=256, style="font-size:64px;letter-spacing:.02em"))
        body.append(t("disp", "One collection.", x=120, baseline=324, style="font-size:64px;letter-spacing:.02em"))
    elif fid == "F3":
        body.append(rule(120, 174))
        body.append(t("lbl", "2006 Ford GT — Select SoCal", x=120, baseline=200))
    if fid in ("F4", "F5"):
        off = 235 if fid == "F4" else 0
        p1y, p2y = (476, 690) if fid == "F4" else (0, 560)
        body.append(photo("gauges", GAUGES, P1_WIN, 860, p1y, dpr, 1))
        body.append(photo("wheel", WHEEL, P2_WIN, 520, p2y, dpr, 2))
        body.append(t("lbl", "Browse by marque", x=120, baseline=640 + off, style=f"color:{PEWTER}"))
        for i, mq in enumerate(["FERRARI", "PORSCHE", "LAMBORGHINI", "McLAREN", "ASTON MARTIN", "FORD"]):
            body.append(t("mq", mq, x=120, baseline=680 + 32 * i + off))
        body.append(t("lbl", "SoCal · Naples · Miami", x=120, baseline=896 + off, style=f"color:{PEWTER}"))
        body.append(f'<div class="cta lbl" style="left:120px;top:{960 + off}px">View all inventory{ARROW}</div>')
    if fid == "F5":
        body.append(rule(120, 170))
        body.append(t("lbl", "02 — The Collection", x=120, baseline=196))
        body.append(t("disp", "Chosen,", x=120, baseline=316, style="font-size:88px;letter-spacing:.01em"))
        body.append(t("disp", "One at a time.", x=120, baseline=404, style="font-size:88px;letter-spacing:.01em", ident="h2"))
        body.append(t("deck", "Every car here was picked by a person, at one of three showrooms.", x=120, baseline=468))
        body.append(t("lbl", "2009 Aston Martin DBS · Select SoCal", right=1800, baseline=1040, style=f"color:{IVORY}"))
        body.append(t("lbl", "2015 Ferrari 458 Speciale · Select SoCal", x=544, baseline=1040, style=f"color:{IVORY}"))
    if fid in ("F1", "F2", "F3"):
        body.append(chrome(GRAPHITE, GRAPHITE, index=True))
    elif fid == "F5":
        body.append(chrome(GRAPHITE, IVORY, index=False))
    body.append("</div>")
    fonts = ('<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..900&family=Manrope:wght@400;500;600&display=block" rel="stylesheet">')
    js = """<script>
async function layout(){
  await document.fonts.ready;
  for (const el of document.querySelectorAll('[data-baseline]')){
    const probe=document.createElement('span');
    probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
    (el.tagName==='UL'?el.lastElementChild:el).appendChild(probe);
    el.style.top='0px';
    const b=probe.getBoundingClientRect().top - el.getBoundingClientRect().top;
    el.style.top=(+el.dataset.baseline - b)+'px';
    probe.remove();
  }
  for (const el of document.querySelectorAll('[data-right]')){
    const ls=parseFloat(getComputedStyle(el).letterSpacing)||0;
    const w=el.getBoundingClientRect().width;
    el.style.left=(+el.dataset.right - w + (ls>0?ls:0))+'px';
  }
  document.body.dataset.ready='1';
}
layout();
</script>"""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1920">'
            f'<title>V4 storyboard r2 {fid}</title>{fonts}<style>{CSS}</style></head><body>{"".join(body)}{js}</body></html>')


if __name__ == "__main__":
    for fid in FRAMES:
        for dpr in (1, 2):
            open(B + f"{fid}_{dpr}x.html", "w", encoding="utf-8").write(page(fid, dpr))
    json.dump(REPORT, open(B + "layers_r2.json", "w"), indent=1)
    print(json.dumps(REPORT))
