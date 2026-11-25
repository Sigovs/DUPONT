/* Sub pages: FAQ accordion, logo rail, sell form. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var rm = matchMedia('(prefers-reduced-motion: reduce)');
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---- faq: one answer open at a time; the pressed question stays put */
  var items = $$('[data-faq]');
  items.forEach(function (it) {
    var b = $('.faq__b', it);
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true', y0 = b.getBoundingClientRect().top, t0 = performance.now();
      items.forEach(function (x) { var on = x === it && open; x.classList.toggle('is-open', on); $('.faq__b', x).setAttribute('aria-expanded', on ? 'true' : 'false'); });
      (function keep() {
        var d = b.getBoundingClientRect().top - y0;
        if (Math.abs(d) > .5) { Site.scrollTo(scrollY + d, true); }
        if (performance.now() - t0 < 480) requestAnimationFrame(keep);
      })();
    });
  });

  /* ---- rail */
  function rail(box) {
    var ul = $('.rail', box), prev = $('[data-prev]', box), next = $('[data-next]', box), n = $('[data-n]', box), li = ul.children;
    function step() { return li.length > 1 ? li[1].offsetLeft - li[0].offsetLeft : ul.clientWidth; }
    function at() { return Math.min(li.length - 1, Math.round(ul.scrollLeft / step())); }
    function paint() {
      var end = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2;
      n.textContent = pad(end ? li.length : at() + 1) + ' / ' + pad(li.length);
      prev.disabled = ul.scrollLeft < 4; next.disabled = end;
    }
    function go(d) { ul.scrollTo({ left: (at() + d * Math.max(1, Math.floor(ul.clientWidth / step()) - 1)) * step(), behavior: rm.matches ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); }); next.addEventListener('click', function () { go(1); });
    var t; ul.addEventListener('scroll', function () { cancelAnimationFrame(t); t = requestAnimationFrame(paint); }, { passive: true });
    addEventListener('resize', paint); paint();
  }
  $$('[data-rail]').forEach(function (box) {
    if (!box.dataset.cars) { rail(box); return; }
    Site.ready(function (data) {
      var by = {}; data.cars.forEach(function (c) { by[c.id] = c; });
      $('.rail', box).innerHTML = box.dataset.cars.split(',').map(function (id, i) { return by[id] ? Site.card(by[id], i, '(min-width: 1280px) 20vw, (min-width: 760px) 32vw, 76vw') : ''; }).join('');
      rail(box);
    }, function () { $('.rail__ctl', box).hidden = true; $('.lead', box).textContent = 'The inventory didn’t load. Please try again in a moment.'; });
  });

  /* ---- cards: Read More opens the text on tap; a mouse opens it on hover (CSS) */
  $$('[data-more]').forEach(function (c) {
    var b = $('.cover__more', c);
    b.addEventListener('click', function () { c.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); $('.cover__a', c).focus({ preventScroll: true }); });
  });

  /* ---- make and model lists: data/models.json, replaced by the live feed */
  $$('[data-make]').forEach(function (mk) {
    var md = $('[data-model]', mk.form);
    function fill(sel, list) { while (sel.options.length > 1) sel.remove(1); list.forEach(function (t) { sel.add(new Option(t, t)); }); sel.selectedIndex = 0; }
    fetch('data/models.json').then(function (r) { return r.json(); }).then(function (d) {
      fill(mk, Object.keys(d));
      mk.addEventListener('change', function () { fill(md, d[mk.value] || []); md.disabled = !mk.value; md.dispatchEvent(new Event('change')); });
    });
  });

  /* ---- about: three photographs, hard-edged wipe every 7s; stops on interaction, hover and out of view */
  $$('[data-slides]').forEach(function (box) {
    var S = $$('[data-slide]', box), D = $$('[data-dot]', box), k = 0, busy = false, live = !rm.matches, hold = false, t;
    function to(n) {
      if (busy || n === k) return; busy = true;
      var a = S[k], b = S[n]; b.loading = 'eager';
      a.classList.add('is-under'); a.classList.remove('is-on'); b.classList.add('is-go'); b.offsetWidth; b.classList.add('is-on');
      D.forEach(function (d, i) { d.setAttribute('aria-current', i === n ? 'true' : 'false'); });
      setTimeout(function () { a.classList.remove('is-under'); b.classList.remove('is-go'); busy = false; }, rm.matches ? 0 : 920);
      k = n;
    }
    D.forEach(function (d, i) { d.addEventListener('click', function () { live = false; to(i); }); });
    box.addEventListener('mouseenter', function () { hold = true; }); box.addEventListener('mouseleave', function () { hold = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { hold = !e[0].isIntersecting; }).observe(box);
    t = setInterval(function () { if (live && !hold && !document.hidden) to((k + 1) % S.length); }, 7000);
  });

  /* ---- why: the photo follows the reading position (wide screens only; stacked otherwise) */
  var why = $('[data-why]');
  if (why) {
    var wi = $$('[data-why-i]', why), wp = $$('[data-why-ph]', why), pin = $('.why__pin', why), cur = 0;
    var pinned = matchMedia('(min-width: 1200px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
    var track = function () {
      if (!pinned.matches) return;
      var run = why.offsetHeight - pin.offsetHeight, top = parseFloat(getComputedStyle(pin).top) || 0;
      var p = Math.max(0, Math.min(1, (top - why.getBoundingClientRect().top) / run)), k = Math.min(wi.length - 1, Math.floor(p * wi.length));
      if (k === cur) return; cur = k;
      wi.forEach(function (el, i) { el.classList.toggle('is-on', i === k); el.classList.toggle('is-past', i < k); });
      wp.forEach(function (el, i) { el.classList.toggle('is-on', i <= k); });
    };
    addEventListener('scroll', track, { passive: true }); addEventListener('resize', track); track();
  }

  /* ---- background video: plays only in view */
  $$('[data-inview]').forEach(function (vid) {
    if (rm.matches) { vid.removeAttribute('autoplay'); vid.pause(); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) { var p = vid.play(); if (p) p.catch(function () {}); } else vid.pause(); }).observe(vid);
  });

  /* ---- field errors, shared by the forms */
  var TEXT = { plate: 'Enter the license plate.', state: 'Choose a state.', zip: 'Enter a five-digit zip code.', vin: 'Enter the VIN: 11 to 17 letters and digits, without I, O or Q.', make: 'Choose a make.', model: 'Enter the model.', year: 'Choose a year.',
    first: 'Enter your first name.', last: 'Enter your last name.', address: 'Enter your home address.', email: 'Enter a valid email address.', phone: 'Enter a phone number with area code.', income: 'Enter your annual income.', score: 'Choose a credit score.', city: 'Enter the city.', from: 'Enter a city or ZIP code.', to: 'Enter a city or ZIP code.', type: 'Choose a vehicle type.', name: 'Enter your name.', car: 'Enter the year, make and model.', service: 'Choose a service.', inquiry: 'Choose an inquiry type.', request: 'Choose a service.', message: 'Tell us how we can help.' };
  function mark(el, show) {
    var w = el.closest('.field'), e = $('.field__e', w), bad = show && !el.checkValidity();
    w.classList.toggle('is-bad', bad); el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (bad && !e) { e = document.createElement('span'); e.className = 'field__e'; e.id = 'e-' + el.form.id + '-' + el.name; e.textContent = TEXT[el.name]; w.appendChild(e); el.setAttribute('aria-describedby', e.id); }
    if (!bad && e) { e.remove(); el.removeAttribute('aria-describedby'); }
  }

  /* ---- quote forms: insurance (step 1), protect, ship (step 1) */
  var qb = $('[data-quote]');
  if (qb) {
    var qs = $('[data-quote-start]', qb), qx = $('[data-quote-body]', qb);
    if (qs) {
      $('button', qs).addEventListener('click', function () { qs.hidden = true; qx.hidden = false; $('input', qx).focus(); });
      $('[data-quote-over]', qb).addEventListener('click', function () { qf.reset(); qe.forEach(function (el) { mark(el, false); }); qx.hidden = true; qs.hidden = false; $('button', qs).focus(); });
    }
    var qf = $('form', qb), qd = $('[data-quote-done]', qb), qe = $$('input:not([type="radio"]):not([type="checkbox"]), select, textarea', qf);
    qe.forEach(function (el) {
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) mark(el, true); });
      el.addEventListener('blur', function () { if (el.value) mark(el, true); });
    });
    qf.addEventListener('submit', function (e) {
      e.preventDefault(); qe.forEach(function (el) { mark(el, true); });
      var bad = qe.filter(function (el) { return !el.checkValidity(); })[0]; if (bad) { bad.focus(); return; }
      Site.emit(qb.dataset.quote, { fields: Object.fromEntries(new FormData(qf)) });
      qf.hidden = true; qd.hidden = false; qd.textContent = '';
      var p = document.createElement('p'), q = document.createElement('p'), b = document.createElement('button');
      p.textContent = qb.dataset.quoteDoneText; q.textContent = 'Prototype — nothing was sent.';
      b.type = 'button'; b.className = 'button button--line'; b.textContent = 'Change the details';
      b.addEventListener('click', function () { qd.hidden = true; qf.hidden = false; qe[0].focus(); });
      [p, q, b].forEach(function (x) { qd.appendChild(x); }); qd.focus();
    });
  }

  /* ---- finance: hours tabs */
  $$('.seg').forEach(function (seg) {
    var t = $$('[role="tab"]', seg);
    function on(i, focus) { t.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; document.getElementById(b.getAttribute('aria-controls')).hidden = k !== i; }); if (focus) t[i].focus(); }
    t.forEach(function (b, i) {
      b.addEventListener('click', function () { on(i); });
      b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); on((i + 1) % t.length, true); } });
    });
  });

  /* ---- finance: pre-qualification window */
  var pq = $('[data-prequal]');
  if (pq) {
    var pf = $('form', pq), pd = $('[data-prequal-done]', pq), pe = $$('input:not([type="checkbox"]), select', pf), pc = $$('input[type="checkbox"]', pf);
    var lock = function (on) { if (Site.lenis) { if (on) Site.lenis.stop(); else Site.lenis.start(); } document.documentElement.classList.toggle('dr-open', on); };
    $$('[data-prequal-open]').forEach(function (b) { b.addEventListener('click', function () { pq.showModal(); lock(true); }); });
    $('[data-dlg-close]', pq).addEventListener('click', function () { pq.close(); });
    pq.addEventListener('click', function (e) { if (e.target === pq) pq.close(); });
    pq.addEventListener('close', function () { lock(false); });
    pe.forEach(function (el) {
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) mark(el, true); });
      el.addEventListener('blur', function () { if (el.value) mark(el, true); });
    });
    pc.forEach(function (c) { c.addEventListener('change', function () { c.closest('.chk').classList.remove('is-bad'); }); });
    pf.addEventListener('submit', function (e) {
      e.preventDefault(); pe.forEach(function (el) { mark(el, true); }); pc.forEach(function (c) { c.closest('.chk').classList.toggle('is-bad', !c.checked); c.setAttribute('aria-invalid', c.checked ? 'false' : 'true'); });
      var bad = pe.concat(pc).filter(function (el) { return !el.checkValidity(); })[0]; if (bad) { bad.focus(); return; }
      Site.emit('prequalify', { fields: Object.fromEntries(new FormData(pf)) });
      pf.hidden = true; pd.hidden = false; pd.textContent = '';
      var p = document.createElement('p'), q = document.createElement('p'), b = document.createElement('button');
      p.textContent = 'The result would appear here: target price, loan term, down payment, monthly payment and APR.'; q.textContent = 'Prototype — nothing was sent.';
      b.type = 'button'; b.className = 'button button--line'; b.textContent = 'Change the details';
      b.addEventListener('click', function () { pd.hidden = true; pf.hidden = false; pe[0].focus(); });
      [p, q, b].forEach(function (x) { pd.appendChild(x); }); pd.focus();
    });
  }

  /* ---- sell form: three ways to name the car */
  var box = $('[data-sellform]'); if (!box) return;
  var tabs = $$('[role="tab"]', box), panes = $$('[data-sell-by]', box), done = $('[data-sell-done]', box);
  function pick(i, focus) {
    tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; panes[k].hidden = !on; });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); pick((i + d + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); pick(0, true); } if (e.key === 'End') { e.preventDefault(); pick(tabs.length - 1, true); }
    });
  });
  panes.forEach(function (f) {
    var go = $('.sell-form__go', f), els = $$('input, select', f);
    function ready() { go.disabled = !els.every(function (el) { return el.value.trim() && el.checkValidity(); }); }
    els.forEach(function (el) {
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) mark(el, true); ready(); });
      el.addEventListener('change', ready);
      el.addEventListener('blur', function () { if (el.value) mark(el, true); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); ready(); if (go.disabled) { els.forEach(function (el) { mark(el, true); }); return; }
      var data = Object.fromEntries(new FormData(f));
      Site.emit('sell', { by: f.dataset.sellBy, fields: data });
      var car = f.dataset.sellBy === 'make' ? data.year + ' ' + data.make + ' ' + data.model : f.dataset.sellBy === 'vin' ? 'VIN ' + data.vin.toUpperCase() : 'Plate ' + data.plate.toUpperCase() + ', ' + data.state;
      $('.sell-form__tabs', box).hidden = true; f.hidden = true; done.hidden = false; done.textContent = '';
      var h = document.createElement('h2'), p = document.createElement('p'), q = document.createElement('p'), b = document.createElement('button');
      h.textContent = car; p.textContent = 'The next step would ask about features, condition and how to reach you.'; q.textContent = 'Prototype — nothing was sent.';
      b.type = 'button'; b.className = 'button button--line'; b.textContent = 'Change the details';
      b.addEventListener('click', function () { done.hidden = true; $('.sell-form__tabs', box).hidden = false; f.hidden = false; els[0].focus(); });
      [h, p, q, b].forEach(function (x) { done.appendChild(x); }); done.focus();
    });
    ready();
  });
})();
