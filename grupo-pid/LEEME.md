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

## Reseñas de Google (portada)

La portada muestra la valoración media y hasta 5 reseñas de Google (las que Google considera más relevantes), en directo desde la API de Google Places. Lo hace `resenas.php` (requiere PHP con cURL); `js/site.js` lo llama en cada visita a la portada. Si no hay clave, Google falla o se llega al límite diario, la sección simplemente no aparece.

- **Condiciones de Google:** no se pueden guardar reseñas ni valoraciones en el servidor, así que se piden en cada visita (solo se guarda el Place ID, que sí está permitido). Hay que mostrar autor con foto y enlace, el enlace a cada reseña, el aviso de orden y la atribución «Google Maps»: la web ya lo hace. No se pueden filtrar reseñas (p. ej. solo las de 5 estrellas) sin avisarlo.
- **Coste:** la consulta de detalles con reseñas tiene 1.000 llamadas gratis al mes; después cuesta unos 25 USD por cada 1.000. `site.json → resenas.maxConsultasDia` (30 por defecto ≈ 900 al mes) corta antes de pasar del tramo gratuito; si ese día se agota, la sección se oculta hasta el día siguiente.

**Puesta en marcha (en Google Cloud, con la cuenta de la empresa):**
1. Crear un proyecto en https://console.cloud.google.com y activar una cuenta de facturación (Google la exige aunque no se pase del tramo gratuito).
2. Activar la API **Places API (New)**.
3. Crear una **clave de API** y restringirla: en «Restricciones de API», solo Places API (New); en «Restricciones de aplicaciones», «Direcciones IP» con la IP del servidor del hosting.
4. Opcional pero recomendable: en Places API (New) → Cuotas, limitar las solicitudes diarias (p. ej. 40) como segunda barrera de coste.
5. En el hosting, junto a `resenas.php`, crear el archivo `resenas-clave.php` con este contenido (y nada más): `<?php return 'LA_CLAVE';`. **No lo subas al repositorio** (está en `.gitignore`). Alternativa: variable de entorno `GOOGLE_PLACES_API_KEY` si el hosting lo permite.
6. Place ID: si `site.json → resenas.placeId` está vacío, `resenas.php` busca una vez el negocio con el texto de `busqueda` y guarda su ID. Es más seguro poner el Place ID exacto (se obtiene en https://developers.google.com/maps/documentation/places/web-service/place-id) y volver a generar la web.
7. Comprobar `https://TU-DOMINIO/resenas.php`: debe responder `"ok":true` con el nombre correcto del negocio en `"nombre"`. Si responde `"ok":false`, el campo `"error"` dice qué falta.

Para quitar la sección: `site.json → resenas.activo: false` y volver a generar.

## SEO y Google Search Console

- Cada página tiene URL limpia, `<title>`, metadescripción, un único H1, H2/H3 jerárquicos, textos alternativos y Open Graph.
- Datos estructurados: `Organization` (Grupo PID con sus 3 divisiones), `WebSite`, `BreadcrumbList`, `Service` en cada ficha y `FAQPage` cuando haya preguntas.
- `sitemap.xml` y `robots.txt` se generan solos.
- **Search Console:** crea una propiedad de dominio (verificación DNS, recomendada) o de prefijo de URL; para esta última, pega el código de la etiqueta HTML en `site.json → google.searchConsoleVerificacion` (o deja el archivo `googleXXXX.html` en `src/static/`). Después envía `https://TU-DOMINIO/sitemap.xml`.
- Activa la redirección HTTPS de `.htaccess` cuando el dominio tenga certificado.
- Rendimiento: HTML estático, una hoja de estilos (≈30 KB) y un script (≈7 KB) diferido; imágenes con carga diferida.
