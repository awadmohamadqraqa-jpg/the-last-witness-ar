"""
THE LAST WITNESS — asset pipeline
---------------------------------
Converts the generated source stills into optimized WebP scene backdrops and
creates the procedural textures used by the cinematic layers.

Run:  python3 tools/build-assets.py
"""
import os
import random
from PIL import Image, ImageFilter, ImageChops, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")
OUT_SCENES = os.path.join(ROOT, "src", "assets", "scenes")
OUT_TEX = os.path.join(ROOT, "src", "assets", "textures")
os.makedirs(OUT_SCENES, exist_ok=True)
os.makedirs(OUT_TEX, exist_ok=True)

SCENES = {
    "landing": "landing.png",
    "corridor": "corridor.png",
    "mirror-room": "mirror-room.png",
    "surveillance": "surveillance.png",
    "door": "door.png",
    "archive": "archive.png",
    "ev-old-photo": "ev-old-photo.png",
    "ev-missing-report": "ev-missing-report.png",
    "ev-camera-frame": "ev-camera-frame.png",
    "ev-handwritten": "ev-handwritten.png",
}


def grade(im: Image.Image) -> Image.Image:
    """Unify the cinematic grade: cold, desaturated, crushed blacks."""
    im = ImageEnhance.Color(im).enhance(0.82)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Brightness(im).enhance(0.95)
    return im


def export(im: Image.Image, path: str, quality: int = 76) -> None:
    im.convert("RGB").save(path, "WEBP", quality=quality, method=6)


for name, src in SCENES.items():
    src_path = os.path.join(RAW, src)
    if not os.path.exists(src_path):
        print("missing", src_path)
        continue
    im = grade(Image.open(src_path).convert("RGB"))
    export(im, os.path.join(OUT_SCENES, f"{name}.webp"))

    # Mobile / low-bandwidth variant (still keeps 16:9 cropping headroom)
    w = 900
    h = round(im.height * w / im.width)
    export(im.resize((w, h), Image.LANCZOS), os.path.join(OUT_SCENES, f"{name}-sm.webp"), quality=68)
    print("ok", name, im.size)

# ---------------------------------------------------------------- textures
random.seed(7)

# Film grain tile (transparent, additive noise) 256x256
g = Image.new("RGBA", (256, 256))
px = g.load()
for y in range(256):
    for x in range(256):
        v = random.randint(0, 255)
        a = random.randint(6, 34)
        px[x, y] = (v, v, v, a)
g.save(os.path.join(OUT_TEX, "grain.png"))

# Fog / smoke texture: layered blurred noise, greyscale with alpha
fog = Image.new("L", (512, 512))
fpx = fog.load()
for y in range(512):
    for x in range(512):
        fpx[x, y] = random.randint(0, 255)
fog = fog.filter(ImageFilter.GaussianBlur(18))
fog = ImageEnhance.Contrast(fog).enhance(1.5)
rgba = Image.merge("RGBA", (fog, fog, fog, fog.point(lambda v: int(v * 0.75))))
rgba.save(os.path.join(OUT_TEX, "fog.png"))

# Vignette overlay (multiply-style dark edges)
vig = Image.new("L", (512, 288), 0)
vpx = vig.load()
cx, cy = 256, 144
maxd = (cx ** 2 + cy ** 2) ** 0.5
for y in range(288):
    for x in range(512):
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / maxd
        vpx[x, y] = int(min(255, max(0, (d ** 2.1) * 255)))
vig = vig.filter(ImageFilter.GaussianBlur(6))
vig_rgba = Image.merge("RGBA", (vig.point(lambda v: int(v * 0.9)), Image.new("L", (512, 288), 0),
                                Image.new("L", (512, 288), 0), vig))
vig_rgba.save(os.path.join(OUT_TEX, "vignette.png"))

print("textures written")
