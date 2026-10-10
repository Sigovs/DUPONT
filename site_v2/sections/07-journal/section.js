/* 07 · The Select journal.
   >=1024px with motion: the aerial is cut in from the right along the house lean as the scene arrives (scrubbed,
   finishes before the section docks). The GT2 RS (larger) and the STO (smaller) travel at two rates and settle at rest when
   the aerial's lower edge reaches 30% of the viewport; the climb past rest is capped at 22px so it never nears the aerial.
   The slot's lines play ONE timed staircase when the slot enters (no scrub, so the headline is never caught half
   drawn) and then stay still. Reduced motion / <1024px: everything at rest. */
Select.register('07-journal', function (ctx) {
  'use strict';
  if (ctx.reduced) return;
  var el = ctx.el, gsap = ctx.gsap, ST = ctx.ScrollTrigger, LEAN = 0.284, AMP = 100;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    var pair = Array.prototype.slice.call(el.querySelectorAll('.jn__planes .jn__p'));
    var row = el.querySelector('.jn__planes');
    var hero = el.querySelector('[data-reveal] img');
    var lines = Array.prototype.slice.call(el.querySelectorAll('[data-ln]'));
    var trig = [], tl = null;

    function depth() {
      var vh = window.innerHeight, c = (el.querySelector('.jn__p--1').getBoundingClientRect().bottom - 0.3 * vh) / vh;
      c = Math.max(-0.25, Math.min(1.2, c));
      pair.forEach(function (p) {
        var rate = parseFloat(p.getAttribute('data-rate')) || 0;
        p.style.transform = 'translate3d(0,' + Math.round(c * rate * AMP) + 'px,0)';
      });
    }
    function reveal(q) {
      var e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      if (e >= 1) { hero.style.clipPath = ''; return; }
      var w = hero.offsetWidth, h = hero.offsetHeight, sl = h * LEAN;
      var xt = (w + sl) * (1 - e) + sl * e, xb = xt - sl;
      hero.style.clipPath = 'polygon(' + Math.round(xt) + 'px 0,' + Math.round(w + sl) + 'px 0,' + Math.round(w + sl) + 'px ' + h + 'px,' + Math.round(xb) + 'px ' + h + 'px)';
    }
    function setLine(L, e) {
      if (e >= 1) { L.style.clipPath = ''; L.style.transform = ''; L.style.visibility = ''; return; }
      var w = L.offsetWidth, h = L.offsetHeight, sl = h * LEAN, p = 12, xt = -p + (w + 2 * p + sl) * e;
      L.style.visibility = e <= 0 ? 'hidden' : '';
      L.style.transform = 'translate3d(' + Math.round(-120 * (1 - e)) + 'px,0,0)';
      L.style.clipPath = 'polygon(' + Math.round(-p - sl) + 'px ' + (-p) + 'px,' + Math.round(xt) + 'px ' + (-p) + 'px,' + Math.round(xt - sl) + 'px ' + (h + p) + 'px,' + Math.round(-p - sl) + 'px ' + (h + p) + 'px)';
    }
    function playIn() {
      if (tl) tl.kill();
      tl = gsap.timeline();
      lines.forEach(function (L, i) {
        var o = { e: 0 }; setLine(L, 0);
        tl.to(o, { e: 1, duration: 0.55, ease: 'power3.out', onUpdate: function () { setLine(L, o.e); } }, i * 0.08);
      });
    }
    function hideAll() { if (tl) { tl.kill(); tl = null; } lines.forEach(function (L) { setLine(L, 0); }); }

    trig.push(ST.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: depth, onRefresh: depth }));
    trig.push(ST.create({ trigger: el, start: 'top 90%', end: 'top 30%',
      onUpdate: function (s) { reveal(s.progress); }, onRefresh: function (s) { reveal(s.progress); } }));
    var slotST = ST.create({ trigger: el.querySelector('.jn__slot'), start: 'top 82%',
      onEnter: playIn, onLeaveBack: hideAll });
    trig.push(slotST);
    if (slotST.progress > 0 || slotST.isActive || window.scrollY > slotST.start) lines.forEach(function (L) { setLine(L, 1); }); else hideAll();

    return function () {
      trig.forEach(function (t) { t.kill(); }); if (tl) tl.kill();
      pair.forEach(function (p) { p.style.transform = ''; });
      hero.style.clipPath = '';
      lines.forEach(function (L) { L.style.clipPath = ''; L.style.transform = ''; L.style.visibility = ''; });
    };
  });
});
