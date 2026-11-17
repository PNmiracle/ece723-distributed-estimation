// Insert (or refresh) the diagrams in the plain-words boxes of both reading pages.
// Usage (repo root):  node tools/figs/inject.js
// Each diagram sits right under the box's short gist, between <!--fig--> and <!--/fig-->.
// It is marked data-hl-ui, so highlights and notes anchored in the box are unaffected.
const fs = require('fs');
const path = require('path');
const F = require('./figs.js');
const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8').trim();
const pages = [
  { file: 'reading.html', lang: 'zh', tag: n => `人话 · 式 (${n})</span>` },
  { file: 'reading-en.html', lang: 'en', tag: n => `In plain words · Eq. (${n})</span>` },
];
for (const pg of pages) {
  const file = path.join(root, pg.file);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<!--fig-->[\s\S]*?<!--\/fig-->/g, '').replace(/\n?<style id="figs-style">[\s\S]*?<\/style>/, '');
  const L = (zh, en) => (pg.lang === 'zh' ? zh : en);
  let count = 0;
  for (const n of Object.keys(F).map(Number).sort((a, b) => a - b)) {
    const items = [].concat(F[n](L));
    const at = html.indexOf(pg.tag(n));
    if (at < 0) throw new Error(`${pg.file}: no plain-words box for (${n})`);
    const end = html.indexOf('</aside>', at), gist = html.indexOf('<!--/gist-->', at);
    if (gist < 0 || gist > end) throw new Error(`${pg.file}: no gist in box (${n})`);
    const pos = gist + '<!--/gist-->'.length;
    const block = `<!--fig-->${items.map(({ svg, cap }) => `<figure class="eq-fig" data-hl-ui>${svg}<figcaption>${cap}</figcaption></figure>`).join('')}<!--/fig-->`;
    html = html.slice(0, pos) + block + html.slice(pos);
    count++;
  }
  html = html.replace('</head>', `<style id="figs-style">\n${css}\n</style>\n</head>`);
  fs.writeFileSync(file, html);
  console.log(`${pg.file}: ${count} diagrams`);
}
