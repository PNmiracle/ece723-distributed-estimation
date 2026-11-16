// Add the extra intuition notes (tools/notes/extra.js) to both reading pages. Idempotent.
// Usage (from repo root): node tools/notes/inject.js
const fs = require('fs'), path = require('path');
let katex; try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }
const NOTES = require('./extra.js');
const ids = new Set(NOTES.map(n => n.id));
const render = s => s.replace(/\$([^$]+)\$/g, (_, t) => katex.renderToString(t, { output: 'html', throwOnError: true }));
for (const [file, lang] of [['reading.html', 'zh'], ['reading-en.html', 'en']]) {
  const f = path.join(__dirname, '..', '..', file);
  let s = fs.readFileSync(f, 'utf8');
  // notes data
  s = s.replace(/(<script type="application\/json" id="gl-data">)([\s\S]*?)(<\/script>)/, (_, a, json, c) => {
    const d = JSON.parse(json);
    for (const n of NOTES) d.N[n.id] = { title: n[lang].title, body: render(n[lang].body) };
    return a + JSON.stringify(d).replace(/<\//g, '<\\/') + c;
  });
  // buttons: drop old ones, then add one at the end of each target paragraph
  s = s.replace(/ ?<button type="button" class="nref nref-x" data-note="([^"]+)">[^<]*<\/button>/g, (m, id) => ids.has(id) ? '' : m);
  const main = s.indexOf('<main');
  const starts = []; const re = /<div class="para[ "]/g; let m;
  while ((m = re.exec(s))) if (m.index > main) starts.push(m.index);
  const label = lang === 'zh' ? '💡 形象解释' : '💡 intuition';
  for (const n of [...NOTES].sort((a, b) => b.para - a.para)) {
    const a = starts[n.para], b = n.para + 1 < starts.length ? starts[n.para + 1] : s.length;
    const end = s.lastIndexOf('</p>', s.indexOf('</div>', a) );
    if (end < a || end > b) throw new Error(`${file}: no </p> in para ${n.para}`);
    s = s.slice(0, end) + ` <button type="button" class="nref nref-x" data-note="${n.id}">${label}</button>` + s.slice(end);
  }
  // style for the intuition chips
  s = s.replace(/\n?<style id="nx-style">[\s\S]*?<\/style>/, '');
  s = s.replace('</head>', '<style id="nx-style">\n.nref.nref-x{color:#1f6b4a;background:#eaf7f0;border-color:#a9d9bf;padding:0 7px;width:auto;white-space:nowrap}\n.nref.nref-x:hover{background:#d6f0e2}\n</style>\n</head>');
  fs.writeFileSync(f, s);
  console.log(file, 'notes', NOTES.length, 'buttons', (s.match(/class="nref nref-x"/g) || []).length);
}
