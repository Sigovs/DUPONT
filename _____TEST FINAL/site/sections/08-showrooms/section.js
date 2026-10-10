/* 08 · Three showrooms — CMC interaction principle: one window open; click / Enter / Space opens another (native
   button). No hover-to-open: hover only changes the affordance colour. The width animates first (flex-grow, 400ms);
   the opened window's details appear after it settles, as a short staircase from the left.
   Mobile (<1024px): all details present; the heading button collapses/expands its own showroom.
   Scroll (motion on, >=1024px): each photograph rises into its window from below, inside its own frame, staggered;
   the head lines staircase in. Reduced motion: instant open, no arrival motion. */
Select.register('08-showrooms', function (ctx) {
  'use strict';
  var el = ctx.el, gsap = ctx.gsap, ST = ctx.ScrollTrigger, LEAN = 0.284;
  var rooms = Array.prototype.slice.call(el.querySelectorAll('.sh__room'));
  var desk = window.matchMedia('(min-width: 1024px)');
  var settleTimer = null;

  function btn(r) { return r.querySelector('.sh__city button'); }
  function clip(w, h, xt) {
    var sl = h * LEAN, p = 10;
    return 'polygon(' + Math.round(-p - sl) + 'px ' + (-p) + 'px,' + Math.round(xt) + 'px ' + (-p) + 'px,' + Math.round(xt - sl) + 'px ' + (h + p) + 'px,' + Math.round(-p - sl) + 'px ' + (h + p) + 'px)';
  }
  function stairIn(r) {
    var steps = Array.prototype.slice.call(r.querySelectorAll('[data-st]'));
    if (ctx.reduced || !gsap) return;
    steps.forEach(function (s, i) {
      var w = s.offsetWidth, h = s.offsetHeight, o = { e: 0 };
      s.style.clipPath = clip(w, h, -10); s.style.transform = 'translate3d(-48px,0,0)';
      gsap.to(o, { e: 1, duration: 0.5, delay: i * 0.07, ease: 'power3.out', onUpdate: function () {
        if (o.e >= 1) { s.style.clipPath = ''; s.style.transform = ''; return; }
        s.style.clipPath = clip(w, h, -10 + (w + 20 + h * LEAN) * o.e);
        s.style.transform = 'translate3d(' + (-48 * (1 - o.e)).toFixed(1) + 'px,0,0)';
      } });
    });
  }
  function open(r) {
    if (!desk.matches) {                       /* mobile: collapse / expand this one */
      var col = r.classList.toggle('is-collapsed');
      btn(r).setAttribute('aria-expanded', col ? 'false' : 'true');
      return;
    }
    if (r.classList.contains('is-open')) return;
    rooms.forEach(function (o) {
      if (o === r) return;
      o.classList.remove('is-open', 'is-shown');
      btn(o).setAttribute('aria-expanded', 'false');
      o.querySelectorAll('[data-st]').forEach(function (s) { s.style.clipPath = ''; s.style.transform = ''; });
    });
    r.classList.add('is-open');
    btn(r).setAttribute('aria-expanded', 'true');
    clearTimeout(settleTimer);
    var done = function () {
      clearTimeout(settleTimer); r.removeEventListener('transitionend', onEnd);
      if (!r.classList.contains('is-open')) return;
      r.classList.add('is-shown'); stairIn(r);
      if (ctx.ScrollTrigger) ctx.ScrollTrigger.refresh();
    };
    var onEnd = function (e) { if (e.target === r && e.propertyName === 'flex-grow') done(); };
    if (ctx.reduced) { done(); return; }
    r.addEventListener('transitionend', onEnd);
    settleTimer = setTimeout(done, 480);       /* safety: transitionend can be skipped */
  }
  rooms.forEach(function (r) { btn(r).addEventListener('click', function () { open(r); }); });

  /* breakpoint changes: desktop = exactly one open; mobile = all present */
  function sync() {
    if (desk.matches) {
      var cur = rooms.filter(function (r) { return r.classList.contains('is-open'); })[0] || rooms[0];
      rooms.forEach(function (r) {
        r.classList.remove('is-collapsed');
        var on = r === cur; r.classList.toggle('is-open', on); r.classList.toggle('is-shown', on);
        btn(r).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    } else {
      rooms.forEach(function (r) { r.classList.remove('is-collapsed'); btn(r).setAttribute('aria-expanded', 'true'); });
    }
  }
  sync();
  if (desk.addEventListener) desk.addEventListener('change', sync);

  if (ctx.reduced) return;

  /* ---------- arrival ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    var imgs = rooms.map(function (r) { return r.querySelector('.sh__img'); });
    var lines = Array.prototype.slice.call(el.querySelectorAll('[data-ln]'));
    function arrive(q) {
      imgs.forEach(function (im, i) {
        var t = Math.max(0, Math.min(1, (q - i * 0.14) / 0.72)), e = 1 - Math.pow(1 - t, 3);
        var hW = im.parentNode.offsetHeight;
        im.style.translate = e >= 1 ? '' : '0 ' + Math.round(hW * (1 - e)) + 'px';   /* rises inside its own window */
      });
    }
    function stair(q) {
      var n = lines.length, ld = 0.5, stg = (1 - ld) / (n - 1);
      lines.forEach(function (L, i) {
        var t = Math.max(0, Math.min(1, (q - i * stg) / ld)), e = 1 - Math.pow(1 - t, 3);
        if (e >= 1) { L.style.clipPath = ''; L.style.transform = ''; return; }
        var w = L.offsetWidth, h = L.offsetHeight;
        L.style.clipPath = clip(w, h, -10 + (w + 20 + h * LEAN) * e);
        L.style.transform = 'translate3d(' + Math.round(-120 * (1 - e)) + 'px,0,0)';
      });
    }
    var a = ST.create({ trigger: el.querySelector('.sh__row'), start: 'top bottom', end: 'top 50%',
      onUpdate: function (s) { arrive(s.progress); }, onRefresh: function (s) { arrive(s.progress); } });
    /* head lines: ONE timed staircase (0.75s) as soon as the head's top passes 92% of the viewport, so it is complete
       long before the section docks; never scrubbed, never caught mid-entrance at rest */
    var tlH = null;
    function playHead() { if (tlH) tlH.kill(); var o = { q: 0 }; stair(0); tlH = gsap.to(o, { q: 1, duration: 0.75, ease: 'none', onUpdate: function () { stair(o.q); } }); }
    function resetHead() { if (tlH) { tlH.kill(); tlH = null; } stair(0); }
    var b = ST.create({ trigger: el.querySelector('.sh__top'), start: 'top 92%', onEnter: playHead, onLeaveBack: resetHead });
    if (b.progress > 0 || window.scrollY > b.start) stair(1); else stair(0);
    return function () {
      a.kill(); b.kill(); if (tlH) tlH.kill();
      imgs.forEach(function (im) { im.style.translate = ''; });
      lines.forEach(function (L) { L.style.clipPath = ''; L.style.transform = ''; });
    };
  });
});
