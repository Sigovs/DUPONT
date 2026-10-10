/* Header: Services dropdown + mobile menu. Uses Select.lenis (core.js) — never its own scroll loop. */
(function () {
  'use strict';
  function init() {
    var drop = document.querySelector('[data-drop]');
    if (drop) {
      var trig = drop.querySelector('.nav__trigger');
      var setOpen = function (open) { drop.classList.toggle('is-open', open); trig.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      trig.addEventListener('click', function () { setOpen(!drop.classList.contains('is-open')); });
      document.addEventListener('click', function (e) { if (!drop.contains(e.target)) setOpen(false); });
      drop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); trig.focus(); } });
      drop.addEventListener('mouseleave', function () { setOpen(false); });
      /* choosing an item closes the menu: drop focus so :focus-within no longer holds it open */
      drop.addEventListener('click', function (e) {
        var a = e.target.closest('.nav__drop a');
        if (!a) return;
        setOpen(false);
        a.blur(); trig.blur();
        drop.classList.add('is-closing');
        setTimeout(function () { drop.classList.remove('is-closing'); }, 400);
      });
    }
    var btn = document.querySelector('[data-menu]'), panel = document.getElementById('mnav');
    if (btn && panel) {
      var setMenu = function (open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
        document.body.style.overflow = open ? 'hidden' : '';
        var l = window.Select && window.Select.lenis; if (l) { open ? l.stop() : l.start(); }
      };
      btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
      panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); btn.focus(); } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
