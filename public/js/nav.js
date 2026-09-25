// Served as a static file rather than an inline <script> so it survives the strict
// script-src 'self' policy in public/_headers. Inlined, CSP blocks it and the mobile
// menu silently stops opening in production. Loaded with `defer`, so the DOM is ready.
(function () {
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-mobile');

  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', function () {
    setOpen(menu.classList.contains('hidden'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || menu.classList.contains('hidden')) return;
    setOpen(false);
    toggle.focus();
  });
})();
