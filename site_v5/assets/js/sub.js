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

    /* dropdowns in the site's own language (Alex, 2026-10-28: "not these clunky ones"): a label/value cell opening a
       white listbox with car counts; it drives the hidden native <select>, so the filter state code is unchanged */
    var DDS = [];
    function dd(cell, countOf) {
      var sel = $('select', cell), id = 'dd-' + DDS.length;
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'inv__dd-btn';
      btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
      btn.innerHTML = '<span class="inv__lab">' + esc(cell.dataset.ddLabel) + '</span><span class="inv__val"></span><svg class="inv__chev" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
      var menu = document.createElement('ul'); menu.className = 'inv__menu'; menu.id = id; menu.setAttribute('role', 'listbox'); menu.hidden = true; menu.tabIndex = -1;
      menu.setAttribute('aria-label', cell.dataset.ddLabel);
      cell.appendChild(btn); cell.appendChild(menu);
      var act = 0;
      function refresh() {
        var o = sel.options[sel.selectedIndex]; $('.inv__val', btn).textContent = o ? o.text : '';
        btn.disabled = sel.disabled; cell.classList.toggle('is-off', sel.disabled);
        cell.classList.toggle('is-set', !!sel.value && sel.value !== 'featured');
      }
      function build() {
        menu.innerHTML = [].map.call(sel.options, function (o, i) {
          var n = countOf && o.value ? countOf(o.value) : null;
          return '<li role="option" id="' + id + '-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel.selectedIndex) + '"><span>' + esc(o.text) + '</span>' + (n != null ? '<span class="inv__n">' + n + '</span>' : '') + '</li>';
        }).join('');
      }
      function mark() { $$('li', menu).forEach(function (li, i) { li.classList.toggle('is-active', i === act); }); var a = menu.children[act]; if (a) { menu.setAttribute('aria-activedescendant', a.id); a.scrollIntoView({ block: 'nearest' }); } }
      function open() { DDS.forEach(function (d) { if (d !== api) d.close(); }); closePop(); if (typeof advOpen === 'function' && !adv.hidden) advOpen(false); build(); act = Math.max(0, sel.selectedIndex); menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); cell.classList.add('is-open'); mark(); menu.focus({ preventScroll: true }); }
      function close(back) { if (menu.hidden) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); cell.classList.remove('is-open'); if (back) btn.focus(); }
      function pick(i) { if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); } refresh(); close(true); }
      btn.addEventListener('click', function () { if (menu.hidden) open(); else close(); });
      btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
      menu.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
      menu.addEventListener('mousemove', function (e) { var li = e.target.closest('li'); if (li && +li.dataset.i !== act) { act = +li.dataset.i; mark(); } });
      menu.addEventListener('keydown', function (e) {
        var n = sel.options.length;
        if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(n - 1, act + 1); mark(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
        else if (e.key === 'Home') { e.preventDefault(); act = 0; mark(); }
        else if (e.key === 'End') { e.preventDefault(); act = n - 1; mark(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(act); }
        else if (e.key === 'Escape') { e.preventDefault(); close(true); }
        else if (e.key === 'Tab') close();
        else if (e.key.length === 1) { var k = e.key.toLowerCase(); for (var j = 1; j <= n; j++) { var t = (act + j) % n; if (sel.options[t].text.toLowerCase().indexOf(k) === 0) { act = t; mark(); break; } } }
      });
      var api = { refresh: refresh, close: close, cell: cell };
      DDS.push(api); refresh(); return api;
    }
    document.addEventListener('click', function (e) { DDS.forEach(function (d) { if (!d.cell.contains(e.target)) d.close(); }); });
    var countBy = function (f) { return function (v) { return CARS.filter(function (c) { return String(f(c)) === v; }).length; }; };
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
    function popOpen(o) { if (o) { DDS.forEach(function (d) { d.close(); }); if (typeof advOpen === 'function' && !adv.hidden) advOpen(false); } pop.hidden = !o; pbtn.setAttribute('aria-expanded', o ? 'true' : 'false'); pbtn.parentNode.classList.toggle('is-open', o); }
    function closePop() { if (!pop.hidden) popOpen(false); }
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
      DDS.forEach(function (d) { d.refresh(); });
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
    function advOpen(o) { adv.hidden = !o; more.setAttribute('aria-expanded', o ? 'true' : 'false'); more.parentNode.classList.toggle('is-open', o); }
    more.addEventListener('click', function () { var o = adv.hidden; if (o) { DDS.forEach(function (d) { d.close(); }); closePop(); } advOpen(o); });
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
    syncInputs();
    dd($('.inv__cell--year'), countBy(function (c) { return c.year; }));
    dd($('.inv__cell--make'), countBy(function (c) { return c.make; }));
    dd($('.inv__cell--model'), function (v) { return CARS.filter(function (c) { return c.make === st.make && c.model === v; }).length; });
    dd($('.inv__cell--sort'), null);
    paintPrice(); render(false);
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
    $('[data-vdp-price]').textContent = money(c.price);   // mileage moved into the facts list (one group, one job)
    /* itemised price only where the showroom's own listing breaks it down (select.dupontregistry.com, 2026-10-28) */
    $('[data-vdp-pricing]').innerHTML = (c.docFee ? '<span class="t-num">' + money(c.basePrice) + ' + ' + money(c.docFee) + ' doc fee</span>' : '<span>Taxes and registration extra</span>') +
      '<button type="button" class="vdp__pinfo" aria-expanded="false" aria-controls="vdp-pnote" aria-label="Pricing details" data-vdp-pdet>i</button>';
    if (!c.price) { var pc = $('[data-vdp-paycell]'); if (pc) pc.hidden = true; }
    var pdet = $('[data-vdp-pdet]'), pnote = $('[data-vdp-pnote]');
    pdet.addEventListener('click', function () { var o = pnote.hidden; pnote.hidden = !o; pdet.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    var quick = [['Mileage', c.miles != null ? c.miles.toLocaleString('en-US') + ' mi' : null], ['Exterior', c.ext], ['Interior', c.int], ['Transmission', c.trans], ['Drivetrain', c.drive], ['Engine', c.engine], ['Body', c.body]]
      .filter(function (r) { return r[1]; }).slice(0, 5);
    var inPanel = {}; quick.forEach(function (r) { inPanel[r[0]] = 1; });   // each fact appears once on the page (Alex, 2026-10-22)
    $('[data-vdp-quick]').innerHTML = quick.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') +
      (c.vin ? '<div class="vdp__q-vin"><dt>VIN</dt><dd class="t-num vdp__vin">' + esc(c.vin) + '</dd></div>' : '') +   // VIN lives in the panel (Alex, 2026-10-22)
      (c.stock ? '<div><dt>Stock #</dt><dd class="t-num vdp__vin">' + esc(c.stock) + '</dd></div>' : '') +
      '<div class="vdp__q-cf"><dt>History</dt><dd><button class="vdp__carfax" type="button" data-vdp-carfax aria-expanded="false" aria-controls="vdp-carfax-note">' +
      '<img class="vdp__carfax-logo" src="assets/img/brand/carfax.svg" width="127" height="30" alt="CARFAX"><span>Report</span></button></dd></div>';   // Stock # always visible next to the VIN (Alex, 2026-10-28)
    $('[data-vdp-call]').innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6.6 2.5H4.2A1.7 1.7 0 0 0 2.5 4.3c.3 7.1 6.1 12.9 13.2 13.2a1.7 1.7 0 0 0 1.8-1.7v-2.4l-3.4-1.4-1.6 1.6a10.7 10.7 0 0 1-4.9-4.9l1.6-1.6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg><span class="t-num vdp__call-n">' + esc(R.phone) + '</span><span class="vdp__call-w">Call</span>';
    $('[data-vdp-call]').setAttribute('aria-label', 'Call ' + R.phone);
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
      var OPT_N = 10, opts = c.options || [];
      $('[data-vdp-opts]').innerHTML = opts.map(function (o, i) { return '<li' + (i >= OPT_N ? ' class="is-extra"' : '') + '>' + esc(o) + '</li>'; }).join('');
      if (opts.length > OPT_N) {
        var ow = $('[data-vdp-opts-wrap]'); ow.classList.add('is-short');
        ow.insertAdjacentHTML('beforeend', '<button type="button" class="vdp__lnk vdp__showall" aria-expanded="false">Show all ' + opts.length + ' options</button>');
        $('.vdp__showall', ow).addEventListener('click', function () { var o = ow.classList.toggle('is-short'); this.setAttribute('aria-expanded', o ? 'false' : 'true'); this.textContent = o ? 'Show all ' + opts.length + ' options' : 'Show fewer'; });
      }
      var ovb = $('[data-vdp-ov]');
      requestAnimationFrame(function () {
        ovb.classList.add('is-clamped');
        if (ovb.scrollHeight - ovb.clientHeight > 8) {
          ovb.insertAdjacentHTML('afterend', '<button type="button" class="vdp__lnk vdp__readmore" aria-expanded="false">Read more</button>');
          $('.vdp__readmore').addEventListener('click', function () { var o = ovb.classList.toggle('is-clamped'); this.setAttribute('aria-expanded', o ? 'false' : 'true'); this.textContent = o ? 'Read more' : 'Read less'; });
        } else ovb.classList.remove('is-clamped');
      });
      $('[data-vdp-close]').textContent = c.closing || '';
    } else {
      $('[data-vdp-lead]').textContent = c.title + ', at ' + R.dealer + '.';
      $('[data-vdp-ov]').innerHTML = '<p>The full description of this car is with the showroom — call ' + esc(R.phone) + ' or ask for a walk-around video.</p>';
      $('[data-vdp-opts-wrap]').hidden = true; var so = $('[data-sn-opt]'); if (so) so.hidden = true;
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
    var driveFig = figs.length < 4 && drvCode && !inPanel.Drivetrain;
    if (driveFig) figs.push([drvCode, '', c.drive]);
    if (!figs.length && c.year) figs.push([String(c.year), '', 'Model year']);   // no engine line on dR: the one sure figure
    var figEl = $('[data-vdp-figs]');
    figEl.hidden = !figs.length;
    figEl.dataset.n = figs.length;   // 3 figures sit in one row (Alex: no 'options listed' count)
    figEl.innerHTML = figs.map(function (f) {
      return '<li class="vdp__fig"><span class="vdp__fig-n">' + esc(f[0]) + (f[1] ? '<small>' + f[1] + '</small>' : '') +
        '</span><span class="vdp__fig-c">' + esc(f[2]) + '</span></li>';
    }).join('');
    /* everything else, once: facts the panel doesn't show + the record, as one quiet supporting line */
    var rest = [['Body', c.body], ['Engine', lit ? null : c.engine], ['Exterior', c.ext], ['Interior', c.int],
      ['Transmission', c.trans], ['Drivetrain', driveFig ? null : c.drive]]
      .filter(function (r) { return r[1] && !inPanel[r[0]]; });
    var meta = rest.map(function (r) { return '<li><span>' + r[0] + '</span> ' + esc(r[1]) + '</li>'; });
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
      '<div class="vdp__cta vdp__cta--room"><button class="btn btn--red sub__btn" type="button" data-inq-intent="viewing">Schedule a viewing ' + ARR + '</button>' +
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
    var INT = {
      availability: ['Inquire about this car', iqText],
      viewing: ['Schedule a viewing', "Hello, I'd like to see the " + c.title + (iqRef ? ' (' + iqRef + ')' : '') + ' in person at the ' + R.name + ' showroom. Please confirm a time that suits.'],
      trade: ['Trade in your car', "Hello, I'm interested in the " + c.title + (iqRef ? ' (' + iqRef + ')' : '') + ' and would like a value for my current car — details above.'],
      finance: ['Finance this car', "Hello, I'd like to know the financing and leasing options for the " + c.title + (c.price ? ' listed at ' + money(c.price) : '') + (iqRef ? ' (' + iqRef + ')' : '') + '.'],
      video: ['Request a walkaround video', 'Hello, could you send me a walkaround video of the ' + c.title + (iqRef ? ' (' + iqRef + ')' : '') + '?']
    };
    var iqMsg = $('[data-inq-msg]'), iqIntent = 'availability', iqAuto = iqText;
    var DONE = { availability: 'about the ' + esc(c.title), viewing: 'to arrange your viewing of the ' + esc(c.title),
      trade: 'with a value for your car and the details of the ' + esc(c.title), finance: 'with finance and leasing options for the ' + esc(c.title),
      video: 'with a walkaround video of the ' + esc(c.title) };
    function setIntent(k) {
      if (!INT[k]) k = 'availability'; iqIntent = k;
      $$('[data-intent]', iq).forEach(function (b) { b.setAttribute('aria-checked', b.dataset.intent === k ? 'true' : 'false'); b.setAttribute('aria-pressed', b.dataset.intent === k ? 'true' : 'false'); });
      $$('[data-intent-f]', iq).forEach(function (f) { f.hidden = f.dataset.intentF !== k; });
      $('#inq-h').textContent = INT[k][0];
      if (iqMsg.value === iqAuto) iqMsg.value = INT[k][1];   // never overwrite what the visitor typed
      iqAuto = INT[k][1];
    }
    iqMsg.value = iqText;
    $('[data-inq-intents]').addEventListener('click', function (e) { var b = e.target.closest('[data-intent]'); if (b) setIntent(b.dataset.intent); });
    $('[data-inq-pref]').addEventListener('click', function (e) { var b = e.target.closest('[data-pref]'); if (!b) return;
      $$('[data-pref]', iq).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
    $$('[data-pref]', iq).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('aria-checked')); });
    function iqFocusables() { return $$('a[href], button:not([disabled]), input, textarea, [tabindex="-1"]:not([hidden])', iq).filter(function (el) { return el.offsetParent !== null; }); }
    function iqOpen(e, intent) {
      if (e && e.preventDefault) e.preventDefault();
      setIntent(intent || 'availability');
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
    iqBtn.addEventListener('click', function (e) { iqOpen(e, 'availability'); });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-inq-intent]'); if (b && !iq.contains(b)) iqOpen(e, b.dataset.inqIntent); });
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
        '<p>' + esc(R.dealer) + ' will reply ' + DONE[iqIntent] + ' by ' + ({ Call: 'phone', Text: 'text', Email: 'email' })[(($('[data-pref][aria-checked="true"]', iq) || {}).dataset || {}).pref || 'Email'] + '. If it can\'t wait, call <a class="t-num" href="tel:' + R.phone.replace(/[^\d+]/g, '') + '">' + esc(R.phone) + '</a>.</p>' +
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
    /* Send to phone (Alex, 2026-10-28: "Text" meant sending the car to your own phone, as on the Select site).
       Desktop: a small card asks for a mobile number (prototype — nothing is sent). On a phone you already hold it: copy the link. */
    var tB = $('[data-vdp-text]'), s2p = $('[data-s2p]'), s2f = $('[data-s2p-form]'), s2d = $('[data-s2p-done]');
    var onPhone = matchMedia('(pointer: coarse)').matches && innerWidth < 760;
    if (onPhone) $('[data-vdp-text-l]').textContent = 'Copy link';
    function s2pOpen(o) { s2p.hidden = !o; tB.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) { s2f.hidden = false; s2d.hidden = true; setTimeout(function () { s2f.elements.tel.focus(); }, 30); } }
    tB.addEventListener('click', function () {
      if (onPhone) { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { say('Link copied'); }, function () { say(location.href); }); else say(location.href); return; }
      s2pOpen(s2p.hidden);
    });
    s2f.addEventListener('submit', function (e) {
      e.preventDefault(); var t = s2f.elements.tel, ok = t.value.replace(/\D/g, '').length >= 10;
      t.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok) { t.focus(); return; }
      s2f.hidden = true; s2d.textContent = 'A link to the ' + c.title + ' would go to ' + t.value.trim() + '. Prototype — nothing was sent.'; s2d.hidden = false; s2d.focus();
    });
    document.addEventListener('click', function (e) { if (!s2p.hidden && !e.target.closest('[data-s2p], [data-vdp-text]')) s2pOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !s2p.hidden) { s2pOpen(false); tB.focus(); } });

    /* finance estimate (Alex, 2026-10-28): the visitor's own figures; no rate is assumed — nothing shows until they enter one */
    var calc = $('[data-vdp-calc]'), cn = $('[data-calc-n]'), cf = $('[data-calc-f]');
    var num = function (v) { return parseFloat(String(v).replace(/[^\d.]/g, '')) || 0; };
    var usd = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
    if (c.price) { calc.elements.price.value = c.price.toLocaleString('en-US'); calc.elements.down.value = Math.round(c.price * 0.2 / 1000) * 1000 ? (Math.round(c.price * 0.2 / 1000) * 1000).toLocaleString('en-US') : ''; }
    function work() {
      var P = num(calc.elements.price.value) - num(calc.elements.down.value), n = +calc.elements.term.value, apr = calc.elements.apr.value.trim();
      if (!(P > 0) || apr === '' || isNaN(parseFloat(apr))) { cn.textContent = '—'; cf.textContent = P > 0 ? 'Enter your rate to see the estimate.' : 'Enter a price above the down payment.'; return; }
      var r = parseFloat(apr) / 1200, m = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
      cn.textContent = usd(m) + '/mo';
      cf.textContent = usd(P) + ' financed over ' + n + ' months at ' + parseFloat(apr) + '% APR.';
    }
    calc.addEventListener('input', work); calc.addEventListener('change', work);
    calc.addEventListener('focusout', function (e) { if (/price|down/.test(e.target.name) && e.target.value) e.target.value = Math.round(num(e.target.value)).toLocaleString('en-US'); });
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    if (!c.price) $('[data-vdp-fin]').hidden = true;
    work();

    /* buying from Select — the showroom's own words from its listings (SoCal: inspection, financing, worldwide transport) */
    if (c.closing || c.loc === 'socal') {
      $('[data-vdp-buy-l]').innerHTML = [
        ['<svg class="vdp__buy-i" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.4-3 8.2-7 9.5C8 19.2 5 15.4 5 11V6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.8 12l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>', 'Inspected', 'A full safety inspection by the showroom’s certified technicians.', ''],
        ['<svg class="vdp__buy-i" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="3" y="6" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 9.5v5M17.5 9.5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>', 'Finance & leasing', 'Financing and leasing options through the showroom.', c.price ? '<a class="vdp__lnk" href="#vdp-finance">Estimate a payment</a>' : ''],
        ['<svg class="vdp__buy-i" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5S9.4 5.9 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>', 'Delivery', 'Transportation can be arranged, anywhere in the world.', ''],
        ['<svg class="vdp__buy-i" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>', 'Showroom hours', esc(R.hours), '<a class="vdp__lnk" href="#vdp-contact">' + esc(R.name) + ' showroom</a>']
      ].map(function (b) { return '<li>' + b[0] + '<p class="vdp__buy-k">' + b[1] + '</p><p class="vdp__buy-t">' + b[2] + '</p>' + b[3] + '</li>'; }).join('');
      $('[data-vdp-buy]').hidden = false;
      var cl = $('[data-vdp-close]'); if (cl) { cl.textContent = ''; cl.hidden = true; }   // the band says it once — no repeat of the listing's closing lines
    }

    /* section bar (desktop) and Call · Inquire bar (phones) appear once the price panel's buttons leave the screen */
    var sn = $('[data-vdp-sn]'), mb = $('[data-vdp-mb]');
    $('[data-sn-title]').textContent = c.title; $('[data-sn-price]').textContent = c.price ? money(c.price) : '';
    $('[data-mb-call]').textContent = 'Call'; $('[data-mb-call]').href = 'tel:' + R.phone.replace(/[^\d+]/g, '');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { var away = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; sn.classList.toggle('is-on', away); mb.classList.toggle('is-on', away); },
        { threshold: 0 }).observe($('.vdp__cta'));
      var links = $$('.vdp__sn-l a', sn).filter(function (a) { return !a.parentNode.hidden; }), ticking = false;
      function spy() {   // the current section = the last one whose top has passed 35 % of the screen
        ticking = false; var cur = null, line = innerHeight * 0.35;
        links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t && t.getBoundingClientRect().top < line) cur = a; });
        links.forEach(function (a) { a.classList.toggle('is-cur', a === cur); if (a === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      }
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true }); spy();
    }

    /* video (Alex, 2026-10-28): listings that come with a walkaround get their own section under the gallery — a 16:9 stage
       that plays in place (YouTube id or MP4). Without one, the pill on the photo asks the showroom for a walkaround. */
    var vB = $('[data-vdp-vid]'), vSec = $('[data-vdp-video]'), V = c.video;
    if (V && (V.youtube || V.mp4)) {
      vSec.hidden = false; $('[data-sn-video]').hidden = false;
      $('[data-vdp-video-poster]').src = V.poster || (V.youtube ? 'https://i.ytimg.com/vi/' + encodeURIComponent(V.youtube) + '/maxresdefault.jpg' : (gal[2] || gal[0]).big);
      if (V.sample) { $('[data-vdp-video-tag]').hidden = false; vSec.classList.add('is-sample'); }
      $('[data-vdp-vid-l]').textContent = 'Play video';
      var vPlay = function () {
        $('[data-vdp-video-stage]').innerHTML = V.youtube
          ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(V.youtube) + '?autoplay=1&rel=0&modestbranding=1" title="' + esc(c.title) + ' — walkaround" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'
          : '<video src="' + esc(V.mp4) + '" controls autoplay playsinline' + (V.poster ? ' poster="' + esc(V.poster) + '"' : '') + '></video>';
        if (V.sample) $('[data-vdp-video-stage]').insertAdjacentHTML('beforeend', '<span class="vdp__video-tag">Sample</span>');
      };
      $('[data-vdp-video-play]').addEventListener('click', vPlay);
      vB.addEventListener('click', function () {
        if (window.V4 && V4.go) V4.go('vdp-video'); else vSec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(vPlay, 900);
      });
      // the section bar's link list was read before the Video item showed — let it count
      if (typeof links !== 'undefined') links = $$('.vdp__sn-l a', sn).filter(function (a) { return !a.parentNode.hidden; });
      window.dispatchEvent(new Event('scroll'));
    } else {
      $('[data-vdp-vid-l]').textContent = 'Request a walkaround video';
      vB.setAttribute('data-inq-intent', 'video');
    }
    show(0);
  })();
})();
