/* =============================================================================
   V4 copy of V1 srp.js (unchanged logic). SRP — Make · Model · Sort by · Keyword (no Year filter), working on window.DRS
   (generated from data/inventory.json, inlined so it also runs from file://).
   URL params: ?showroom=socal|naples|miami &make= &model= &sort= &q=
   Tier 1: photographed cars as plates. Tier 2: listed cars without photography
   as typeset records ("Photography in preparation") — never another car's photo.
   ============================================================================= */
(function () {
  'use strict';
  if (!window.DRS || !window.DRSUtil) return;
  var U = window.DRSUtil, ASOF = window.DRS.meta.asOf;
  var ALL = window.DRS.listings.map(function (c, i) { c._i = i; return c; });
  var $ = function (s) { return document.querySelector(s); };
  var form = $('[data-filters]'), fMake = $('#f-make'), fModel = $('#f-model'), fSort = $('#f-sort'), fQ = $('#f-q'), fShow = $('#f-showroom');
  var grid = $('[data-grid]'), recs = $('[data-records]'), recWrap = $('[data-records-wrap]'), empty = $('[data-empty]');
  var chips = $('[data-chips]'), line = $('[data-result-line]'), status = $('[data-status]');
  var SHOW = U.SHOW;

  var st = { showroom: '', make: '', model: '', sort: 'featured', q: '' };
  var p = new URLSearchParams(location.search);
  ['showroom', 'make', 'model', 'sort', 'q'].forEach(function (k) { if (p.get(k)) st[k] = p.get(k); });
  if (!SHOW[st.showroom]) st.showroom = '';

  function inScope(c, ignore) {
    if (st.showroom && c.loc !== st.showroom) return false;
    if (ignore !== 'make' && st.make && c.make !== st.make) return false;
    if (ignore !== 'model' && ignore !== 'make' && st.model && c.model !== st.model) return false;
    if (st.q) {
      var hay = [c.title, c.make, c.model, c.trim, c.ext, c.int, SHOW[c.loc], c.dealer.city].join(' ').toLowerCase();
      var ok = st.q.toLowerCase().split(/\s+/).filter(Boolean).every(function (t) { return hay.indexOf(t) > -1; });
      if (!ok) return false;
    }
    return true;
  }

  function fillMakes() {
    var counts = {};
    ALL.forEach(function (c) { if (inScope(c, 'make')) counts[c.make] = (counts[c.make] || 0) + 1; });
    var total = Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0);
    var makes = Object.keys(counts).sort();
    if (st.make && !counts[st.make]) makes.push(st.make), counts[st.make] = 0, makes.sort();
    fMake.innerHTML = '<option value="">All makes (' + total + ')</option>' + makes.map(function (m) {
      return '<option value="' + U.esc(m) + '"' + (m === st.make ? ' selected' : '') + '>' + U.esc(m) + ' (' + counts[m] + ')</option>';
    }).join('');
  }
  function fillModels() {
    if (!st.make) { fModel.innerHTML = '<option value="">Choose a make first</option>'; fModel.disabled = true; st.model = ''; return; }
    var counts = {};
    ALL.forEach(function (c) { if (c.make === st.make && inScope(c, 'model')) counts[c.model] = (counts[c.model] || 0) + 1; });
    var models = Object.keys(counts).sort();
    if (st.model && !counts[st.model]) st.model = '';
    fModel.disabled = false;
    fModel.innerHTML = '<option value="">All ' + U.esc(st.make) + ' models</option>' + models.map(function (m) {
      return '<option value="' + U.esc(m) + '"' + (m === st.model ? ' selected' : '') + '>' + U.esc(m) + ' (' + counts[m] + ')</option>';
    }).join('');
  }

  var SORTS = {
    featured: function (a, b) { return a._i - b._i; },
    'price-desc': function (a, b) { return (b.price || -1) - (a.price || -1); },
    'price-asc': function (a, b) { return (a.price || Infinity) - (b.price || Infinity); },
    'miles-asc': function (a, b) { return (a.miles == null ? Infinity : a.miles) - (b.miles == null ? Infinity : b.miles); },
    newest: function (a, b) { return String(b.listed).localeCompare(String(a.listed)); }
  };

  function plate(c) {
    return '<li><a class="plate" href="' + U.esc(c.url) + '" data-car="' + c.id + '" target="_blank" rel="noopener">' +
      '<span class="plate__img">' + U.pic(c.img, '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw', c.title + ', as photographed for its listing') + '</span>' +
      '<span class="plate__facts"><span class="plate__title">' + U.esc(c.title) + '</span>' +
      '<span class="plate__meta">' + U.money(c.price) + ' · ' + U.miles(c.miles) + ' · ' + SHOW[c.loc] + '</span></span>' +
      '<span class="vh"> — details</span></a></li>';
  }
  function record(c) {
    return '<li class="rec"><a href="' + U.esc(c.url) + '" data-car="' + c.id + '" target="_blank" rel="noopener">' +
      '<span class="rec__title">' + U.esc(c.title) + '</span>' +
      '<span class="rec__meta t-num">' + U.miles(c.miles) + '</span>' +
      '<span class="rec__meta t-num">' + U.money(c.price) + '</span>' +
      '<span class="rec__meta">' + SHOW[c.loc] + '</span>' +
      '<span class="rec__go">Details</span></a></li>';
  }

  function render(push) {
    fillMakes(); fillModels();
    fSort.value = SORTS[st.sort] ? st.sort : 'featured';
    if (document.activeElement !== fQ) fQ.value = st.q;
    fShow.value = st.showroom;
    var list = ALL.filter(function (c) { return inScope(c); }).sort(SORTS[st.sort] || SORTS.featured);
    var withImg = list.filter(function (c) { return c.img; }), without = list.filter(function (c) { return !c.img; });
    grid.innerHTML = withImg.map(plate).join('');
    recs.innerHTML = without.map(record).join('');
    grid.hidden = !withImg.length;
    recWrap.hidden = !without.length;
    empty.hidden = list.length > 0;

    var where = st.showroom ? ' in ' + SHOW[st.showroom] : '';
    line.textContent = list.length + (list.length === 1 ? ' car' : ' cars') + where + ' · as of ' + ASOF;
    status.textContent = withImg.length + ' with photography · ' + without.length + ' more listed';

    var c = [];
    if (st.showroom) c.push(['showroom', 'Showroom: ' + SHOW[st.showroom]]);
    if (st.make) c.push(['make', 'Make: ' + st.make]);
    if (st.model) c.push(['model', 'Model: ' + st.model]);
    if (st.q) c.push(['q', 'Keyword: ' + st.q]);
    chips.innerHTML = c.map(function (x) {
      return '<button type="button" class="chip" data-unset="' + x[0] + '">' + U.esc(x[1]) + ' <span aria-hidden="true">×</span><span class="vh"> — remove</span></button>';
    }).join('') + (c.length > 1 ? '<button type="button" class="chip chip--clear" data-clear>Clear all</button>' : '');
    chips.hidden = !c.length;

    var q = new URLSearchParams();
    Object.keys(st).forEach(function (k) { if (st[k] && !(k === 'sort' && st[k] === 'featured')) q.set(k, st[k]); });
    var url = location.pathname + (q.toString() ? '?' + q : '');
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  fMake.addEventListener('change', function () { st.make = fMake.value; st.model = ''; render(true); });
  fModel.addEventListener('change', function () { st.model = fModel.value; render(true); });
  fSort.addEventListener('change', function () { st.sort = fSort.value; render(true); });
  var t = 0;
  fQ.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = fQ.value.trim(); render(false); }, 160); });
  form.addEventListener('submit', function (e) { e.preventDefault(); st.q = fQ.value.trim(); render(true); });
  document.addEventListener('click', function (e) {
    var u = e.target.closest('[data-unset]');
    if (u) { var k = u.getAttribute('data-unset'); st[k] = ''; if (k === 'make') st.model = ''; render(true); return; }
    if (e.target.closest('[data-clear]')) { st.showroom = st.make = st.model = st.q = ''; render(true); fMake.focus(); }
  });
  window.addEventListener('popstate', function () {
    var p2 = new URLSearchParams(location.search);
    ['showroom', 'make', 'model', 'q'].forEach(function (k) { st[k] = p2.get(k) || ''; });
    st.sort = p2.get('sort') || 'featured';
    render(false);
  });
  render(false);
})();
/* short placeholder where the field is narrow */
(function () {
  var q = document.getElementById('f-q'); if (!q) return;
  var mq = window.matchMedia('(max-width: 767.98px)');
  function set() { q.placeholder = mq.matches ? 'Model or keyword' : 'Make, model or keyword'; }
  mq.addEventListener('change', set); set();
})();
