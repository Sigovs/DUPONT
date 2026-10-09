"""V4 storyboard - non-AI car cutouts + ground plates.

Method (deterministic, local, no ML):
  1. Cyc model B(x,y): a smooth estimate of the studio white behind/under the car, built by
     normalised Gaussian interpolation of clearly-background pixels (luma >= 222, low chroma).
  2. Distance D = |pixel - B| (RGB euclid).
  3. Flood fill: connected components of "background-eligible" pixels (D < fuzz, zone-tuned)
     seeded from the image border + explicit seeds (left/right floor, above and below the ring).
  4. Cyc ring line removed by thin-run analysis: inside the ring band, opaque vertical runs
     shorter than RING_RUN px are ring, not car.
  5. Scripted manual cleanup: per-car pocket rectangles (enclosed cyc pockets the fill cannot
     reach) and protect polygons (paint/glass that must stay); islands < 400 px dropped.
  6. Floor cut: everything at/below the per-car cut line belongs to the ground plate.
  7. Alpha: binary mask choked 1 px (erode, disk 1); the 1 px boundary row gets an anti-aliased
     alpha from D (no blur, no feather, AA <= 1 px). Interior pixels are untouched source pixels.
     Boundary pixels are colour-decontaminated against B (standard matting un-mix).
  8. Ground plate: source rows from PLATE_TOP to the end of the reflection, levels so the
     darkest floor value on the plate border maps to 255, choked body painted white.
"""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = "C:/____WORK/DU PONT REGESTRY/"
SRC = ROOT + "assets/source/"
OUT = ROOT + "site/v4/storyboard/build/cutouts/"

CARS = {
    "ford": dict(
        src=SRC + "628929_2006-ford-gt/07_2006-ford-gt-700073-837676577.jpg",
        fuzz=24, floor_fuzz=70, floor_y=880,
        flanks=[("L", 580, 760), ("R", 580, 760)], flank_t=12,
        cut=962,            # tyre contact line (measured, 2x crop)
        plate_top=900,
        pockets=[], protect=[],
    ),
    "f430": dict(
        src=SRC + "624911_2007-ferrari-f430/08_2007-ferrari-f430-290071-1881447063.jpg",
        fuzz=22, floor_fuzz=60, floor_y=960,
        flanks=[("L", 600, 960), ("R", 600, 960)], flank_t=10,
        cut=992,            # bumper lip bottom (tyres hidden by bumper)
        plate_top=900,
        pockets=[(485, 440, 520, 462), (525, 466, 565, 498), (1352, 454, 1397, 487), (1418, 430, 1444, 454)], protect=[],
    ),
    "spec": dict(
        src=SRC + "626613_2015-ferrari-458-speciale/09_2015-ferrari-458--speciale-1369075-60006421.jpg",
        fuzz=20, floor_fuzz=110, floor_y=990,
        flanks=[("L", 640, 990), ("R", 640, 990)], flank_t=9,
        cut=1050,           # splitter bottom
        plate_top=930,
        pockets=[], protect=[], bridges=[(866, 924), (994, 1050)],
    ),
    "p911": dict(
        src=SRC + "636254_2023-porsche-911-sport-classic/07_2023-porsche-911--sport--classic-720075-396410551.jpg",
        fuzz=22, floor_fuzz=70, floor_y=1000,
        flanks=[("L", 600, 1000), ("R", 600, 1000)], flank_t=12,
        cut=1052,
        cut_poly=[(0, 1018), (453, 1018), (560, 1022), (600, 1042), (700, 1050), (960, 1052), (1220, 1050), (1320, 1042), (1367, 1022), (1472, 1018), (1920, 1018)],
        plate_top=980,
        pockets=[], protect=[],
    ),
}
RING_RUN = 70


def cyc_model(a):
    L = a.mean(2)
    chroma = a.max(2) - a.min(2)
    bgm = (L >= 222) & (chroma <= 10)
    w = ndi.gaussian_filter(bgm.astype(np.float32), 30)
    B = np.stack([ndi.gaussian_filter(a[..., c] * bgm, 30) for c in range(3)], -1)
    B = B / np.maximum(w, 1e-4)[..., None]
    # where no background nearby (deep inside car) fall back to a big-kernel estimate
    w2 = ndi.gaussian_filter(bgm.astype(np.float32), 120)
    B2 = np.stack([ndi.gaussian_filter(a[..., c] * bgm, 120) for c in range(3)], -1) / np.maximum(w2, 1e-4)[..., None]
    t = np.clip(w / 0.05, 0, 1)[..., None]
    return B * t + B2 * (1 - t)


