const { chromium } = require('C:/____WORK/_____GDBURO SIGOFF/design_dna/node_modules/playwright');
const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1920,height:1080}})).newPage();
await p.goto(url.pathToFileURL(path.join(__dirname,'F5_notext.html')).href);await p.waitForSelector('body[data-ready="1"]');
await p.screenshot({path:path.join(__dirname,'_F5_notext.png')});
const r=await p.evaluate(()=>[...document.querySelectorAll('.nav li,.abs')].map(e=>{const q=e.getBoundingClientRect();return {t:e.textContent.trim().slice(0,30),c:getComputedStyle(e).color,x:q.left,y:q.top,r:q.right,b:q.bottom}}));
require('fs').writeFileSync(path.join(__dirname,'_nt.json'),JSON.stringify(r));await b.close();})();
