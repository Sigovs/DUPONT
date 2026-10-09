/* =============================================================================
   V4 scene choreography — GSAP + ScrollTrigger (vendored), Lenis via chrome.js.

   Runs only when (min-width: 1024px) and motion is allowed (gsap.matchMedia, G5);
   everything is built inside that context and reverts on exit (G1). Without it the
   page is the static composed build: F1 → F5 → each scene at its held composition.

   Units: every pinned timeline is written in vh of scroll (duration 1 = 1vh), so the
   numbers below read directly as the scroll budget. Text lives in .m (clip) > .l (moves).
   Reading stops are pixel-still and ≥ 40vh (project rule). Scrub 0.6 = slight weight.

   HOOKS for the motion designer: every timeline is exposed on V4.tl.{approach, rail,
   locs, sell, svc, rev, ig, foot}; labels mark the holds ("F1", "F2", "F3", "F5", "hold").
   ============================================================================= */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.V4 || !window.V4.cars) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener('refresh', function () { if (window.V4 && window.V4.ink) window.V4.ink(); });
  var V4 = window.V4, geo = V4.geo, root = document.documentElement;
  V4.tl = {};
  var SCRUB = 0.6;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var U = function () { return geo.u; };
  var VH = function () { return geo.vh; };
  var lines = function (sel, r) { return $$(sel + ' .l', r); };

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('motion');
    var ctx = gsap.context(function () { build(); });
    ScrollTrigger.refresh();
    jumpToHash();
    return function () {
      ctx.revert();
      root.classList.remove('motion');
      var ap = $('[data-approach]'); if (ap) delete ap.dataset.inkLive;
      V4.targets = {};
    };
  });

  function pinTL(trigger, vhLen, extra) {
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: Object.assign({
        trigger: trigger, start: 'top top', end: function () { return '+=' + vhLen * VH() / 100; },
        pin: true, scrub: SCRUB, invalidateOnRefresh: true, anticipatePin: 1
      }, extra || {})
    });
    return tl;
  }
  function stY(tl, t) {   // scroll position of timeline time t (vh units) inside a pinned trigger
    var st = tl.scrollTrigger; return st.start + (t / tl.duration()) * (st.end - st.start);
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
    var hdr = $('[data-hdr]');
    var car = { ferrari: $('.car--ferrari', ap), porsche: $('.car--porsche', ap), ford: $('.car--ford', ap) };
    var f1 = $('[data-f1]', ap), f2 = $('[data-f2]', ap), f3 = $('[data-f3]', ap);
    var h1 = lines('.hero__h1', f1), eyebrow1 = lines('.eyebrow', f1), deck = $('[data-f1-deck]', ap);
    var deckLines = lines('.deck', deck), cta = $('.hero__cta', deck), rec = lines('.hero__rec', f1), idx = $('[data-idx]', ap);
    var f2h = $$('.hero__h2 .l', f2), f2e = lines('.eyebrow', f2), f2r = $('[data-rule]', f2);
    var f3e = lines('.eyebrow', f3), f3r = $('[data-rule]', f3);
    var p1 = $('[data-p1]', ap), p2 = $('[data-p2]', ap), idxBlock = $('[data-col-index]', ap);
    var colText = $('[data-col-text]', ap);
    var colEye = lines('.eyebrow', colText), colH = lines('.col__h', colText), colDeck = lines('.deck', colText);

    gsap.set(deck, { overflow: 'clip' });
    // initial off-stage states (the static build shows final states)
    gsap.set(f2h.concat(f2e, f3e, colEye, colH, colDeck), { xPercent: -105 });
    var colRule = $('.rule', colText);
    gsap.set([f2r, f3r, colRule], { scaleX: 0 });
    gsap.set(p1, { autoAlpha: 0 });
    gsap.set(p2, { y: function () { return VH() - (geo.st + 560 * U()) + 4; } });
    gsap.set(idxBlock, { y: function () { return 470 * U(); }, autoAlpha: 0 });

    var tl = V4.tl.approach = pinTL(ap, 570);
    function carTo(name, frame, at, dur, ease) {
      tl.to(car[name], {
        x: function () { return V4.cars.delta(name, frame).x * U(); },
        y: function () { return V4.cars.delta(name, frame).y * U(); },
        scale: function () { return V4.cars.delta(name, frame).scale; },
        duration: dur, ease: ease || 'power1.inOut'
      }, at);
    }

    /* F1 hold 0–50 */
    tl.addLabel('F1', 0).to({}, { duration: 50 }, 0);
    /* T1 50–120 */
    var T = 50, D = 70;
    tl.to(h1[1], { yPercent: -135, duration: D * 0.24, ease: 'power2.in' }, T);
    tl.to(h1[0], { yPercent: -135, duration: D * 0.24, ease: 'power2.in' }, T + D * 0.06);
    tl.to(eyebrow1, { yPercent: -120, duration: D * 0.2, ease: 'power2.in' }, T);
    tl.to($('.rule', f1), { scaleX: 0, duration: D * 0.2 }, T);
    tl.to(deckLines, { x: function () { return deck.offsetWidth + 20; }, duration: D * 0.3, ease: 'power2.in', stagger: D * 0.03 }, T);
    tl.to(cta, { x: function () { return deck.offsetWidth + 20; }, duration: D * 0.3, ease: 'power2.in' }, T);
    tl.to(rec, { yPercent: 120, duration: D * 0.25, ease: 'power2.in' }, T);
    carTo('porsche', 'F2', T + D * 0.08, D * 0.84);
    carTo('ford', 'F2', T + D * 0.12, D * 0.80);
    carTo('ferrari', 'F2', T + D * 0.20, D * 0.72);
    tl.to(f2h[0], { xPercent: 0, duration: D * 0.28, ease: 'power3.out' }, T + D * 0.58);
    tl.to(f2h[1], { xPercent: 0, duration: D * 0.28, ease: 'power3.out' }, T + D * 0.64);
    tl.to(f2e, { xPercent: 0, duration: D * 0.28, ease: 'power3.out' }, T + D * 0.72);
    tl.to(f2r, { scaleX: 1, duration: D * 0.16, ease: 'power2.out' }, T + D * 0.72);
    /* F2 hold 120–170 */
    tl.addLabel('F2', 120).to({}, { duration: 50 }, 120);
    /* T2 170–250 */
    T = 170; D = 80;
    tl.to(f2h[1], { yPercent: -135, duration: D * 0.22, ease: 'power2.in' }, T);
    tl.to(f2h[0], { yPercent: -135, duration: D * 0.22, ease: 'power2.in' }, T + D * 0.04);
    tl.to(f2e, { yPercent: -120, duration: D * 0.18, ease: 'power2.in' }, T);
    tl.to(f2r, { scaleX: 0, duration: D * 0.18 }, T);
    carTo('ferrari', 'F3', T, D * 0.75, 'power2.in');
    carTo('porsche', 'F3', T + D * 0.10, D * 0.75);
    carTo('ford', 'F3', T, D, 'power1.inOut');
    tl.to(f3e, { xPercent: 0, duration: D * 0.24, ease: 'power3.out' }, T + D * 0.76);
    tl.to(f3r, { scaleX: 1, duration: D * 0.12, ease: 'power2.out' }, T + D * 0.76);
    /* F3 hold 250–290 */
    tl.addLabel('F3', 250).to({}, { duration: 40 }, 250);
    /* T3 290–410 · the Passage and the Wake */
    T = 290; D = 120;
    tl.to(hdr, { yPercent: -140, duration: D * 0.12, ease: 'power2.in' }, T);
    tl.to(idx, { autoAlpha: 0, duration: D * 0.12 }, T);
    tl.to(f3e, { yPercent: -120, duration: D * 0.15, ease: 'power2.in' }, T);
    tl.to(f3r, { scaleX: 0, duration: D * 0.15 }, T);
    carTo('ferrari', 'EXIT', T, D * 0.35, 'power2.in');
    carTo('porsche', 'EXIT', T + D * 0.05, D * 0.35, 'power2.in');
    // the Ford drives over the lens: linear in both translation and scale (cap 1.00), so its
    // shadow tail moves linearly too — and P1 is locked to it 36 stage-px below (the Wake)
    var fordEnd = function () { return { x: 1010, y: -200 - geo.st / U(), W: 1154 }; };
    var F3f = V4_ASSETS.frames.F3.ford, F1f = V4_ASSETS.frames.F1.ford;
    tl.to(car.ford, {
      x: function () { return (fordEnd().x - F1f[0]) * U(); },
      y: function () { return (fordEnd().y - F1f[1]) * U(); },
      scale: function () { return fordEnd().W / F1f[2]; },
      duration: D * 0.68, ease: 'none'
    }, T + D * 0.12);
    tl.set(p1, { autoAlpha: 1 }, T + D * 0.12);
    tl.fromTo(p1, {
      y: function () { return geo.st + (F3f[1] + V4.cars.shadowTail('ford', F3f[2]) + 36) * U(); }
    }, {
      y: function () { var e = fordEnd(); return geo.st + (e.y + V4.cars.shadowTail('ford', e.W) + 36) * U(); },
      duration: D * 0.68, ease: 'none', immediateRender: false
    }, T + D * 0.12);
    tl.to(p2, { y: 0, duration: D * 0.40, ease: 'power2.out' }, T + D * 0.20);
    tl.set(idxBlock, { autoAlpha: 1 }, T + D * 0.30);
    tl.to(idxBlock, { y: 0, duration: D * 0.40, ease: 'power2.out' }, T + D * 0.30);
    tl.to(colEye, { xPercent: 0, duration: D * 0.14, ease: 'power3.out' }, T + D * 0.72);
    tl.to(colRule, { scaleX: 1, duration: D * 0.1, ease: 'power2.out' }, T + D * 0.72);
    tl.to(colH[0], { xPercent: 0, duration: D * 0.18, ease: 'power3.out' }, T + D * 0.72);
    tl.to(colH[1], { xPercent: 0, duration: D * 0.18, ease: 'power3.out' }, T + D * 0.76);
    tl.to(colDeck, { xPercent: 0, duration: D * 0.18, ease: 'power3.out' }, T + D * 0.80);
    tl.to(hdr, { yPercent: 0, duration: D * 0.16, ease: 'power2.out' }, T + D * 0.84);
    /* F5 hold 410–470, then 470–570 the rail slides over the held Collection */
    tl.addLabel('F5', 410).to({}, { duration: 160 }, 410);

    // header ink follows the stage (logo over ivory, nav over P1 once the Collection is in)
    var setInk = function () { ap.dataset.inkLive = tl.time() > T + D * 0.8 ? 'split' : 'dark'; V4.ink(); };
    tl.eventCallback('onUpdate', setInk);
    ap.dataset.inkLive = 'dark';

    V4.targets.top = function () { return 0; };
    V4.targets.collection = function () { return stY(tl, 425); };
  }

  /* ------------------------------------------------------ 03 · AVAILABLE NOW */
  function rail() {
    var sec = $('[data-scene="rail"]'); if (!sec) return;
    var track = $('[data-rail-track]', sec), cards = $$('[data-rcard]', sec), head = $('.rail__head', sec);
    var n = cards.length;
    gsap.set(sec, { marginTop: function () { return -VH(); } });   // overlaps the held Collection
    var step = function () { return cards[1].offsetLeft - cards[0].offsetLeft; };
    var setters = cards.map(function (c) { return { s: gsap.quickSetter(c, 'scale'), o: gsap.quickSetter(c, 'opacity') }; });
    function focus() {
      var x = gsap.getProperty(track, 'x'), w = step();
      cards.forEach(function (c, i) {
        var d = Math.min(1, Math.abs(i + x / w));
        setters[i].s(1 - 0.14 * d); setters[i].o(1 - 0.55 * d);
      });
    }
    var HOLD = 40, MOVE = 16;
    var tl = V4.tl.rail = pinTL(sec, HOLD + (n - 1) * (MOVE + HOLD), { onRefresh: focus });
    tl.addLabel('hold0', 0).to({}, { duration: HOLD }, 0);
    for (var i = 1; i < n; i++) {
      var at = HOLD + (i - 1) * (MOVE + HOLD);
      (function (k) { tl.to(track, { x: function () { return -k * step(); }, duration: MOVE, ease: 'power2.inOut' }, at); })(i);
      tl.addLabel('hold' + i, at + MOVE).to({}, { duration: HOLD }, at + MOVE);
    }
    tl.eventCallback('onUpdate', focus);
    focus();
    // head enters while the scene rides over the Collection
    var hl = lines('.rail__h', head).concat(lines('.eyebrow', head));
    gsap.fromTo(hl, { xPercent: -105 }, {
      xPercent: 0, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: sec, start: 'top 70%', end: 'top 15%', scrub: SCRUB, invalidateOnRefresh: true }
    });
    gsap.fromTo(track, { yPercent: 18 }, {
      yPercent: 0, ease: 'none', immediateRender: true,
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: SCRUB, invalidateOnRefresh: true }
    });
    // focus works for keyboard users too: tabbing to a card brings it into focus position
    cards.forEach(function (c, i) {
      c.addEventListener('focusin', function () { V4.scrollTo(stY(tl, i === 0 ? HOLD / 2 : HOLD + (i - 1) * (MOVE + HOLD) + MOVE + HOLD / 2), true); });
    });
    V4.targets.available = function () { return stY(tl, 4); };
  }

  /* --------------------------------------------- 04 · ABOUT + LOCATIONS */
  function locs() {
    var sec = $('[data-scene="locs"]'); if (!sec) return;
    var map = $('[data-locs-map]', sec), lamps = $$('.lamp', sec), text = $('[data-locs-text]', sec);
    var cities = $$('.city', sec), panels = $('[data-locs-panels]', sec);
    var tl0 = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: SCRUB, invalidateOnRefresh: true } });
    tl0.fromTo(map, { y: function () { return 260 * U(); } }, { y: 0, duration: 1 }, 0);
    tl0.fromTo(lines('.locs__h', text).concat(lines('.eyebrow', text)), { xPercent: -105 }, { xPercent: 0, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, 0.55);
    tl0.fromTo(cities, { y: function () { return 140 * U(); } }, { y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, 0.3);
    gsap.set(lamps, { autoAlpha: 0 });
    var tl = V4.tl.locs = pinTL(sec, 100);
    // the three showrooms switch on west → east, then hold (70vh)
    tl.to(lamps[0], { autoAlpha: 1, duration: 8 }, 2).to(lamps[1], { autoAlpha: 1, duration: 8 }, 12).to(lamps[2], { autoAlpha: 1, duration: 8 }, 20);
    tl.fromTo(panels, { x: function () { return 60 * U(); } }, { x: 0, duration: 24, ease: 'power2.out' }, 0);
    tl.addLabel('hold', 30).to({}, { duration: 70 }, 30);
    V4.targets.locations = function () { return stY(tl, 30); };
    V4.targets.about = V4.targets.locations;
  }

  /* entrance timelines run in the seam (the scene arriving); the pin that follows is a pure hold */
  function enterTL(sec, start) {
    return gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: start || 'top 85%', end: 'top top', scrub: SCRUB, invalidateOnRefresh: true } });
  }

  /* --------------------------------------------------- 05 · SELL YOUR CAR */
  function sell() {
    var sec = $('[data-scene="sell"]'); if (!sec) return;
    var ph = $('[data-sell-ph]', sec), text = $('[data-sell-text]', sec);
    var hl = lines('.sell__h', text), eye = lines('.eyebrow', text), deck = lines('.deck', text), act = lines('.sell__act', text);
    var rule = $('.rule', text);
    var tl0 = enterTL(sec, 'top bottom');
    // the panel travels on its own clock: it starts lower than the section and catches up
    tl0.fromTo(ph, { y: function () { return 0.5 * VH(); } }, { y: 0, duration: 1 }, 0);
    tl0.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.15 }, 0.35);
    tl0.fromTo(eye, { yPercent: 120 }, { yPercent: 0, duration: 0.2, ease: 'power3.out' }, 0.38);
    tl0.fromTo(hl[0], { xPercent: -105 }, { xPercent: 0, duration: 0.35, ease: 'power3.out' }, 0.42);
    tl0.fromTo(hl[1], { xPercent: 105 }, { xPercent: 0, duration: 0.35, ease: 'power3.out' }, 0.5);
    tl0.fromTo(deck, { yPercent: 110 }, { yPercent: 0, duration: 0.25, ease: 'power3.out', stagger: 0.04 }, 0.62);
    tl0.fromTo(act, { xPercent: 110 }, { xPercent: 0, duration: 0.25, ease: 'power3.out' }, 0.7);
    var tl = V4.tl.sell = pinTL(sec, 60);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0);
    V4.targets.sell = function () { return stY(tl, 1); };
  }

  /* ------------------------------------------------------- 06 · SERVICES */
  function services() {
    var sec = $('[data-scene="svc"]'); if (!sec) return;
    var head = $('[data-svc-head]', sec), panels = $$('[data-svc-panel]', sec), fin = $('[data-svc-fin]', sec);
    var hl = lines('.svc__h', head).concat(lines('.eyebrow', head));
    var tl0 = enterTL(sec, 'top 90%');
    tl0.fromTo(hl, { xPercent: -105 }, { xPercent: 0, duration: 0.35, ease: 'power3.out', stagger: 0.05 }, 0.45);
    // three panels rise at three rates and land in order: the band assembles as the scene arrives
    panels.forEach(function (p, i) {
      tl0.fromTo(p, { y: function () { return (0.45 + 0.2 * i) * VH(); } }, { y: 0, duration: 0.7 + 0.1 * i, ease: 'power2.out' }, 0.1 + 0.1 * i);
    });
    tl0.fromTo(fin, { x: function () { return 520 * U() + geo.sl; } }, { x: 0, duration: 0.4, ease: 'power3.out' }, 0.6);
    var tl = V4.tl.svc = pinTL(sec, 70);
    tl.addLabel('hold', 0).to({}, { duration: 70 }, 0);
    var t = function () { return stY(tl, 1); };
    ['services', 'insurance', 'service', 'ppf', 'finance'].forEach(function (k) { V4.targets[k] = t; });
  }

  /* -------------------------------------------------------- 07 · REVIEWS */
  function reviews() {
    var sec = $('[data-scene="rev"]'); if (!sec) return;
    var q1 = lines('.rev__q--1 blockquote', sec), q2 = $('.rev__q--2', sec), q3 = $('.rev__q--3', sec);
    var tl0 = enterTL(sec, 'top 75%');
    q1.forEach(function (l, i) { tl0.fromTo(l, { xPercent: i % 2 ? 105 : -105 }, { xPercent: 0, duration: 0.4, ease: 'power3.out' }, 0.2 + i * 0.1); });
    tl0.fromTo(q2, { x: function () { return -(geo.sl + 820 * U()); } }, { x: 0, duration: 0.45, ease: 'power3.out' }, 0.45);
    tl0.fromTo(q3, { x: function () { return geo.sl + 820 * U(); } }, { x: 0, duration: 0.45, ease: 'power3.out' }, 0.55);
    var tl = V4.tl.rev = pinTL(sec, 60);
    tl.addLabel('hold', 0).to({}, { duration: 60 }, 0);
    V4.targets.reviews = function () { return stY(tl, 1); };
  }

  /* ------------------------------------------------------ 08 · INSTAGRAM */
  function instagram() {
    var sec = $('[data-scene="ig"]'); if (!sec) return;
    var head = $('[data-ig-head]', sec), cols = $$('[data-ig-col]', sec);
    var travel = [[700, -60], [980, -500], [840, -260]];   // stage px: start → held offset, three rates
    var mid = function (i) { return travel[i][0] * 0.45 + travel[i][1] * 0.55; };
    var tl0 = enterTL(sec, 'top bottom');
    cols.forEach(function (c, i) { tl0.fromTo(c, { y: function () { return travel[i][0] * U(); } }, { y: function () { return mid(i) * U(); }, duration: 1 }, 0); });
    tl0.fromTo(lines('.ig__h', head).concat(lines('.eyebrow', head)), { xPercent: -105 }, { xPercent: 0, duration: 0.35, ease: 'power3.out', stagger: 0.05 }, 0.6);
    var tl = V4.tl.ig = pinTL(sec, 100);
    cols.forEach(function (c, i) { tl.fromTo(c, { y: function () { return mid(i) * U(); } }, { y: function () { return travel[i][1] * U(); }, duration: 40, ease: 'power1.out', immediateRender: false }, 0); });
    tl.addLabel('hold', 40).to({}, { duration: 60 }, 40);
    V4.targets.instagram = function () { return stY(tl, 40); };
  }

  /* ------------------------------------------------------- 09 · FOOTER */
  function footer() {
    var sec = $('[data-scene="foot"]'); if (!sec) return;
    var cards = $$('[data-foot-card]', sec);
    gsap.fromTo(cards, { y: function (i) { return (90 + i * 50) * U(); } }, {
      y: 0, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 25%', scrub: SCRUB, invalidateOnRefresh: true }
    });
    V4.targets.showrooms = function () { return sec.getBoundingClientRect().top + window.scrollY; };
    V4.targets.contact = V4.targets.showrooms;
  }

  /* ------------------------------------------- deep links (e.g. inventory → #ppf) */
  function jumpToHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || id === 'main') return;
    var go = function () { ScrollTrigger.refresh(); V4.go(id, true); };
    if (document.readyState === 'complete') requestAnimationFrame(go);
    else window.addEventListener('load', function () { requestAnimationFrame(go); }, { once: true });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
