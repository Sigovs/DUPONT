/* 03-locations — About + Locations, two stops in one scene.
   Interaction (every mode): marker ⇄ room sync — hover or focus on either lights the pair (ivory-filled ring + halo,
   red 2px rule over the room); a marker click selects that showroom (aria-pressed) and, on the stacked layout, scrolls
   to its room. Rooms link to inventory.html?showroom=…, tel: and Google Maps directions.
   Motion (≥1101px landscape): the section is 100vh + 182vh with a sticky stage. IMAGES ARE SCRUBBED, TEXT IS
   TIME-BASED: the photograph and the map follow the scroll; every text group plays to its end in ~0.6–0.9 s once its
   threshold is crossed and reverses when it is crossed back. The scroll position is never moved by script.
   Positions in vh of travel from "top 85%":
     0–80     the Naples band rises 14vh into place (scrubbed); at 36 the statement plays in (time-based)
     85–141   HOLD A (#about)
     141      the statement plays out to the right and is hidden (time-based)
     151–174  the photograph alone shrinks into its plate (scrubbed, uniform scale, no crop change)
     175–191  one angled sweep reveals the map (scrubbed); at 175 stop B's type, plate caption and rooms play in;
              at 191 (sweep done) the markers set down
     205–261  HOLD B (#locations anchor)
   Reduced motion / narrow / no JS: the two frames stacked as designed statics. */
