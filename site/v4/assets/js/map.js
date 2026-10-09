/* =============================================================================
   V4 port of V1 map.js (night map, AD §10). Selection is shared by the map lamps and
   the three large city buttons; default Southern California. Arrow keys move between
   the city buttons. The lamps are pointer shortcuts (tabindex -1): keyboard uses the cities.
   ============================================================================= */
(function () {
  'use strict';
  var map = document.querySelector('[data-usmap]');
  if (!map) return;
  var all = [].slice.call(document.querySelectorAll('[data-lamp]'));
  var cities = [].slice.call(document.querySelectorAll('.city[data-lamp]'));
  var panels = [].slice.call(document.querySelectorAll('[data-panel]'));

  function select(key) {
    all.forEach(function (l) { l.setAttribute('aria-pressed', l.getAttribute('data-lamp') === key ? 'true' : 'false'); });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
  }
  all.forEach(function (l) { l.addEventListener('click', function () { select(l.getAttribute('data-lamp')); }); });
  cities.forEach(function (c, i) {
    c.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = cities[(i + d + cities.length) % cities.length];
      n.focus(); select(n.getAttribute('data-lamp'));
    });
  });
  window.V4 = window.V4 || {}; window.V4.mapSelect = select;
})();
