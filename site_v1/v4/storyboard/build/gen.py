"""V4 storyboard - frame generator (static frames only, no site code).

Writes prescaled layers into build/img/ and one HTML per frame per DPR into build/
(F1_1x.html ... F5_2x.html). render.cjs screenshots them with Playwright.
All geometry is taken from STORYBOARD.md section 7; deviations are listed in PROVENANCE.txt.
"""
import json, os, re
import numpy as np
from PIL import Image

ROOT = "C:/____WORK/DU PONT REGESTRY/"
B = ROOT + "site_v1/v4/storyboard/build/"
IMG = B + "img/"
os.makedirs(IMG, exist_ok=True)
META = json.load(open(B + "cutouts/cutouts_meta.json"))

IVORY, GRAPHITE, CHARCOAL, SILVER, RED = "#F0EEE9", "#303137", "#1E1F23", "#A7A9AD", "#AC1D28"

PLATES = {  # collection plates (sharp unaltered rectangles), F5 settled geometry
    "A": dict(src=ROOT + "assets/source/635055_2009-aston-martin-dbs/04_2009-aston--martin-dbs-187875-1649375302.jpg",
              x=880, y=150, w=920, h=613),
    "B": dict(src=ROOT + "assets/source/636828_2019-porsche-911-speedster/08_2019-porsche-911--speedster-580075-1270284186.jpg",
              x=120, y=560, w=600, h=400),
    "C": dict(src=ROOT + "assets/source/635055_2009-aston-martin-dbs/06_2009-aston--martin-dbs-187875-827962918.jpg",
              x=1440, y=800, w=360, h=240),
}
F4_OFF = dict(A=220, B=420, C=640)
PRE_RISE_EXTRA = 400            # interpretation: plates rise 400 px during T3 50-100 % (see PROVENANCE)

# frames: cars (name, s, cx, tyre_y) and aperture (w, h, cx, cy), plate offsets
FRAMES = {
    "F1": dict(cars=[("f430", .36, 600, 870), ("spec", .40, 1440, 899), ("ford", .50, 1010, 928)],
               ap=(320, 180, 1010, 790), off={k: v + PRE_RISE_EXTRA for k, v in F4_OFF.items()}),
    "F2": dict(cars=[("f430", .52, 180, 930), ("spec", .46, 1600, 930), ("ford", .64, 1000, 1010)],
               ap=(400, 225, 1006, 806), off={k: v + PRE_RISE_EXTRA for k, v in F4_OFF.items()}),
    "F3": dict(cars=[("ford", .92, 990, 1420)],
               ap=(560, 315, 985, 560), off={k: v + int(PRE_RISE_EXTRA * 0.8) for k, v in F4_OFF.items()}),
    "F4": dict(cars=[], ap=(1920, 1080, 960, 540), off=dict(F4_OFF)),
    "F5": dict(cars=[], ap=(1920, 1080, 960, 540), off=dict(A=0, B=0, C=0)),
}


def resize_rgba(im, w, h):
    # premultiplied Lanczos so edge colours do not bleed
    return im.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")


_cache = {}


def car_layers(name, s, cx, ty, dpr):
    m = META[name]
    x0, y0, x1, y1 = m["cut_bbox"]
    cut = m["cut_line"]
    bcx = (x0 + x1) / 2
    out = []
    for kind, box, fn in (("plate", m["plate_box"], f"{name}_plate.png"),
                          ("cut", m["cut_bbox"], f"{name}_cutout.png")):
        bx0, by0, bx1, by1 = box
        left = cx + (bx0 - bcx) * s
        top = ty + (by0 - cut) * s
        w = (bx1 - bx0) * s
        h = (by1 - by0) * s
        L, T = round(left), round(top)
        W, H = round(w), round(h)
        # device scale: never above 1:1 of source
        ds = min(s * dpr, 1.0)
        pw, ph = round((bx1 - bx0) * ds), round((by1 - by0) * ds)
        key = f"{name}_{kind}_{pw}x{ph}"
        if key not in _cache:
            im = Image.open(B + "cutouts/" + fn)
            if kind == "plate":
                im.convert("RGB").resize((pw, ph), Image.LANCZOS).save(IMG + key + ".png")
            else:
                resize_rgba(im, pw, ph).save(IMG + key + ".png")
            _cache[key] = 1
        out.append(dict(kind=kind, src=f"img/{key}.png", L=L, T=T, W=W, H=H,
                        upsampled=round(s * dpr / ds, 3) if s * dpr > 1 else 1.0))
    return out


