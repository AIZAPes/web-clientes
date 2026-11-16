// Servidor local de vista previa: node tools/servir.mjs [puerto]  → sirve dist/ como lo haría Apache.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (req.method === 'POST') { res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: false, error: 'Vista previa local: el envío funciona solo en el hosting con PHP.' })); }
  let f = path.join(DIST, url);
  if (!f.startsWith(DIST)) f = DIST;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }); return res.end(); }
    f = path.join(f, 'index.html');
  }
  if (!fs.existsSync(f) || f.endsWith('.php')) { res.writeHead(404, { 'Content-Type': tipos['.html'] }); return fs.createReadStream(path.join(DIST, '404.html')).pipe(res); }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(+(process.argv[2] || 5180), () => console.log('Grupo PID en http://localhost:' + (process.argv[2] || 5180)));