(function () {
  'use strict';

  window.Select.register('03-locations', function (ctx) {
    var el = ctx.el;
    var map = el.querySelector('[data-map]');
    var marks = Array.prototype.slice.call(el.querySelectorAll('.loc-mk'));
    var rooms = Array.prototype.slice.call(el.querySelectorAll('.loc-room'));
    var anchorB = el.querySelector('.loc-anchor-b');
    var frameB = el.querySelector('.loc-frame--b');
    var picked = null, live = false;
    var M = { run: 182, arrive: 85, holdA: 62, cut: 64, holdB: 56, travel: 64, lean: 0.284 };

    function hair() {
      var w = map.getBoundingClientRect().width;
      if (w) map.style.setProperty('--loc-sw', (1000 / w).toFixed(3));
    }
    /* #locations lands on stop B: in motion mode at the start of hold B, otherwise at the top of frame B */
    function placeAnchor() {
      anchorB.style.top = live ? (M.holdA + M.cut + 2) + 'vh' : frameB.offsetTop + 'px';
    }
    hair(); placeAnchor();
    window.addEventListener('resize', function () { hair(); placeAnchor(); });

    /* ---------- marker ⇄ room sync ---------- */
    function light(k) {
      marks.forEach(function (m) { m.classList.toggle('is-on', m.dataset.room === k); });
      rooms.forEach(function (r) { r.classList.toggle('is-on', r.dataset.room === k); });
    }
    function rest() { light(picked); }
    function pick(k) {
      picked = picked === k ? null : k;
      marks.forEach(function (m) { m.setAttribute('aria-pressed', String(m.dataset.room === picked)); });
      rest();
    }
    marks.forEach(function (m) {
      var k = m.dataset.room;
      m.addEventListener('mouseenter', function () { light(k); });
      m.addEventListener('mouseleave', rest);
      m.addEventListener('focus', function () { light(k); });
      m.addEventListener('blur', rest);
      m.addEventListener('click', function () {
        pick(k);
        if (picked && getComputedStyle(el.querySelector('.loc-row')).position === 'static') {
          window.Select.scrollTo(el.querySelector('#loc-' + k), { offset: -110 });
        }
      });
    });
    rooms.forEach(function (r) {
      var k = r.dataset.room;
      r.addEventListener('mouseenter', function () { light(k); });
      r.addEventListener('mouseleave', rest);
      r.addEventListener('focusin', function () { light(k); });
      r.addEventListener('focusout', function (e) { if (!r.contains(e.relatedTarget)) rest(); });
    });

    if (ctx.reduced || !ctx.gsap) return;
    var gsap = ctx.gsap, ST = ctx.ScrollTrigger;


    var mm = gsap.matchMedia();
    mm.add('(min-width: 1101px) and (orientation: landscape)', function () {
      live = true;
      el.classList.add('is-live');
      el.style.setProperty('--loc-run', M.run + 'vh');
      hair(); placeAnchor();

      var q = function (s) { return Array.prototype.slice.call(el.querySelectorAll(s)); };
      var linesA = q('.loc-frame--a .ln'), linesB = q('.loc-slot--b .ln'), capP = q('.loc-plate__cap .ln');
      var band = el.querySelector('[data-band]'), plateImg = el.querySelector('[data-plate-img]');
      var nation = el.querySelector('.loc-map__nation'), states = el.querySelector('.loc-map__states');
      var ins = rooms.map(function (r) { return r.querySelector('.loc-room__in'); });
      var dots = q('.loc-mk__dot'), leads = q('.loc-mk__lead'), labs = q('.loc-mk__l');
      var rules = q('.loc-plate, .loc-room');

      /* the plate box takes the band's exact aspect, so the flight is a uniform scale with no crop change */
      var F = { x: 0, y: 0, s: 1 };
      function layout() {
        gsap.set(band, { clearProps: 'transform' });
        plateImg.style.width = ''; plateImg.style.height = ''; plateImg.style.flex = ''; plateImg.style.marginTop = '';
        var bw = band.offsetWidth, bh = band.offsetHeight, ar = bw / bh;
        var colW = plateImg.parentNode.clientWidth, availH = plateImg.offsetHeight;
        var w = Math.min(colW, availH * ar), h = w / ar;
        plateImg.style.flex = 'none'; plateImg.style.width = w + 'px'; plateImg.style.height = h + 'px';
        plateImg.style.marginTop = (parseFloat(getComputedStyle(plateImg).marginTop) + (availH - h)) + 'px';
        var st = el.querySelector('[data-stage]').getBoundingClientRect(), pr = plateImg.getBoundingClientRect();
        F = { x: pr.left - st.left, y: pr.top - st.top - band.offsetTop, s: w / bw };
      }
      layout();
      ST.addEventListener('refreshInit', layout);

      function polyL(w, h, xt) {        /* visible region left of a "/" edge at xt (top) */
        var pad = 12, sl = h * M.lean, T = -pad, B = h + pad, L = -pad - sl;
        return 'polygon(' + L + 'px ' + T + 'px,' + xt + 'px ' + T + 'px,' + (xt - sl) + 'px ' + B + 'px,' + L + 'px ' + B + 'px)';
      }
      function polyR(w, h, xt) {        /* visible region right of a "/" edge at xt (top) */
        var pad = 12, sl = h * M.lean, T = -pad, B = h + pad, R = w + pad + sl;
        return 'polygon(' + xt + 'px ' + T + 'px,' + R + 'px ' + T + 'px,' + R + 'px ' + B + 'px,' + (xt - sl) + 'px ' + B + 'px)';
      }
      var full = function (ln) { return ln.offsetWidth + 12 + ln.offsetHeight * M.lean; };
      /* TEXT IS TIME-BASED, IMAGES ARE SCRUBBED. Each text group plays to its end (~0.6–0.9 s) once its scroll
         threshold is crossed and reverses when the threshold is crossed back; the scroll position is never touched.
         A stopped scroll therefore never leaves half-built type. */
      var D = { line: 0.5, stg: 0.06, outLine: 0.32, outStg: 0.03 };
      function stairIn(tl, lines, at) {
        lines.forEach(function (ln, i) {
          gsap.set(ln, { visibility: 'hidden' });                       /* unbuilt = not rendered at all */
          tl.set(ln, { visibility: 'visible' }, at + i * D.stg);
          tl.fromTo(ln, { x: -M.travel, clipPath: function () { return polyL(ln.offsetWidth, ln.offsetHeight, -12); } },
            { x: 0, clipPath: function () { return polyL(ln.offsetWidth, ln.offsetHeight, full(ln)); }, duration: D.line, ease: 'power3.out' }, at + i * D.stg);
        });
        return at + (lines.length - 1) * D.stg + D.line;
      }
      function stairOut(tl, lines, at) {
        lines.forEach(function (ln, i) {
          tl.fromTo(ln, { x: 0, clipPath: function () { return polyR(ln.offsetWidth, ln.offsetHeight, -12); } },
            { x: M.travel, clipPath: function () { return polyR(ln.offsetWidth, ln.offsetHeight, full(ln) + ln.offsetHeight * M.lean); }, duration: D.outLine, ease: 'power3.in', immediateRender: false }, at + i * D.outStg);
        });
        tl.set(lines, { visibility: 'hidden' });
      }

      var svg = el.querySelector('.loc-map__svg');
      /* the drawing is revealed by one continuous angled sweep, west → east (never as scattered dash fragments) */
      function sweep(x) { return 'polygon(-20% -5%,' + x + '% -5%,' + (x - 16) + '% 105%,-20% 105%)'; }
      gsap.set(svg, { visibility: 'hidden' });
      gsap.set(rooms, { visibility: 'hidden' });

      var A = M.arrive, C0 = A + M.holdA, C1 = C0 + M.cut, T = C1 + M.holdB;

      /* --- scrubbed: the photograph and the drawing only --- */
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
      });
      tl.fromTo(band, { y: function () { return window.innerHeight * 0.14; } }, { y: 0, duration: 80, ease: 'power2.out' }, 0);
      /* HOLD A (C0 − A) · cut: [C0, +9] the statement leaves (time-based) · [+10, +33] the photograph alone shrinks into
         its plate · [+34, +50] one angled sweep reveals the map while stop B's type plays in (time-based) */
      tl.to(band, { x: function () { return F.x; }, y: function () { return F.y; }, scale: function () { return F.s; },
        duration: 23, ease: 'power2.inOut', immediateRender: false }, C0 + 10);
      tl.set(svg, { visibility: 'visible' }, C0 + 34);
      tl.fromTo(svg, { clipPath: sweep(-1) }, { clipPath: sweep(118), duration: 16, ease: 'power1.inOut' }, C0 + 34);
      tl.to({}, { duration: T - tl.duration() });   /* to the end of HOLD B */

      /* --- time-based text groups --- */
      var inA = gsap.timeline({ paused: true });
      stairIn(inA, linesA, 0);
      var outA = gsap.timeline({ paused: true });
      stairOut(outA, linesA.slice().reverse(), 0);
      var inB = gsap.timeline({ paused: true });
      var t = stairIn(inB, linesB, 0);
      inB.fromTo(el.querySelector('.loc-plate'), { '--rule': 0 }, { '--rule': 1, duration: 0.45, ease: 'power2.out' }, 0.2);
      stairIn(inB, capP, 0.3);
      rooms.forEach(function (r, i) {
        var at = 0.3 + i * 0.08;
        inB.set(r, { visibility: 'visible' }, at);
        inB.fromTo(r, { '--rule': 0 }, { '--rule': 1, duration: 0.45, ease: 'power2.out' }, at);
        inB.fromTo(ins[i], { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' }, at);
      });
      /* the markers belong to the drawing: they set down once the sweep has finished (their own threshold) */
      var inM = gsap.timeline({ paused: true });
      dots.forEach(function (d, i) {
        var at = i * 0.08;
        inM.fromTo(d, { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, at);
        inM.fromTo(leads[i], { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: 'power2.out' }, at + 0.1);
        inM.fromTo(labs[i], { autoAlpha: 0, x: i === 1 ? 16 : -16 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power2.out' }, at + 0.1);
      });

      /* thresholds, in vh of travel from the main trigger's start ("top 85%") */
      function at(u) { return function () { return el.getBoundingClientRect().top + window.scrollY - 0.85 * window.innerHeight + u * window.innerHeight / 100; }; }
      ST.create({ trigger: el, start: at(36), end: at(36.1),
        onEnter: function () { inA.play(); },
        onLeaveBack: function () { outA.progress(0).pause(); inA.reverse(); } });
      ST.create({ trigger: el, start: at(C0), end: at(C0 + 0.1),
        onEnter: function () { inA.progress(1); outA.play(); },
        onLeaveBack: function () { outA.reverse(); } });
      ST.create({ trigger: el, start: at(C0 + 34), end: at(C0 + 34.1),
        onEnter: function () { inB.play(); },
        onLeaveBack: function () { inB.reverse(); } });
      ST.create({ trigger: el, start: at(C0 + 50), end: at(C0 + 50.1),
        onEnter: function () { inM.play(); },
        onLeaveBack: function () { inM.reverse(); } });


      return function () {
        live = false;
        ST.removeEventListener('refreshInit', layout);
        el.classList.remove('is-live');
        el.style.removeProperty('--loc-run');
        plateImg.style.cssText = '';
        gsap.set([svg].concat(rooms), { clearProps: 'clipPath,visibility' });
        gsap.set(linesA.concat(linesB, capP, ins, dots, leads, labs, [band]), { clearProps: 'transform,clipPath,opacity,visibility' });
        rules.forEach(function (r) { r.style.removeProperty('--rule'); });
        gsap.set(rules, { clearProps: 'visibility' });
        placeAnchor();
      };
    });
  });
})();
