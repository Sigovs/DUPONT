/* 04-sell — "Sell it to Select."
   Static (reduced motion / narrow / no JS): the designed frame — night field + slot, photo panel behind the angled edge.
   Motion (≥1101px landscape): the section is 100svh + 60vh with a sticky stage; one scrubbed timeline from "top 85%"
   to the end of the runway (same rhythm as 03):
     1. the panel opens from the LEFT behind its house-angled right edge (constant 16% lean), the photograph
        drifting in 6vw behind it, slower than the edge — it rides in, it is not wiped;
     2. at 50vh of travel (panel open, slot mid-frame) the type plays in from the right — TIME-BASED, ~0.8 s, reversed
        when the threshold is crossed back; images stay scrubbed, the scroll is never moved by script.
     Everything has landed before the stage sticks: the whole 60vh runway is a still hold. */
(function () {
  'use strict';

  window.Select.register('04-sell', function (ctx) {
    if (ctx.reduced || !ctx.gsap) return;
    var el = ctx.el, gsap = ctx.gsap;
    var M = { run: 60, start: 'top 85%', landed: 0.69, travel: 64, lean: 0.284, drift: 0.06 };

    var mm = gsap.matchMedia();
    mm.add('(min-width: 1101px) and (orientation: landscape)', function () {
      el.classList.add('is-live');
      el.style.setProperty('--sell-run', M.run + 'vh');

      var panel = el.querySelector('[data-panel]');
      var photo = el.querySelector('[data-photo]');
      var lines = Array.prototype.slice.call(el.querySelectorAll('.sell-slot .ln'));
      var caps = Array.prototype.slice.call(el.querySelectorAll('.sell-cap .ln'));
      var cs = getComputedStyle(el);
      var top = parseFloat(cs.getPropertyValue('--sell-top')), bot = parseFloat(cs.getPropertyValue('--sell-bot'));
      var off = -(top + 1);                                       /* the edge starts beyond the left side */

      /* type enters from the RIGHT (the side it belongs to): visible region = right of a "/" edge that travels leftwards */
      function poly(w, h, xt) {
        var pad = 12, sl = h * M.lean, T = -pad, B = h + pad, R = w + pad + sl;
        return 'polygon(' + xt + 'px ' + T + 'px,' + R + 'px ' + T + 'px,' + R + 'px ' + B + 'px,' + (xt - sl) + 'px ' + B + 'px)';
      }
      function hidden(ln) { var sl = ln.offsetHeight * M.lean; return poly(ln.offsetWidth, ln.offsetHeight, ln.offsetWidth + 12 + 2 * sl); }
      function shown(ln) { return poly(ln.offsetWidth, ln.offsetHeight, -12); }
      function edge(dx) {               /* the panel = everything LEFT of its "/" edge */
        return 'polygon(-1% 0%,' + (top + dx) + '% 0%,' + (bot + dx) + '% 100%,-1% 100%)';
      }

      var T = 85 + M.run, H = T * M.landed;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: M.start, end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
      });
      /* 1 · the panel opens behind the angled edge; the photograph rides in behind it */
      tl.fromTo(panel, { clipPath: edge(off) }, { clipPath: edge(0), duration: 48, ease: 'power2.inOut' }, 0);
      tl.fromTo(photo, { x: function () { return -window.innerWidth * M.drift; } }, { x: 0, duration: 52, ease: 'power2.out' }, 0);
      tl.to({}, { duration: T - tl.duration() });

      /* 2 · TEXT IS TIME-BASED: once the panel has opened (threshold 50vh of travel) the slot staircases in from the
         right — eyebrow, three headline lines, lead, CTA, then the caption — playing to its end in ~0.8 s; crossing the
         threshold back reverses it. The scroll position is never moved by script, and a stopped scroll can never
         leave half-built type. */
      var inT = gsap.timeline({ paused: true });
      lines.concat(caps).forEach(function (ln, i) {
        gsap.set(ln, { visibility: 'hidden' });
        inT.set(ln, { visibility: 'visible' }, i * 0.06);
        inT.fromTo(ln, { x: M.travel, clipPath: function () { return hidden(ln); } },
          { x: 0, clipPath: function () { return shown(ln); }, duration: 0.5, ease: 'power3.out' }, i * 0.06);
      });
      ctx.ScrollTrigger.create({
        trigger: el,
        start: function () { return el.getBoundingClientRect().top + window.scrollY - 0.85 * window.innerHeight + 50 * window.innerHeight / 100; },
        end: '+=1',
        onEnter: function () { inT.play(); },
        onLeaveBack: function () { inT.reverse(); }
      });

      return function () {
        el.classList.remove('is-live');
        el.style.removeProperty('--sell-run');
        gsap.set(panel, { clearProps: 'clipPath' });
        gsap.set([photo].concat(caps, lines), { clearProps: 'transform,clipPath,visibility' });
      };
    });
  });
})();
