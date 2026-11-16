// Generador estático de la web de Grupo PID.
// Uso: node src/build.mjs   →  escribe la web completa en dist/
// Contenido: content/*.json  ·  Estilos y JS: src/static/  ·  Sin dependencias externas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const leer = (f) => JSON.parse(fs.readFileSync(path.join(RAIZ, 'content', f), 'utf8'));

const site = leer('site.json');
const DIVS = [leer('pid-agua.json'), leer('pultrusion-canarias.json'), leer('piscinas-optimus.json')];
const PROYECTOS = leer('proyectos.json').proyectos;
const REV = site.modoRevision !== false;
const DOM = (site.dominio || '').replace(/\/$/, '');
const HOY = new Date().toISOString().slice(0, 10);
const VERSION = Date.now().toString(36);
const avisos = [];
const paginas = [];

// ───────────────────────── utilidades ─────────────────────────
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const vacio = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
const div = (id) => DIVS.find((d) => d.id === id);
const visibles = (d) => d.secciones.filter((s) => !s.borrador);
const rutaDiv = (d) => `/${d.id}/`;
const rutaSec = (d, s) => `/${d.id}/${s.slug}/`;
const rutaProd = (d, s, p) => `/${d.id}/${s.slug}/${p.slug}/`;
const presupuesto = (d, prod) => `/contacto/?division=${d ? d.id : ''}${prod ? '&producto=' + prod : ''}#formulario`;

// ───────────────────────── iconos (SVG en línea) ─────────────────────────
const I = {
  capas: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".55"/>',
  gota: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.5"/>',
  almohadilla: '<path d="M9 3 7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>',
  escalera: '<path d="M8 15V5a2 2 0 0 1 4 0M14 15V5a2 2 0 0 1 4 0M8 8h6M8 12h6"/><path d="M2 18c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3 2-1.3 4-1.3M2 21.5c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3 2-1.3 4-1.3"/>',
  engranaje: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5"/>',
  camara: '<path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4V8Z"/><circle cx="12" cy="13" r="3.6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.3 7-11.5a7 7 0 0 0-14 0C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  clip: '<path d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14.8 7"/>',
  escudo: '<path d="M12 3 4.5 6v6c0 4.4 3.2 8 7.5 9 4.3-1 7.5-4.6 7.5-9V6L12 3Z"/>',
  pluma: '<path d="M4 20c4-1 7-4 9-8M14 4l6 6-7 7-6-6 7-7Z"/>',
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  hoja: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7"/>',
};
const ico = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

// ───────────────────────── componentes ─────────────────────────
/** Etiqueta visible de contenido provisional (solo con modoRevision). */
const pendiente = (txt = 'Contenido provisional') => (REV ? `<span class="pend">${esc(txt)}</span>` : '');
/** Bloque vacío "a completar por la empresa" (solo con modoRevision). */
const huecoPendiente = (txt) => (REV ? `<div class="hueco">${ico('pluma')}<p>${esc(txt)}</p></div>` : '');

/** Foto real o marcador "Fotografía pendiente". */
function foto(src, alt = '', { clase = '', eager = false, etiqueta = 'Fotografía pendiente' } = {}) {
  if (src) return `<img class="foto ${clase}" src="/${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  return `<div class="foto ph ${clase}" role="img" aria-label="${esc(etiqueta + (alt ? ': ' + alt : ''))}">${ico('camara')}<span>${esc(etiqueta)}</span>${alt ? `<small>${esc(alt)}</small>` : ''}</div>`;
}

/** Logotipo de una marca sobre su placa grafito (como en la imagen de identidad). */
const placa = (d, cls = '') => `<span class="placa ${cls}"><img src="/${d.logo.replace(/.png$/, ".webp")}" alt="${esc(d.nombre)}" width="400" height="200" decoding="async"></span>`;

const boton = (href, txt, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(txt)}${ico('flecha')}</a>`;

function migas(items) {
  const todos = [['Inicio', '/'], ...items];
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: todos.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, ...(DOM ? { item: DOM + u } : {}) })) };
  return {
    html: `<nav class="migas" aria-label="Ruta de navegación"><ol>${todos.map(([n, u], i) => (i === todos.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`)).join('')}</ol></nav>`,
    ld,
  };
}

function cabecera(activo) {
  const desplegable = (d) => {
    const secs = visibles(d);
    let cuerpo;
    if (d.id === 'pid-agua') {
      cuerpo = `<div class="mega">${secs.map((s) => `<div class="mega-col"><a class="mega-tit" href="${rutaSec(d, s)}">${esc(s.nombre)}</a>${(s.productos || []).map((p) => `<a href="${rutaProd(d, s, p)}">${esc(p.nombre)}</a>`).join('')}${s.productos ? '' : `<span class="mega-res">${esc(s.resumen)}</span>`}</div>`).join('')}</div>`;
    } else {
      cuerpo = `<div class="lista">${secs.map((s) => `<a href="${rutaSec(d, s)}">${esc(s.nombre)}</a>`).join('')}${d.tecnologia ? `<a href="${rutaDiv(d)}#tecnologia">Tecnología y ventajas</a>` : ''}</div>`;
    }
    return `<li class="nav-item tiene-sub" data-tema="${d.tema}">
      <div class="nav-fila"><a class="nav-link${activo === d.id ? ' activo' : ''}" href="${rutaDiv(d)}">${esc(d.nombre)}</a><button class="sub-btn" aria-expanded="false" aria-label="Ver productos de ${esc(d.nombre)}">${ico('chevron')}</button></div>
      <div class="sub"><div class="sub-in"><div class="sub-cab">${placa(d, 'placa-s')}<a class="sub-todo" href="${rutaDiv(d)}">Ver toda la división${ico('flecha')}</a></div>${cuerpo}</div></div>
    </li>`;
  };
  const simple = (href, txt, id) => `<li class="nav-item"><a class="nav-link${activo === id ? ' activo' : ''}" href="${href}">${txt}</a></li>`;
  return `<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cab" id="cabecera">
  <div class="cab-in">
    <a class="cab-logo" href="/" aria-label="Grupo PID, inicio"><img src="/img/logos/grupo-pid-compacto.webp" alt="Grupo PID Canarias" width="675" height="333"></a>
    <nav class="nav" id="nav" aria-label="Menú principal">
      <ul class="nav-lista">
        ${simple('/', 'Inicio', 'inicio')}
        ${DIVS.map(desplegable).join('')}
        ${simple('/proyectos/', 'Proyectos', 'proyectos')}
        ${simple('/sobre-grupo-pid/', 'Sobre Grupo PID', 'sobre')}
        ${simple('/contacto/', 'Contacto', 'contacto')}
      </ul>
      <a class="btn btn-cab nav-cta-movil" href="${presupuesto()}">Solicitar presupuesto${ico('flecha')}</a>
    </nav>
    <a class="btn btn-cab cab-cta" href="${presupuesto()}">Solicitar presupuesto</a>
    <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">${ico('menu', 'i i-abrir')}${ico('cerrar', 'i i-cerrar')}</button>
  </div>
