/* duPont REGISTRY Select — scroll core. The ONLY place Lenis, ScrollTrigger and the RAF loop are set up.
   Sections never create their own Lenis, ticker or requestAnimationFrame loop. They register:

     Select.register('05-services', function (ctx) {
       // ctx = { gsap, ScrollTrigger, lenis, reduced, el }   el = the section's root element
       // build timelines with gsap.context(fn, ctx.el) and return a cleanup function (optional)
     });

   Order: sections initialise in DOM order after fonts + images of the first viewport are ready, then one
   ScrollTrigger.refresh(). Reduced motion: lenis is null, ctx.reduced is true — build the static state. */
(function () {
  'use strict';
  var reg = {};
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.toggle('js-motion', !reduced);
  root.classList.add('js');

  var Select = window.Select = {
    gsap: null, ScrollTrigger: null, lenis: null, reduced: reduced,
    register: function (name, fn) { reg[name] = fn; },
    scrollTo: function (target, opts) {
      if (Select.lenis) Select.lenis.scrollTo(target, Object.assign({ duration: 1.6 }, opts || {}));
      else {
        var el = typeof target === 'string' ? document.querySelector(target) : target;
        if (typeof target === 'number') window.scrollTo(0, target);
        else if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  };

  function boot() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (gsap && ST) {
      gsap.registerPlugin(ST);
      Select.gsap = gsap; Select.ScrollTrigger = ST;
      if (!reduced && window.Lenis) {
        var lenis = new window.Lenis({ autoRaf: false, lerp: 0.1 });
        lenis.on('scroll', ST.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
        Select.lenis = lenis;
      }
    }
    /* in-page anchors go through Lenis so pins and smooth scroll stay in sync */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2 || !document.querySelector(id)) return;
      e.preventDefault();
      Select.scrollTo(id);
      history.replaceState(null, '', id);
    });

    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
    sections.forEach(function (el) {
      var fn = reg[el.getAttribute('data-section')];
      if (!fn) return;
      try { fn({ gsap: Select.gsap, ScrollTrigger: Select.ScrollTrigger, lenis: Select.lenis, reduced: reduced || !Select.gsap, el: el }); }
      catch (err) { console.error('[Select] section init failed:', el.getAttribute('data-section'), err); }
    });
    var ST = Select.ScrollTrigger;
    if (ST) {
      ST.refresh();
      if (Select.lenis) Select.lenis.resize();
      ST.addEventListener('refresh', function () { if (Select.lenis) Select.lenis.resize(); });
      keepPlaceOnResize(ST);
    }
    /* Hash on load: pins add spacer height, so land only after every pin is measured (after load + refresh). */
    var landHash = function () {
      if (!location.hash || !document.querySelector(location.hash)) return;
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      if (Select.lenis) Select.lenis.resize();   /* sections grow at init; Lenis must know the final height */
      Select.scrollTo(location.hash, { immediate: true, force: true });
    };
    if (document.readyState === 'complete') { if (ST) ST.refresh(); landHash(); }
    else window.addEventListener('load', function () {
      if (ST) ST.refresh();
      requestAnimationFrame(function () { landHash(); if (ST) ST.update(); });
    });
    root.dataset.ready = '1';
  }

  /* Resize: the reader's place (section + progress through it, pin spacer included) is recorded continuously
     while scrolling, frozen the moment a resize starts (the old layout is gone by the time any resize event
     fires), and restored once ScrollTrigger has re-measured and layout has settled — never a stale pixel. */
  function keepPlaceOnResize(ST) {
    var place = null, frozen = false, t, vw = window.innerWidth, vh = window.innerHeight;
    var box = function (el) { return el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el; };
    var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };
    var record = function () {
      /* a viewport change can emit scroll events before 'resize' fires: never record across a size change */
      if (window.innerWidth !== vw || window.innerHeight !== vh) frozen = true;
      if (frozen) return;
      var secs = document.querySelectorAll('[data-section]'), y = window.scrollY;
      for (var i = secs.length - 1; i >= 0; i--) {
        var b = box(secs[i]), top = docTop(b);
        if (y >= top - 1) { place = { el: secs[i], p: Math.min(1, (y - top) / Math.max(b.offsetHeight, 1)) }; return; }
      }
      place = null;
    };
    var restore = function () {
      if (!place) { vw = window.innerWidth; vh = window.innerHeight; frozen = false; return; }
      var b = box(place.el), target = Math.round(docTop(b) + place.p * b.offsetHeight);
      if (Select.lenis) { Select.lenis.resize(); Select.lenis.scrollTo(target, { immediate: true, force: true }); }
      else window.scrollTo(0, target);
      ST.update();
      requestAnimationFrame(function () { vw = window.innerWidth; vh = window.innerHeight; frozen = false; record(); });
    };
    if (Select.lenis) Select.lenis.on('scroll', record); else window.addEventListener('scroll', record, { passive: true });
    record();
    window.addEventListener('resize', function () { frozen = true; clearTimeout(t); });
    /* ScrollTrigger refreshes ~200ms after the last resize; restore after its refresh, two frames later */
    ST.addEventListener('refresh', function () {
      if (!frozen) return;
      clearTimeout(t);
      t = setTimeout(function () { requestAnimationFrame(function () { requestAnimationFrame(restore); }); }, 60);
    });
  }

  var go = function () { (document.fonts ? document.fonts.ready : Promise.resolve()).then(boot); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
