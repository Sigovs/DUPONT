"""626613-profile-v2: local, non-AI repair of the temporary cut-out's top silhouette.
1. The roof/windscreen/nose edge was keyed against a white cyc reflected in black glass and paint, so it is jagged
   and pale. The top silhouette is re-fitted per column (running median 31 -> running mean 15) and the alpha above /
   at the fitted line is rebuilt with a 1px anti-aliased edge.
2. Pale fringe: the first 4 rows under the fitted edge take the darker of their own colour and the colour 8 rows
   further in (per channel) wherever the edge is pale (L > 140). No blur, no feather, no generated pixels.
3. Nose tip: pale residue in the first 70 columns removed (alpha 0 where L > 150).
Input: 626613-profile.webp  Output: 626613-profile-v2.webp (+ -960)."""
import sys, pathlib, numpy as np
from PIL import Image
D = pathlib.Path(__file__).resolve().parents[1]
im = np.asarray(Image.open(D / '626613-profile.webp').convert('RGBA')).astype(np.float32)
a = im[..., 3]; H, W = a.shape
L = im[..., 0] * .299 + im[..., 1] * .587 + im[..., 2] * .114
top = np.full(W, -1.0)
for x in range(W):
    c = np.nonzero(a[:, x] > 128)[0]
    if len(c): top[x] = c.min()
valid = top >= 0
xs = np.arange(W)
def runmed(v, k):
    out = v.copy(); h = k // 2
    for i in range(len(v)):
        w = v[max(0, i - h):i + h + 1]; w = w[w >= 0]
        if len(w): out[i] = np.median(w)
    return out
def runmean(v, k):
    out = v.copy(); h = k // 2
    for i in range(len(v)):
        w = v[max(0, i - h):i + h + 1]; w = w[w >= 0]
        if len(w): out[i] = w.mean()
    return out
fit = runmean(runmed(top, 31), 15)
# repair only the long, mostly-smooth roof/windscreen/nose run; leave the ends (nose tip, tail) as cut
X0, X1 = 40, 1580
newa = a.copy(); rgb = im[..., :3].copy()
for x in range(X0, X1):
    if not valid[x]: continue
    t = fit[x]
    y0 = int(max(0, np.floor(min(t, top[x]) - 4))); y1 = int(min(H, np.ceil(max(t, top[x]) + 4)))
    for y in range(y0, y1):
        cov = np.clip((y + 1) - t, 0, 1)          # 1px AA: coverage of the pixel row below the fitted line
        if y < t + 2:
            newa[y, x] = 255 * cov
    yt = int(np.ceil(t))
    if yt + 12 < H and L[yt:yt + 3, x].mean() > 140:
        for d in range(4):
            y = yt + d
            rgb[y, x] = np.minimum(rgb[y, x], rgb[y + 8, x])
# 3. nose tip: pale cyc residue on the leading edge (first 70 columns) is removed (alpha 0 where L > 150)
nose = np.zeros_like(newa, dtype=bool); nose[:, :70] = True
newa[nose & (L > 150)] = 0
out = np.dstack([rgb, newa]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
img.save(D / '626613-profile-v2.webp', lossless=False, quality=92, method=6)
r = img.resize((960, round(H * 960 / W)), Image.LANCZOS); r.save(D / '626613-profile-v2-960.webp', quality=92, method=6)
print('ok', img.size, r.size)
