// Served as a static file rather than an inline <script> so it survives the strict
// script-src 'self' policy in public/_headers. Inlined, CSP blocks it and the mobile
// menu silently stops opening in production.
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-mobile');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
});
