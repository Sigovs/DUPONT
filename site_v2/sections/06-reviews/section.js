/* 06 · The owners' voice — three placeholder slots, prev/next, no autoplay.
   Change: the current quote + attribution leave to the left as a staircase (angled clip, 80px), the next arrive from
   the right; ~0.75s, interruptible (a click mid-change completes the current one first). Reduced motion: instant.
   No scroll motion: the interlude is still at every scroll speed. */
Select.register('06-reviews', function (ctx) {
  'use strict';
  var el = ctx.el, gsap = ctx.gsap, ST = ctx.ScrollTrigger;
  var items = Array.prototype.slice.call(el.querySelectorAll('.rv__item'));
  var countEl = el.querySelector('[data-count]');
  var N = items.length, cur = 0, busy = null;
  var LEAN = 0.284;

  function pad(n) { return (n < 9 ? '0' : '') + (n + 1); }
  function show(i) {
    items.forEach(function (it, k) { it.hidden = k !== i; it.classList.toggle('is-on', k === i); });
    countEl.textContent = pad(i);
    cur = i;
  }
  /* clip polygon that hides/reveals a line along the house lean */
  function clip(w, h, xt, side) {
    var sl = h * LEAN, p = 12, t = -p, b = h + p;
    if (side === 'R') { var r = w + p + sl; return 'polygon(' + xt + 'px ' + t + 'px,' + r + 'px ' + t + 'px,' + r + 'px ' + b + 'px,' + (xt - sl) + 'px ' + b + 'px)'; }
    var l = -p - sl; return 'polygon(' + l + 'px ' + t + 'px,' + xt + 'px ' + t + 'px,' + (xt - sl) + 'px ' + b + 'px,' + l + 'px ' + b + 'px)';
  }
  function lines(it) { return Array.prototype.slice.call(it.querySelectorAll('[data-q]')); }

  function go(dir) {
    var next = (cur + dir + N) % N;
    if (ctx.reduced || !gsap) { show(next); return; }
    if (busy) { busy.progress(1); }
    var out = lines(items[cur]);
    var tl = gsap.timeline({ onComplete: function () { busy = null; } });
    out.forEach(function (l, i) {
      var w = l.offsetWidth, h = l.offsetHeight, o = { e: 0 };
      tl.to(o, { e: 1, duration: 0.34, ease: 'power2.in', onUpdate: function () {
        /* leaves to the side it is pushed to: next → left, prev → right */
        var xt = dir > 0 ? (w + 12 + h * LEAN) * (1 - o.e) - 12 * o.e : -12 + (w + 24 + h * LEAN) * o.e;
        l.style.clipPath = clip(w, h, Math.round(xt), dir > 0 ? 'L' : 'R');
        l.style.transform = 'translate3d(' + (-dir * 80 * o.e) + 'px,0,0)';
      } }, i * 0.06);
    });
    tl.add(function () {
      out.forEach(function (l) { l.style.clipPath = ''; l.style.transform = ''; });
      show(next);
      var inn = lines(items[next]);
      inn.forEach(function (l, i) {
        var w = l.offsetWidth, h = l.offsetHeight, o = { e: 0 };
        l.style.clipPath = clip(w, h, dir > 0 ? w + 12 + Math.round(h * LEAN) : -12, dir > 0 ? 'R' : 'L');
        tl.to(o, { e: 1, duration: 0.5, ease: 'power3.out', onUpdate: function () {
          var xt = dir > 0 ? (w + 12 + h * LEAN) * (1 - o.e) - 12 * o.e : -12 + (w + 24 + h * LEAN) * o.e;
          l.style.clipPath = o.e >= 1 ? '' : clip(w, h, Math.round(xt), dir > 0 ? 'R' : 'L');
          l.style.transform = o.e >= 1 ? '' : 'translate3d(' + (dir * 80 * (1 - o.e)) + 'px,0,0)';
        } }, '>-' + (i ? 0.42 : 0));
      });
    });
    busy = tl;
  }
  el.querySelector('[data-prev]').addEventListener('click', function () { go(-1); });
  el.querySelector('[data-next]').addEventListener('click', function () { go(1); });
  el.addEventListener('keydown', function (e) {
    if (e.target.closest('.rv__ctl') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); go(e.key === 'ArrowLeft' ? -1 : 1); }
  });

});
