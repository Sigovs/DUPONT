// Contiguous-US hairline drawing for 03-locations. Source: us-atlas@3 states-10m (US Census cartographic boundaries),
// projected Albers (conic equal-area, parallels 29.5/45.5) — the same projection as the parent V1 map (site/_build/map.mjs).
// Run from a folder where us-atlas, topojson-client, topojson-simplify, d3-geo are installed:
//   node map.mjs <out.json>
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(process.cwd() + '/');
const { merge, mesh } = require('topojson-client');
const { presimplify, simplify, quantile } = require('topojson-simplify');
const { geoConicEqualArea, geoPath } = require('d3-geo');
let topo = require('us-atlas/states-10m.json');
topo = presimplify(topo); topo = simplify(topo, quantile(topo, 0.30));
const drop = ['02', '15', '72', '78', '60', '66', '69'];
const keep = topo.objects.states.geometries.filter(g => !drop.includes(g.id));
const nation = merge(topo, keep);
const inner = mesh(topo, { type: 'GeometryCollection', geometries: keep }, (a, b) => a !== b);
const W = 1000, H = 620;
const proj = geoConicEqualArea().parallels([29.5, 45.5]).rotate([96, 0]).center([0, 38.7]).fitExtent([[6, 6], [W - 6, H - 6]], nation);
const path = geoPath(proj).digits(1);
const pts = { socal: [-117.2139, 33.5539], naples: [-81.7948, 26.1420], miami: [-80.1918, 25.8287] };
const out = { W, H, nation: path(nation), states: path(inner), pts: {} };
for (const k in pts) out.pts[k] = proj(pts[k]).map(v => Math.round(v * 10) / 10);
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.nation.length, out.states.length, out.pts);
