"""
Download official Google Pixel product images from Google Store / Flipkart CDN
and convert to WebP at ~1100px long side, <150KB, for:

public/images/products/<model-slug>/<colour-slug>-<n>.webp

Run once with network access:
  python prisma/scripts/download-google-photos.py

Photo sources (Google's Flipkart gallery, Oct 2026):
  - Photo 1: phone front/back on clean bg (from Google Store or Flipkart PDP)
  - Photos 2-5: brand feature slides from Flipkart gallery

All URLs are Google-supplied images (Flipkart CDN / Google Store CDN).
"""

import os
import sys
import urllib.request
import io
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "public", "images", "products")

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# ---------------------------------------------------------------------------
# Photo manifest
# Each entry: (model_slug, colour_slug, [url1, url2, ...])
# URL source key:
#   fk = Flipkart CDN (rukminim2.flixcart.com) — Google-supplied gallery images
#   gs = Google Store CDN (lh3.googleusercontent.com or store.google.com assets)
# ---------------------------------------------------------------------------
PHOTOS = [
    # -----------------------------------------------------------------------
    # Pixel 10
    # Flipkart PID: MOBHBYCZDKN3VYUQ (Frost), MOBHBYCZHXDVBQJ5 (Indigo),
    #               MOBHBYCZEQMPJX6W (Obsidian)
    # -----------------------------------------------------------------------
    ("pixel-10", "frost", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/g/4/v/-original-imaghfbxp3fqknhr.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/b/1/-original-imaghfbxwp6cjmwu.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/f/f/-original-imaghfbxvq9e9fqg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/e/k/-original-imaghfbxnmv8hhxa.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/x/y/b/-original-imaghfbxrjgmhgjt.jpeg",
    ]),
    ("pixel-10", "indigo", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/b/m/n/-original-imaghfbxk8cmbfaz.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/b/1/-original-imaghfbxwp6cjmwu.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/f/f/-original-imaghfbxvq9e9fqg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/e/k/-original-imaghfbxnmv8hhxa.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/x/y/b/-original-imaghfbxrjgmhgjt.jpeg",
    ]),
    ("pixel-10", "obsidian", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/z/z/j/-original-imaghfbxqs3yujhh.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/b/1/-original-imaghfbxwp6cjmwu.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/f/f/-original-imaghfbxvq9e9fqg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/e/k/-original-imaghfbxnmv8hhxa.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/x/y/b/-original-imaghfbxrjgmhgjt.jpeg",
    ]),
    # -----------------------------------------------------------------------
    # Pixel 10a
    # -----------------------------------------------------------------------
    ("pixel-10a", "berry", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/q/d/a/-original-imaghz7mnzsdbzn2.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/w/c/-original-imaghz7mj5yqmvhx.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/b/-original-imaghz7mpddkr6xg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/r/8/-original-imaghz7m4e7mhdne.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/y/j/-original-imaghz7mqpkyqf2k.jpeg",
    ]),
    ("pixel-10a", "fog", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/a/h/-original-imaghz7mv7xdgfxs.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/w/c/-original-imaghz7mj5yqmvhx.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/b/-original-imaghz7mpddkr6xg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/r/8/-original-imaghz7m4e7mhdne.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/y/j/-original-imaghz7mqpkyqf2k.jpeg",
    ]),
    ("pixel-10a", "lavender", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/k/t/-original-imaghz7mfzfzb7de.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/w/c/-original-imaghz7mj5yqmvhx.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/b/-original-imaghz7mpddkr6xg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/r/8/-original-imaghz7m4e7mhdne.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/y/j/-original-imaghz7mqpkyqf2k.jpeg",
    ]),
    ("pixel-10a", "obsidian", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/q/8/e/-original-imaghz7mhbqqr8vc.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/w/c/-original-imaghz7mj5yqmvhx.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/b/-original-imaghz7mpddkr6xg.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/r/8/-original-imaghz7m4e7mhdne.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/y/j/-original-imaghz7mqpkyqf2k.jpeg",
    ]),
    # -----------------------------------------------------------------------
    # Pixel 11
    # -----------------------------------------------------------------------
    ("pixel-11", "frost", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/v/k/z/-original-imagjf7knh2pvs9w.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/5/j/-original-imagjf7ke4dqngcw.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/t/f/w/-original-imagjf7kqnkf2kdn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/a/w/-original-imagjf7k3gqrgxxp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/j/d/g/-original-imagjf7k8hj2srdh.jpeg",
    ]),
    ("pixel-11", "hibiscus", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/d/u/z/-original-imagjf7kghtnkm6q.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/5/j/-original-imagjf7ke4dqngcw.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/t/f/w/-original-imagjf7kqnkf2kdn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/a/w/-original-imagjf7k3gqrgxxp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/j/d/g/-original-imagjf7k8hj2srdh.jpeg",
    ]),
    ("pixel-11", "obsidian", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/k/c/-original-imagjf7kqz5svnjr.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/5/j/-original-imagjf7ke4dqngcw.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/t/f/w/-original-imagjf7kqnkf2kdn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/a/w/-original-imagjf7k3gqrgxxp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/j/d/g/-original-imagjf7k8hj2srdh.jpeg",
    ]),
    ("pixel-11", "pistachio", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/f/h/b/-original-imagjf7kz6fpknqt.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/a/5/j/-original-imagjf7ke4dqngcw.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/t/f/w/-original-imagjf7kqnkf2kdn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/a/w/-original-imagjf7k3gqrgxxp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/j/d/g/-original-imagjf7k8hj2srdh.jpeg",
    ]),
    # -----------------------------------------------------------------------
    # Pixel 11 Pro
    # -----------------------------------------------------------------------
    ("pixel-11-pro", "canyon", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/j/q/w/-original-imagjk5kq3sfm5pn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/y/s/-original-imagjk5k8yjsdhcq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/v/w/8/-original-imagjk5k7wxp6bmm.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/e/-original-imagjk5kv3bgkqnq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/p/c/-original-imagjk5kx9ynkbhx.jpeg",
    ]),
    ("pixel-11-pro", "fog", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/s/q/-original-imagjk5kfjkm8zpn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/y/s/-original-imagjk5k8yjsdhcq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/v/w/8/-original-imagjk5k7wxp6bmm.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/e/-original-imagjk5kv3bgkqnq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/p/c/-original-imagjk5kx9ynkbhx.jpeg",
    ]),
    ("pixel-11-pro", "obsidian", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/q/r/c/-original-imagjk5kgsqrhbfm.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/y/s/-original-imagjk5k8yjsdhcq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/v/w/8/-original-imagjk5k7wxp6bmm.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/e/-original-imagjk5kv3bgkqnq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/p/c/-original-imagjk5kx9ynkbhx.jpeg",
    ]),
    ("pixel-11-pro", "olive", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/k/x/-original-imagjk5k3qvhqfzy.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/y/s/-original-imagjk5k8yjsdhcq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/v/w/8/-original-imagjk5k7wxp6bmm.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/j/e/-original-imagjk5kv3bgkqnq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/r/p/c/-original-imagjk5kx9ynkbhx.jpeg",
    ]),
    # -----------------------------------------------------------------------
    # Pixel 11 Pro XL
    # -----------------------------------------------------------------------
    ("pixel-11-pro-xl", "canyon", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/e/k/r/-original-imagjm3kfmshz5bj.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/g/t/a/-original-imagjm3k4bymqhxq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/t/g/-original-imagjm3kp7qhvbnk.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/e/s/-original-imagjm3kqp8zhvnp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/f/m/s/-original-imagjm3k3fbqtsvn.jpeg",
    ]),
    ("pixel-11-pro-xl", "fog", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/p/q/a/-original-imagjm3k3jnb4qas.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/g/t/a/-original-imagjm3k4bymqhxq.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/t/g/-original-imagjm3kp7qhvbnk.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/e/s/-original-imagjm3kqp8zhvnp.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/f/m/s/-original-imagjm3k3fbqtsvn.jpeg",
    ]),
    # -----------------------------------------------------------------------
    # Pixel 11 Pro Fold
    # -----------------------------------------------------------------------
    ("pixel-11-pro-fold", "olive", [
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/d/y/-original-imagjp3k8hmqdm5p.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/z/m/s/-original-imagjp3k4bvtxmqb.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/n/w/a/-original-imagjp3k3vmzqbpn.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/q/r/v/-original-imagjp3k7yvqnjfb.jpeg",
        "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/s/r/e/-original-imagjp3k9jqkbzms.jpeg",
    ]),
]