</header>`;
}

function datoContacto(icono, valor, href, falta) {
  if (vacio(valor)) return REV ? `<li>${ico(icono)}<span class="pend">${esc(falta)}</span></li>` : '';
  return `<li>${ico(icono)}${href ? `<a href="${href}">${esc(valor)}</a>` : `<span>${esc(valor)}</span>`}</li>`;
}
const listaContacto = () => {
  const c = site.contacto;
  return `<ul class="contacto-lista">
    ${datoContacto('tel', c.telefono, c.telefono && 'tel:' + c.telefono.replace(/\s/g, ''), 'Teléfono pendiente')}
    ${datoContacto('mail', c.email, c.email && 'mailto:' + c.email, 'Correo pendiente')}
    ${datoContacto('pin', c.direccion, c.mapaUrl, 'Dirección pendiente')}
    ${datoContacto('reloj', c.horario, '', 'Horario pendiente')}
  </ul>`;
};

function pie() {
  const redes = Object.entries(site.redes).filter(([k, v]) => !k.startsWith('_') && v);
  return `<footer class="pie">
  <div class="pie-in">
    <div class="pie-marca">
      <img src="/img/logos/grupo-pid.webp" alt="Grupo PID Canarias" width="688" height="367" loading="lazy">
      <p>${esc(site.lema)}.</p>
      ${listaContacto()}
      ${redes.length ? `<p class="redes">${redes.map(([k, v]) => `<a href="${esc(v)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a>`).join(' · ')}</p>` : ''}
    </div>
    ${DIVS.map((d) => `<div class="pie-col" data-tema="${d.tema}"><a class="pie-placa" href="${rutaDiv(d)}">${placa(d, 'placa-pie')}</a><ul>${visibles(d).map((s) => `<li><a href="${rutaSec(d, s)}">${esc(s.nombre)}</a></li>`).join('')}</ul></div>`).join('')}
  </div>
  <div class="pie-base">
    <span>© ${new Date().getFullYear()} ${esc(site.razonSocial || site.nombre)}${site.cif ? ' · CIF ' + esc(site.cif) : ''}</span>
    <nav aria-label="Enlaces legales"><a href="/proyectos/">Proyectos</a><a href="/sobre-grupo-pid/">Sobre Grupo PID</a><a href="/aviso-legal/">Aviso legal</a><a href="/privacidad/">Privacidad</a><a href="/cookies/">Cookies</a></nav>
  </div>
</footer>`;
}

const ctaBanda = (d, prod, titulo = '¿Qué solución necesita tu proyecto?', texto = 'Cuéntanos qué necesitas y te asesoramos sobre la solución más adecuada.') =>
  `<section class="cta-banda" ${d ? `data-tema="${d.tema}"` : ''}><div class="env cta-in revela"><div><h2>${esc(titulo)}</h2><p>${esc(texto)}</p></div><div class="cta-btns">${boton(presupuesto(d, prod), 'Solicitar presupuesto', 'btn btn-grande')}${boton('/contacto/', 'Pedir asesoramiento', 'btn btn-borde-claro')}</div></div></section>`;

function cifras() {
  return `<div class="cifras">${site.cifras.map((c) => `<div class="cifra revela"><strong>${vacio(c.valor) ? '—' : esc(c.valor)}</strong><span>${esc(c.etiqueta)}</span>${vacio(c.valor) ? pendiente('Dato pendiente') : ''}</div>`).join('')}</div>`;
}

const areas = () => `<ul class="areas">${site.areas.map((a) => `<li>${ico(a.icono)}<span>${esc(a.nombre)}</span></li>`).join('')}</ul>`;

function tarjetaProyecto(p) {
  const d = div(p.division);
  const hay = !!p.imagen;
  return `<figure class="proy revela" data-division="${p.division}" data-tema="${d?.tema || ''}">
    ${hay ? `<button class="proy-ampliar" data-src="/${esc(p.imagen)}" data-alt="${esc(p.alt || p.titulo)}" aria-label="Ampliar ${esc(p.titulo)}">${foto(p.imagen, p.alt || p.titulo)}</button>` : foto('', p.titulo, { etiqueta: 'Foto de proyecto pendiente' })}
    <figcaption><span class="proy-div">${esc(d?.nombre || '')}</span><strong>${esc(p.titulo)}</strong>${[p.lugar, p.anio].filter(Boolean).length ? `<small>${esc([p.lugar, p.anio].filter(Boolean).join(' · '))}</small>` : ''}${p.pendiente ? pendiente('Proyecto de ejemplo') : ''}</figcaption>
  </figure>`;
}
const galeriaProyectos = (lista) => `<div class="proyectos">${lista.map(tarjetaProyecto).join('')}</div>`;

function galeria(imgs, alt) {
  if (vacio(imgs)) return huecoPendiente('Galería pendiente: añade las fotografías en el campo "galeria" del contenido.');
  return `<div class="galeria">${imgs.map((g) => `<button class="gal-item" data-src="/${esc(g.src)}" data-alt="${esc(g.alt || alt)}" aria-label="Ampliar imagen">${foto(g.src, g.alt || alt)}</button>`).join('')}</div>`;
}

function tarjetaProducto(href, p, extra = '') {
  return `<a class="tarjeta revela" href="${href}">
    <div class="tarjeta-foto">${foto(p.imagen, p.alt || p.nombre)}</div>
    <div class="tarjeta-txt"><h3>${esc(p.nombre)}${p.nombrePendiente ? ' ' + pendiente('Nombre pendiente') : ''}</h3><p>${esc(p.resumen || '')}</p>${extra}<span class="enlace">Ver ficha${ico('flecha')}</span></div>
  </a>`;
}

/** Formulario de solicitud: división → producto, datos, descripción y adjuntos. */
function formulario({ d = null, prod = '', titulo = 'Solicitar presupuesto', intro = 'Rellena el formulario y te responderemos lo antes posible.' } = {}) {
  const f = site.formulario;
  return `<form class="form" id="formulario" action="${esc(f.endpoint)}" method="post" enctype="multipart/form-data" data-division="${d ? d.id : ''}" data-producto="${esc(prod)}" novalidate>
    <div class="form-cab"><h2>${esc(titulo)}</h2><p>${esc(intro)}</p></div>
    <div class="campos">
      <label class="campo"><span>División comercial *</span><select name="division" required><option value="">Selecciona una división</option>${DIVS.map((x) => `<option value="${x.id}">${esc(x.nombre)}</option>`).join('')}<option value="general">Grupo PID (consulta general)</option></select></label>
      <label class="campo"><span>Producto o servicio *</span><select name="producto" required disabled><option value="">Primero elige una división</option></select></label>
      <label class="campo"><span>Nombre *</span><input name="nombre" autocomplete="given-name" required></label>
      <label class="campo"><span>Apellidos *</span><input name="apellidos" autocomplete="family-name" required></label>
      <label class="campo"><span>Empresa</span><input name="empresa" autocomplete="organization"></label>
      <label class="campo"><span>Teléfono *</span><input name="telefono" type="tel" autocomplete="tel" required></label>
      <label class="campo ancho"><span>Correo electrónico *</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="campo ancho"><span>Descripción del proyecto *</span><textarea name="mensaje" rows="5" required placeholder="Ubicación, medidas o capacidades aproximadas, plazos…"></textarea></label>
      <label class="campo ancho archivo"><span>${ico('clip')} Adjuntar archivos <small>(planos, fotos o documentos · máx. ${f.maxArchivosMB} MB en total)</small></span><input name="adjuntos[]" type="file" multiple accept="${esc(f.tiposArchivo)}" data-max="${f.maxArchivosMB}"><output class="archivos-lista"></output></label>
      <label class="hp" aria-hidden="true">No rellenar<input name="web" tabindex="-1" autocomplete="off"></label>
      <label class="check ancho"><input type="checkbox" name="privacidad" required><span>He leído y acepto la <a href="/privacidad/" target="_blank">política de privacidad</a>. *</span></label>
    </div>
    <div class="form-pie"><button class="btn btn-grande" type="submit">Enviar solicitud${ico('flecha')}</button><p class="form-estado" role="status" aria-live="polite"></p></div>
  </form>`;
}

// ───────────────────────── página base ─────────────────────────
function pagina({ ruta, titulo, descripcion, tema = 'grupo', activo = '', cuerpo, ld = [], imagen = '' }) {
  if (titulo.length > 65) avisos.push(`Título largo (${titulo.length}) en ${ruta}`);
  if (descripcion.length > 160) avisos.push(`Metadescripción larga (${descripcion.length}) en ${ruta}`);
  paginas.push(ruta);
  const canon = DOM ? DOM + ruta : '';
  const og = imagen ? (DOM ? DOM : '') + '/' + imagen : (DOM ? DOM + '/img/logos/grupo-pid.png' : '');
  const g = site.google;
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
${canon ? `<link rel="canonical" href="${canon}">` : ''}
${g.searchConsoleVerificacion ? `<meta name="google-site-verification" content="${esc(g.searchConsoleVerificacion)}">` : ''}
<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="${esc(site.nombre)}">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descripcion)}">
${canon ? `<meta property="og:url" content="${canon}">` : ''}${og ? `<meta property="og:image" content="${og}">` : ''}
<meta name="theme-color" content="#2c2f34">
<link rel="icon" type="image/png" href="/img/favicon.png"><link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Michroma&display=swap">
<link rel="stylesheet" href="/css/site.css?v=${VERSION}">
${ld.filter(Boolean).map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
${g.analyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(g.analyticsId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(g.analyticsId)}');</script>` : ''}
<script defer src="/js/site.js?v=${VERSION}"></script>
</head>
<body data-tema="${tema}"${REV ? ' class="revision"' : ''}>
${cabecera(activo)}
<main id="contenido">
${cuerpo}
</main>
${pie()}
${REV ? '<button class="aviso-rev" type="button" onclick="this.hidden=true" title="Ocultar aviso"><strong>Modo revisión</strong> · Las etiquetas amarillas marcan contenido provisional pendiente de datos reales. ✕</button>' : ''}
<div class="visor" id="visor" hidden><button class="visor-cerrar" aria-label="Cerrar">${ico('cerrar')}</button><img alt=""></div>
</body>
</html>`;
  const archivo = ruta === '/404.html' ? path.join(DIST, '404.html') : path.join(DIST, ruta, 'index.html');
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, html.replace(/\n\s*\n/g, '\n'));
}

// ───────────────────────── datos estructurados ─────────────────────────
const orgLD = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', '@id': (DOM || '') + '/#organizacion',
  name: site.nombre, alternateName: site.nombreCompleto, ...(DOM ? { url: DOM + '/', logo: DOM + '/img/logos/grupo-pid.png' } : {}),
  ...(site.razonSocial ? { legalName: site.razonSocial } : {}), ...(site.contacto.telefono ? { telephone: site.contacto.telefono } : {}),
  ...(site.contacto.email ? { email: site.contacto.email } : {}), ...(site.contacto.direccion ? { address: site.contacto.direccion } : {}),
  sameAs: Object.entries(site.redes).filter(([k, v]) => !k.startsWith('_') && v).map(([, v]) => v),
  subOrganization: DIVS.map((d) => ({ '@type': 'Organization', name: d.nombre, description: d.resumen, ...(DOM ? { url: DOM + rutaDiv(d) } : {}) })),
});
const divLD = (d) => ({ '@context': 'https://schema.org', '@type': 'Organization', name: d.nombre, description: d.resumen, ...(DOM ? { url: DOM + rutaDiv(d), logo: DOM + '/' + d.logo } : {}), parentOrganization: { '@type': 'Organization', name: site.nombre } });
const faqLD = (faq) => (vacio(faq) ? null : { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.p, acceptedAnswer: { '@type': 'Answer', text: q.r } })) });
const servicioLD = (d, p) => ({ '@context': 'https://schema.org', '@type': 'Service', name: p.nombre, description: p.descripcion || p.resumen, serviceType: p.nombre, provider: { '@type': 'Organization', name: d.nombre, parentOrganization: { '@type': 'Organization', name: site.nombre } }, ...(p.imagen && DOM ? { image: DOM + '/' + p.imagen } : {}) });

// ───────────────────────── plantillas de página ─────────────────────────
function heroDivision(d, { foto: f = d.imagen, alt = d.alt } = {}) {
  return `<section class="dhero" data-tema="${d.tema}">
    <div class="env dhero-in">
      <div class="dhero-txt revela">
        ${placa(d, 'placa-m')}
        <p class="claim">${esc(d.claim)}</p>
        <h1>${esc(d.hero.titulo)}</h1>
        <p class="lead">${esc(d.hero.texto)} ${d.hero.provisional ? pendiente('Texto provisional') : ''}</p>
        <div class="btns">${boton(presupuesto(d), 'Solicitar presupuesto', 'btn btn-grande')}${boton('#catalogo', 'Ver catálogo', 'btn btn-borde')}</div>
      </div>
      <div class="dhero-foto revela">${foto(f, alt, { eager: true, etiqueta: 'Imagen principal pendiente' })}</div>
    </div>
  </section>`;
}

const tituloSeccion = (eyebrow, h2, texto = '') => `<header class="sec-cab revela"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(h2)}</h2>${texto ? `<p>${texto}</p>` : ''}</header>`;

function seccionFormulario(d, titulo, intro) {
  return `<section class="sec sec-form" id="solicitud"><div class="env form-env">
    <div class="form-lado revela">${placa(d, 'placa-m')}<h2>${esc(titulo)}</h2><p>${esc(intro)}</p>${listaContacto()}</div>
    ${formulario({ d, titulo: 'Tu solicitud', intro: 'Los campos con * son obligatorios.' })}
  </div></section>`;
}

/** Ficha común de producto/servicio (9 bloques). */
function fichaProducto(d, p, trail, hermanos = []) {
  const m = migas(trail);
  const esPiscina = d.id === 'piscinas-optimus';
  const lista = (items) => `<ul class="lista-check">${items.map((x) => `<li>${ico('check')}${esc(x)}</li>`).join('')}</ul>`;
  const bloque = (id, titulo, contenido, faltan) => (contenido ? `<section class="ficha-bloque revela" id="${id}"><h2>${esc(titulo)}</h2>${contenido}</section>` : faltan ? (REV ? `<section class="ficha-bloque revela" id="${id}"><h2>${esc(titulo)}</h2>${huecoPendiente(faltan)}</section>` : '') : '');
  const docs = vacio(p.documentos) ? '' : `<ul class="docs">${p.documentos.map((x) => `<li><a href="/${esc(x.url)}" download>${ico('doc')}<span>${esc(x.titulo)}</span></a></li>`).join('')}</ul>`;
  const faq = vacio(p.faq) ? '' : `<div class="faq">${p.faq.map((q) => `<details><summary>${esc(q.p)}${ico('chevron')}</summary><p>${esc(q.r)}</p></details>`).join('')}</div>`;
  const specs = vacio(p.especificaciones) ? '' : `<table class="specs"><tbody>${p.especificaciones.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`;
  const extra = (p.bloquesExtra || []).map((b, i) => bloque('extra-' + i, b.titulo, vacio(b.items) ? '' : lista(b.items), `${b.titulo}: pendiente de información de la empresa.`)).join('');

  const cuerpo = `
  <div class="ficha" data-tema="${d.tema}">
    <div class="env">${m.html}</div>
    <section class="env ficha-top">
      <div class="ficha-foto revela">${foto(p.imagen, p.alt || p.nombre, { eager: true })}</div>
      <div class="ficha-intro revela">
        <a class="ficha-div" href="${rutaDiv(d)}">${esc(d.nombre)}</a>
        <h1>${esc(p.nombre)}${p.nombrePendiente ? ' ' + pendiente('Nombre pendiente') : ''}</h1>
        ${p.descripcion ? `<p class="lead">${esc(p.descripcion)} ${p.provisional ? pendiente('Texto provisional') : ''}</p>` : huecoPendiente('Descripción pendiente.')}
        <div class="btns">${boton(presupuesto(d, p.slug), 'Solicitar presupuesto', 'btn btn-grande')}${docs ? boton('#documentacion', 'Documentación técnica', 'btn btn-borde') : ''}</div>
      </div>
    </section>
    <div class="env ficha-cuerpo">
      ${esPiscina
        ? bloque('caracteristicas', 'Características', vacio(p.caracteristicas) ? '' : lista(p.caracteristicas), 'Características del modelo pendientes.')
        : bloque('aplicaciones', p.etiquetaAplicaciones || 'Aplicaciones y usos', vacio(p.aplicaciones) ? '' : lista(p.aplicaciones), 'Aplicaciones y usos pendientes de información de la empresa.')}
      ${extra}
      ${bloque('especificaciones', 'Características técnicas', specs, 'Especificaciones técnicas (dimensiones, capacidades, certificaciones…) pendientes de facilitar por la empresa.')}
      ${bloque('galeria', 'Galería', vacio(p.galeria) ? '' : galeria(p.galeria, p.nombre), 'Galería fotográfica pendiente.')}
      ${bloque('documentacion', 'Documentación técnica', docs, 'Fichas técnicas o catálogos en PDF, si existen.')}
      ${bloque('preguntas', 'Preguntas frecuentes', faq, 'Preguntas frecuentes, cuando haya información suficiente.')}
    </div>
    ${hermanos.length ? `<section class="sec sec-gris"><div class="env">${tituloSeccion(d.nombre, 'Otras soluciones relacionadas')}<div class="rejilla r3">${hermanos.map(([h, x]) => tarjetaProducto(h, x)).join('')}</div></div></section>` : ''}
    ${ctaBanda(d, p.slug, `¿Te interesa ${p.nombrePendiente ? 'este modelo' : p.nombre.toLowerCase()}?`, 'Solicita presupuesto o asesoramiento técnico sin compromiso.')}
  </div>`;
  return { cuerpo, ld: [m.ld, servicioLD(d, p), faqLD(p.faq)] };
}

// ───────────────────────── páginas ─────────────────────────
function paginaInicio() {
  const s = site.inicio;
  const cuerpo = `
  <section class="hero">
    <div class="hero-fondo">${s.imagenHero ? foto(s.imagenHero, s.altHero, { eager: true }) : `<div class="hero-patron" aria-hidden="true"></div>${REV ? '<span class="pend hero-pend">Imagen industrial pendiente</span>' : ''}`}</div>
    <div class="env hero-in">
      <p class="eyebrow claro revela">Grupo PID Canarias</p>
      <h1 class="revela">${esc(s.titular)}</h1>
      <p class="lead revela">${esc(s.subtitulo)}</p>
      <div class="btns revela">${boton(presupuesto(), 'Solicitar presupuesto', 'btn btn-grande')}${boton('#divisiones', 'Ver divisiones', 'btn btn-borde-claro')}</div>
    </div>
    <div class="env hero-areas revela">${areas()}</div>
  </section>

  <section class="sec" id="divisiones">
    <div class="env">
      ${tituloSeccion('Nuestras divisiones', 'Elige la solución que necesitas', 'Tres marcas especializadas bajo el paraguas de Grupo PID.')}
      <div class="divisiones">
        ${DIVS.map((d) => `<article class="division revela" data-tema="${d.tema}">
          <a class="division-foto" href="${rutaDiv(d)}" tabindex="-1" aria-hidden="true">${foto(d.imagen, d.alt)}</a>
          <div class="division-txt">
            ${placa(d, 'placa-m')}
            <h3 class="sr">${esc(d.nombre)}</h3>
            <p>${esc(d.resumen)}</p>
            <ul class="lista-check">${d.destacados.map((x) => `<li>${ico('check')}${esc(x)}</li>`).join('')}</ul>
            ${boton(rutaDiv(d), 'Descubrir soluciones', 'btn btn-division')}
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec sec-oscura">
    <div class="env">
      ${tituloSeccion('Grupo PID en cifras', 'Experiencia y capacidad industrial')}
      ${cifras()}
    </div>
  </section>

  <section class="sec">
    <div class="env">
      ${tituloSeccion('Proyectos realizados', 'Instalaciones, productos y trabajos')}
      ${galeriaProyectos(PROYECTOS.slice(0, 6))}
      <p class="centro">${boton('/proyectos/', 'Ver todos los proyectos', 'btn btn-borde')}</p>
    </div>
  </section>
  ${ctaBanda(null)}`;
  pagina({ ruta: '/', titulo: s.seo.titulo, descripcion: s.seo.descripcion, activo: 'inicio', cuerpo, imagen: s.imagenHero, ld: [orgLD(), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.nombre, ...(DOM ? { url: DOM + '/' } : {}) }] });
}

function paginaPidAgua(d) {
  const secs = visibles(d);
  const cuerpo = `${heroDivision(d)}
  <section class="sec" id="catalogo"><div class="env">
    ${tituloSeccion('Catálogo PID Agua', 'Productos y servicios', 'Selecciona una categoría para ver sus fichas, aplicaciones y especificaciones.')}
    <div class="catalogo">
      ${secs.map((s) => `<article class="cat revela${s.productos ? ' cat-grande' : ''}">
        <a class="cat-foto" href="${rutaSec(d, s)}" tabindex="-1" aria-hidden="true">${foto(s.imagen, s.alt || s.nombre)}</a>
        <div class="cat-txt">
          <h3><a href="${rutaSec(d, s)}">${esc(s.nombre)}</a></h3>
          <p>${esc(s.resumen)}</p>
          ${s.productos ? `<ul class="chips">${s.productos.map((p) => `<li><a href="${rutaProd(d, s, p)}">${esc(p.nombre)}</a></li>`).join('')}</ul>` : ''}
          <a class="enlace" href="${rutaSec(d, s)}">${s.productos ? 'Ver categoría' : 'Ver ficha'}${ico('flecha')}</a>
        </div>
      </article>`).join('')}
    </div>
  </div></section>
  <section class="sec sec-gris"><div class="env">
    ${tituloSeccion('Proyectos', 'Trabajos de PID Agua')}
    ${galeriaProyectos(PROYECTOS.filter((p) => p.division === d.id))}
  </div></section>
  ${seccionFormulario(d, 'Solicita presupuesto a PID Agua', 'Indícanos el producto o servicio que necesitas y te responderemos con una propuesta.')}`;
  pagina({ ruta: rutaDiv(d), titulo: d.seo.titulo, descripcion: d.seo.descripcion, tema: d.tema, activo: d.id, cuerpo, ld: [divLD(d), migas([[d.nombre, rutaDiv(d)]]).ld] });
}

function paginaPultrusion(d) {
  const t = d.tecnologia;
  const iconosV = ['escudo', 'pluma', 'rayo', 'hoja'];
  const cuerpo = `${heroDivision(d)}
  <section class="sec" id="tecnologia"><div class="env dos-col">
    <div class="revela">
      <p class="eyebrow">Tecnología</p><h2>${esc(t.titulo)}</h2>
      <p class="lead">${esc(t.texto)} ${t.provisional ? pendiente('Texto a validar') : ''}</p>
      <ol class="pasos">${t.pasos.map((x, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ol>
    </div>
    <div class="revela">${foto(t.imagen, 'Proceso de pultrusión de PRFV', { clase: 'foto-alta' })}</div>
  </div></section>
  <section class="sec sec-gris" id="catalogo"><div class="env">
    ${tituloSeccion('Soluciones', 'Estructuras y perfiles en PRFV', 'Categorías preparadas para ampliarse con la gama de productos de Pultrusión Canarias.')}
    <div class="rejilla r4">${d.secciones.map((s) => (s.borrador ? (REV ? `<div class="tarjeta tarjeta-vacia revela"><div class="tarjeta-foto">${foto('', '', { etiqueta: 'Espacio reservado' })}</div><div class="tarjeta-txt"><h3>${esc(s.nombre)}</h3><p>${esc(s.resumen)}</p>${pendiente('Por definir')}</div></div>` : '') : tarjetaProducto(rutaSec(d, s), s))).join('')}</div>
  </div></section>
  <section class="sec"><div class="env">
    ${tituloSeccion('Ventajas', 'Por qué elegir PRFV', d.ventajas.provisional ? pendiente('Propiedades generales del material: validar con la empresa') : '')}
    <div class="rejilla r4">${d.ventajas.items.map((v, i) => `<div class="ventaja revela">${ico(iconosV[i % 4])}<h3>${esc(v.titulo)}</h3><p>${esc(v.texto)}</p></div>`).join('')}</div>
  </div></section>
  <section class="sec sec-oscura"><div class="env">
    ${tituloSeccion('Aplicaciones industriales', 'Dónde se utiliza el PRFV', d.aplicaciones.provisional ? pendiente('Sectores propuestos: validar con la empresa') : '')}
    <ul class="aplicaciones revela">${d.aplicaciones.items.map((x) => `<li>${ico('almohadilla')}${esc(x)}</li>`).join('')}</ul>
  </div></section>
  <section class="sec"><div class="env">
    ${tituloSeccion('Galería', 'Productos y trabajos')}
    ${galeriaProyectos(PROYECTOS.filter((p) => p.division === d.id))}
  </div></section>
  ${seccionFormulario(d, 'Solicita información técnica o presupuesto', 'Envíanos planos, medidas o la descripción de tu proyecto y nuestro equipo técnico te responderá.')}`;
  pagina({ ruta: rutaDiv(d), titulo: d.seo.titulo, descripcion: d.seo.descripcion, tema: d.tema, activo: d.id, cuerpo, ld: [divLD(d), migas([[d.nombre, rutaDiv(d)]]).ld] });
}

function paginaOptimus(d) {
  const cuerpo = `${heroDivision(d)}
  <section class="sec" id="catalogo"><div class="env">
    ${tituloSeccion('Catálogo', 'Modelos de piscinas Optimus', 'Siete tipos de piscina y una categoría adicional. Entra en cada modelo para ver fotos, características y pedir presupuesto.')}
    <div class="rejilla r4 piscinas">${d.secciones.map((s, i) => tarjetaProducto(rutaSec(d, s), s, `<span class="num">${String(i + 1).padStart(2, '0')}</span>`)).join('')}</div>
  </div></section>
  <section class="sec sec-gris"><div class="env">
    ${tituloSeccion('Galería', 'Piscinas instaladas')}
    ${galeriaProyectos(PROYECTOS.filter((p) => p.division === d.id))}
  </div></section>
  ${seccionFormulario(d, 'Pide presupuesto para tu piscina', 'Cuéntanos qué modelo te interesa y dónde quieres instalarla.')}`;
  pagina({ ruta: rutaDiv(d), titulo: d.seo.titulo, descripcion: d.seo.descripcion, tema: d.tema, activo: d.id, cuerpo, ld: [divLD(d), migas([[d.nombre, rutaDiv(d)]]).ld] });
}

function paginasCatalogo(d) {
  const secs = visibles(d);
  for (const s of secs) {
    if (s.productos) {
      const m = migas([[d.nombre, rutaDiv(d)], [s.nombre, rutaSec(d, s)]]);
      const cuerpo = `<div class="ficha" data-tema="${d.tema}"><div class="env">${m.html}</div>
        <section class="env cat-cab revela"><a class="ficha-div" href="${rutaDiv(d)}">${esc(d.nombre)}</a><h1>${esc(s.nombre)}</h1><p class="lead">${esc(s.descripcion)} ${s.provisional ? pendiente('Texto provisional') : ''}</p></section>
        <section class="sec sec-arriba"><div class="env"><div class="rejilla ${s.productos.length > 3 ? 'r4' : 'r2'}">${s.productos.map((p) => tarjetaProducto(rutaProd(d, s, p), p)).join('')}</div></div></section>
        ${ctaBanda(d, '', `¿Qué ${s.nombre.toLowerCase()} necesitas?`, 'Te ayudamos a elegir el tipo adecuado para tu instalación.')}</div>`;
      pagina({ ruta: rutaSec(d, s), titulo: s.seo.titulo, descripcion: s.seo.descripcion, tema: d.tema, activo: d.id, cuerpo, ld: [m.ld] });
      for (const p of s.productos) {
        const her = s.productos.filter((x) => x !== p).map((x) => [rutaProd(d, s, x), x]);
        const f = fichaProducto(d, p, [[d.nombre, rutaDiv(d)], [s.nombre, rutaSec(d, s)], [p.nombre, rutaProd(d, s, p)]], her);
        pagina({ ruta: rutaProd(d, s, p), titulo: p.seo.titulo, descripcion: p.seo.descripcion, tema: d.tema, activo: d.id, imagen: p.imagen, ...f });
      }
    } else {
      const her = secs.filter((x) => x !== s && !x.productos).slice(0, 3).map((x) => [rutaSec(d, x), x]);
      const f = fichaProducto(d, s, [[d.nombre, rutaDiv(d)], [s.nombre, rutaSec(d, s)]], her);
      pagina({ ruta: rutaSec(d, s), titulo: s.seo.titulo, descripcion: s.seo.descripcion, tema: d.tema, activo: d.id, imagen: s.imagen, ...f });
    }
  }
}

function paginaProyectos() {
  const m = migas([['Proyectos', '/proyectos/']]);
  const cuerpo = `<section class="phero"><div class="env">${m.html}<h1>Proyectos realizados</h1><p class="lead">Instalaciones, productos y trabajos de las divisiones de Grupo PID.</p></div></section>
  <section class="sec sec-arriba"><div class="env">
    <div class="filtros" role="group" aria-label="Filtrar por división"><button class="filtro activo" data-filtro="todos" aria-pressed="true">Todos</button>${DIVS.map((d) => `<button class="filtro" data-filtro="${d.id}" data-tema="${d.tema}" aria-pressed="false">${esc(d.nombre)}</button>`).join('')}</div>
    ${galeriaProyectos(PROYECTOS)}
  </div></section>${ctaBanda(null)}`;
  pagina({ ruta: '/proyectos/', titulo: 'Proyectos realizados | Grupo PID', descripcion: 'Galería de proyectos de Grupo PID: instalaciones de PID Agua, estructuras de Pultrusión Canarias y piscinas de Piscinas Optimus.', activo: 'proyectos', cuerpo, ld: [m.ld] });
}

function paginaSobre() {
  const s = site.sobre;
  const m = migas([['Sobre Grupo PID', '/sobre-grupo-pid/']]);
  const cuerpo = `<section class="phero"><div class="env">${m.html}<h1>Sobre Grupo PID</h1><p class="lead">${esc(site.lema)}.</p></div></section>
  <section class="sec"><div class="env dos-col">
    <div class="revela"><p class="eyebrow">Quiénes somos</p><h2>Una empresa, tres divisiones especializadas</h2>
      ${s.historia ? `<p class="lead">${esc(s.historia)}</p>` : huecoPendiente('Historia de la empresa pendiente: origen, trayectoria y equipo.')}
      ${s.mision ? `<p>${esc(s.mision)}</p>` : huecoPendiente('Misión, valores o enfoque de trabajo pendientes.')}
    </div>
    <div class="revela">${foto(s.imagen, 'Instalaciones de Grupo PID', { clase: 'foto-alta' })}</div>
  </div></section>
  <section class="sec sec-gris"><div class="env">${tituloSeccion('Áreas de actividad', 'Lo que hacemos')}${areas()}</div></section>
  <section class="sec"><div class="env">
    ${tituloSeccion('Divisiones', 'Nuestras marcas comerciales')}
    <div class="rejilla r3">${DIVS.map((d) => `<a class="mini-div revela" data-tema="${d.tema}" href="${rutaDiv(d)}">${placa(d, 'placa-m')}<p>${esc(d.resumen)}</p><span class="enlace">Descubrir soluciones${ico('flecha')}</span></a>`).join('')}</div>
  </div></section>
  <section class="sec sec-oscura"><div class="env">${tituloSeccion('Grupo PID en cifras', 'Capacidades')}${cifras()}</div></section>
  ${ctaBanda(null)}`;
  pagina({ ruta: '/sobre-grupo-pid/', titulo: s.seo.titulo, descripcion: s.seo.descripcion, activo: 'sobre', cuerpo, ld: [orgLD(), m.ld] });
}

function paginaContacto() {
  const m = migas([['Contacto', '/contacto/']]);
  const cuerpo = `<section class="phero"><div class="env">${m.html}<h1>Contacto y presupuestos</h1><p class="lead">Elige la división y el producto que te interesa: tu solicitud llegará directamente al equipo correspondiente.</p></div></section>
  <section class="sec sec-arriba"><div class="env form-env">
    <aside class="form-lado revela">
      <h2>Grupo PID</h2>${listaContacto()}
      <div class="lado-divs">${DIVS.map((d) => `<a href="${rutaDiv(d)}" data-tema="${d.tema}">${placa(d, 'placa-s')}</a>`).join('')}</div>
    </aside>
    ${formulario({ intro: 'Los campos con * son obligatorios. Puedes adjuntar planos, fotos o documentos.' })}
  </div></section>`;
  pagina({ ruta: '/contacto/', titulo: 'Contacto y presupuestos | Grupo PID', descripcion: 'Solicita presupuesto o asesoramiento a Grupo PID: PID Agua, Pultrusión Canarias o Piscinas Optimus. Adjunta planos y describe tu proyecto.', activo: 'contacto', cuerpo, ld: [m.ld, orgLD()] });
}

function paginasLegales() {
  const legales = [
    ['aviso-legal', 'Aviso legal', 'Datos identificativos del titular (razón social, CIF, domicilio, registro mercantil), condiciones de uso y propiedad intelectual.'],
    ['privacidad', 'Política de privacidad', 'Responsable del tratamiento, finalidades (atender solicitudes y presupuestos), base legal, plazos de conservación, destinatarios y derechos RGPD.'],
    ['cookies', 'Política de cookies', 'Cookies utilizadas. Sin analítica activada, la web solo usa almacenamiento técnico necesario.'],
  ];
  for (const [slug, t, txt] of legales) {
    const m = migas([[t, `/${slug}/`]]);
    pagina({ ruta: `/${slug}/`, titulo: `${t} | Grupo PID`, descripcion: `${t} de la web de Grupo PID.`, cuerpo: `<section class="phero"><div class="env">${m.html}<h1>${t}</h1></div></section><section class="sec sec-arriba"><div class="env texto-legal">${huecoPendiente('Texto legal pendiente de redactar con los datos reales de la empresa. Debe incluir: ' + txt)}${REV ? '' : '<p>Página en preparación.</p>'}</div></section>`, ld: [m.ld] });
  }
  pagina({ ruta: '/404.html', titulo: 'Página no encontrada | Grupo PID', descripcion: 'La página que buscas no existe.', cuerpo: `<section class="phero error404"><div class="env"><p class="eyebrow">Error 404</p><h1>Página no encontrada</h1><p class="lead">La página que buscas no existe o ha cambiado de dirección.</p><div class="btns">${boton('/', 'Ir al inicio', 'btn btn-grande')}${boton('/contacto/', 'Contactar', 'btn btn-borde')}</div></div></section><section class="sec"><div class="env"><div class="rejilla r3">${DIVS.map((d) => `<a class="mini-div" data-tema="${d.tema}" href="${rutaDiv(d)}">${placa(d, 'placa-m')}<p>${esc(d.resumen)}</p></a>`).join('')}</div></div></section>` });
}

// ───────────────────────── archivos auxiliares ─────────────────────────
function copiar(origen, destino) {
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, e.name), dd = path.join(destino, e.name);
    if (e.isDirectory()) { fs.mkdirSync(dd, { recursive: true }); copiar(o, dd); } else fs.copyFileSync(o, dd);
  }
}

