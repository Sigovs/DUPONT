"""Fix round 2: the closing bookend - the hero trio from the REAR (frame 04 of each listing), keyed with the
storyboard's non-AI pipeline in its front/rear mode (flank fits), exactly as the hero cut-outs.
Temporary layers until Alex's finals. Run:  python -I site_v1/v4/_build/rear_cutout.py"""
import sys, glob, json, importlib.util
ROOT = "C:/____WORK/DU PONT REGESTRY/"
spec = importlib.util.spec_from_file_location("cutout", ROOT + "site_v1/v4/storyboard/build/cutout.py")
cut = importlib.util.module_from_spec(spec); spec.loader.exec_module(cut)
cut.OUT = ROOT + "site_v1/v4/_build/railcut/"
# id: tyre contact row measured on the frame (lower strip with a 20 px scale)
CARS = {"624911": 1004, "628929": 1016, "636254": 1052}
if __name__ == "__main__":
    meta = {}
    for cid in (sys.argv[1:] or CARS):
        low = CARS[cid]
        src = sorted(glob.glob(ROOT + f"assets/source/{cid}_*/04_*"))[0].replace("\\", "/")
        meta["rear-" + cid] = cut.build("rear-" + cid, dict(src=src, fuzz=22, floor_fuzz=70, floor_y=low - 40,
            flanks=[("L", 600, low - 30), ("R", 600, low - 30)], flank_t=12, cut=low, plate_top=low - 80,
            pockets=[], protect=[]), debug=True)
    json.dump(meta, open(cut.OUT + "rear-meta.json", "w"), indent=1)
    print({k: (v["cut_bbox"], v["pockets_found"][:3]) for k, v in meta.items()})
