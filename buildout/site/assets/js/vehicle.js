/* Vehicle page (VDP): car.html?id=… */
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
  function gone(title, text) {
    document.title = title + ' — duPont REGISTRY Select';
    document.querySelector('[data-vdp]').innerHTML = '<div class="inv__empty vdp__gone" role="status"><h1 class="vdp__h">' + title + '</h1><p class="inv__empty-t">' + text + '</p><a class="button" href="inventory.html">See all cars</a></div>';
  }
  var vdp = $('[data-vdp]');
  if (vdp) (function () {
    var id = new URLSearchParams(location.search).get('id');
    var c = BY[id];
    if (!c) { gone('This car is no longer listed', 'It may have been sold, or the link may be out of date.'); return; }
    var R = ROOMS[c.loc];
    document.title = c.title + ' — duPont REGISTRY Select';
    var gal = c.gallery ? c.gallery.map(function (g) { return { big: g + '-1920.webp', small: g + '-480.webp' }; })
                        : c.img.map(function (g) { return { big: g + '-1200.webp', small: g + '-640.webp' }; });
    $('[data-vdp-crumb]').textContent = c.title;
    var rl = $('[data-vdp-room-link]'); rl.textContent = R.name; rl.href = 'inventory.html?showroom=' + c.loc;
    $('[data-vdp-room]').textContent = R.name;
    $('[data-vdp-title]').textContent = c.title;
    $('[data-vdp-price]').textContent = money(c.price);
    $('[data-vdp-pricing]').innerHTML = (c.docFee ? '<span class="t-num">' + money(c.basePrice) + ' + ' + money(c.docFee) + ' doc fee</span>' : '<span>Taxes and registration extra</span>') +
      '<button type="button" class="vdp__pinfo" aria-expanded="false" aria-controls="vdp-pnote" aria-label="Pricing details" data-vdp-pdet>i</button>';
    if (!c.price) { var pc = $('[data-vdp-paycell]'); if (pc) pc.hidden = true; }
    var pdet = $('[data-vdp-pdet]'), pnote = $('[data-vdp-pnote]');
    pdet.addEventListener('click', function () { var o = pnote.hidden; pnote.hidden = !o; pdet.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    var quick = [['Mileage', c.miles != null ? c.miles.toLocaleString('en-US') + ' mi' : null], ['Exterior', c.ext], ['Interior', c.int], ['Transmission', c.trans], ['Drivetrain', c.drive], ['Engine', c.engine], ['Body', c.body]]
      .filter(function (r) { return r[1]; }).slice(0, 5);
    var inPanel = {}; quick.forEach(function (r) { inPanel[r[0]] = 1; });
    $('[data-vdp-quick]').innerHTML = quick.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') +
      (c.vin ? '<div class="vdp__q-vin"><dt>VIN</dt><dd class="t-num vdp__vin">' + esc(c.vin) + '</dd></div>' : '') +
      (c.stock ? '<div><dt>Stock #</dt><dd class="t-num vdp__vin">' + esc(c.stock) + '</dd></div>' : '') +
      '<div class="vdp__q-cf"><dt>History</dt><dd><button class="vdp__carfax" type="button" data-vdp-carfax aria-expanded="false" aria-controls="vdp-carfax-note">' +
      '<img class="vdp__carfax-logo" src="assets/img/brand/carfax.svg" width="127" height="30" alt="CARFAX"><span>Report</span></button></dd></div>';
    $('[data-vdp-call]').innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6.6 2.5H4.2A1.7 1.7 0 0 0 2.5 4.3c.3 7.1 6.1 12.9 13.2 13.2a1.7 1.7 0 0 0 1.8-1.7v-2.4l-3.4-1.4-1.6 1.6a10.7 10.7 0 0 1-4.9-4.9l1.6-1.6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg><span class="t-num vdp__call-n">' + esc(R.phone) + '</span><span class="vdp__call-w">Call</span>';
    $('[data-vdp-call]').setAttribute('aria-label', 'Call ' + R.phone);
    var cfb = $('[data-vdp-carfax]'), cfn = $('[data-vdp-carfax-note]');
    if (cfb && cfn) {
      cfn.innerHTML = 'The CARFAX Vehicle History Report for this car is provided by the showroom on request. <span class="vdp__ph">Placeholder — dealer CARFAX link goes here.</span>';
      cfb.addEventListener('click', function () { var o = cfn.hidden; cfn.hidden = !o; cfb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    }
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
    var eng = c.engine || '', hp = /(\d[\d,]*)\s*hp\b/i.exec(eng), lit = /^(\d+(?:\.\d+)?)\s*L\b[\s,]*/i.exec(eng);
    var engRest = lit ? eng.slice(lit[0].length).replace(/,?\s*\d[\d,]*\s*hp\b.*$/i, '').trim() : '';
    var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
    var DRV = { 'rear-wheel drive': 'RWD', 'all-wheel drive': 'AWD', 'front-wheel drive': 'FWD', 'four-wheel drive': '4WD' };
    var drvCode = c.drive && DRV[c.drive.toLowerCase()];
    var figs = [];
    if (hp) figs.push([hp[1], 'hp', /combined/i.test(eng) ? 'Power, combined' : 'Power']);
    if (lit) figs.push([lit[1], 'L', 'Displacement']);
    var NUM = { four: 4, six: 6, eight: 8, ten: 10, twelve: 12 };
    var cyl = /\b[VW](\d{1,2})\b/.exec(eng) || /\bflat[- ](four|six)\b/i.exec(eng);
    var cylN = cyl && (NUM[cyl[1].toLowerCase()] || +cyl[1]);
    if (cylN) figs.push([String(cylN), 'cyl', engRest ? cap(engRest.replace(/,\s*$/, '')) : 'Cylinders']);
    var driveFig = figs.length < 4 && drvCode && !inPanel.Drivetrain;
    if (driveFig) figs.push([drvCode, '', c.drive]);
    if (!figs.length && c.year) figs.push([String(c.year), '', 'Model year']);
    var figEl = $('[data-vdp-figs]');
    figEl.hidden = !figs.length;
    figEl.dataset.n = figs.length;
    figEl.innerHTML = figs.map(function (f) {
      return '<li class="vdp__fig"><span class="vdp__fig-n">' + esc(f[0]) + (f[1] ? '<small>' + f[1] + '</small>' : '') +
        '</span><span class="vdp__fig-c">' + esc(f[2]) + '</span></li>';
    }).join('');
    var rest = [['Body', c.body], ['Engine', lit ? null : c.engine], ['Exterior', c.ext], ['Interior', c.int],
      ['Transmission', c.trans], ['Drivetrain', driveFig ? null : c.drive]]
      .filter(function (r) { return r[1] && !inPanel[r[0]]; });
    var meta = rest.map(function (r) { return '<li><span>' + r[0] + '</span> ' + esc(r[1]) + '</li>'; });
    if (!c.engine) meta.push('<li class="vdp__meta-note">Engine and performance figures from the showroom on request.</li>');
    $('[data-vdp-spec]').innerHTML = meta.length ? '<ul class="vdp__meta">' + meta.join('') + '</ul>' : '';
    $('[data-vdp-contact]').innerHTML =
      '<figure class="vdp__room-ph"><img src="' + R.img + '" alt="" loading="lazy" decoding="async"></figure>' +
      '<div class="vdp__room-in"><p class="sub__kicker">See it in person</p>' +
      '<h2 class="vdp__h disp" id="vdp-room-h">' + esc(R.name) + '</h2>' +
      '<p class="vdp__room-d">' + esc(R.dealer) + '</p>' +
      '<address class="vdp__room-a">' + R.addr.map(esc).join('<br>') + '</address>' +
      '<dl class="vdp__room-f"><div><dt>Hours</dt><dd>' + esc(R.hours) + '</dd></div><div><dt>Phone</dt><dd class="t-num">' + esc(R.phone) + '</dd></div></dl>' +
      '<div class="vdp__cta vdp__cta--room"><button class="btn btn--red sub__btn" type="button" data-inq-intent="viewing">Schedule a viewing ' + ARR + '</button>' +
      '<a class="btn sub__btn sub__btn--line" href="#vdp-contact">Directions</a></div></div>';
    var more = CARS.filter(function (x) { return x.id !== c.id; })
      .sort(function (a, b) { return (b.loc === c.loc) - (a.loc === c.loc) || (b.price || 0) - (a.price || 0); }).slice(0, 4);
    $('[data-vdp-more]').innerHTML = more.map(tile).join('');
    requestAnimationFrame(function () { $$('[data-vdp-more] .tile').forEach(function (t) { t.classList.add('is-in'); }); });
    var img = $('[data-vdp-img]'), n = $('[data-vdp-n]'), th = $('[data-vdp-thumbs]'), k = 0;
    var vbx = $('[data-vbox]');
    th.innerHTML = gal.map(function (g, i) {
      return '<li><button type="button" data-k="' + i + '" aria-label="Photograph ' + (i + 1) + ' of ' + gal.length + '"><img src="' + g.small + '" alt="" loading="' + (i < 10 ? 'eager' : 'lazy') + '" decoding="async"></button></li>';
    }).join('');
    function pad(x) { return (x < 10 ? '0' : '') + x; }
    function show(i, from) {
      k = (i + gal.length) % gal.length;
      img.src = gal[k].big; img.alt = c.title + ' — photograph ' + (k + 1) + ' of ' + gal.length;
      n.innerHTML = '<b>' + pad(k + 1) + '</b> / ' + pad(gal.length);
      $$('button', th).forEach(function (b) { b.setAttribute('aria-current', +b.dataset.k === k ? 'true' : 'false'); });
      var cur = (th.querySelector('[data-k="' + k + '"]') || {}).parentNode;
      if (cur && from !== 'thumb') th.scrollTo({ left: cur.offsetLeft - th.clientWidth / 2 + cur.offsetWidth / 2, behavior: 'smooth' });
      var pre = new Image(); pre.src = gal[(k + 1) % gal.length].big;
      if (lb && !lb.hidden) lbShow();
    }
    th.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) show(+b.dataset.k, 'thumb'); });
    $('[data-vdp-prev]').addEventListener('click', function () { show(k - 1); });
    $('[data-vdp-next]').addEventListener('click', function () { show(k + 1); });
    var sx = null;
    img.parentElement.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    img.parentElement.addEventListener('pointerup', function (e) { if (sx == null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 50) { show(k + (d < 0 ? 1 : -1)); img.parentElement.dataset.swiped = '1'; } });
    var lb = $('[data-lbox]'), li = $('[data-lbox-img]'), ln = $('[data-lbox-n]');
    function lbShow() { li.src = gal[k].big; li.alt = img.alt; ln.textContent = pad(k + 1) + ' / ' + pad(gal.length); }
    function lbOpen() { lb.hidden = false; lbShow(); document.documentElement.classList.add('lbox-open'); if (Site.lenis) Site.lenis.stop(); $('[data-lbox-close]').focus(); }
    function lbClose() { lb.hidden = true; document.documentElement.classList.remove('lbox-open'); if (Site.lenis) Site.lenis.start(); $('[data-vdp-open]').focus(); }
    $('[data-vdp-open]').addEventListener('click', function (e) { if (this.dataset.swiped) { delete this.dataset.swiped; return; } lbOpen(); });
    $('[data-lbox-close]').addEventListener('click', lbClose);
    $('[data-lbox-prev]').addEventListener('click', function () { show(k - 1); });
    $('[data-lbox-next]').addEventListener('click', function () { show(k + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      var inLb = !lb.hidden;
      if (!iq.hidden) return;
      if (vbx && !vbx.hidden) return;
      if (e.key === 'Escape' && inLb) { lbClose(); return; }
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && (inLb || gal.length)) { e.preventDefault(); show(k + 1); }
      if (e.key === 'ArrowLeft' && (inLb || gal.length)) { e.preventDefault(); show(k - 1); }
    });
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
      if (iqMsg.value === iqAuto) iqMsg.value = INT[k][1];
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
      document.documentElement.classList.add('inq-open'); if (Site.lenis) Site.lenis.stop();
      iqBtn.setAttribute('aria-expanded', 'true');
      setTimeout(function () { var f = iqForm.hidden ? iqDone : iqForm.querySelector('input'); if (f) f.focus({ preventScroll: true }); }, 60);
    }
    function iqClose() {
      if (iq.hidden) return;
      iq.classList.remove('is-open'); iqBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('inq-open'); if (Site.lenis) Site.lenis.start();
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
      Site.emit('inquiry', { carId: c.id, showroom: c.loc, intent: iqIntent, fields: Object.fromEntries(new FormData(iqForm)), replyBy: (($('[data-pref][aria-checked="true"]', iq) || {}).dataset || {}).pref || 'Email' });
      iqForm.hidden = true;
      iqDone.innerHTML = '<p class="inq__done-h disp">Thank you, ' + esc(d.first.value.trim()) + '.</p>' +
        '<p>' + esc(R.dealer) + ' will reply ' + DONE[iqIntent] + ' by ' + ({ Call: 'phone', Text: 'text', Email: 'email' })[(($('[data-pref][aria-checked="true"]', iq) || {}).dataset || {}).pref || 'Email'] + '. If it can\'t wait, call <a class="t-num" href="tel:' + R.phone.replace(/[^\d+]/g, '') + '">' + esc(R.phone) + '</a>.</p>' +
        '<p class="inq__ph">Prototype — nothing was sent.</p>' +
        '<button class="btn sub__btn sub__btn--line" type="button" data-inq-close>Close</button>';
      iqDone.hidden = false; iqDone.focus();
    });
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
      Site.emit('send-to-phone', { carId: c.id, phone: t.value.trim() });
      s2f.hidden = true; s2d.textContent = 'A link to the ' + c.title + ' would go to ' + t.value.trim() + '. Prototype — nothing was sent.'; s2d.hidden = false; s2d.focus();
    });
    document.addEventListener('click', function (e) { if (!s2p.hidden && !e.target.closest('[data-s2p], [data-vdp-text]')) s2pOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !s2p.hidden) { s2pOpen(false); tB.focus(); } });
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
    var sn = $('[data-vdp-sn]'), mb = $('[data-vdp-mb]');
    $('[data-sn-title]').textContent = c.title; $('[data-sn-price]').textContent = c.price ? money(c.price) : '';
    $('[data-mb-call]').textContent = 'Call'; $('[data-mb-call]').href = 'tel:' + R.phone.replace(/[^\d+]/g, '');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { mb.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }, { threshold: 0 }).observe($('.vdp__cta'));
      new IntersectionObserver(function (es) { sn.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.bottom < 160); }, { rootMargin: '-120px 0px 0px 0px' }).observe($('.vehicle-grid'));
      var stk = $('[data-vg6-st]'), hd = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd-h')); };
      var pinCol = function () { stk.style.top = Math.min(hd() + 24, innerHeight - stk.offsetHeight - 24) + 'px'; };
      pinCol(); addEventListener('resize', pinCol); if ('ResizeObserver' in window) new ResizeObserver(pinCol).observe(stk);
      var links = $$('.vdp__sn-l a', sn).filter(function (a) { return !a.parentNode.hidden; }), ticking = false;
      function spy() {
        ticking = false; var cur = null, line = innerHeight * 0.35;
        links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t && t.getBoundingClientRect().top < line) cur = a; });
        links.forEach(function (a) { a.classList.toggle('is-cur', a === cur); if (a === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      }
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true }); spy();
    }
    var vB = $('[data-vdp-vid]'), V = c.video, vfr = $('[data-vbox-frame]'), vLast = null;
    function vClose() {
      if (!vbx || vbx.hidden) return;
      vbx.hidden = true; vfr.innerHTML = ''; document.documentElement.classList.remove('lbox-open');
      if (Site.lenis) Site.lenis.start(); if (vLast) vLast.focus({ preventScroll: true });
    }
    if (V && (V.youtube || V.mp4) && vbx) {
      var vOpen = function () {
        vLast = document.activeElement;
        vfr.innerHTML = (V.youtube
          ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(V.youtube) + '?autoplay=1&rel=0&modestbranding=1" title="' + esc(c.title) + ' - video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'
          : '<video src="' + esc(V.mp4) + '" controls autoplay playsinline' + (V.poster ? ' poster="' + esc(V.poster) + '"' : '') + '></video>')
          + (V.sample ? '<span class="vdp__video-tag">Sample video</span>' : '');
        vbx.hidden = false; document.documentElement.classList.add('lbox-open');
        if (Site.lenis) Site.lenis.stop(); $('[data-vbox-close]').focus();
      };
      var vPoster = (gal[2] || gal[0]).small;
      th.insertAdjacentHTML('afterbegin', '<li class="vdp__thumb-vid"><button type="button" data-vid aria-label="Play the video of the ' + esc(c.title) + '"><img src="' + vPoster + '" alt="" decoding="async"><span class="vdp__thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span></button></li>');
      $('[data-vid]', th).addEventListener('click', vOpen);
      $('[data-vdp-vid-l]').textContent = 'Play video';
      vB.addEventListener('click', vOpen);
      $('[data-vbox-close]').addEventListener('click', vClose);
      vbx.addEventListener('click', function (e) { if (e.target === vbx) vClose(); });
      vbx.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); vClose(); return; }
        if (e.key !== 'Tab') return;
        var f = $$('button, iframe, video[controls]', vbx); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      });
    } else {
      $('[data-vdp-vid-l]').textContent = 'Request a walkaround video';
      vB.setAttribute('data-inq-intent', 'video');
    }
    show(0);
  })();
}, function () {
  document.querySelector('[data-vdp]').innerHTML = '<div class="inv__empty vdp__gone" role="alert"><h1 class="vdp__h">This page didn’t load</h1><p class="inv__empty-t">Check the connection and try again.</p><a class="button" href="">Try again</a></div>';
});
