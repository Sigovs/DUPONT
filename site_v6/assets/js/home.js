(function () {
  'use strict';
  var root = document.documentElement, V6 = window.V6, CARS = (window.SEL && SEL.cars) || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var rm = matchMedia('(prefers-reduced-motion: reduce)');
  function setRm() { root.classList.toggle('rm', rm.matches); } setRm(); rm.addEventListener('change', setRm);
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var by = {}; CARS.forEach(function (c) { by[c.id] = c; });
  var SIZES = '(min-width: 1280px) 20vw, (min-width: 760px) 32vw, 76vw';
  function rail(box) {
    var ul = $('.r6', box), prev = $('[data-prev]', box), next = $('[data-next]', box), n = $('[data-n]', box);
    function items() { return $$(':scope > li', ul); }
    function step() { var l = items(); return l.length > 1 ? l[1].offsetLeft - l[0].offsetLeft : ul.clientWidth; }
    function at() { return Math.min(items().length - 1, Math.round(ul.scrollLeft / step())); }
    function paint() {
      var l = items().length, k = at(), end = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2;
      n.textContent = pad(end ? l : k + 1) + ' / ' + pad(l);
      prev.disabled = ul.scrollLeft < 4; next.disabled = end;
    }
    function go(d) { ul.scrollTo({ left: (at() + d) * step(), behavior: rm.matches ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); }); next.addEventListener('click', function () { go(1); });
    var t; ul.addEventListener('scroll', function () { cancelAnimationFrame(t); t = requestAnimationFrame(paint); }, { passive: true });
    addEventListener('resize', paint); paint(); return paint;
  }
  var an = $('[data-available]');
  if (an) {
    $('.r6', an).innerHTML = ['602202', '626613', '635078', '636828', '642093', '635108'].map(function (id, i) { return by[id] ? V6.card(by[id], i, SIZES) : ''; }).join('');
    rail(an);
  }
  $$('[data-loc]').forEach(function (row) {
    var k = row.dataset.loc, list = CARS.filter(function (c) { return c.loc === k; }), box = $('[data-loc-body]', row);
    if (!list.length) { box.innerHTML = '<p class="lo__e">No cars in this selection are at the ' + V6.rooms[k] + ' showroom right now. <a class="lo__all" href="inventory.html" style="color:var(--on-strong)">See all cars</a></p>'; }
    else $('.r6', box).innerHTML = list.map(function (c, i) { return V6.card(c, i, SIZES); }).join('');
    var b = $('.lo__b', row), p = $('.lo__p', row), paint = list.length ? rail(box) : function () {};
    b.addEventListener('click', function () {
      var o = b.getAttribute('aria-expanded') !== 'true';
      $$('[data-loc]').forEach(function (r) { var on = r === row && o; $('.lo__b', r).setAttribute('aria-expanded', on ? 'true' : 'false'); $('.lo__p', r).classList.toggle('is-open', on); });
      var y0 = b.getBoundingClientRect().top, t0 = performance.now();
      (function keep() {
        var d = b.getBoundingClientRect().top - y0;
        if (Math.abs(d) > .5) { if (window.V4 && V4.lenis) V4.lenis.scrollTo(Math.max(0, scrollY + d), { immediate: true, force: true }); else scrollTo(0, scrollY + d); }
        if (performance.now() - t0 < 600) requestAnimationFrame(keep);
      })();
      setTimeout(function () { paint(); measure(); }, 620);
    });
  });
  var hr = $('[data-hero]');
  if (hr) (function () {
    var S = $$('.hr__s', hr), D = $$('.hr__d', hr), k = 0, busy = false, live = !rm.matches, timer, hold = false;
    function dots() { D.forEach(function (d, i) { d.setAttribute('aria-current', i === k ? 'true' : 'false'); }); }
    function load(s) { var im = $('img', s), so = $('source[data-srcset]', s); if (so) { so.srcset = so.dataset.srcset; so.removeAttribute('data-srcset'); } if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; delete im.dataset.srcset; } return im; }
    function go(i, dir) {
      i = (i + S.length) % S.length; if (i === k || busy) return; busy = true;
      var a = S[k], b = S[i], im = load(b); k = i; dots();
      var run = function () {
        a.classList.add('is-under'); a.classList.remove('is-on');
        b.classList.toggle('from-l', dir < 0); b.classList.add('is-go'); b.offsetWidth; b.classList.add('is-open');
        setTimeout(function () { b.classList.add('is-on'); b.classList.remove('is-go', 'is-open', 'from-l'); a.classList.remove('is-under'); busy = false; }, rm.matches ? 0 : 920);
      };
      (im.decode ? im.decode().catch(function () {}) : Promise.resolve()).then(run);
    }
    function stop() { live = false; clearTimeout(timer); }
    function tick() { clearTimeout(timer); if (!live) return; timer = setTimeout(function () { if (!hold && !document.hidden) go(k + 1, 1); tick(); }, 7000); }
    D.forEach(function (d, i) { d.addEventListener('click', function () { stop(); go(i, i < k ? -1 : 1); }); });
    $('.hr__nx', hr).addEventListener('click', function () { stop(); go(k + 1, 1); });
    hr.addEventListener('mouseenter', function () { hold = true; }); hr.addEventListener('mouseleave', function () { hold = false; });
    hr.addEventListener('focusin', function () { hold = true; }); hr.addEventListener('focusout', function () { hold = false; });
    var x0 = null;
    hr.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    hr.addEventListener('pointerup', function (e) { if (x0 == null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 48) { stop(); go(k + (d < 0 ? 1 : -1), d < 0 ? 1 : -1); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { hold = !e[0].isIntersecting; }).observe(hr);
    addEventListener('load', function () { setTimeout(function () { S.slice(1).forEach(load); }, 1200); });
    tick();
  })();
  var mq = $('[data-marque]');
  if (mq) (function () {
    var B = $$('.mq__b', mq), I = $$('.mq__ph img', mq), all = $('.mq__cta', mq);
    function pick(b) {
      var m = b.dataset.make, im = I.filter(function (x) { return x.dataset.make === m; })[0], cur = I.filter(function (x) { return x.classList.contains('is-on'); })[0];
      B.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var has = CARS.some(function (c) { return c.make === m; });
      all.href = 'inventory.html' + (has ? '?make=' + encodeURIComponent(m) : '');
      if (!im || im === cur) return;
      I.forEach(function (x) { x.classList.remove('is-under', 'is-go'); });
      cur.classList.remove('is-on'); cur.classList.add('is-under');
      im.classList.add('is-on', 'is-go');
    }
    B.forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
    pick(B[0]);
  })();
  var rw = $('[data-reviews]');
  if (rw) (function () {
    var S = $$('.rw__s', rw), N = S.length, k = 0, prev = $('[data-prev]', rw), next = $('[data-next]', rw), n = $('[data-n]', rw);
    function paint() {
      S.forEach(function (s, i) {
        var o = ((i - k) % N + N) % N; if (o > N / 2) o -= N;
        s.style.setProperty('--o', o); s.dataset.o = o;
        if (Math.abs(o) > 1) s.dataset.far = ''; else delete s.dataset.far;
        s.setAttribute('aria-hidden', o ? 'true' : 'false');
      });
      n.textContent = pad(k + 1) + ' / ' + pad(N);
    }
    function go(i) { k = (i + N) % N; paint(); }
    prev.addEventListener('click', function () { go(k - 1); }); next.addEventListener('click', function () { go(k + 1); });
    var v = $('.rw__v', rw), x0 = null;
    v.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(k + 1); if (e.key === 'ArrowLeft') go(k - 1); });
    v.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    addEventListener('pointerup', function (e) { if (x0 == null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 48) go(k + (d < 0 ? 1 : -1)); });
    paint();
  })();
  var ig = $('[data-ig]'), wall = ig && $('.ig6__w', ig), wide = matchMedia('(min-width: 1024px)'), travel = 0, lead = 0, top0 = 0;
  function measure() {
    if (!ig) return;
    if (!wide.matches || rm.matches) { ig.style.removeProperty('--travel'); wall.style.removeProperty('--y'); travel = 0; return; }
    var view = $('.ig6__v', ig).clientHeight;
    travel = Math.max(0, wall.scrollHeight - view * .8);
    lead = Math.min(travel * .6, view * .6);
    ig.style.setProperty('--travel', (travel - lead) + 'px');
    top0 = ig.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(root).getPropertyValue('--hd-h'));
    move();
  }
  function move() { if (travel) wall.style.setProperty('--y', -Math.max(0, Math.min(travel, scrollY - top0 + lead)) + 'px'); }
  if (ig) {
    addEventListener('scroll', move, { passive: true }); addEventListener('resize', measure); addEventListener('load', measure); measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if ('ResizeObserver' in window) new ResizeObserver(function () { var t = ig.getBoundingClientRect().top + scrollY - 80; if (Math.abs(t - top0) > 2) measure(); }).observe(document.body);
  }
  var vid = $('.se video');
  if (vid) {
    if (rm.matches) { vid.removeAttribute('autoplay'); vid.pause(); }
    else if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) { var p = vid.play(); if (p) p.catch(function () {}); } else vid.pause(); }).observe(vid);
  }
})();
