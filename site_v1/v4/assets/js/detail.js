/* =============================================================================
   V4 copy of V1 detail.js (Lenis pause added). Vehicle detail — a <dialog> opened from any [data-car] link (homepage plates,
   map strips, Instagram samples, SRP plates and records). Without JS the same
   link opens the real duPont REGISTRY listing. Every fact comes from window.DRS
   (generated from data/inventory.json) and is dated.
   ============================================================================= */
(function () {
  'use strict';
  if (!window.DRS) return;
  var CARS = {};
  window.DRS.listings.forEach(function (c) { CARS[c.id] = c; });
  var ASOF = window.DRS.meta.asOf;
  var SHOW = { socal: 'Southern California', naples: 'Naples', miami: 'Miami' };
  var TEL = { socal: '+19512926100', naples: '+12394499191', miami: '+16154710221' };
  var root = document.documentElement;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(p) { return p ? '$' + p.toLocaleString('en-US') : 'Price not listed'; }
  function miles(m) { return m == null ? 'Miles not listed' : m.toLocaleString('en-US') + ' miles'; }
  function srcset(img, ext) { return img.w.map(function (w) { return img.base + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', '); }
  function pic(img, sizes, alt, cls) {
    var mid = img.w[Math.min(1, img.w.length - 1)];
    return '<picture class="' + (cls || '') + '"><source type="image/avif" srcset="' + srcset(img, 'avif') + '" sizes="' + sizes + '">' +
      '<source type="image/webp" srcset="' + srcset(img, 'webp') + '" sizes="' + sizes + '">' +
      '<img src="' + img.base + '-' + mid + '.jpg" srcset="' + srcset(img, 'jpg') + '" sizes="' + sizes + '" width="1200" height="800" alt="' + esc(alt) + '"></picture>';
  }
  window.DRSUtil = { esc: esc, money: money, miles: miles, pic: pic, SHOW: SHOW };

  var dlg = document.createElement('dialog');
  dlg.className = 'car-dialog';
  dlg.setAttribute('aria-labelledby', 'car-dialog-title');
  dlg.setAttribute('data-lenis-prevent', '');
  document.body.appendChild(dlg);
  var opener = null;

  function open(id, from) {
    var c = CARS[id]; if (!c) return false;
    opener = from || document.activeElement;
    var frames = c.img ? [c.img].concat(c.gallery) : [];
    var media = frames.length
      ? '<div class="car-dialog__main" data-main>' + pic(frames[0], '(min-width: 1024px) 56vw, 100vw', c.title + ', as photographed for its listing') + '</div>' +
        (frames.length > 1 ? '<div class="car-dialog__thumbs" role="group" aria-label="Photographs">' + frames.map(function (f, i) {
          return '<button type="button" aria-pressed="' + (i === 0) + '" data-frame="' + i + '" aria-label="Photograph ' + (i + 1) + ' of ' + frames.length + '">' + pic(f, '10vw', '') + '</button>';
        }).join('') + '</div>' : '')
      : '<div class="car-dialog__noimg"><p class="t-label">Photography in preparation</p><p>This car is listed on duPont REGISTRY; photographs are not yet available here.</p></div>';
    var d = c.dealer;
    var maps = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(d.address + ', ' + d.city + ', ' + d.state + ' ' + d.zip);
    var drive = (c.drive || '').replace(/^\w+\s*\((.*)\)$/, '$1'); drive = drive.charAt(0).toUpperCase() + drive.slice(1);
    dlg.innerHTML =
      '<button type="button" class="car-dialog__close" data-close aria-label="Close details">&times;</button>' +
      '<div class="car-dialog__inner">' +
        '<div class="car-dialog__media">' + media + '</div>' +
        '<div class="car-dialog__body">' +
          '<div><p class="t-label t-2">' + esc(SHOW[c.loc]) + ' · ' + esc(d.city) + ', ' + esc(d.state) + '</p>' +
          '<h2 class="car-dialog__title" id="car-dialog-title">' + esc(c.title) + '</h2></div>' +
          '<div><p class="car-dialog__price">' + money(c.price) + '</p><p class="t-2">as of ' + esc(ASOF) + '</p></div>' +
          '<dl class="specs">' +
            '<dt>Mileage</dt><dd>' + miles(c.miles) + '</dd>' +
            (c.ext ? '<dt>Exterior</dt><dd>' + esc(c.ext) + '</dd>' : '') +
            (c.int ? '<dt>Interior</dt><dd>' + esc(c.int) + '</dd>' : '') +
            (c.trans ? '<dt>Transmission</dt><dd>' + esc(c.trans) + '</dd>' : '') +
            (drive ? '<dt>Drivetrain</dt><dd>' + esc(drive) + '</dd>' : '') +
            (c.vin ? '<dt>VIN</dt><dd>' + esc(c.vin) + '</dd>' : '') +
            '<dt>Showroom</dt><dd>' + esc(d.name) + '<br>' + esc(d.address) + ', ' + esc(d.city) + ', ' + esc(d.state) + ' ' + esc(d.zip) + '</dd>' +
          '</dl>' +
          '<div class="car-dialog__actions">' +
            '<a class="btn btn--primary" href="tel:' + TEL[c.loc] + '">Call ' + esc(SHOW[c.loc]) + '</a>' +
            '<a class="link" href="' + esc(c.url) + '" target="_blank" rel="noopener">View the full listing <span class="link__arrow" aria-hidden="true">&nearr;</span><span class="vh"> (opens duPont REGISTRY in a new tab)</span></a>' +
            '<a class="link" href="' + maps + '" target="_blank" rel="noopener">Directions <span class="link__arrow" aria-hidden="true">&nearr;</span><span class="vh"> (opens Google Maps)</span></a>' +
          '</div>' +
          (c.loc === 'miami' ? '<p><span class="tbc">615 number as published — to confirm</span></p>' : '') +
        '</div>' +
      '</div>';
    dlg.querySelectorAll('[data-frame]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-frame');
        dlg.querySelector('[data-main]').innerHTML = pic(frames[i], '(min-width: 1024px) 56vw, 100vw', c.title + ', photograph ' + (i + 1));
        dlg.querySelectorAll('[data-frame]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
    dlg.showModal();
    root.classList.add('dialog-open');
    if (window.V4 && V4.lenis) V4.lenis.stop();
    dlg.querySelector('[data-close]').focus();
    return true;
  }
  // leaves one step faster than it arrived (v4.css .is-closing); instant under reduced motion
  var reduceQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  function close() {
    if (!dlg.open || dlg.classList.contains('is-closing')) return;
    if (reduceQ.matches) { dlg.close(); return; }
    dlg.classList.add('is-closing');
    var done = function () { dlg.removeEventListener('animationend', done); clearTimeout(t); dlg.classList.remove('is-closing'); dlg.close(); };
    var t = setTimeout(done, 400);
    dlg.addEventListener('animationend', done);
  }
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('close', function () {
    root.classList.remove('dialog-open');
    if (window.V4 && V4.lenis) V4.lenis.start();
    if (opener && opener.focus) opener.focus();
  });
  dlg.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) close();
    else if (e.target === dlg) close();   // click on the backdrop
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-car]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    if (open(a.getAttribute('data-car'), a)) e.preventDefault();
  });
  window.DRSDetail = { open: open };
})();
