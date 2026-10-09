"""Non-AI cleanup for a cut-out: kills near-zero alpha (<24 -> 0), zeroes the colour of fully transparent pixels and
writes a lossless WebP, so no faint tone can survive around the car when it is scaled. Usage:
python clean_alpha.py <in.webp> <out.webp>   (designer, 02-collection round 5, 2026-10-09)"""
import sys, numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGBA')).copy()
alpha = a[..., 3]
alpha[alpha < 24] = 0
a[alpha == 0, :3] = 0
Image.fromarray(a, 'RGBA').save(dst, 'WEBP', lossless=True, quality=100, method=6, exact=True)
print(dst, Image.open(dst).size)
