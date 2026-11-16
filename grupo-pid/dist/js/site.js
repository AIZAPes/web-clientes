// Grupo PID — interacción mínima: menú, desplegables, animaciones, filtros, visor y formulario.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Cabecera con sombra al hacer scroll
  var cab = $('#cabecera');
  var alScroll = function () { cab && cab.classList.toggle('sombra', window.scrollY > 8); };
  window.addEventListener('scroll', alScroll, { passive: true }); alScroll();

  // Menú móvil
  var menuBtn = $('#menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var abierto = document.body.classList.toggle('menu-abierto');
    menuBtn.setAttribute('aria-expanded', abierto);
    menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  // Desplegables (clic en la flecha; en escritorio también se abren al pasar el ratón)
  $$('.tiene-sub').forEach(function (li) {
    var b = $('.sub-btn', li);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !li.classList.contains('abierto');
      $$('.tiene-sub.abierto').forEach(function (o) { o.classList.remove('abierto'); $('.sub-btn', o).setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('abierto', abrir);
      b.setAttribute('aria-expanded', abrir);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.tiene-sub')) $$('.tiene-sub.abierto').forEach(function (o) { o.classList.remove('abierto'); $('.sub-btn', o).setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.tiene-sub.abierto').forEach(function (o) { o.classList.remove('abierto'); });
    cerrarVisor();
    if (document.body.classList.contains('menu-abierto')) menuBtn.click();
  });

  // Animaciones de entrada
  var rev = $$('.revela');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('visto'); });

  // Filtro de proyectos
  var filtros = $$('.filtro');
  filtros.forEach(function (f) {
    f.addEventListener('click', function () {
      var v = f.getAttribute('data-filtro');
      filtros.forEach(function (x) { var on = x === f; x.classList.toggle('activo', on); x.setAttribute('aria-pressed', on); });
      $$('.proy').forEach(function (p) { p.hidden = v !== 'todos' && p.getAttribute('data-division') !== v; if (!p.hidden) p.classList.add('visto'); });
    });
  });

  // Visor de imágenes
  var visor = $('#visor');
  function cerrarVisor() { if (visor && !visor.hidden) { visor.hidden = true; document.body.style.overflow = ''; } }
  $$('[data-src]').forEach(function (b) {
    b.addEventListener('click', function () {
      var img = $('img', visor); img.src = b.getAttribute('data-src'); img.alt = b.getAttribute('data-alt') || '';
      visor.hidden = false; document.body.style.overflow = 'hidden'; $('.visor-cerrar', visor).focus();
    });
  });
  if (visor) visor.addEventListener('click', function (e) { if (e.target === visor || e.target.closest('.visor-cerrar')) cerrarVisor(); });

  // Formulario de presupuesto
  var form = $('#formulario');
  if (!form) return;
  var selDiv = form.elements.division, selProd = form.elements.producto;
  var qs = new URLSearchParams(location.search);
  var preDiv = qs.get('division') || form.getAttribute('data-division');
  var preProd = qs.get('producto') || form.getAttribute('data-producto');
  var catalogo = {};

  function rellenarProductos(div, elegido) {
    selProd.innerHTML = '';
    var ops = catalogo[div];
    if (!ops) { selProd.disabled = true; selProd.add(new Option('Primero elige una división', '')); return; }
    selProd.disabled = false;
    selProd.add(new Option('Selecciona un producto o servicio', ''));
    ops.forEach(function (o) { selProd.add(new Option(o[1], o[0])); });
    if (elegido) selProd.value = elegido;
  }
  selDiv.addEventListener('change', function () {
    rellenarProductos(selDiv.value);
    var tema = { 'pid-agua': 'agua', 'pultrusion-canarias': 'pultrusion', 'piscinas-optimus': 'optimus' }[selDiv.value];
    if (tema) form.setAttribute('data-tema', tema); else form.removeAttribute('data-tema');
  });
  fetch('/js/catalogo.json').then(function (r) { return r.json(); }).then(function (c) {
    catalogo = c;
    if (preDiv && catalogo[preDiv]) { selDiv.value = preDiv; selDiv.dispatchEvent(new Event('change')); rellenarProductos(preDiv, preProd); }
  }).catch(function () { selProd.disabled = false; selProd.add(new Option('Otro', 'otro')); });

  var inputArch = form.querySelector('input[type=file]'), lista = form.querySelector('.archivos-lista');
  var maxMB = +inputArch.getAttribute('data-max') || 10;
  function totalMB() { return Array.prototype.reduce.call(inputArch.files, function (s, f) { return s + f.size; }, 0) / 1048576; }
  inputArch.addEventListener('change', function () {
    var n = inputArch.files.length, mb = totalMB();
    lista.textContent = n ? n + (n === 1 ? ' archivo' : ' archivos') + ' · ' + mb.toFixed(1) + ' MB' + (mb > maxMB ? ' — supera el máximo de ' + maxMB + ' MB' : '') : '';
  });

  var estado = form.querySelector('.form-estado');
  function msg(t, tipo) { estado.textContent = t; estado.className = 'form-estado ' + (tipo || ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var malos = $$('[required]', form).filter(function (c) { var ok = c.type === 'checkbox' ? c.checked : c.value.trim() && c.checkValidity(); c.classList.toggle('invalido', !ok); return !ok; });
    if (malos.length) { msg('Revisa los campos marcados.', 'error'); malos[0].focus(); return; }
    if (totalMB() > maxMB) { msg('Los archivos superan el máximo de ' + maxMB + ' MB.', 'error'); return; }
    var btn = form.querySelector('[type=submit]'); btn.disabled = true; msg('Enviando…');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'error'); }); })
      .then(function () { form.reset(); rellenarProductos(''); lista.textContent = ''; msg('¡Gracias! Hemos recibido tu solicitud y te responderemos lo antes posible.', 'ok'); })
      .catch(function (err) { msg(err.message && err.message !== 'error' && err.message !== 'Failed to fetch' ? err.message : 'No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.', 'error'); })
      .then(function () { btn.disabled = false; });
  });
})();
