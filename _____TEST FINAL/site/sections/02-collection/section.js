/* 02 THE COLLECTION - finder + one picture.
   Finder (every mode): Show me [make] [model] [keyword] -> N cars. Model narrows to the make, the button counts live,
   the form routes to inventory.html?make=&model=&q= (empty params dropped). Links resolve against the site root.
   Live (wide landscape + motion; layout reserved by CSS): pinned, scrubbed. Three cars in one frame, and the frame
   recomposes at every text beat on ONE ground plane (horizon under the text, graphite floor below; car width follows
   depth): wide (intro) -> the DBS comes forward into the lower left -> the camera moves to the 812 while the DBS runs
   out left and the 765LT nose enters -> the 765LT opens up and the 812 drives forward into the lower left. The cars move only between beats; the slot lines leave
   before a move and arrive after it, then everything holds (47vh = 508px at 1080). STATES = the four compositions.
   Static (tablets, reduced motion, no JS): beat 01 as one 16:9 picture, plates in a row. Phones: an authored list. */
(function () {
  'use strict';

  function siteRoot() {
    var l = document.querySelector('link[href$="assets/css/tokens.css"]');
    return l ? l.href.replace(/assets\/css\/tokens\.css$/, '') : '';
  }

  /* ---------------- finder ---------------- */
  function finder(el) {
    var root = siteRoot();
    var form = el.querySelector('[data-inv-form]');
    if (!form) return;
    form.setAttribute('action', root + 'inventory.html');
    el.querySelectorAll('[data-inv-link]').forEach(function (a) {
      a.setAttribute('href', root + a.getAttribute('href').replace(/^.*?inventory\.html/, 'inventory.html'));
    });
    var IDX = []; try { IDX = JSON.parse(el.querySelector('[data-finder-index]').textContent); } catch (e) { }
    var make = form.querySelector('[data-fd-make]'), model = form.querySelector('[data-fd-model]'),
        q = form.querySelector('[data-fd-q]'), label = form.querySelector('[data-fd-label]'), none = form.querySelector('[data-fd-none]');
    if (!make || !model || !q || !label || !none) return;
    var byMake = {};
    IDX.forEach(function (r) { (byMake[r[0]] = byMake[r[0]] || {})[r[1]] = 1; });
    var cmp = function (a, b) { return a.localeCompare(b, 'en', { numeric: true }); };
    var meter = document.createElement('span');
    meter.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
    form.appendChild(meter);
    function fit(sel) {
      var cs = getComputedStyle(sel);
      meter.style.font = cs.font; meter.style.letterSpacing = cs.letterSpacing;
      meter.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
      sel.style.width = Math.ceil(meter.offsetWidth + parseFloat(cs.paddingRight) + 2) + 'px';
    }
    function fillModels() {
      var keep = model.value, m = make.value;
      var makes = m ? [m] : Object.keys(byMake).sort(cmp);
      model.innerHTML = '<option value="">any model</option>';
      makes.forEach(function (mk) {
        var parent = model;
        if (!m) { parent = document.createElement('optgroup'); parent.label = mk; model.appendChild(parent); }
        Object.keys(byMake[mk]).sort(cmp).forEach(function (mo) { var o = document.createElement('option'); o.value = mo; o.textContent = mo; parent.appendChild(o); });
      });
      model.value = keep; if (model.value !== keep) model.value = '';
    }
    function count() {
      var m = make.value, mo = model.value, words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var n = IDX.filter(function (r) {
        if (m && r[0] !== m) return false;
        if (mo && r[1] !== mo) return false;
        var hay = (r[0] + ' ' + r[1] + ' ' + r[3]).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) !== -1; });
      }).length;
      var any = m || mo || words.length;
      label.textContent = n === 1 ? '1 car' : n ? n + ' cars' : 'Search';
      none.hidden = !(any && n === 0);
      fit(make); fit(model);
    }
    make.addEventListener('change', function () { fillModels(); count(); });
    model.addEventListener('change', function () {
      if (!make.value && model.value) {
        var hit = IDX.filter(function (r) { return r[1] === model.value; })[0];
        if (hit) { make.value = hit[0]; fillModels(); model.value = hit[1]; }
      }
      count();
    });
    q.addEventListener('input', count);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = new URLSearchParams();
      if (make.value) p.set('make', make.value);
      if (model.value) p.set('model', model.value);
      if (q.value.trim()) p.set('q', q.value.trim());
      var s = p.toString();
      window.location.href = root + 'inventory.html' + (s ? '?' + s : '');
    });
    fillModels(); count();
    if (document.fonts) document.fonts.ready.then(function () { fit(make); fit(model); });
  }

  /* ---------------- shared geometry ---------------- */
  var LEAN = 0.285, TRAVEL = 64;
  function clipFor(w, h, e, side) {
    var lean = LEAN * h, pad = 2, xt, xb;
    if (side === 'R') {
      xt = (w + lean + pad) * (1 - e) - pad; xb = xt - lean;
      return 'polygon(' + xt + 'px -2px,' + (w + 2) + 'px -2px,' + (w + 2) + 'px ' + (h + 2) + 'px,' + xb + 'px ' + (h + 2) + 'px)';
    }
    xt = -pad + (w + lean + 2 * pad) * e; xb = xt - lean;
    return 'polygon(-2px -2px,' + xt + 'px -2px,' + xb + 'px ' + (h + 2) + 'px,-2px ' + (h + 2) + 'px)';
  }
  function linesOf(sl) { return sl ? sl.querySelectorAll('.ln, .m--act > a') : []; }
  /* every ScrollTrigger / timeline callback goes through safe(): an exception inside one would stop the shared
     update loop for every section on the page (hero included), so it is caught and logged once, never thrown */
  var warned = false;
  function safe(fn) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (err) { if (!warned) { warned = true; console.warn('[02-collection] callback skipped:', err); } }
    };
  }

  /* ---------------- live: one picture, the camera moves at every beat ---------------- */
  /* positions per beat, as fractions of the stage: L = left edge (of W), w = width (of W), f = tyre line (of H),
     e = how much of the car is uncovered by the angled cut (assembly only) */
  /* ONE ground plane. The horizon sits under the text slot; every car stands on the floor below it and its width
     follows its depth: w = DEPTH * (f - horizon), so a car further back is smaller AND higher on the same plane.
     L = left edge (fraction of W), f = tyre line (fraction of H), e = share uncovered by the angled cut. */
  var DEPTH = 1.245;
  var STATES = {
    pre: { '812': { L: 0.72, f: 0.60, e: 0 }, dbs: { L: 0.14, f: 0.90, e: 0 }, '765lt': { L: 1.06, f: 1.12, e: 1 } },
    s0:  { '812': { L: 0.72, f: 0.60, e: 1 }, dbs: { L: 0.14, f: 0.90, e: 1 }, '765lt': { L: 1.06, f: 1.12, e: 1 } },
    s1:  { '812': { L: 0.76, f: 0.58, e: 1 }, dbs: { L: 0.04, f: 0.99, e: 1 }, '765lt': { L: 1.06, f: 1.12, e: 1 } },
    s2:  { '812': { L: 0.50, f: 0.72, e: 1 }, dbs: { L: -0.36, f: 1.02, e: 1 }, '765lt': { L: 0.88, f: 1.12, e: 1 } },
    s3:  { '812': { L: 0.08, f: 0.80, e: 1 }, dbs: { L: -0.80, f: 1.02, e: 1 }, '765lt': { L: 0.60, f: 1.12, e: 1 } }
  };
  function live(ctx) {
    var gsap = ctx.gsap, ST = ctx.ScrollTrigger, el = ctx.el;
    var stage = el.querySelector('.cl__stage');
    if (!stage || !el.querySelector('.sl') || !el.querySelector('.cl__tab .co')) return;
    var slots = Array.prototype.slice.call(el.querySelectorAll('.sl'));
    var cars = Array.prototype.slice.call(el.querySelectorAll('.cl__tab .co')).map(function (co) {
      var k = co.getAttribute('data-car'), cs = getComputedStyle(co);
      return { k: k, co: co, ar: parseFloat(cs.getPropertyValue('--co-ar')) || 2.8, cy: parseFloat(cs.getPropertyValue('--co-cy')) || 1,
               s: Object.assign({}, STATES.pre[k]) };
    }).filter(function (c) { return STATES.pre[c.k]; });
    // assemble 30 · beat 0 (intro) 52 · move 24 · beat 1 (DBS) 52 · move 24 · beat 2 (812) 52 · move 24 · beat 3 (765LT + browse) 58 = 316vh
    var SEG = [['a', 30], ['h', 52], ['c', 24], ['h', 52], ['c', 24], ['h', 52], ['c', 24], ['h', 58]];
    var TOTAL = SEG.reduce(function (a, s) { return a + s[1]; }, 0);

    var HZ = 0.46;
    function horizon() {
      var H = stage.clientHeight, intro = slots[0], bottom = intro.offsetTop + intro.offsetHeight;
      HZ = Math.max(0.46, (bottom + 28) / H);
      stage.style.setProperty('--hz', (HZ * 100).toFixed(3) + '%');
    }
    function apply(c) {
      var co = c.co; if (!co || !co.isConnected) return;
      var W = stage.clientWidth, H = stage.clientHeight, s = c.s;
      s.w = DEPTH * (s.f - HZ) * (0.46 / 0.46);
      var h = s.w * W / c.ar;
      co.style.transform = 'translate(' + (s.L * W).toFixed(2) + 'px,' + (s.f * H - h * c.cy).toFixed(2) + 'px) scale(' + s.w.toFixed(5) + ')';
      if (s.e <= 0.001) { co.style.visibility = 'hidden'; co.style.clipPath = 'none'; }
      else if (s.e >= 0.999) { co.style.visibility = 'visible'; co.style.clipPath = 'none'; }
      else { co.style.visibility = 'visible'; co.style.clipPath = clipFor(co.offsetWidth, co.offsetHeight, s.e, 'R'); }
    }
    function applyAll() { cars.forEach(apply); }

    // text windows: lines leave at 10% of a move and arrive at 90% (the cars move between)
    var TR = [], t0 = 0;
    SEG.forEach(function (s) { if (s[0] === 'c') TR.push([t0 + 0.1 * s[1], t0 + 0.9 * s[1]]); t0 += s[1]; });
    var textTl = {}, current = 0;
    function stepAt(pos) {
      var step = 0;
      for (var i = 0; i < TR.length; i++) { if (pos < TR[i][0]) return step; if (pos < TR[i][1]) return -1; step = i + 1; }
      return step;
    }
    function show(i) {
      var f = slots[i]; if (!f) return; var ls = linesOf(f);
      if (textTl[i]) textTl[i].kill();
      f.classList.add('is-on');
      textTl[i] = gsap.fromTo(ls, { x: -TRAVEL, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 });
    }
    function hide(i) {
      var f = slots[i]; if (!f) return; var ls = linesOf(f);
      if (textTl[i]) textTl[i].kill();
      textTl[i] = gsap.to(ls, { x: TRAVEL, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03, onComplete: function () { f.classList.remove('is-on'); } });
    }
    function text(pos) {
      var s = stepAt(pos); if (s === current) return;
      if (current >= 0) hide(current);
      if (s >= 0) show(s);
      current = s;
    }

    var trig, tl;
    var c = gsap.context(function () {
      slots.forEach(function (f) { gsap.set(linesOf(f), { autoAlpha: 0 }); });
      slots[0].classList.add('is-on');
      var introIn = gsap.timeline({ paused: true }).fromTo(linesOf(slots[0]), { x: -TRAVEL, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 });
      ST.create({ trigger: el, start: 'top 75%', onEnter: safe(function () { if (current === 0) introIn.timeScale(1).play(); }), onLeaveBack: safe(function () { if (current === 0) introIn.timeScale(1.6).reverse(); }) });

      tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false }, onUpdate: safe(applyAll) });
      var t = 0, beat = 0, order = ['s0', 's1', 's2', 's3'];
      SEG.forEach(function (sg) {
        var len = sg[1];
        if (sg[0] === 'a') {
          // the cars arrive one after another: 812 (far) first, the DBS, then the 765LT's nose
          var at = { '812': [0.04, 0.55], dbs: [0.28, 0.82], '765lt': [0.5, 1] };
          cars.forEach(function (car) {
            var w = at[car.k], d = (w[1] - w[0]) * len;
            tl.fromTo(car.s, Object.assign({}, STATES.pre[car.k]), Object.assign({}, STATES.s0[car.k], { duration: d, ease: 'power2.inOut' }), w[0] * len);
          });
        } else if (sg[0] === 'c') {
          var from = STATES[order[beat]], to = STATES[order[beat + 1]];
          cars.forEach(function (car) {
            tl.fromTo(car.s, Object.assign({}, from[car.k]), Object.assign({}, to[car.k], { duration: 0.7 * len, ease: 'power2.inOut' }), t + 0.15 * len);
          });
          beat++;
        }
        t += len;
      });
      tl.set({}, {}, TOTAL);
      trig = ST.create({
        trigger: stage, pin: true, pinType: 'transform', start: 'top top',
        end: function () { return '+=' + (TOTAL / 100) * stage.clientHeight; },
        scrub: true, animation: tl, invalidateOnRefresh: true,
        onRefresh: safe(function () { horizon(); applyAll(); }),
        onUpdate: safe(function (self) { text(self.progress * TOTAL); })
      });
      horizon(); tl.progress(0); applyAll();
    }, el);
    window.__collection = {
      seg: SEG, total: TOTAL, trig: function () { return trig; },
      yAt: function (vh) { if (!trig) return 0; return trig.start + vh / TOTAL * (trig.end - trig.start); }
    };
    return function () { c.revert(); };
  }

  /* ---------------- phones (motion allowed): plates step in, each car uncovered by the angled cut ---------------- */
  function stacked(ctx) {
    var gsap = ctx.gsap, ST = ctx.ScrollTrigger, el = ctx.el;
    var c = gsap.context(function () {
      el.querySelectorAll('.sl').forEach(function (f) {
        var ls = linesOf(f);
        gsap.set(ls, { x: -TRAVEL, autoAlpha: 0 });
        var tl = gsap.timeline({ paused: true }).to(ls, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 });
        ST.create({ trigger: f, start: 'top 85%', onEnter: safe(function () { tl.timeScale(1).play(); }), onLeaveBack: safe(function () { tl.timeScale(1.6).reverse(); }) });
        var car = f.querySelector('.pl__car');
        if (!car || getComputedStyle(car).display === 'none') return;
        var s = { e: 0 };
        var paint = function () { if (!car.isConnected) return; car.style.clipPath = s.e >= 0.999 ? 'none' : clipFor(car.offsetWidth, car.offsetHeight, s.e, 'R'); };
        paint();
        gsap.timeline({ scrollTrigger: { trigger: car, start: 'top 95%', end: 'top 60%', scrub: true, invalidateOnRefresh: true, onRefresh: safe(paint) } })
          .fromTo(s, { e: 0 }, { e: 1, ease: 'power2.inOut', duration: 1, onUpdate: safe(paint) }, 0);
      });
    }, el);
    return function () { c.revert(); };
  }

  window.Select.register('02-collection', function (ctx) {
    if (!ctx || !ctx.el) return;
    try { finder(ctx.el); } catch (err) { console.warn('[02-collection] finder skipped:', err); }
    if (ctx.reduced || !ctx.gsap) return;
    if (window.matchMedia('(min-width: 1024px) and (orientation: landscape) and (min-height: 600px)').matches) return live(ctx);
    if (window.matchMedia('(max-width: 767px)').matches) return stacked(ctx);
  });
})();
