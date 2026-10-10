/* inventory.html — filters, sort, URL state, sheet. Data: window.SELECT_INVENTORY (assets/data/inventory.js,
   generated). URL params: make, model, q, showroom (socal|miami|naples), sort (newest|price-desc|price-asc|miles).
   No Year filter, by brief. Every change re-renders and writes the URL; back/forward restore the state.
   Without JS the page shows the full static list (filled by _build/inventory_data.py) and the form submits as GET. */
(function () {
  'use strict';
  var DATA = window.SELECT_INVENTORY;
  if (!DATA) return;
  var ALL = DATA.listings;
  var PAGE = 24;
  var SORTS = ['price-desc', 'price-asc', 'miles', 'newest'];
  var DEF_SORT = 'price-desc';   // an exotic inventory reads from the top of the range; also the order with the fewest unphotographed cars first
  var ROOMS = {}; DATA.rooms.forEach(function (r) { ROOMS[r.key] = r; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cmp = function (a, b) { return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }); };

  var form = $('[data-form]'), grid = $('[data-grid]');
  var F = { showroom: $('#f-room'), make: $('#f-make'), model: $('#f-model'), q: $('#f-q'), sort: $('#f-sort') };
  var state = { make: '', model: '', q: '', showroom: '', sort: DEF_SORT };
  var shown = PAGE;

  /* ---------- state <-> URL ---------- */
  function readURL() {
    var p = new URLSearchParams(location.search);
    var s = {
      make: p.get('make') || '', model: p.get('model') || '', q: (p.get('q') || '').trim(),
      showroom: (p.get('showroom') || '').toLowerCase(), sort: p.get('sort') || DEF_SORT
    };
    if (!ROOMS[s.showroom]) s.showroom = '';
    if (SORTS.indexOf(s.sort) === -1) s.sort = DEF_SORT;
    // case-tolerant make/model (links typed by hand); unknown values are dropped, not guessed
    var mk = ALL.filter(function (r) { return r.make.toLowerCase() === s.make.toLowerCase(); })[0];
    s.make = mk ? mk.make : '';
    var mo = ALL.filter(function (r) { return r.model.toLowerCase() === s.model.toLowerCase() && (!s.make || r.make === s.make); })[0];
    s.model = mo ? mo.model : '';
    if (s.model && !s.make) s.make = mo.make;
    return s;
  }
  function writeURL(push) {
    var p = new URLSearchParams();
    ['showroom', 'make', 'model', 'q'].forEach(function (k) { if (state[k]) p.set(k, state[k]); });
    if (state.sort !== DEF_SORT) p.set('sort', state.sort);
    var url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    if (url === location.pathname + location.search) return;
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  /* ---------- filtering ---------- */
  function words(q) { return q.toLowerCase().split(/\s+/).filter(Boolean); }
  function hay(r) {
    return r._h || (r._h = [r.year, r.make, r.model, r.title, r.colour, r.transmission, r.drivetrain, r.vin, r.stock, r.roomName, r.id]
      .filter(Boolean).join(' ').toLowerCase());
  }
  function match(r, s, skip) {
    if (skip !== 'showroom' && s.showroom && r.room !== s.showroom) return false;
    if (skip !== 'make' && s.make && r.make !== s.make) return false;
    if (skip !== 'model' && s.model && r.model !== s.model) return false;
    if (skip !== 'q') { var h = hay(r), w = words(s.q); for (var i = 0; i < w.length; i++) if (h.indexOf(w[i]) === -1) return false; }
    return true;
  }
  function sorted(list) {
    var by = {
      'newest': function (a, b) { return +b.id - +a.id; },
      'price-desc': function (a, b) { return (b.price || -1) - (a.price || -1) || +b.id - +a.id; },
      'price-asc': function (a, b) { return (a.price || Infinity) - (b.price || Infinity) || +b.id - +a.id; },
      'miles': function (a, b) { return (a.miles == null ? Infinity : a.miles) - (b.miles == null ? Infinity : b.miles) || +b.id - +a.id; }
    }[state.sort];
    return list.slice().sort(by);
  }

  /* ---------- controls: options with live counts ---------- */
  function fillSelect(sel, values, allLabel, counts) {
    var keep = sel.value;
    sel.innerHTML = '';
    var o = document.createElement('option'); o.value = ''; o.textContent = allLabel; sel.appendChild(o);
    values.forEach(function (v) {
      var parent = sel;
      var op = document.createElement('option'); op.value = v;
      op.textContent = v + ' (' + (counts[v] || 0) + ')';
      if (!counts[v]) op.disabled = true;
      parent.appendChild(op);
    });
    sel.value = keep;
  }
  function syncControls() {
    // makes: counted under the other active filters (so a count is what you will get)
    var makes = {}, noModel = Object.assign({}, state, { model: '' });
    ALL.forEach(function (r) { if (match(r, noModel, 'make')) makes[r.make] = (makes[r.make] || 0) + 1; });
    var makeList = Object.keys(ALL.reduce(function (a, r) { a[r.make] = 1; return a; }, {})).sort(cmp);
    fillSelect(F.make, makeList, 'All makes', makes);
    // models: only the chosen make's (filtered by Make), grouped by make otherwise
    var pairs = {};
    ALL.forEach(function (r) { if (!state.make || r.make === state.make) pairs[r.make + '\u0000' + r.model] = 1; });
    var modelVals = Object.keys(pairs).sort(function (a, b) { return cmp(a, b); });
    var keepModel = state.model;
    F.model.innerHTML = '';
    var o = document.createElement('option'); o.value = ''; o.textContent = 'All models'; F.model.appendChild(o);
    var groups = {};
    modelVals.forEach(function (k) {
      var mk = k.split('\u0000')[0], mo = k.split('\u0000')[1], parent = F.model;
      if (!state.make) { if (!groups[mk]) { groups[mk] = document.createElement('optgroup'); groups[mk].label = mk; F.model.appendChild(groups[mk]); } parent = groups[mk]; }
      var n = ALL.filter(function (r) { return r.make === mk && r.model === mo && match(r, state, 'model') && (!state.make || r.make === state.make); }).length;
      var op = document.createElement('option'); op.value = mo; op.textContent = mo + ' (' + n + ')';
      if (!n && mo !== keepModel) op.disabled = true;
      parent.appendChild(op);
    });
    F.make.value = state.make; F.model.value = state.model;
    if (document.activeElement !== F.q) F.q.value = state.q;
    F.showroom.value = state.showroom; F.sort.value = state.sort;
    $$('.ff__f').forEach(function (f) {
      var c = f.querySelector('select, input'); f.classList.toggle('is-set', !!(c && c.value));
    });
    $$('[data-room]').forEach(function (a) {
      if (a.getAttribute('data-room') === state.showroom) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- cards ---------- */
  function card(r) {
    var media = r.img
      ? '<img src="' + esc(r.img) + '" srcset="' + esc(r.img640) + ' 640w, ' + esc(r.img) + ' ' + r.imgW + 'w" sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" width="960" height="640" loading="lazy" decoding="async" alt="' + esc(r.title) + '">'
      : '<span class="vc__none"><span class="vc__none-n">' +
        (r.noPhoto === 'none-published' ? '[No photos published on the listing yet]' : '[Photos on the duPont REGISTRY listing]') + '</span></span>';
    var specs = [r.miles != null ? r.miles.toLocaleString('en-US') + ' mi' : null, r.transmission, r.colour]
      .filter(Boolean).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    return '<li class="vc" data-id="' + r.id + '"><a class="vc__a" href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
      '<span class="vc__media">' + media + '<span class="vc__room">' + esc(r.roomName) + '</span></span>' +
      '<span class="vc__body"><span class="vc__eyebrow">' + r.year + ' · ' + esc(r.make) + '</span>' +
      '<span class="vc__title">' + esc(r.model) + '</span><ul class="vc__specs">' + specs + '</ul>' +
      '<span class="vc__foot"><span class="vc__price">' + (r.priceText ? esc(r.priceText) : 'Price on listing') + '</span>' +
      '<span class="vc__go">View listing <span aria-hidden="true">↗</span><span class="sr"> — ' + esc(r.title) + ' on duPont REGISTRY, opens in a new tab</span></span></span>' +
      '</span></a></li>';
  }

  /* ---------- render ---------- */
  var current = [];
  function render(keepPage) {
    if (!keepPage) shown = PAGE;
    current = sorted(ALL.filter(function (r) { return match(r, state); }));
    var n = current.length;
    grid.innerHTML = current.slice(0, shown).map(card).join('');
    grid.hidden = n === 0;
    $('[data-count]').textContent = n;
    $('[data-count-w]').textContent = n === 1 ? 'car' : 'cars';
    var scope = [];
    if (state.showroom) scope.push('in ' + ROOMS[state.showroom].name);
    if (state.make || state.model) scope.push([state.make, state.model].filter(Boolean).join(' '));
    if (state.q) scope.push('matching “' + state.q + '”');
    $('[data-scope]').textContent = scope.length ? ' · ' + scope.join(' · ') : ' · all showrooms';
    var any = !!(state.showroom || state.make || state.model || state.q);
    $$('[data-reset]').forEach(function (b) { if (b.classList.contains('res__clear')) b.hidden = !any; });
    var empty = $('[data-empty]');
    empty.hidden = n !== 0;
    if (n === 0) {
      var what = [state.make, state.model].filter(Boolean).join(' ');
      $('[data-empty-q]').textContent = [what, state.q ? '“' + state.q + '”' : '', state.showroom ? 'in ' + ROOMS[state.showroom].name : '']
        .filter(Boolean).join(' ') || 'these filters';
      var widen = $('[data-widen]');
      var elsewhere = state.showroom ? ALL.filter(function (r) { return match(r, state, 'showroom'); }).length : 0;
      widen.hidden = !elsewhere;
      if (elsewhere) widen.textContent = 'See ' + elsewhere + (elsewhere === 1 ? ' match' : ' matches') + ' in other showrooms';
    }
    var more = $('[data-more-wrap]');
    more.hidden = n <= shown;
    if (n > shown) {
      $('[data-more-n]').textContent = 'Showing ' + Math.min(shown, n) + ' of ' + n;
      $('[data-more]').textContent = 'Show ' + Math.min(PAGE, n - shown) + ' more';
    }
    var badgeN = ['showroom', 'make', 'model', 'q'].filter(function (k) { return state[k]; }).length;
    var badge = $('[data-badge]'); badge.hidden = !badgeN; badge.textContent = badgeN;
    $('[data-apply-n]').textContent = n;
    $('[data-apply]').lastChild.textContent = n === 1 ? ' car' : ' cars';
    syncControls();
  }

  function set(patch, push) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    // a model belongs to one make: keep them coherent
    if (patch.make !== undefined && state.model && !ALL.some(function (r) { return r.make === state.make && r.model === state.model; })) state.model = '';
    if (patch.model && !state.make) { var hit = ALL.filter(function (r) { return r.model === patch.model; })[0]; if (hit) state.make = hit.make; }
    writeURL(push);
    render();
  }
  function reset() { set({ make: '', model: '', q: '', showroom: '' }, true); }

  /* ---------- wiring ---------- */
  F.make.addEventListener('change', function () { set({ make: F.make.value }, true); });
  F.model.addEventListener('change', function () { set({ model: F.model.value }, true); });
  F.showroom.addEventListener('change', function () { set({ showroom: F.showroom.value }, true); });
  F.sort.addEventListener('change', function () { set({ sort: F.sort.value }, true); });
  var t = 0;
  F.q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { set({ q: F.q.value.trim() }, false); }, 160); });
  form.addEventListener('submit', function (e) { e.preventDefault(); set({ q: F.q.value.trim() }, true); closeSheet(); });
  $$('[data-reset]').forEach(function (b) { b.addEventListener('click', reset); });
  $$('[data-room]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); set({ showroom: a.getAttribute('data-room') }, true); });
  });
  $('[data-widen]').addEventListener('click', function (e) { e.preventDefault(); set({ showroom: '' }, true); });
  $('[data-more]').addEventListener('click', function () {
    var first = shown; shown += PAGE; render(true);
    var next = grid.children[first]; if (next) { var a = next.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
  });
  window.addEventListener('popstate', function () { state = readURL(); render(); });

  /* ---------- the sheet (phones) ---------- */
  var openBtn = $('[data-open]'), lastFocus = null;
  var mqSheet = window.matchMedia('(max-width: 767px)');
  function openSheet() {
    lastFocus = document.activeElement;
    form.classList.add('is-open'); openBtn.setAttribute('aria-expanded', 'true');
    form.setAttribute('role', 'dialog'); form.setAttribute('aria-modal', 'true');
    document.documentElement.classList.add('srp-sheet-open');
    var l = window.Select && window.Select.lenis; if (l) l.stop();
    $('[data-close]').focus();
  }
  function closeSheet() {
    if (!form.classList.contains('is-open')) return;
    form.classList.remove('is-open'); openBtn.setAttribute('aria-expanded', 'false');
    form.setAttribute('role', 'search'); form.removeAttribute('aria-modal');
    document.documentElement.classList.remove('srp-sheet-open');
    var l = window.Select && window.Select.lenis; if (l) l.start();
    (lastFocus || openBtn).focus();
  }
  openBtn.addEventListener('click', openSheet);
  $('[data-close]').addEventListener('click', closeSheet);
  $('[data-apply]').addEventListener('click', function () {
    set({ q: F.q.value.trim() }, false); closeSheet();
    var res = $('#results'); var y = res.getBoundingClientRect().top + window.scrollY - (document.querySelector('.hdr').offsetHeight + $('[data-fbar]').offsetHeight);
    window.scrollTo(0, Math.max(0, y));
  });
  form.addEventListener('keydown', function (e) {
    if (!form.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button, select, input', form).filter(function (x) { return x.offsetParent !== null && !x.disabled; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  (mqSheet.addEventListener ? mqSheet.addEventListener.bind(mqSheet, 'change') : mqSheet.addListener.bind(mqSheet))(function (m) { if (!m.matches) closeSheet(); });

  /* the keyword cell is narrow in the 768–1023 bar: a shorter example there */
  var mqMid = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
  var ph = function () { F.q.placeholder = mqMid.matches ? 'e.g. Spyder' : 'Model, colour, VIN…'; };
  ph(); (mqMid.addEventListener ? mqMid.addEventListener.bind(mqMid, 'change') : mqMid.addListener.bind(mqMid))(ph);

  /* ---------- go ---------- */
  state = readURL();
  writeURL(false);
  render();
  document.documentElement.setAttribute('data-srp', 'ready');
})();
