/* Liquid-metal CTA (Alex, 2026-10-09) — a vanilla port of the React "LiquidMetalButton" (paper-design shaders),
   used once on the page: the closing call "Find a showroom". Markup: a.lm > .lm__metal (shader rim) + .lm__face.
   The shader idles at 0.6, speeds up on hover (1) and on press (2.4, back after 300 ms). Reduced motion: one still
   frame. No WebGL: the CSS gradient rim under .lm__metal stays (the button is complete without the shader). */
import { ShaderMount } from './vendor/paper-shaders/shader-mount.js';
import { liquidMetalFragmentShader } from './vendor/paper-shaders/shaders/liquid-metal.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.lm').forEach((btn) => {
  const host = btn.querySelector('.lm__metal');
  if (!host) return;
  let mount = null, hover = false;
  try {
    mount = new ShaderMount(host, liquidMetalFragmentShader, {
      u_colorBack: [0, 0, 0, 0], u_colorTint: [0.62, 0.8, 1, 1],   // ice blue burnt into the silver
      u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.3, u_shiftBlue: 0.3,
      u_distortion: 0, u_contour: 0, u_angle: 45, u_shape: 0, u_isImage: false,
      u_fit: 0, u_scale: 1, u_rotation: 0, u_offsetX: 0.1, u_offsetY: -0.1,
      u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, reduce ? 0 : 0.6, 0);
    btn.classList.add('lm--live');
  } catch (e) { return; }   // the CSS rim stays
  if (reduce) return;
  const set = (v) => mount && mount.setSpeed && mount.setSpeed(v);
  btn.addEventListener('pointerenter', () => { hover = true; set(1); });
  btn.addEventListener('pointerleave', () => { hover = false; set(0.6); btn.classList.remove('is-down'); });
  btn.addEventListener('pointerdown', () => btn.classList.add('is-down'));
  btn.addEventListener('pointerup', () => btn.classList.remove('is-down'));
  btn.addEventListener('click', (e) => {
    set(2.4); setTimeout(() => set(hover ? 1 : 0.6), 300);
    const r = btn.getBoundingClientRect(), dot = document.createElement('span');
    dot.className = 'lm__ripple';
    dot.style.left = (e.clientX - r.left) + 'px'; dot.style.top = (e.clientY - r.top) + 'px';
    btn.appendChild(dot); setTimeout(() => dot.remove(), 600);
  });
  // only animate while the button is on screen
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((en) => set(en.isIntersecting ? (hover ? 1 : 0.6) : 0))).observe(btn);
});
