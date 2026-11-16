// Put a small blue "本段导读 / Guide" box right under every sub-heading (<h4 class="sub-h">)
// of reading.html / reading-en.html: what this part does + the one thing to take away.
// Data: tools/subguide/subguide.json  { "<h4 id>": { zh: [does, core], en: [does, core] } }  ($...$ = inline math)
// Usage (repo root):  node tools/subguide/inject.js
// Idempotent: boxes sit between <!--sg--> … <!--/sg--> and are replaced on every run. They come
// directly after the heading (before any video box), carry their own id (so ✎ edit keys of the
// surrounding text don't shift) and data-hl-ui (so highlight anchors don't shift).
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }

const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'subguide.json'), 'utf8'));
const L = { zh: ['本段导读', '这段干什么：', '核心：'], en: ['Guide', 'What this part does: ', 'Key point: '] };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = t => t.split(/(\$[^$]+\$)/).map(p => p.length > 1 && p.startsWith('$') && p.endsWith('$')
  ? katex.renderToString(p.slice(1, -1), { output: 'html', throwOnError: true }) : esc(p)).join('');

const CSS = `<style id="sg-css">
.guide.sub-guide{margin:.2em 0 .9em;padding:8px 13px 7px;font-size:.93rem;line-height:1.7}
.guide.sub-guide .guide-tag{margin-bottom:4px}
.sg-row{margin:0 0 2px}
.sg-row b{color:var(--blue)}
</style>`;

for (const [file, lang] of [['reading.html', 'zh'], ['reading-en.html', 'en']]) {
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/<!--sg-->[\s\S]*?<!--\/sg-->/g, '').replace(/<style id="sg-css">[\s\S]*?<\/style>/, '');
  let n = 0;
  const seen = new Set();
  s = s.replace(/<h4 class="sub-h(?: minor)?" id="([^"]+)">[\s\S]*?<\/h4>/g, (h, id) => {
    const d = D[id];
    if (!d) throw new Error(`${file}: no guide for ${id}`);
    seen.add(id); n++;
    const [tag, a, b] = L[lang];
    const [does, core] = d[lang];
    return h + `<!--sg--><aside class="guide sub-guide" id="sg-${id}" data-hl-ui><div class="guide-tag">${tag}</div>` +
      `<div class="sg-row"><b>${a}</b>${inline(does)}</div><div class="sg-row"><b>${b}</b>${inline(core)}</div></aside><!--/sg-->`;
  });
  const missing = Object.keys(D).filter(k => !seen.has(k));
  if (missing.length) throw new Error(`${file}: headings not found: ${missing.join(', ')}`);
  s = s.replace('</head>', CSS + '</head>');
  fs.writeFileSync(file, s);
  console.log(file, lang, 'sub-heading guides', n);
}
