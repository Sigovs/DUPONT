/* =============================================================================
   V4 chrome — shared by index.html and inventory.html
   1. stage geometry  (--u, --sl, --st, --vh in px; the 1920×1080 stage, contained)
   2. Lenis           (DNA90: every page; off under reduced motion; one loop on gsap.ticker)
   3. header ink      (per scene under the header: data-ink dark | light | split)
   4. Services dropdown + mobile menu  (ported from V1 site.js)
   5. anchor navigation (pinned scenes register their own scroll targets in V4.targets)
   ============================================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var V4 = window.V4 = window.V4 || {};
  V4.targets = V4.targets || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ 1. geometry */
  var geo = V4.geo = { u: 1, sl: 0, st: 0, vw: 1920, vh: 1080 };
  function measure() {
    var vw = root.clientWidth, vh = window.innerHeight;
    var u = Math.min(vw / 1920, vh / 1080);
    geo.u = u; geo.vw = vw; geo.vh = vh;
    geo.sl = (vw - 1920 * u) / 2; geo.st = (vh - 1080 * u) / 2;
    var s = root.style;
    s.setProperty('--u', u + 'px');
    s.setProperty('--sl', geo.sl + 'px');
    s.setProperty('--st', geo.st + 'px');
    s.setProperty('--vh', vh + 'px');
  }
  measure();
  var lastW = root.clientWidth, lastH = window.innerHeight;
  window.addEventListener('resize', function () {
    // mobile URL-bar height changes are not geometry changes (G8)
    var w = root.clientWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 120 && w < 1280) return;
    lastW = w; lastH = h;
    measure();
  });

  /* --------------------------------------------------------------- 2. Lenis */
  V4.lenis = null;
  if (!reduce.matches && window.Lenis) {
    var lenis = V4.lenis = new window.Lenis({ autoRaf: !window.gsap, anchors: false, lerp: 0.1, wheelMultiplier: 0.9, allowNestedScroll: true });
    if (window.gsap) {
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    }
  }
  V4.scrollTo = function (y, immediate) {
    y = Math.max(0, Math.round(y));
    if (V4.lenis) { V4.lenis.resize(); V4.lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.4, force: true }); }
    else window.scrollTo({ top: y, behavior: immediate || reduce.matches ? 'auto' : 'smooth' });
  };

  /* ----------------------------------------------------------- 3. header ink */
  var hdr = document.querySelector('[data-hdr]');
  var scenes = [].slice.call(document.querySelectorAll('[data-scene]'));
  var approach = document.querySelector('[data-approach]');
  var inkTick = false;
  function ink() {
    inkTick = false;
    if (!hdr) return;
    var probe = Math.max(32, 64 * geo.u), val = 'dark';   // the logo's centre line: ink flips as a sheet edge crosses it
    hdr.dataset.ground = '';
    for (var i = scenes.length - 1; i >= 0; i--) {   // later scenes sit on top (overlap seams)
      var b = scenes[i].getBoundingClientRect();
      if (b.top <= probe && b.bottom > probe) {
        val = (approach && approach.contains(scenes[i]) && approach.dataset.inkLive) || scenes[i].dataset.ink || 'dark';
        hdr.dataset.ground = approach && approach.contains(scenes[i]) ? '' : scenes[i].dataset.scene;
        break;
      }
    }
    if (document.body.classList.contains('srp-page') && val === 'dark') val = 'dark';
    hdr.dataset.ink = val;
  }
  V4.ink = ink;
  window.addEventListener('scroll', function () { if (!inkTick) { inkTick = true; requestAnimationFrame(ink); } }, { passive: true });
  ink();

  /* ------------------------------------------------- 4. dropdown + mobile menu */
  var subBtn = hdr && hdr.querySelector('[data-sub-toggle]');
  var sub = subBtn ? document.getElementById(subBtn.getAttribute('aria-controls')) : null;
  var hoverTimer = 0, hoverAt = 0;
  function subOpen() { return subBtn && subBtn.getAttribute('aria-expanded') === 'true'; }
  function setSub(open, focusFirst) {
    if (!sub) return;
    subBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sub.hidden = !open;
    if (open && focusFirst) sub.querySelector('a').focus();
  }
  if (subBtn) {
    subBtn.addEventListener('click', function () {
      if (subOpen() && Date.now() - hoverAt < 600) return;   // a click right after hover-open confirms it
      setSub(!subOpen(), false);
    });
    subBtn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); setSub(true, true); } });
    sub.addEventListener('keydown', function (e) {
      var links = [].slice.call(sub.querySelectorAll('a')), i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    });
    var li = subBtn.parentElement;
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      li.addEventListener('mouseenter', function () { clearTimeout(hoverTimer); if (!subOpen()) hoverAt = Date.now(); setSub(true); });
      li.addEventListener('mouseleave', function () { hoverTimer = setTimeout(function () { setSub(false); }, 180); });
    }
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) setSub(false); });
    sub.addEventListener('click', function (e) { if (e.target.closest('a')) setSub(false); });
    document.addEventListener('click', function (e) { if (subOpen() && !li.contains(e.target)) setSub(false); });
  }

  var menuBtn = hdr && hdr.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open, keepFocus) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
    root.classList.toggle('menu-open', open);
    if (V4.lenis) { if (open) V4.lenis.stop(); else V4.lenis.start(); }
    if (open) menu.querySelector('a').focus(); else if (!keepFocus) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = [menuBtn].concat([].slice.call(menu.querySelectorAll('a')));
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    menuBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !menu.hidden && !e.shiftKey) { e.preventDefault(); menu.querySelector('a').focus(); }
    });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', function (m) { if (m.matches && !menu.hidden) setMenu(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (subOpen()) { setSub(false); subBtn.focus(); }
    if (menu && !menu.hidden) setMenu(false);
  });

  /* ------------------------------------------------------ 5. anchor navigation */
  function targetY(id) {
    if (typeof V4.targets[id] === 'function') return V4.targets[id]();
    var el = document.getElementById(id);
    if (!el) return null;
    var off = window.innerWidth < 1280 ? 64 : 0;
    return el.getBoundingClientRect().top + window.scrollY - off;
  }
  V4.go = function (id, immediate) {
    var y = targetY(id);
    if (y == null) return false;
    V4.scrollTo(y, immediate);
    var el = document.getElementById(id);
    if (el) {   // move focus for keyboard and screen-reader users without a second scroll
      var h = el.matches('h1,h2,h3') ? el : el.querySelector('h1,h2,h3');
      var f = h || el;
      if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1');
      setTimeout(function () { f.focus({ preventScroll: true }); }, immediate ? 0 : 900);
    }
    return true;
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var id = decodeURIComponent(url.hash.slice(1));
    if (id === 'main') return;
    if (id === 'top') { e.preventDefault(); V4.scrollTo(0); history.replaceState(null, '', location.pathname); return; }
    if (menu && !menu.hidden) setMenu(false, true);
    if (V4.go(id)) { e.preventDefault(); history.replaceState(null, '', '#' + id); }
  });
})();
