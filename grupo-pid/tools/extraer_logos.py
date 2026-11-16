"""Extrae logotipos PROVISIONALES de la imagen de referencia (tools/referencia-marcas.jpg).
Quita el fondo gris con el algoritmo 'color to alpha'. Sustituir por los logos vectoriales
originales en cuanto la empresa los facilite (mismos nombres de archivo en src/static/img/logos/)."""
from PIL import Image
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'referencia-marcas.jpg')
OUT = os.path.join(HERE, '..', 'src', 'static', 'img', 'logos')
BG = (55, 60, 64)
CROPS = {
    'grupo-pid': (400, 55, 1095, 432),
    'grupo-pid-compacto': (405, 55, 1090, 400),
    'pid-agua': (55, 770, 470, 952),
    'pultrusion-canarias': (540, 755, 995, 972),
    'piscinas-optimus': (1055, 768, 1465, 972),
}
def c2a(px):
    r = [0.0, 0.0, 0.0]
    for i in range(3):
        c, b = px[i], BG[i]
        r[i] = (c - b) / (255 - b) if c > b else ((b - c) / b if c < b else 0)
    a = max(r)
    if a < 0.10:
        return (0, 0, 0, 0)
    col = tuple(max(0, min(255, round(BG[i] + (px[i] - BG[i]) / a))) for i in range(3))
    if a < 0.25:  # suaviza el ruido JPEG del fondo
        a = (a - 0.10) / 0.15 * 0.25
    return col + (round(a * 255),)
im = Image.open(SRC).convert('RGB')
os.makedirs(OUT, exist_ok=True)
for name, box in CROPS.items():
    c = im.crop(box)
    o = Image.new('RGBA', c.size)
    o.putdata([c2a(p) for p in list(c.getdata())])
    o = o.crop(o.getbbox())
    o.save(os.path.join(OUT, name + '.png'), optimize=True)
    o.save(os.path.join(OUT, name + '.webp'), quality=92, method=6)
    print(name, o.size)
# favicon: letras PID verdes
c = im.crop((415, 112, 1085, 320))
o = Image.new('RGBA', c.size); o.putdata([c2a(p) for p in list(c.getdata())]); o = o.crop(o.getbbox())
w, h = o.size; s = max(w, h)
sq = Image.new('RGBA', (s, s), (44, 47, 52, 255)); sq.alpha_composite(o, ((s - w)//2, (s - h)//2))
sq.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, '..', 'apple-touch-icon.png'))
sq.resize((48, 48), Image.LANCZOS).save(os.path.join(OUT, '..', 'favicon.png'))
print('favicon ok')
