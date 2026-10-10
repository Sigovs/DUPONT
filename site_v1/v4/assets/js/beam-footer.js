/* Footer wordmark (Alex, 2026-10-09): the duPont REGISTRY logo carries a slow diagonal sheen (two unrelated sines,
   never visibly loops) that leans toward the pointer, plus a soft pointer glow. Coordinates are the logo's own box.
   Rises in the first time it is seen; runs only while on screen. Reduced motion: still sheen. */
(function () {
  var root = document.querySelector('.bwf'), mark = root && root.querySelector('.bwf-mark'); if (!mark) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var approach = function (f, t, k, dt) { return t + (f - t) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60); };
  var drift = function (t) { return 58 + 14 * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3)); };
  var p = { u: 0.5, x: 0, y: 0, inside: false };
  function onPtr(e) { var r = mark.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; p.u = r.width ? p.x / r.width : 0.5; p.inside = e.type !== 'pointerleave'; }
  ['pointermove', 'pointerenter', 'pointerleave'].forEach(function (t) { root.addEventListener(t, onPtr); });
  function set(b, px, py, g) {
    mark.style.setProperty('--bwf-b', b.toFixed(2) + '%'); mark.style.setProperty('--bwf-px', px.toFixed(1) + 'px');
    mark.style.setProperty('--bwf-py', py.toFixed(1) + 'px'); mark.style.setProperty('--bwf-g', g.toFixed(3));
  }
  var visible = false, raf = 0, last = 0, t = performance.now() / 1000, b = 58, px = 0, py = 0, g = 0;
  function tick(now) {
    var dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;
    var idle = drift(t), target = p.inside ? (20 + 70 * clamp(p.u, 0, 1)) * 0.75 + idle * 0.25 : idle;
    b = approach(b, target, 0.035, dt); px = approach(px, p.x, 0.16, dt); py = approach(py, p.y, 0.16, dt); g = approach(g, p.inside ? 1 : 0, 0.06, dt);
    set(b, px, py, g);
    if (visible) raf = requestAnimationFrame(tick);
  }
  if (reduce) { root.dataset.in = 'true'; set(58, 0, 0, 0); return; }
  if (!('IntersectionObserver' in window)) { root.dataset.in = 'true'; return; }
  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible) { root.dataset.in = 'true'; cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick); }
  }, { threshold: 0.05 }).observe(mark);
})();
