/* Shared by every page: smooth scroll, in-page anchors, preview link guard, data loading. */
(function () {
  'use strict';
  var root = document.documentElement, Site = window.Site;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- preview guard: see config.externalLinks */
  document.addEventListener('click', function (e) {
    if (Site.config.externalLinks) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.hasAttribute('data-external-ok')) return;
    var url = new URL(a.getAttribute('href'), location.href);
    var same = url.origin === location.origin && url.pathname === location.pathname && url.search === location.search;
    if (same && url.hash) {
      var id = decodeURIComponent(url.hash.slice(1));
      if (id === 'top' || document.getElementById(id)) return;
      e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    if (url.origin === location.origin && !same && /^(|[\w-]+\.html)$/.test(url.pathname.split('/').pop())) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (same) Site.scrollTo(0);
  }, true);

  /* ---- Lenis: not constructed under reduced motion. Nested scrollers carry data-lenis-prevent. */
  Site.lenis = !reduce.matches && window.Lenis ? new window.Lenis({ autoRaf: true, anchors: false, lerp: 0.1, wheelMultiplier: 0.9, allowNestedScroll: true }) : null;
  Site.scrollTo = function (y, immediate) {
    y = Math.max(0, Math.round(y));
    if (Site.lenis) { Site.lenis.resize(); Site.lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.4, force: true }); }
    else window.scrollTo({ top: y, behavior: immediate || reduce.matches ? 'auto' : 'smooth' });
  };
  function targetY(el) {
    var off = parseFloat(getComputedStyle(el).scrollMarginTop) || parseFloat(getComputedStyle(root).getPropertyValue('--hd-h')) || 0;
    return el.getBoundingClientRect().top + window.scrollY - off;
  }
  Site.go = function (id, immediate) {
    var el = document.getElementById(id); if (!el) return false;
    Site.scrollTo(targetY(el), immediate);
    var f = (el.matches('h1,h2,h3') ? el : el.querySelector('h1,h2,h3')) || el;
    if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1');
    setTimeout(function () { f.focus({ preventScroll: true }); }, immediate ? 0 : 900);
    return true;
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var id = decodeURIComponent(url.hash.slice(1));
    if (id === 'main') return;
    if (id === 'top') { e.preventDefault(); Site.scrollTo(0); history.replaceState(null, '', location.pathname); return; }
    if (Site.go(id)) { e.preventDefault(); history.replaceState(null, '', '#' + id); }
  });

  /* ---- data: one request per page. Site.ready(fn) runs fn(data) when it lands. */
  var data = null;
  var load = fetch(Site.config.dataUrl).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) { data = d; return d; });
  Site.room = function (key) { return data.showrooms[key]; };
  Site.ready = function (ok, fail) { load.then(function (d) { ok(d); document.dispatchEvent(new CustomEvent('site:data')); }, fail || function () {}); };

  /* ---- a link to a section lands right even though the cars arrive after the first paint */
  document.addEventListener('site:data', function () {
    var id = decodeURIComponent(location.hash.slice(1));
    if (id && id !== 'top' && id !== 'main' && document.getElementById(id)) requestAnimationFrame(function () { Site.go(id, true); });
  });

  /* ---- integration hook: every form / account action announces itself here */
  Site.emit = function (name, detail) { document.dispatchEvent(new CustomEvent('site:' + name, { detail: detail })); };
})();

