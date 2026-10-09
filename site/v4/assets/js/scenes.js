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
    footer();
  }

  /* ------------------------------------------------ 01 + 02 · THE APPROACH */
  function approach() {
    var ap = $('[data-approach]'); if (!ap) return;
    var hdr = $$('[data-hdr] .hdr__logo, [data-hdr] .hdr__nav');   // the header's contents (its own transform is chrome.js's)
    var car = { ferrari: $('.car--ferrari', ap), porsche: $('.car--porsche', ap), ford: $('.car--ford', ap) };
    var f1 = $('[data-f1]', ap), f2 = $('[data-f2]', ap), f3 = $('[data-f3]', ap);
    var h1 = lines('.hero__h1', f1), eyebrow1 = lines('.eyebrow', f1), deck = $('[data-f1-deck]', ap);
    var deckLines = lines('.deck', deck), cta = $('.hero__cta', deck), rec = lines('.hero__rec', f1), idx = $('[data-idx]', ap);
    var f2h = $$('.hero__h2 .l', f2), f2e = lines('.eyebrow', f2), f2r = $('[data-rule]', f2);
    var f3e = lines('.eyebrow', f3), f3r = $('[data-rule]', f3);
    var p1 = $('[data-p1]', ap), p2 = $('[data-p2]', ap), idxBlock = $('[data-col-index]', ap);
    var colText = $('[data-col-text]', ap);
    var colEye = lines('.eyebrow', colText), colH = lines('.col__h', colText), colDeck = lines('.deck', colText);
    var colRule = $('.rule', colText);

    gsap.set(deck, { overflowY: 'clip', overflowX: 'visible' });   // the CTA drops out through the deck's lower edge
    gsap.set(p1, { autoAlpha: 0 });
    gsap.set(p2, { y: function () { return VH() - (geo.st + 560 * U()) + 4; } });
    gsap.set(idxBlock, { y: function () { return 470 * U(); }, autoAlpha: 0 });
    gsap.set([f2r, f3r, colRule], { scaleX: 0 });   // line entrance states are set by rise() (immediateRender)

    var tl = V4.tl.approach = pinTL(ap, 520 + COVER);
    function carTo(name, frame, at, dur, ease) {
      tl.to(car[name], {
        x: function () { return V4.cars.delta(name, frame).x * U(); },
        y: function () { return V4.cars.delta(name, frame).y * U(); },
        scale: function () { return V4.cars.delta(name, frame).scale; },
        duration: dur, ease: ease
      }, at);
    }

    /* F1 hold 0–50 */
    tl.addLabel('F1', 0).to({}, { duration: 50 }, 0); hold(tl, 0, 50);

    /* T1 50–120 · the trio comes forward and opens. Type leaves in its masks:
       headline + eyebrow up, deck up line by line, CTA down, record line down. */
    var T = 50, D = 70;
    leave(tl, h1[1], T, D * 0.22, 1);
    leave(tl, h1[0], T + D * 0.05, D * 0.22, 1);
    leave(tl, eyebrow1, T, D * 0.18);
    tl.to($('.rule', f1), { scaleX: 0, duration: D * 0.16, ease: 'power2.in' }, T);
    leave(tl, deckLines, T + D * 0.02, D * 0.2, 0, D * 0.04);
    tl.to(cta, { yPercent: 140, duration: D * 0.12, ease: 'power2.in' }, T);
    tl.to(rec, { yPercent: 128, duration: D * 0.2, ease: 'power2.in' }, T);
    // three cars, three clocks: each starts from rest and settles into F2 (no velocity jump at the hold)
    carTo('porsche', 'F2', T + D * 0.06, D * 0.80, 'power2.inOut');
    carTo('ford', 'F2', T + D * 0.10, D * 0.84, 'power2.inOut');
    carTo('ferrari', 'F2', T + D * 0.16, D * 0.78, 'power2.inOut');
    rise(tl, f2h[0], T + D * 0.56, D * 0.30, -1);
    rise(tl, f2h[1], T + D * 0.62, D * 0.30, -1);
    drawRule(tl, f2r, T + D * 0.66, D * 0.2);
    slide(tl, f2e, T + D * 0.72, D * 0.26, -1);

    /* F2 hold 120–170 */
    tl.addLabel('F2', 120).to({}, { duration: 50 }, 120); hold(tl, 120, 170);

    /* T2 170–250 · the flanks leave unequally; the Ford comes up to presence */
    T = 170; D = 80;
    leave(tl, f2h[1], T, D * 0.2, -1);
    leave(tl, f2h[0], T + D * 0.04, D * 0.2, -1);
    leave(tl, f2e, T, D * 0.16, -1);
    tl.to(f2r, { scaleX: 0, duration: D * 0.14, ease: 'power2.in' }, T);
    carTo('ferrari', 'F3', T, D * 0.66, 'power2.inOut');
    carTo('porsche', 'F3', T + D * 0.12, D * 0.74, 'power2.inOut');
    carTo('ford', 'F3', T + D * 0.04, D * 0.96, 'power1.inOut');
    drawRule(tl, f3r, T + D * 0.72, D * 0.14);
    slide(tl, f3e, T + D * 0.76, D * 0.24, -1);

    /* F3 hold 250–290 */
    tl.addLabel('F3', 250).to({}, { duration: 40 }, 250); hold(tl, 250, 290);

    /* T3 290–460 (170vh) · the Passage and the Wake, with a real stop at F4.
       T3a 290–355: the flanks pass the lens, the Ford accelerates up and settles on the F4 waypoint
       F4  355–385: pin-stop (30vh, no text on screen) — the red face over the rising Collection
       T3b 385–460: the Ford accelerates away over the lens; P1 rides its shadow; the type rises in its wake */
    T = 290;
    var A0 = 290, A1 = 355, B0 = 385, B1 = 460;
    tl.to(hdr, { yPercent: -320, duration: 14, ease: 'power2.in' }, T);
    tl.to(idx, { y: function () { return 70 * U(); }, duration: 14, ease: 'power2.in' }, T);
    tl.to(f3e, { xPercent: -14, opacity: 0, duration: 12, ease: 'power2.in' }, T);
    tl.to(f3r, { scaleX: 0, duration: 14, ease: 'power2.in' }, T);
    // the flanks pass the lens at two rates (and grow as they pass): the Ferrari is out first and fastest
    carTo('ferrari', 'EXIT', T, 34, 'power2.in');
    carTo('porsche', 'EXIT', T + 8, 46, 'power1.in');

    // the Ford: F3 → F4 → exit, power2.inOut on each leg (it visibly accelerates and brakes).
    // P1's top edge = the shadow's far edge + 36 stage px on the same eases, so the lock is exact.
    var F3f = V4_ASSETS.frames.F3.ford, F1f = V4_ASSETS.frames.F1.ford, F4f = [1010, 283, 1103];
    var fordEnd = function () { return [1010, -200 - geo.st / U(), 1154]; };
    var tail = function (W) { return V4.cars.shadowTail('ford', W); };
    var p1y = function (f) { return geo.st + (f[1] + tail(f[2]) + 36) * U(); };
    function fordLeg(to, at, dur) {
      tl.to(car.ford, {
        x: function () { return (to()[0] - F1f[0]) * U(); },
        y: function () { return (to()[1] - F1f[1]) * U(); },
        scale: function () { return to()[2] / F1f[2]; },
        duration: dur, ease: 'power2.inOut'
      }, at);
    }
    fordLeg(function () { return F4f; }, A0 + 8, A1 - A0 - 8);
    tl.set(p1, { autoAlpha: 1 }, A0 + 8);
    tl.fromTo(p1, { y: function () { return p1y(F3f); } }, { y: function () { return p1y(F4f); }, duration: A1 - A0 - 8, ease: 'power2.inOut', immediateRender: false }, A0 + 8);
    // P2 (the wheel) enters whole from the bottom edge once it can show ≥ 320px, stops with F4
    // (top at stage y 690), then lands with the Collection
    var p2off = function (yStage) { return geo.st + (yStage - 560) * U(); };
    tl.fromTo(p2, { y: function () { return VH() - (geo.st + 560 * U()) + 4; } }, { y: function () { return p2off(690); }, duration: 34, ease: 'power3.out', immediateRender: false }, A0 + 21);
    tl.addLabel('F4', A1).to({}, { duration: B0 - A1 }, A1); hold(tl, A1, B0);
    fordLeg(fordEnd, B0, 62);
    tl.fromTo(p1, { y: function () { return p1y(F4f); } }, { y: function () { return p1y(fordEnd()); }, duration: 62, ease: 'power2.inOut', immediateRender: false }, B0);
    tl.to(p2, { y: 0, duration: 46, ease: 'power2.inOut' }, B0 + 4);
    // the index stays off-stage until the Ford has gone (no half-cut marque list at the bottom edge)
    tl.set(idxBlock, { autoAlpha: 1 }, B0 + 34);
    tl.to(idxBlock, { y: 0, duration: 38, ease: 'power3.out' }, B0 + 34);

    // the Wake, extended to the type: each Collection line starts rising as the shadow's far edge
    // clears it (bottom line first) and follows it upward — all of it after F4, so the stop holds no half-glyph
    var plateA = F4f[1] + tail(F4f[2]), plateB = -200 + tail(1154);
    function wakeAt(Y) {   // timeline time at which the plate end crosses stage-y Y on the second leg (inverse power2.inOut)
      var e = Math.max(0, Math.min(1, (Y - plateA) / (plateB - plateA)));
      var p = e < 0.5 ? Math.sqrt(e / 2) : 1 - Math.sqrt((1 - e) / 2);
      return B0 + 62 * p;
    }
    rise(tl, colDeck, Math.max(B0 + 6, wakeAt(486)), 15, 0);
    rise(tl, colH[1], Math.max(B0 + 10, wakeAt(428)), 15, 0);
    rise(tl, colH[0], wakeAt(340), 15, 0);
    drawRule(tl, colRule, wakeAt(212), 10);
    slide(tl, colEye, wakeAt(206), 15, -1);
    tl.to(hdr, { yPercent: 0, duration: 16, ease: 'power2.out' }, B1 - 16);

    /* F5 hold 460–520, then 520–620 the rail sheet covers the Collection as it drifts up */
    tl.addLabel('F5', B1).to({}, { duration: 60 }, B1); hold(tl, B1, B1 + 60);
    tl.addLabel('cover', B1 + 60).to({}, { duration: COVER }, B1 + 60);
    drift(tl, p1, B1 + 60, { yPercent: -7 });
    drift(tl, p2, B1 + 60, { yPercent: -16 });
    drift(tl, colText, B1 + 60, { y: function () { return -60 * U(); } });
    drift(tl, idxBlock, B1 + 60, { yPercent: -12 });

    // header ink follows the stage (logo over ivory, nav over P1 once the Collection is in)
    var setInk = function () { ap.dataset.inkLive = tl.time() > B0 + 50 ? 'split' : 'dark'; V4.ink(); };
    tl.eventCallback('onUpdate', setInk);
    ap.dataset.inkLive = 'dark';

    V4.targets.top = function () { return 0; };
    V4.targets.collection = function () { return stY(tl, 490); };
  }

  /* ------------------------------------------------------ 03 · AVAILABLE NOW */
  function rail() {
    var sec = $('[data-scene="rail"]'); if (!sec) return;
    var track = $('[data-rail-track]', sec), cards = $$('[data-rcard]', sec), head = $('.rail__head', sec);
    var n = cards.length;
    sheet(sec);
    /* fix1 layout: every car stands on one floor line (stage y 780). The car in focus is full size
       (720 × 480 stage px, left edge on the focus slot x 760); neighbours are the same photograph at
       NEAR scale, laid out edge to edge with a fixed gap, so the row has a real rhythm (large · small).
       Nothing is greyed: "unlit" = smaller photograph + the plate shows only number, title and price,
       at ≥ 0.66 ink (≥ 5.3 : 1 on graphite); spec line and link appear on the car in focus only. */
    var FW = 720, GAP = 56, SLOT = 760, NEAR = 0.58, INK = 0.66;
    var proxy = { f: 0 };
    var ph = cards.map(function (c) { return $('.rcard__ph', c); });
    var more = cards.map(function (c) { return $$('.rcard__more', c); });
    var ink = cards.map(function (c) { return [$('.rcard__no', c), $('.rcard__title', c), $('.rcard__price .t-num', c)]; });
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
    var HOLD = 40, MOVE = 12;                        // 40 + 5 × (12 + 40) + 100 cover = 400vh
    var len = HOLD + (n - 1) * (MOVE + HOLD);
    var tl = V4.tl.rail = pinTL(sec, len + COVER, { onRefresh: focus });
    tl.addLabel('hold0', 0).to({}, { duration: HOLD }, 0); hold(tl, 0, HOLD);
    for (var i = 1; i < n; i++) {
      var at = HOLD + (i - 1) * (MOVE + HOLD);
      (function (k) {
        tl.to(proxy, { f: k, duration: MOVE, ease: 'power2.inOut' }, at);
      })(i);
      tl.addLabel('hold' + i, at + MOVE).to({}, { duration: HOLD }, at + MOVE); hold(tl, at + MOVE, at + MOVE + HOLD);
    }
    // leaving: the rail keeps its own direction (drifts on to the left) while the head lifts
    tl.addLabel('cover', len).to({}, { duration: COVER }, len);
    drift(tl, track, len, { xPercent: -5 });
    drift(tl, head, len, { y: function () { return -50 * U(); } });
    tl.eventCallback('onUpdate', focus);
    focus();
    // arrival: the rail rides over the held Collection; the cards travel a little behind the sheet
    // and their photographs open left → right in reading order; the head lands with the sheet
    var c = coverTL(sec);
    c.fromTo(track, { y: function () { return 0.12 * VH(); } }, { y: 0, duration: 1, ease: 'power2.out' }, 0);
    reveal(c, $$('.rcard__ph', sec), 0.12, 0.46, 'left', 0.07);
    drawRule(c, $('.rule', head), 0.22, 0.2);
    slide(c, lines('.eyebrow', head), 0.26, 0.3, -1);
    rise(c, lines('.rail__h', head), 0.34, 0.44, -1);
    soft(c, $('.rail__asof', head), 0.6, 0.3);
    // focus works for keyboard users too: tabbing to a card brings it into focus position
    cards.forEach(function (card, k) {
      card.addEventListener('focusin', function () { V4.scrollTo(stY(tl, k === 0 ? HOLD / 2 : HOLD + (k - 1) * (MOVE + HOLD) + MOVE + HOLD / 2), true); });
    });
    V4.targets.available = function () { return stY(tl, 4); };
  }

  /* --------------------------------------------- 04 · ABOUT + LOCATIONS */
  function locs() {
    var sec = $('[data-scene="locs"]'); if (!sec) return;
    var map = $('[data-locs-map]', sec), lamps = $$('.lamp', sec), text = $('[data-locs-text]', sec);
    var cities = $$('.city', sec), citiesRow = $('[data-locs-cities]', sec), panels = $('[data-locs-panels]', sec);
    sheet(sec);
    var c = coverTL(sec);
    // the map rises and opens west → east; the cities step up one after another
    c.fromTo(map, { y: function () { return 0.3 * VH(); } }, { y: 0, duration: 1, ease: 'power2.out' }, 0);
    reveal(c, map, 0.16, 0.72, 'left');
    cities.forEach(function (city, i) {
      c.fromTo(city, { y: function () { return (0.12 + 0.05 * i) * VH(); } }, { y: 0, duration: 0.8, ease: 'power2.out' }, 0.2);
    });
    drawRule(c, $('.rule', text), 0.36, 0.2);
    slide(c, lines('.eyebrow', text), 0.4, 0.3, -1);
    rise(c, lines('.locs__h', text), 0.46, 0.4, -1, 0.07);
    soft(c, [$('.locs__about', text), $('.locs__src', text)], 0.66, 0.3, 0.04);
    c.fromTo(panels, { y: function () { return 0.1 * VH(); } }, { y: 0, duration: 0.7, ease: 'power2.out' }, 0.3);
    // the three showrooms switch on west → east once the sheet has landed, then hold (70vh)
    var tl = V4.tl.locs = pinTL(sec, 100 + COVER);
    lamps.forEach(function (l, i) {
      tl.fromTo(l, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 7, ease: 'power2.out', immediateRender: true }, 2 + i * 9);
    });
    tl.addLabel('hold', 30).to({}, { duration: 70 }, 30); hold(tl, 30, 100);
    // leaving: the camera keeps rising — map, text and cities lift at three rates under the sheet
    tl.addLabel('cover', 100).to({}, { duration: COVER }, 100);
    drift(tl, map, 100, { yPercent: -12 });
    drift(tl, text, 100, { y: function () { return -64 * U(); } });
    drift(tl, citiesRow, 100, { y: function () { return -110 * U(); } });
    drift(tl, panels, 100, { yPercent: -8 });
    V4.targets.locations = function () { return stY(tl, 30); };
    V4.targets.about = V4.targets.locations;
  }

  /* --------------------------------------------------- 05 · SELL YOUR CAR */
  function sell() {
    var sec = $('[data-scene="sell"]'); if (!sec) return;
    var ph = $('[data-sell-ph]', sec), text = $('[data-sell-text]', sec);
    var hl = lines('.sell__h', text), eye = lines('.eyebrow', text), deck = lines('.deck', text), act = lines('.sell__act', text);
    sheet(sec);
    var c = coverTL(sec);
    // the photograph travels on its own clock (starts lower, catches up) and opens from the right
    c.fromTo(ph, { y: function () { return 0.42 * VH(); } }, { y: 0, duration: 1, ease: 'power2.out' }, 0);
    reveal(c, ph, 0.1, 0.74, 'right');
    drawRule(c, $('.rule', text), 0.3, 0.2);
    soft(c, eye, 0.32, 0.26);
    rise(c, hl[0], 0.38, 0.4, -1);   // the two lines arrive from opposite sides
    rise(c, hl[1], 0.46, 0.4, 1);
    soft(c, deck, 0.62, 0.3, 0.04);
    rise(c, act, 0.72, 0.28, 0);
    var tl = V4.tl.sell = pinTL(sec, 60 + COVER);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0); hold(tl, 0, 60);
    // leaving: the car rolls on upward faster than the type, which only lifts a little
    tl.addLabel('cover', 60).to({}, { duration: COVER }, 60);
    drift(tl, ph, 60, { yPercent: -14 });
    drift(tl, text, 60, { y: function () { return -36 * U(); } });
    V4.targets.sell = function () { return stY(tl, 1); };
  }

  /* ------------------------------------------------------- 06 · SERVICES */
  function services() {
    var sec = $('[data-scene="svc"]'); if (!sec) return;
    var head = $('[data-svc-head]', sec), panels = $$('[data-svc-panel]', sec), fin = $('[data-svc-fin]', sec);
    sheet(sec);
    var c = coverTL(sec);
    // three panels rise at three rates and land in order; each photograph opens upward with it
    panels.forEach(function (p, i) {
      c.fromTo(p, { y: function () { return (0.28 + 0.14 * i) * VH(); } }, { y: 0, duration: 0.86 + 0.07 * i, ease: 'power2.out' }, 0);
      reveal(c, $('.svc__ph', p), 0.1 + 0.1 * i, 0.6, 'bottom');
    });
    // Finance belongs to the right edge: it comes in from the right, short and whole
    c.fromTo(fin, { xPercent: 18, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.44, ease: 'power2.out', immediateRender: true }, 0.5);
    drawRule(c, $('.rule', head), 0.36, 0.2);
    slide(c, lines('.eyebrow', head), 0.4, 0.3, -1);
    rise(c, lines('.svc__h', head), 0.5, 0.42, -1);
    soft(c, $('.svc__tbc', head), 0.76, 0.24);
    var tl = V4.tl.svc = pinTL(sec, 70 + COVER);
    tl.addLabel('hold', 0).to({}, { duration: 70 }, 0); hold(tl, 0, 70);
    // leaving: the band lifts panel by panel (reverse order of arrival), the head with it
    tl.addLabel('cover', 70).to({}, { duration: COVER }, 70);
    panels.forEach(function (p, i) { drift(tl, p, 70, { yPercent: -(14 - 4 * i) }); });
    drift(tl, [head, fin], 70, { y: function () { return -56 * U(); } });
    var t = function () { return stY(tl, 1); };
    ['services', 'insurance', 'service', 'ppf', 'finance'].forEach(function (k) { V4.targets[k] = t; });
  }

  /* -------------------------------------------------------- 07 · REVIEWS */
  function reviews() {
    var sec = $('[data-scene="rev"]'); if (!sec) return;
    var q1f = $('.rev__q--1', sec), q1 = lines('.rev__q--1 blockquote', sec), q2 = $('.rev__q--2', sec), q3 = $('.rev__q--3', sec);
    var head = $('.rev__head', sec);
    sheet(sec);
    var c = coverTL(sec);
    // the quote's lines alternate sides; the two short quotes ride up at two rates
    q1.forEach(function (l, i) { rise(c, l, 0.4 + i * 0.1, 0.4, i % 2 ? 1 : -1); });
    soft(c, $('figcaption', q1f), 0.78, 0.22);
    c.fromTo(q2, { y: function () { return 0.14 * VH(); } }, { y: 0, duration: 0.86, ease: 'power2.out' }, 0.14);
    c.fromTo(q3, { y: function () { return 0.22 * VH(); } }, { y: 0, duration: 0.9, ease: 'power2.out' }, 0.1);
    var tl = V4.tl.rev = pinTL(sec, 60 + COVER);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0); hold(tl, 0, 60);
    tl.addLabel('cover', 60).to({}, { duration: COVER }, 60);
    drift(tl, [q1f, head], 60, { y: function () { return -80 * U(); } });
    drift(tl, q2, 60, { yPercent: -40 });
    drift(tl, q3, 60, { yPercent: -26 });
    V4.targets.reviews = function () { return stY(tl, 1); };
  }

  /* ------------------------------------------------------ 08 · INSTAGRAM */
  function instagram() {
    var sec = $('[data-scene="ig"]'); if (!sec) return;
    var head = $('[data-ig-head]', sec), cols = $$('[data-ig-col]', sec);
    var travel = [[700, -60], [980, -500], [840, -260]];   // stage px: start → held offset, three rates
    var mid = function (i) { return travel[i][0] * 0.45 + travel[i][1] * 0.55; };
    sheet(sec);
    var c = coverTL(sec);
    cols.forEach(function (col, i) {
      c.fromTo(col, { y: function () { return travel[i][0] * U(); } }, { y: function () { return mid(i) * U(); }, duration: 1 }, 0);
      reveal(c, $$('.ig__tile a', col), 0.08 + 0.08 * i, 0.44, i === 1 ? 'top' : 'bottom', 0.1);
    });
    drawRule(c, $('.rule', head), 0.4, 0.2);
    slide(c, lines('.eyebrow', head), 0.44, 0.3, -1);
    rise(c, lines('.ig__h', head), 0.52, 0.4, -1);
    soft(c, $('.demo', head), 0.74, 0.26);
    var tl = V4.tl.ig = pinTL(sec, 100 + COVER);
    cols.forEach(function (col, i) { tl.fromTo(col, { y: function () { return mid(i) * U(); } }, { y: function () { return travel[i][1] * U(); }, duration: 40, ease: 'power2.out', immediateRender: false }, 0); });
    tl.addLabel('hold', 40).to({}, { duration: 60 }, 40); hold(tl, 40, 100);
    // leaving: the three columns keep their three rates under the footer
    tl.addLabel('cover', 100).to({}, { duration: COVER }, 100);
    cols.forEach(function (col, i) { drift(tl, col, 100, { yPercent: -[6, 14, 9][i] }); });
    drift(tl, head, 100, { y: function () { return -60 * U(); } });
    V4.targets.instagram = function () { return stY(tl, 40); };
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
    var rule = $('.rule', f1);
    t.fromTo(rule, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0);
    t.fromTo(lines('.eyebrow', f1), { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.06);
    t.fromTo(lines('.hero__h1', f1), { y: lineDrop, opacity: 1 }, { y: 0, duration: 1.05, stagger: 0.12 }, 0.14);
    if (mobile) t.fromTo($('.hero__deck .deck', f1), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.5);
    else t.fromTo(lines('.deck', f1), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, 0.5);
    // the cars arrive back to front, each rising inside its own bottom-edge clip — opaque throughout,
    // so overlapping cut-outs never show through each other. Their floor shadows come up underneath.
    [['ferrari', 0.42], ['porsche', 0.56], ['ford', 0.68]].forEach(function (c) {
      var body = $('.car__body', cars[c[0]]), sh = $('.car__shadow', cars[c[0]]);
      t.fromTo(body, { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)', y: 46 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.95, ease: 'expo.out' }, c[1]);
      t.fromTo(sh, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power1.out' }, c[1] + 0.1);
    });
    if (mobile) t.fromTo($('.hero__rec', f1), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1.1);
    else t.fromTo(lines('.hero__rec', f1).concat($('[data-idx]', ap)), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.1);
    t.fromTo($('.hero__cta', f1), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.22);
    root.classList.remove('intro');
    V4.intro = V4.introTL = t;
    function done() { window.removeEventListener('scroll', cut); V4.intro = null; }
    function cut() { if (window.scrollY > 4 && t.progress() < 1) { t.cut = true; t.progress(1); } }   // the reader's scroll always wins
    window.addEventListener('scroll', cut, { passive: true });
    var start = function () { if (t.progress() < 1 && !t.isActive() && !t.cut) t.play(); };
    // start once the type and the lead car are ready (or after 700ms, whichever is first)
    var ford = $('.car__body', cars.ford);
    Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : 0, ford && ford.decode ? ford.decode().catch(function () {}) : 0]),
      new Promise(function (r) { setTimeout(r, 700); })
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
