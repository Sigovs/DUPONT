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
  var ORDER = Object.keys(ROOMS);   // every list of showrooms (chips, counts, VDP) is built from ROOMS — a new showroom is one entry
  var HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  /* saved cars — this browser only until accounts exist; shared by the SRP hearts and the VDP Save pill */
  var SAVE_KEY = 'sel-saved';
  function saved() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch (e) { return []; } }
  function isSaved(id) { return saved().indexOf(id) > -1; }
  function toggleSaved(id) { var l = saved(), i = l.indexOf(id); if (i > -1) l.splice(i, 1); else l.push(id);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(l)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('sel:saved', { detail: { id: id, on: i < 0 } })); return i < 0; }

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
      '<span class="tile__go">View this car ' + ARR + '</span></span></a>' +
      '<button class="tile__save" type="button" data-save="' + c.id + '" aria-pressed="' + isSaved(c.id) + '" aria-label="Save the ' + esc(c.title) + '">' + HEART + '</button></li>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-save]'); if (!b) return;
    e.preventDefault(); var on = toggleSaved(b.dataset.save);
    $$('[data-save="' + b.dataset.save + '"]').forEach(function (x) { x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  });

  /* ============================================================ SRP */
  /* Alex 2026-10-28: main row = Year · Make · Model · Price (two-thumb slider) · More filters · keyword;
     More filters (hidden until asked) = mileage, body, transmission, drivetrain, colour — values only from the cars;
     showrooms on the left and Sort by on the right, on their own row above the results. State lives in the URL. */
  var srp = $('[data-srp]');
  if (srp) (function () {
    var grid = $('[data-inv-grid]'), rooms = $('[data-inv-rooms]'), mk = $('[data-inv-make]'), md = $('[data-inv-model]'), yr = $('[data-inv-year]');
    var so = $('[data-inv-sort]'), q = $('[data-inv-q]'), count = $('[data-inv-count]'), empty = $('[data-inv-empty]'), tags = $('[data-inv-tags]');
    var P = new URLSearchParams(location.search);
    // price steps — non-linear, so the slider is useful from $150k to $3M
    var STEPS = [0, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000, Infinity];
    var LAST = STEPS.length - 1;
    function kM(v) { return v >= 1e6 ? '$' + (v / 1e6).toFixed(v % 1e6 ? 2 : 0).replace(/0$/, '').replace(/\.$/, '') + 'M' : '$' + Math.round(v / 1000) + 'k'; }
    function plabel(lo, hi) { return lo === 0 && hi === LAST ? 'Any' : lo === 0 ? 'Up to ' + kM(STEPS[hi]) : hi === LAST ? kM(STEPS[lo]) + '+' : kM(STEPS[lo]) + ' – ' + kM(STEPS[hi]); }
    var MILES = [['', 'Any'], ['5000', 'Under 5,000'], ['10000', 'Under 10,000'], ['25000', 'Under 25,000']];
    var COLOURS = [['Black', /\b(black|nero)\b/], ['White', /\b(white|bianco)\b/], ['Silver', /\b(silver|grey|gray|argento)\b/], ['Red', /\b(red|rosso)\b/],
      ['Blue', /\b(blue|blu)\b/], ['Yellow', /\byellow\b/], ['Orange', /\borange\b/], ['Green', /\b(green|verde)\b/]];
    function colour(c) {   // the colour family named first in the listing's exterior line ("Nero DS, Blu Nart stripe" → Black)
      var e = (c.ext || '').toLowerCase(), best = null, at = 1e9;
      COLOURS.forEach(function (k) { var m = k[1].exec(e); if (m && m.index < at) { at = m.index; best = k[0]; } });
      return best;
    }
    function trans(c) { return c.trans ? (/manual/i.test(c.trans) ? 'Manual' : 'Automatic') : null; }
    var FACETS = {   // key → [label, value of a car]
      body: ['Body style', function (c) { return c.body; }],
      trans: ['Transmission', trans],
      drive: ['Drivetrain', function (c) { return c.drive; }],
      color: ['Exterior colour', colour]
    };
    var list0 = function (k) { return (P.get(k) || '').split(',').filter(Boolean); };
    function fresh() { return { room: '', make: '', model: '', year: '', lo: 0, hi: LAST, mi: '', body: [], trans: [], drive: [], color: [], sort: 'featured', q: '', saved: false }; }
    var st = fresh();
    st.room = P.get('showroom') || ''; st.make = P.get('make') || ''; st.model = P.get('model') || ''; st.year = P.get('year') || '';
    st.lo = Math.max(0, STEPS.indexOf(+P.get('pmin'))); var ph = STEPS.indexOf(+P.get('pmax')); st.hi = ph > 0 ? ph : LAST;
    st.mi = P.get('mi') || ''; st.body = list0('body'); st.trans = list0('trans'); st.drive = list0('drive'); st.color = list0('color');
    st.sort = P.get('sort') || 'featured'; st.q = P.get('q') || ''; st.saved = P.get('saved') === '1';

    // showrooms + saved
    rooms.innerHTML = '<button type="button" class="chip" data-room="">All <span>' + CARS.length + '</span></button>' + ORDER.map(function (k) {
      var n = CARS.filter(function (c) { return c.loc === k; }).length;
      return '<button type="button" class="chip" data-room="' + k + '"' + (n ? '' : ' disabled') + '>' + ROOMS[k].name + ' <span>' + n + '</span></button>';
    }).join('') + '<button type="button" class="chip chip--saved" data-saved aria-pressed="false">' + HEART + 'Saved <span data-saved-n>0</span></button>';
    // selects
    var uniq = function (a) { return a.filter(function (m, i) { return m != null && a.indexOf(m) === i; }); };
    var makes = uniq(CARS.map(function (c) { return c.make; })).sort();
    mk.insertAdjacentHTML('beforeend', makes.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join(''));
    var years = uniq(CARS.map(function (c) { return String(c.year); })).sort().reverse();
    yr.insertAdjacentHTML('beforeend', years.map(function (y) { return '<option>' + y + '</option>'; }).join(''));
    function models() {
      var l = uniq(CARS.filter(function (c) { return c.make === st.make; }).map(function (c) { return c.model; })).sort();
      md.innerHTML = '<option value="">' + (st.make ? 'All models' : 'Choose a make first') + '</option>' + l.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      md.disabled = !st.make; md.value = st.model;
    }
    // More filters panel: chips built from the values the cars actually have
    var adv = $('[data-inv-adv]');
    adv.innerHTML = '<div class="inv__grp"><p class="inv__grp-h">Mileage</p><div class="inv__grp-c">' + MILES.map(function (m) {
        return '<button type="button" class="chip chip--s" data-mi="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div></div>' +
      Object.keys(FACETS).map(function (k) {
        var vals = uniq(CARS.map(FACETS[k][1]));
        if (k === 'color') vals = COLOURS.map(function (c) { return c[0]; }).filter(function (c) { return vals.indexOf(c) > -1; }); else vals.sort();
        return '<div class="inv__grp inv__grp--' + k + '"><p class="inv__grp-h">' + FACETS[k][0] + '</p><div class="inv__grp-c">' + vals.map(function (v) {
          return '<button type="button" class="chip chip--s" data-facet="' + k + '" data-v="' + esc(v) + '" aria-pressed="false">' + esc(v) + '</button>'; }).join('') + '</div></div>';
      }).join('');
    // price slider
    var pmin = $('[data-pmin]'), pmax = $('[data-pmax]'), pval = $('[data-inv-pval]'), pbtn = $('[data-inv-pbtn]'), pop = $('[data-inv-pop]');
    pmin.max = pmax.max = LAST;
    function paintPrice() {
      pmin.value = st.lo; pmax.value = st.hi;
      $('[data-pfill]').style.cssText = 'left:' + (st.lo / LAST * 100) + '%;right:' + (100 - st.hi / LAST * 100) + '%';
      $('[data-pmin-l]').textContent = st.lo ? kM(STEPS[st.lo]) : 'No min';
      $('[data-pmax-l]').textContent = st.hi === LAST ? 'No max' : kM(STEPS[st.hi]);
      pval.textContent = plabel(st.lo, st.hi);
      pmin.setAttribute('aria-valuetext', $('[data-pmin-l]').textContent); pmax.setAttribute('aria-valuetext', $('[data-pmax-l]').textContent);
    }
    var pt;
    function onRange(e) {
      var a = +pmin.value, b = +pmax.value;
      if (a >= b) { if (e.target === pmin) a = b - 1; else b = a + 1; }
      st.lo = Math.max(0, a); st.hi = Math.min(LAST, b); paintPrice();
      clearTimeout(pt); pt = setTimeout(function () { render(true); }, 120);
    }
    pmin.addEventListener('input', onRange); pmax.addEventListener('input', onRange);
    function popOpen(o) { pop.hidden = !o; pbtn.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    pbtn.addEventListener('click', function () { popOpen(pop.hidden); });
    $('[data-inv-preset]').addEventListener('click', function () { st.lo = 0; st.hi = LAST; paintPrice(); render(true); });
    document.addEventListener('click', function (e) { if (!pop.hidden && !e.target.closest('[data-inv-price]')) popOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { popOpen(false); pbtn.focus(); } });

    function results() {
      var s = st.q.trim().toLowerCase(), lo = STEPS[st.lo], hi = STEPS[st.hi], priced = st.lo > 0 || st.hi < LAST;
      var l = CARS.filter(function (c) {
        if (st.saved && !isSaved(c.id)) return false;
        if (st.room && c.loc !== st.room) return false;
        if (st.make && c.make !== st.make) return false;
        if (st.model && c.model !== st.model) return false;
        if (st.year && String(c.year) !== st.year) return false;
        if (priced && (c.price == null || c.price < lo || c.price > hi)) return false;
        if (st.mi && !(c.miles != null && c.miles < +st.mi)) return false;
        for (var k in FACETS) if (st[k].length && st[k].indexOf(FACETS[k][1](c)) < 0) return false;
        if (s && (c.title + ' ' + (c.ext || '') + ' ' + (c.body || '') + ' ' + ROOMS[c.loc].name).toLowerCase().indexOf(s) < 0) return false;
        return true;
      });
      var by = {
        'price-desc': function (a, b) { return (b.price || 0) - (a.price || 0); },
        'price-asc': function (a, b) { return (a.price || Infinity) - (b.price || Infinity); },
        'miles-asc': function (a, b) { return a.miles - b.miles; },
        'year-desc': function (a, b) { return b.year - a.year; },
        'year-asc': function (a, b) { return a.year - b.year; }
      }[st.sort];
      return by ? l.slice().sort(by) : l;
    }
    var X = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false"><path d="M1 1l8 8M9 1L1 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    function render(push) {
      var list = results();
      // the last row closes on a showroom tile that fills it (never a lone car with empty air beside it)
      var r3 = 3 - list.length % 3, r2 = 2 - list.length % 2;
      grid.innerHTML = list.map(tile).join('') + (list.length ? '<li class="tile tile--end" style="--i:' + list.length + ';--s3:' + r3 + ';--s2:' + r2 + '">' +
        '<a class="tile__a" href="index.html#showrooms"><span class="tile__body"><span class="tile__room">Not seeing it?</span>' +
        '<span class="tile__title disp">Ask a showroom</span><span class="tile__spec">Three showrooms — Southern California, Naples and Miami.</span>' +
        '<span class="tile__go">Contact a showroom ' + ARR + '</span></span></a></li>' : '');
      count.textContent = list.length + (list.length === 1 ? ' car' : ' cars');
      // active filters as small removable pills (Alex, 2026-10-22)
      var T = [['saved', st.saved && 'Saved', 'Saved'], ['room', st.room && ROOMS[st.room].name, 'Showroom'], ['year', st.year, 'Year'], ['make', st.make, 'Make'],
        ['model', st.model, 'Model'], ['price', (st.lo || st.hi < LAST) && plabel(st.lo, st.hi), 'Price'],
        ['mi', st.mi && MILES.filter(function (m) { return m[0] === st.mi; })[0][1] + ' mi', 'Mileage']];
      Object.keys(FACETS).forEach(function (k) { st[k].forEach(function (v) { T.push([k + ':' + v, v, FACETS[k][0]]); }); });
      T.push(['q', st.q.trim() && '“' + st.q.trim() + '”', 'Keyword']);
      T = T.filter(function (t) { return t[1]; });
      tags.innerHTML = T.map(function (t) { return '<li><button type="button" class="inv__tag" data-tag="' + esc(t[0]) + '" aria-label="Remove ' + t[2] + ': ' + esc(t[1]) + '">' + esc(t[1]) + X + '</button></li>'; }).join('');
      tags.hidden = !T.length;
      var dirty = !!(T.length || st.sort !== 'featured');
      $('.inv__meta [data-inv-clear]').hidden = !dirty;
      empty.hidden = list.length > 0; grid.hidden = !list.length;
      $$('.chip[data-room]', rooms).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.room === st.room ? 'true' : 'false'); });
      $$('[data-mi]', adv).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mi === st.mi ? 'true' : 'false'); });
      $$('[data-facet]', adv).forEach(function (b) { b.setAttribute('aria-pressed', st[b.dataset.facet].indexOf(b.dataset.v) > -1 ? 'true' : 'false'); });
      paintSaved();
      var nAdv = (st.mi ? 1 : 0) + st.body.length + st.trans.length + st.drive.length + st.color.length;
      $('[data-inv-mcount]').textContent = nAdv ? ' · ' + nAdv : '';
      var nf = [st.year, st.make, st.model, st.q.trim(), st.lo || st.hi < LAST].filter(Boolean).length + nAdv;   // what the mobile Filters button hides
      $('[data-inv-fcount]').textContent = nf ? ' · ' + nf : '';
      if (push) {
        var u = new URLSearchParams();
        [['room', 'showroom'], ['make', 'make'], ['model', 'model'], ['year', 'year'], ['mi', 'mi'], ['q', 'q']].forEach(function (k) { if (st[k[0]]) u.set(k[1], st[k[0]]); });
        if (st.lo) u.set('pmin', STEPS[st.lo]); if (st.hi < LAST) u.set('pmax', STEPS[st.hi]);
        Object.keys(FACETS).forEach(function (k) { if (st[k].length) u.set(k, st[k].join(',')); });
        if (st.sort !== 'featured') u.set('sort', st.sort);
        if (st.saved) u.set('saved', '1');
        history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      }
      requestAnimationFrame(function () { $$('.tile', grid).forEach(function (t) { t.classList.add('is-in'); }); });
    }
    tags.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tag]'); if (!b) return;
      var k = b.dataset.tag, i = k.indexOf(':');
      if (i > 0) { var f = k.slice(0, i), v = k.slice(i + 1); st[f] = st[f].filter(function (x) { return x !== v; }); }
      else if (k === 'saved') st.saved = false;
      else if (k === 'price') { st.lo = 0; st.hi = LAST; paintPrice(); }
      else { st[k] = ''; if (k === 'make') { st.model = ''; models(); } }
      syncInputs(); render(true);
      var next = tags.querySelector('.inv__tag'); if (next) next.focus();   // keep the keyboard in the row
    });
    rooms.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b || b.disabled) return;
      if (b.hasAttribute('data-saved')) st.saved = !st.saved; else st.room = b.dataset.room;
      render(true);
    });
    adv.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      if (b.hasAttribute('data-mi')) st.mi = b.dataset.mi;
      else { var k = b.dataset.facet, v = b.dataset.v, i = st[k].indexOf(v); if (i > -1) st[k].splice(i, 1); else st[k].push(v); }
      render(true);
    });
    var more = $('[data-inv-more]');
    more.addEventListener('click', function () { var o = adv.hidden; adv.hidden = !o; more.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    function paintSaved() {
      var n = saved().filter(function (id) { return BY[id]; }).length, sb = $('[data-saved]', rooms);
      $('[data-saved-n]', sb).textContent = n;
      sb.setAttribute('aria-pressed', st.saved ? 'true' : 'false');
      sb.disabled = !n && !st.saved;
    }
    document.addEventListener('sel:saved', function () { if (st.saved) render(true); else paintSaved(); });
    // phones: everything but the showrooms folds behind one Filters button
    var ft = $('[data-inv-ftoggle]'), fg = $('#inv-filters');
    ft.addEventListener('click', function () { var o = !fg.classList.contains('is-open'); fg.classList.toggle('is-open', o); ft.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    function syncInputs() { mk.value = st.make; yr.value = st.year; so.value = st.sort; q.value = st.q; models(); }
    mk.addEventListener('change', function () { st.make = mk.value; st.model = ''; models(); render(true); });
    md.addEventListener('change', function () { st.model = md.value; render(true); });
    yr.addEventListener('change', function () { st.year = yr.value; render(true); });
    so.addEventListener('change', function () { st.sort = so.value; render(true); });
    var qt; q.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { st.q = q.value; render(true); }, 160); });
    $$('[data-inv-clear]').forEach(function (b) { b.addEventListener('click', function () { st = fresh(); paintPrice(); syncInputs(); render(true); }); });
    if (makes.indexOf(st.make) < 0) st.make = '';
    if (years.indexOf(st.year) < 0) st.year = '';
    paintPrice(); syncInputs(); render(false);
    // the filter bar stands still under the header once it reaches it (a hairline marks it)
    var bar = $('[data-inv-bar]');
    if ('IntersectionObserver' in window) {
      var s = document.createElement('div'); s.className = 'inv__sentinel'; bar.parentNode.insertBefore(s, bar);
      new IntersectionObserver(function (es) { bar.classList.toggle('is-stuck', !es[0].isIntersecting); }, { rootMargin: '-129px 0px 0px 0px' }).observe(s);
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
    var inPanel = {}; quick.forEach(function (r) { inPanel[r[0]] = 1; });   // each fact appears once on the page (Alex, 2026-10-22)
    $('[data-vdp-quick]').innerHTML = quick.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') +
      (c.vin ? '<div class="vdp__q-vin"><dt>VIN</dt><dd class="t-num vdp__vin">' + esc(c.vin) + '</dd></div>' : '');   // VIN lives in the panel (Alex, 2026-10-22)
    $('[data-vdp-call]').textContent = 'Call ' + R.phone;
    /* CARFAX (Alex, 2026-10-22): no report in the source listing and no dealer partner code yet — the button opens a
       note; in production it becomes the dealer's CARFAX link for this VIN. Nothing about the car's history is shown. */
    var cfb = $('[data-vdp-carfax]'), cfn = $('[data-vdp-carfax-note]');
    if (cfb && cfn) {
      cfn.innerHTML = 'The CARFAX Vehicle History Report for this car is provided by the showroom on request. <span class="vdp__ph">Placeholder — dealer CARFAX link goes here.</span>';
      cfb.addEventListener('click', function () { var o = cfn.hidden; cfn.hidden = !o; cfb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    }

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
    /* specifications — key figures first (parsed from the listing's own engine line + odometer; a figure whose value
       is absent is left out, never invented), then two short groups: the car, and the record */
    var eng = c.engine || '', hp = /(\d[\d,]*)\s*hp\b/i.exec(eng), lit = /^(\d+(?:\.\d+)?)\s*L\b[\s,]*/i.exec(eng);
    var engRest = lit ? eng.slice(lit[0].length).replace(/,?\s*\d[\d,]*\s*hp\b.*$/i, '').trim() : '';
    var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
    var DRV = { 'rear-wheel drive': 'RWD', 'all-wheel drive': 'AWD', 'front-wheel drive': 'FWD', 'four-wheel drive': '4WD' };
    var drvCode = c.drive && DRV[c.drive.toLowerCase()];
    var figs = [];
    if (hp) figs.push([hp[1], 'hp', /combined/i.test(eng) ? 'Power, combined' : 'Power']);
    if (lit) figs.push([lit[1], 'L', 'Displacement']);
    // cylinders — read from the listing's engine line only (V8, V10, flat-six …); caption = the rest of that line
    var NUM = { four: 4, six: 6, eight: 8, ten: 10, twelve: 12 };
    var cyl = /\b[VW](\d{1,2})\b/.exec(eng) || /\bflat[- ](four|six)\b/i.exec(eng);
    var cylN = cyl && (NUM[cyl[1].toLowerCase()] || +cyl[1]);
    if (cylN) figs.push([String(cylN), 'cyl', engRest ? cap(engRest.replace(/,\s*$/, '')) : 'Cylinders']);
    if (c.options && c.options.length) figs.push([String(c.options.length), '', 'Options listed']);
    var driveFig = figs.length < 4 && drvCode && !inPanel.Drivetrain;
    if (driveFig) figs.push([drvCode, '', c.drive]);
    if (!figs.length && c.year) figs.push([String(c.year), '', 'Model year']);   // no engine line on dR: the one sure figure
    var figEl = $('[data-vdp-figs]');
    figEl.hidden = !figs.length;
    figEl.innerHTML = figs.map(function (f) {
      return '<li class="vdp__fig"><span class="vdp__fig-n">' + esc(f[0]) + (f[1] ? '<small>' + f[1] + '</small>' : '') +
        '</span><span class="vdp__fig-c">' + esc(f[2]) + '</span></li>';
    }).join('');
    /* everything else, once: facts the panel doesn't show + the record, as one quiet supporting line */
    var rest = [['Body', c.body], ['Engine', lit ? null : c.engine], ['Exterior', c.ext], ['Interior', c.int],
      ['Transmission', c.trans], ['Drivetrain', driveFig ? null : c.drive]]
      .filter(function (r) { return r[1] && !inPanel[r[0]]; });
    var meta = rest.map(function (r) { return '<li><span>' + r[0] + '</span> ' + esc(r[1]) + '</li>'; });
    if (c.stock) meta.push('<li><span>Stock</span> <b class="t-num vdp__code">' + esc(c.stock) + '</b></li>');
    if (!c.engine) meta.push('<li class="vdp__meta-note">Engine and performance figures from the showroom on request.</li>');
    $('[data-vdp-spec]').innerHTML = meta.length ? '<ul class="vdp__meta">' + meta.join('') + '</ul>' : '';

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
      if (!iq.hidden) return;
      if (e.key === 'Escape' && inLb) { lbClose(); return; }
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && (inLb || gal.length)) { e.preventDefault(); show(k + 1); }
      if (e.key === 'ArrowLeft' && (inLb || gal.length)) { e.preventDefault(); show(k - 1); }
    });

    /* inquiry drawer (Alex, 2026-10-22): "Inquire" opens a side sheet with the message pre-written for THIS car.
       Prototype: no backend — submit shows a confirmation and says plainly that nothing was sent. */
    var iq = $('[data-inq]'), iqBtn = $('[data-vdp-avail]'), iqForm = $('[data-inq-form]'), iqDone = $('[data-inq-done]'), iqLast = null;
    var iqRef = [c.vin ? 'VIN ' + c.vin : '', c.stock ? 'stock ' + c.stock : ''].filter(Boolean).join(', ');
    var iqText = "Hello, I'm interested in the " + c.title + (c.price ? ' listed at ' + money(c.price) : '') +
      (iqRef ? ' (' + iqRef + ')' : '') + ' at the ' + R.name + ' showroom. Is it still available? Please get in touch with more details.';
    $('[data-inq-car]').innerHTML = '<img src="' + (gal[1] || gal[0]).small + '" alt="" width="132" height="88">' +
      '<div><p class="inq__room">' + esc(R.name) + '</p><p class="inq__title">' + esc(c.title) + '</p>' +
      (c.price ? '<p class="inq__price t-num">' + money(c.price) + '</p>' : '') + '</div>';
    $('[data-inq-msg]').value = iqText;
    function iqFocusables() { return $$('a[href], button:not([disabled]), input, textarea, [tabindex="-1"]:not([hidden])', iq).filter(function (el) { return el.offsetParent !== null; }); }
    function iqOpen(e) {
      if (e) e.preventDefault();
      iqLast = document.activeElement;
      iq.hidden = false; iq.offsetWidth; iq.classList.add('is-open');
      document.documentElement.classList.add('inq-open'); if (window.V4 && V4.lenis) V4.lenis.stop();
      iqBtn.setAttribute('aria-expanded', 'true');
      setTimeout(function () { var f = iqForm.hidden ? iqDone : iqForm.querySelector('input'); if (f) f.focus({ preventScroll: true }); }, 60);
    }
    function iqClose() {
      if (iq.hidden) return;
      iq.classList.remove('is-open'); iqBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('inq-open'); if (window.V4 && V4.lenis) V4.lenis.start();
      var t = parseFloat(getComputedStyle(iq.querySelector('.inq__sheet')).transitionDuration) * 1000 || 0;
      setTimeout(function () { if (!iq.classList.contains('is-open')) iq.hidden = true; }, t);
      if (iqLast) iqLast.focus({ preventScroll: true });
    }
    iqBtn.setAttribute('aria-expanded', 'false');
    iqBtn.addEventListener('click', iqOpen);
    iq.addEventListener('click', function (e) { if (e.target.closest('[data-inq-close]')) iqClose(); });
    iq.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); iqClose(); return; }
      if (e.key !== 'Tab') return;
      var f = iqFocusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    iqForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = iqForm.elements, ok = d.first.value.trim() && d.last.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.value.trim());
      [d.first, d.last, d.email].forEach(function (el) { el.setAttribute('aria-invalid', el.value.trim() && (el !== d.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) ? 'false' : 'true'); });
      $('[data-inq-err]').hidden = !!ok;
      if (!ok) { iqForm.querySelector('[aria-invalid="true"]').focus(); return; }
      iqForm.hidden = true;
      iqDone.innerHTML = '<p class="inq__done-h disp">Thank you, ' + esc(d.first.value.trim()) + '.</p>' +
        '<p>' + esc(R.dealer) + ' will reply about the ' + esc(c.title) + ' by email' + (d.phone.value.trim() ? ' or phone' : '') + '. If it can\'t wait, call <a class="t-num" href="tel:' + R.phone.replace(/[^\d+]/g, '') + '">' + esc(R.phone) + '</a>.</p>' +
        '<p class="inq__ph">Prototype — nothing was sent.</p>' +
        '<button class="btn sub__btn sub__btn--line" type="button" data-inq-close>Close</button>';
      iqDone.hidden = false; iqDone.focus();
    });

    /* Save · Share · Text (Alex, 2026-10-22). Save = this browser only (localStorage) until accounts exist;
       Share = the system share sheet, else the link is copied; Text = SMS to the showroom on phones, else its number. */
    var toast = $('[data-vdp-toast]'), tt;
    function say(m) { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2600); }
    var svB = $('[data-vdp-save]');
    function paintSave() { var on = isSaved(c.id); svB.setAttribute('aria-pressed', on ? 'true' : 'false'); $('[data-vdp-save-l]').textContent = on ? 'Saved' : 'Save'; }
    svB.addEventListener('click', function () { var on = toggleSaved(c.id); paintSave(); say(on ? 'Saved on this device' : 'Removed from saved cars'); });
    document.addEventListener('sel:saved', paintSave);
    paintSave();
    $('[data-vdp-share]').addEventListener('click', function () {
      var data = { title: c.title + ' — duPont REGISTRY Select', text: c.title + (c.price ? ', ' + money(c.price) : ''), url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { say('Link copied'); }, function () { say(location.href); });
      else say(location.href);
    });
    $('[data-vdp-text]').addEventListener('click', function () {
      var body = 'Hi, I\'m interested in the ' + c.title + (c.stock ? ' (stock ' + c.stock + ')' : '') + ': ' + location.href;
      if (matchMedia('(pointer: coarse)').matches) location.href = 'sms:' + R.phone.replace(/[^\d+]/g, '') + '?&body=' + encodeURIComponent(body);
      else say('Text ' + R.name + ': ' + R.phone);
    });
    show(0);
  })();
})();
