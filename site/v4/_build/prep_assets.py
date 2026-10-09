"""V4 asset preparation. Copies (never edits) shared assets into site/v4/assets and cuts 1:1 crops
from client photography. Crops are rectangular windows only: no resampling at desktop size, no
retouch, no blur/feather/vignette. Mobile variants are plain downsizes. Re-run safely."""
import os, shutil, json
from PIL import Image

ROOT = "C:/____WORK/DU PONT REGESTRY/"
V4 = ROOT + "site/v4/"
A = V4 + "assets/"
SRC = ROOT + "assets/source/"
for d in ("vendor", "fonts", "img/hero", "img/scene", "img/cars", "img/brand", "data", "css", "js"):
    os.makedirs(A + d, exist_ok=True)

def cp(a, b):
    shutil.copy2(a, b)

# vendor (copied from V1, unchanged)
for f in ("gsap.min.js", "ScrollTrigger.min.js", "lenis.min.js", "lenis.css"):
    cp(ROOT + "site/assets/vendor/" + f, A + "vendor/" + f)
# fonts (OFL, self-hosted)
cp(ROOT + "direction/hero-storyboard/build/fonts/bodoni-moda-opsz-roman-latin.woff2", A + "fonts/bodoni-moda-opsz-roman-latin.woff2")
cp(ROOT + "_____TEST FINAL/frames/assets/fonts/manrope-var-latin.woff2", A + "fonts/manrope-var-latin.woff2")
# logo
cp(ROOT + "research/out-of-scope/west-coast/logos/dupont-registry-select_lockup_white.svg", A + "img/brand/dupont-registry-select_lockup.svg")
# inventory data + its listing photographs (V1 web derivatives of dR listing photos)
cp(ROOT + "site/assets/data/inventory.js", A + "data/inventory.js")
for f in os.listdir(ROOT + "site/assets/img/cars"):
    cp(ROOT + "site/assets/img/cars/" + f, A + "img/cars/" + f)
# hero car layers (temporary cut-outs from the storyboard build; Alex's finals replace them)
CUT = V4 + "storyboard/build/cutouts/"
for n in ("ford", "f430", "p911"):
    cp(CUT + f"{n}_cutout.png", A + f"img/hero/{n}_body.png")
    cp(CUT + f"{n}_plate.png", A + f"img/hero/{n}_shadow.png")
    Image.open(CUT + f"{n}_cutout.png").save(A + f"img/hero/{n}_body.webp", "WEBP", lossless=True, method=6)

# scene crops: (out name, source, window x0,y0,x1,y1)
CROPS = [
    ("col-gauges", "635055_2009-aston-martin-dbs/06_2009-aston--martin-dbs-187875-827962918.jpg", (0, 0, 1060, 1280)),
    ("col-wheel", "626613_2015-ferrari-458-speciale/07_2015-ferrari-458--speciale-1369075-1861828170.jpg", (640, 340, 1280, 1280)),
    ("sell-fordgt-rear", "628929_2006-ford-gt/04_", (360, 180, 1560, 1280)),
    ("svc-insurance", "626613_2015-ferrari-458-speciale/06_", (140, 400, 1200, 1046)),
    ("svc-service", "635055_2009-aston-martin-dbs/07_", (300, 100, 1700, 954)),
    ("svc-ppf", "617636_2018-porsche-911-gt2-rs/07_", (400, 470, 1560, 1177)),
    ("svc-finance", "635055_2009-aston-martin-dbs/08_2009-aston--martin-dbs-187875-827962918.jpg", None),
]
import glob
def find(rel):
    if os.path.exists(SRC + rel):
        return SRC + rel
    d, f = rel.split("/")
    hits = glob.glob(SRC + d + "/" + f[:3] + "*")
    return hits[0]

ledger = []
for name, rel, win in CROPS:
    p = find(rel)
    im = Image.open(p).convert("RGB")
    if win:
        im = im.crop(win)
    im.save(A + f"img/scene/{name}.jpg", quality=88, optimize=True, progressive=True)
    im.save(A + f"img/scene/{name}.webp", "WEBP", quality=86, method=6)
    sm = im.copy(); sm.thumbnail((800, 800), Image.LANCZOS)
    sm.save(A + f"img/scene/{name}-800.jpg", quality=84, optimize=True, progressive=True)
    ledger.append(dict(file=f"assets/img/scene/{name}.jpg", source=p.replace(ROOT, ""), window=win, size=im.size))

# Instagram demo tiles: real listing photographs (non-cyc / detail frames), plain downsizes
IG = [
    ("ig-dbs-cabin", "635055_2009-aston-martin-dbs/05_"),
    ("ig-sto-rear", "619511_2021-lamborghini-huracan-sto/05_"),
    ("ig-190sl", "602011_1961-mercedes-benz-190-sl/02_"),
    ("ig-sto-front", "619511_2021-lamborghini-huracan-sto/07_"),
    ("ig-458-front", "626613_2015-ferrari-458-speciale/06_"),
    ("ig-190sl-top", "602011_1961-mercedes-benz-190-sl/03_"),
    ("ig-sto-side", "619511_2021-lamborghini-huracan-sto/02_"),
    ("ig-revuelto-doors", "616146_2024-lamborghini-revuelto/04_"),
    ("ig-fordgt-rear", "628929_2006-ford-gt/04_"),
]
for name, rel in IG:
    d, pre = rel.split("/")
    p = glob.glob(SRC + d + "/" + pre + "*")[0]
    im = Image.open(p).convert("RGB")
    im.thumbnail((720, 720), Image.LANCZOS)
    im.save(A + f"img/scene/{name}.jpg", quality=84, optimize=True, progressive=True)
    ledger.append(dict(file=f"assets/img/scene/{name}.jpg", source=p.replace(ROOT, ""), window=None, size=im.size))

json.dump(ledger, open(V4 + "_build/scene_ledger.json", "w"), indent=1)
print("ok", len(ledger))

# Alpha shadows: the temporary multiply ground plates re-encoded as black + alpha (alpha = 1 - luminance).
# For a neutral plate this is mathematically identical to multiply over any ground, and it survives
# stacking contexts (a transformed .car group isolates mix-blend-mode). Same format Alex's finals use.
import numpy as np
for n in ("ford", "f430", "p911"):
    pl = np.asarray(Image.open(CUT + f"{n}_plate.png").convert("L"), dtype=np.float32)
    a = np.clip(255.0 - pl, 0, 255).astype(np.uint8)
    rgba = np.zeros(pl.shape + (4,), np.uint8); rgba[..., 3] = a
    Image.fromarray(rgba, "RGBA").save(A + f"img/hero/{n}_shadow.png", optimize=True)
print("alpha shadows ok")
