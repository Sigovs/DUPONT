"""TEMPORARY car cut-outs for TEST FINAL (non-AI, local, deterministic).

Final high-quality cut-outs will be supplied later; these exist so whole cars can stand on the
site's dark ground. Method (adapted from site/v4/storyboard/build/cutout.py, read-only prior art):

  1. Cyc model B(x,y): smooth estimate of the studio white (normalised Gaussian interpolation of
     clearly-background pixels). D = |pixel - B|.
  2. Background-eligible E = (D < fuzz) & low chroma; the floor zone (below the sill) uses a wider fuzz.
  3. Cyc ring line: fitted from columns where it is visible (thin dark line), removed inside its
     band as short vertical opaque runs.
  4. Flood fill of E from the frame border; enclosed cyc pockets (wing gaps, open cockpits) filled
     when they match the cyc closely; per-frame protect boxes keep white paint (stripes).
  5. Floor cut: line through the measured tyre-contact points (refined automatically as the sharp
     dark->light step where tyre meets its reflection). Below it = ground/reflection, removed.
     Largest component kept (detached overhang reflections drop out).
  6. Alpha: mask choked 1 px; the 1-px rim gets coverage alpha from projecting (C-B) onto (F-B)
     (F = paint 4 px inside). Rim colour un-mixed against B (colour decontamination). No blur,
     no feather, no glow, no drawn shadow, AA <= 1 px. Interior pixels are untouched source pixels.

Run:  python cutout.py [key ...]      (keys = "<id>-<angle>")
"""
import json, sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

R = "C:/____WORK/DU PONT REGESTRY/"
A = R + "assets/source/"
T = R + "_____TEST FINAL/assets/source/"
OUT = R + "_____TEST FINAL/site/assets/cutouts/"
DBG = OUT + "_build/dbg/"

