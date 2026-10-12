/* Hero strands (Alex, 2026-10-09) — a vanilla WebGL port of "Shader Background" (plasma lines), cut down and moved into
   the site's palette, over a TRANSPARENT canvas (the hero's charcoal ground shows through), behind the cars and the type.
   Every look parameter is a uniform: open the page with ?tune=1 (or press Shift+T) for the live panel; "Copy" gives the
   JSON to bake into DEFAULTS below. Runs only while the hero is on screen; reduced motion = one still frame. */
(function () {
  // Alex's tuning (2026-10-09, panel → Copy): dark blue-steel strands, tilted −21°, no edge fade
  var DEFAULTS = {
    count: 5,          // strands (1–16)
    width: 0.06,       // max strand width (halo)
    minWidth: 0.011,   // min strand width
    core: 0.26,        // bright core, × width
    glow: 0.79,        // halo strength
    amplitude: 0,    // wave height
    spread: 0.95,       // how far strands fan apart (vertical spread)
    warp: 0.45,         // the slow warp of the whole field
    frequency: 0.3,    // waves per unit (higher = tighter waves)
    speed: 0.13,       // motion speed
    direction: 1,      // 1 = left → right, −1 = right → left
    angle: -21,          // tilt of the band, degrees
    bandY: 0.53,       // band height on screen (0 bottom … 1 top)
    scale: 10.9,        // zoom of the field (lower = bigger waves)
    edgeFade: 0,     // how strongly strands fade at the sides (0 none … 1 full)
    beads: 3.5,        // travelling light beads (0 = off)
    opacity: 0.62,      // layer opacity
    color1: '#202537', // main strands
    color2: '#343a51', // second tone (every 4th strand)
    accent: '#3f5188', // accent strands
    accentEvery: 3     // every Nth strand is the accent (0 = none)
  };
  var P = Object.assign({}, DEFAULTS);
  try { var saved = JSON.parse(localStorage.getItem('heroStrands') || 'null'); if (saved && /[?&]tune=1/.test(location.search)) Object.assign(P, saved); } catch (e) {}

  var hero = document.querySelector('[data-scene="hero"]'); if (!hero) return;
  var cv = document.createElement('canvas'); cv.className = 'hero__strands'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true }); if (!gl) { cv.remove(); return; }
  var vs = 'attribute vec4 p; void main(){ gl_Position = p; }';
  var fs = [
    'precision highp float;',
    'uniform vec2 R; uniform float T;',
    'uniform float uCount, uW, uMinW, uCore, uGlow, uAmp, uSpread, uWarp, uFreq, uDir, uAngle, uBandY, uScale, uEdge, uBeads, uEvery;',
    'uniform vec3 uC1, uC2, uAcc;',
    'const float SMOOTH = 0.015;',
    'float rnd(float t){ return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0; }',
    'float plasmaY(float x, float fade, float off){ return rnd(x * uFreq + T * uDir) * fade * uAmp + off; }',
    'float smoothLine(float pos, float hw, float t){ return smoothstep(hw, 0.0, abs(pos - t)); }',
    'float crispLine(float pos, float hw, float t){ return smoothstep(hw + SMOOTH, hw, abs(pos - t)); }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / R;',
    '  vec2 s = (gl_FragCoord.xy - R * vec2(0.5, uBandY)) / R.x * 2.0 * uScale;',
    '  float ca = cos(uAngle), sa = sin(uAngle); s = vec2(ca * s.x + sa * s.y, -sa * s.x + ca * s.y);',
    '  float hf = mix(1.0, 1.0 - (cos(uv.x * 6.2832) * 0.5 + 0.5), uEdge);',
    '  float vf = 1.0 - (cos(uv.y * 6.2832) * 0.5 + 0.5);',
    '  s.y += rnd(s.x * 0.5 + T * 0.2 * uDir) * uWarp * (0.5 + hf);',
    '  s.x += rnd(s.y * 0.5 + T * 0.2 * uDir + 2.0) * uWarp * hf;',
    '  vec3 ink = vec3(0.0); float a = 0.0;',
    '  for (int l = 0; l < 16; l++){',
    '    float fl = float(l); if (fl >= uCount) break;',
    '    float nl = fl / uCount;',
    '    float ot = T * 1.33 * uDir, op = fl * 1.7 + s.x * 0.5;',
    '    float r = rnd(op + ot) * 0.5 + 0.5;',
    '    float hw = mix(uMinW, uW, r * hf) * 0.5;',
    '    float off = rnd(op + ot * (1.0 + nl)) * mix(0.5, uSpread, hf);',
    '    float y = plasmaY(s.x, hf, off);',
    '    float v = smoothLine(y, hw, s.y) * uGlow + crispLine(y, hw * uCore, s.y);',
    '    float cx = mod(fl * 5.0 + T * uDir, 25.0) - 12.0;',
    '    v += smoothstep(0.035, 0.0, length(s - vec2(cx, plasmaY(cx, hf, off)))) * uBeads;',
    '    bool isAcc = uEvery > 0.5 && mod(fl + 1.0, uEvery) < 0.5;',
    '    vec3 col = isAcc ? uAcc : (mod(fl, 4.0) > 2.5 ? uC2 : uC1);',
    '    float k = v * r * 0.95 * vf;',
    '    ink += col * k; a += k;',
    '  }',
    '  a = clamp(a, 0.0, 0.95);',
    '  gl_FragColor = vec4(min(ink, vec3(a)), a);',
    '}'].join('\n');
  function sh(t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
  var pr = gl.createProgram(), sv = sh(gl.VERTEX_SHADER, vs), sf = sh(gl.FRAGMENT_SHADER, fs);
  if (!sv || !sf) { cv.remove(); return; }
  gl.attachShader(pr, sv); gl.attachShader(pr, sf); gl.linkProgram(pr); gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['R', 'T', 'uCount', 'uW', 'uMinW', 'uCore', 'uGlow', 'uAmp', 'uSpread', 'uWarp', 'uFreq', 'uDir', 'uAngle', 'uBandY', 'uScale', 'uEdge', 'uBeads', 'uEvery', 'uC1', 'uC2', 'uAcc']
    .forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function push() {
    gl.uniform1f(U.uCount, P.count); gl.uniform1f(U.uW, P.width); gl.uniform1f(U.uMinW, P.minWidth); gl.uniform1f(U.uCore, P.core);
    gl.uniform1f(U.uGlow, P.glow); gl.uniform1f(U.uAmp, P.amplitude); gl.uniform1f(U.uSpread, P.spread); gl.uniform1f(U.uWarp, P.warp);
    gl.uniform1f(U.uFreq, P.frequency); gl.uniform1f(U.uDir, P.direction < 0 ? -1 : 1); gl.uniform1f(U.uAngle, P.angle * Math.PI / 180);
    gl.uniform1f(U.uBandY, P.bandY); gl.uniform1f(U.uScale, P.scale); gl.uniform1f(U.uEdge, P.edgeFade); gl.uniform1f(U.uBeads, P.beads);
    gl.uniform1f(U.uEvery, P.accentEvery); gl.uniform3fv(U.uC1, hex(P.color1)); gl.uniform3fv(U.uC2, hex(P.color2)); gl.uniform3fv(U.uAcc, hex(P.accent));
    cv.style.setProperty('--strands-o', P.opacity);
  }
  function size() {
    var d = Math.min(1.5, window.devicePixelRatio || 1), r = hero.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
    gl.viewport(0, 0, cv.width, cv.height);
  }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clock = 0, last = performance.now(), raf = 0, on = false;
  function draw(now) {
    var dt = Math.min(0.1, (now - last) / 1000); last = now; clock += dt * P.speed;   // speed changes never jump the field
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, reduce ? 2 : clock);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (on && !reduce) raf = requestAnimationFrame(draw);
  }
  push(); size(); addEventListener('resize', function () { size(); if (!on || reduce) draw(performance.now()); });
  draw(performance.now());
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    on = es[0].isIntersecting; cancelAnimationFrame(raf); last = performance.now(); if (on && !reduce) raf = requestAnimationFrame(draw);
  }).observe(hero);

  /* ---------------- the tuning panel (?tune=1 or Shift+T) ---------------- */
  var SPEC = [
    ['count', 'Strands', 1, 16, 1], ['width', 'Thickness (halo)', 0.005, 0.3, 0.005], ['minWidth', 'Min thickness', 0.001, 0.05, 0.001],
    ['core', 'Core sharpness', 0.03, 0.5, 0.01], ['glow', 'Glow', 0, 1.5, 0.01], ['amplitude', 'Amplitude', 0, 3, 0.05],
    ['spread', 'Spread', 0.5, 4, 0.05], ['warp', 'Warp', 0, 3, 0.05], ['frequency', 'Wave frequency', 0.05, 0.8, 0.01],
    ['speed', 'Speed', 0, 1, 0.01], ['direction', 'Direction (−1 / 1)', -1, 1, 2], ['angle', 'Tilt °', -45, 45, 1],
    ['bandY', 'Band height', 0.1, 0.9, 0.01], ['scale', 'Zoom', 1.5, 12, 0.1], ['edgeFade', 'Edge fade', 0, 1, 0.05],
    ['beads', 'Light beads', 0, 4, 0.1], ['opacity', 'Opacity', 0, 1, 0.01], ['accentEvery', 'Accent every Nth (0 off)', 0, 8, 1]
  ];
  var COLORS = [['color1', 'Main colour'], ['color2', 'Second tone'], ['accent', 'Accent']];
  var panel = null;
  function save() { try { localStorage.setItem('heroStrands', JSON.stringify(P)); } catch (e) {} }
  function openPanel() {
    if (panel) { panel.hidden = !panel.hidden; return; }
    panel = document.createElement('div'); panel.className = 'strands-tune';
    var html = '<div class="st__hd"><b>Hero strands</b><button type="button" data-x aria-label="Close">×</button></div>';
    SPEC.forEach(function (s) { html += '<label><span>' + s[1] + ' <output data-o="' + s[0] + '"></output></span><input type="range" data-k="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '"></label>'; });
    COLORS.forEach(function (c) { html += '<label class="st__c"><span>' + c[1] + '</span><input type="color" data-k="' + c[0] + '"></label>'; });
    html += '<div class="st__ft"><button type="button" data-copy>Copy settings</button><button type="button" data-reset>Reset</button></div><textarea readonly data-json></textarea>';
    panel.innerHTML = html; document.body.appendChild(panel);
    function sync() {
      panel.querySelectorAll('[data-k]').forEach(function (i) { i.value = P[i.dataset.k]; });
      panel.querySelectorAll('[data-o]').forEach(function (o) { o.textContent = P[o.dataset.o]; });
      panel.querySelector('[data-json]').value = JSON.stringify(P, null, 1);
    }
    panel.addEventListener('input', function (e) {
      var k = e.target.dataset.k; if (!k) return;
      P[k] = e.target.type === 'color' ? e.target.value : parseFloat(e.target.value);
      push(); save(); sync(); if (!on || reduce) draw(performance.now());
    });
    panel.querySelector('[data-x]').onclick = function () { panel.hidden = true; };
    panel.querySelector('[data-reset]').onclick = function () { P = Object.assign({}, DEFAULTS); push(); save(); sync(); };
    panel.querySelector('[data-copy]').onclick = function () {
      var t = panel.querySelector('[data-json]'); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(function () { this.textContent = 'Copied ✓'; }.bind(this), function () { document.execCommand('copy'); });
    };
    ['wheel', 'touchmove'].forEach(function (ev) { panel.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    panel.setAttribute('data-lenis-prevent', '');
    sync();
  }
  if (/[?&]tune=1/.test(location.search)) openPanel();
  addEventListener('keydown', function (e) { if (e.shiftKey && (e.key === 'T' || e.key === 't') && !e.target.closest('input, textarea')) openPanel(); });
})();
