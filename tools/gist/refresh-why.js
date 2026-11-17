// Re-render only the "有什么用 / Why it matters" row of the listed equations on both reading
// pages from gist.json, leaving every other part of the pages untouched.
// Usage (repo root):  node tools/gist/refresh-why.js 19 20 21
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }
const G = JSON.parse(fs.readFileSync(path.join(__dirname, 'gist.json'), 'utf8'));
const root = path.resolve(__dirname, '../..');
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = t => t.split(/(\$[^$]+\$)/).map(p => p.startsWith('$') && p.endsWith('$') && p.length > 1
  ? katex.renderToString(p.slice(1, -1), { output: 'html', throwOnError: true }) : esc(p)).join('');
const nums = process.argv.slice(2).map(Number).filter(Boolean);
if (!nums.length) { console.error('usage: node tools/gist/refresh-why.js <equation numbers>'); process.exit(1); }
const pages = [
  { file: 'reading.html', lang: 'zh', tag: n => `人话 · 式 (${n})</span>`, labels: ['3. 有什么用', '有什么用'] },
  { file: 'reading-en.html', lang: 'en', tag: n => `In plain words · Eq. (${n})</span>`, labels: ['3. Why it matters', 'Why it matters'] },
];
for (const pg of pages) {
  const file = path.join(root, pg.file);
  let html = fs.readFileSync(file, 'utf8');
  for (const n of nums) {
    const at = html.indexOf(pg.tag(n));
    const end = html.indexOf('<!--/gist-->', at);
    if (at < 0 || end < 0) throw new Error(`${pg.file}: no box for (${n})`);
    let k = -1, label;
    for (const l of pg.labels) { k = html.indexOf(`<span class="gist-k" data-hl-ui>${l}</span>`, at); if (k > 0 && k < end) { label = l; break; } }
    if (!label) throw new Error(`${pg.file}: no why row for (${n})`);
    const start = k + `<span class="gist-k" data-hl-ui>${label}</span>`.length;
    const stop = html.lastIndexOf('</span></span>', end);
    if (stop < start) throw new Error(`${pg.file}: malformed why row for (${n})`);
    html = html.slice(0, start) + inline(G[pg.lang][n][1]) + html.slice(stop);
  }
  fs.writeFileSync(file, html);
  console.log(`${pg.file}: refreshed ${nums.join(', ')}`);
}