# id, car, angle, facing, source, wheels [(x, approx contact y)], extra cfg
FR = [
    ("626613", "Ferrari 458 Speciale", "profile", "left", A + "626613_2015-ferrari-458-speciale/05_2015-ferrari-458--speciale-1369075-2061967696.jpg", [(490, 910), (1550, 896)], dict(cut_poly=[(0,852),(393,857),(430,902),(460,913),(490,917),(520,913),(550,902),(587,859),(1453,857),(1490,889),(1520,900),(1550,904),(1580,900),(1610,889),(1647,859),(1920,850)])),
    ("626613", "Ferrari 458 Speciale", "front34", "left", A + "626613_2015-ferrari-458-speciale/06_2015-ferrari-458--speciale-1369075-1059166736.jpg", [(860, 990), (1680, 870)], dict(cut_poly=[(0,878),(140,882),(300,932),(500,957),(700,962),(740,977),(800,991),(860,995),(920,990),(975,970),(1000,905),(1540,858),(1560,868),(1600,876),(1680,879),(1730,870),(1760,850),(1920,840)])),
    ("635055", "Aston Martin DBS", "front34", "left", A + "635055_2009-aston-martin-dbs/04_2009-aston--martin-dbs-187875-1649375302.jpg", [(790, 1030), (1660, 910)], dict(cut_poly=[(0,925),(150,932),(280,967),(640,982),(680,1000),(730,1022),(790,1033),(860,1022),(905,995),(940,945),(1520,887),(1560,900),(1660,914),(1730,902),(1750,870),(1920,860)])),
    ("635055", "Aston Martin DBS", "rear34", "right", A + "635055_2009-aston-martin-dbs/03_2009-aston--martin-dbs-187875-1915993492.jpg", [(230, 920), (1060, 1040)], dict(cut_poly=[(0,925),(150,928),(230,930),(330,925),(345,897),(880,957),(900,1010),(980,1062),(1060,1076),(1150,1062),(1210,1010),(1260,990),(1500,968),(1760,905),(1920,895)], zone_L=150)),
    ("628929", "Ford GT", "profile", "right", A + "628929_2006-ford-gt/02_2006-ford-gt-700073-1980698815.jpg", [(420, 870), (1450, 856)], {}),
    ("628929", "Ford GT", "front34", "left", A + "628929_2006-ford-gt/06_2006-ford-gt-700073-1935098049.jpg", [(870, 970), (1680, 830)], dict(cut_poly=[(0,880),(210,890),(300,907),(500,914),(700,918),(730,940),(780,965),(870,980),(960,968),(1000,945),(1015,885),(1550,852),(1600,838),(1680,837),(1740,830),(1770,815),(1920,810)])),
    ("628929", "Ford GT", "frontal", "front", A + "628929_2006-ford-gt/07_2006-ford-gt-700073-837676577.jpg", [(430, 960), (1470, 960)], {}),
    ("635078", "McLaren 765LT", "profile", "right", A + "635078_2021-mclaren-765lt/02_2021-mclaren-765lt-799987-959625950.jpg", [(380, 910), (1430, 896)], {}),
    ("635078", "McLaren 765LT", "profile-l", "left", A + "635078_2021-mclaren-765lt/07_2021-mclaren-765lt-799987-1385787625.jpg", [(480, 910), (1550, 890)], {}),
    ("635078", "McLaren 765LT", "front34", "left", A + "635078_2021-mclaren-765lt/08_2021-mclaren-765lt-799987-1216898755.jpg", [(930, 1030), (1690, 880)], dict(cut_poly=[(0,935),(150,942),(300,978),(500,1008),(700,1023),(790,1027),(850,1030),(930,1033),(1010,1028),(1060,1000),(1080,948),(1200,923),(1450,873),(1580,852),(1620,875),(1690,886),(1750,878),(1780,850),(1920,840)])),
    ("635078", "McLaren 765LT", "rear34", "right", A + "635078_2021-mclaren-765lt/06_2021-mclaren-765lt-799987-1401117373.jpg", [(270, 910), (1110, 1040)], dict(cut_poly=[(0,850),(140,853),(170,880),(220,910),(270,916),(330,910),(370,893),(600,913),(900,948),(960,1000),(1030,1040),(1110,1048),(1200,1040),(1270,1010),(1300,990),(1500,945),(1700,898),(1790,858),(1920,850)])),
    ("602202", "Porsche 918 Spyder", "profile", "right", A + "602202_2015-porsche-918-spyder/02_2015-porsche-918--spyder-2990070-1214548845.jpg", [(400, 890), (1500, 870)], dict(pockets_on=[(0,0,700,850)])),
    ("602202", "Porsche 918 Spyder", "profile-l", "left", A + "602202_2015-porsche-918-spyder/07_2015-porsche-918--spyder-2990070-1643695682.jpg", [(440, 884), (1530, 880)], dict(pockets_on=[(1200,0,1920,850)])),
    ("602202", "Porsche 918 Spyder", "front34", "left", A + "602202_2015-porsche-918-spyder/08_2015-porsche-918--spyder-2990070-1882969943.jpg", [(900, 1000), (1660, 870)], dict(cut_poly=[(0,900),(140,906),(300,961),(500,981),(750,991),(800,1003),(900,1011),(990,1005),(1040,980),(1050,926),(1500,861),(1600,856),(1640,875),(1660,879),(1740,872),(1775,850),(1920,845)], pockets_on=[(1350,0,1920,850)])),
    ("636254", "Porsche 911 Sport Classic", "profile", "right", A + "636254_2023-porsche-911-sport-classic/02_2023-porsche-911--sport--classic-720075-1280454409.jpg", [(470, 956), (1390, 956)], {}),
    ("636254", "Porsche 911 Sport Classic", "profile-l", "left", A + "636254_2023-porsche-911-sport-classic/08_2023-porsche-911--sport--classic-720075-2060954922.jpg", [(470, 950), (1390, 950)], {}),
    ("636254", "Porsche 911 Sport Classic", "front34", "left", A + "636254_2023-porsche-911-sport-classic/06_2023-porsche-911--sport--classic-720075-1171845760.jpg", [(920, 1066), (1560, 940)], dict(cut_poly=[(0,985),(200,992),(400,1017),(600,1031),(780,1036),(920,1036),(1010,1025),(1050,1000),(1060,982),(1450,932),(1500,942),(1560,946),(1640,938),(1665,915),(1920,905)])),
    ("616145", "Ferrari 812 GTS", "profile", "left", T + "616145_2021-ferrari-812-gts/006_2021-ferrari-812--gts-770075-1220401349.jpg", [(410, 920), (1470, 910)], {}),
    ("616145", "Ferrari 812 GTS", "front34", "left", T + "616145_2021-ferrari-812-gts/007_2021-ferrari-812--gts-770075-36896449.jpg", [(820, 1020), (1630, 896)], dict(cut_poly=[(0,912),(150,918),(300,973),(500,983),(680,988),(720,1010),(820,1029),(920,1020),(975,990),(990,943),(1300,908),(1520,883),(1560,895),(1630,901),(1720,893),(1745,870),(1920,860)])),
    ("616145", "Ferrari 812 GTS", "frontal", "front", T + "616145_2021-ferrari-812-gts/010_2021-ferrari-812--gts-770075-1094595091.jpg", [(420, 1060), (1500, 1060)], {}),
    ("624911", "Ferrari F430", "profile", "right", A + "624911_2007-ferrari-f430/02_2007-ferrari-f430-290071-239175384.jpg", [(400, 916), (1450, 906)], {}),
    ("624911", "Ferrari F430", "front34", "left", A + "624911_2007-ferrari-f430/07_2007-ferrari-f430-290071-1878952074.jpg", [(870, 1020), (1670, 900)], dict(cut_poly=[(0,910),(150,916),(260,951),(400,968),(600,981),(730,991),(790,1012),(870,1022),(960,1012),(1000,985),(1010,906),(1300,886),(1540,866),(1600,895),(1670,904),(1740,895),(1760,870),(1920,860)])),
]
DEF = dict(fuzz=9, floor_fuzz=60, chroma=24, pocket_D=9, pocket_area=120, protect=[], pockets_on=[], ring_run=30, ring_reach=60, peel=3, peel_L=165, zone_off=130,  zone_L=95)