function auxiliares() {
  const base = DOM || 'https://DOMINIO-PENDIENTE';
  const urls = paginas.filter((r) => r !== '/404.html');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${HOY}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length <= 3 ? '0.8' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /enviar.php\n\nSitemap: ${base}/sitemap.xml\n`);
  // Catálogo para el formulario (división → productos)
  const cat = {};
  for (const d of DIVS) {
    const ops = [];
    for (const s of visibles(d)) {
      if (s.productos) s.productos.forEach((p) => ops.push([p.slug, `${s.nombre} · ${p.nombre}`]));
      else ops.push([s.slug, s.nombre]);
    }
    if (d.id === 'pultrusion-canarias') ops.push(['informacion-tecnica', 'Información técnica general']);
    ops.push(['otro', 'Otro / no lo tengo claro']);
    cat[d.id] = ops;
  }
  cat.general = [['consulta-general', 'Consulta general'], ['otro', 'Otro']];
  fs.writeFileSync(path.join(DIST, 'js', 'catalogo.json'), JSON.stringify(cat));
  // Configuración del envío de formularios (PHP)
  const em = site.emailsDestino;
  const conf = JSON.stringify({ destinos: Object.fromEntries(Object.entries(em).filter(([k]) => !k.startsWith('_'))), nombres: Object.fromEntries([...DIVS.map((d) => [d.id, d.nombre]), ['general', 'Grupo PID']]), productos: cat, maxMB: site.formulario.maxArchivosMB, remitente: site.nombre });
  const php = `<?php // GENERADO por src/build.mjs a partir de content/site.json — no editar a mano\nreturn json_decode('${conf.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', true);\n`;
  fs.writeFileSync(path.join(DIST, 'enviar-config.php'), php);
}

// ───────────────────────── construir ─────────────────────────
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
copiar(path.join(RAIZ, 'src', 'static'), DIST);
paginaInicio();
paginaPidAgua(DIVS[0]);
paginaPultrusion(DIVS[1]);
paginaOptimus(DIVS[2]);
DIVS.forEach(paginasCatalogo);
paginaProyectos();
paginaSobre();
paginaContacto();
paginasLegales();
auxiliares();

if (!DOM) avisos.push('Falta "dominio" en content/site.json: sin él no hay canonical ni URLs absolutas en el sitemap.');
if (!Object.entries(site.emailsDestino).some(([k, v]) => !k.startsWith('_') && v)) avisos.push('Falta al menos un correo en "emailsDestino": el formulario no podrá entregar solicitudes.');
if (REV) avisos.push('modoRevision está activado: las etiquetas de contenido pendiente son visibles. Ponlo a false antes de publicar.');
console.log(`✔ ${paginas.length} páginas generadas en dist/`);
avisos.forEach((a) => console.log('  ⚠ ' + a));
