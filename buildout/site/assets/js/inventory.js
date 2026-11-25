/* Inventory (SRP): filters, sorting and saved cars. The state lives in the URL. */
Site.ready(function (data) {
  'use strict';
  var CARS = data.cars, BY = {};
  CARS.forEach(function (c) { BY[c.id] = c; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ARR = '<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  var ROOMS = data.showrooms;
  var ORDER = Object.keys(ROOMS);
  var HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var SAVE_KEY = 'sel-saved';
  function saved() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch (e) { return []; } }
  function isSaved(id) { return saved().indexOf(id) > -1; }
  function toggleSaved(id) { var l = saved(), i = l.indexOf(id); if (i > -1) l.splice(i, 1); else l.push(id);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(l)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('sel:saved', { detail: { id: id, on: i < 0 } })); return i < 0; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(p) { return p ? '$' + p.toLocaleString('en-US') : 'Price on request'; }
  function miles(m) { return m == null ? '' : m.toLocaleString('en-US') + ' miles'; }
  var tile = function (c, i) { return Site.card(c, i); };
  var srp = $('[data-srp]');
  if (srp) (function () {
    var grid = $('[data-inv-grid]'), rooms = $('[data-inv-rooms]'), mk = $('[data-inv-make]'), md = $('[data-inv-model]'), yr = $('[data-inv-year]');
    var so = $('[data-inv-sort]'), q = $('[data-inv-q]'), count = $('[data-inv-count]'), empty = $('[data-inv-empty]'), tags = $('[data-inv-tags]');
    var P = new URLSearchParams(location.search);
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
    var FACETS = {
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
    rooms.innerHTML = '<button type="button" class="chip" data-room="">All <span>' + CARS.length + '</span></button>' + ORDER.map(function (k) {
      var n = CARS.filter(function (c) { return c.loc === k; }).length;
      return '<button type="button" class="chip" data-room="' + k + '"' + (n ? '' : ' disabled') + '>' + ROOMS[k].name + ' <span>' + n + '</span></button>';
    }).join('') + '<button type="button" class="chip chip--saved" data-saved aria-pressed="false">' + HEART + 'Saved <span data-saved-n>0</span></button>';
    var uniq = function (a) { return a.filter(function (m, i) { return m != null && a.indexOf(m) === i; }); };
    var makes = uniq(CARS.map(function (c) { return c.make; })).sort();
    mk.insertAdjacentHTML('beforeend', makes.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join(''));
    var YEARS = [['2020-2026', '2020 and newer'], ['2015-2019', '2015 – 2019'], ['2010-2014', '2010 – 2014']];
    var years = YEARS.map(function (y) { return y[0]; });
    function inYear(c, v) { var p = v.split('-'); return c.year >= +p[0] && c.year <= +p[1]; }
    function yearText(v) { return YEARS.filter(function (y) { return y[0] === v; })[0][1]; }
    yr.innerHTML = '<option value="">Any year</option>' + YEARS.map(function (y) { return '<option value="' + y[0] + '">' + y[1] + '</option>'; }).join('');
    var mi = $('[data-inv-mi]');
    mi.innerHTML = MILES.map(function (m) { return '<option value="' + m[0] + '">' + (m[0] ? m[1] : 'Any mileage') + '</option>'; }).join('');
    function models() {
      var l = uniq(CARS.filter(function (c) { return c.make === st.make; }).map(function (c) { return c.model; })).sort();
      md.innerHTML = '<option value="">' + (st.make ? 'All models' : 'Choose a make first') + '</option>' + l.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      md.disabled = !st.make; md.value = st.model;
    }
    var DDS = [], X = '';
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
        var o = sel.options[sel.selectedIndex]; $('.inv__val', btn).innerHTML = o && sel.value && sel.value !== 'featured' && cell.dataset.ddLabel !== 'Sort by' ? esc(o.text) + '<span class="inv__vx" data-vx>' + X + '</span>' : esc(o ? o.text : '');
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
      btn.addEventListener('click', function (e) { if (e.target.closest('[data-vx]')) { close(); sel.value = ''; sel.dispatchEvent(new Event('change', { bubbles: true })); refresh(); return; } if (menu.hidden) open(); else close(); });
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
    var adv = $('[data-inv-adv]');
    adv.innerHTML =
      Object.keys(FACETS).map(function (k) {
        var vals = uniq(CARS.map(FACETS[k][1]));
        if (k === 'color') vals = COLOURS.map(function (c) { return c[0]; }).filter(function (c) { return vals.indexOf(c) > -1; }); else vals.sort();
        return '<div class="inv__grp inv__grp--' + k + '"><p class="inv__grp-h">' + FACETS[k][0] + '</p><div class="inv__grp-c">' + vals.map(function (v) {
          return '<button type="button" class="chip chip--s" data-facet="' + k + '" data-v="' + esc(v) + '" aria-pressed="false">' + esc(v) + '</button>'; }).join('') + '</div></div>';
      }).join('');
    var pmin = $('[data-pmin]'), pmax = $('[data-pmax]'), pval = $('[data-inv-pval]'), pbtn = $('[data-inv-pbtn]'), pop = $('[data-inv-pop]');
    pmin.max = pmax.max = LAST;
    function paintPrice() {
      pmin.value = st.lo; pmax.value = st.hi;
      $('[data-pfill]').style.cssText = 'left:' + (st.lo / LAST * 100) + '%;right:' + (100 - st.hi / LAST * 100) + '%';
      $('[data-pmin-l]').textContent = st.lo ? kM(STEPS[st.lo]) : 'No min';
      $('[data-pmax-l]').textContent = st.hi === LAST ? 'No max' : kM(STEPS[st.hi]);
      var pset = st.lo > 0 || st.hi < LAST; pval.textContent = pset ? plabel(st.lo, st.hi) : 'Any price'; pbtn.parentNode.classList.toggle('is-set', pset);
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
        if (st.year && !inYear(c, st.year)) return false;
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
    X = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false"><path d="M1 1l8 8M9 1L1 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    function render(push) {
      var list = results();
      var r4 = 4 - list.length % 4, r3 = 3 - list.length % 3, r2 = 2 - list.length % 2;
      grid.innerHTML = list.map(tile).join('') + (list.length ? '<li class="tile ask" style="--s4:' + r4 + ';--s3:' + r3 + ';--s2:' + r2 + '"><img src="assets/img/showrooms/ask.webp" alt="" loading="lazy" decoding="async">' +
        '<div class="ask__t"><p class="ask__k">Not seeing it?</p><h2 class="ask__h">Ask a showroom</h2><p class="ask__p">Three showrooms — Southern California, Naples and Miami.</p><a class="button" href="#showrooms">Contact a showroom ' + Site.arr + '</a></div></li>' : '');
      count.textContent = list.length + (list.length === 1 ? ' car' : ' cars');
      var T = [['saved', st.saved && 'Saved', 'Saved'], ['room', st.room && ROOMS[st.room].name, 'Showroom'], ['year', st.year && yearText(st.year), 'Year'], ['make', st.make, 'Make'],
        ['model', st.model, 'Model'], ['price', (st.lo || st.hi < LAST) && plabel(st.lo, st.hi), 'Price'],
        ['mi', st.mi && MILES.filter(function (m) { return m[0] === st.mi; })[0][1] + ' mi', 'Mileage']];
      Object.keys(FACETS).forEach(function (k) { st[k].forEach(function (v) { T.push([k + ':' + v, v, FACETS[k][0]]); }); });
      T.push(['q', st.q.trim() && '“' + st.q.trim() + '”', 'Keyword']);
      T = T.filter(function (t) { return t[1]; });
      var F = T.filter(function (t) { return !/^(year|make|model|price|mi|room|saved)$/.test(t[0]); });
      tags.innerHTML = F.map(function (t) { return '<li><button type="button" class="inv__tag" data-tag="' + esc(t[0]) + '" aria-label="Remove ' + t[2] + ': ' + esc(t[1]) + '">' + esc(t[1]) + X + '</button></li>'; }).join('');
      tags.hidden = !F.length;
      var dirty = !!(T.length || st.sort !== 'featured');
      $('.inv__meta [data-inv-clear]').hidden = !dirty;
      empty.hidden = list.length > 0; grid.hidden = !list.length;
      $$('.chip[data-room]', rooms).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.room === st.room ? 'true' : 'false'); });
      $$('[data-mi]', adv).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mi === st.mi ? 'true' : 'false'); });
      $$('[data-facet]', adv).forEach(function (b) { b.setAttribute('aria-pressed', st[b.dataset.facet].indexOf(b.dataset.v) > -1 ? 'true' : 'false'); });
      paintSaved();
      DDS.forEach(function (d) { d.refresh(); });
      var nAdv = st.body.length + st.trans.length + st.drive.length + st.color.length;
      $('[data-inv-mcount]').textContent = nAdv ? ' · ' + nAdv : '';
      var nf = [st.year, st.make, st.model, st.q.trim(), st.mi, st.lo || st.hi < LAST].filter(Boolean).length + nAdv;
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
      var next = tags.querySelector('.inv__tag'); if (next) next.focus();
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
    var ft = $('[data-inv-ftoggle]'), fg = $('#inv-filters');
    ft.addEventListener('click', function () { var o = !fg.classList.contains('is-open'); fg.classList.toggle('is-open', o); ft.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    function syncInputs() { mk.value = st.make; yr.value = st.year; mi.value = st.mi; so.value = st.sort; q.value = st.q; models(); }
    mk.addEventListener('change', function () { st.make = mk.value; st.model = ''; models(); render(true); });
    md.addEventListener('change', function () { st.model = md.value; render(true); });
    mi.addEventListener('change', function () { st.mi = mi.value; render(true); });
    yr.addEventListener('change', function () { st.year = yr.value; render(true); });
    so.addEventListener('change', function () { st.sort = so.value; render(true); });
    var qt; q.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { st.q = q.value; render(true); }, 160); });
    $$('[data-inv-clear]').forEach(function (b) { b.addEventListener('click', function () { st = fresh(); paintPrice(); syncInputs(); render(true); }); });
    if (makes.indexOf(st.make) < 0) st.make = '';
    if (years.indexOf(st.year) < 0) st.year = '';
    syncInputs();
    dd($('.inv__cell--year'), function (v) { return CARS.filter(function (c) { return inYear(c, v); }).length; });
    dd($('.inv__cell--mi'), function (v) { return CARS.filter(function (c) { return c.miles != null && c.miles < +v; }).length; });
    dd($('.inv__cell--make'), countBy(function (c) { return c.make; }));
    dd($('.inv__cell--model'), function (v) { return CARS.filter(function (c) { return c.make === st.make && c.model === v; }).length; });
    dd($('.inv__cell--sort'), null);
    paintPrice(); render(false);
    var bar = $('[data-inv-bar]');
    if ('IntersectionObserver' in window) {
      var s = document.createElement('div'); s.className = 'inv__sentinel'; bar.parentNode.insertBefore(s, bar);
      new IntersectionObserver(function (es) { bar.classList.toggle('is-stuck', !es[0].isIntersecting); }, { rootMargin: '-129px 0px 0px 0px' }).observe(s);
    }
  })();
}, function () {
  var box = document.querySelector('[data-inv-empty]'); if (!box) return;
  box.querySelector('.disp').textContent = 'The inventory didn’t load';
  box.querySelector('.inv__empty-t').textContent = 'Check the connection and try again.';
  var b = box.querySelector('button'); b.textContent = 'Try again'; b.addEventListener('click', function () { location.reload(); });
  box.hidden = false; document.querySelector('[data-inv-bar]').hidden = true; document.querySelector('.inv__sub').hidden = true;
});