def cyc_model(a):
    L = a.mean(2)
    chroma = a.max(2) - a.min(2)
    bgm = (L >= 215) & (chroma <= 12)
    def interp(s):
        w = ndi.gaussian_filter(bgm.astype(np.float32), s)
        B = np.stack([ndi.gaussian_filter(a[..., c] * bgm, s) for c in range(3)], -1)
        return B / np.maximum(w, 1e-4)[..., None], w
    B, w = interp(25)
    B2, _ = interp(120)
    t = np.clip(w / 0.05, 0, 1)[..., None]
    return B * t + B2 * (1 - t)


def ring_fit(L, H, W):
    """Find the cyc ring (thin dark curve ~ y 500..950) in columns where it is isolated; robust quadratic."""
    pts = []
    for x in range(4, W - 4, 8):
        col = L[450:1000, x]
        y = int(np.argmin(col)); v = col[y]
        if v > 150:
            continue
        dark = col < (v + 255) / 2
        # thin: dark run around y shorter than 18 px, and bright around it
        y0 = y
        while y0 > 0 and dark[y0 - 1]: y0 -= 1
        y1 = y
        while y1 < len(col) - 1 and dark[y1 + 1]: y1 += 1
        if y1 - y0 < 26 and col[max(0, y0 - 8)] > 175 and col[min(len(col) - 1, y1 + 8)] > 120:
            pts.append((x, y + 450))
    pts = np.array(pts, float).reshape(-1, 2)
    if len(pts) < 4:
        return None, pts
    xl, xr = pts[:, 0].min(), pts[:, 0].max()
    deg = 2 if (pts[:, 0] < W / 2).any() and (pts[:, 0] > W / 2).any() else 1
    keep = np.ones(len(pts), bool)
    for _ in range(4):
        p = np.polyfit(pts[keep, 0], pts[keep, 1], deg)
        r = np.abs(np.polyval(p, pts[:, 0]) - pts[:, 1])
        keep = r < 6
    return p, pts[keep]


def refine_contact(L, x, y, half=28, win=45):
    """Contact = strongest dark->light step (going down) in the tyre's central columns."""
    prof = np.median(L[y - win:y + win, x - half:x + half], axis=1)
    sm = ndi.uniform_filter1d(prof, 3)
    g = sm[3:] - sm[:-3]
    k = int(np.argmax(g))
    return y - win + k + 1, float(g[k])


