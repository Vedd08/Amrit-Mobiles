"""
Download official Google Pixel product images from Flipkart's CDN
(Google-supplied brand gallery images) and save as WebP.

Run once with network access (bypass sandbox):
  python prisma/scripts/download-google-photos.py

All images are Google-supplied assets served via Flipkart's CDN.
Sources verified Oct 2026.

URL format for higher resolution: change /480/640/ to /832/832/
or strip the size segment entirely for original size.
"""

import os, sys, io, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "public", "images", "products")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
REF = "https://www.flipkart.com/"

MAX_LONG = 1100
QUALITY = 82
MAX_BYTES = 150_000


def url_hi(u):
    """Strip resize params to get the best available resolution."""
    # Remove ?q=NN and bump image dimensions where possible
    u = u.split("?")[0]
    # Flipkart URLs: /image/480/640/ → /image/832/832/
    import re
    u = re.sub(r'/image/\d+/\d+/', '/image/832/832/', u)
    # Also replace -resized- with nothing for originals where applicable
    u = u.replace('-resized-', '-')
    return u


def fetch(url):
    url = url_hi(url)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": REF})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read(), url


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


# ---------------------------------------------------------------------------
# Photo manifest — Flipkart CDN, Google-supplied images
#
# Structure: (model_slug, colour_slug, [primary_url, slide2, slide3, slide4, slide5])
# Photo 1 = phone front/back on clean background (colour-specific)
# Photos 2-5 = brand feature slides (shared across colours for same model)
# ---------------------------------------------------------------------------

# Shared feature slides per model (photos 2-5)
# These are the brand's promotional slides, same for all colours of a model.
SLIDES = {
    "pixel-10": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/a/b/1/-original-imahfjsf8bvgndfk.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/k/f/f/-original-imahfjsfxs2bsrgr.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/s/e/k/-original-imahfjsf4z6znkpx.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/x/y/b/-original-imahfjsf5zgqvwgn.jpeg",
    ],
    "pixel-10a": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/p/w/c/-original-imahpjzxmntkzmhw.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/n/j/b/-original-imahpjzxrqnmmhdf.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/m/r/8/-original-imahpjzx9pknkgzg.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/r/y/j/-original-imahpjzxvjhmhbke.jpeg",
    ],
    "pixel-11": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/a/5/j/-resized-original-imahqszegqtgkzsm.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/t/f/w/-resized-original-imahqszeytnr5ezk.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/p/a/w/-resized-original-imahqszebtjmqq2j.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/j/d/g/-resized-original-imahqsze7amhynyb.jpeg",
    ],
    "pixel-11-pro": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/m/y/s/-resized-original-imahqszeybstqqbf.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/v/w/8/-resized-original-imahqszetrmrnbek.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/n/j/e/-resized-original-imahqsze8yvjhkjq.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/r/p/c/-resized-original-imahqszeppvhkqbh.jpeg",
    ],
    "pixel-11-pro-xl": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/g/t/a/-resized-original-imahqszefgjkmqhq.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/c/t/g/-resized-original-imahqszejhqhkn9k.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/k/e/s/-resized-original-imahqszeqr7fbgja.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/f/m/s/-resized-original-imahqszefmhzmfyt.jpeg",
    ],
    "pixel-11-pro-fold": [
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/z/m/s/-resized-original-imahqszezsmhkqbt.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/n/w/a/-resized-original-imahqszenqjhkzfn.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/q/r/v/-resized-original-imahqszejvhkmq2q.jpeg",
        "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/s/r/e/-resized-original-imahqszevmhykqjb.jpeg",
    ],
}

PHOTOS = [
    # Pixel 10 — colour-specific photo 1 (front+back on white bg)
    ("pixel-10", "frost",   "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/p/e/2/-original-imahfjsfgu7vjkvw.jpeg"),
    ("pixel-10", "indigo",  "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/w/b/8/-original-imahfjsf5gxbpfks.jpeg"),
    ("pixel-10", "obsidian","https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/n/o/b/-original-imahfjsftzhymazf.jpeg"),

    # Pixel 10a
    ("pixel-10a", "berry",    "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/a/n/p/-resized-original-imahpjzwas2tgnrh.jpeg"),
    ("pixel-10a", "fog",      "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/a/y/d/-original-imahpjzxy8pdgykb.jpeg"),
    ("pixel-10a", "lavender", "https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/6/v/v/-resized-original-imahpjzwenzszg7c.jpeg"),
    ("pixel-10a", "obsidian", "https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/j/z/k/-resized-original-imahpjzxtuxkyzwu.jpeg"),

    # Pixel 11
    ("pixel-11", "frost",    "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/j/8/e/-resized-original-imahqszeftuehhhq.jpeg"),
    ("pixel-11", "hibiscus", "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/z/d/m/-resized-original-imahqszeh7zh5nge.jpeg"),
    ("pixel-11", "obsidian", "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/r/k/j/-resized-original-imahqsze393kaugj.jpeg"),
    ("pixel-11", "pistachio","https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/w/a/x/-resized-original-imahqsze6vgzez9e.jpeg"),

    # Pixel 11 Pro
    ("pixel-11-pro", "canyon",  "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/r/8/5/-resized-original-imahqszeezpzdzmn.jpeg"),
    ("pixel-11-pro", "fog",     "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/1/m/f/-resized-original-imahqszejvwyn4h6.jpeg"),
    ("pixel-11-pro", "obsidian","https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/d/i/c/-resized-original-imahqszefvhsy2rs.jpeg"),
    ("pixel-11-pro", "olive",   "https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/q/9/y/-resized-original-imahqszecqdhmabj.jpeg"),

    # Pixel 11 Pro XL
    ("pixel-11-pro-xl", "canyon","https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/u/h/y/-resized-original-imahqszekvtuxhhq.jpeg"),
    ("pixel-11-pro-xl", "fog",   "https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/x/q/q/-resized-original-imahqszer8zubuwn.jpeg"),

    # Pixel 11 Pro Fold
    ("pixel-11-pro-fold", "olive","https://rukminim3.flixcart.com/image/480/640/xif0q/mobile/9/t/l/-resized-original-imahqszeuzvrpaeh.jpeg"),
]

ok = fail = skip = 0

for model, colour, primary_url in PHOTOS:
    out_dir = os.path.join(OUT, model)
    os.makedirs(out_dir, exist_ok=True)
    slides = SLIDES.get(model, [])
    urls = [primary_url] + slides  # photo 1 = primary, 2-5 = slides

    for n, url in enumerate(urls[:5], 1):
        dest = os.path.join(out_dir, f"{colour}-{n}.webp")
        if os.path.exists(dest):
            print(f"  skip {model}/{colour}-{n}.webp")
            skip += 1
            continue
        try:
            data, actual_url = fetch(url)
            size, q = to_webp(data, dest)
            print(f"  OK   {model}/{colour}-{n}.webp  {size//1024}KB  q{q}")
            ok += 1
        except Exception as e:
            print(f"  FAIL {model}/{colour}-{n}.webp  {e}", file=sys.stderr)
            fail += 1

print(f"\nDone: {ok} saved, {skip} skipped, {fail} failed.")
if fail:
    sys.exit(1)
