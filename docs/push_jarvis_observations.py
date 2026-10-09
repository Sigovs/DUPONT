"""Load docs/jarvis-observations.json into Jarvis as observations for one project.

Usage:  python docs/push_jarvis_observations.py <JARVIS_BASE_URL> <PROJECT_ID>
        e.g. python docs/push_jarvis_observations.py https://jarvis.example.com/api 12

POST /observations creates each item (open); items marked "superseded" are then
PATCHed to that status so Jarvis treats them as history/constraints, not next steps.
Stdlib only. Prints each created id.
"""
import json
import sys
import urllib.request
from pathlib import Path


def call(method, url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode() or "{}")


def main():
    base, project_id = sys.argv[1].rstrip("/"), int(sys.argv[2])
    items = json.loads((Path(__file__).parent / "jarvis-observations.json").read_text(encoding="utf-8"))
    for it in items:
        made = call("POST", f"{base}/observations",
                    {"project_id": project_id, "source": it["source"], "content": it["content"][:600]})
        oid = made["id"]
        if it.get("status", "open") != "open":
            call("PATCH", f"{base}/projects/{project_id}/observations/{oid}",
                 {"status": it["status"], "resolution_note": "Recorded from project history 2026-10-09"})
        print(oid, it.get("status", "open"), it["content"][:60])


if __name__ == "__main__":
    main()