def build(fr, debug=True):
    id_, car, ang, facing, src, wheels, extra = fr
    cfg = dict(DEF)
    if id_ in ("628929", "635078", "602202", "636254"):     # saturated paint: neutral grey below the body is ground
        cfg["zone_off"] = 280
    cfg.update(extra)
    key = f"{id_}-{ang}"
    img = Image.open(src).convert("RGB")
    a = np.asarray(img).astype(np.float32)
    H, W, _ = a.shape
    L = a.mean(2)
    chroma = a.max(2) - a.min(2)
    B = cyc_model(a)
    D = np.sqrt(((a - B) ** 2).sum(2))
    yy, xx = np.mgrid[0:H, 0:W]

    # --- contact points & cut line
    contacts = []
    for (x, y) in wheels:
        cy, g = refine_contact(L, x, y)
        contacts.append((x, cy, round(g, 1)))
    cx = np.array([c[0] for c in contacts], float); cyv = np.array([c[1] for c in contacts], float)
    if cfg.get("cut_poly"):
        px_, py_ = zip(*cfg["cut_poly"])
        CUT = np.interp(np.arange(W), px_, py_)
    elif cfg.get("cut_flat") or len(set(cyv)) == 1 or ang == "frontal":
        CUT = np.full(W, cyv.max())
    else:
        p = np.polyfit(cx, cyv, 1)
        CUT = np.polyval(p, np.arange(W))
    CUTI = np.floor(CUT).astype(int)            # rows >= CUTI are ground
    sill = int(min(cyv) - cfg.get("sill_above", 70))

    # --- background eligibility
    fuzz = np.where(yy >= sill, cfg["floor_fuzz"], cfg["fuzz"])
    E = (D < fuzz) & (chroma < cfg["chroma"])
    # floor below sill: also anything light and neutral is floor/reflection haze
    E |= (yy >= sill) & (L > 200) & (chroma < 30)
    # ground zone (parallel above the cut line): floor shadow (neutral grey) and paint reflections
    # (light, desaturated) are ground; tyres, splitters and paint stay
    zone = yy >= (CUT[None, :] - cfg["zone_off"])
    E |= zone & (((chroma < 30) & (L > cfg["zone_L"])) | ((L > 165) & (chroma < 90)))

    # ring: dark line + light shading strip under it; thin vertical runs inside a +-24 px band
    rp, rpts = ring_fit(L, H, W)
    if rp is None:
        rp = np.array([-1e4])
    yr = np.polyval(rp, xx)
    band = (yy - yr >= -14) & (yy - yr <= 26)
    # only near where the ring is actually seen (it disappears behind the car)
    near = np.zeros(W, bool)
    for px in rpts[:, 0] if len(rpts) else []:
        near[max(0, int(px) - cfg["ring_reach"]):int(px) + cfg["ring_reach"]] = True
    band &= near[None, :]
    # ring-dark: short dark vertical runs inside the band
    dk = band & (L < 160)
    lab, n = ndi.label(dk, structure=[[0, 1, 0], [0, 1, 0], [0, 1, 0]])
    if n:
        sizes = ndi.sum(np.ones_like(L), lab, index=np.arange(1, n + 1))
        drun = np.concatenate([[0], sizes])[lab]
        ringd = dk & (drun < 26)
        # its light shading strip: up to 18 px below a ring-dark pixel
        below = np.zeros_like(ringd)
        for k in range(1, 19):
            below[k:] |= ringd[:-k]
        for k in range(1, 5):
            below[:-k] |= ringd[k:]
        strip = below & ~ringd & (L > 120) & (chroma < 25) & band
        E |= ringd | strip
    # thin opaque vertical runs inside the band (whatever their tone) are ring, not car
    opq = ~E
    lab, n = ndi.label(opq, structure=[[0, 1, 0], [0, 1, 0], [0, 1, 0]])
    if n:
        sizes = ndi.sum(np.ones_like(L), lab, index=np.arange(1, n + 1))
        run = np.concatenate([[0], sizes])[lab]
        E |= band & opq & (run < cfg["ring_run"]) & (L < 170)

    E[yy >= CUTI[None, :].repeat(H, 0)] = True
    for (x0, y0, x1, y1) in cfg["protect"]:
        E[y0:y1, x0:x1] = False

    lab, n = ndi.label(E)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fill = np.isin(lab, list(border))
    # enclosed pockets: cyc-matching enclosed background
    pockets = []
    ids = [i for i in range(1, n + 1) if i not in border]
    if ids:
        idx = np.arange(1, n + 1)
        area = ndi.sum(np.ones_like(L), lab, idx)
        meanD = ndi.mean(D, lab, idx)
        meanC = ndi.mean(chroma, lab, idx)
        sl = ndi.find_objects(lab)
        for i in ids:
            if area[i - 1] >= cfg["pocket_area"] and meanD[i - 1] < cfg["pocket_D"] and meanC[i - 1] < 10:
                s = sl[i - 1]
                box = (s[1].start, s[0].start, s[1].stop, s[0].stop)
                if not any(bx0 <= box[0] and box[2] <= bx1 and by0 <= box[1] and box[3] <= by1 for (bx0, by0, bx1, by1) in cfg["pockets_on"]):
                    continue
                fill |= lab == i
                pockets.append([int(v) for v in box] + [int(area[i - 1])])
    M = ~fill
    M &= yy < CUTI[None, :]
    # keep the main body component (+ big parts attached through thin gaps: keep comps >= 3% of main)
    lab2, n2 = ndi.label(M)
    sizes = ndi.sum(M, lab2, index=np.arange(1, n2 + 1))
    main = sizes.max()
    sl2 = ndi.find_objects(lab2)
    top = np.array([q[0].start <= 2 for q in sl2])          # studio ceiling arc etc.
    keep = np.concatenate([[False], (sizes >= 0.03 * main) & ~(top & (sizes < main))])
    M = keep[lab2]

    # --- light peel: glossy paint / glass at the silhouette that mirrors the white cyc reads as a
    # white halo on dark ground. Peel up to N px of near-white neutral boundary pixels (no blur).
    st = ndi.generate_binary_structure(2, 1)
    for _ in range(cfg["peel"]):
        bd = M & ~ndi.binary_erosion(M, structure=st)
        pl = bd & (L > cfg["peel_L"]) & (chroma < 28)
        if not pl.any():
            break
        M = M & ~pl

    # --- alpha: choke 1 px; rim coverage + decontamination
    Me = ndi.binary_erosion(M, structure=st)
    Me &= ~(zone & ~ndi.binary_erosion(Me, structure=st) & ~(yy >= CUTI[None, :] - 3))   # 2 px choke on ground-facing edges
    rim = Me & ~ndi.binary_erosion(Me, structure=st)          # outermost kept row (1 px)
    deep = ndi.binary_erosion(M, structure=st, iterations=5)
    _, (iy, ix) = ndi.distance_transform_edt(~deep, return_indices=True)
    F = a[iy, ix]
    # local background: nearest pixel >= 3 px outside the mask (floor shadow under sills, not the cyc model)
    bg3 = ndi.binary_erosion(~M, structure=st, iterations=3)
    _, (by, bx) = ndi.distance_transform_edt(~bg3, return_indices=True)
    Bl = a[by, bx]
    B = np.where((ndi.distance_transform_edt(~bg3) < 12)[..., None], Bl, B)
    FB = F - B; CB = a - B
    nfb = (FB ** 2).sum(2)
    cov = np.clip((CB * FB).sum(2) / np.maximum(nfb, 1), 0, 1)
    valid = nfb > 30 ** 2                     # paint distinguishable from cyc
    a_rim = np.where(valid, np.clip((cov - 0.2) / 0.6, 0, 1), 1.0)
    alpha = Me.astype(np.float32)
    alpha[rim] = a_rim[rim]
    # the floor cut is a straight hard edge
    atcut = rim & (yy >= CUTI[None, :] - 3)
    alpha[atcut] = 1.0
    rgb = a.copy()
    dec = B + CB / np.maximum(cov, 0.25)[..., None]
    rimc = rim & valid & ~atcut
    rgb[rimc] = np.clip(dec[rimc], 0, 255)
    # second row: un-mix light cyc spill too (only where the pixel is lighter than its paint)
    row2 = Me & ~rim & ~ndi.binary_erosion(Me, structure=st, iterations=2)
    spill = row2 & valid & (cov < 0.97) & (L > F.mean(2) + 6)
    rgb[spill] = np.clip(dec[spill], 0, 255)

    ys, xs = np.where(alpha > 0)
    x0, x1, y0, y1 = int(max(xs.min() - 2, 0)), int(min(xs.max() + 3, W)), int(max(ys.min() - 2, 0)), int(min(ys.max() + 3, H))
    rgba = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(rgba, "RGBA")
    im.save(OUT + f"{key}.webp", "WEBP", lossless=True, method=6)
    w960 = 960
    if im.width > w960:
        h960 = round(im.height * w960 / im.width)
        sm = im.convert("RGBa").resize((w960, h960), Image.LANCZOS).convert("RGBA")
    else:
        sm = im
    sm.save(OUT + f"{key}-960.webp", "WEBP", quality=92, alpha_quality=100, method=6)

    tyre_rows = [int(c[1]) - 1 - y0 for c in contacts]   # last opaque row above the cut, in cut-out px
    meta = dict(file=f"{key}.webp", file_960=f"{key}-960.webp", listing_id=id_, car=car, angle=ang, facing=facing,
                source=src.replace(R, ""), source_px=[W, H], size_px=[im.width, im.height],
                size_960_px=[sm.width, sm.height],
                bbox_in_source=[int(x0), int(y0), int(x1), int(y1)],
                tyre_contact_y=int(max(tyre_rows)), tyre_contacts=[[int(c[0]) - x0, int(c[1]) - 1 - y0] for c in contacts],
                cut_line_source=[[0, float(CUT[0])], [W - 1, float(CUT[-1])]],
                ring_points=int(len(rpts)), pockets_removed=pockets)
    if debug:
        os.makedirs(DBG, exist_ok=True)
        dbg = (a * 0.5 + 0).astype(np.uint8).copy()
        dbg[M] = (a[M] * 0.35 + np.array([255, 0, 255]) * 0.65).astype(np.uint8)
        for x in range(W):
            dbg[CUTI[x] - 1:CUTI[x] + 1, x] = (0, 255, 0)
            y_ = int(np.polyval(rp, x))
            if 0 <= y_ < H: dbg[y_, x] = (0, 255, 255)
        Image.fromarray(dbg).save(DBG + f"{key}_mask.jpg", quality=80)
    return key, meta


