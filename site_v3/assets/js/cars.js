/* =============================================================================
   V4 car layers — positions every .car group from window.V4_ASSETS at runtime, so a
   final cut-out dropped into v4-assets.js (src / w / h / anchor) needs no other change.
   Group origin = the body ANCHOR; body and shadow hang off it at scale s = W / body.w.
   V4.cars.delta(name, frame) → { x, y, scale } relative to F1, in stage units, for GSAP.
   ============================================================================= */
(function () {
  'use strict';
  var A = window.V4_ASSETS; if (!A) return;
  var V4 = window.V4 = window.V4 || {};
  var F1 = A.frames.F1, M1 = A.frames.M1;

  function place(el) {
    var name = el.getAttribute('data-car-layer'), a = A.cars[name]; if (!a) return;
    var f = F1[name], mf = M1[name];
    var s = f[2] / a.body.w, k = s / (a.shadow.scale || 1);
    el.style.setProperty('--ax', f[0]); el.style.setProperty('--ay', f[1]);
    el.style.setProperty('--mx', mf[0]); el.style.setProperty('--my', mf[1]); el.style.setProperty('--mk', (mf[2] / f[2]).toFixed(4));
    el.style.zIndex = a.z;
    var body = el.querySelector('.car__body'), sh = el.querySelector('.car__shadow');
    function set(img, spec, sc) {
      if (img.getAttribute('src') !== spec.src) img.setAttribute('src', spec.src);
      img.width = spec.w; img.height = spec.h;
      img.style.setProperty('--l', (-spec.anchor[0] * sc).toFixed(2));
      img.style.setProperty('--t', (-spec.anchor[1] * sc).toFixed(2));
      img.style.setProperty('--w', (spec.w * sc).toFixed(2));
      img.style.setProperty('--h', (spec.h * sc).toFixed(2));
    }
    set(body, a.body, s); set(sh, a.shadow, k);
    sh.style.mixBlendMode = a.shadow.blend || 'normal';
  }
  [].forEach.call(document.querySelectorAll('[data-car-layer]'), place);

  V4.cars = {
    delta: function (name, frame) {
      var f = F1[name], t = (typeof frame === 'string' ? A.frames[frame] : frame)[name];
      return { x: t[0] - f[0], y: t[1] - f[1], scale: t[2] / f[2] };
    },
    /* the shadow's far edge below the anchor, in stage units, at body width W (for the Wake lock) */
    shadowTail: function (name, W) {
      var a = A.cars[name], s = W / a.body.w, k = s / (a.shadow.scale || 1);
      return (a.shadow.h - a.shadow.anchor[1]) * k;
    }
  };
})();
