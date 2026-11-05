/* =============================================================================
   V3 scene motion — GSAP + ScrollTrigger (vendored); Lenis (chrome.js) is the one scroll controller.

   One continuous page (manager's notes, 2026-10-12): NO pinned scenes, nothing ever stops or moves the page.
   Each section is one screen in normal flow; its motion rides the scroll and never holds back what is to be read:
     headline  — whole lines rise inside their own mask when the section comes in (played, reversed above it)
     small type — a short lift with opacity, a beat after the headline
     photograph — a hard-edged clip that opens with the scroll from the side its composition gives it
                  (no blur, no fade, no zoom)
   Load: the hero arrival (≈1.9s, time-based, killed by the first scroll) — unchanged from V4.
   Available now: the row is driven by arrows / drag / swipe / ←→ / keyboard focus (not by the scroll).
   Reduced motion: the same composed screens, still (the row still steps, instantly). <1280: authored flow.

   HOOKS: V4.rail {go(k), index()}, V4.tl.{rail, col, locs, sell, svc, rev, ig, close, foot}, V4.close.play().
   ============================================================================= */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.V4) { document.documentElement.classList.remove('intro'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener('refresh', function () { if (window.V4 && window.V4.ink) window.V4.ink(); });
  var V4 = window.V4, geo = V4.geo, root = document.documentElement;
  V4.tl = {}; V4.targets = V4.targets || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var U = function () { return geo.u; };
  var VH = function () { return geo.vh; };
  var lines = function (sel, r) { return $$(sel + ' .m > .l', r); };
  var SCRUB = 0.6;

  var cs = getComputedStyle(root);
  var tok = function (n, d) { var v = parseFloat(cs.getPropertyValue(n)); return isNaN(v) ? d / 1000 : v / 1000; };
  var TOK = { d4: tok('--dur-4', 900), stagger: tok('--stagger', 70) };

  /* ---------------------------------------------------------------- vocabulary */
  var CLIP = { bottom: 'inset(100% 0% 0% 0%)', top: 'inset(0% 0% 100% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)' };
  var OPEN = 'inset(0% 0% 0% 0%)';

  /* a section's type enters once it is on screen: masked lines rise, other items lift in; reversed (faster) above it */
  function enter(sec, masked, others, start) {
    masked = masked.filter(Boolean); others = (others || []).filter(Boolean);
    if (!masked.length && !others.length) return null;
    var t = gsap.timeline({ paused: true });
    if (masked.length) t.fromTo(masked, { yPercent: 115 }, { yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.08, immediateRender: true }, 0);
    if (others.length) t.fromTo(others, { y: function () { return 26 * U(); }, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.07, immediateRender: true }, masked.length ? 0.28 : 0);
    var on = false;
    ScrollTrigger.create({ trigger: sec, start: start || 'top 62%',
      onEnter: function () { if (!on) { on = true; t.timeScale(1).play(); } },
      onLeaveBack: function () { if (on) { on = false; t.timeScale(2.2).reverse(); } },
      onRefresh: function (self) { if (self.progress > 0 && !on) { on = true; t.progress(1); } } });
    return t;
  }
  /* a photograph's frame opens with the scroll as the section comes up (scrubbed, so it follows the reader both ways) */
  function reveal(el, from, trigger, start, end) {
    if (!el) return null;
    return gsap.fromTo(el, { clipPath: typeof from === 'string' && CLIP[from] ? CLIP[from] : from },
      { clipPath: arguments[5] || OPEN, ease: 'power2.out', immediateRender: true,
        scrollTrigger: { trigger: trigger || el, start: start || 'top 92%', end: end || 'top 30%', scrub: SCRUB } });
  }

  var mm = gsap.matchMedia();
  /* ≥1280: the composed one-screen stages; with or without movement */
  mm.add({ desk: '(min-width: 1280px)', reduce: '(prefers-reduced-motion: reduce)' }, function (c) {
    if (!c.conditions.desk) return;
    var still = c.conditions.reduce;
    root.classList.add('motion');
    var ctx = gsap.context(function () {
      rail(still);
      services(still);
      closing(still);
      if (!still) { motionDesk(); intro(false); }
      else {   // reduced motion: the Instagram columns stand at their composed offsets (no travel)
        var START = [196, 420, 290];
        $$('[data-ig-col]').forEach(function (cl, i) { gsap.set(cl, { y: function () { return START[i] * U(); } }); });
      }
    });
    ScrollTrigger.refresh();
    jumpToHash();
    return function () { ctx.revert(); root.classList.remove('motion'); $$('.rcard__more, [data-rcard]').forEach(function (n) { n.style.visibility = ''; n.style.transform = ''; n.style.opacity = ''; }); };
  });
  mm.add('(max-width: 1279.98px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('mrise');
    var ctx = gsap.context(function () { flowRise(); intro(true); });
    return function () { ctx.revert(); root.classList.remove('mrise'); };
  });
  mm.add('(prefers-reduced-motion: reduce)', function () { root.classList.remove('intro'); });

  /* ======================================================== ≥1280 scroll-linked motion */
  function motionDesk() {
    /* 02 · Available now — the row comes in from the right as the section rises out of the hero */
    var rs = $('[data-scene="rail"]');
    if (rs) {
      var head = $('.rail__head', rs);
      enter(rs, lines('.rail__head', rs), [$('.rail__asof', head), $('.rail__all', head), $('[data-rail-nav]', rs)], 'top 55%');
      V4.tl.rail = gsap.fromTo($('[data-rail-track]', rs), { x: function () { return 0.34 * geo.vw; } },
        { x: 0, ease: 'power2.out', immediateRender: true, scrollTrigger: { trigger: rs, start: 'top bottom', end: 'top 15%', scrub: SCRUB } });
    }

    /* 03 · Collection — the cockpit opens along the diagonal (the make-swap's slanted cut), the wheel from the floor */
    var col = $('[data-scene="collection"]');
    if (col) {
      enter(col, lines('.col__text', col), $$('.col__marques li', col).concat([$('.col__rooms', col), $('.col__all', col)]));
      var CLIP_OFF = 'polygon(-30% 0%, -30% 0%, -60% 100%, -60% 100%)', CLIP_ON = 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)';
      V4.tl.col = reveal($('[data-p1]', col), CLIP_OFF, col, 'top 85%', 'top 10%', CLIP_ON);
      reveal($('[data-p2] .ph', col), 'bottom', col, 'top 60%', 'top 0%');
    }

    /* 04 · About + Locations — the three panels open from the floor, one after another */
    var lc = $('[data-scene="locs"]');
    if (lc) {
      enter(lc, lines('.lc__in', lc).filter(function (l) { return !l.closest('.lc__cols'); }), []);
      $$('.lc__panel', lc).forEach(function (p, i) { reveal(p, 'bottom', lc, 'top ' + (78 - i * 6) + '%', 'top ' + (8 - i * 6) + '%'); });
      V4.tl.locs = true;
    }

    /* 05 · Sell — the film's frame opens out to the full bleed as the section arrives */
    var sl = $('[data-scene="sell"]');
    if (sl) {
      enter(sl, lines('.sl__in', sl), [$('.sl__cta', sl)], 'top 45%');
      V4.tl.sell = reveal($('[data-sell-ph]', sl), 'inset(14% 9% 14% 9%)', sl, 'top bottom', 'top top');
      // PIN STOP (Alex, 2026-10-21): the section holds with the film running and the type still (60vh), then the
      // type leaves FIRST — it lifts away upward with the scroll (30vh) — and only then does the page move on
      var slText = $('[data-sell-text]', sl);
      var slTl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sl, start: 'top top', end: function () { return '+=' + 0.9 * VH(); }, pin: true, scrub: SCRUB, invalidateOnRefresh: true } });
      slTl.to({}, { duration: 60 }, 0)
        .to(slText, { y: function () { return -0.42 * VH(); }, autoAlpha: 0, duration: 30, ease: 'power2.in' }, 60);
    }

    /* 06 · Services — the photograph opens from the floor; the chapters lift in, in order */
    var sv = $('[data-scene="svc"]');
    if (sv) {
      enter(sv, lines('.sv__head', sv), $$('.sv__ch', sv).concat([$('.sv__fin', sv)]), 'top 55%');
      V4.tl.svc = reveal($('[data-sv-frame]', sv), 'bottom', sv, 'top 90%', 'top 15%');
      $$('.sv__rule', sv).forEach(function (r, i) {
        gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, ease: 'power2.out', immediateRender: true, scrollTrigger: { trigger: sv, start: 'top ' + (60 - i * 8) + '%', end: 'top ' + (10 - i * 8) + '%', scrub: SCRUB } });
      });
    }

    /* 07 · Reviews — the stack rises into place, tilted, as the section comes up */
    var rv = $('[data-scene="rev"]');
    if (rv) {
      enter(rv, lines('.rv__head', rv), [$('.rv__nav', rv)], 'top 55%');
      V4.tl.rev = gsap.fromTo($('[data-rv-stack]', rv), { y: function () { return 0.26 * VH(); }, rotate: 2.5 },
        { y: 0, rotate: 0, ease: 'power2.out', immediateRender: true, scrollTrigger: { trigger: rv, start: 'top bottom', end: 'top 10%', scrub: SCRUB } });
    }

    /* 08 · Instagram — three columns travel with the scroll at three rates (in place when the section is centred) */
    var ig = $('[data-scene="ig"]');
    if (ig) {
      enter(ig, lines('.igs__head', ig), [$('.igs__cta', ig)], 'top 50%');
      var START = [196, 420, 290], RATE = [1, 1.45, 0.75], K = 620;
      $$('[data-ig-col]', ig).forEach(function (cl, i) {
        gsap.fromTo(cl, { y: function () { return (START[i] + 0.5 * K * RATE[i]) * U(); } },
          { y: function () { return (START[i] - 0.5 * K * RATE[i]) * U(); }, ease: 'none', immediateRender: true,
            scrollTrigger: { trigger: ig, start: 'top bottom', end: 'bottom top', scrub: SCRUB, invalidateOnRefresh: true } });
      });
      V4.tl.ig = true;
    }

    /* 09 · Showrooms footer — the head and the three cards come up at three rates */
    var ft = $('[data-scene="foot"]');
    if (ft) {
      var tl = V4.tl.foot = gsap.timeline({ scrollTrigger: { trigger: ft, start: 'top bottom', end: 'top 25%', scrub: SCRUB } });
      tl.fromTo($('.foot__head', ft), { y: function () { return 80 * U(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.2);
      $$('[data-foot-card]', ft).forEach(function (card, i) {
        tl.fromTo(card, { y: function () { return (130 + i * 70) * U(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.2);
      });
    }
  }

  /* ============================================== 02 · AVAILABLE NOW — the row (≥1280) */
  function rail(still) {
    var sec = $('[data-scene="rail"]'); if (!sec) return;
    var view = $('[data-rail-view]', sec), cards = $$('[data-rcard]', sec), n = cards.length;
    var prev = $('[data-rail-prev]', sec), next = $('[data-rail-next]', sec), num = $('[data-rail-n]', sec), of = $('[data-rail-of]', sec);
    /* layout (stage px) — inventory tiles (Kirsten via Alex, 2026-10-12): every tile the same size, FW × (3:2 photo +
       plate) inside one graphite panel; the track starts on the head's column (x 120), tiles GAP apart, four across
       the 120→1800 column, the rest running off the right edge. The row moves by x only; tiles already passed leave
       to the left and fade as they cross the column edge. Full info on every tile. */
    var FW = 390, GAP = 40;
    var shortMQ = matchMedia('(max-height: 820px)');   // v3.css: tiles step down to 330 on short desktop viewports
    var fit = function () { FW = shortMQ.matches ? 330 : 390; };
    fit();
    var st = { f: 0 }, cur = 0;
    var set = cards.map(function (c) { return { x: gsap.quickSetter(c, 'x', 'px'), o: gsap.quickSetter(c, 'opacity') }; });
    function focus() {
      var u = U(), f = st.f;
      cards.forEach(function (c, i) {
        set[i].x(-f * (FW + GAP) * u);
        var o = i < f ? Math.max(0, 1 - (f - i) * 1.6) : 1;              // a tile leaving to the left takes itself with it
        set[i].o(o);
        c.style.visibility = o < 0.01 ? 'hidden' : '';
      });
    }
    function ui() {
      if (num) num.textContent = ('0' + (cur + 1)).slice(-2);
      if (of) of.textContent = ('0' + n).slice(-2);
      if (prev) prev.disabled = cur <= 0;
      if (next) next.disabled = cur >= n - 1;
      cards.forEach(function (c, i) { c.toggleAttribute('data-focus', i === cur); });
    }
    function go(k, quick) {
      cur = Math.max(0, Math.min(n - 1, k)); ui();
      gsap.to(st, { f: cur, duration: still || quick === 0 ? 0 : (quick ? 0.5 : 0.85), ease: 'power3.inOut', onUpdate: focus, overwrite: true });
    }
    V4.rail = { go: go, index: function () { return cur; }, state: st };
    if (prev) prev.addEventListener('click', function () { go(cur - 1); });
    if (next) next.addEventListener('click', function () { go(cur + 1); });
    sec.addEventListener('keydown', function (e) {
      if (!e.target.closest('[data-rail-view], [data-rail-nav]')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    var dragged = false;
    cards.forEach(function (card, k) {
      card.addEventListener('focusin', function () { if (card.querySelector(':focus-visible') && k !== cur) go(k, 0.5); });
      card.addEventListener('click', function (e) {   // every tile is a full card now: its link works wherever it sits; a drag never clicks
        if (dragged) { e.preventDefault(); }
      });
    });
    /* drag / swipe: the row follows the pointer, then settles on the nearest tile (a flick moves one on) */
    var x0 = 0, f0 = 0, t0 = 0, down = false, pid = null;
    var pitch = function () { return (FW + GAP) * U(); };
    view.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true; dragged = false; x0 = e.clientX; f0 = st.f; t0 = performance.now(); pid = e.pointerId;
      gsap.killTweensOf(st);
    });
    view.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== pid) return;
      var dx = e.clientX - x0;
      if (!dragged && Math.abs(dx) > 6) { dragged = true; view.classList.add('is-drag'); try { view.setPointerCapture(pid); } catch (er) {} }
      if (!dragged) return;
      var f = f0 - dx / pitch();
      if (f < 0) f = f * 0.35; if (f > n - 1) f = n - 1 + (f - n + 1) * 0.35;
      st.f = f; focus();
    });
    function up(e) {
      if (!down || (e && e.pointerId !== pid)) return;
      down = false; view.classList.remove('is-drag');
      if (!dragged) return;
      var dx = (e ? e.clientX : x0) - x0, v = dx / Math.max(1, performance.now() - t0);
      var k = Math.round(st.f);
      if (Math.abs(v) > 0.5 && k === Math.round(f0)) k += v < 0 ? 1 : -1;
      go(k, true);
      setTimeout(function () { dragged = false; }, 0);
    }
    view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });
    /* a sideways trackpad swipe steps the row; vertical wheel is the page's, always */
    var wx = 0, wt = 0;
    view.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      var now = performance.now(); if (now - wt > 260) wx = 0;
      wt = now; wx += e.deltaX;
      if (Math.abs(wx) > 60) { go(cur + (wx > 0 ? 1 : -1)); wx = -Math.sign(wx) * 400; }
    }, { passive: false });
    addEventListener('resize', function () { fit(); focus(); });
    ui(); focus();
  }

  /* ================================= 06 · SERVICES — one chapter lit; its photograph opens in the frame */
  function services(still) {
    var sec = $('[data-scene="svc"]'); if (!sec) return;
    var imgs = $$('.sv__img', sec), chs = $$('[data-sv-ch]', sec), on = -1, z = 1;
    function pick(k, instant) {
      if (k === on || !imgs[k]) return;
      on = k;
      chs.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      var im = imgs[k];
      if (im.loading === 'lazy') im.loading = 'eager';
      im.style.zIndex = ++z;
      gsap.fromTo(im, { clipPath: instant || still ? OPEN : CLIP.bottom }, { clipPath: OPEN, duration: instant || still ? 0 : 0.8, ease: 'power3.inOut', overwrite: true });
    }
    imgs.forEach(function (im, i) { gsap.set(im, { clipPath: i === 0 ? OPEN : CLIP.bottom }); });
    pick(0, true);
    chs.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { pick(i); });
      c.addEventListener('focusin', function () { pick(i); });
    });
    V4.svcPick = pick;
    // anchors: every chapter id lands on the section (its chapter lit), never with the chapter under the header
    var top = function () { return sec.getBoundingClientRect().top + window.scrollY; };
    ['services', 'service', 'insurance', 'ppf', 'finance'].forEach(function (id) {
      var k = { service: 0, insurance: 1, ppf: 2 }[id];
      V4.targets[id] = function () { if (k != null) pick(k, true); return top(); };
    });
  }

  /* ================================= 09 · CLOSE — the trio settles once on entry (the hero's camera, reversed) */
  function closing(still) {
    var sec = $('[data-scene="close"]'); if (!sec) return;
    var CAM = { vpx: 960, hy: 540, reach: 3.2, spread: 0.55, shrink: 0.22 }, D = 1 - 1 / CAM.reach, GATHER = 44;
    var IMG = { lambo: { ax: 689, ay: 662, body: 1224 }, porsche: { ax: 683, ay: 779, body: 1196 }, ferrari: { ax: 673, ay: 716, body: 1212 } };
    var REST = { lambo: [960, 770, 610], porsche: [600, 706, 432], ferrari: [1360, 700, 432] };
    var STAGE = { lambo: [0.10, 0], porsche: [0, 0.16], ferrari: [0.03, 0.13] };
    var rig = $$('[data-cl-car]', sec).map(function (el) {
      var nm = el.getAttribute('data-cl-car'), f = REST[nm];
      return { n: nm, el: el, m: IMG[nm], f: f, flank: nm !== 'lambo', side: Math.sign(f[0] - 960), z: (REST.lambo[1] - CAM.hy) / (f[1] - CAM.hy) };
    });
    function project(c, p, g) {
      var r = 1 / (1 - D * p / c.z);
      var lane = c.flank ? 1 + CAM.spread * Math.max(p, 0) : 1, k = c.flank ? r * (1 - CAM.shrink * Math.max(p, 0)) : r;
      var x0 = c.f[0] + (c.flank ? c.side * GATHER * (1 - g) : 0);
      return { x: CAM.vpx + (x0 - CAM.vpx) * r * lane, y: CAM.hy + (c.f[1] - CAM.hy) * k, w: c.f[2] * k };
    }
    var cam = { T: 1 }, ease = gsap.parseEase('power2.inOut'), easeOut = gsap.parseEase('power3.out');
    function shoot() {
      var u = U(), sl = (innerWidth - 1920 * u) / 2, stt = (innerHeight - 1080 * u) / 2, T = cam.T;
      var g = ease(gsap.utils.clamp(0, 1, (T - 0.62) / 0.38));
      rig.forEach(function (c) {
        var s = STAGE[c.n], q = easeOut(gsap.utils.clamp(0, 1, (T - s[0]) / (1 - s[0] - s[1])));
        var a = project(c, 1 - q, g), k = a.w / c.m.body * u;
        c.el.style.transform = 'translate(' + (sl + a.x * u - c.m.ax * k) + 'px,' + (stt + a.y * u - c.m.ay * k) + 'px) scale(' + k + ')';
      });
    }
    addEventListener('resize', shoot);
    if (still) { cam.T = 1; shoot(); return; }
    /* a small entrance (Alex: keep the bookend, unpinned): the trio rolls the last stretch back into its resting group
       (T 0.55 → 1, 1.6s) while the type steps down into place and the CTA comes up; reversed when the reader goes back up */
    var text = [$('.cl__kicker', sec), $('.close__h', sec), $('.cl__sub', sec)].filter(Boolean), cta = $('.close__cta', sec);
    var t = V4.tl.close = gsap.timeline({ paused: true });
    t.fromTo(cam, { T: 0.55 }, { T: 1, duration: 1.6, ease: 'power2.out', onUpdate: shoot, immediateRender: true }, 0);
    t.fromTo(text, { y: function () { return -24 * U(); }, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12, immediateRender: true }, 0.35);
    if (cta) t.fromTo(cta, { y: function () { return 40 * U(); }, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)', immediateRender: true }, 0.9);
    var on = false;
    ScrollTrigger.create({ trigger: sec, start: 'top 55%',
      onEnter: function () { if (!on) { on = true; t.timeScale(1).play(); } },
      onLeaveBack: function () { if (on) { on = false; t.timeScale(2).reverse(); } },
      onRefresh: function (self) { if (self.progress > 0 && !on) { on = true; t.progress(1); } } });
    V4.close = { play: function () { on = true; t.progress(1); } };
  }

  /* ------------------------------------- the hero arrival (load, time-based) — as delivered in V4 */
  function intro(mobile) {
    var ap = $('[data-approach]');
    if (!ap || !root.classList.contains('intro')) return;
    if (window.scrollY > 40) { root.classList.remove('intro'); return; }
    var f1 = $('[data-f1]', ap), cars = { ferrari: $('.car--ferrari', ap), porsche: $('.car--porsche', ap), ford: $('.car--ford', ap) };
    var lineDrop = function (i, el) { return el.offsetHeight * 1.3; };
    var t = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: done });
    if (mobile) {
      t.fromTo(lines('.hero__kicker', f1), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
      t.fromTo(lines('.hero__title', f1), { y: lineDrop, opacity: 1 }, { y: 0, duration: 1.05, stagger: 0.12 }, 0.22);
    } else {
      gsap.set([$('.hero__title', f1), $('.hero__kicker', f1)], { opacity: 0 });
      t.fromTo($('.hero__title', f1), { '--rise': function () { return 175 * U() + 'px'; }, opacity: 0 }, { '--rise': '0px', duration: 1.9, ease: 'power2.out' }, 1.5);
      t.to($('.hero__title', f1), { opacity: 1, duration: 0.7, ease: 'power1.in' }, 1.5);
      t.fromTo($('.hero__kicker', f1), { '--rise': function () { return 215 * U() + 'px'; }, opacity: 0 }, { '--rise': '0px', duration: 1.9, ease: 'power2.out' }, 1.7);
      t.to($('.hero__kicker', f1), { opacity: 1, duration: 0.8, ease: 'power1.in' }, 1.7);
    }
    var stage = $('[data-car-stage]', ap);
    t.set($$('.car img', ap), { opacity: 1 }, 0);
    t.fromTo(stage, { opacity: 0, y: function () { return -12 * U(); } }, { opacity: 1, y: 0, duration: 1.3, ease: 'power2.out' }, 0.15);
    [['ferrari', -1], ['porsche', 1]].forEach(function (c) {
      t.fromTo($$('.car__shadow, .car__body', cars[c[0]]), { x: function () { return c[1] * 44 * U(); } }, { x: 0, duration: 1.6, ease: 'power3.out' }, 0.15);
    });
    t.fromTo($('.hero__cta', f1), { opacity: 1, y: 18, clipPath: 'inset(100% 0% 0% 0%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out' }, 1.28);
    root.classList.remove('intro');
    V4.intro = V4.introTL = t;
    function done() { window.removeEventListener('scroll', cut); V4.intro = null; }
    function cut() { if (window.scrollY > 4 && t.progress() < 1) { t.cut = true; t.progress(1); } }   // the reader's scroll always wins
    window.addEventListener('scroll', cut, { passive: true });
    var start = function () { if (t.progress() < 1 && !t.isActive() && !t.cut) t.play(); };
    var imgs = $$('.car img', ap);
    Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : 0].concat(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : 0; }))),
      new Promise(function (r) { setTimeout(r, 2400); })
    ]).then(start);
    t.progress(0.0001).pause();
  }

  /* ------------------------------ <1280: authored flow, headlines rise once */
  function flowRise() {
    $$('.scene h2.disp').filter(function (h) { return h.querySelector('.m > .l'); }).forEach(function (h) {
      var ls = $$('.m > .l', h);
      gsap.set(ls, { yPercent: 110 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(ls, { yPercent: 0, duration: TOK.d4, ease: 'expo.out', stagger: TOK.stagger, overwrite: true });
      } });
    });
    $$('.col__p1, .col__p2 .ph, .lc__panel, .sv__frame, .igs__tile a').forEach(function (el) {
      var from = el.closest('.col__p2') ? 'right' : 'bottom';
      gsap.set(el, { clipPath: CLIP[from] });
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(el, { clipPath: OPEN, duration: TOK.d4, ease: 'power3.inOut', overwrite: true });
      } });
    });
  }

  /* ------------------------------------------- deep links (e.g. inventory → #ppf) */
  V4.targets.top = function () { return 0; };
  V4.targets.about = function () { var l = $('#locations'); return l ? l.getBoundingClientRect().top + window.scrollY : 0; };
  function jumpToHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || id === 'main') return;
    var go = function () { ScrollTrigger.refresh(); V4.go(id, true); };
    if (document.readyState === 'complete') requestAnimationFrame(go);
    else window.addEventListener('load', function () { requestAnimationFrame(go); }, { once: true });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (document.readyState === 'complete') ScrollTrigger.refresh(); });
})();