def plate_img(k, scale, dpr):
    p = PLATES[k]
    ds = scale * dpr
    srcw = Image.open(p["src"]).size[0]
    ds_src = min(ds * p["w"] / srcw, 1.0)
    pw, ph = round(srcw * ds_src), round(Image.open(p["src"]).size[1] * ds_src)
    key = f"plate{k}_{pw}x{ph}"
    if key not in _cache:
        Image.open(p["src"]).convert("RGB").resize((pw, ph), Image.LANCZOS).save(IMG + key + ".jpg", quality=95)
        _cache[key] = 1
    return f"img/{key}.jpg"


def logo_svg(fill):
    s = open(ROOT + "research/out-of-scope/west-coast/logos/dupont-registry-select_lockup_white.svg", encoding="utf-8").read()
    s = re.sub(r"<\?xml[^>]*>", "", s)
    s = s.replace("fill: #fff;", f"fill: {fill};")
    s = s.replace("<svg ", '<svg class="logo" aria-label="duPont REGISTRY | SELECT" role="img" ', 1)
    return s


CHEV = '<svg class="chev" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
ARROW = '<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'


def chrome(ink, index_txt=None):
    nav = ["Inventory", "Locations", "Services", "Finance", "About", "Contact"]
    items = "".join(f'<li>{n}{CHEV if n == "Services" else ""}</li>' for n in nav)
    h = f'<div class="chrome" style="color:{ink}">'
    h += f'<a class="logo-wrap">{logo_svg(ink)}</a>'
    h += f'<ul class="nav lbl" data-right="1800" data-baseline="70">{items}</ul>'
    if index_txt:
        h += f'<div class="lbl idx" data-right="1800" data-baseline="1032">{index_txt}</div>'
    h += "</div>"
    return h


CSS = f"""
:root{{--ivory:{IVORY};--graphite:{GRAPHITE};--charcoal:{CHARCOAL};--silver:{SILVER};--red:{RED};}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:var(--ivory)}}
body{{font-family:Manrope,"Helvetica Neue",Arial,sans-serif;color:var(--graphite);-webkit-font-smoothing:antialiased}}
.stage{{position:relative;width:1920px;height:1080px;overflow:hidden;background:var(--ivory)}}
.abs{{position:absolute;white-space:nowrap}}
.layer{{position:absolute;display:block}}
.plate{{mix-blend-mode:multiply}}
.lbl{{font-size:14px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;line-height:1}}
.disp{{font-family:"Bodoni Moda",serif;font-optical-sizing:auto;font-variation-settings:"opsz" 96;font-weight:400;text-transform:uppercase;letter-spacing:-.01em;line-height:.92}}
.chrome{{position:absolute;inset:0;z-index:50;pointer-events:none}}
.logo-wrap{{position:absolute;left:120px;top:40px;height:48px;display:block}}
.logo{{height:48px;width:auto;display:block}}
.nav{{position:absolute;list-style:none;display:flex;gap:40px;white-space:nowrap}}
.nav li{{display:flex;align-items:center;gap:8px}}
.chev{{display:block;margin-top:1px}}
.idx{{position:absolute}}
.rule{{position:absolute;width:24px;height:2px;background:var(--red)}}
.deck{{position:absolute;font-size:17px;line-height:28px;font-weight:400;white-space:normal}}
.cta{{position:absolute;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--red);color:var(--ivory);}}
.ap{{position:absolute;overflow:hidden;background:var(--graphite);z-index:2}}
.ap img{{position:absolute;display:block}}
.reg .city{{font-size:15px;font-weight:400;letter-spacing:0;text-transform:none}}
.cap{{font-size:14px;font-weight:400;letter-spacing:.02em;color:var(--silver);line-height:1}}
"""


def text(cls, content, x=None, baseline=None, right=None, extra="", style=""):
    attrs = f' data-baseline="{baseline}"' if baseline is not None else ""
    if right is not None:
        attrs += f' data-right="{right}"'
    st = f"left:{x}px;" if x is not None else ""
    return f'<div class="abs {cls}"{attrs} style="{st}{style}" {extra}>{content}</div>'


