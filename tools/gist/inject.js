// Put a one-line "what is it / what is it for" gist at the top of every green
// "人话 / In plain words" callout, right under its tag and above the symbol cheat sheet.
// Data: tools/gist/gist.json  { zh: { n: [what, why] }, en: { n: [what, why] } }  ($...$ = inline math)
// Usage (repo root):  node tools/gist/inject.js            # both reading pages
// Idempotent: the gist sits between <!--gist--> … <!--/gist--> and is replaced on every run.
// It stays visible when the callout is folded, and carries data-hl-ui so highlight anchors don't shift.
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }

const G = JSON.parse(fs.readFileSync(path.join(__dirname, 'gist.json'), 'utf8'));
const LBL = { zh: ['是什么', '有什么用'], en: ['What', 'Why it matters'] };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// text outside $...$ is escaped; text inside is rendered with KaTeX
const inline = t => t.split(/(\$[^$]+\$)/).map(part => part.startsWith('$') && part.endsWith('$') && part.length > 1
  ? katex.renderToString(part.slice(1, -1), { output: 'html', throwOnError: true }) : esc(part)).join('');
const render = (lang, n) => {
  const [what, why] = G[lang][n];
  const [a, b] = LBL[lang];
  return `<!--gist--><span class="plain-gist" data-hl-ui><span class="gist-row"><span class="gist-k">${a}</span>${inline(what)}</span>` +
    `<span class="gist-row"><span class="gist-k">${b}</span>${inline(why)}</span></span><!--/gist-->`;
};

const CSS = `<style id="gist-css">
.plain-gist{display:block;margin:7px 0 4px;padding:7px 11px;background:#fff;border:1px solid #cfe6d8;border-left:4px solid var(--green);border-radius:6px;line-height:1.6}
.gist-row{display:block}
.gist-row+.gist-row{margin-top:2px;color:#3f5248}
.gist-k{display:inline-block;min-width:3.6em;margin-right:8px;padding:0 6px;border-radius:4px;background:var(--green);color:#fff;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-align:center;vertical-align:1px}
.gist-row+.gist-row .gist-k{background:#e3f1e8;color:var(--green)}
.plain.folded>.plain-gist{display:block!important;margin-bottom:0}
.plain.folded:has(.plain-gist)::after{content:none}
</style>`;

for (const [file, lang] of [['reading.html', 'zh'], ['reading-en.html', 'en']]) {
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/<!--gist-->[\s\S]*?<!--\/gist-->/g, '').replace(/<style id="gist-css">[\s\S]*?<\/style>/, '');
  let count = 0;
  s = s.replace(/(<figure class="equation" id="eq-(\d+)">(?:(?!<\/figure>)[\s\S])*<\/figure>\s*<aside class="plain"><span class="plain-tag">[^<]*<\/span>)/g, (m, whole, n) => {
    if (!G[lang][n]) throw new Error(`no gist for eq ${n} (${lang})`);
    count++;
    return whole + render(lang, n);
  });
  if (count !== Object.keys(G[lang]).length) throw new Error(`${file}: inserted ${count}, expected ${Object.keys(G[lang]).length}`);
  s = s.replace('</head>', CSS + '</head>');
  fs.writeFileSync(file, s);
  console.log(file, lang, 'gists', count);
}