MAX_LONG = 1100
QUALITY = 82
MAX_BYTES = 150_000


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://www.flipkart.com/"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def to_webp(data, path_out):
    img = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = img.size
    long_side = max(w, h)
    if long_side > MAX_LONG:
        scale = MAX_LONG / long_side
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    q = QUALITY
    while True:
        buf.seek(0); buf.truncate()
        img.save(buf, "WEBP", quality=q)
        if buf.tell() <= MAX_BYTES or q <= 60:
            break
        q -= 5
    with open(path_out, "wb") as f:
        f.write(buf.getvalue())
    return buf.tell(), q


ok = 0; fail = 0; skipped = 0
for model, colour, urls in PHOTOS:
    out_dir = os.path.join(OUT, model)
    os.makedirs(out_dir, exist_ok=True)
    for n, url in enumerate(urls, 1):
        dest = os.path.join(out_dir, f"{colour}-{n}.webp")
        if os.path.exists(dest):
            print(f"  skip {dest}")
            skipped += 1
            continue
        try:
            data = fetch(url)
            size, q = to_webp(data, dest)
            print(f"  OK   {model}/{colour}-{n}.webp  {size//1024}KB  q{q}")
            ok += 1
        except Exception as e:
            print(f"  FAIL {model}/{colour}-{n}.webp  {e}", file=sys.stderr)
            fail += 1

print(f"\nDone: {ok} saved, {skipped} skipped, {fail} failed.")
if fail:
    sys.exit(1)
