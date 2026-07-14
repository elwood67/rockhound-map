#!/usr/bin/env python3
"""
fetch_routes.py — pull every known route near you into one routes.json
for the Rockhound Offline Map.

Two sources, both free, no API keys:

  ropewiki  Canyoneering routes. Semantic MediaWiki, so we can ask it
            "every canyon within N km of here" and get JSON back. Each
            page carries a GPS track as a .kml attachment. These are the
            gold — canyoneers document approach trails that appear on no
            official map, because they have to.

  osm       OpenStreetMap paths and tracks via Overpass. Everything tagged
            highway=path/footway/track in your box, including the informal
            stuff that never made it onto a Forest Service map.

Usage:
    python fetch_routes.py                          # 40 km around Pagosa
    python fetch_routes.py --center 37.48,-107.09 --radius 25
    python fetch_routes.py --sources ropewiki       # just the canyon tracks
    python fetch_routes.py --discover "Piedra_River_(East_Fork)"

Writes routes.json next to itself. The app picks it up automatically and
builds one toggleable overlay per source.

Be polite: this hits volunteer-run servers. The script rate-limits itself.
Run it when you're planning, not in a loop.
"""

import argparse
import json
import math
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

UA = "rockhound-map/1.0 (personal offline map; github.com/elwood67)"
ROPEWIKI = "https://ropewiki.com"
OVERPASS = "https://overpass-api.de/api/interpreter"

# Pagosa Springs
DEFAULT_CENTER = (37.2695, -107.0098)
DEFAULT_RADIUS_KM = 40

PAUSE = 1.0  # seconds between requests. Don't lower this.


# ----------------------------------------------------------------- helpers

def get(url, data=None, tries=3):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
    for n in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (404, 403):
                raise                      # not transient — don't waste retries
            if n == tries - 1:
                raise
            time.sleep(2 ** n)
        except Exception as e:
            if n == tries - 1:
                raise
            wait = 2 ** n
            print(f"    retry in {wait}s ({e})", file=sys.stderr)
            time.sleep(wait)


def bbox_from(center, radius_km):
    """South, West, North, East — the box Overpass wants."""
    lat, lon = center
    dlat = radius_km / 111.32
    dlon = radius_km / (111.32 * math.cos(math.radians(lat)))
    return (lat - dlat, lon - dlon, lat + dlat, lon + dlon)


def haversine_km(a, b):
    R = 6371.0
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp = p2 - p1
    dl = math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


# ---------------------------------------------------------------- ropewiki

def rw_api(params):
    url = ROPEWIKI + "/api.php?" + urllib.parse.urlencode(params)
    time.sleep(PAUSE)
    return json.loads(get(url))


def discover(page):
    """Dump the semantic properties on one page, so we can see what
    Ropewiki actually calls things. Run this if the query below stops
    returning results — property names on wikis drift."""
    r = rw_api({"action": "browsebysubject", "subject": page,
                "format": "json", "formatversion": "2"})
    for item in r.get("query", {}).get("data", []):
        vals = [d.get("item") for d in item.get("dataitem", [])][:3]
        print(f"  {item['property']:<32} {vals}")


def rw_nearby(center, radius_km):
    """Ask Semantic MediaWiki for canyons within radius. Semantic Maps
    supports distance queries in the form
        [[Has coordinates::LAT,LON (50 km)]]
    which is what makes this whole thing possible in one call."""
    q = (f"[[Category:Canyons]]"
         f"[[Has coordinates::{center[0]},{center[1]} ({radius_km} km)]]"
         f"|?Has coordinates|limit=500")
    try:
        r = rw_api({"action": "ask", "query": q, "format": "json",
                    "api_version": "2"})
        results = r.get("query", {}).get("results", {})
        if results:
            return list(results.keys())
        print("  ! distance query returned nothing", file=sys.stderr)
    except Exception as e:
        print(f"  ! ask API failed: {e}", file=sys.stderr)

    # Fallback: walk the category and filter by the coords in each KML.
    print("  falling back to category listing (slower)", file=sys.stderr)
    pages, cont = [], {}
    while True:
        p = {"action": "query", "list": "categorymembers",
             "cmtitle": "Category:Canyons", "cmlimit": "500", "format": "json"}
        p.update(cont)
        r = rw_api(p)
        pages += [m["title"] for m in r["query"]["categorymembers"]]
        if "continue" not in r:
            break
        cont = r["continue"]
    return pages


def rw_kml_url(page):
    """Find the .kml attached to a page.

    We ask for the file's *actual* URL rather than building one. A page's
    image list includes files it merely references — plenty of canyon pages
    point at a KML nobody ever uploaded. Those come back flagged `missing`,
    and we skip them instead of chasing a 404.
    """
    r = rw_api({"action": "query", "generator": "images", "titles": page,
                "prop": "imageinfo", "iiprop": "url",
                "format": "json", "formatversion": "2"})
    for pg in r.get("query", {}).get("pages", []):
        title = pg.get("title", "")
        if not title.lower().endswith(".kml"):
            continue
        if pg.get("missing"):
            return None                    # referenced but never uploaded
        info = pg.get("imageinfo") or []
        if info and info[0].get("url"):
            return info[0]["url"]
    return None


# ------------------------------------------------------------- kml parsing