def write_manifest(items, rejected):
    order = [f"{f[0]}-{f[2]}" for f in FR]
    man = dict(
        status="TEMPORARY cut-outs - non-AI local key (flood-fill of white cyc + 1px choke + colour decontamination). "
               "Final high-quality cut-outs will be supplied later; replace files 1:1 by name.",
        generated_by="site/assets/cutouts/_build/cutout.py (review sheet: _build/review.py -> _review.jpg)",
        rules="Crisp edge (<=1px AA), no feather/blur/glow/drawn shadow, never mirrored or distorted. Floor reflection removed at the tyre-contact line.",
        coords="bbox_in_source = [x0,y0,x1,y1] in source px; tyre_contact_y = px from the top of the cut-out to the lowest tyre row (car stands on this row); tyre_contacts = [x,y] per wheel in cut-out px; -960 file = same crop scaled to 960 px wide.",
        rejected=rejected,
        cutouts=[items[k] for k in order if k in items])
    tmp = OUT + "MANIFEST.json.tmp"
    json.dump(man, open(tmp, "w"), indent=1)
    os.replace(tmp, OUT + "MANIFEST.json")


if __name__ == "__main__":
    want = set(sys.argv[1:])
    try:
        man = json.load(open(OUT + "MANIFEST.json"))
        items = {m["file"][:-5]: m for m in man["cutouts"]}
        REJECTED = man.get("rejected", [])
    except Exception:
        items, REJECTED = {}, []
    for fr in FR:
        k = f"{fr[0]}-{fr[2]}"
        if want and k not in want:
            continue
        key, meta = build(fr)
        old = items.get(key, {})
        meta["quality"] = old.get("quality", "unreviewed")
        meta["note"] = old.get("note", "")
        items[key] = meta
        write_manifest(items, REJECTED)
        print(key, meta["size_px"], "contact", meta["tyre_contacts"], "pockets", len(meta["pockets_removed"]), "ring", meta["ring_points"], flush=True)
