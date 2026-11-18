<?php
// Reseñas de Google para la portada (Places API (New) · Place Details). La llama js/site.js en cada visita a la portada.
//
// Condiciones de Google: no se pueden guardar reseñas ni valoraciones en el servidor, así que se piden en cada visita.
// Solo se guarda el Place ID (permitido) y un contador diario de consultas para no salir del tramo gratuito.
//
// Clave de la API: archivo resenas-clave.php junto a este (contenido: <?php return 'TU_CLAVE';) o variable de entorno
// GOOGLE_PLACES_API_KEY. La clave NUNCA va en el repositorio (resenas-clave.php está en .gitignore).
// Configuración (Place ID, búsqueda, límite diario): content/site.json → resenas (se vuelca en resenas-config.php al generar la web).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function salir($datos, $code = 200) { http_response_code($code); echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fallo($motivo, $code = 503) { salir(['ok' => false, 'error' => $motivo], $code); }

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') fallo('Método no permitido.', 405);
$cfg = require __DIR__ . '/resenas-config.php';
$clave = getenv('GOOGLE_PLACES_API_KEY');
if (!$clave && is_file(__DIR__ . '/resenas-clave.php')) $clave = require __DIR__ . '/resenas-clave.php';
if (!is_string($clave) || trim($clave) === '') fallo('Falta la clave de la API de Google Places.');
$clave = trim($clave);
if (!function_exists('curl_init')) fallo('El servidor no tiene la extensión cURL de PHP.');

$base = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'grupopid-resenas-' . substr(md5(__DIR__), 0, 8);

/** Cuenta una consulta a Google. Devuelve false si ya se llegó al máximo de hoy. Solo guarda la fecha y un número. */
function contar($base, $max) {
  $f = @fopen($base . '-contador.txt', 'c+');
  if (!$f) return true; // si no se puede llevar la cuenta, no se bloquea la web
  flock($f, LOCK_EX);
  $partes = explode(' ', trim((string)stream_get_contents($f)));
  $hoy = date('Y-m-d');
  $n = (($partes[0] ?? '') === $hoy) ? (int)($partes[1] ?? 0) : 0;
  $ok = $n < $max;
  if ($ok) { ftruncate($f, 0); rewind($f); fwrite($f, $hoy . ' ' . ($n + 1)); fflush($f); }
  flock($f, LOCK_UN);
  fclose($f);
  return $ok;
}

/** Llamada a la API de Places (New). Devuelve [código HTTP, respuesta decodificada]. */
function google($metodo, $url, $clave, $campos, $cuerpo = null) {
  $c = curl_init($url);
  $cab = ['X-Goog-Api-Key: ' . $clave, 'X-Goog-FieldMask: ' . $campos, 'Accept: application/json'];
  if ($cuerpo !== null) { $cab[] = 'Content-Type: application/json'; curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($cuerpo)); }
  curl_setopt_array($c, [CURLOPT_CUSTOMREQUEST => $metodo, CURLOPT_HTTPHEADER => $cab, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4]);
  $r = curl_exec($c);
  $code = (int)curl_getinfo($c, CURLINFO_HTTP_CODE);
  $j = is_string($r) ? json_decode($r, true) : null;
  return [$code, is_array($j) ? $j : []];
}
function errorGoogle($code, $j) { return 'Google respondió con el código ' . $code . (isset($j['error']['message']) ? ': ' . $j['error']['message'] : '.'); }

$max = max(1, (int)($cfg['maxConsultasDia'] ?? 30));
$idioma = preg_replace('/[^a-z\-]/i', '', $cfg['idioma'] ?? 'es');

// 1) Place ID: el de la configuración o, si está vacío, se busca una vez por nombre y se guarda (Google permite guardar el Place ID).
$placeId = trim($cfg['placeId'] ?? '');
if ($placeId === '' && trim($cfg['busqueda'] ?? '') !== '') {
  $guardado = $base . '-placeid.txt';
  $placeId = is_file($guardado) ? trim((string)file_get_contents($guardado)) : '';
  if ($placeId === '') {
    if (!contar($base, $max)) fallo('Se ha alcanzado el límite diario de consultas.');
    [$code, $j] = google('POST', 'https://places.googleapis.com/v1/places:searchText', $clave, 'places.id', ['textQuery' => $cfg['busqueda'], 'languageCode' => $idioma, 'pageSize' => 1]);
    if ($code !== 200) fallo(errorGoogle($code, $j), 502);
    $placeId = $j['places'][0]['id'] ?? '';
    if ($placeId === '') fallo('Google no ha encontrado el negocio con la búsqueda configurada.', 502);
    @file_put_contents($guardado, $placeId);
  }
}
if ($placeId === '') fallo('Falta el Place ID o la búsqueda del negocio en la configuración.');

// 2) Valoración y reseñas, siempre en directo.
if (!contar($base, $max)) fallo('Se ha alcanzado el límite diario de consultas.');
[$code, $p] = google('GET', 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId) . '?languageCode=' . $idioma . '&regionCode=ES', $clave, 'id,displayName,rating,userRatingCount,googleMapsUri,reviews');
if ($code !== 200) fallo(errorGoogle($code, $p), 502);

$resenas = [];
foreach (($p['reviews'] ?? []) as $r) {
  $a = $r['authorAttribution'] ?? [];
  $resenas[] = [
    'autor' => $a['displayName'] ?? '',
    'autorUrl' => $a['uri'] ?? '',
    'foto' => $a['photoUri'] ?? '',
    'estrellas' => (int)($r['rating'] ?? 0),
    'fecha' => $r['relativePublishTimeDescription'] ?? '',
    'texto' => $r['text']['text'] ?? '',
    'traducida' => isset($r['text']['languageCode'], $r['originalText']['languageCode']) && $r['text']['languageCode'] !== $r['originalText']['languageCode'],
    'url' => $r['googleMapsUri'] ?? ($p['googleMapsUri'] ?? ''),
  ];
}
salir([
  'ok' => true,
  'nombre' => $p['displayName']['text'] ?? '',
  'valoracion' => isset($p['rating']) ? (float)$p['rating'] : null,
  'total' => (int)($p['userRatingCount'] ?? 0),
  'url' => $p['googleMapsUri'] ?? '',
  'resenas' => $resenas,
]);
