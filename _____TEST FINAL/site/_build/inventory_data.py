"""Inventory data + photos for 02-collection and inventory.html.  Run: python site/_build/inventory_data.py

Reads   _____TEST FINAL/data/inventory-rebuild.json   (listings, verified facts, dated 8 Oct 2026)
        _____TEST FINAL/data/assets-rebuild.json      (photos per listing, angle tags, provenance)
Writes  site/assets/data/inventory.js                 window.SELECT_INVENTORY = {meta, rooms, listings}
        site/assets/inventory/img/<id>-{640,960}.webp  one card photo per listing (copies, never the source)
        marker blocks inside site/inventory.html and site/sections/02-collection/section.html:
          <!--@x-->...<!--/@x-->  (make options, model options, room counts, finder index, static results)

Rules carried from the data (CP5/CP7): a photo is only ever shown under its own listing; gallery photo #1 is
skipped (baked lockup overlay); price 0/None is "not shown" (rendered as 'Price on listing', never invented);
"newest" = highest dR listing id (ids are sequential: verified against dateListed for the 48 dated listings).
"""
import html, json, pathlib, re
from PIL import Image

SITE = pathlib.Path(__file__).resolve().parents[1]
ROOT = SITE.parent                                   # _____TEST FINAL
DATA = ROOT / "data"
OUT_JS = SITE / "assets" / "data" / "inventory.js"
OUT_IMG = SITE / "assets" / "inventory" / "img"
ACCESSED = "2026-10-08"
AS_OF = "8 Oct 2026"
ROOMS = {"SOCAL": ("socal", "Southern California"), "MIAMI": ("miami", "Miami"), "NAPLES": ("naples", "Naples")}
ANGLE_PREF = ["front-3-4", "frontal", "profile", "rear-3-4", "rear"]


def pick_photo(assets):
    """Best card frame: whole car, no baked overlay, not gallery #1, preferring front three-quarter."""
    ok = [a for a in assets if not a.get("bakedOverlay") and a.get("angle") in ANGLE_PREF
          and (ROOT / a["file"]).exists()]
    if not ok:
        return None
    # inside one angle prefer the higher gallery index the studio shoots last (cleaner reflections), then width
    ok.sort(key=lambda a: (ANGLE_PREF.index(a["angle"]), -(a.get("width") or 0), a["id"]))
    return ok[0]


def export(asset, lid):
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    src = Image.open(ROOT / asset["file"]).convert("RGB")
    w, h = src.size
    # 3:2 card frame, centred (studio frames are already 3:2; daylight 639x426 too)
    tw = min(w, int(h * 1.5)); th = int(tw / 1.5)
    src = src.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th))
    out = {}
    for size in (640, 960):
        if size > tw and size != 640:
            continue
        im = src.resize((min(size, tw), int(min(size, tw) / 1.5)), Image.LANCZOS)
        p = OUT_IMG / f"{lid}-{size}.webp"
        im.save(p, "WEBP", quality=80, method=6)
        out[size] = (p.relative_to(SITE).as_posix(), im.size)
    return out


def money(v):
    return f"${v:,.0f}" if v else None


