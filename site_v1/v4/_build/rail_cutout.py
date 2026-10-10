"""Fix round 2: temporary rail cut-outs with the storyboard's non-AI pipeline (storyboard/build/cutout.py,
unchanged). Same SoCal studio cyc for all six; side profiles (frame 02). Only the ring-line sample columns
and per-car numbers differ: profiles reach x≈140–1790, so the ring is sampled in the outer 120 px only.
Finals from Alex replace these. Run:  python -I site_v1/v4/_build/rail_cutout.py"""
import sys, glob, json, importlib.util
import numpy as np
ROOT = "C:/____WORK/DU PONT REGESTRY/"
# the storyboard module is loaded from its source with ONE rule disabled for profiles: ring pixels beyond the
# car extent measured ABOVE the bumpers (that rule bit notches into bumpers that sit in the ring band).
# Thin ring remnants outside the body are removed by keep_car's column-thickness rule instead.
import types
_src = open(ROOT + "site_v1/v4/storyboard/build/cutout.py", encoding="utf-8").read()
_line = "    ringpx |= band & ((xx < cl) | (xx > cr))" + chr(10)
assert _line in _src
cut = types.ModuleType("cutout"); exec(compile(_src.replace(_line, ""), "cutout.py", "exec"), cut.__dict__)
cut.OUT = ROOT + "site_v1/v4/_build/railcut/"
cut.RING_RUN = 0      # profiles: the ring never shows through the body, so no thin-run removal inside it
_ring = cut.ring_curve
cut.ring_curve = lambda L, xs: _ring(L, list(range(10, 130, 10)) + list(range(1830, 1910, 10)))

# id: (lowest tyre row measured on the render, per-car fuzz)
# white cars (488 Pista 638928, Revuelto 616146) key out with the white cyc on this method - not used
# ZR1 628930 (deck keyed out) and DBS 635055 (frame 02 is a rear three-quarter) were tried and dropped
CARS = {"602202": (898, 22), "635078": (917, 22), "617636": (945, 22), "636828": (921, 22), "626613": (913, 20)}


# scripted manual cleanup: the floor-ring band behind each tail (raw x where the body starts)
CLIP = {"617636": 120, "602202": 132, "635078": 133}   # tail edges measured on the raw cut-out (column tops)


def keep_car(path, clip=0):
    """drop ceiling/floor islands: keep the largest alpha component (+ parts touching it), re-crop"""
    from PIL import Image
    from scipy import ndimage as ndi
    im = Image.open(path); a = np.asarray(im).copy()
    lab, n = ndi.label(a[..., 3] > 8)
    if n > 1:
        sizes = ndi.sum(np.ones(lab.shape), lab, index=np.arange(1, n + 1))
        big = 1 + int(np.argmax(sizes))
        keep = (lab == big) | ((lab > 0) & np.isin(lab, [i + 1 for i, s_ in enumerate(sizes) if s_ > 0.02 * sizes.max()]))
        a[..., 3] = np.where(ndi.binary_dilation(lab == big, iterations=2) | keep & (lab == big), a[..., 3], 0)
    # ring/floor streaks: thin horizontal remnants beyond the body - columns the car fills for < 40 rows
    al = a[..., 3]
    al[:, :clip] = 0
    body = np.where((al > 128).sum(0) >= 40)[0]
    if len(body):
        al[:, :max(0, body.min() - 4)] = 0; al[:, body.max() + 5:] = 0
    ys, xs = np.where(a[..., 3] > 0)
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    Image.fromarray(a[box[1]:box[3], box[0]:box[2]], "RGBA").save(path, optimize=True)
    return box
if __name__ == "__main__":
    meta = {}
    for cid in (sys.argv[1:] or CARS):
        low, fz = CARS[cid]
        src = sorted(glob.glob(ROOT + f"assets/source/{cid}_*/02_*"))[0].replace("\\", "/")
        c = cut.build(cid, dict(src=src, fuzz=fz, floor_fuzz=70, floor_y=low - 30, flanks=[], cut=low + 2,
                                plate_top=low - 50, pockets=[], protect=[]), debug=True)
        b = keep_car(cut.OUT + f"{cid}_cutout.png", CLIP.get(cid, 0))
        x0, y0 = c["cut_bbox"][:2]
        c["cut_bbox"] = [x0 + b[0], y0 + b[1], x0 + b[2], y0 + b[3]]
        meta[cid] = c
    try: old = json.load(open(cut.OUT + "meta.json"))
    except Exception: old = {}
    old.update(meta); json.dump(old, open(cut.OUT + "meta.json", "w"), indent=1)
    print({k: (v["cut_bbox"], v["pockets_found"][:4]) for k, v in meta.items()})
