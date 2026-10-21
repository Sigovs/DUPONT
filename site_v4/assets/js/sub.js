/* =============================================================================
   V4 sub pages (2026-10-21) — inventory.html (SRP) and car.html (VDP), both rendered from window.SEL
   (assets/data/sel13.js, generated from data/srp13.json + data/vdp/*.json: 13 cars read off duPont REGISTRY).
   SRP: showroom chips, make → model, sort, keyword; the state lives in the URL (?showroom=&make=&q=&sort=) so
        links from the home page and the footer land filtered. Empty state included.
   VDP: car.html?id=…  — gallery (arrows, thumbs, keys, swipe, full-screen view), the price panel, overview, options,
        specifications, the showroom it stands in, more cars. Every fact is the listing's own; nothing is invented.
   ============================================================================= */
(function () {
  'use strict';
  var SEL = window.SEL; if (!SEL) return;
  var CARS = SEL.cars, BY = {};
  CARS.forEach(function (c) { BY[c.id] = c; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ARR = '<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  var ROOMS = {
    socal: { name: 'Southern California', dealer: 'duPont REGISTRY Select SoCal', addr: ['26900 Jefferson Ave', 'Murrieta, CA 92562'],
             phone: '(951) 292-6100', hours: 'Mon–Fri 9–6 · Sat 10–5 · Sun closed', img: 'assets/img/locations/socal-showroom.webp' },
    naples: { name: 'Naples', dealer: 'duPont REGISTRY Select Naples', addr: ['2365 Linwood Ave.', 'Naples, FL 34112'],
              phone: '(239) 449-9191', hours: 'Hours not published — call ahead', img: 'assets/img/locations/naples-showroom.webp?v=3' },
    miami: { name: 'Miami', dealer: 'duPont REGISTRY Miami', addr: ['5972 NE 4th Ave', 'Miami, FL 33137'],
             phone: '(615) 471-0221', hours: 'Hours not published — call ahead', img: 'assets/img/locations/miami-showroom.webp?v=2' }
  };
  var ORDER = ['socal', 'naples', 'miami'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(p) { return p ? '$' + p.toLocaleString('en-US') : 'Price on request'; }
  function miles(m) { return m == null ? '' : m.toLocaleString('en-US') + ' miles'; }
  function spec(c) { return [miles(c.miles), c.trans, c.drive].filter(Boolean).join(' · '); }
  function href(c) { return 'car.html?id=' + c.id; }

  /* one tile = the home page's inventory tile (graphite card, photo, showroom, model, price, spec, pill).
     Cover = the listing's clean side shot (photo 1 — photo 0 carries the dealer's backdrop plate); hover opens photo 2. */
  function tile(c, i) {
    var a = c.img[1], b = c.img[2];
    return '<li class="tile" style="--i:' + (i || 0) + '"><a class="tile__a" href="' + href(c) + '">' +
      '<span class="tile__ph"><img src="' + a + '-640.webp" srcset="' + a + '-640.webp 640w, ' + a + '-1200.webp 1200w" sizes="(min-width: 1280px) 30vw, (min-width: 760px) 46vw, 92vw" alt="' + esc(c.title) + '" loading="lazy" decoding="async">' +
      '<img class="tile__alt" src="' + b + '-640.webp" srcset="' + b + '-640.webp 640w, ' + b + '-1200.webp 1200w" sizes="(min-width: 1280px) 30vw, 46vw" alt="" loading="lazy" decoding="async"></span>' +
      '<span class="tile__body"><span class="tile__room">' + esc(ROOMS[c.loc].name) + '</span>' +
      '<span class="tile__title disp">' + esc(c.title) + '</span>' +
      '<span class="tile__price">' + money(c.price) + '</span>' +
      '<span class="tile__spec">' + esc(spec(c)) + '</span>' +
      '<span class="tile__go">View this car ' + ARR + '</span></span></a></li>';
  }

  /* ============================================================ SRP */
  var srp = $('[data-srp]');
  if (srp) (function () {
    var grid = $('[data-inv-grid]'), rooms = $('[data-inv-rooms]'), mk = $('[data-inv-make]'), md = $('[data-inv-model]');
    var so = $('[data-inv-sort]'), q = $('[data-inv-q]'), count = $('[data-inv-count]'), empty = $('[data-inv-empty]');
    var P = new URLSearchParams(location.search);
    var st = { room: P.get('showroom') || '', make: P.get('make') || '', model: P.get('model') || '', sort: P.get('sort') || 'featured', q: P.get('q') || '' };
    $('[data-inv-asof]').textContent = CARS.length + ' cars · prices and miles as listed on duPont REGISTRY, ' + SEL.meta.asOf;

    rooms.innerHTML = '<button type="button" class="chip" data-room="">All <span>' + CARS.length + '</span></button>' + ORDER.map(function (k) {
      var n = CARS.filter(function (c) { return c.loc === k; }).length;
      return '<button type="button" class="chip" data-room="' + k + '"' + (n ? '' : ' disabled') + '>' + ROOMS[k].name + ' <span>' + n + '</span></button>';
    }).join('');
    var makes = CARS.map(function (c) { return c.make; }).filter(function (m, i, a) { return a.indexOf(m) === i; }).sort();
    mk.insertAdjacentHTML('beforeend', makes.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join(''));

    function models() {
      var list = CARS.filter(function (c) { return c.make === st.make; }).map(function (c) { return c.model; })
        .filter(function (m, i, a) { return a.indexOf(m) === i; }).sort();
      md.innerHTML = '<option value="">' + (st.make ? 'All models' : 'Choose a make first') + '</option>' + list.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      md.disabled = !st.make; md.value = st.model;
    }
    function results() {
      var s = st.q.trim().toLowerCase();
      var list = CARS.filter(function (c) {
        if (st.room && c.loc !== st.room) return false;
        if (st.make && c.make !== st.make) return false;
        if (st.model && c.model !== st.model) return false;
        if (s && (c.title + ' ' + (c.ext || '') + ' ' + (c.body || '') + ' ' + ROOMS[c.loc].name).toLowerCase().indexOf(s) < 0) return false;
        return true;
      });
      var by = {
        'price-desc': function (a, b) { return (b.price || 0) - (a.price || 0); },
        'price-asc': function (a, b) { return (a.price || Infinity) - (b.price || Infinity); },
        'miles-asc': function (a, b) { return a.miles - b.miles; },
        'year-desc': function (a, b) { return b.year - a.year; }
      }[st.sort];
      return by ? list.slice().sort(by) : list;
    }
    function render(push) {
      var list = results();
      // the last row closes on a showroom tile that fills it (never a lone car with empty air beside it)
      var r3 = 3 - list.length % 3, r2 = 2 - list.length % 2;
      grid.innerHTML = list.map(tile).join('') + (list.length ? '<li class="tile tile--end" style="--i:' + list.length + ';--s3:' + r3 + ';--s2:' + r2 + '">' +
        '<a class="tile__a" href="index.html#showrooms"><span class="tile__body"><span class="tile__room">Not seeing it?</span>' +
        '<span class="tile__title disp">Ask a showroom</span><span class="tile__spec">Three showrooms — Southern California, Naples and Miami.</span>' +
        '<span class="tile__go">Contact a showroom ' + ARR + '</span></span></a></li>' : '');
      var dirty = !!(st.room || st.make || st.model || st.q || st.sort !== 'featured');
      count.textContent = list.length + (list.length === 1 ? ' car' : ' cars') + (st.room ? ' in ' + ROOMS[st.room].name : '');
      $$('[data-inv-clear]').forEach(function (b) { b.hidden = !dirty && b.closest('.inv__meta') !== null; });
      $('.inv__meta [data-inv-clear]').hidden = !dirty;
      empty.hidden = list.length > 0; grid.hidden = !list.length;
      $$('.chip', rooms).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.room === st.room ? 'true' : 'false'); });
      if (push) {
        var u = new URLSearchParams();
        ['room', 'make', 'model', 'q'].forEach(function (k) { if (st[k]) u.set(k === 'room' ? 'showroom' : k, st[k]); });
        if (st.sort !== 'featured') u.set('sort', st.sort);
        history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      }
      requestAnimationFrame(function () { $$('.tile', grid).forEach(function (t) { t.classList.add('is-in'); }); });
    }
    rooms.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b || b.disabled) return; st.room = b.dataset.room; render(true); });
    mk.addEventListener('change', function () { st.make = mk.value; st.model = ''; models(); render(true); });
    md.addEventListener('change', function () { st.model = md.value; render(true); });
    so.addEventListener('change', function () { st.sort = so.value; render(true); });
    var qt; q.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { st.q = q.value; render(true); }, 160); });
    $$('[data-inv-clear]').forEach(function (b) { b.addEventListener('click', function () {
      st = { room: '', make: '', model: '', sort: 'featured', q: '' }; mk.value = ''; so.value = 'featured'; q.value = ''; models(); render(true);
    }); });
    if (makes.indexOf(st.make) < 0) st.make = '';
    mk.value = st.make; so.value = st.sort; q.value = st.q; models(); render(false);
    // the filter bar stands still under the header once it reaches it (a hairline marks it)
    var bar = $('[data-inv-bar]');
    if ('IntersectionObserver' in window) {
      var s = document.createElement('div'); s.className = 'inv__sentinel'; bar.parentNode.insertBefore(s, bar);
      new IntersectionObserver(function (es) { bar.classList.toggle('is-stuck', !es[0].isIntersecting); }, { rootMargin: '-117px 0px 0px 0px' }).observe(s);
    }
  })();

  /* ============================================================ VDP */
  var vdp = $('[data-vdp]');
  if (vdp) (function () {
    var id = new URLSearchParams(location.search).get('id');
    var c = BY[id] || BY['635078'];
    var R = ROOMS[c.loc];
    document.title = c.title + ' — duPont REGISTRY Select';
    var gal = c.gallery ? c.gallery.map(function (g) { return { big: g + '-1920.webp', small: g + '-480.webp' }; })
                        : c.img.map(function (g) { return { big: g + '-1200.webp', small: g + '-640.webp' }; });

    $('[data-vdp-crumb]').textContent = c.title;
    var rl = $('[data-vdp-room-link]'); rl.textContent = R.name; rl.href = 'inventory.html?showroom=' + c.loc;
    $('[data-vdp-room]').textContent = R.name;
    $('[data-vdp-title]').textContent = c.title;
    $('[data-vdp-price]').innerHTML = money(c.price) + (c.miles != null ? '<span>' + miles(c.miles) + '</span>' : '');
    var quick = [['Exterior', c.ext], ['Interior', c.int], ['Transmission', c.trans], ['Drivetrain', c.drive], ['Engine', c.engine], ['Body', c.body]]
      .filter(function (r) { return r[1]; }).slice(0, 4);
    $('[data-vdp-quick]').innerHTML = quick.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    $('[data-vdp-call]').textContent = 'Call ' + R.phone;
    $('[data-vdp-asof]').textContent = 'Price and miles as listed on duPont REGISTRY, ' + SEL.meta.asOf + '.';

    /* story — only what the listing says */
    if (c.overview) {
      $('[data-vdp-lead]').textContent = (c.headline || '').replace(/ is Now Available at duPont REGISTRY Select!$/i, '.').replace(/^This /, '');
      $('[data-vdp-ov]').innerHTML = '<p>' + esc(c.overview) + '</p>';
      $('[data-vdp-opts]').innerHTML = (c.options || []).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('');
      $('[data-vdp-close]').textContent = c.closing || '';
    } else {
      $('[data-vdp-lead]').textContent = c.title + ', at ' + R.dealer + '.';
      $('[data-vdp-ov]').innerHTML = '<p>The full description of this car is with the showroom — call ' + esc(R.phone) + ' or ask for a walk-around video.</p>';
      $('[data-vdp-opts-wrap]').hidden = true;
    }
    var specs = [['Year', c.year], ['Make', c.make], ['Model', c.model], ['Mileage', miles(c.miles)], ['Body', c.body], ['Engine', c.engine],
      ['Transmission', c.trans], ['Drivetrain', c.drive], ['Exterior', c.ext], ['Interior', c.int], ['VIN', c.vin], ['Stock', c.stock], ['Showroom', R.name]];
    $('[data-vdp-spec]').innerHTML = specs.filter(function (r) { return r[1]; })
      .map(function (r) { return '<div><dt>' + r[0] + '</dt><dd' + (r[0] === 'VIN' ? ' class="t-num"' : '') + '>' + esc(r[1]) + '</dd></div>'; }).join('');

    /* the showroom it stands in */
    $('[data-vdp-contact]').innerHTML =
      '<figure class="vdp__room-ph"><img src="' + R.img + '" alt="" loading="lazy" decoding="async"></figure>' +
      '<div class="vdp__room-in"><p class="sub__kicker">See it in person</p>' +
      '<h2 class="vdp__h disp" id="vdp-room-h">' + esc(R.name) + '</h2>' +
      '<p class="vdp__room-d">' + esc(R.dealer) + '</p>' +
      '<address class="vdp__room-a">' + R.addr.map(esc).join('<br>') + '</address>' +
      '<dl class="vdp__room-f"><div><dt>Hours</dt><dd>' + esc(R.hours) + '</dd></div><div><dt>Phone</dt><dd class="t-num">' + esc(R.phone) + '</dd></div></dl>' +
      '<div class="vdp__cta"><a class="btn btn--red sub__btn" href="#vdp-contact">Schedule a viewing ' + ARR + '</a>' +
      '<a class="btn sub__btn sub__btn--line" href="#vdp-contact">Directions</a></div></div>';

    /* more from Select — the same showroom first */
    var more = CARS.filter(function (x) { return x.id !== c.id; })
      .sort(function (a, b) { return (b.loc === c.loc) - (a.loc === c.loc) || (b.price || 0) - (a.price || 0); }).slice(0, 3);
    $('[data-vdp-more]').innerHTML = more.map(tile).join('');
    requestAnimationFrame(function () { $$('[data-vdp-more] .tile').forEach(function (t) { t.classList.add('is-in'); }); });

    /* gallery */
    var img = $('[data-vdp-img]'), n = $('[data-vdp-n]'), th = $('[data-vdp-thumbs]'), k = 0;
    th.innerHTML = gal.map(function (g, i) {
      return '<li><button type="button" data-k="' + i + '" aria-label="Photograph ' + (i + 1) + ' of ' + gal.length + '"><img src="' + g.small + '" alt="" loading="' + (i < 10 ? 'eager' : 'lazy') + '" decoding="async"></button></li>';
    }).join('');
    function pad(x) { return (x < 10 ? '0' : '') + x; }
    function show(i, from) {
      k = (i + gal.length) % gal.length;
      img.src = gal[k].big; img.alt = c.title + ' — photograph ' + (k + 1) + ' of ' + gal.length;
      n.innerHTML = '<b>' + pad(k + 1) + '</b> / ' + pad(gal.length);
      $$('button', th).forEach(function (b) { b.setAttribute('aria-current', +b.dataset.k === k ? 'true' : 'false'); });
      var cur = th.children[k];
      if (cur && from !== 'thumb') th.scrollTo({ left: cur.offsetLeft - th.clientWidth / 2 + cur.offsetWidth / 2, behavior: 'smooth' });
      var pre = new Image(); pre.src = gal[(k + 1) % gal.length].big;
      if (lb && !lb.hidden) lbShow();
    }
    th.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.k, 'thumb'); });
    $('[data-vdp-prev]').addEventListener('click', function () { show(k - 1); });
    $('[data-vdp-next]').addEventListener('click', function () { show(k + 1); });
    // swipe on the main photograph
    var sx = null;
    img.parentElement.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    img.parentElement.addEventListener('pointerup', function (e) { if (sx == null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 50) { show(k + (d < 0 ? 1 : -1)); img.parentElement.dataset.swiped = '1'; } });

    /* full-screen view */
    var lb = $('[data-lbox]'), li = $('[data-lbox-img]'), ln = $('[data-lbox-n]');
    function lbShow() { li.src = gal[k].big; li.alt = img.alt; ln.textContent = pad(k + 1) + ' / ' + pad(gal.length); }
    function lbOpen() { lb.hidden = false; lbShow(); document.documentElement.classList.add('lbox-open'); if (window.V4 && V4.lenis) V4.lenis.stop(); $('[data-lbox-close]').focus(); }
    function lbClose() { lb.hidden = true; document.documentElement.classList.remove('lbox-open'); if (window.V4 && V4.lenis) V4.lenis.start(); $('[data-vdp-open]').focus(); }
    $('[data-vdp-open]').addEventListener('click', function (e) { if (this.dataset.swiped) { delete this.dataset.swiped; return; } lbOpen(); });
    $('[data-lbox-close]').addEventListener('click', lbClose);
    $('[data-lbox-prev]').addEventListener('click', function () { show(k - 1); });
    $('[data-lbox-next]').addEventListener('click', function () { show(k + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      var inLb = !lb.hidden;
      if (e.key === 'Escape' && inLb) { lbClose(); return; }
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && (inLb || gal.length)) { e.preventDefault(); show(k + 1); }
      if (e.key === 'ArrowLeft' && (inLb || gal.length)) { e.preventDefault(); show(k - 1); }
    });
    show(0);
  })();
})();