def main():
    inv = json.loads((DATA / "inventory-rebuild.json").read_text(encoding="utf-8"))
    assets = json.loads((DATA / "assets-rebuild.json").read_text(encoding="utf-8"))["assets"]
    p3 = DATA / "assets-rebuild-pass3.json"          # pass 3 (2026-10-09): galleries fetched for the 21 unphotographed listings
    if p3.exists():
        assets += json.loads(p3.read_text(encoding="utf-8"))["assets"]
    by_listing = {}
    for a in assets:
        if a.get("listingId"):
            by_listing.setdefault(str(a["listingId"]), []).append(a)

    rows = []
    for l in inv["listings"]:
        lid = str(l["listingId"])
        key, room = ROOMS[l["inScopeLocation"]]
        photo = pick_photo(by_listing.get(lid, []))
        img = export(photo, lid) if photo else {}
        flags = l.get("flags") or []
        nophoto_reason = None
        if not photo:
            j = " ".join(flags)
            nophoto_reason = ("none-published" if ("no own photos" in j or "no vehicle photos" in j or "placeholder" in j)
                              else "not-downloaded")
        price = l.get("priceUSD") or None
        rows.append({
            "id": lid,
            "year": l["year"], "make": l["make"], "model": l["model"], "title": l["title"],
            "price": price, "priceText": money(price),
            "miles": l.get("mileage"),
            "room": key, "roomName": room,
            "colour": l.get("exteriorColor") if l.get("exteriorColor") not in (None, "Other") else None,
            "transmission": l.get("transmission"),
            "drivetrain": None if l.get("drivetrain") in (None, "Unspecified") else l["drivetrain"].split(" (")[0],
            "vin": l.get("vin"), "stock": l.get("stockId"),
            "dateListed": (l.get("dateListed") or "")[:10] or None,
            "url": l["listingUrl"],
            "img": img.get(960, img.get(640, (None,)))[0] if img else None,
            "img640": img[640][0] if img else None,
            "imgW": img[max(img)][1][0] if img else None,
            "noPhoto": nophoto_reason,
            "prov": {
                "source": (l.get("provenance") or {}).get("source") or l["listingUrl"],
                "accessed": (l.get("provenance") or {}).get("accessed") or ACCESSED,
                "status": l.get("status"),
                "photoAsset": photo["id"] if photo else None,
                "photoSource": photo.get("sourceUrl") if photo else None,
                "flags": flags,
            },
        })
    rows.sort(key=lambda r: -int(r["id"]))   # newest first in the data file
    static_rows = sorted(rows, key=lambda r: (-(r["price"] or -1), -int(r["id"])))   # page default: price high to low

    rooms = []
    for code, (key, name) in ROOMS.items():
        rooms.append({"key": key, "name": name, "count": sum(1 for r in rows if r["room"] == key)})
    meta = {
        "asOf": AS_OF, "accessed": ACCESSED,
        "source": "https://www.dupontregistry.com/ (client-authorised; dealer SRPs 814 SoCal, 3730 Miami, 7426 Naples)",
        "built": "site/_build/inventory_data.py from data/inventory-rebuild.json + data/assets-rebuild.json",
        "count": len(rows),
        "newest": "ordered by dR listing id (sequential; matches dateListed order for every dated listing)",
        "priceNull": "price 0/absent in dR data -> shown as 'Price on listing' (no figure invented)",
    }
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.write_text("/* GENERATED by site/_build/inventory_data.py - do not hand-edit. Facts as of " + AS_OF +
                      " (dupontregistry.com, accessed " + ACCESSED + "). */\nwindow.SELECT_INVENTORY = " +
                      json.dumps({"meta": meta, "rooms": rooms, "listings": rows}, ensure_ascii=False, indent=0) + ";\n",
                      encoding="utf-8")

    # ---------- marker blocks ----------
    makes = sorted({r["make"] for r in rows}, key=str.lower)
    make_opts = "\n".join(f'<option value="{html.escape(m)}">{html.escape(m)}</option>' for m in makes)
    model_opts = "\n".join(
        f'<optgroup label="{html.escape(m)}">' + "".join(
            f'<option value="{html.escape(mo)}">{html.escape(mo)}</option>'
            for mo in sorted({r["model"] for r in rows if r["make"] == m}, key=str.lower)) + "</optgroup>"
        for m in makes)
    idx = [[r["make"], r["model"], r["room"], " ".join(str(x) for x in (r["year"], r["title"], r["colour"] or "", r["transmission"] or "", r["vin"] or "", r["stock"] or "", r["roomName"]))] for r in rows]
    blocks = {
        "make-options": make_opts,
        "model-options": model_opts,
        "count-all": str(len(rows)),
        "count-socal": str(rooms[0]["count"]), "count-miami": str(rooms[1]["count"]), "count-naples": str(rooms[2]["count"]),
        "finder-index": '<script type="application/json" data-finder-index>' + json.dumps(idx, ensure_ascii=False) + "</script>",
        "static-results": static_results(static_rows),
    }
    for f in (SITE / "inventory.html", SITE / "sections" / "02-collection" / "section.html"):
        if not f.exists():
            continue
        s = f.read_text(encoding="utf-8")
        for k, v in blocks.items():
            s = re.sub(r"(<!--@" + re.escape(k) + r"-->)(.*?)(<!--/@" + re.escape(k) + r"-->)",
                       lambda m: m.group(1) + v + m.group(3), s, flags=re.S)
        f.write_text(s, encoding="utf-8")
    print(f"{len(rows)} listings, {sum(1 for r in rows if r['img'])} with photos ->", OUT_JS.relative_to(SITE))
    print("rooms", rooms)


def static_results(rows):
    """No-JS result list (JS replaces it). Same anatomy as the JS card."""
    out = []
    for r in rows:
        out.append(card_html(r))
    return "\n".join(out)


