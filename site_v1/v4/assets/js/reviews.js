/* 07 Reviews (Alex, 2026-10-09) — vanilla port of "glass testimonial swiper": the active card on top, two behind it
   (smaller, lifted, dimmer), the rest hidden. Drag / swipe past 50 px, the arrow buttons, the dots and ←/→ change it. */
(function () {
  var stack = document.querySelector('[data-rv-stack]'); if (!stack) return;
  var cards = [].slice.call(stack.querySelectorAll('[data-rv-card]')), dots = [].slice.call(stack.querySelectorAll('.rv__dot'));
  var sec = stack.closest('.rv'), nEl = sec.querySelector('[data-rv-n]');
  var N = cards.length, BEHIND = 2, active = 0, dragX = 0, startX = 0, dragging = false;
  function layout() {
    var h = 0;
    cards.forEach(function (c, i) {
      var d = (i - active + N) % N, s;
      if (d === 0) s = { t: 'translateX(' + dragX + 'px) rotate(' + (dragX * 0.012) + 'deg)', o: 1, z: N };
      else if (d <= BEHIND) s = { t: 'translateY(' + (-1.6 * d) + 'rem) scale(' + (1 - 0.05 * d) + ')', o: 1 - 0.28 * d, z: N - d };
      else s = { t: 'translateY(0) scale(.85)', o: 0, z: 0 };
      c.style.transform = s.t; c.style.opacity = s.o; c.style.zIndex = s.z;
      c.style.pointerEvents = d === 0 ? 'auto' : 'none';
      c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      if (d === 0) h = c.offsetHeight;
    });
    dots.forEach(function (b, i) { b.classList.toggle('is-on', i === active); b.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    var dw = stack.querySelector('.rv__dots'), top = cards[active].offsetTop;
    if (dw) { dw.style.top = (top + h + 36) + 'px'; dw.style.bottom = 'auto'; }
    if (!window.matchMedia('(min-width: 1280px)').matches) stack.style.minHeight = (h + 110) + 'px';
  }
  function go(i) { active = (i + N) % N; dragX = 0; layout(); }
  dots.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  var prev = sec.querySelector('.rv__btn--prev'), next = sec.querySelector('.rv__btn--next');
  if (prev) prev.addEventListener('click', function () { go(active - 1); });
  if (next) next.addEventListener('click', function () { go(active + 1); });
  stack.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); } });
  cards.forEach(function (c) {
    c.addEventListener('pointerdown', function (e) {
      if (c !== cards[active] || e.button > 0) return;
      dragging = true; startX = e.clientX; c.classList.add('is-drag'); c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', function (e) { if (!dragging) return; dragX = e.clientX - startX; layout(); });
    function end() {
      if (!dragging) return; dragging = false; c.classList.remove('is-drag');
      if (Math.abs(dragX) > 50) go(active + (dragX < 0 ? 1 : -1)); else { dragX = 0; layout(); }
    }
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  });
  layout();
  addEventListener('resize', layout);
})();
