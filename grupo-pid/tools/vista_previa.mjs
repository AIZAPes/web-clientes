// Copia dist/ a otra carpeta adaptada a una subruta (p. ej. GitHub Pages: /web-clientes/grupo-pid)
// para enseñar la web al cliente antes de tener dominio. No toca dist/.
// Uso: node tools/vista_previa.mjs <carpeta-destino> <base>
//   node tools/vista_previa.mjs ../../gh-pages/grupo-pid /web-clientes/grupo-pid
// La copia lleva noindex (no debe salir en Google) y sin PHP (GitHub Pages no lo ejecuta:
// el formulario y las reseñas solo funcionan en el hosting definitivo).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const [destino, baseArg] = process.argv.slice(2);
if (!destino || !baseArg) { console.error('Uso: node tools/vista_previa.mjs <carpeta-destino> <base>'); process.exit(1); }
const BASE = '/' + baseArg.replace(/^\/+|\/+$/g, '');

const html = (t) => t
  .replace(/(\s[\w-]+=")\/(?!\/)/g, `$1${BASE}/`) // cualquier atributo con ruta absoluta (href, src, data-src, action…)
  .replace(/(\ssrcset=")([^"]*)"/g, (_, a, v) => a + v.replace(/(^|,\s*)\/(?!\/)/g, `$1${BASE}/`) + '"')
  .replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}/`)
  .replace(/<head>/i, '<head>\n<meta name="robots" content="noindex, nofollow">');
const css = (t) => t.replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}/`);
const js = (t) => t.replace(/(['"])\/(js|img|docs|css)\//g, `$1${BASE}/$2/`);

function copiar(o, d) {
  fs.mkdirSync(d, { recursive: true });
  for (const e of fs.readdirSync(o, { withFileTypes: true })) {
    const a = path.join(o, e.name), b = path.join(d, e.name);
    if (e.isDirectory()) { copiar(a, b); continue; }
    if (/\.php$/i.test(e.name) || e.name === '.htaccess') continue;
    if (e.name.endsWith('.html')) fs.writeFileSync(b, html(fs.readFileSync(a, 'utf8')));
    else if (e.name.endsWith('.css')) fs.writeFileSync(b, css(fs.readFileSync(a, 'utf8')));
    else if (e.name.endsWith('.js')) fs.writeFileSync(b, js(fs.readFileSync(a, 'utf8')));
    else fs.copyFileSync(a, b);
  }
}

fs.rmSync(destino, { recursive: true, force: true });
copiar(DIST, destino);
fs.writeFileSync(path.join(destino, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Vista previa en ${destino} (base ${BASE})`);
