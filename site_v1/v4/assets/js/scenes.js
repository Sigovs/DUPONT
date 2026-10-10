/* =============================================================================
   V4 scene choreography — GSAP + ScrollTrigger (vendored); Lenis (chrome.js) is the one scroll
   controller, driven by gsap.ticker.

   Desktop (≥1280, motion allowed): one pinned stage per chapter. Every chapter after the
   Approach ARRIVES AS A SHEET over the held previous one and LEAVES by being covered: the
   outgoing chapter drifts up slower than the sheet (two planes), so a chapter never scrolls
   away with its type half under the header and no frame is an empty gap.
   Inside a sheet, photographs open with hard-edged clip reveals from the side they belong to
   and travel on their own clocks; type uses a small vocabulary chosen by role:
     headline  — whole lines rising in their own mask (+ a small directional drift), never a
                 horizontal slide through a clip (that shows half-cut words)
     eyebrow   — a short horizontal slide, the red rule drawing first
     deck      — a soft rise with controlled opacity (small text only, never headlines)
     wake      — the Collection's lines rise as the departing Ford's shadow clears them
   Everything lands exactly as the sheet lands, then holds pixel-still ≥40vh.

   Units: pinned timelines are written in vh of scroll (duration 1 = 1vh); cover timelines run
   0 → 1 over the sheet's travel. Text lives in .m (mask) > .l (moves).
   Load: the hero arrival (≈1.9s, time-based, skipped when the page opens away from the top,
   killed by the first scroll). <1280: authored flow, headlines rise once on entry.
   Reduced motion / no JS: the static composed build.

   HOOKS: V4.tl.{approach, rail, locs, sell, svc, rev, ig}; labels "F1"…"F5", "hold", "cover".
   V4.holds() → every reading stop as [startY, endY] (QA + recording). V4.intro = the arrival.
   ============================================================================= */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.V4 || !window.V4.cars) { document.documentElement.classList.remove('intro'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener('refresh', function () { if (window.V4 && window.V4.ink) window.V4.ink(); });
  var V4 = window.V4, geo = V4.geo, root = document.documentElement;
  V4.tl = {}; V4.holdList = [];
  var SCRUB = /[?&]capture/.test(location.search) ? true : 0.5;   // ?capture: exact scrub for frame-stepped recordings
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var U = function () { return geo.u; };
  var VH = function () { return geo.vh; };
  var lines = function (sel, r) { return $$(sel + ' .l', r); };

  /* motion tokens (v4.css :root) — event-based tweens read them; scrubs map to the scroll range */
  var cs = getComputedStyle(root);
  var tok = function (n, d) { var v = parseFloat(cs.getPropertyValue(n)); return isNaN(v) ? d / 1000 : v / 1000; };
  var TOK = { d2: tok('--dur-2', 240), d3: tok('--dur-3', 420), d4: tok('--dur-4', 900), stagger: tok('--stagger', 70) };
  var COVER = 100;   // vh: the incoming sheet's travel over the held chapter
  var DRIFT = 56;    // stage px of directional drift on a headline line

  /* ---- type vocabulary */
  function rise(tl, els, at, dur, dir, stagger) {       // headline: masked rise + drift
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.fromTo(els, { yPercent: 128, x: function () { return (dir || 0) * DRIFT * U(); } },
      { yPercent: 0, x: 0, duration: dur, ease: 'power3.out', stagger: stagger || 0, immediateRender: true }, at);
  }
  function leave(tl, els, at, dur, dir, stagger) {      // headline exit: up through the mask
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.to(els, { yPercent: -128, x: function () { return (dir || 0) * DRIFT * 0.5 * U(); }, duration: dur, ease: 'power2.in', stagger: stagger || 0 }, at);
  }
  function slide(tl, els, at, dur, dir) {               // eyebrow: short horizontal slide
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.fromTo(els, { xPercent: (dir || -1) * 14, opacity: 0 }, { xPercent: 0, opacity: 1, duration: dur, ease: 'power2.out', immediateRender: true }, at);
  }
  function soft(tl, els, at, dur, stagger) {            // deck / small text: soft rise
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.fromTo(els, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: dur, ease: 'power2.out', stagger: stagger || 0, immediateRender: true }, at);
  }  /* Alex (2026-10-09): section type steps in when its screen becomes active — a stepped slide-in played in time,
     not scrubbed; reversed (faster) when the reader goes back above it. Masked lines (.l) rise out of their mask,
     everything else lifts and fades. Returns { show, hide }. */
  function stepIn(items) {
    var t = gsap.timeline({ paused: true }), k = 0;
    items.forEach(function (el) {
      if (!el) return;
      // from the side (Alex): masked lines slide in from behind their mask's left edge, the rest from the left with a fade
      if (el.classList.contains('l')) {
        gsap.set(el, { xPercent: -104 });
        t.to(el, { xPercent: 0, duration: 1.0, ease: 'expo.out' }, k * 0.085);
      } else {
        gsap.set(el, { x: function () { return -48 * U(); }, autoAlpha: 0 });
        t.to(el, { x: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out' }, k * 0.085);
      }
      k++;
    });
    var on = false;
    return {
      show: function () { if (on) return; on = true; t.timeScale(1).play(); },
      hide: function () { if (!on) return; on = false; t.timeScale(2.2).reverse(); }
    };
  }

  function drawRule(tl, el, at, dur) { if (el) tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: dur, ease: 'power2.out', immediateRender: true }, at); }
  /* ---- photographs: the frame's own clip opens from one edge (no blur, no fade, no zoom) */
  var CLIP = { bottom: 'inset(100% 0% 0% 0%)', top: 'inset(0% 0% 100% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)' };
  function reveal(tl, els, at, dur, from, stagger) {
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.fromTo(els, { clipPath: CLIP[from] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'power3.inOut', stagger: stagger || 0, immediateRender: true }, at);
  }
  /* ---- exits: while covered, the outgoing plane drifts up slower than the sheet (scroll-linked).
     Uses yPercent / xPercent or a container's y, never a property the entrance owns (G6). */
  function drift(tl, els, at, vars) {
    els = [].concat(els).filter(Boolean); if (!els.length) return;
    tl.to(els, Object.assign({ duration: COVER, ease: 'none' }, vars), at);
  }

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('motion');
    var ctx = gsap.context(function () { build(); intro(false); });
    ScrollTrigger.refresh();
    jumpToHash();
    return function () {
      ctx.revert();
      gsap.set($$('[data-approach] .car'), { clearProps: 'transform' });   // the camera rig writes via quickSetter (outside the context's record)
      root.classList.remove('motion');
      $$('.rcard__more').forEach(function (n) { n.style.visibility = ''; });
      var ap = $('[data-approach]'); if (ap) delete ap.dataset.inkLive;
      V4.targets = {}; V4.holdList = [];
    };
  });
  mm.add('(max-width: 1279.98px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('mrise');
    var ctx = gsap.context(function () { flowRise(); intro(true); });
    return function () { ctx.revert(); root.classList.remove('mrise'); };
  });
  mm.add('(prefers-reduced-motion: reduce)', function () { root.classList.remove('intro'); });

  function pinTL(trigger, vhLen, extra) {
    return gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: Object.assign({
        trigger: trigger, start: 'top top', end: function () { return '+=' + vhLen * VH() / 100; },
        pin: true, scrub: SCRUB, invalidateOnRefresh: true
      }, extra || {})
    });
  }
  function stY(tl, t) {   // scroll position of timeline time t (vh units) inside a pinned trigger
    var st = tl.scrollTrigger; return st.start + (t / tl.duration()) * (st.end - st.start);
  }
  function hold(tl, a, b) { V4.holdList.push([tl, a, b]); }

  /* a chapter that arrives as a sheet over the held previous chapter */
  function sheet(sec) { gsap.set(sec, { marginTop: function () { return -VH(); } }); }
  function coverTL(sec) {   // 0 → 1 = the sheet's top travels from the viewport bottom to the top
    return gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: SCRUB, invalidateOnRefresh: true } });
  }

  /* ======================================================================== */
  function build() {
    approach();
    rail();
    locs();
    sell();
    services();
    reviews();
    instagram();
    closing();
    footer();
  }

  /* ------------------------------------------------ 01 + 02 · THE APPROACH
     ONE CAMERA, THREE CARS (Alex, 2026-10-09). The trio stands still on one ground plane, each car in
     its own straight lane at its own depth; the CAMERA dollies toward them. Nothing per car is
     animated — every car's x, y and scale are projected from one number, the camera travel p (0 → 1),
     which is scrubbed linearly with the scroll (Lenis + scrub 0.5 are the only smoothing; no snap).

     Pinhole model in stage units (1920 × 1080): vanishing point VP = (960, 540), horizon = stage centre.
     F1 back-projects onto it with a 0.72 m camera height: Ford Z 5.17 m (lane X +0.07), Porsche Z 6.96 m
     (X +1.75), Ferrari Z 7.48 m (X −1.66); recovered widths 1.95 / 1.83 / 1.98 m against the real 1.95 /
     1.85 / 1.94 m, so the Figma frame IS a consistent photograph of one floor. With depths expressed
     relative to the Ford (z = Z / Z_ford, read from each car's F1 contact line), a camera advance of
     D · Z_ford magnifies a car by  r = 1 / (1 − D·p / z)  and every screen point of it moves away from
     VP by r:   x = VPx + (x1 − VPx)·r,  contactY = HY + (y1 − HY)·r,  W = W1·r.
     So the contact line descends, the flanks part along their perspective lines, the nearer car
     grows fastest, and the shadow (in the car's own group, hung off the contact anchor) stays planted.
     Constant camera speed → the visible approach accelerates as it nears: that is the weight.

     Scroll budget (vh): APPROACH 280 = the dolly; over its last SHEET 80 (28.6 %) the Collection rises
     over the hero as an opaque ivory sheet while the cars keep coming behind it; READ 40 = the
     Collection holds; COVER 100 = the rail sheet covers it (unchanged idiom). Pin = 420vh. */
  function approach() {
    var CAM = { vpx: 960, hy: 540, reach: 3.2, spread: 0.32, shrink: 0.2 };   // reach = the Ford's magnification at p = 1 (under the sheet)
    // flanks (Alex, 2026-10-09): as the trio comes, the side cars part outward (+32 % lateral at p = 1) and stay a touch
    // smaller than the camera alone would make them (−20 % at p = 1) — they fall back behind the Ford. 0 at F1; the Ford is untouched
    var ap = $('[data-approach]'); if (!ap) return;
    var hero = $('[data-scene="hero"]', ap), col = $('[data-scene="collection"]', ap);
    var f1 = $('[data-f1]', ap), f3 = $('[data-f3]', ap), cta = $('.hero__cta', f1);
    var p2 = $('[data-p2]', ap), p2ph = $('[data-p2] .ph', ap), idxBlock = $('[data-col-index]', ap);
    var colText = $('[data-col-text]', ap);
    var colEye = lines('.eyebrow', colText), colH = lines('.col__h', colText), colDeck = lines('.deck', colText);
    var colRule = $('.rule', colText);
    var p1 = $('[data-p1]', ap);

    var APPROACH = 280, SHEET = 80, DWELL = 60, STEPM = 45, NMAKE = (V4.colSwap ? V4.colSwap.makes.length : 6), TAIL = 30;
    // Collection sticky (Alex): DWELL to read, then STEPM vh per make — the scroll walks the makes — then a short TAIL
    var READ = DWELL + NMAKE * STEPM + TAIL, S0 = APPROACH - SHEET, F5 = APPROACH, END = APPROACH + READ, M0 = F5 + DWELL;

    /* ---- the rig: one camera, world positions read from F1 (a new cut-out in v4-assets.js just works) */
    var F1 = V4_ASSETS.frames.F1, names = ['ferrari', 'porsche', 'ford'];
    var D = 1 - 1 / CAM.reach;
    var rig = names.map(function (n) {
      var el = $('.car--' + n, ap), f = F1[n];
      return { el: el, f: f, z: (F1.ford[1] - CAM.hy) / (f[1] - CAM.hy),   // depth relative to the Ford
        sx: gsap.quickSetter(el, 'x', 'px'), sy: gsap.quickSetter(el, 'y', 'px'),
        kx: gsap.quickSetter(el, 'scaleX'), ky: gsap.quickSetter(el, 'scaleY') };
    });
    // 2D transforms on purpose: a will-change / 3D layer is rasterised once at F1 size and would go soft at ×3
    gsap.set(rig.map(function (c) { return c.el; }), { x: 0, y: 0, scale: 1, force3D: false });
    var cam = { p: 0 };
    V4.cam = { model: CAM, project: project };
    function project(n, p) {   // → stage-unit anchor x, contact y, width (QA + the rig)
      var c = rig[names.indexOf(n)], r = 1 / (1 - D * p / c.z);
      var lane = n === 'ford' ? 1 : 1 + CAM.spread * p, k = n === 'ford' ? r : r * (1 - CAM.shrink * p);
      return { x: CAM.vpx + (c.f[0] - CAM.vpx) * r * lane, y: CAM.hy + (c.f[1] - CAM.hy) * k, w: c.f[2] * k, r: k };   // contact line follows the size (smaller = further back)
    }
    function shoot() {
      var u = U();
      rig.forEach(function (c, i) {
        var q = project(names[i], cam.p);
        c.sx((q.x - c.f[0]) * u); c.sy((q.y - c.f[1]) * u); c.kx(q.r); c.ky(q.r);
      });
    }

    /* ---- the Collection is a sheet: opaque ivory, laid out in its landed state, parked one screen down */
    gsap.set(col, { y: function () { return VH(); } });
    gsap.set(f3, { autoAlpha: 0 });                    // the old F3 eyebrow has no place in the dolly
    gsap.set(colRule, { scaleX: 0 });

    var tl = V4.tl.approach = pinTL(ap, END + COVER, { onRefresh: shoot });
    tl.addLabel('F1', 0); hold(tl, 0, 0);

    // the camera: linear in scroll from the first pixel to the moment the sheet has covered the trio
    tl.fromTo(cam, { p: 0 }, { p: 1, duration: APPROACH, ease: "none", onUpdate: shoot, immediateRender: false }, 0);

    // the start frame's type and CTA stay where they are, under the car stage: the approaching trio covers them

    // the sheet: rises 1 : 1.25 with the scroll over the last 80vh of the dolly; the cars keep coming behind it
    tl.addLabel('sheet', S0);
    tl.fromTo(col, { y: function () { return VH(); } }, { y: 0, duration: SHEET, ease: 'none', immediateRender: false }, S0);
    // P2 travels a little behind the sheet (its own plane) and opens from the floor up; both land with it
    tl.fromTo(p2, { y: function () { return 0.16 * VH(); } }, { y: 0, duration: SHEET, ease: 'power2.out', immediateRender: false }, S0);
    reveal(tl, p2ph, S0 + 18, SHEET - 18, 'bottom');
    // the type steps in once the sheet has landed (Alex): kicker · title · caps line · each make · View all
    var colStep = stepIn([].concat(colEye, colH, colDeck, $$('.col__marques li', idxBlock), [$('.col__all', idxBlock)]));
    // fully covered: the hero stops painting
    tl.set(hero, { autoAlpha: 0 }, F5 + 0.5);

    /* F5 · the Collection holds, then the rail sheet covers it as it drifts up */
    tl.addLabel('F5', F5).to({}, { duration: READ }, F5); hold(tl, F5, END);
    tl.addLabel('cover', END).to({}, { duration: COVER }, END);
    drift(tl, p1, END, { yPercent: -18 });
    drift(tl, p2, END, { yPercent: -30 });
    drift(tl, colText, END, { y: function () { return -60 * U(); } });
    drift(tl, idxBlock, END, { yPercent: -12 });

    // intro (Alex) — created AFTER the drifts: their overwrite would kill an earlier tween on p1 — the photo block slides in whole from the right, Ferrari already in it, as the type steps in
    // appears from nowhere along a diagonal edge (Alex) — the same slanted cut as the make swap
    var CLIP_OFF = 'polygon(-30% 0%, -30% 0%, -60% 100%, -60% 100%)', CLIP_ON = 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)';
    gsap.set(p1, { x: 0, clipPath: CLIP_OFF });
    var p1On = false;
    var colShow = colStep.show, colHide = colStep.hide;
    colStep.show = function () { colShow(); if (!p1On) { p1On = true; gsap.to(p1, { clipPath: CLIP_ON, duration: 1.1, ease: 'power3.inOut', overwrite: 'auto' }); } };
    colStep.hide = function () { colHide(); if (p1On) { p1On = false; gsap.to(p1, { clipPath: CLIP_OFF, duration: 0.5, ease: 'power2.in', overwrite: 'auto' }); } };

    // header ink follows the sheet's edge (hero: light; Collection: split) — also while the scrub catches up;
    // the Collection's type steps in when the sheet is (almost) home and steps out if the reader goes back up
    tl.eventCallback('onUpdate', function () {
      V4.ink();
      var t = tl.time();
      if (t >= F5 - 6) colStep.show(); else if (t < S0 + SHEET * 0.6) colStep.hide();
      // the makes walk with the scroll while the Collection is pinned: segment k selects make k (photo wipes in diagonally)
      if (V4.colSwap) {
        var k = Math.floor((t - M0) / STEPM);
        V4.colSwap.select(t < M0 ? null : V4.colSwap.makes[Math.min(NMAKE - 1, k)]);
      }
    });
    shoot();

    V4.targets.top = function () { return 0; };
    V4.targets.collection = function () { return stY(tl, F5 + 1); };

    /* PIN STOP (Alex, 2026-10-09 — as on Czinger, and our rule: a pinned text beat holds still ≥ 40–60vh):
       the Collection docks. Its stop = the sheet fully home (F5), then READ 60vh of complete stillness.
       When the scroll goes idle inside the stop's zone — the last 35 % of a viewport before it while moving down,
       or anywhere in its hold — the page glides to the stop in the direction of travel, never back against it.
       Any wheel / touch / pointer / key input cancels a glide at once. Space · PageDown/Up · arrows step to it.
       Outside the zone (the hero's dolly) nothing moves on its own. ?settle=0 turns it off (verification). */
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('collection', function () {
      // stops: the landed Collection, then the middle of each make's segment
      var stops = [stY(tl, F5 + 1)];
      for (var i = 0; i < NMAKE; i++) stops.push(stY(tl, M0 + i * STEPM + STEPM / 2));
      return { stops: stops, lo: stops[0] - 0.35 * VH(), hi: stY(tl, END) };
    });
  }

  function dock(key, zoneFn) {
    V4.dockZones = V4.dockZones || {};
    V4.dockZones[key] = zoneFn;                             // the newest pin context's zone per section (contexts rebuild on resize)
    V4.dockZone = V4.dockZones.collection;
    if (V4.docked) return; V4.docked = true;
    // the zone the reader is in (or approaching), of all docking sections
    var zoneOf = function () {
      try {
        if (!matchMedia('(min-width: 1280px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
        var y = V4.lenis.scroll, best = null;
        Object.keys(V4.dockZones).forEach(function (k) { var z = V4.dockZones[k](); if (y >= z.lo && y <= z.hi) best = z; });
        if (best) return best;
        var near = null;   // for keys: the nearest zone within a screen
        Object.keys(V4.dockZones).forEach(function (k) { var z = V4.dockZones[k](); if (!near || Math.abs(z.stops[0] - y) < Math.abs(near.stops[0] - y)) near = z; });
        return near;
      } catch (e) { return null; }
    };
    var lastWheel = 0, lenis = V4.lenis, dir = 1, lastY = lenis.scroll, lastMove = 0, armed = false, gliding = false, touching = false;
    var IDLE = 90, ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    // between two docking sections (a tick just past one's last stop): go on to the next one's first stop, or back
    // to the previous one's last — the page never rests in the seam. Only across short gaps (< 1.3 screens).
    function bridge(y, d) {
      var zs = Object.keys(V4.dockZones).map(function (k) { try { return V4.dockZones[k](); } catch (e) { return null; } }).filter(Boolean);
      var G = 1.3 * VH(), prev = null, next = null;
      zs.forEach(function (z) {
        if (z.hi < y && y - z.hi < G && (!prev || z.hi > prev.hi)) prev = z;
        if (z.lo > y && z.lo - y < G && (!next || z.lo < next.lo)) next = z;
      });
      if (!prev || !next) return null;
      return d > 0 ? next.stops[0] : prev.stops[prev.stops.length - 1];
    }
    function target(y, d) {
      if (!matchMedia('(min-width: 1280px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
      var z = zoneOf();
      if (!z || y < z.lo || y > z.hi) return bridge(y, d);
      for (var q = 0; q < z.stops.length; q++) if (Math.abs(z.stops[q] - y) <= 2) return null;   // already resting on a stop
      if (d > 0) {
        for (var i = 0; i < z.stops.length; i++) if (z.stops[i] > y + 1) return z.stops[i];   // next stop down
        var last = z.stops[z.stops.length - 1];
        return y - last <= 0.06 * VH() ? last : null;       // only a nudge past the last stop settles back; a real tick moves on
      }
      if (y <= z.stops[0] + 1) return z.back != null && y < z.stops[0] - 2 && y > z.back + 2 ? z.back : null;   // above the first stop going up: free, or back to the previous section's last stop
      for (var j = z.stops.length - 1; j >= 0; j--) if (z.stops[j] < y - 1) return z.stops[j];   // previous stop up
      return null;
    }
    function glide(t) {
      gliding = true; armed = false;
      var dist = Math.abs(t - lenis.scroll) / VH();
      lenis.scrollTo(t, { duration: Math.min(0.9, Math.max(0.6, 0.55 + dist * 0.3)), easing: ease, force: true,
        onComplete: function () { gliding = false; armed = false; lastY = lenis.scroll; lastWheel = 0; } });
    }
    lenis.on('scroll', function () { if (lenis.direction) dir = lenis.direction; });
    gsap.ticker.add(function () {
      var y = lenis.scroll, now = performance.now();
      var moved = Math.abs(y - lastY) > 0.5;
      if (moved) { lastY = y; lastMove = now; if (!gliding) armed = true; }
      // catch the stop as soon as the wheel gesture is over (Lenis's slow tail would otherwise read as a stall);
      // keys / touch / scrollbar still wait for the page to come to rest
      var wheelDone = lastWheel && now - lastWheel > 120 && now - lastWheel < 1500 && Math.abs(lenis.velocity) < 2.5;
      if (moved && !wheelDone) return;
      if (!armed || gliding || touching || (!wheelDone && now - lastMove < IDLE)) return;
      if (Math.abs(lenis.velocity) > 1.2) { lastMove = now; return; }   // still coasting: wait, stay armed
      armed = false;
      if (document.querySelector('dialog[open]') || root.classList.contains('menu-open')) return;
      var t = target(y, dir); if (t != null) glide(t);
    });
    function cancel() { if (gliding) { gliding = false; lenis.scrollTo(lenis.scroll, { immediate: true, force: true }); } }
    addEventListener('wheel', function () { gliding = false; lastWheel = performance.now(); }, { passive: true });   // the wheel already overrides Lenis's target
    addEventListener('pointerdown', cancel, { passive: true });
    addEventListener('touchstart', function () { touching = true; cancel(); }, { passive: true });
    addEventListener('touchend', function () { touching = false; armed = true; lastMove = performance.now() + 120; }, { passive: true });
    addEventListener('keydown', function (e) {
      var K = { ' ': 1, PageDown: 1, ArrowDown: 1, PageUp: -1, ArrowUp: -1 };
      if (!(e.key in K)) { cancel(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === ' ' && e.target.closest('button, a, summary')) return;
      var d = e.key === ' ' && e.shiftKey ? -1 : K[e.key], z = zoneOf(), y = lenis.scroll;
      if (!z) return;
      var t = null;
      if (d > 0) { for (var i = 0; i < z.stops.length; i++) if (z.stops[i] > y + 2) { t = z.stops[i]; break; } }
      else { for (var j = z.stops.length - 1; j >= 0; j--) if (z.stops[j] < y - 2) { t = z.stops[j]; break; } }
      if (t != null && Math.abs(t - y) > VH() * 1.15) t = null;
      if (t == null) return;
      e.preventDefault(); cancel(); dir = d; glide(t);
    });
  }

  /* ------------------------------------------------------ 03 · AVAILABLE NOW */
  function rail() {
    var sec = $('[data-scene="rail"]'); if (!sec) return;
    var track = $('[data-rail-track]', sec), cards = $$('[data-rcard]', sec), head = $('.rail__head', sec);
    var n = cards.length;
    sheet(sec);
    /* fix2 layout: every car (keyed layer + its own floor shadow) stands on one floor line (stage y 760, the
       tyre contact at 86 % of each canvas). The car in focus is 860 stage px wide, left edge on the focus slot
       x 760; neighbours are the same layer at NEAR scale, edge to edge with a fixed gap (large · small rhythm).
       Nothing is greyed: "unlit" = smaller car + the plate shows only number, title and price at 0.78 ink
       (graphite on ivory ≥ 6 : 1); spec line and link appear on the car in focus only. */
    var FW = 860, GAP = 64, SLOT = 760, NEAR = 0.55, INK = 0.78;   // fix2: ivory floor, keyed cars (graphite ink 0.78 ≥ 6 : 1)
    var proxy = { f: 0 };
    var ph = cards.map(function (c) { return $('.rcard__ph', c); });
    var more = cards.map(function (c) { return $$('.rcard__more', c); });
    var ink = cards.map(function (c) { return [$('.rcard__no', c), $('.rcard__title', c), $('.rcard__price .t-num', c)].filter(Boolean); });
    // ('scale' is a meta-property: quickSetter does not render it, so scaleX + scaleY)
    var set = cards.map(function (c, i) {
      return { x: gsap.quickSetter(c, 'x', 'px'), sx: gsap.quickSetter(ph[i], 'scaleX'), sy: gsap.quickSetter(ph[i], 'scaleY'), m: gsap.quickSetter(more[i], 'opacity'), k: gsap.quickSetter(ink[i], 'opacity') };
    });
    function focus() {
      var u = U(), xs = [], x = 0, sc = cards.map(function (c, i) {
        var d = Math.min(1, Math.abs(i - proxy.f)), e = d * d * (3 - 2 * d);   // smoothstep: a lens pulling focus
        return { s: 1 - (1 - NEAR) * e, e: e, d: d, D: Math.abs(i - proxy.f) };
      });
      sc.forEach(function (o, i) { xs.push(x); x += (FW * o.s + GAP); });
      var fl = Math.max(0, Math.min(n - 1, Math.floor(proxy.f))), fr = proxy.f - fl;
      var at = xs[fl] + (fl < n - 1 ? (xs[fl + 1] - xs[fl]) * fr : 0);
      cards.forEach(function (c, i) {
        var o = sc[i];
        set[i].x((SLOT - at + xs[i]) * u);
        set[i].sx(o.s); set[i].sy(o.s);
        var m = Math.max(0, 1 - o.d * 2.4);           // details only near focus
        set[i].m(m); more[i].forEach(function (el) { el.style.visibility = m < 0.02 ? 'hidden' : ''; });
        // beyond the first neighbour the plate goes out before it can reach a viewport edge
        set[i].k(o.D <= 1 ? 1 - (1 - INK) * o.e : INK * Math.max(0, Math.min(1, (1.5 - o.D) / 0.5)));
      });
    }
    /* Mechanics after Robb Francis v3 "Available Now.": no dead holds — the rail follows the scroll
       continuously (STEP vh per car) and, when the scroll comes to rest, eases onto the nearest car. */
    var STEP = 60;                                   // 6 stops: 5 × 60 + 100 cover = 400vh
    var len = (n - 1) * STEP;
    var tl = V4.tl.rail = pinTL(sec, len + COVER, {
      onRefresh: focus,
      snap: {
        snapTo: function (v, self) {
          var total = len + COVER, t = v * total;
          // the next sheet has started rising: going down, the rail lets go (04's dock lands the page on SoCal);
          // going back up, it returns to the last car — the page never rests on the half-risen sheet
          if (t > len + 2) return self && self.direction < 0 ? (n - 1) * STEP / total : v;
          return Math.max(0, Math.min(n - 1, Math.round(t / STEP))) * STEP / total;
        },
        inertia: false,   // no momentum projection: one flick must not throw the page across the 03 → 04 hand-over
        duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut'
      }
    });
    tl.to(proxy, { f: n - 1, duration: len, ease: 'none' }, 0);
    for (var i = 0; i < n; i++) { tl.addLabel('hold' + i, i * STEP); hold(tl, i * STEP, i * STEP); }
    // leaving: the rail keeps its own direction (drifts on to the left) while the head lifts
    tl.addLabel('cover', len).to({}, { duration: COVER }, len);
    drift(tl, track, len, { xPercent: -5 });
    drift(tl, head, len, { y: function () { return -50 * U(); } });
    tl.eventCallback('onUpdate', focus);
    focus();
    // arrival: the rail rides over the held Collection; the cards travel a little behind the sheet
    // and their photographs open left → right in reading order; the head lands with the sheet
    var c = coverTL(sec);
    // the cars roll in from the right along the floor line while the sheet rises (cut-outs are never clipped)
    c.fromTo(track, { y: function () { return 0.1 * VH(); }, x: function () { return 0.42 * geo.vw; } }, { y: 0, x: 0, duration: 1, ease: 'power3.out' }, 0);
    // the head steps in when the rail becomes the active screen (Alex) — kicker · title · as-of line · button
    var railStep = stepIn([].concat(lines('.eyebrow', head), lines('.rail__h', head), [$('.rail__asof', head), $('.rail__all', head)]));
    ScrollTrigger.create({ trigger: sec, start: 'top 12%', onEnter: railStep.show, onLeaveBack: railStep.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) railStep.show(); } });
    // focus works for keyboard users too: tabbing to a card brings it into focus position
    cards.forEach(function (card, k) {
      card.addEventListener('focusin', function () { if (card.querySelector(':focus-visible')) V4.scrollTo(stY(tl, k * STEP), true); });   // keyboard only: a mouse click glides instead
      // a click on a neighbour brings it into focus first (as in RF v3); the car in focus follows its link
      card.addEventListener('click', function (e) {
        if (k === Math.round(proxy.f)) return;
        e.preventDefault();
        var y = stY(tl, k * STEP);
        if (V4.lenis) V4.lenis.scrollTo(y, { duration: 1.1, force: true }); else V4.scrollTo(y);
      });
    });
    V4.targets.available = function () { return stY(tl, 0); };
  }

  /* --------------------------------------------- 04 · ABOUT + LOCATIONS */
  function locs() {
    var sec = $('[data-scene="locs"]'); if (!sec) return;
    var inner = $('[data-lc-in]', sec), cols = $$('.lc__col', sec);
    sheet(sec);
    var c = coverTL(sec);   // the sheet rises over the rail (the shared idiom)
    // the three panels ride up WITH the sheet at three rates, each photograph opening from the bottom (Alex: the
    // rising sheet must never be an empty dark screen)
    cols.forEach(function (col, i) {
      c.fromTo(col, { y: function () { return (0.1 + 0.06 * i) * VH(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.03 * i);
      reveal(c, $('.lc__panel', col), 0.04 + 0.07 * i, 0.5, 'bottom');
    });
    var step = stepIn([].concat(lines('.lc__kicker', sec), lines('.lc__h', sec), lines('.lc__about', sec), lines('.lc__src', sec)));
    // the type steps in while the sheet is still rising (no empty dark plane)
    ScrollTrigger.create({ trigger: sec, start: 'top 75%', onEnter: step.show, onLeaveBack: step.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) step.show(); } });
    // sticky (Alex): the section holds until the scroll has walked every showroom — DWELL to read, then STEPL vh
    // per showroom (SoCal → Naples → Miami, the panel widens), then a short TAIL; each showroom is a pin stop
    var keys = V4.lcKeys || ['socal', 'naples', 'miami'], DWELL = 40, STEPL = 55, TAIL = 20;
    var M0 = DWELL, HOLDL = DWELL + keys.length * STEPL + TAIL;
    var tl = V4.tl.locs = pinTL(sec, HOLDL + COVER);
    tl.addLabel('hold', 0).to({}, { duration: HOLDL }, 0); hold(tl, 0, HOLDL);
    tl.addLabel('cover', HOLDL).to({}, { duration: COVER }, HOLDL);
    drift(tl, inner, HOLDL, { y: function () { return -64 * U(); } });
    tl.eventCallback('onUpdate', function () {
      if (!V4.lcSelect) return;
      var t = tl.time(), k = t < M0 ? 0 : Math.min(keys.length - 1, Math.floor((t - M0) / STEPL));
      V4.lcSelect(keys[k]);
    });
    V4.targets.locations = function () { return stY(tl, 1); };
    V4.targets.about = V4.targets.locations;
    // PIN STOPS: the landed section, then each showroom's segment
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('locations', function () {
      var stops = [stY(tl, 1)];
      for (var i = 1; i < keys.length; i++) stops.push(stY(tl, M0 + i * STEPL + STEPL / 2));
      // the whole rise of the sheet docks: forward onto SoCal, or (going back up) onto the rail's last car
      var rt = V4.tl.rail, back = rt && rt.labels.cover != null ? stY(rt, rt.labels.cover) : null;
      return { stops: stops, lo: stops[0] - 1.0 * VH(), hi: stY(tl, HOLDL), back: back };
    });
  }

  /* --------------------------------------------------- 05 · SELL YOUR CAR */
  function sell() {
    var sec = $('[data-scene="sell"]'); if (!sec) return;
    var media = $('[data-sell-ph]', sec), text = $('[data-sell-text]', sec);
    sheet(sec);
    var c = coverTL(sec);
    // the media rises a touch behind the sheet (its own plane); the type steps in from the side once home
    c.fromTo(media, { y: function () { return 0.18 * VH(); } }, { y: 0, duration: 1, ease: 'power2.out' }, 0);
    var step = stepIn([].concat(lines('.sl__kicker', sec), lines('.sl__h', sec), lines('.sl__about', sec), [$('.sl__cta', sec)]));
    ScrollTrigger.create({ trigger: sec, start: 'top 12%', onEnter: step.show, onLeaveBack: step.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) step.show(); } });
    var tl = V4.tl.sell = pinTL(sec, 60 + COVER);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0); hold(tl, 0, 60);
    tl.addLabel('cover', 60).to({}, { duration: COVER }, 60);
    drift(tl, media, 60, { yPercent: -10 });
    drift(tl, text, 60, { y: function () { return -36 * U(); } });
    V4.targets.sell = function () { return stY(tl, 1); };
    // PIN STOP (Alex): the section docks like 02 and 04
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('sell', function () {
      var stop = stY(tl, 1);
      return { stops: [stop], lo: stop - 0.6 * VH(), hi: stY(tl, 60) };
    });
  }

  /* ------------------------------------------------------- 06 · SERVICES */
  function services() {
    // Alex's mockup (2026-10-09) on the Robb Francis mechanics: the photograph holds; the column's track scrolls up one
    // chapter pitch per stop (the chapter that leaves lifts out as it goes, so nothing is ever cut at the clip line);
    // each chapter's photograph opens inside the frame from the bottom, settling from a push-in. A pin stop per chapter.
    var sec = $('[data-scene="svc"]'); if (!sec) return;
    var frame = $('[data-sv-frame]', sec), col = $('[data-sv-col]', sec), track = $('[data-sv-track]', sec), head = $('[data-sv-head]', sec);
    var imgs = $$('.sv__img', sec), chs = $$('[data-sv-ch]', sec), rules = $$('.sv__rule', sec);
    var PITCH = 449, HOLD = 16, T = 42, N = chs.length, END = N * HOLD + (N - 1) * T;   // T in vh ≈ PITCH in stage px: 1 : 1
    sheet(sec);
    var c = coverTL(sec);
    reveal(c, frame, 0.1, 0.62, 'bottom');
    c.fromTo(imgs[0], { scale: 1.12 }, { scale: 1, duration: 0.74, ease: 'power2.out', immediateRender: true }, 0.1);
    var first = [].slice.call(chs[0].children);
    var step = stepIn([].concat(lines('.sv__kicker', sec), lines('.sv__h', sec), lines('.sv__sub', sec), first));
    ScrollTrigger.create({ trigger: sec, start: 'top 40%', onEnter: step.show, onLeaveBack: step.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) step.show(); } });
    drawRule(c, rules[0], 0.5, 0.4);
    var tl = V4.tl.svc = pinTL(sec, END + COVER);
    gsap.set(imgs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 });
    for (var k = 0; k < N; k++) {
      var a = k * (HOLD + T);
      tl.addLabel('ch' + (k + 1), a); hold(tl, a, a + HOLD);
      if (k === N - 1) break;
      var b = a + HOLD;
      (function (k) {
        // the column travels 1 : 1 with the scroll (ease none — it reads as the page itself moving); the chapter
        // leaving fades by POSITION under the head (CSS mask), never on a timer
        tl.to(track, { y: function () { return -(k + 1) * PITCH * U(); }, duration: T, ease: 'none' }, b);
        tl.to(imgs[k + 1], { clipPath: 'inset(0% 0% 0% 0%)', duration: T, ease: 'power1.inOut' }, b)
          .to(imgs[k + 1], { scale: 1, duration: T, ease: 'none' }, b)
          .to(imgs[k], { scale: 1.04, duration: T, ease: 'none' }, b);
        if (rules[k + 1]) tl.fromTo(rules[k + 1], { scaleX: 0.36 }, { scaleX: 1, duration: T, ease: 'none', immediateRender: false }, b);
      })(k);
    }
    tl.addLabel('cover', END).to({}, { duration: COVER }, END);
    drift(tl, frame, END, { yPercent: -12 });
    drift(tl, col, END, { y: function () { return -48 * U(); } });
    var at = function (t) { return function () { return stY(tl, t); }; };
    V4.targets.services = V4.targets.service = V4.targets.finance = at(1);
    V4.targets.insurance = at(HOLD + T + 1);
    V4.targets.ppf = at(2 * (HOLD + T) + 1);
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('services', function () {
      var stops = []; for (var q = 0; q < N; q++) stops.push(stY(tl, q * (HOLD + T) + HOLD / 2));
      var prev = V4.tl.sell ? stY(V4.tl.sell, 1) : null;   // back up: onto 05's stop (never rest on the half-risen sheet)
      return { stops: stops, lo: stops[0] - 1.0 * VH(), hi: stY(tl, END), back: prev };
    });
  }

  /* -------------------------------------------------------- 07 · REVIEWS */
  function reviews() {
    // the stack of glass cards (js/reviews.js owns the swiping); here: arrival, a held read, the exit, a pin stop
    var sec = $('[data-scene="rev"]'); if (!sec) return;
    var head = $('[data-rv-head]', sec), stack = $('[data-rv-stack]', sec);
    sheet(sec);
    var c = coverTL(sec);
    c.fromTo(stack, { y: function () { return 0.28 * VH(); }, rotate: 2.5 }, { y: 0, rotate: 0, duration: 0.9, ease: 'power2.out' }, 0.05);
    var step = stepIn([].concat(lines('.rv__kicker', sec), lines('.rv__h', sec), lines('.rv__sub', sec)));
    ScrollTrigger.create({ trigger: sec, start: 'top 40%', onEnter: step.show, onLeaveBack: step.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) step.show(); } });
    var tl = V4.tl.rev = pinTL(sec, 60 + COVER);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0); hold(tl, 0, 60);
    tl.addLabel('cover', 60).to({}, { duration: COVER }, 60);
    drift(tl, head, 60, { y: function () { return -60 * U(); } });
    drift(tl, stack, 60, { yPercent: -14 });
    V4.targets.reviews = function () { return stY(tl, 1); };
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('reviews', function () {
      var stop = stY(tl, 1), s = V4.tl.svc, N3 = 3, prev = s ? stY(s, (N3 - 1) * (16 + 42) + 8) : null;
      return { stops: [stop], lo: stop - 1.0 * VH(), hi: stY(tl, 60), back: prev };
    });
  }

  /* ------------------------------------------------------ 08 · INSTAGRAM */
  function instagram() {
    // Alex (2026-10-09): the head holds; the two columns of posts scroll UP with the page at two rates (scrubbed).
    var sec = $('[data-scene="ig"]'); if (!sec) return;
    var head = $('[data-ig-head]', sec), cols = $$('[data-ig-col]', sec);
    sheet(sec);
    var c = coverTL(sec);
    var step = stepIn([].concat(lines('.igs__kicker', sec), lines('.igs__h', sec), lines('.igs__sub', sec), [$('.igs__cta', sec)]));
    // the head steps in once the sheet is home (as 02 / 03) — never while it is still rising past the fold
    ScrollTrigger.create({ trigger: sec, start: 'top 6%', onEnter: step.show, onLeaveBack: step.hide,
      onRefresh: function (self) { if (self.progress > 0 || self.isActive) step.show(); } });
    var START = [196, 420, 290], RUN = 150;   // stage px each column starts at · vh of scroll they travel
    var RATE = [1, 1.45, 0.75];                // three columns, three speeds (Alex): the middle one runs fastest
    var endY = function (col) { return -(col.offsetHeight - 1080 * U() + 140 * U()); };   // the last post clears the bottom edge
    cols.forEach(function (col, i) {
      c.fromTo(col, { y: function () { return (START[i] + 300) * U(); } }, { y: function () { return START[i] * U(); }, duration: 1, ease: 'power2.out' }, 0);
    });
    var tl = V4.tl.ig = pinTL(sec, RUN + COVER);
    cols.forEach(function (col, i) {
      tl.fromTo(col, { y: function () { return START[i] * U(); } }, { y: function () { return START[i] * U() + (endY(col) - START[i] * U()) * RATE[i]; }, duration: RUN, ease: 'none', immediateRender: false }, 0);
    });
    tl.addLabel('cover', RUN).to({}, { duration: COVER }, RUN);
    drift(tl, head, RUN, { y: function () { return -60 * U(); } });
    V4.targets.instagram = function () { return stY(tl, 1); };
  }

  /* --------------------------------------------- 08b · CLOSE (fix2, layout hooks) */
  // The bookend arrives as a sheet like every chapter and holds; the motion-designer owns its choreography.
  // Hooks: V4.tl.close (labels "hold", "cover"), [data-close-car] x3, [data-close-text].
  function closing() {
    // The hero's dolly run backwards (Alex, 2026-10-09: "the home hero's staged approach — not just shrinking: movement,
    // and a small closing-in on the scroll"). Same camera model as approach(): one pinhole (VP 960/540), each car on its
    // own depth z (from its rest contact line), r = 1 / (1 − D·p / z), flanks on lanes that part with p and hang back.
    //   p = 1  near the lens: the Lamborghini huge and low, the flanks parted beyond the frame edges
    //   p = 0  the rest group under the line (pin stop)        p < 0  further into the distance as the footer covers
    // Staged, not in lock-step: the flanks lead (they are deeper, they settle first), the Lamborghini follows; in the
    // last third the flanks close in toward it (+44 stage px each — the hero intro's gather, reversed in meaning).
    var sec = $('[data-scene="close"]'); if (!sec) return;
    var text = $('[data-close-text]', sec);
    var CAM = { vpx: 960, hy: 540, reach: 3.2, spread: 0.55, shrink: 0.22 }, D = 1 - 1 / CAM.reach, GATHER = 44;
    var IMG = { lambo: { ax: 689, ay: 662, body: 1224 }, porsche: { ax: 683, ay: 779, body: 1196 }, ferrari: { ax: 673, ay: 716, body: 1212 } };
    var REST = { lambo: [960, 770, 610], porsche: [600, 706, 432], ferrari: [1360, 700, 432] };   // x, contact y, body W — the hero's F1 group, mirrored
    var STAGE = { lambo: [0.10, 0], porsche: [0, 0.16], ferrari: [0.03, 0.13] };                // [delay, early finish] of each car's leg
    var rig = $$('[data-cl-car]', sec).map(function (el) {
      var n = el.getAttribute('data-cl-car'), f = REST[n];
      return { n: n, el: el, m: IMG[n], f: f, flank: n !== 'lambo', side: Math.sign(f[0] - 960),
               z: (REST.lambo[1] - CAM.hy) / (f[1] - CAM.hy) };
    });
    function project(c, p, g) {
      var r = 1 / (1 - D * p / c.z);
      var lane = c.flank ? 1 + CAM.spread * Math.max(p, 0) : 1, k = c.flank ? r * (1 - CAM.shrink * Math.max(p, 0)) : r;
      var x0 = c.f[0] + (c.flank ? c.side * GATHER * (1 - g) : 0);   // before the gather the flanks stand 44 wider
      return { x: CAM.vpx + (x0 - CAM.vpx) * r * lane, y: CAM.hy + (c.f[1] - CAM.hy) * k, w: c.f[2] * k };
    }
    var cam = { a: 0, b: 0, far: 0 };   // a: the sheet's arrival (0 → 1), b: the pinned dolly (0 → 1), far: the exit beyond rest
    var ease = gsap.parseEase('power2.inOut'), easeOut = gsap.parseEase('power3.out');
    function shoot() {
      var u = U(), sl = (innerWidth - 1920 * u) / 2, st = (innerHeight - 1080 * u) / 2;
      var T = cam.b > 0 ? 0.28 + 0.72 * cam.b : 0.28 * cam.a;   // one staged clock: 0 near → 1 rest
      var g = ease(gsap.utils.clamp(0, 1, (T - 0.62) / 0.38));
      rig.forEach(function (c) {
        var s = STAGE[c.n], q = easeOut(gsap.utils.clamp(0, 1, (T - s[0]) / (1 - s[0] - s[1])));
        var p = (1 - q) - 0.62 * cam.far * (c.flank ? 1.08 : 1);   // flanks fall away a touch faster on the exit
        var a = project(c, p, Math.min(1, g + cam.far)), k = a.w / c.m.body * u;
        c.el.style.transform = 'translate(' + (sl + a.x * u - c.m.ax * k) + 'px,' + (st + a.y * u - c.m.ay * k) + 'px) scale(' + k + ')';
      });
    }
    sheet(sec);
    var c = coverTL(sec);
    c.fromTo(cam, { a: 0 }, { a: 1, duration: 1, ease: 'none', onUpdate: shoot, immediateRender: true }, 0);
    var LEG = 60, HOLD = 60;
    var heads = [$('.cl__kicker', sec), $('.close__h', sec), $('.cl__sub', sec)], ctaEl = $('.close__cta', sec);
    var tl = V4.tl.close = pinTL(sec, LEG + HOLD + COVER);
    tl.fromTo(cam, { b: 0 }, { b: 1, duration: LEG, ease: 'none', onUpdate: shoot, immediateRender: false }, 0);   // linear in scroll; the legs carry the easing
    tl.addLabel('hold', LEG).to({}, { duration: HOLD }, LEG); hold(tl, LEG, LEG + HOLD);
    // the type floats DOWN into place with the scroll (Alex): each line from above, a beat apart, landing as the trio
    // settles; the CTA comes up from below to meet the group. Scrubbed both ways — scroll back and they lift away.
    // one block floats down (lines never cross each other); inside it the lines light up a beat apart, each easing
    // the last few px on its own so the landing reads as layered
    // one by one (Alex): the block descends slowly as a whole; each line then settles its last few px on its own and
    // fades in, a clear beat after the one above — kicker, title, line
    var textIn = $('[data-close-text]', sec);
    tl.fromTo(textIn, { y: function () { return -70 * U(); } }, { y: 0, duration: 40, ease: 'sine.out', immediateRender: true }, 10);
    heads.forEach(function (el, i) {
      tl.fromTo(el, { y: function () { return -26 * U(); }, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 20, ease: 'sine.inOut', immediateRender: true }, 12 + i * 11);
    });
    tl.fromTo(ctaEl, { y: function () { return 60 * U(); }, scale: 0.92, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 22, ease: 'back.out(1.6)', immediateRender: true }, 38);
    tl.addLabel('cover', LEG + HOLD).to(cam, { far: 1, duration: COVER, ease: 'power1.in', onUpdate: shoot }, LEG + HOLD);
    drift(tl, text, LEG + HOLD, { y: function () { return -48 * U(); } });
    shoot(); addEventListener('resize', shoot);
    V4.cam2 = { project: function (n, p, g) { return project(rig.filter(function (c) { return c.n === n; })[0], p, g); } };
    V4.targets.close = function () { return stY(tl, LEG + 1); };
    if (!/[?&]settle=0/.test(location.search) && V4.lenis) dock('close', function () {
      var stop = stY(tl, LEG + 1); return { stops: [stop], lo: stop - 1.2 * VH(), hi: stY(tl, LEG + HOLD) };
    });
  }

  /* ------------------------------------------------------- 09 · FOOTER */
  function footer() {
    var sec = $('[data-scene="foot"]'); if (!sec) return;
    var cards = $$('[data-foot-card]', sec);
    sheet(sec);
    var c = coverTL(sec);
    c.fromTo($('.foot__head', sec), { y: function () { return 80 * U(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.2);
    cards.forEach(function (card, i) {
      c.fromTo(card, { y: function () { return (130 + i * 70) * U(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.2);
    });
    V4.holdList.push([null, 'foot']);
    V4.targets.showrooms = function () { return sec.getBoundingClientRect().top + window.scrollY; };
    V4.targets.contact = V4.targets.showrooms;
  }
  // every reading stop as [startY, endY]; the footer stop is a position, not a timeline time
  V4.holds = function () {
    return V4.holdList.map(function (h) {
      if (!h[0]) { var f = $('[data-scene="foot"]'); var y = f.getBoundingClientRect().top + window.scrollY; return [y, y + 0.4 * VH()]; }
      return [stY(h[0], h[1]), stY(h[0], h[2])];
    });
  };

  /* ------------------------------------- the hero arrival (load, time-based) */
  function intro(mobile) {
    var ap = $('[data-approach]');
    if (!ap || !root.classList.contains('intro')) return;
    if (window.scrollY > 40) { root.classList.remove('intro'); return; }
    var f1 = $('[data-f1]', ap), cars = { ferrari: $('.car--ferrari', ap), porsche: $('.car--porsche', ap), ford: $('.car--ford', ap) };
    var lineDrop = function (i, el) { return el.offsetHeight * 1.3; };
    var t = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: done });
    // the type rides up from BEHIND the cars (it sits under the car stage): it starts low enough to be hidden by
    // the Ford's body, and rises out over its roof once the trio is in — title first, then the kicker
    if (mobile) {
      t.fromTo(lines('.hero__kicker', f1), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
      t.fromTo(lines('.hero__title', f1), { y: lineDrop, opacity: 1 }, { y: 0, duration: 1.05, stagger: 0.12 }, 0.22);
    } else {
      // opacity 0 until the trio is fully opaque (stage fade ends at 1.45) — nothing shows through a half-faded car;
      // then the type rides up out from behind the Ford, fading in as it clears the roof
      gsap.set([$('.hero__title', f1), $('.hero__kicker', f1)], { opacity: 0 });
      t.fromTo($('.hero__title', f1), { '--rise': function () { return 175 * U() + 'px'; }, opacity: 0 }, { '--rise': '0px', duration: 1.9, ease: 'power2.out' }, 1.5);
      t.to($('.hero__title', f1), { opacity: 1, duration: 0.7, ease: 'power1.in' }, 1.5);
      t.fromTo($('.hero__kicker', f1), { '--rise': function () { return 215 * U() + 'px'; }, opacity: 0 }, { '--rise': '0px', duration: 1.9, ease: 'power2.out' }, 1.7);
      t.to($('.hero__kicker', f1), { opacity: 1, duration: 0.8, ease: 'power1.in' }, 1.7);
    }
    // the trio arrives as ONE photograph: opacity on the stage container, so the cars' overlaps and each
    // car's shadow are composited first — nothing is ever seen through a half-transparent car, no ghost
    // outline, no half-revealed body; a soft settle onto the floor
    var stage = $('[data-car-stage]', ap);
    t.set($$('.car img', ap), { opacity: 1 }, 0);
    t.fromTo(stage, { opacity: 0, y: function () { return -12 * U(); } }, { opacity: 1, y: 0, duration: 1.3, ease: 'power2.out' }, 0.15);
    // the trio gathers (Alex): the flanks drift in a little from the edges toward the Ford as it appears.
    // Moved on their layers (body + shadow together), never on the .car group — that one belongs to the camera rig.
    [['ferrari', -1], ['porsche', 1]].forEach(function (c) {
      t.fromTo($$('.car__shadow, .car__body', cars[c[0]]), { x: function () { return c[1] * 44 * U(); } }, { x: 0, duration: 1.6, ease: 'power3.out' }, 0.15);
    });
    // the CTA settles last, rising inside its own clip
    t.fromTo($('.hero__cta', f1), { opacity: 1, y: 18, clipPath: 'inset(100% 0% 0% 0%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out' }, 1.28);
    root.classList.remove('intro');
    V4.intro = V4.introTL = t;
    function done() { window.removeEventListener('scroll', cut); V4.intro = null; }
    function cut() { if (window.scrollY > 4 && t.progress() < 1) { t.cut = true; t.progress(1); } }   // the reader's scroll always wins
    window.addEventListener('scroll', cut, { passive: true });
    var start = function () { if (t.progress() < 1 && !t.isActive() && !t.cut) t.play(); };
    // start only once EVERY car layer is decoded (no car arrives half-loaded), or after 2.4s at worst
    var imgs = $$('.car img', ap);
    Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : 0].concat(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : 0; }))),
      new Promise(function (r) { setTimeout(r, 2400); })
    ]).then(start);
    t.progress(0.0001).pause();   // apply the opening state now (CSS .intro held it until here)
  }

  /* ------------------------------ <1280: authored flow, headlines rise once */
  function flowRise() {
    var heads = $$('.scene h2.disp').filter(function (h) { return h.querySelector('.m > .l'); });
    heads.forEach(function (h) {
      var ls = $$('.m > .l', h);
      gsap.set(ls, { yPercent: 110 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(ls, { yPercent: 0, duration: TOK.d4, ease: 'expo.out', stagger: TOK.stagger, overwrite: true });
      } });
    });
    // photographs open on entry, from the side their layout gives them
    $$('.col__p1 .ph, .col__p2 .ph, .sell__ph .ph, .svc__ph, .ig__tile a').forEach(function (el, i) {
      var from = el.closest('.col__p2') ? 'right' : el.closest('.ig__col--2') ? 'top' : 'bottom';
      gsap.set(el, { clipPath: CLIP[from] });
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: TOK.d4, ease: 'power3.inOut', overwrite: true });
      } });
    });
  }

  /* ------------------------------------------- deep links (e.g. inventory → #ppf) */
  function jumpToHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || id === 'main') return;
    var go = function () { ScrollTrigger.refresh(); V4.go(id, true); };
    if (document.readyState === 'complete') requestAnimationFrame(go);
    else window.addEventListener('load', function () { requestAnimationFrame(go); }, { once: true });
  }
  // geometry changes that move triggers: late images/fonts (G8). Resize is ScrollTrigger's own.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (document.readyState === 'complete') ScrollTrigger.refresh(); });
})();
