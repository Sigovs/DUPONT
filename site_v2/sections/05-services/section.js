/* 05 · Services — one held field, three chapters, timed cuts.
   >=1024px with motion: the field sticks (CSS sticky inside a 210svh runway). Each chapter owns 70svh of runway and
   is completely still there. Crossing a boundary plays ONE short timed cut that always runs to completion
   (~1.1s): the type staircases out to the right, the next photograph rises into the frame from below (the outgoing
   one drifts up 6%), the index switches, the next type staircases in from the left. Because the cut is timed, not
   scrubbed, no scroll position can leave half-cut lines on screen; exited lines are visibility:hidden.
   A new crossing during a cut finishes the running cut first; scrollEnd and a 1.4s guard
   also commit any running cut, so the field is never left mid-cut at rest. Reduced motion / no JS / <1024px: static frames. */
Select.register('05-services', function (ctx) {
  'use strict';
  var el = ctx.el;
  var anchors = Array.prototype.slice.call(el.querySelectorAll('.sv__anchor'));
  var chs = Array.prototype.slice.call(el.querySelectorAll('.sv__ch'));
  var figs = Array.prototype.slice.call(el.querySelectorAll('.sv__fig'));
  var HDR = function () { return (document.querySelector('.hdr') || {}).offsetHeight || 0; };

  function placeAnchorsStatic() {
    anchors.forEach(function (a, k) { a.style.top = (Math.min(chs[k].offsetTop, figs[k].offsetTop) - HDR()) + 'px'; });
  }
  if (ctx.reduced) { placeAnchorsStatic(); window.addEventListener('resize', placeAnchorsStatic); return; }

  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, LEAN = 0.284;
  var SPAN = 70;                                   /* svh of runway per chapter */

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    el.classList.add('is-live');
    /* the runway changes the page height: tell Lenis now, or a hash landing below this section is clamped short */
    if (ctx.lenis && ctx.lenis.resize) ctx.lenis.resize();
    var imgs = figs.map(function (fg) { return fg.querySelector('img'); });
    var links = Array.prototype.slice.call(el.querySelectorAll('[data-go]'));
    var lines = chs.map(function (ch) { return Array.prototype.slice.call(ch.querySelectorAll('[data-ln]')); });
    var cur = -1, tl = null;

    function setIndex(k) {
      links.forEach(function (l, i) { if (i === k) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
    }
    function rest(k) {           /* the designed still state of chapter k */
      chs.forEach(function (c, i) {
        var on = i === k; c.classList.toggle('is-on', on); c.setAttribute('aria-hidden', on ? 'false' : 'true');
        lines[i].forEach(function (L) { L.style.clipPath = ''; L.style.transform = ''; });
      });
      figs.forEach(function (fg, i) { fg.classList.toggle('is-on', i === k); fg.style.clipPath = ''; fg.style.zIndex = i === k ? 2 : 1; });
      imgs.forEach(function (im) { im.style.transform = ''; });
      setIndex(k);
    }
    /* angled-edge clip for one line; e 0..1; mode 'in' reveals from the left, 'out' hides from the left */
    function clip(L, e, mode) {
      var w = L.offsetWidth, h = L.offsetHeight, sl = h * LEAN, p = 12, xt = -p + (w + 2 * p + sl) * e, r = w + p + sl;
      if (mode === 'in') return 'polygon(' + (-p - sl) + 'px ' + (-p) + 'px,' + xt + 'px ' + (-p) + 'px,' + (xt - sl) + 'px ' + (h + p) + 'px,' + (-p - sl) + 'px ' + (h + p) + 'px)';
      return 'polygon(' + xt + 'px ' + (-p) + 'px,' + r + 'px ' + (-p) + 'px,' + r + 'px ' + (h + p) + 'px,' + (xt - sl) + 'px ' + (h + p) + 'px)';
    }
    var guard = null;
    function commit() { clearTimeout(guard); if (tl) { tl.progress(1); tl = null; } }
    function go(k) {
      if (k === cur) return;
      commit();
      var from = cur; cur = k;
      if (from < 0) { rest(k); return; }
      var outL = lines[from], inL = lines[k], fIn = figs[k], iIn = imgs[k], iOut = imgs[from];
      setIndex(k);
      fIn.style.zIndex = 3; fIn.classList.add('is-on'); fIn.style.clipPath = 'inset(100% 0 0 0)';
      chs[k].classList.add('is-on'); chs[k].setAttribute('aria-hidden', 'false');
      inL.forEach(function (L) { L.style.clipPath = clip(L, 0, 'in'); L.style.transform = 'translate3d(-120px,0,0)'; });
      tl = gsap.timeline({ onComplete: function () { clearTimeout(guard); rest(k); tl = null; } });
      /* a cut always reaches its end state: even if the ticker is throttled (background tab, slow device) */
      guard = setTimeout(commit, 1400);
      outL.forEach(function (L, i) {
        var o = { e: 0 };
        tl.to(o, { e: 1, duration: 0.3, ease: 'power2.in', onUpdate: function () {
          L.style.clipPath = clip(L, o.e, 'out'); L.style.transform = 'translate3d(' + (40 * o.e).toFixed(1) + 'px,0,0)';
        } }, i * 0.035);
      });
      tl.add(function () { chs[from].classList.remove('is-on'); chs[from].setAttribute('aria-hidden', 'true'); }, 0.52);
      var ph = { e: 0 };
      tl.to(ph, { e: 1, duration: 0.7, ease: 'power3.inOut', onUpdate: function () {
        fIn.style.clipPath = 'inset(' + (100 * (1 - ph.e)).toFixed(2) + '% 0 0 0)';
        iIn.style.transform = 'translate3d(0,' + (8 * (1 - ph.e)).toFixed(2) + '%,0)';
        iOut.style.transform = 'translate3d(0,' + (-6 * ph.e).toFixed(2) + '%,0)';
      } }, 0.12);
      inL.forEach(function (L, i) {
        var o = { e: 0 };
        tl.to(o, { e: 1, duration: 0.42, ease: 'power3.out', onUpdate: function () {
          L.style.clipPath = clip(L, o.e, 'in'); L.style.transform = 'translate3d(' + (-120 * (1 - o.e)).toFixed(1) + 'px,0,0)';
        } }, 0.5 + i * 0.05);
      });
    }
    function chapterAt(s) {
      var rvh = (s.end - s.start) * s.progress / window.innerHeight * 100;
      return rvh < SPAN ? 0 : rvh < 2 * SPAN ? 1 : 2;
    }
    function placeAnchors() { anchors.forEach(function (a) { a.style.top = (parseFloat(a.getAttribute('data-at')) * window.innerHeight) + 'px'; }); }

    placeAnchors();
    /* when scrolling stops, nothing may be left mid-cut */
    var onEnd = function () { if (tl) tl.timeScale(3); };   /* finish quickly, never freeze */
    ST.addEventListener('scrollEnd', onEnd);
    var st = ST.create({
      trigger: el, start: 'top top', end: 'bottom bottom',
      onUpdate: function (s) { go(chapterAt(s)); },
      onRefreshInit: placeAnchors,
      onRefresh: function (s) { if (tl) tl.progress(1); cur = -1; go(chapterAt(s)); }
    });
    go(chapterAt(st));

    return function () {
      st.kill(); clearTimeout(guard); if (tl) tl.kill(); ST.removeEventListener('scrollEnd', onEnd);
      el.classList.remove('is-live');
      figs.forEach(function (fg) { fg.style.clipPath = ''; fg.style.zIndex = ''; fg.classList.remove('is-on'); });
      imgs.forEach(function (i) { i.style.transform = ''; });
      chs.forEach(function (c) { c.classList.remove('is-on'); c.removeAttribute('aria-hidden'); });
      lines.forEach(function (g) { g.forEach(function (L) { L.style.clipPath = ''; L.style.transform = ''; }); });
      placeAnchorsStatic();
    };
  });
  mm.add('(max-width: 1023px)', function () { placeAnchorsStatic(); });
});
