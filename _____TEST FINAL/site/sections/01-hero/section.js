/* 01-hero — "Every detail, one registry" · variant C "Detail finds its place"
   Ported from _____TEST FINAL/hero (standalone reference). Scroll core (Lenis, ticker) is owned by assets/js/core.js.
   Static (reduced motion / no JS): each chapter is macro | car side by side, a red "|" between.
   Motion: one pinned stage, scrubbed and reversible. HOLDS (42vh, nothing moves) alternate with CUTS.
   Detail → car: the riddle staircases out; the macro pulls back into an inset plate in the clear field, a hairline
   leader is drawn from the detail's real point on the car to the plate, then the red blade cuts plate and leader away
   and the plate text staircases into the constant slot. Car → next detail: the blade sweeps back.
   Intro (time-based, ≤1.6s, never blocks scroll): the macro opens behind the house angle from the side the shield
   sits on; eyebrow → headline lines → body → actions arrive as a staircase from the side. */
(function () {
  'use strict';

  /* image paths come from gen.py ({P} prefix per page);
     nothing to rewrite here. */
  function fixPaths() {}

  window.Select.register('01-hero', function (ctx) {
    var hero = ctx.el;
    fixPaths(hero);
    if (ctx.reduced || !ctx.gsap) return;               /* the static side-by-side page is the designed state */
    var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
    var stage = hero.querySelector('[data-stage]');
    var blade = hero.querySelector('[data-blade]');
    var sceneEls = Array.prototype.slice.call(hero.querySelectorAll('.scene'));
    var N = sceneEls.length;
    var chapEls = Array.prototype.slice.call(hero.querySelectorAll('.chap'));
    var idxBtns = Array.prototype.slice.call(hero.querySelectorAll('[data-go]'));
    var intro = null;
    hero.classList.add('hero--live');

  /* ---------------- motion tokens ---------------- */
    var M = {
      hold: 47,                       /* vh — recomputed: max(47vh, 560px), mirrors --hold in section.css */
      flightCut: 60, plainCut: 32,    /* vh — detail→car cuts are longer (they carry the flight) */
      slant: 16, blade: 18,           /* blade: 16% lean, 18% of the stage width */
      /* detail → car: text out, macro flies to its place, blade cuts it away rightwards */
      flight: { out: [0, 0.14], fly: [0.1, 0.46], line: [0.46, 0.6], frame: [0.46, 0.56], label: [0.58, 0.66], blade: [0.7, 0.96], dir: -1 },
      /* car → next detail: blade sweeps back leftwards */
      plain: { blade: [0.08, 0.72], dir: 1 },
      gap: 0.03,
      lineDur: 0.16,
      lineTravel: 64
    };
    var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeIn = function (t) { return t * t * t; };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var f = function (v) { return (Math.round(v * 1000) / 1000); };
    var pair = function (s) { if (!s) return null; var p = s.split(',').map(parseFloat); return { x: p[0], y: p[1] }; };

    var S = sceneEls.map(function (el) {
      return {
        el: el, ink: el.getAttribute('data-ink'),
        whole: el.classList.contains('scene--w'), macro: el.classList.contains('scene--m'),
        media: el.querySelector('[data-media]'), plate: el.querySelector('[data-plate]'),
        img: el.querySelector('[data-media] img'),
        anchor: pair(el.getAttribute('data-anchor')), anchorH: parseFloat(el.getAttribute('data-anchor-h')) || 0,
        target: pair(el.getAttribute('data-target')), targetH: parseFloat(el.getAttribute('data-target-h')) || 0,
        cardW: parseFloat(el.getAttribute('data-card-w')) || 0,
        co: el.querySelector('[data-callout]'), lbl: el.querySelector('.callout__lbl'),
        focal: pair(el.getAttribute('data-focal')), floor: parseFloat(el.getAttribute('data-floor')) || 0,
        lines: Array.prototype.slice.call(el.querySelectorAll('.ln')).map(function (ln) { return { el: ln, w: 0, h: 0, lead: !!ln.closest('.eyebrow, .head') }; })
      };
    });

    /* ---------------- geometry: where a source pixel lands on screen ----------------
       object-fit: cover + object-position + CSS scale(sc) about transform-origin, inside the
       media box. Read from computed style and layout offsets (never from transformed rects). */
    function imgMap(s) {
      var img = s.img, cs = getComputedStyle(img);
      var bw = s.media.offsetWidth, bh = s.media.offsetHeight, nw = img.naturalWidth, nh = img.naturalHeight;
      if (!nw || !bw) return null;
      var s0 = cs.objectFit === 'none' ? 1 : (cs.objectFit === 'contain' ? Math.min : Math.max)(bw / nw, bh / nh), w = nw * s0, h = nh * s0;
      var pos = cs.objectPosition.split(' ');
      var off = function (v, free) { return /px$/.test(v) ? parseFloat(v) : free * parseFloat(v) / 100; };
      var ox = off(pos[0], bw - w), oy = off(pos[1], bh - h);
      var m = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform), sc = m.a || 1;
      var to = cs.transformOrigin.split(' ').map(parseFloat);
      var bx = s.media.offsetLeft, by = s.media.offsetTop;
      return {
        k: s0 * sc,
        at: function (x, y) {
          var px = ox + x * s0, py = oy + y * s0;
          return { x: bx + to[0] + (px - to[0]) * sc, y: by + to[1] + (py - to[1]) * sc };
        }
      };
    }
    /* flight plan for cut k (macro A → whole B): the macro becomes an inset plate in the clear field,
       beside — never over — the car; a leader runs from the detail's real point on the car to the plate */
    var PLAN = {};
    function plan(k) {
      if (PLAN[k]) return PLAN[k];
      var A = S[k], B = S[k + 1], mb = imgMap(B);
      if (!B.target || !mb) return null;
      var W = stage.offsetWidth, D = mb.at(B.target.x, B.target.y);
      var gut = A.el.querySelector('.slot').offsetLeft, slotTop = A.el.querySelector('.slot').offsetTop;
      var por = portrait.matches;
      var iw = por ? Math.round(Math.min(W - 2 * gut, 520)) : Math.round(Math.min(560, Math.max(300, W * 0.26)));
      var lw = A.lbl ? A.lbl.offsetWidth : 0, run = lw + 56;
      var ih = Math.round(iw * A.media.offsetHeight / A.media.offsetWidth);
      /* desktop: the plate hangs just above the roof, so the leader stays short */
      var carTop = mb.at(0, 0).y, Hs = stage.offsetHeight;
      var iy = por ? B.media.offsetTop + B.media.offsetHeight + 28 : Math.max(slotTop, carTop - ih - Hs * 0.04);
      var yh = por ? iy + ih * 0.5 : iy + ih * 0.75, dx = Math.abs(D.y - yh) * 0.5774;     /* 60° diagonal, then a horizontal run */
      var below = false, side, ix;
      function place(r) {
        side = 1; ix = Math.min(W - gut - iw, Math.max(D.x + dx + r, D.x + W * 0.14));
        if (ix >= D.x + dx + r) return true;
        side = -1; ix = Math.max(gut, Math.min(D.x - dx - r - iw, D.x - W * 0.14 - iw));
        return ix + iw <= D.x - dx - r;
      }
      if (!place(run)) {                                  /* narrow screens: the plate sits under the detail, the label under the plate */
        below = true; side = 1; ix = Math.max(gut, Math.min(W - gut - iw - 48, D.x - iw * 0.35));
      }
      var Mx = D.x + side * dx, Ex = side > 0 ? ix : ix + iw, pts3 = null;
      if (below) { var cx = ix + iw * 0.5, yk = iy - 24; Mx = cx; yh = yk; Ex = cx; pts3 = [D, { x: cx, y: yk }, { x: cx, y: iy }]; }
      var scale = iw / A.media.offsetWidth;
      PLAN[k] = { D: D, M: { x: Mx, y: yh }, E: { x: Ex, y: yh }, inset: { x: ix, y: iy, w: iw, h: ih }, scale: scale, side: side,
        len: Math.hypot(Mx - D.x, yh - D.y) + Math.abs(Ex - Mx) + (below ? 24 : 0), per: 2 * (iw + ih) };
      var C = A.co;
      if (C) {
        C.setAttribute('width', W); C.setAttribute('height', stage.offsetHeight);
        var pts = pts3 ? pts3.map(function (q) { return f(q.x) + ',' + f(q.y); }).join(' ')
                       : f(D.x) + ',' + f(D.y) + ' ' + f(Mx) + ',' + f(yh) + ' ' + f(Ex) + ',' + f(yh);
        C.querySelectorAll('polyline').forEach(function (pl) { pl.setAttribute('points', pts); pl.style.strokeDasharray = PLAN[k].len; });
        C.querySelectorAll('rect').forEach(function (r) { r.setAttribute('x', ix - 0.5); r.setAttribute('y', iy - 0.5); r.setAttribute('width', iw + 1); r.setAttribute('height', ih + 1); r.style.strokeDasharray = PLAN[k].per + 4; });
        var dot = C.querySelector('circle'); dot.setAttribute('cx', f(D.x)); dot.setAttribute('cy', f(D.y));
        A.lbl.style.left = f(Math.max(gut, Math.min(W - gut - lw, below ? ix : (side > 0 ? Mx + 12 : Mx - 12 - lw)))) + 'px';
        A.lbl.style.top = f(below ? iy + ih + 12 : yh - 30) + 'px';
      }
      return PLAN[k];
    }

    /* ---------------- one grid: register every image on the shared lines ----------------
       band: the front tyre-contact line sits on the shared floor line (band height − 9.2%). */
    var portrait = window.matchMedia('(max-width: 1100px)');
    function register() {
      S.forEach(function (s) {
        if (!s.img) return;
        s.img.style.objectPosition = '';
        if (portrait.matches || !s.img.naturalWidth) return;
        var bw = s.media.offsetWidth, bh = s.media.offsetHeight, nw = s.img.naturalWidth, nh = s.img.naturalHeight;
        var s0 = Math.max(bw / nw, bh / nh), h = nh * s0;
        if (s.whole && s.floor) {
          var fy = bh * (1 - 0.092);
          var oy2 = Math.min(0, Math.max(bh - h, fy - s.floor * s0));
          s.img.style.objectPosition = '50% ' + (bh === h ? 50 : f(oy2 / (bh - h) * 100)) + '%';
        }
      });
    }

    function measure() {
      if (typeof runway === 'function') runway();
      /* staircase travel never carries a line past the viewport edge: ≤ 3/4 of the gutter */
      var sl0 = hero.querySelector('.slot'); M.lineTravel = Math.min(64, Math.round((sl0 ? sl0.offsetLeft : 64) * 0.75));
      register();
      S.forEach(function (s) { s.lines.forEach(function (l) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }); });
      PLAN = {}; TH = {};
      var st = stage.getBoundingClientRect(), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      S.forEach(function (s) {
        s.el.querySelectorAll('.slot .ln').forEach(function (ln) {
          var l = ln.offsetLeft, t = ln.offsetTop, p = ln.offsetParent;
          while (p && p !== s.el) { l += p.offsetLeft; t += p.offsetTop; p = p.offsetParent; }
          if (!ln.offsetWidth) return;
          x0 = Math.min(x0, l); x1 = Math.max(x1, l + ln.offsetWidth); y0 = Math.min(y0, t); y1 = Math.max(y1, t + ln.offsetHeight);
        });
      });
      if (x1 > x0) SLOT = { x0: x0 / st.width * 100 - 1, x1: x1 / st.width * 100 + 1, y0: y0 / st.height, y1: y1 / st.height };
    }
    var SLOT = { x0: 6, x1: 46, y0: 0.15, y1: 0.65 }, TH = {};

    /* ---------------- polygons (every edge leans "/": bottom sits `sl` left of top) ---------------- */
    function visPct(sl, xt, side) {
      var xb = xt - sl;
      if (side === 'R') return 'polygon(' + f(xt) + '% 0%,200% 0%,200% 100%,' + f(xb) + '% 100%)';
      return 'polygon(-100% 0%,' + f(xt) + '% 0%,' + f(xb) + '% 100%,-100% 100%)';
    }
    function bladePct(a, b, sl) {
      return 'polygon(' + f(a) + '% 0%,' + f(a + b) + '% 0%,' + f(a + b - sl) + '% 100%,' + f(a - sl) + '% 100%)';
    }
    function visPx(w, h, sl, pad, xt, side) {
      var xb = xt - sl, t = -pad, b = h + pad;
      if (side === 'R') { var r = w + pad + sl; return 'polygon(' + f(xt) + 'px ' + t + 'px,' + r + 'px ' + t + 'px,' + r + 'px ' + b + 'px,' + f(xb) + 'px ' + b + 'px)'; }
      var l = -pad - sl; return 'polygon(' + l + 'px ' + t + 'px,' + f(xt) + 'px ' + t + 'px,' + f(xb) + 'px ' + b + 'px,' + l + 'px ' + b + 'px)';
    }
    var HIDE = 'polygon(0 0,0 0,0 0,0 0)';

    /* blade position. dir +1 travels leftwards (enters right), -1 rightwards (enters left) */
    function bladeGeo(p, win, dir) {
      var e = easeInOut(clamp((p - win[0]) / (win[1] - win[0]))), sl = M.slant, bw = M.blade, a;
      if (dir > 0) a = lerp(100 + sl, -bw, e); else a = lerp(-bw, 100 + sl, e);
      return { e: e, a: a };
    }
    function touches(g) { return (g.a + M.blade - M.slant * SLOT.y0) > SLOT.x0 && (g.a - M.slant * SLOT.y1) < SLOT.x1; }
    function thresholds(key, win, dir) {
      if (TH[key]) return TH[key];
      var first = -1, last = -1;
      for (var i = 0; i <= 400; i++) { var p = i / 400, g = bladeGeo(p, win, dir); if (g.e > 0 && g.e < 1 && touches(g)) { if (first < 0) first = p; last = p; } }
      TH[key] = { touch: first < 0 ? win[0] : first, clear: last < 0 ? win[1] : last };
      return TH[key];
    }

    /* ---------------- type staircase ---------------- */
    function renderLines(s, q, phase, dir, span) {
      var n = s.lines.length, ld = Math.min(M.lineDur, span * 0.6);
      var stg = n > 1 ? Math.max(0, span - ld) / (n - 1) : 0;
      for (var i = 0; i < n; i++) {
        var L = s.lines[i], t = clamp((q - i * stg) / ld), sl = L.h * 0.284, pad = 12, x, xt, side;
        if (phase === 'in') {
          var e = easeOut(t);
          if (e >= 1) { L.el.style.clipPath = ''; L.el.style.transform = ''; L.el.style.visibility = ''; continue; }
        L.el.style.visibility = t <= 0 ? 'hidden' : '';
          x = dir * M.lineTravel * (1 - e);
          if (dir > 0) { side = 'R'; xt = lerp(L.w + pad + sl, -pad, e); } else { side = 'L'; xt = lerp(-pad, L.w + pad + sl, e); }
        } else {
          var e2 = easeIn(t);
          if (e2 <= 0) { L.el.style.clipPath = ''; L.el.style.transform = ''; L.el.style.visibility = ''; continue; }
        L.el.style.visibility = t >= 1 ? 'hidden' : '';
          x = -dir * M.lineTravel * e2;
          if (dir > 0) { side = 'L'; xt = lerp(L.w + pad + sl, -pad, e2); } else { side = 'R'; xt = lerp(-pad, L.w + pad + sl, e2); }
        }
        L.el.style.transform = 'translate3d(' + f(x) + 'px,0,0)';
        L.el.style.clipPath = visPx(L.w, L.h, sl, pad, xt, side);
      }
    }
    function reset(s) {
      s.el.style.clipPath = ''; s.el.style.background = '';
      s.plate.style.transform = ''; s.media.style.transform = ''; s.media.style.transformOrigin = '';
      
      if (s.co) { s.co.style.visibility = 'hidden'; } if (s.lbl) s.lbl.style.clipPath = '';
    }

    /* ---------------- runway ---------------- */
    function cutLen(k) { return S[k].macro && S[k + 1] && S[k + 1].whole ? M.flightCut : M.plainCut; }
    var STARTS = [], UNITS = 0;
    function runway() {
      M.hold = Math.max(47, 56000 / (window.innerHeight || 1080));
      STARTS = []; var u = 0; for (var k = 0; k < N; k++) { STARTS.push(u); u += M.hold; if (k < N - 1) u += cutLen(k); } UNITS = u;
    }
    runway();
    function segAt(u) {
      for (var k = 0; k < N; k++) {
        var h0 = STARTS[k];
        if (u < h0 + M.hold || k === N - 1) return { hold: true, k: k };
        if (u < h0 + M.hold + cutLen(k)) return { hold: false, k: k, p: (u - h0 - M.hold) / cutLen(k) };
      }
      return { hold: true, k: N - 1 };
    }

    var shownKey = '', activeChap = -1, holdKey = '';
    function show(under, over) {
      var key = under + ':' + over;
      if (key === shownKey) return;
      S.forEach(function (s, i) {
        var vis = i === under || i === over;
        s.el.classList.toggle('is-shown', vis);
        s.el.classList.toggle('is-under', i === under);
        s.el.classList.toggle('is-over', i === over);
        if (!vis) reset(s);
        if (vis && over < 0) s.el.removeAttribute('inert'); else s.el.setAttribute('inert', '');
      });
      shownKey = key;
    }
    function setChapter(c) {
      c = Math.max(0, Math.min(chapEls.length - 1, c));
      if (c === activeChap) return;
      activeChap = c;
      idxBtns.forEach(function (b, i) {
        b.classList.toggle('is-active', i === c);
        if (i === c) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      chapEls.forEach(function (el, i) { el.setAttribute('aria-hidden', i === c ? 'false' : 'true'); });
    }

    /* ---------------- text: time-based once a threshold is crossed ----------------
       Scroll decides WHETHER a scene's text is shown; once that changes, the staircase plays to its end in time
       (or reverses if the threshold is crossed back). Photos, flight and blade stay scrubbed. Nothing ever moves
       the scroll position. Exited lines are visibility:hidden, so no half-built text can rest on screen. */
    var TXT = { inDur: 0.9, outDur: 0.55, inDir: -1, outDir: 1 };
    S.forEach(function (sc) { sc.tx = { v: 1, phase: 'in', want: null, tw: null }; });
    function drawText(sc) {
      if (sc.tx.phase === 'in') renderLines(sc, sc.tx.v, 'in', TXT.inDir, 1);
      else renderLines(sc, 1 - sc.tx.v, 'out', TXT.outDir, 1);
    }
    function wantText(sc, show, instant) {
      if (sc.tx.want === show && !instant) return;
      sc.tx.want = show;
      var t = sc.tx;
      if (t.tw) { t.tw.kill(); t.tw = null; }
      if (show) { if (!(t.phase === 'out' && t.v > 0)) { if (t.v >= 1) t.phase = 'in'; else if (t.phase !== 'in') { t.phase = 'in'; t.v = 0; } } }
      else { if (!(t.phase === 'in' && t.v < 1)) t.phase = 'out'; }
      var to = show ? 1 : 0;
      if (instant) { t.v = to; drawText(sc); return; }
      t.tw = gsap.to(t, { v: to, duration: show ? TXT.inDur : TXT.outDur, ease: 'none', onUpdate: function () { drawText(sc); }, onComplete: function () { t.tw = null; drawText(sc); } });
    }
    var firstText = true;
    function textTargets(sg) {
      S.forEach(function (sc, i) {
        var show;
        if (sg.hold) show = i === sg.k;
        else if (i === sg.k) show = sg.p <= 0.002;
        else if (i === sg.k + 1) show = sg.p >= Math.min(0.97, thresholds('flight', M.flight.blade, M.flight.dir).clear + M.gap);
        else show = false;
        wantText(sc, show, firstText);
      });
      firstText = false;
    }

    function renderFlight(k, p) {
      var A = S[k], B = S[k + 1], F = M.flight, P = plan(k);
      show(k + 1, k);                                   /* the whole car rests underneath; the macro flies above */
      A.el.style.background = 'transparent';
      /* 1 · the riddle leaves (time-based, see textTargets) */
      if (P) {
        /* 2 · pull-back: the whole macro frame shrinks into the inset plate */
        var e = easeInOut(clamp((p - F.fly[0]) / (F.fly[1] - F.fly[0])));
        /* a pure homothety: every corner travels in a straight line to the plate's corner; the scale is
           front-loaded so the large frame clears the car quickly */
        var e2 = 1 - Math.pow(1 - e, 2.2), sc = Math.pow(P.scale, e2), mL = A.media.offsetLeft, mT = A.media.offsetTop;
        var ox = (P.inset.x - P.scale * mL) / (1 - P.scale), oy = (P.inset.y - P.scale * mT) / (1 - P.scale);
        A.media.style.transformOrigin = f(ox - mL) + 'px ' + f(oy - mT) + 'px';
        A.media.style.transform = 'scale(' + f(sc) + ')';
        /* 3 · hairline frame + leader drawn (scrubbed dash offset), then the label */
        var ql = easeInOut(clamp((p - F.line[0]) / (F.line[1] - F.line[0]))), qf = easeInOut(clamp((p - F.frame[0]) / (F.frame[1] - F.frame[0])));
        A.co.querySelectorAll('polyline').forEach(function (pl) { pl.style.strokeDashoffset = f(P.len * (1 - ql)); });
        A.co.querySelectorAll('rect').forEach(function (r) { r.style.strokeDashoffset = f((P.per + 4) * (1 - qf)); });
        A.co.querySelector('circle').style.opacity = ql > 0 ? 1 : 0;
        A.co.style.visibility = p >= F.frame[0] ? 'visible' : 'hidden';
        var qb = easeOut(clamp((p - F.label[0]) / (F.label[1] - F.label[0])));
        A.lbl.style.clipPath = P.side > 0 ? 'inset(0 ' + f(100 - qb * 100) + '% 0 0)' : 'inset(0 0 0 ' + f(100 - qb * 100) + '%)';
      }
      /* 4 · the blade cuts plate, leader and label away (rightwards); the real photo is already there */
      var g = bladeGeo(p, F.blade, F.dir);
      if (g.e <= 0) { blade.style.clipPath = HIDE; A.el.style.clipPath = ''; }
      else if (g.e >= 1) { blade.style.clipPath = HIDE; A.el.style.clipPath = HIDE; }
      else { blade.style.clipPath = bladePct(g.a, M.blade, M.slant); A.el.style.clipPath = visPct(M.slant, g.a + M.blade, 'R'); }
      /* 5 · plate text arrives once the blade has cleared the slot (time-based, see textTargets) */
      setChapter(Math.floor(k / 2));
    }

    function renderPlain(k, p) {
      var A = S[k], B = S[k + 1], C = M.plain, dir = C.dir;
      show(k, k + 1);
      var g = bladeGeo(p, C.blade, dir);
      if (g.e <= 0) { B.el.style.clipPath = HIDE; blade.style.clipPath = HIDE; }
      else if (g.e >= 1) { B.el.style.clipPath = ''; blade.style.clipPath = HIDE; }
      else { B.el.style.clipPath = visPct(M.slant, g.a + M.blade, 'R'); blade.style.clipPath = bladePct(g.a, M.blade, M.slant); }
      /* the outgoing panel drifts with the blade; the incoming macro settles from a small offset */
      var inOff = 6 * clamp(1 - g.e / 0.86);
      B.plate.style.transform = 'translate3d(' + f(inOff) + '%,0,0)';
      var th = thresholds('plain', C.blade, dir);
      var outEnd = Math.max(0.05, th.touch - M.gap), inStart = Math.min(0.97, th.clear + M.gap);
      renderLines(A, Math.min(p, outEnd), 'out', dir, outEnd);
      renderLines(B, Math.max(0, p - inStart), 'in', dir, 1 - inStart);
      setChapter(Math.floor((p < 0.5 ? k : k + 1) / 2));
    }

    function render(progress) {
      hero.classList.toggle('is-released', progress >= 0.999);
      if (intro && progress > 0.004) { intro.progress(1); intro = null; }
      var sg = segAt(clamp(progress) * UNITS);
      if (!intro) textTargets(sg);
      if (sg.hold) {
        show(sg.k, -1);
        if (holdKey !== 'h' + sg.k) { reset(S[sg.k]); holdKey = 'h' + sg.k; }
        blade.style.clipPath = HIDE;
        setChapter(Math.floor(sg.k / 2));
        hero.setAttribute('data-scene', String(sg.k + 1));
        return;
      }
      holdKey = '';
      hero.setAttribute('data-scene', (sg.k + 1) + '>' + (sg.k + 2));
      if (S[sg.k].macro && S[sg.k + 1].whole) renderFlight(sg.k, sg.p); else renderPlain(sg.k, sg.p);
    }

    var st = ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
      onUpdate: function (self) { render(self.progress); },
      onRefresh: function (self) { measure(); shownKey = ''; holdKey = ''; render(self.progress); }
    });
    function refreshAll() { measure(); shownKey = ''; holdKey = ''; render(st.progress); S.forEach(function (sc) { if (!sc.tx.tw) drawText(sc); }); }
    refreshAll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshAll);
    Array.prototype.forEach.call(hero.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', refreshAll); });

    function yAt(units) { return st.start + (st.end - st.start) * (units / UNITS); }
    function yHold(k) { return yAt(STARTS[k] + M.hold / 2); }
    function yCut(k, p) { return yAt(STARTS[k] + M.hold + p * cutLen(k)); }
    idxBtns.forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        var y = yHold(+b.getAttribute('data-go') * 2);
        if (ctx.lenis) ctx.lenis.scrollTo(y, { duration: 1.8 }); else window.scrollTo(0, y);
      });
    });


    /* ---------------- intro: time-based, ≤1.6s, scroll and nav stay live ---------------- */
    (function () {
      var A = S[0]; if (!A || st.progress > 0.004) return;
      var q = { t: 0 }, span = 0.78, SL = M.slant;
      var apply = function () {
        var e = easeInOut(clamp(q.t / 0.55));
        /* the macro opens from the right, where the shield sits, behind the 16% house angle */
        A.media.style.clipPath = e >= 1 ? '' : visPct(SL, lerp(100 + SL, -SL - 1, e), 'R');
        A.plate.style.transform = e >= 1 ? '' : 'translate3d(' + f(4 * (1 - e)) + '%,0,0)';
        renderLines(A, clamp((q.t - 0.22) / span) * span, 'in', 1, span);
      };
      apply();
      intro = gsap.to(q, { t: 1, duration: 1.6, ease: 'none', onUpdate: apply, onComplete: function () { intro = null; A.media.style.clipPath = ''; } });
    })();

    window.__hero = { register: register, S: S, yHold: yHold, yCut: yCut, st: st, lenis: ctx.lenis, M: M, N: N, render: render, plan: plan,
      imgMap: function (i) { return imgMap(S[i]); }, slot: function () { return SLOT; }, units: function () { return { STARTS: STARTS, UNITS: UNITS }; },
      get chapter() { return activeChap; }, get intro() { return intro; } };
  });
})();