def kml_to_features(raw, source, page):
    """Pull every LineString and Point out of a KML."""
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return []

    ns = {"k": "http://www.opengis.net/kml/2.2"}
    if not root.tag.startswith("{http://www.opengis.net/kml"):
        ns = {"k": root.tag.split("}")[0].strip("{")} if "}" in root.tag else {}

    feats = []

    def coords(text):
        out = []
        for tok in text.replace("\n", " ").split():
            bits = tok.split(",")
            if len(bits) >= 2:
                try:
                    out.append([round(float(bits[0]), 6), round(float(bits[1]), 6)])
                except ValueError:
                    pass
        return out

    for pm in root.iter():
        if not pm.tag.endswith("Placemark"):
            continue
        nm = ""
        for c in pm:
            if c.tag.endswith("name") and c.text:
                nm = c.text.strip()

        for g in pm.iter():
            if g.tag.endswith("LineString"):
                for c in g:
                    if c.tag.endswith("coordinates") and c.text:
                        pts = coords(c.text)
                        if len(pts) > 1:
                            feats.append({
                                "type": "Feature",
                                "geometry": {"type": "LineString", "coordinates": pts},
                                "properties": {"name": nm or page, "layer": source,
                                               "route": page},
                            })
            elif g.tag.endswith("Point"):
                for c in g:
                    if c.tag.endswith("coordinates") and c.text:
                        pts = coords(c.text)
                        if pts:
                            feats.append({
                                "type": "Feature",
                                "geometry": {"type": "Point", "coordinates": pts[0]},
                                "properties": {"name": nm or page, "layer": source,
                                               "route": page},
                            })
    return feats


# ---------------------------------------------------------------- overpass

def osm_paths(bbox):
    s, w, n, e = bbox
    q = f"""[out:json][timeout:120];
(
  way["highway"~"^(path|footway|track|bridleway)$"]({s},{w},{n},{e});
);
out geom;"""
    time.sleep(PAUSE)
    raw = get(OVERPASS, data=q.encode())
    data = json.loads(raw)

    feats = []
    for el in data.get("elements", []):
        geom = el.get("geometry") or []
        if len(geom) < 2:
            continue
        t = el.get("tags", {})
        name = t.get("name") or t.get("highway", "path")
        feats.append({
            "type": "Feature",
            "geometry": {"type": "LineString",
                         "coordinates": [[round(p["lon"], 6), round(p["lat"], 6)]
                                         for p in geom]},
            "properties": {
                "name": name,
                "layer": "osm",
                "highway": t.get("highway"),
                # informal = no name and no official ref. These are the
                # social trails — the ones worth a second look.
                "informal": not t.get("name") and not t.get("ref"),
                "surface": t.get("surface"),
            },
        })
    return feats


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--center", default=f"{DEFAULT_CENTER[0]},{DEFAULT_CENTER[1]}")
    ap.add_argument("--radius", type=float, default=DEFAULT_RADIUS_KM,
                    help="km")
    ap.add_argument("--sources", default="ropewiki,osm")
    ap.add_argument("--out", default="routes.json")
    ap.add_argument("--discover", metavar="PAGE",
                    help="dump a Ropewiki page's semantic properties and exit")
    a = ap.parse_args()

    if a.discover:
        discover(a.discover)
        return

    lat, lon = [float(x) for x in a.center.split(",")]
    center = (lat, lon)
    bbox = bbox_from(center, a.radius)
    want = [s.strip() for s in a.sources.split(",")]
    feats = []

    if "ropewiki" in want:
        print(f"ropewiki: canyons within {a.radius} km of {lat},{lon}")
        pages = rw_nearby(center, a.radius)
        print(f"  {len(pages)} candidate pages")
        for i, page in enumerate(pages, 1):
            slug = page.replace(" ", "_")
            try:
                url = rw_kml_url(slug)
            except Exception as e:
                print(f"  [{i}/{len(pages)}] {page}: lookup failed ({e})")
                continue
            if not url:
                print(f"  [{i}/{len(pages)}] {page} — no track on file")
                continue
            try:
                time.sleep(PAUSE)
                new = kml_to_features(get(url), "ropewiki", page)
            except Exception as e:
                print(f"  [{i}/{len(pages)}] {page}: kml failed ({e})")
                continue

            # Category fallback returns the whole world — drop anything
            # that isn't actually near us.
            near = False
            for f in new:
                c = f["geometry"]["coordinates"]
                pt = c[0] if f["geometry"]["type"] == "LineString" else c
                if haversine_km(center, (pt[1], pt[0])) <= a.radius * 1.3:
                    near = True
                    break
            if near:
                feats += new
                print(f"  [{i}/{len(pages)}] {page} — {len(new)} features")

    if "osm" in want:
        print(f"osm: paths in bbox {tuple(round(x, 4) for x in bbox)}")
        try:
            new = osm_paths(bbox)
            informal = sum(1 for f in new if f["properties"].get("informal"))
            feats += new
            print(f"  {len(new)} ways ({informal} unnamed/informal)")
        except Exception as e:
            print(f"  ! overpass failed: {e}", file=sys.stderr)

    fc = {
        "type": "FeatureCollection",
        "properties": {
            "generated": time.strftime("%Y-%m-%d"),
            "center": [lat, lon],
            "radius_km": a.radius,
            "sources": want,
        },
        "features": feats,
    }
    with open(a.out, "w") as f:
        json.dump(fc, f, separators=(",", ":"))

    kb = len(json.dumps(fc, separators=(",", ":"))) / 1024
    print(f"\nwrote {a.out} — {len(feats)} features, {kb:.0f} KB")
    if kb > 3000:
        print("  heads up: that's big for a phone. Shrink --radius.")


if __name__ == "__main__":
    main()
