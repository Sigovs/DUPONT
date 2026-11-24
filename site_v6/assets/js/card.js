(function () {
  'use strict';
  var KEY = 'sel-saved';
  var V6 = window.V6 = window.V6 || {};
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  V6.arr = '<svg class="arr6" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2.67l-.94.94 3.72 3.72H2.67v1.34h8.11l-3.72 3.72.94.94L13.33 8z"/></svg>';
  V6.rooms = { socal: 'SoCal', naples: 'Naples', miami: 'Miami' };
  V6.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  V6.money = function (p) { return p ? '$' + p.toLocaleString('en-US') : 'Price on request'; };
  V6.saved = function () { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  V6.card = function (c, i, sizes) {
    var e = V6.esc, a = c.img[1], b = c.img[2];
    var spec = [c.miles != null ? c.miles.toLocaleString('en-US') + ' miles' : '', (c.ext || '').split(',')[0], /manual/i.test(c.trans || '') ? 'Manual' : c.trans].filter(Boolean).join(' · ');
    sizes = sizes || '(min-width: 1280px) 24vw, (min-width: 760px) 44vw, 92vw';
    function im(p, alt) { return '<img src="' + p + '-640.webp" srcset="' + p + '-640.webp 640w, ' + p + '-1200.webp 1200w" sizes="' + sizes + '" width="640" height="427" alt="' + alt + '" loading="lazy" decoding="async" draggable="false">'; }
    return '<li class="c6 tile" style="--i:' + (i || 0) + '"><a class="c6__a" href="car.html?id=' + c.id + '"><span class="c6__ph">' + im(a, e(c.title)) + im(b, '') + '</span>' +
      '<span class="c6__room">' + V6.rooms[c.loc] + '</span><span class="c6__t">' + e(c.title) + '</span><span class="c6__p">' + V6.money(c.price) + '</span>' +
      '<span class="c6__s">' + e(spec) + (c.drive ? ' ·<br>' + e(c.drive) : '') + '</span><span class="c6__go">View This Car</span></a>' +
      '<button class="c6__save" type="button" data-save="' + c.id + '" aria-pressed="' + (V6.saved().indexOf(c.id) > -1) + '" aria-label="Save the ' + e(c.title) + '">' + HEART + '</button></li>';
  };
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-save]'); if (!b) return;
    ev.preventDefault();
    var l = V6.saved(), id = b.dataset.save, i = l.indexOf(id), on = i < 0;
    if (on) l.push(id); else l.splice(i, 1);
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {}
    [].forEach.call(document.querySelectorAll('[data-save="' + id + '"]'), function (x) { x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    document.dispatchEvent(new CustomEvent('sel:saved', { detail: { id: id, on: on } }));
  });
  document.addEventListener('DOMContentLoaded', function () {
    var all = [].slice.call(document.querySelectorAll('[data-in]'));
    if (!('IntersectionObserver' in window)) { all.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px', threshold: .02 });
    all.forEach(function (el) { io.observe(el); });
  });
})();
