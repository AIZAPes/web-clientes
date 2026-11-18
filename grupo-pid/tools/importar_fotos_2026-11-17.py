# Importa las fotos reales del cliente (carpeta CLIENTE WEBS/GRUPO PID) a src/static/img/ y
# actualiza content/*.json. Ejecutado una vez el 2026-11-17; se guarda como referencia.
# Uso: python tools/importar_fotos_2026-11-17.py "<ruta a CLIENTE WEBS/GRUPO PID>" "<carpeta con imágenes extraídas de los PDF>"
import json, os, sys, shutil
from PIL import Image, ImageOps

ORIG = sys.argv[1]
PDFIMG = sys.argv[2]
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC = os.path.join(RAIZ, 'src', 'static')
CONTENT = os.path.join(RAIZ, 'content')

def img(src, sub, nombre, ancho=1400, q=72, fondo_blanco=False):
    """Convierte una foto del cliente a WebP optimizado y devuelve la ruta para el JSON."""
    ruta = src if os.path.isabs(src) else os.path.join(ORIG, src)
    im = ImageOps.exif_transpose(Image.open(ruta))
    im = im.convert('RGB')
    if im.width > ancho:
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    os.makedirs(os.path.join(STATIC, 'img', sub), exist_ok=True)
    rel = f'img/{sub}/{nombre}.webp'
    im.save(os.path.join(STATIC, rel), 'WEBP', quality=q, method=6)
    return rel

def g(src, sub, nombre, alt):
    return {'src': img(src, sub, nombre), 'alt': alt}