def card_html(r):
    e = html.escape
    title = e(r["model"])
    media = (f'<img src="{e(r["img"])}" srcset="{e(r["img640"])} 640w, {e(r["img"])} {r["imgW"]}w" '
             f'sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" width="960" height="640" '
             f'loading="lazy" decoding="async" alt="{e(r["title"])}">' if r["img"] else
             f'<span class="vc__none">'
             f'<span class="vc__none-n">{"[No photos published on the listing yet]" if r["noPhoto"] == "none-published" else "[Photos on the duPont REGISTRY listing]"}</span></span>')
    specs = [f'{r["miles"]:,} mi' if r["miles"] is not None else None, r["transmission"], r["colour"]]
    specs = "".join(f"<li>{e(s)}</li>" for s in specs if s)
    price = e(r["priceText"]) if r["priceText"] else "Price on listing"
    return (f'<li class="vc" data-id="{r["id"]}"><a class="vc__a" href="{e(r["url"])}" target="_blank" rel="noopener">'
            f'<span class="vc__media">{media}<span class="vc__room">{e(r["roomName"])}</span></span>'
            f'<span class="vc__body"><span class="vc__eyebrow">{r["year"]} · {e(r["make"])}</span>'
            f'<span class="vc__title">{title}</span><ul class="vc__specs">{specs}</ul>'
            f'<span class="vc__foot"><span class="vc__price">{price}</span>'
            f'<span class="vc__go">View listing <span aria-hidden="true">↗</span><span class="sr"> — {e(r["title"])} on duPont REGISTRY, opens in a new tab</span></span></span>'
            f'</span></a></li>')


# ---------- 02-collection cut-outs: one CSS variable block per car, from the cut-out manifest ----------
CO_CARS = {"dbs": "635055", "812": "616145", "765lt": "635078"}
CO_PREF = {"dbs": "635055-front34", "812": "616145-profile-v2", "765lt": "635078-front34"}   # dominant DBS front34 · 812 profile (far) · 765LT front34 (tight crop)


def _entries(man):
    if isinstance(man, list):
        return man
    for k in ("files", "cutouts", "items", "assets", "entries"):
        if isinstance(man.get(k), list):
            return man[k]
    return [dict(v, file=v.get("file", k)) for k, v in man.items() if isinstance(v, dict) and not k.startswith("_")]


def _num(e, *keys):
    for k in keys:
        if e.get(k) is not None:
            return float(e[k])
    return None


def cutout_css():
    """Cut-outs from site/assets/cutouts/MANIFEST.json; CO_PREF picks the file (facing) per car."""
    sources = [(SITE / "assets" / "cutouts" / "MANIFEST.json", "../../assets/cutouts/")]
    loaded = [(m, rel, _entries(json.loads(m.read_text(encoding="utf-8")))) for m, rel in sources if m.exists()]
    if not loaded:
        return "/* no cut-out manifest yet */", "none"
    out, used = [], set()
    for key, lid in CO_CARS.items():
        for man, rel, ents in loaded:
            cands = [e for e in ents if str(e.get("listingId") or e.get("listing_id") or e.get("listing") or "").startswith(lid)
                     or lid in str(e.get("file") or e.get("path") or "")]
            cands = [e for e in cands if "reject" not in str(e.get("quality", "")).lower()]
            if not cands:
                continue
            pref = CO_PREF.get(key, "")
            cands.sort(key=lambda e: (0 if pref and str(e.get("file", "")).startswith(pref + ".") else 1,
                                      0 if "profile" in str(e.get("angle", "") + str(e.get("file", ""))).lower() else 1))
            e = cands[0]
            f = str(e.get("file") or e.get("path")).replace("\\", "/").split("/")[-1]
            w, h = _num(e, "width", "w"), _num(e, "height", "h")
            if (not w or not h) and isinstance(e.get("size_px"), list):
                w, h = map(float, e["size_px"])
            if (not w or not h) and (man.parent / f).exists():
                w, h = Image.open(man.parent / f).size
            cy = _num(e, "contactY", "tyreContactY", "tyre_contact_y", "contact_y", "floorY", "floor_y", "tyreY")
            cy = (cy if cy is not None and cy <= 1.0 else ((cy + 1) / h if cy is not None else 1.0))
            out.append(f'.s-collection [data-co="{key}"] {{ --co-img: url({rel}{f}); --co-ar: {w / h:.4f}; --co-cy: {min(cy, 1):.4f}; }}'
                       f"  /* {lid} · {rel}{f} · {int(w)}x{int(h)} · facing {e.get('facing', '?')} */")
            used.add(man.relative_to(SITE).as_posix())
            break
        else:
            out.append(f"/* {key}: no cut-out for {lid} yet */")
    return "\n".join(out), " + ".join(sorted(used))


def write_cutouts():
    css = SITE / "sections" / "02-collection" / "section.css"
    if not css.exists():
        return
    block, src = cutout_css()
    s = css.read_text(encoding="utf-8")
    s = re.sub(r"(/\*@cutouts\*/)(.*?)(/\*/@cutouts\*/)",
               lambda m: m.group(1) + "\n/* generated from " + src + " */\n" + block + "\n" + m.group(3), s, flags=re.S)
    css.write_text(s, encoding="utf-8")
    print("cut-outs from", src)


if __name__ == "__main__":
    main()
    write_cutouts()