/* Header: theme, drawer menu, search. Footer: subscribe. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var lenis = function (on) { if (Site.lenis) { if (on) Site.lenis.start(); else Site.lenis.stop(); } };
  var toast = $('[data-toast]'), tt;
  function say(m) { if (!toast) return; toast.textContent = m; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2800); }
  var tB = $('[data-hd-theme]');
  function paintTheme() { var d = root.dataset.theme !== 'light'; if (tB) tB.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); }
  if (tB) tB.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('dr-theme', root.dataset.theme); } catch (e) {}
    paintTheme();
  });
  paintTheme();
  var dr = $('[data-hd-drawer]'), mB = $('[data-hd-menu]'), last = null;
  function drFocusables() { return $$('a[href], button:not([disabled])', dr).filter(function (el) { return el.offsetParent !== null; }); }
  /* a group opens and closes by height, so the items below glide instead of jumping */
  function sub(ul, open) {
    var from = ul.hidden ? 0 : ul.getBoundingClientRect().height, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ul.an) { ul.an.cancel(); ul.an = null; }
    ul.hidden = !open; if (still || !ul.animate) return;
    ul.hidden = false; ul.style.overflow = 'hidden';
    var full = ul.scrollHeight, cs = getComputedStyle(ul), mt = cs.marginTop, mb = cs.marginBottom, shut = from < 2 ? '0px' : null;
    var a = { height: from + 'px', marginTop: open && shut ? '0px' : mt, marginBottom: open && shut ? '0px' : mb, opacity: open ? (from < 2 ? 0 : .6) : 1 };
    var b = { height: (open ? full : 0) + 'px', marginTop: open ? mt : '0px', marginBottom: open ? mb : '0px', opacity: open ? 1 : 0 };
    ul.an = ul.animate([a, b], { duration: open ? 460 : 380, easing: 'cubic-bezier(.22, .7, .2, 1)' });
    ul.an.onfinish = function () { ul.style.overflow = ''; ul.hidden = !open; ul.an = null; };
  }
  function drOpen() {
    last = document.activeElement; dr.hidden = false; dr.offsetWidth; dr.classList.add('is-open');
    root.classList.add('dr-open'); mB.setAttribute('aria-expanded', 'true'); lenis(false);
    setTimeout(function () { var f = $('.drawer__x', dr); if (f) f.focus(); }, 40);
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
      if (x) { var o = x.getAttribute('aria-expanded') !== 'true'; x.setAttribute('aria-expanded', o ? 'true' : 'false'); sub($('#' + x.getAttribute('aria-controls')), o); x.parentNode.classList.toggle('is-open', o); return; }
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
  $$('[data-hd-account]').forEach(function (b) { b.addEventListener('click', function () { Site.emit('account'); say('Log in / Sign up — duPont REGISTRY accounts connect here (prototype).'); }); });
  var sb = $('[data-subscribe]');
  if (sb) sb.addEventListener('submit', function (e) {
    e.preventDefault(); var em = $('input', sb), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    em.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok) { em.focus(); return; }
    Site.emit('subscribe', { email: em.value.trim() });
    say('Thanks — new listings would go to ' + em.value.trim() + ' (prototype, nothing sent).'); em.value = '';
  });
  var SOON = { privacy: 'Privacy Policy', terms: 'Terms and Conditions' };
  window.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var id = a.getAttribute('href').split('#')[1]; if (!SOON[id] || document.getElementById(id)) return;
    e.preventDefault(); e.stopImmediatePropagation(); say(SOON[id] + ' — page to come.');
  }, true);
})();

/* Car card, saved cars, section entrances. */
(function () {
  'use strict';
  var KEY = 'sel-saved';
  
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  Site.arr = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2.67l-.94.94 3.72 3.72H2.67v1.34h8.11l-3.72 3.72.94.94L13.33 8z"/></svg>';
  Site.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  Site.money = function (p) { return p ? '$' + p.toLocaleString('en-US') : 'Price on request'; };
  Site.saved = function () { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  Site.card = function (c, i, sizes) {
    var e = Site.esc, a = c.img[1], b = c.img[2];
    var spec = [c.miles != null ? c.miles.toLocaleString('en-US') + ' miles' : '', (c.ext || '').split(',')[0], /manual/i.test(c.trans || '') ? 'Manual' : c.trans].filter(Boolean).join(' · ');
    sizes = sizes || '(min-width: 1280px) 24vw, (min-width: 760px) 44vw, 92vw';
    function im(p, alt) { return '<img src="' + p + '-640.webp" srcset="' + p + '-640.webp 640w, ' + p + '-1200.webp 1200w" sizes="' + sizes + '" width="640" height="427" alt="' + alt + '" loading="lazy" decoding="async" draggable="false">'; }
    return '<li class="car-card tile" style="--i:' + (i || 0) + '"><a class="car-card__a" href="car.html?id=' + c.id + '"><span class="car-card__ph">' + im(a, e(c.title)) + im(b, '') + '</span>' +
      '<span class="car-card__room">' + Site.room(c.loc).short + '</span><span class="car-card__t">' + e(c.title) + '</span><span class="car-card__p">' + Site.money(c.price) + '</span>' +
      '<span class="car-card__s">' + e(spec) + (c.drive ? ' ·<br>' + e(c.drive) : '') + '</span><span class="car-card__go">View This Car</span></a>' +
      '<button class="car-card__save" type="button" data-save="' + c.id + '" aria-pressed="' + (Site.saved().indexOf(c.id) > -1) + '" aria-label="Save the ' + e(c.title) + '">' + HEART + '</button></li>';
  };
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-save]'); if (!b) return;
    ev.preventDefault();
    var l = Site.saved(), id = b.dataset.save, i = l.indexOf(id), on = i < 0;
    if (on) l.push(id); else l.splice(i, 1);
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {}
    [].forEach.call(document.querySelectorAll('[data-save="' + id + '"]'), function (x) { x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    document.dispatchEvent(new CustomEvent('sel:saved', { detail: { id: id, on: on } }));
  });
  document.addEventListener('DOMContentLoaded', function () {
    var all = [].slice.call(document.querySelectorAll('[data-in]'));
    if (!('IntersectionObserver' in window)) { all.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px', threshold: .02 });
    // the page is shorter until the cars land: start watching once its real length is known
    var watch = function () { all.forEach(function (el) { io.observe(el); }); };
    Site.ready(watch, watch);
  });
})();