def leer(n): return json.load(open(os.path.join(CONTENT, n), encoding='utf-8'))
def guardar(n, d): open(os.path.join(CONTENT, n), 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

A = 'pidagua sub/'
HS, HN, VE, TR, ES, MO, FO, MA = (A + x + '/' for x in ['depositos horizontales con soporte', 'depositos horizontales sin soportes', 'deposito vertical con fondo plano', 'depositos  tronconicos', 'deposito estructurado', 'tanques modulares', 'fosas septica biologica y depuradora', 'servicio ingenieria agua y mantenimiento de depuradoras'])
W = 'WhatsApp Image 2026-11-12 at '
P = 'pultrusion canarias  sub/' + W
PI = 'piscinas optimus sub/'

# ───────────── PID Agua ─────────────
agua = leer('pid-agua.json')
agua['imagen'] = img(VE + 'depositos-vertical-plano-varios tamaños.webp', 'agua', 'depositos-verticales-prfv')
agua['alt'] = 'Depósitos verticales de PRFV de distintos tamaños'
agua['imagenHero'] = img(HS + 'depositos horizontales con soporte.webp', 'agua', 'deposito-horizontal-instalado', 1600)
agua['destacados'] = ['Depósitos de PRFV', 'Tanques modulares', 'Fosas sépticas y depuradoras', 'Ingeniería y mantenimiento']

def ficha(slug, nombre, resumen, descripcion, imagen, alt, galeria, seo_t, seo_d):
    return {'slug': slug, 'nombre': nombre, 'resumen': resumen, 'descripcion': descripcion, 'imagen': imagen, 'alt': alt,
            'aplicaciones': [], 'especificaciones': [], 'galeria': galeria, 'documentos': [], 'faq': [], 'provisional': True,
            'seo': {'titulo': seo_t, 'descripcion': seo_d}}

secs = {s['slug']: s for s in agua['secciones']}
dep = secs['depositos-prfv']
dep['resumen'] = 'Depósitos de poliéster reforzado con fibra de vidrio: horizontales, verticales, troncocónicos y estructurados.'
dep['descripcion'] = 'Depósitos fabricados en PRFV (poliéster reforzado con fibra de vidrio). Elige la configuración que mejor encaja con tu instalación.'
dep['imagen'] = agua['imagen']; dep['alt'] = agua['alt']
dep['seo']['descripcion'] = 'Depósitos de fibra de vidrio (PRFV) horizontales, verticales, troncocónicos y estructurados. Solicita presupuesto a PID Agua, de Grupo PID.'
dep['productos'] = [
    ficha('depositos-horizontales-con-soportes', 'Depósitos horizontales con soportes', 'Depósitos de PRFV horizontales sobre soportes.',
          'Depósitos de fibra de vidrio (PRFV) en posición horizontal, con soportes integrados para su apoyo.',
          img(HS + 'deposito horizontal con soporte.webp', 'agua', 'horizontal-soportes'), 'Depósito horizontal de PRFV con soportes',
          [g(HS + 'depositos horizontales con soporte.webp', 'agua', 'horizontal-soportes-2', 'Depósito horizontal de PRFV con soportes instalado'),
           g(HS + 'deposito-horizontal-con-soporte-transporte.webp', 'agua', 'horizontal-soportes-transporte', 'Transporte de un depósito horizontal de PRFV'),
           g(HS + 'WhatsApp Image 2026-04-20 at 11.53.30.jpeg', 'agua', 'horizontal-soportes-3', 'Depósito horizontal de PRFV con soportes'),
           g(HS + 'deposito horizonta con  soportes verde.jpg', 'agua', 'horizontal-soportes-verde', 'Depósito horizontal de PRFV verde con soportes'),
           g(HS + 'deposito_mejorado.png', 'agua', 'horizontal-soportes-sala', 'Depósitos horizontales de PRFV conectados en sala técnica')],
          'Depósitos horizontales de PRFV con soportes | PID Agua', 'Depósitos horizontales de fibra de vidrio (PRFV) con soportes. Solicita presupuesto a PID Agua, de Grupo PID.'),
    ficha('depositos-horizontales-sin-soportes', 'Depósitos horizontales sin soportes', 'Depósitos de PRFV horizontales sin soportes.',
          'Depósitos de fibra de vidrio (PRFV) en posición horizontal, sin soportes.',
          img(HN + 'deposito-horizontal-prfv-sin-soportes.webp', 'agua', 'horizontal-sin-soportes'), 'Depósito horizontal de PRFV sin soportes',
          [g(HN + 'transporte deposito horizontal sin soportes.jpg', 'agua', 'horizontal-sin-soportes-transporte', 'Transporte de un depósito horizontal de PRFV sin soportes'),
           g(HN + 'depositos horozontales sin soporte.avif', 'agua', 'horizontal-sin-soportes-varios', 'Depósitos horizontales de PRFV sin soportes'),
           g(HN + 'depositos horozontales contra incendios sin soporte.avif', 'agua', 'horizontal-sin-soportes-incendios', 'Depósitos horizontales de PRFV en instalación contra incendios')],
          'Depósitos horizontales de PRFV sin soportes | PID Agua', 'Depósitos horizontales de fibra de vidrio (PRFV) sin soportes. Solicita presupuesto a PID Agua, de Grupo PID.'),
    ficha('depositos-verticales', 'Depósitos verticales de fondo plano', 'Depósitos de PRFV verticales con fondo plano.',
          'Depósitos de fibra de vidrio (PRFV) en posición vertical con fondo plano, en distintos tamaños.',
          img(VE + 'depositos-vertical-plano-varios tamaños.webp', 'agua', 'verticales'), 'Depósitos verticales de PRFV de fondo plano',
          [g(VE + 'deposito vertical blanco.jpg', 'agua', 'vertical-blanco', 'Depósito vertical de PRFV'),
           g(VE + 'depositos horizontal sin soporte color rojo contra incendios.webp', 'agua', 'vertical-rojo', 'Depósitos verticales de PRFV rojos'),
           g(VE + 'DEPÓSITOS 6000L.jpg', 'agua', 'vertical-transporte', 'Transporte de depósitos verticales de PRFV')],
          'Depósitos verticales de PRFV de fondo plano | PID Agua', 'Depósitos verticales de fibra de vidrio (PRFV) de fondo plano. Solicita presupuesto a PID Agua, de Grupo PID.'),
    ficha('depositos-troncoconicos', 'Depósitos troncocónicos', 'Depósitos de PRFV de forma troncocónica.',
          'Depósitos de fibra de vidrio (PRFV) de forma troncocónica.',
          img(TR + 'depositos tronconicos.avif', 'agua', 'troncoconico'), 'Depósito troncocónico de PRFV',
          [g(TR + 'depositos tronconicos colocacion.jpeg', 'agua', 'troncoconico-colocacion', 'Colocación de un depósito troncocónico de PRFV con grúa'),
           g(TR + 'colocacion deposito tronconicos.jpeg', 'agua', 'troncoconico-obra', 'Depósitos troncocónicos de PRFV en obra'),
           g(TR + 'deposito tronconico 2.png', 'agua', 'troncoconico-interior', 'Interior de un depósito troncocónico de PRFV')],
          'Depósitos troncocónicos de PRFV | PID Agua', 'Depósitos troncocónicos de fibra de vidrio (PRFV). Solicita presupuesto a PID Agua, de Grupo PID.'),
    ficha('depositos-estructurados', 'Depósitos estructurados', 'Depósitos de PRFV rectangulares con refuerzos.',
          'Depósitos de fibra de vidrio (PRFV) de forma rectangular, con estructura de refuerzo.',
          img(ES + 'Deposito estructurado cuadrado EN PRFV CON refuerzo de metal.webp', 'agua', 'estructurado'), 'Depósito estructurado rectangular de PRFV',
          [g(ES + 'deposito cuadrado estructurado.webp', 'agua', 'estructurado-2', 'Depósito estructurado de PRFV'),
           g(ES + 'depositos estructurados variados.webp', 'agua', 'estructurado-varios', 'Depósitos estructurados de PRFV de varios tamaños'),
           g(ES + 'deposito estructurado cuadrado  azul.avif', 'agua', 'estructurado-azul', 'Depósito estructurado de PRFV azul')],
          'Depósitos estructurados de PRFV | PID Agua', 'Depósitos estructurados rectangulares de fibra de vidrio (PRFV). Solicita presupuesto a PID Agua, de Grupo PID.'),
]

mod = secs['tanques-modulares']
mod['imagen'] = img(MO + 'tanque modular gigante a color.png', 'agua', 'tanque-modular'); mod['alt'] = 'Tanque modular de PRFV de gran capacidad'
mod['descripcion'] = 'Tanques modulares pensados para almacenar grandes volúmenes de agua.'
mod.pop('bloquesExtra', None)
mod['galeria'] = [
    g(MO + 'depositos modulares.jpg', 'agua', 'modular-2', 'Tanques modulares de PRFV en taller'),
    g(MO + 'Diseño sin título (5).webp', 'agua', 'modular-montaje', 'Tanque modular de PRFV de Grupo PID'),
    g(MO + 'TANQUE OMAN.avif', 'agua', 'modular-gigante', 'Tanque modular de PRFV en montaje'),
    g(MO + 'tapa tanque modular.png', 'agua', 'modular-cubierta', 'Cubierta de un tanque modular de PRFV'),
    g(MO + 'deposito modular en el aire.webp', 'agua', 'modular-elevado', 'Tanque modular de PRFV elevado'),
]

fos = secs['fosas-septicas']
fos['imagen'] = img(A + W + '18.55.32 (1).jpeg', 'agua', 'fosa-septica'); fos['alt'] = 'Fosa séptica de PRFV'
fos['productos'][0]['imagen'] = img(FO + 'fosa septica dibujo .png', 'agua', 'fosa-compacta-esquema'); fos['productos'][0]['alt'] = 'Esquema de fosa séptica con decantador y digestor'
fos['productos'][1]['imagen'] = img(FO + 'depuradora dibujo.png', 'agua', 'fosa-biologica-esquema'); fos['productos'][1]['alt'] = 'Esquema de fosa séptica con decantador-digestor y filtro biológico percolador'
fos['productos'][0]['galeria'] = [{'src': fos['imagen'], 'alt': 'Fosa séptica de PRFV'}]

dpu = secs['depuradoras']
dpu['imagen'] = img(MA + 'INGENIERIA DE AGUA EDAR PIDAGUA.webp', 'agua', 'depuradora'); dpu['alt'] = 'Depuradora de aguas residuales'
dpu['galeria'] = [
    g(A + W + '18.56.19 (3).jpeg', 'agua', 'planta-tratamiento', 'Planta de tratamiento de agua con depósitos cubiertos'),
    g(MA + 'Captura de pantalla 2026-03-10 140551.png', 'agua', 'edar-proyecto', 'Proyecto de estación depuradora de aguas residuales'),
    g(MA + 'Captura de pantalla 2026-03-11 125420.png', 'agua', 'esquema-depuradora', 'Plano de implantación de una depuradora'),
]

man = secs['mantenimiento-depuradoras']
man['nombre'] = 'Ingeniería y mantenimiento de depuradoras'
man['resumen'] = 'Ingeniería del agua, mantenimiento, revisión y asistencia técnica.'
man['imagen'] = img(A + W + '18.56.10 (1).jpeg', 'agua', 'mantenimiento'); man['alt'] = 'Técnico trabajando en una instalación de tratamiento de agua'
man['galeria'] = [
    g(MA + 'planos ingenieria de agua.webp', 'agua', 'planos-ingenieria', 'Planos de ingeniería del agua'),
    g(MA + 'projecto ingenieria agua TEA.jpeg', 'agua', 'proyecto-ingenieria', 'Proyecto de ingeniería del agua'),
    g(A + W + '18.56.12 (4).jpeg', 'agua', 'silo-prfv', 'Silo de PRFV en instalación'),
]
guardar('pid-agua.json', agua)

# ───────────── Pultrusión Canarias ─────────────
pu = leer('pultrusion-canarias.json')
pu['imagen'] = img(P + '18.55.33 (1).jpeg', 'pultrusion', 'escalera-pasarela'); pu['alt'] = 'Escalera y pasarela de PRFV con barandillas'
pu['tecnologia']['imagen'] = img(P + '18.56.15.jpeg', 'pultrusion', 'pasarela-rejilla')
est = pu['secciones'][0]
est['imagen'] = img(P + '18.55.33.jpeg', 'pultrusion', 'pasarela-prfv'); est['alt'] = 'Pasarela de PRFV con barandillas y rejilla'
est['galeria'] = [
    g('pultrusion canarias  sub/PULTRUCCION.jpeg', 'pultrusion', 'plataforma-presa', 'Plataforma y pasarela de PRFV en una presa'),
    g(P + '18.55.33 (2).jpeg', 'pultrusion', 'escalera-silos', 'Escalera de PRFV junto a silos'),
    g(P + '18.55.33 (3).jpeg', 'pultrusion', 'escalera-silos-2', 'Escalera y barandillas de PRFV'),
    g(P + '18.56.06.jpeg', 'pultrusion', 'pasarela-silos', 'Pasarela de PRFV con barandillas'),
    g(P + '18.56.15 (1).jpeg', 'pultrusion', 'pasarela-ladera', 'Pasarela de PRFV en ladera'),
    g(P + '18.56.15 (2).jpeg', 'pultrusion', 'pasarela-valvulas', 'Pasarela de rejilla de PRFV'),
    g(P + '18.56.11 (1).jpeg', 'pultrusion', 'escalera-deposito', 'Escalera de PRFV con jaula en depósito'),
    g(P + '18.56.18 (1).jpeg', 'pultrusion', 'escalera-gato', 'Escalera de gato de PRFV con jaula'),
    g(P + '18.56.19 (4).jpeg', 'pultrusion', 'plataforma-silos', 'Plataforma de PRFV sobre silos'),
    g(P + '18.56.19 (1).jpeg', 'pultrusion', 'vallado-rejilla', 'Vallado de rejilla de PRFV'),
]
guardar('pultrusion-canarias.json', pu)

# ───────────── Piscinas Optimus ─────────────
op = leer('piscinas-optimus.json')
op['imagen'] = img(PI + W + '18.56.07.jpeg', 'piscinas', 'piscina-tarima'); op['alt'] = 'Piscina de poliéster instalada con tarima de madera'
op['imagenHero'] = img(PI + W + '18.56.08 (1).jpeg', 'piscinas', 'piscina-cascada', 1600)
op['_ayuda'] = 'Catálogo de Piscinas Optimus: modelos de piscina de poliéster (fichas técnicas en PDF en src/static/docs/piscinas/) y piscinas a medida.'
op['destacados'] = ['11 modelos de piscina', 'Piscinas a medida', 'Ficha técnica de cada modelo']
op['hero'] = {'titulo': 'Piscinas de poliéster de una sola pieza', 'texto': 'Piscinas prefabricadas con resinas y reforzadas con fibra de vidrio: instalación sencilla y rápida, gran resistencia y fácil mantenimiento.'}
DESC = 'Piscina de poliéster de una sola pieza, prefabricada con resinas y reforzada con fibra de vidrio. Descarga la ficha técnica para ver sus medidas, capacidad y proceso de instalación.'
VENT = ['Instalación sencilla, rápida y limpia', 'Gran resistencia', 'Fácil mantenimiento', 'Posibilidad de desmontarse para su traslado', 'Uso inmediato']
modelos = [  # (slug, nombre, pdf, foto extraída del PDF)
    ('capri', 'Capri', 'FICHA TECNICA - MODELO OPTIMUS CAPRI.pdf', 'capri-108.jpg'),
    ('bari', 'Bari', 'FICHA TECNICA - MODELO PID BARI.pdf', 'bari-87.jpg'),
    ('bolonia', 'Bolonia', 'FICHA TECNICA - MODELO PID BOLONIA.pdf', 'bolonia-108.jpg'),
    ('cerdena', 'Cerdeña', 'FICHA TECNICA - MODELO PID CERDEÑA.pdf', 'cerdeña-108.jpg'),
    ('genova', 'Génova', 'FICHA TECNICA - MODELO PID GENOVA.pdf', 'genova-85.png'),
    ('isla-milan', 'Isla Milán', 'FICHA TECNICA - MODELO PID ISLA MILAN.pdf', 'isla-milan-108.jpg'),
    ('pisa', 'Pisa', 'FICHA TECNICA - MODELO PID PISA.pdf', 'pisa-111.jpg'),
    ('roma', 'Roma', 'FICHA TECNICA - MODELO PID ROMA .pdf', 'roma-108.jpg'),
    ('siena', 'Siena', 'FICHA TECNICA - MODELO PID SIENA.pdf', 'siena-108.jpg'),
    ('venecia', 'Venecia', 'FICHA TECNICA - MODELO PID VENECIA.pdf', 'venecia-108.jpg'),
    ('sicilia', 'Sicilia', 'isla sicilia/FICHA TECNICA - MODELO PID SICILIA.pdf', 'sicilia-108.jpg'),
]
os.makedirs(os.path.join(STATIC, 'docs', 'piscinas'), exist_ok=True)
secciones = []
for slug, nombre, pdf, foto in modelos:
    shutil.copyfile(os.path.join(ORIG, PI, pdf), os.path.join(STATIC, 'docs', 'piscinas', f'ficha-tecnica-{slug}.pdf'))
    ruta_foto = None
    for cand in (foto, foto.replace('ñ', '�')):
        if os.path.exists(os.path.join(PDFIMG, cand)): ruta_foto = os.path.join(PDFIMG, cand)
    if ruta_foto is None:
        import glob as _g
        ruta_foto = _g.glob(os.path.join(PDFIMG, foto.split('-')[0][:4] + '*-' + foto.split('-')[-1]))[0]
    secciones.append({
        'slug': slug, 'nombre': f'Modelo {nombre}', 'resumen': 'Piscina de poliéster de una sola pieza.', 'descripcion': DESC,
        'imagen': img(ruta_foto, 'piscinas', f'modelo-{slug}'), 'alt': f'Piscina de poliéster modelo {nombre}',
        'aplicaciones': VENT, 'etiquetaAplicaciones': 'Ventajas', 'especificaciones': [], 'galeria': [],
        'documentos': [{'titulo': f'Ficha técnica del modelo {nombre} (PDF)', 'url': f'docs/piscinas/ficha-tecnica-{slug}.pdf'}], 'faq': [],
        'seo': {'titulo': f'Piscina modelo {nombre} | Piscinas Optimus', 'descripcion': f'Piscina de poliéster modelo {nombre} de Piscinas Optimus (Grupo PID). Descarga la ficha técnica y pide presupuesto.'}})
MM = PI + 'piscinas a medida/'
secciones.append({
    'slug': 'piscinas-a-medida', 'nombre': 'Piscinas a medida', 'resumen': 'Piscinas de poliéster fabricadas a la medida de tu espacio.',
    'descripcion': 'Además de nuestros modelos, fabricamos piscinas de poliéster a medida para adaptarnos a cada espacio.',
    'imagen': img(MM + 'piscina 400/PID 400.jpg', 'piscinas', 'a-medida'), 'alt': 'Piscina de poliéster a medida instalada con vistas a la montaña',
    'aplicaciones': [], 'especificaciones': [], 'documentos': [], 'faq': [], 'provisional': True,
    'galeria': [g(MM + 'modelo 590 instalado.JPG', 'piscinas', 'a-medida-590', 'Piscina a medida instalada en terraza'),
                g(MM + 'PID COVI.jpg', 'piscinas', 'a-medida-400', 'Vaso de piscina de poliéster en taller'),
                g(MM + '4255faa1-110c-4f55-9c93-b58f8b303221.JPG', 'piscinas', 'a-medida-2', 'Vaso de piscina de poliéster a medida'),
                g(MM + 'modelo 590.JPG', 'piscinas', 'a-medida-3', 'Piscina de poliéster a medida con escaleras'),
                g(MM + 'piscina 400/piscina 400.avif', 'piscinas', 'a-medida-noche', 'Piscina de poliéster iluminada de noche')],
    'seo': {'titulo': 'Piscinas a medida | Piscinas Optimus', 'descripcion': 'Piscinas de poliéster a medida de Piscinas Optimus (Grupo PID). Cuéntanos tu proyecto y pide presupuesto.'}})
op['secciones'] = secciones
guardar('piscinas-optimus.json', op)

# ───────────── Proyectos (solo fotos reales) ─────────────
pr = leer('proyectos.json')
def proy(t, div, src):
    return {'titulo': t, 'division': div, 'lugar': '', 'anio': '', 'imagen': src, 'alt': t, 'descripcion': '', 'pendiente': False}
pr['proyectos'] = [
    proy('Tanque modular de PRFV', 'pid-agua', mod['imagen']),
    proy('Plataforma y pasarela de PRFV en presa', 'pultrusion-canarias', est['galeria'][0]['src']),
    proy('Piscina con cascada', 'piscinas-optimus', op['imagenHero']),
    proy('Depósitos horizontales de PRFV', 'pid-agua', agua['imagenHero']),
    proy('Escalera y pasarela de PRFV', 'pultrusion-canarias', pu['imagen']),
    proy('Piscina con tarima', 'piscinas-optimus', op['imagen']),
    proy('Planta de tratamiento de agua', 'pid-agua', dpu['galeria'][0]['src']),
    proy('Plataforma de PRFV sobre silos', 'pultrusion-canarias', est['galeria'][8]['src']),
    proy('Descarga de piscina con grúa', 'piscinas-optimus', img(PI + W + '18.56.07 (3).jpeg', 'piscinas', 'descarga-grua')),
    proy('Colocación de depósito troncocónico', 'pid-agua', dep['productos'][3]['galeria'][0]['src']),
    proy('Escalera de gato con jaula', 'pultrusion-canarias', est['galeria'][7]['src']),
    proy('Piscina terminada', 'piscinas-optimus', img(PI + W + '18.56.08 (2).jpeg', 'piscinas', 'piscina-terminada')),
]
guardar('proyectos.json', pr)

s = leer('site.json')
s['modoRevision'] = False
s['sobre']['imagen'] = s['inicio']['imagenHero']
guardar('site.json', s)
print('listo')
