<?php
// Recibe el formulario de presupuesto y lo envía por correo a la división elegida (con adjuntos).
// Los destinatarios salen de content/site.json → emailsDestino (se vuelcan en enviar-config.php al generar la web).
header('Content-Type: application/json; charset=utf-8');
function salir($ok, $error = '', $code = 200) { http_response_code($code); echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') salir(false, 'Método no permitido', 405);
$cfg = require __DIR__ . '/enviar-config.php';
if (!empty($_POST['web'])) salir(true); // trampa antispam: los humanos no la ven

$campo = function ($k, $max = 300) { return trim(mb_substr(str_replace(["\r", "\0"], '', (string)($_POST[$k] ?? '')), 0, $max)); };
$division = $campo('division', 60);
$producto = $campo('producto', 120);
$nombre = $campo('nombre', 100); $apellidos = $campo('apellidos', 150); $empresa = $campo('empresa', 150);
$email = $campo('email', 200); $telefono = $campo('telefono', 40); $mensaje = $campo('mensaje', 6000);

if (!isset($cfg['nombres'][$division])) salir(false, 'Elige una división válida.', 422);
if ($nombre === '' || $apellidos === '' || $telefono === '' || $mensaje === '' || empty($_POST['privacidad'])) salir(false, 'Faltan campos obligatorios.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) salir(false, 'El correo electrónico no es válido.', 422);

$para = $cfg['destinos'][$division] ?? '';
if ($para === '') $para = $cfg['destinos']['general'] ?? '';
if ($para === '') salir(false, 'El formulario aún no tiene un correo de destino configurado.', 503);

$nombreProducto = $producto;
foreach (($cfg['productos'][$division] ?? []) as $op) if ($op[0] === $producto) $nombreProducto = $op[1];

// Adjuntos
$permitidas = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'dwg', 'dxf', 'zip'];
$adjuntos = []; $total = 0;
if (!empty($_FILES['adjuntos']['name'][0])) {
  foreach ($_FILES['adjuntos']['name'] as $i => $n) {
    if ($_FILES['adjuntos']['error'][$i] !== UPLOAD_ERR_OK) salir(false, 'No se pudo subir el archivo ' . $n . '.', 422);
    $ext = strtolower(pathinfo($n, PATHINFO_EXTENSION));
    if (!in_array($ext, $permitidas, true)) salir(false, 'Tipo de archivo no permitido: ' . $n, 422);
    $total += $_FILES['adjuntos']['size'][$i];
    $adjuntos[] = [preg_replace('/[^\w.\- ]/u', '_', $n), $_FILES['adjuntos']['tmp_name'][$i]];
  }
  if ($total > $cfg['maxMB'] * 1048576) salir(false, 'Los archivos superan el tamaño máximo.', 422);
}

$div = $cfg['nombres'][$division];
$asunto = '=?UTF-8?B?' . base64_encode("Solicitud web · $div · $nombreProducto") . '?=';
$cuerpo = "Nueva solicitud desde la web de {$cfg['remitente']}\n\n"
  . "División: $div\nProducto/servicio: $nombreProducto\n\n"
  . "Nombre: $nombre $apellidos\nEmpresa: " . ($empresa ?: '—') . "\nCorreo: $email\nTeléfono: $telefono\n\n"
  . "Descripción del proyecto:\n$mensaje\n\nAdjuntos: " . count($adjuntos) . "\n";

$limite = 'pid_' . bin2hex(random_bytes(12));
$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
$cab = "From: =?UTF-8?B?" . base64_encode($cfg['remitente'] . ' (web)') . "?= <no-responder@$host>\r\n"
  . "Reply-To: $email\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$limite\"\r\n";
$msg = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($cuerpo));
foreach ($adjuntos as [$n, $tmp]) {
  $msg .= "--$limite\r\nContent-Type: application/octet-stream; name=\"$n\"\r\nContent-Disposition: attachment; filename=\"$n\"\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode(file_get_contents($tmp)));
}
$msg .= "--$limite--";

if (!mail($para, $asunto, $msg, $cab)) salir(false, 'El servidor no pudo enviar el correo. Inténtalo más tarde.', 500);
salir(true);