def ring_curve(L, xs):
    pts = []
    for x in xs:
        y = 560 + int(np.argmin(L[560:800, x]))
        pts.append((x, y))
    p = np.polyfit([q[0] for q in pts], [q[1] for q in pts], 2)
    return p


def flank_fit(M, Ds, side, y0, y1, t, reach=40):
    """Scripted manual cleanup of a car flank: scan each row from the cyc inward and put the
    silhouette where the (detection-smoothed) distance from the cyc first exceeds t.
    Sub-pixel crossing; median along y removes single-row spikes. Returns fractional edge x."""
    H, W = M.shape
    es = []
    for y in range(y0, y1):
        xs = np.where(M[y])[0]
        if side == "R":
            start = min(W - 2, xs.max() + reach)
            row = Ds[y, :start + 1][::-1]          # outside -> inside
        else:
            start = max(1, xs.min() - reach)
            row = Ds[y, start:]
        hit = np.where(row > t)[0]
        k = int(hit[0]) if len(hit) else 0
        if k > 0:
            f = (t - row[k - 1]) / max(row[k] - row[k - 1], 1e-3)
        else:
            f = 0.0
        pos = k - 1 + f                            # fractional distance from start
        e = (start - pos) if side == "R" else (start + pos)
        es.append(e)
    es = np.array(es, float)
    return ndi.median_filter(es, size=21, mode="nearest")


