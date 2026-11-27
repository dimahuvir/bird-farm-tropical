"""Рисует иконку игры (красный ара и золотое яйцо) и кладёт её во все папки Android.
Запуск: python3 tools/make_icons.py [папка res]"""
import sys, os, math, random
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main/res'
random.seed(7)
S = 2048


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def background(size):
    im = Image.new('RGB', (size, size))
    d = ImageDraw.Draw(im)
    top, bot = (46, 150, 78), (8, 52, 36)
    for y in range(size):
        d.line([(0, y), (size, y)], fill=lerp(top, bot, y / size))
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(int(size * 0.7), 0, -8):
        a = int(110 * (1 - r / (size * 0.7)) ** 1.6)
        gd.ellipse([size * 0.78 - r, size * 0.12 - r, size * 0.78 + r, size * 0.12 + r], fill=(255, 244, 170, a))
    im = Image.alpha_composite(im.convert('RGBA'), glow)
    lv = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lv)
    for _ in range(26):
        cx, cy = random.uniform(0, size), random.uniform(0, size)
        a, b = random.uniform(size * 0.12, size * 0.3), random.uniform(size * 0.05, size * 0.1)
        ang = random.uniform(0, math.pi)
        pts = []
        for k in range(40):
            t = k / 40 * 2 * math.pi
            x, y = a * math.cos(t), b * math.sin(t)
            pts.append((cx + x * math.cos(ang) - y * math.sin(ang), cy + x * math.sin(ang) + y * math.cos(ang)))
        g = random.choice([(18, 88, 48), (24, 110, 58), (12, 66, 38), (40, 140, 70)])
        ld.polygon(pts, fill=g + (120,))
    lv = lv.filter(ImageFilter.GaussianBlur(size * 0.004))
    return Image.alpha_composite(im, lv)


def egrad(im, box, c1, c2):
    x0, y0, x1, y1 = box
    w, h = int(x1 - x0), int(y1 - y0)
    g = Image.new('RGBA', (w, h))
    gd = ImageDraw.Draw(g)
    for y in range(h):
        gd.line([(0, y), (w, y)], fill=lerp(c1, c2, y / h) + (255,))
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).ellipse([0, 0, w - 1, h - 1], fill=255)
    im.paste(g, (int(x0), int(y0)), m)


def bez(p0, p1, p2, n=30):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in [i / n for i in range(n + 1)]]


def foreground(size):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    k = size / 2048
    cx, cy = 1024 * k, 1000 * k
    for ang, col in [(-50, (250, 200, 40)), (-18, (40, 120, 220)), (14, (250, 200, 40)), (46, (40, 120, 220))]:
        f = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(f).ellipse([cx - 70 * k, cy - 560 * k, cx + 70 * k, cy - 120 * k], fill=col + (255,))
        im = Image.alpha_composite(im, f.rotate(ang, center=(cx, cy), resample=Image.BICUBIC))
    egrad(im, (cx - 380 * k, cy - 370 * k, cx + 380 * k, cy + 390 * k), (240, 70, 50), (170, 20, 30))
    d = ImageDraw.Draw(im)
    d.ellipse([cx - 60 * k, cy - 170 * k, cx + 290 * k, cy + 140 * k], fill=(250, 246, 236, 255))
    for i in range(4):
        y = cy - 90 * k + i * 55 * k
        d.arc([cx + 10 * k, y - 40 * k, cx + 250 * k, y + 60 * k], 200, 340, fill=(60, 40, 30, 200), width=int(6 * k))
    P = lambda x, y: (cx + x * k, cy + y * k)
    # нижняя часть клюва
    low = bez(P(230, 150), P(450, 120), P(560, 230)) + bez(P(560, 230), P(520, 340), P(300, 320))[1:]
    d.polygon(low, fill=(52, 48, 48, 255))
    # верхняя часть клюва (изогнутый «крючок»)
    up = bez(P(170, -40), P(600, -150), P(660, 190)) + bez(P(660, 190), P(560, 110), P(470, 130))[1:] + bez(P(470, 130), P(380, 150), P(250, 140))[1:]
    d.polygon(up, fill=(247, 240, 224, 255))
    d.line(up + [up[0]], fill=(196, 176, 146, 255), width=int(8 * k))
    d.ellipse([cx + 60 * k, cy - 70 * k, cx + 190 * k, cy + 60 * k], fill=(20, 16, 16, 255))
    d.ellipse([cx + 100 * k, cy - 50 * k, cx + 140 * k, cy - 10 * k], fill=(255, 255, 255, 255))
    d.ellipse([cx + 150 * k, cy + 10 * k, cx + 170 * k, cy + 30 * k], fill=(255, 255, 255, 200))
    ex, ey = cx - 330 * k, cy + 410 * k
    egrad(im, (ex - 190 * k, ey - 250 * k, ex + 190 * k, ey + 230 * k), (255, 226, 120), (226, 150, 30))
    d = ImageDraw.Draw(im)
    d.ellipse([ex - 110 * k, ey - 190 * k, ex - 30 * k, ey - 90 * k], fill=(255, 250, 215, 230))
    for sx, sy, r in [(cx + 520 * k, cy - 330 * k, 50), (cx - 560 * k, cy - 120 * k, 36), (cx + 300 * k, cy + 520 * k, 40)]:
        r = r * k
        d.polygon([(sx, sy - r * 1.6), (sx + r * 0.4, sy - r * 0.4), (sx + r * 1.6, sy), (sx + r * 0.4, sy + r * 0.4),
                   (sx, sy + r * 1.6), (sx - r * 0.4, sy + r * 0.4), (sx - r * 1.6, sy), (sx - r * 0.4, sy - r * 0.4)],
                  fill=(255, 248, 200, 255))
    return im


bg = background(S).convert('RGBA')
fg = foreground(S)
full = Image.alpha_composite(bg, fg)
mask = Image.new('L', (S, S), 0)
ImageDraw.Draw(mask).ellipse([0, 0, S - 1, S - 1], fill=255)
round_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
round_img.paste(full, (0, 0), mask)

LEG = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
ADA = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}
for dens in LEG:
    d = os.path.join(OUT, 'mipmap-' + dens)
    os.makedirs(d, exist_ok=True)
    full.convert('RGB').resize((LEG[dens],) * 2, Image.LANCZOS).save(os.path.join(d, 'ic_launcher.png'))
    round_img.resize((LEG[dens],) * 2, Image.LANCZOS).save(os.path.join(d, 'ic_launcher_round.png'))
    bg.convert('RGB').resize((ADA[dens],) * 2, Image.LANCZOS).save(os.path.join(d, 'ic_launcher_bg.png'))
    fg.resize((ADA[dens],) * 2, Image.LANCZOS).save(os.path.join(d, 'ic_launcher_fg.png'))
xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
       '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
       '  <background android:drawable="@mipmap/ic_launcher_bg"/>\n'
       '  <foreground android:drawable="@mipmap/ic_launcher_fg"/>\n'
       '</adaptive-icon>\n')
d = os.path.join(OUT, 'mipmap-anydpi-v26')
os.makedirs(d, exist_ok=True)
for n in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    open(os.path.join(d, n), 'w').write(xml)
full.convert('RGB').resize((512, 512), Image.LANCZOS).save('/tmp/icon_preview2.png')
print('icons ready in', OUT)
      
