// Category filter for /beneficios. The list is complete without it: the controls stay
// hidden until this runs, so a blocked script loses the filter, never a benefit.
(function () {
  var root = document.querySelector('[data-benefit-filter]');
  var list = document.querySelector('[data-benefit-list]');
  var status = document.querySelector('[data-benefit-status]');
  if (!root || !list) return;

  var buttons = root.querySelectorAll('button[data-tag]');
  var items = list.querySelectorAll('[data-tag]');

  function apply(tag) {
    var shown = 0;
    items.forEach(function (item) {
      var match = tag === '' || item.getAttribute('data-tag') === tag;
      item.hidden = !match;
      if (match) shown += 1;
    });
    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-tag') === tag));
    });
    if (status) status.textContent = shown + (shown === 1 ? ' beneficio' : ' beneficios');
  }

  root.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-tag]');
    if (button) apply(button.getAttribute('data-tag'));
  });

  root.hidden = false;
})();
