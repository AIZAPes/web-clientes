# Web de Grupo PID — cómo funciona

Mapa de navegación y componentes: [ARQUITECTURA.md](ARQUITECTURA.md).

## Estructura

```
content/            ← TODO el contenido editable (JSON)
  site.json           datos de empresa, contacto, correos del formulario, cifras, Google, textos de inicio
  pid-agua.json       catálogo PID Agua (categorías y fichas)
  pultrusion-canarias.json
  piscinas-optimus.json   8 espacios de producto
  proyectos.json      galería de proyectos
src/
  build.mjs           generador: componentes + plantillas → dist/
  static/             CSS, JS, imágenes, .htaccess y enviar.php (se copian tal cual)
tools/
  servir.mjs          vista previa local de dist/ (node tools/servir.mjs 5180)
  extraer_logos.py    recorta los logos PROVISIONALES de la imagen de referencia
dist/               ← web generada (esto es lo que se sube al hosting). No editar a mano.
```

## Flujo de trabajo

1. Edita `content/*.json` (o añade fotos en `src/static/img/…`).
2. `node src/build.mjs` → regenera `dist/` y avisa de lo que falta (dominio, correos, títulos largos…).
3. Vista previa: `node tools/servir.mjs 5180` y abre http://localhost:5180.
4. Sube el contenido de `dist/` (incluido `.htaccess`) a la raíz del hosting.

## Añadir o completar contenido

- **Foto de un producto:** guarda la imagen en `src/static/img/productos/` (WebP, ~1600 px de ancho, < 250 KB) y pon la ruta en su campo `imagen`, p. ej. `"img/productos/deposito-horizontal.webp"`. Sin imagen se muestra «Fotografía pendiente».
- **Galería:** `"galeria": [{ "src": "img/productos/x-1.webp", "alt": "Descripción" }]`.
- **Especificaciones:** `"especificaciones": [["Capacidad", "…"], ["Material", "PRFV"]]`.
- **Documentos descargables:** sube el PDF a `src/static/docs/` y añade `"documentos": [{ "titulo": "Ficha técnica", "url": "docs/ficha.pdf" }]`.
- **FAQ:** `"faq": [{ "p": "Pregunta", "r": "Respuesta" }]` (genera también datos estructurados FAQPage).
- **Nuevo producto:** copia un objeto de ficha dentro de `productos` (o de `secciones`), cambia `slug`, `nombre` y `seo`. La página, el menú desplegable, el pie, el selector del formulario y el sitemap se actualizan solos.
- **Piscinas Optimus:** al conocer el nombre de un modelo, cambia `nombre`, borra `nombrePendiente` y, si cambias el `slug`, añade la redirección 301 en `src/static/.htaccess`.
- **Pultrusión Canarias:** las categorías con `"borrador": true` son huecos reservados; complétalas y quita esa marca para que tengan página.
- **Logotipos:** los actuales están recortados de la imagen de referencia. Cuando la empresa entregue los originales, sustituye los archivos de `src/static/img/logos/` (mismos nombres; PNG para Google/redes y WebP para la web).
- `"provisional": true` marca textos redactados como base y pendientes de validar. Bórralo cuando la empresa los apruebe.

## Antes de publicar (lista de datos pendientes)

| Dato | Dónde |
|---|---|
| Dominio definitivo (`https://…`) | `site.json → dominio` (activa canonical y sitemap correctos) |
| Teléfono, correo, dirección, horario | `site.json → contacto` |
| Correos que reciben las solicitudes (general y por división) | `site.json → emailsDestino` |
| Razón social y CIF | `site.json → razonSocial, cif` |
| Cifras reales | `site.json → cifras` |
| Historia / misión | `site.json → sobre` |
| Fotos (hero, divisiones, productos, proyectos) | campos `imagen` / `galeria` |
| Especificaciones, aplicaciones, documentos | cada ficha |
| Nombres de los 7 modelos de piscina + categoría adicional | `piscinas-optimus.json` |
| Textos legales (aviso legal, privacidad, cookies) | `build.mjs → paginasLegales()` |
| Logos vectoriales originales | `src/static/img/logos/` |

Cuando todo esté completo: `"modoRevision": false` en `site.json` (oculta las etiquetas amarillas y los bloques vacíos) y vuelve a generar.

## Formulario

`enviar.php` (requiere hosting con PHP, como Hostinger) envía cada solicitud, con adjuntos (máx. 10 MB en total; PDF, imágenes, DWG/DXF, ZIP), al correo de la división elegida en `emailsDestino`; si esa división no tiene correo, usa `general`. El campo oculto `web` es una trampa antispam. En la vista previa local el envío muestra un aviso (no hay PHP). Si se prefiere un servicio externo (Formspree, etc.), cambia `formulario.endpoint` en `site.json`.

## SEO y Google Search Console

- Cada página tiene URL limpia, `<title>`, metadescripción, un único H1, H2/H3 jerárquicos, textos alternativos y Open Graph.
- Datos estructurados: `Organization` (Grupo PID con sus 3 divisiones), `WebSite`, `BreadcrumbList`, `Service` en cada ficha y `FAQPage` cuando haya preguntas.
- `sitemap.xml` y `robots.txt` se generan solos.
- **Search Console:** crea una propiedad de dominio (verificación DNS, recomendada) o de prefijo de URL; para esta última, pega el código de la etiqueta HTML en `site.json → google.searchConsoleVerificacion` (o deja el archivo `googleXXXX.html` en `src/static/`). Después envía `https://TU-DOMINIO/sitemap.xml`.
- Activa la redirección HTTPS de `.htaccess` cuando el dominio tenga certificado.
- Rendimiento: HTML estático, una hoja de estilos (≈30 KB) y un script (≈7 KB) diferido; imágenes con carga diferida.
