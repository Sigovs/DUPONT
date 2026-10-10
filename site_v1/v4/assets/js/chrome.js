/* =============================================================================
   V4 chrome — shared by index.html and inventory.html
   1. stage geometry  (--u, --sl, --st, --vh in px; the 1920×1080 stage, contained)
   2. Lenis           (DNA90: every page; off under reduced motion; one loop on gsap.ticker)
   3. header ink      (per scene under the header: data-ink dark | light | split)
   4. Services dropdown + mobile menu  (ported from V1 site.js)
   5. anchor navigation (pinned scenes register their own scroll targets in V4.targets)
   ============================================================================= */
(function () {
  /* HOME ONLY (Alex, 2026-10-09): for now the prototype is the homepage alone — no link leaves it (SRP, VDP, dealer
     pages, Instagram, maps, phone). Buttons keep their look; in-page anchors still scroll.
     window.V4.HOME_ONLY = false undoes it. */
  (window.V4 = window.V4 || {}).HOME_ONLY = true;
  document.addEventListener('click', function (e) {
    var W = window.V4 || {}; if (!W.HOME_ONLY) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var url = new URL(a.getAttribute('href'), location.href);
    var samePage = url.origin === location.origin && url.pathname === location.pathname;
    if (samePage && url.hash) return;                                   // #locations, index.html#services … scroll as before
    e.preventDefault(); e.stopImmediatePropagation();
    if (samePage) { if (W.scrollTo) W.scrollTo(0); else window.scrollTo(0, 0); }   // the logo: back to the top
  }, true);

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
    hdr.classList.toggle('is-scrolled', window.scrollY > 4);   // fix3: the hairline shows only over scrolled content
  }
  V4.ink = ink;
  window.addEventListener('scroll', function () { if (!inkTick) { inkTick = true; requestAnimationFrame(ink); } }, { passive: true });
  ink();

  /* header policy: visible and still through every pinned scene (they are composed with a free nav band).
     It retracts on scroll-down only where content flows under it — the footer, and the inventory page —
     and returns on any scroll up or keyboard focus (CSS :focus-within). The Approach timeline moves the
     logo and nav inside it, so .hdr's own transform belongs to this rule alone. */
  var lastY = window.scrollY, hidT = false, srp = document.body.classList.contains('srp-page');
  var foot = document.querySelector('[data-scene="foot"]');
  function inFlow() {
    if (srp) return window.scrollY > window.innerHeight * 0.6;
    return !!foot && foot.getBoundingClientRect().top < window.innerHeight * 0.5;
  }
  function hideTick() {
    hidT = false;
    var y = window.scrollY, d = y - lastY;
    if (Math.abs(d) < 6) return;
    var hide = d > 0 && inFlow() && !root.classList.contains('menu-open') && !(subBtn && subBtn.getAttribute('aria-expanded') === 'true');
    if (hdr) hdr.classList.toggle('is-away', hide);
    lastY = y;
  }
  window.addEventListener('scroll', function () { if (!hidT) { hidT = true; requestAnimationFrame(hideTick); } }, { passive: true });

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

  /* ------------------------------------------- Collection: make → photograph */
  (function () {
    var swap = document.querySelector('[data-col-swap]'); if (!swap) return;
    var list = document.querySelector('.col__marques'), z = 1, cur = null, base = null;   // base = the make the scroll has selected
    var imgs = {}; [].forEach.call(swap.querySelectorAll('img[data-make]'), function (im) { imgs[im.getAttribute('data-make')] = im; });
    var links = [].slice.call(list.querySelectorAll('a[data-make]'));
    function show(make) {
      var im = imgs[make]; if (!im || im === cur) return;
      links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-make') === make); });
      if (im.loading === 'lazy') im.loading = 'eager';
      var prev = cur; cur = im;
      im.classList.add('is-reset'); im.classList.remove('is-on'); im.style.zIndex = ++z;
      void im.offsetWidth; im.classList.remove('is-reset'); im.classList.add('is-on');   // wipe in over the current one
      if (prev) setTimeout(function () { if (prev !== cur) { prev.classList.add('is-reset'); prev.classList.remove('is-on'); void prev.offsetWidth; prev.classList.remove('is-reset'); } }, 780);
    }
    function clear() {   // back to the scroll's make, or wipes out to the DBS gauges
      if (base) { show(base); return; }
      links.forEach(function (a) { a.classList.remove('is-on'); }); if (cur) { cur.classList.remove('is-on'); cur = null; }
    }
    var hovering = false;
    list.addEventListener('mouseenter', function () { hovering = true; });
    list.addEventListener('mouseleave', function () { hovering = false; });
    // the scroll drives the makes while the Collection is pinned (scenes.js); hover still takes over while the pointer is on the list
    window.V4 = window.V4 || {};
    V4.colSwap = { makes: links.map(function (a) { return a.getAttribute('data-make'); }), select: function (make) {
      if (make === base) return; base = make; if (hovering) return;
      if (make) show(make); else { links.forEach(function (a) { a.classList.remove('is-on'); }); if (cur) { cur.classList.remove('is-on'); cur = null; } }
    } };
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { show(a.getAttribute('data-make')); });
      a.addEventListener('focus', function () { show(a.getAttribute('data-make')); });
    });
    list.addEventListener('mouseleave', clear);
    list.addEventListener('focusout', function (e) { if (!list.contains(e.relatedTarget)) clear(); });
    // warm the cache once the Collection is near, so the first hover never waits for a download
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { Object.keys(imgs).forEach(function (k) { imgs[k].loading = 'eager'; }); io.disconnect(); } }, { rootMargin: '600px' });
      io.observe(list);
    }
  })();

  /* ------------------------------------------------ 04 Locations: one showroom on */
  (function () {
    var cols = [].slice.call(document.querySelectorAll('.lc__col')); if (!cols.length) return;
    var all = null, allName = null;   // View all now lives in each column
    function on(col) {
      cols.forEach(function (c) { var y = c === col; c.classList.toggle('is-on', y); c.querySelector('.lc__panel').setAttribute('aria-pressed', y ? 'true' : 'false'); });
      var k = col.getAttribute('data-lc');
      if (all) all.setAttribute('href', 'inventory.html?showroom=' + k);
      if (allName) allName.textContent = col.querySelector('.lc__name').textContent;
    }
    window.V4 = window.V4 || {};
    V4.lcSelect = function (key) { var c = cols.filter(function (x) { return x.getAttribute('data-lc') === key; })[0]; if (c && !c.classList.contains('is-on')) on(c); };   // the scroll walks the showrooms (scenes.js)
    V4.lcKeys = cols.map(function (c) { return c.getAttribute('data-lc'); });
    cols.forEach(function (c) {
      var p = c.querySelector('.lc__panel');
      c.addEventListener('mouseenter', function () { if (matchMedia('(hover: hover)').matches) on(c); });
      p.addEventListener('click', function (e) { if (!e.target.closest('a')) on(c); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { if (e.target === p) { e.preventDefault(); on(c); } } });
      p.addEventListener('focus', function () { on(c); });
    });
  })();

  /* ------------------------------------------------ 05 Sell: the loop plays only on screen */
  (function () {
    var v = document.querySelector('.sl__vid'); if (!v) return;
    v.muted = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }   // the poster holds
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { rootMargin: '200px 0px' }).observe(v);
  })();
})();