def aperture_html(fr, dpr, test=False, with_text=False):
    w, h, cx, cy = fr["ap"]
    k = w / 1920.0
    L, T = round(cx - w / 2), round(cy - h / 2)
    bg = "#00FF00" if test else GRAPHITE
    out = [f'<div class="ap" id="ap" style="left:{L}px;top:{T}px;width:{w}px;height:{h}px;background:{bg}">']
    if not test:
        for key in "ABC":
            p = PLATES[key]
            y = p["y"] + fr["off"][key]
            out.append(f'<img src="{plate_img(key, k, dpr)}" alt="" style="left:{p["x"]*k:.3f}px;top:{y*k:.3f}px;width:{p["w"]*k:.3f}px;height:{p["h"]*k:.3f}px">')
        # caption travels with plate A / B (only visible when on-screen at 1:1)
        if k == 1.0:
            for key, txt in (("A", "2009 Aston Martin DBS · Select SoCal"), ("B", "2019 Porsche 911 Speedster · Select SoCal")):
                p = PLATES[key]
                out.append(text("cap", txt, x=p["x"], baseline={"A": 792, "B": 988}[key] + fr["off"][key]))
    if with_text:
        out.append(f'<div class="rule" style="left:120px;top:170px"></div>')
        out.append(text("lbl", "02 — The Collection", x=120, baseline=196, style="color:var(--ivory)"))
        out.append(text("disp", "Chosen,", x=120, baseline=316, style="font-size:96px;color:var(--ivory)"))
        out.append(text("disp", "One at a time.", x=120, baseline=404, style="font-size:96px;color:var(--ivory)"))
        out.append(f'<div class="deck" data-top="440" style="left:120px;top:440px;width:520px;color:var(--silver)">Every car here was picked by a person, at one of three showrooms.</div>')
        out.append(f'<div class="cta lbl" style="left:880px;top:812px;width:268px;height:52px">View all inventory{ARROW}</div>')
    out.append("</div>")
    return "".join(out)


def page(fid, dpr, test=False):
    fr = FRAMES[fid]
    body = ['<div class="stage">']
    # cars: z order flanks (1) < aperture (2) < lead (3)
    for (name, s, cx, ty) in fr["cars"]:
        z = 3 if name == "ford" else 1
        for ly in car_layers(name, s, cx, ty, dpr):
            cls = "layer plate" if ly["kind"] == "plate" else "layer"
            body.append(f'<img class="{cls}" data-car="{name}" data-kind="{ly["kind"]}" data-up="{ly["upsampled"]}" src="{ly["src"]}" alt="" '
                        f'style="left:{ly["L"]}px;top:{ly["T"]}px;width:{ly["W"]}px;height:{ly["H"]}px;z-index:{z}">')
    body.append(aperture_html(fr, dpr, test=test, with_text=(fid == "F5")))
    if fid == "F1":
        body.append('<div class="rule" style="left:120px;top:188px"></div>')
        body.append(text("lbl", "Southern California · Naples · Miami", x=120, baseline=214))
        body.append(text("disp", "The Registry,", x=120, baseline=330, style="font-size:112px"))
        body.append(text("disp", "Selected.", x=120, baseline=434, style="font-size:112px;color:var(--red)"))
        body.append('<div class="deck" style="left:120px;top:470px;width:460px">Exceptional cars, chosen one at a time — and three showrooms to see them in.</div>')
        body.append(f'<div class="cta lbl" style="left:120px;top:552px;width:268px;height:52px">View the collection{ARROW}</div>')
        body.append('<div class="rule" style="left:1560px;top:188px"></div>')
        for i, (lab, city) in enumerate((("SoCal", "Murrieta, CA"), ("Naples", "Naples, FL"), ("Miami", "Miami, FL"))):
            body.append(text("lbl reg", f'{lab} <span class="sep">—</span> <span class="city">{city}</span>', x=1560, baseline=214 + 30 * i))
    if fid == "F1":
        body.append(text("lbl rec", "2007 Ferrari F430 · 2006 Ford GT · 2015 Ferrari 458 Speciale — at Select SoCal", x=120, baseline=1032,
                         style="font-weight:500;letter-spacing:.08em;text-transform:none"))
    if fid == "F2":
        body.append(text("disp", "Three showrooms.", right=1800, baseline=300, style="font-size:72px"))
        body.append(text("disp", "One collection.", right=1800, baseline=372, style="font-size:72px"))
        body.append(text("lbl", "Southern California · Naples · Miami", right=1800, baseline=420))
    ink = GRAPHITE if fid in ("F1", "F2", "F3") else IVORY
    body.append(chrome(ink, "01 / 08" if fid in ("F1", "F2", "F3") else None))
    body.append("</div>")
    fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
             '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..900&family=Manrope:wght@400;500;600&display=block" rel="stylesheet">')
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
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1920">
<title>V4 storyboard {fid}</title>{fonts}<style>{CSS}</style></head><body>{''.join(body)}{js}</body></html>"""


if __name__ == "__main__":
    for fid in FRAMES:
        for dpr in (1, 2):
            open(B + f"{fid}_{dpr}x.html", "w", encoding="utf-8").write(page(fid, dpr))
        if fid in ("F1", "F2", "F3"):
            open(B + f"{fid}_test.html", "w", encoding="utf-8").write(page(fid, 1, test=True))
    print("ok", len(_cache), "layers")
