# Grupo PID — web corporativa (cliente de AIzap)

Marca paraguas **Grupo PID** con tres divisiones: **PID Agua** (depósitos PRFV, tanques modulares, fosas sépticas, depuradoras, mantenimiento), **Pultrusión Canarias** (perfiles y estructuras de PRFV) y **Piscinas Optimus** (7 modelos + 1 categoría adicional). Creada el 2026-11-16.

Leer primero: [ARQUITECTURA.md](ARQUITECTURA.md) (mapa de navegación y componentes) y [LEEME.md](LEEME.md) (cómo editar, publicar y lista de datos pendientes).

## Cómo está hecha
- Contenido en `content/*.json` → `node src/build.mjs` genera la web estática en `dist/` (lo que se sube al hosting; no editar a mano).
- `src/build.mjs`: componentes y plantillas (cabecera con desplegables, ficha de 9 bloques, formulario, SEO/JSON-LD, sitemap, robots).
- `src/static/`: `css/site.css` (temas por `data-tema="grupo|agua|pultrusion|optimus"`), `js/site.js`, logos, `.htaccess`, `enviar.php` (formulario con adjuntos → correo por división, requiere PHP).
- Vista previa: `node tools/servir.mjs 5180` (configuración `grupo-pid` en `.claude/launch.json`). El POST del formulario en local responde con un aviso (no hay PHP).
- Logos provisionales recortados de `tools/referencia-marcas.jpg` con `tools/extraer_logos.py`; solo se ven bien sobre fondo grafito (`.placa`).

## Reglas del cliente
- **No inventar nada**: ni contacto, ni cifras, ni especificaciones, ni nombres de modelos. Lo que falta se marca como pendiente (`modoRevision: true` en `content/site.json`; ponerlo a `false` al publicar).
- Textos redactados como base llevan `"provisional": true`. Ventajas/aplicaciones del PRFV son genéricas y están marcadas «validar con la empresa».
- Tutear al cliente final. Solo español.

## Estado (2026-11-16)
- Hecho: 32 páginas, verificadas en escritorio, tableta y móvil 375 px (menú, desplegables, formulario con preselección `?division=&producto=`, filtros de proyectos). Un H1 por página y JSON-LD válido.
- Sin probar: envío real de `enviar.php` (no había PHP en local).
- Pendiente de la empresa: dominio, teléfono/correo/dirección/horario, correos de destino del formulario, razón social y CIF, cifras, historia, fotos, especificaciones, documentos, nombres de los modelos de piscina, textos legales y logos originales.