def build(name, cfg, debug=False):
    img = Image.open(cfg["src"]).convert("RGB")
    a = np.asarray(img).astype(np.float32)
    H, W, _ = a.shape
    L = a.mean(2)
    B = cyc_model(a)
    D = np.sqrt(((a - B) ** 2).sum(2))
    chroma = a.max(2) - a.min(2)
    yy, xx = np.mgrid[0:H, 0:W]

    if "cut_poly" in cfg:
        px_, py_ = zip(*cfg["cut_poly"])
        CUT = np.interp(xx, px_, py_)
    else:
        CUT = np.full(xx.shape, cfg["cut"], float)
    fuzz = np.where(yy >= cfg["floor_y"], cfg["floor_fuzz"], cfg["fuzz"])
    E = (D < fuzz) & (chroma < 26)

    # ring: fit curve on columns well outside the car
    p = ring_curve(L, list(range(20, 300, 20)) + list(range(1640, 1900, 20)))
    yr = np.polyval(p, xx)
    band = np.abs(yy - yr) <= 30
    opaque = ~E
    # vertical run length of opaque pixels per column
    run = np.zeros_like(L)
    lab, n = ndi.label(opaque, structure=[[0, 1, 0], [0, 1, 0], [0, 1, 0]])
    if n:
        sizes = ndi.sum(np.ones_like(L), lab, index=np.arange(1, n + 1))
        run = np.concatenate([[0], sizes])[lab]
    ringpx = band & opaque & (run < RING_RUN)
    # robust: car horizontal extent from rows just outside the band (largest opaque component)
    yc = int(np.polyval(p, W / 2))
    ymax = int(max(np.polyval(p, 0), np.polyval(p, W - 1)))
    rows = list(range(yc - 80, yc - 40)) + list(range(ymax + 40, ymax + 70))
    lefts, rights = [], []
    for r in rows:
        xs_ = np.where(opaque[r, 200:W - 200])[0] + 200
        if len(xs_):
            lefts.append(xs_.min()); rights.append(xs_.max())
    cl, cr = int(np.percentile(lefts, 5)) - 2, int(np.percentile(rights, 95)) + 2
    ringpx |= band & ((xx < cl) | (xx > cr))
    E = E | ringpx

    E[yy >= CUT] = True                    # plate territory is background for the fill
    for (x0, y0, x1, y1) in cfg["protect"]:
        E[y0:y1, x0:x1] = False

    lab, n = ndi.label(E)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    seeds = [(10, 10), (W - 10, 10), (10, H - 10), (W - 10, H - 10)]
    for (sx, sy) in seeds:
        if lab[sy, sx]:
            border.add(lab[sy, sx])
    fill = np.isin(lab, list(border))
    # enclosed pockets listing (diagnostic)
    pockets_found = []
    if debug:
        ids = [i for i in range(1, n + 1) if i not in border]
        if ids:
            sl = ndi.find_objects(lab)
            for i in ids:
                s = sl[i - 1]
                area = int((lab[s] == i).sum())
                if area >= 60:
                    pockets_found.append((i, s[1].start, s[0].start, s[1].stop, s[0].stop, area))
    for (x0, y0, x1, y1) in cfg["pockets"]:
        sub = lab[y0:y1, x0:x1]
        ids = np.unique(sub[(sub > 0)])
        fill |= np.isin(lab, ids) & (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)

    M = ~fill
    for (bx0, bx1) in cfg.get("bridges", []):
        # roof bridge: stripe paint that meets the cyc at the roofline - interpolate the
        # roof top from the neighbouring columns and keep everything below it
        def top(x):
            return int(np.argmax(M[200:700, x])) + 200
        tl, tr = top(bx0 - 3), top(bx1 + 3)
        for x in range(bx0, bx1 + 1):
            t = int(round(tl + (tr - tl) * (x - bx0) / (bx1 - bx0)))
            bot = t + int(np.argmax(M[t:t + 80, x])) if M[t:t + 80, x].any() else t
            M[t:bot, x] = True
    M &= yy < CUT
    # drop islands
    lab2, n2 = ndi.label(M)
    if n2:
        sizes = ndi.sum(M, lab2, index=np.arange(1, n2 + 1))
        sl2 = ndi.find_objects(lab2)
        cx2 = np.array([(q[1].start + q[1].stop) / 2 for q in sl2])
        keep = np.concatenate([[False], (sizes >= 400) & (cx2 > cl - 20) & (cx2 < cr + 20)])
        M = keep[lab2]
    # fill holes that are not cyc-coloured? no: glass/holes stay as photographed (already opaque)

    # flank fits: geometric silhouette rows (set M from the fitted edge)
    geo = []
    for (side, y0, y1) in cfg.get("flanks", []):
        Dd = D.copy(); Dd[ringpx] = 0
        Ds = ndi.gaussian_filter(Dd, 1.2)          # detection only
        es = flank_fit(M, Ds, side, y0, y1, cfg["flank_t"])
        # across the ring junction the silhouette is interpolated from the rows above/below
        ys_ = np.arange(y0, y1)
        inband = np.abs(ys_ - np.polyval(p, es)) <= 18
        if inband.any() and (~inband).sum() > 2:
            es = es.copy(); es[inband] = np.interp(ys_[inband], ys_[~inband], es[~inband])
        for k, y in enumerate(range(y0, y1)):
            e = es[k]
            if side == "R":
                xi = int(np.floor(e))
                # fill eaten pockets between the old inner body and the fitted edge
                inner = xi - 30
                M[y, inner:xi + 1] |= True
                M[y, xi + 1:] = False
            else:
                xi = int(np.ceil(e))
                M[y, xi:xi + 31] |= True
                M[y, :xi] = False
        geo.append((side, y0, y1, es))

    # choke 1 px + AA boundary
    Me = ndi.binary_erosion(M, structure=ndi.generate_binary_structure(2, 1))
    edge = M & ~Me
    lo, hi = cfg["fuzz"] * 0.5, cfg["fuzz"] * 3.0
    a_edge = np.clip((D - lo) / (hi - lo), 0, 1)
    alpha = Me.astype(np.float32) + edge * a_edge
    # the cut row is a hard horizontal edge (plate continues it) - keep it opaque
    cutrow = (yy == np.floor(CUT) - 1) & M
    alpha[cutrow] = np.maximum(alpha[cutrow], 1.0 * Me[cutrow] + edge[cutrow] * a_edge[cutrow])

    # geometric AA on fitted flanks: choke 1 px, coverage from the fractional edge
    for (side, y0, y1, es) in geo:
        for k, y in enumerate(range(y0, y1)):
            if side == "R":
                e = es[k] - 1.0
                xi = int(np.floor(e)); fr = e - xi
                alpha[y, xi + 2:] = np.where(xx[y, xi + 2:] > -1, 0, 0)
                alpha[y, xi + 1] = fr
                alpha[y, max(xi - 3, 0):xi + 1] = np.maximum(alpha[y, max(xi - 3, 0):xi + 1], Me[y, max(xi - 3, 0):xi + 1])
                edge[y, xi + 1] = True
            else:
                e = es[k] + 1.0
                xi = int(np.ceil(e)); fr = xi - e
                alpha[y, :xi - 1] = 0
                alpha[y, xi - 1] = fr
                edge[y, xi - 1] = True

    # rim un-mix: in the outer 4 px band the photo's own edge pixels are a mix of paint (F, taken
    # from the nearest pixel 6 px inside) and cyc (B). Coverage = projection of (c-B) on (F-B);
    # threshold it to a crisp <=1 px transition and un-mix colour. Removes cyc-lit rim, no blur.
    st = ndi.generate_binary_structure(2, 1)
    deep = ndi.binary_erosion(M, structure=st, iterations=6)
    band4 = M & ~ndi.binary_erosion(M, structure=st, iterations=4)
    band4 &= ~(yy >= CUT - 3)
    _, (iy, ix) = ndi.distance_transform_edt(~deep, return_indices=True)
    F = a[iy, ix]
    FB = F - B; CB = a - B
    nfb = (FB ** 2).sum(2)
    cov = np.clip((CB * FB).sum(2) / np.maximum(nfb, 1), 0, 1.2)
    ok = band4 & (nfb > 45 ** 2)
    a_new = np.clip((cov - 0.35) / 0.3, 0, 1)
    alpha = np.where(ok, np.minimum(alpha, a_new) if False else a_new * (alpha > 0) + 0, alpha)
    alpha = np.where(ok & ~M, 0, alpha)
    edge = edge | ok
    rimF = B + CB / np.maximum(cov, 0.35)[..., None]

    rgb = a.copy()
    ae = np.maximum(alpha, 0.15)[..., None]
    dec = B + (a - B) / ae
    rgb = np.where(edge[..., None], np.clip(dec, 0, 255), a)
    rgb = np.where(ok[..., None], np.clip(rimF, 0, 255), rgb)

    ys, xs = np.where(alpha > 0)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba[y0:y1, x0:x1], "RGBA").save(OUT + f"{name}_cutout.png", optimize=True)

    # ---- ground plate ----
    pt = cfg["plate_top"]
    reg = a[pt:].copy()
    Mr = Me[pt:]
    T = cfg.get("plate_T", 230)
    Lr = reg.min(2)
    dark = (Lr < T) & ~Mr
    near = ndi.binary_dilation(M[pt:], iterations=6) | Mr
    lab3, n3 = ndi.label(dark | Mr)
    ids = np.unique(lab3[near & (dark | Mr)])
    ids = ids[ids > 0]
    shadow = np.isin(lab3, ids)
    rr, cc = np.where(shadow)
    pb = min(H - pt, rr.max() + 8)
    pl, pr = max(0, min(cc.min(), x0) - 8), min(W, max(cc.max(), x1) + 9)
    plate = reg[:pb, pl:pr]
    Mp = Mr[:pb, pl:pr]
    bmask = np.zeros(plate.shape[:2], bool)
    bmask[0, :] = bmask[-1, :] = bmask[:, 0] = bmask[:, -1] = True
    bsel = bmask & ~ndi.binary_dilation(M[pt:], iterations=3)[:pb, pl:pr]
    v = plate.min(2)[bsel].min()
    yb, xb = np.where(bsel & (plate.min(2) == v))
    print(name, "plate v", v, "at", (int(xb[0]) + pl, int(yb[0]) + pt), file=sys.stderr)
    plate = np.clip(plate * (255.0 / v), 0, 255)
    plate[Mp] = 255
    plate8 = plate.round().astype(np.uint8)
    bord = plate8.min(2)[bsel]
    Image.fromarray(plate8, "RGB").save(OUT + f"{name}_plate.png", optimize=True)

    meta = dict(name=name, src=cfg["src"].replace(ROOT, ""), W=W, H=H,
                cut_bbox=[int(x0), int(y0), int(x1), int(y1)],
                plate_box=[int(pl), int(pt), int(pr), int(pt + pb)],
                plate_level_v=float(v), plate_border_min=int(bord.min()),
                plate_border_not255=int((bord < 255).sum()),
                cut_line=cfg["cut"], ring_poly=[float(q) for q in p],
                ring_y_at_carcentre=float(np.polyval(p, (x0 + x1) / 2)),
                edge_px=int(edge.sum()), pockets_found=pockets_found)
    if debug:
        # mask diagnostic on magenta + on graphite
        for nm, col in (("mag", (255, 0, 255)), ("gra", (48, 49, 55))):
            bg = np.empty_like(a); bg[:] = col
            comp = rgb * alpha[..., None] + bg * (1 - alpha[..., None])
            Image.fromarray(comp.round().astype(np.uint8)).save(OUT + f"../_dbg_{name}_{nm}.png")
    return meta


if __name__ == "__main__":
    names = sys.argv[1:] or list(CARS)
    allm = {}
    for n in names:
        m = build(n, CARS[n], debug=True)
        allm[n] = m
        print(json.dumps(m))
    try:
        old = json.load(open(OUT + "cutouts_meta.json"))
    except Exception:
        old = {}
    old.update(allm)
    json.dump(old, open(OUT + "cutouts_meta.json", "w"), indent=1)
