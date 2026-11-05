/* V5 shell (2026-11-05): header icon buttons, drawer menu, theme switch, search, placeholders.
   The duPont REGISTRY guidelines: logo centred, menu + search left, theme + account right; menu = 240px drawer. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var lenis = function (on) { if (window.V4 && V4.lenis) { if (on) V4.lenis.start(); else V4.lenis.stop(); } };

  /* toast for things the prototype doesn't have yet */
  var toast = $('[data-v5-toast]'), tt;
  function say(m) { if (!toast) return; toast.textContent = m; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2800); }

  /* theme: dark by default (Alex, 2026-11-05), remembered per browser */
  var tB = $('[data-hd-theme]');
  function paintTheme() { var d = root.dataset.theme !== 'light'; if (tB) tB.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); }
  if (tB) tB.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('dr-theme', root.dataset.theme); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  /* drawer menu */
  var dr = $('[data-hd-drawer]'), mB = $('[data-hd-menu]'), last = null;
  function drFocusables() { return $$('a[href], button:not([disabled])', dr).filter(function (el) { return el.offsetParent !== null; }); }
  function drOpen() {
    last = document.activeElement; dr.hidden = false; dr.offsetWidth; dr.classList.add('is-open');
    root.classList.add('dr-open'); mB.setAttribute('aria-expanded', 'true'); lenis(false);
    setTimeout(function () { var f = $('.dr__x', dr); if (f) f.focus(); }, 40);
  }
  function drClose() {
    if (dr.hidden) return; dr.classList.remove('is-open'); root.classList.remove('dr-open'); mB.setAttribute('aria-expanded', 'false'); lenis(true);
    setTimeout(function () { if (!dr.classList.contains('is-open')) dr.hidden = true; }, 360);
    if (last) last.focus({ preventScroll: true });
  }
  if (dr && mB) {
    mB.addEventListener('click', drOpen);
    dr.addEventListener('click', function (e) {
      if (e.target.closest('[data-hd-close]')) { drClose(); return; }
      var x = e.target.closest('[data-dr-exp]');
      if (x) { var o = x.getAttribute('aria-expanded') !== 'true'; x.setAttribute('aria-expanded', o ? 'true' : 'false'); $('#' + x.getAttribute('aria-controls')).hidden = !o; x.parentNode.classList.toggle('is-open', o); return; }
      if (e.target.closest('a[href]')) setTimeout(drClose, 0);
    });
    dr.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { drClose(); return; }
      if (e.key !== 'Tab') return;
      var f = drFocusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* search: a field under the header → the inventory, filtered by keyword */
  var sB = $('[data-hd-search]'), sF = $('[data-hd-searchform]');
  function sOpen(o) { sF.hidden = !o; sB.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) setTimeout(function () { $('input', sF).focus(); }, 30); }
  if (sB && sF) {
    sB.addEventListener('click', function () { sOpen(sF.hidden); });
    sF.addEventListener('submit', function (e) {
      e.preventDefault(); var q = $('input', sF).value.trim();
      location.href = 'inventory.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sF.hidden) { sOpen(false); sB.focus(); } });
    document.addEventListener('click', function (e) { if (!sF.hidden && !e.target.closest('[data-hd-searchform], [data-hd-search]')) sOpen(false); });
  }

  /* account, subscribe, and menu items for pages that don't exist yet */
  $$('[data-hd-account]').forEach(function (b) { b.addEventListener('click', function () { say('Log in / Sign up — duPont REGISTRY accounts connect here (prototype).'); }); });
  var sub = $('[data-v5-subscribe]');
  if (sub) sub.addEventListener('submit', function (e) {
    e.preventDefault(); var em = $('input', sub), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    em.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok) { em.focus(); return; }
    say('Thanks — new listings would go to ' + em.value.trim() + ' (prototype, nothing sent).'); em.value = '';
  });
  var SOON = { events: 'Events', news: 'News', privacy: 'Privacy Policy', terms: 'Terms and Conditions', insurance: 'Insurance', service: 'Service', ppf: 'Paint Protection', finance: 'Finance' };
  window.addEventListener('click', function (e) {   // window capture runs before the preview guard on document
    var a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var id = a.getAttribute('href').split('#')[1]; if (!SOON[id] || document.getElementById(id)) return;
    e.preventDefault(); e.stopImmediatePropagation(); say(SOON[id] + ' — page to come.');
  }, true);
})();
