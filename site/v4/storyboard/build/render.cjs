// V4 storyboard renderer: screenshots each frame HTML at 1920x1080, DPR 1 and 2, plus aperture tests.
const { chromium } = require('C:/____WORK/_____GDBURO SIGOFF/design_dna/node_modules/playwright');
const path = require('path');
const B = __dirname;
const OUT = path.resolve(B, '..');
(async () => {
  const browser = await chromium.launch();
  const report = {};
  for (const f of ['F1', 'F2', 'F3', 'F4', 'F5']) {
    for (const dpr of [1, 2]) {
      const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr });
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      page.on('pageerror', e => errs.push(String(e)));
      await page.goto(require('url').pathToFileURL(path.join(B, `${f}_${dpr}x.html`)).href);
      await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 });
      await page.waitForTimeout(300);
      const name = dpr === 1 ? `${f}-1920.png` : `${f}-1920@2x.png`;
      await page.screenshot({ path: path.join(OUT, name) });
      if (dpr === 1) {
        report[f] = await page.evaluate(() => {
          const r = [];
          document.querySelectorAll('.abs,.cta,.nav,.idx,.logo,#sel,img.car__body,img.car__shadow,img.col').forEach(el => {
            const b = el.getBoundingClientRect();
            r.push({ cls: el.className.baseVal ?? el.className, t: (el.textContent || el.dataset.car || '').trim().slice(0, 40), kind: el.className.baseVal ?? el.className, up: el.dataset.up,
              x: Math.round(b.left), y: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom),
              font: getComputedStyle(el).fontFamily.split(',')[0], fs: getComputedStyle(el).fontSize });
          });
          return { els: r, fonts: [...document.fonts].filter(x => x.status === 'loaded').map(x => x.family + ' ' + x.weight).slice(0, 12) };
        });
        report[f].errors = errs;
      }
      await ctx.close();
    }
    if (false) {
      const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(require('url').pathToFileURL(path.join(B, `${f}_test.html`)).href);
      await page.waitForSelector('body[data-ready="1"]');
      await page.screenshot({ path: path.join(B, `_test_${f}.png`) });
      await ctx.close();
    }
  }
  require('fs').writeFileSync(path.join(B, 'render_report.json'), JSON.stringify(report, null, 1));
  await browser.close();
  console.log('done');
})();
