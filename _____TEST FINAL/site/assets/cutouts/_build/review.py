"""Review sheet: every cut-out at 1:2 on #151413 (left) and #303137 (right), plus optional 1:1 zooms.
python review.py            -> ../_review.jpg
python review.py zoom KEY   -> dbg/KEY_zoom.png (1:1 on #151413, full cut-out)
"""
import json, sys
from PIL import Image, ImageDraw

OUT = "C:/____WORK/DU PONT REGESTRY/_____TEST FINAL/site/assets/cutouts/"
G1, G2 = (0x15, 0x14, 0x13), (0x30, 0x31, 0x37)

man = json.load(open(OUT + "MANIFEST.json"))
if len(sys.argv) > 2 and sys.argv[1] == "zoom":
    im = Image.open(OUT + sys.argv[2] + ".webp")
    bg = Image.new("RGBA", im.size, G1 + (255,)); bg.alpha_composite(im)
    bg.convert("RGB").save(OUT + "_build/dbg/" + sys.argv[2] + "_zoom.png")
    sys.exit()

tiles = []
for m in man["cutouts"]:
    im = Image.open(OUT + m["file"])
    h = im.resize((im.width // 2, im.height // 2), Image.LANCZOS) if False else \
        im.convert("RGBa").resize((im.width // 2, im.height // 2), Image.LANCZOS).convert("RGBA")
    tiles.append((m, h))
cw = max(t[1].width for t in tiles) + 40
rows = []
for m, h in tiles:
    row = Image.new("RGB", (cw * 2, h.height + 60), G1)
    for k, g in enumerate((G1, G2)):
        bg = Image.new("RGBA", (cw, h.height + 60), g + (255,))
        bg.alpha_composite(h, (20, 36))
        d = ImageDraw.Draw(bg)
        cy = 36 + m["tyre_contact_y"] // 2
        d.line([(0, cy + 1), (12, cy + 1)], fill=(172, 29, 40, 255), width=1)
        row.paste(bg.convert("RGB"), (k * cw, 0))
    d = ImageDraw.Draw(row)
    d.text((20, 10), f'{m["file"]}  {m["car"]} - {m["angle"]} ({m["facing"]})  {m["size_px"][0]}x{m["size_px"][1]}  contact y {m["tyre_contact_y"]}  [{m.get("quality","")}]',
           fill=(220, 220, 215))
    rows.append(row)
S = Image.new("RGB", (cw * 2, sum(r.height for r in rows)), G1)
y = 0
for r in rows:
    S.paste(r, (0, y)); y += r.height
S.save(OUT + "_review.jpg", quality=90)
print(S.size)
