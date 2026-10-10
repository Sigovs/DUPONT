"""Fix round 2: web layers from _build/railcut (non-AI cut-outs + ground plates).
Each car = ONE RGBA canvas: the ground plate re-encoded as black + alpha (alpha = 255 - luminance, as the
hero's shadows), the body over it. Canvas width = body width x 1.06; the tyre contact line sits at 86 % of
the canvas height, so every car of a set stands on the same floor line in CSS.
  rail     : side profiles, canvas 100:36   -> assets/img/rail/{id}-{800,1600}.webp
  bookend  : rears (rear-*), canvas 100:80, contact at 80 % -> assets/img/rail/rear-{id}-{600,1200}.webp
Run after rail_cutout.py / rear_cutout.py."""
import json
import math
import os
import numpy as np
from PIL import Image

ROOT = "C:/____WORK/DU PONT REGESTRY/site_v1/v4/"
IN, OUT = ROOT + "_build/railcut/", ROOT + "assets/img/rail/"


# fix3: tyre/floor boundary per wheel, measured on the source frames (row, x): (rear = near wheel, front = far wheel).
# The profiles were shot with a little perspective, so the far tyre sits 3-25 px higher, differently per car. Each
# layer is levelled about its rear contact so all ten tyres stand on ONE floor line (rotation 0.16-1.28 deg).
CONTACTS = {"602202": ((899, 412), (875, 1510)), "635078": ((918, 384), (894, 1460)), "617636": ((945, 492), (935, 1472)),
            "636828": ((922, 482), (900, 1486)), "626613": ((914, 392), (911, 1460))}


def layer(cid, m, AR, widths, CT=0.86):
    body = Image.open(IN + f"{cid}_cutout.png").convert("RGBA")
    x0, y0, x1, y1 = m["cut_bbox"]; bw = x1 - x0
    rc = CONTACTS.get(cid)
    contact = rc[0][0] + 1 if rc else m["cut_line"]          # first floor row under the near tyre
    W = int(round(bw * 1.06)); H = int(round(W * AR)); cy = int(round(H * CT))
    ox = (W - bw) // 2 - x0; oy = cy - contact            # source -> canvas offset
    can = np.zeros((H, W, 4), np.float32)
    pl = np.asarray(Image.open(IN + f"{cid}_plate.png").convert("L"), np.float32)
    px0, py0 = m["plate_box"][:2]
    a = np.clip(255 - pl, 0, 255)
    for yy in range(pl.shape[0]):
        Y = py0 + oy + yy
        if 0 <= Y < H:
            xs = np.arange(pl.shape[1]) + px0 + ox; ok = (xs >= 0) & (xs < W)
            can[Y, xs[ok], 3] = a[yy, ok]
    b = np.asarray(body, np.float32).copy()
    if rc:   # floor reflection kept as body under the far tyre (the 918's yellow sill spill): nothing of the body
        (yr, xr), (yf, xf) = rc   # may sit below the tyre-to-tyre floor line
        yy, xx = np.mgrid[y0:y0 + b.shape[0], x0:x0 + b.shape[1]]
        b[..., 3] = np.where(yy > yr + (yf - yr) * (xx - xr) / (xf - xr) + 1, 0, b[..., 3])
    ab = b[..., 3:] / 255
    Y0, X0 = y0 + oy, x0 + ox
    hh, ww = b.shape[:2]
    ys, ye = max(0, Y0), min(H, Y0 + hh); xs_, xe = max(0, X0), min(W, X0 + ww)
    reg = can[ys:ye, xs_:xe]
    bb = b[ys - Y0:ye - Y0, xs_ - X0:xe - X0]; aa = ab[ys - Y0:ye - Y0, xs_ - X0:xe - X0]
    sa = reg[..., 3:] / 255
    outa = aa + sa * (1 - aa)
    rgb = (bb[..., :3] * aa + reg[..., :3] * sa * (1 - aa)) / np.maximum(outa, 1e-4)
    can[ys:ye, xs_:xe, :3] = rgb; can[ys:ye, xs_:xe, 3:] = outa * 255
    img = Image.fromarray(can.round().clip(0, 255).astype(np.uint8), "RGBA")
    if rc:
        (yr, xr), (yf, xf) = rc
        ang = math.degrees(math.atan2(yr - yf, xf - xr))     # far tyre higher -> rotate clockwise by ang
        img = img.rotate(-ang, resample=Image.BICUBIC, center=(xr + ox, cy))
        print(f"  {cid}: levelled {ang:.2f} deg about the rear contact")
    for w in widths:
        im = img.resize((w, int(round(w * H / W))), Image.LANCZOS) if w < W else img
        im.save(OUT + f"{cid}-{w}.webp", "WEBP", quality=90, method=6)
    print(cid, W, H, "top room", cy - (contact - y0), "px")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for cid, m in json.load(open(IN + "meta.json")).items():
        layer(cid, m, 0.36, (800, 1600))
    if os.path.exists(IN + "rear-meta.json"):
        for cid, m in json.load(open(IN + "rear-meta.json")).items():
            layer(cid, m, 0.80, (600, 1200), CT=0.80)   # room for the 911's long floor shadow
