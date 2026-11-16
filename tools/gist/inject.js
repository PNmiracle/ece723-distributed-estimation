// Put a one-line "what is it / what is it for" gist at the top of every green
// "人话 / In plain words" callout, right under its tag and above the symbol cheat sheet.
// Data: tools/gist/gist.json  { zh: { n: [what, why] }, en: { n: [what, why] } }  ($...$ = inline math)
// Usage (repo root):  node tools/gist/inject.js            # both reading pages
// Idempotent: the reading priority and gist are replaced together on every run.
// Both stay visible when folded and are excluded from highlight anchors.
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }

const G = JSON.parse(fs.readFileSync(path.join(__dirname, 'gist.json'), 'utf8'));
const level = require('./levels.js');
const LBL = { zh: ['是什么', '有什么用'], en: ['What', 'Why it matters'] };
const LEVELS = {
  zh: { core: '必读', proof: '关键推导', detail: '推导细节' },
  en: { core: 'Core', proof: 'Proof step', detail: 'Detail' },
};
const LEGEND = {
  zh: '公式阅读顺序：必读抓主线，关键推导串起证明，推导细节按需查。',
  en: 'Equation priorities: Core for the main argument, Proof step to follow the proof, Detail for working through the algebra.',
};
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// text outside $...$ is escaped; text inside is rendered with KaTeX
const inline = t => t.split(/(\$[^$]+\$)/).map(part => part.startsWith('$') && part.endsWith('$') && part.length > 1
  ? katex.renderToString(part.slice(1, -1), { output: 'html', throwOnError: true }) : esc(part)).join('');
const render = (lang, n) => {
  const [what, why] = G[lang][n];
  const [a, b] = LBL[lang];
  const rank = level(Number(n));
  return `<!--gist--><span class="eq-level eq-level-${rank}" data-hl-ui>${LEVELS[lang][rank]}</span>` +
    `<span class="plain-gist" data-hl-ui><span class="gist-row"><span class="gist-k">${a}</span>${inline(what)}</span>` +
    `<span class="gist-row"><span class="gist-k">${b}</span>${inline(why)}</span></span><!--/gist-->`;
};

const CSS = `<style id="gist-css">
.eq-level{display:inline-block;padding:1px 7px;border:1px solid #d6dddf;border-radius:999px;color:#48565b;background:#f5f7f8;font:600 .72rem/1.5 -apple-system,"PingFang SC",sans-serif;white-space:nowrap;vertical-align:1px}
.eq-level-core{color:#294c71;border-color:#b6cde3;background:#eaf3fc}
.eq-level-proof{color:#5b4a20;border-color:#e5d8ae;background:#fbf7e8}
.plain.folded>.eq-level{display:inline-block!important}
.eq-level-legend{display:block;margin-top:.35em}
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
  s = s.replace(/<!--gist-->[\s\S]*?<!--\/gist-->/g, '')
    .replace(/<style id="gist-css">[\s\S]*?<\/style>/, '')
    .replace(/<span class="eq-level-legend" data-hl-ui>[^<]*<\/span>/, '');
  const seen = new Set();
  s = s.replace(/(<figure class="equation" id="eq-(\d+)">(?:(?!<\/figure>)[\s\S])*<\/figure>\s*<aside class="plain"><span class="plain-tag">[^<]*<\/span>)/g, (m, whole, n) => {
    if (!G[lang][n]?.every(t => typeof t === 'string' && t.trim())) throw new Error(`no gist for eq ${n} (${lang})`);
    if (seen.has(n)) throw new Error(`${file}: duplicate eq ${n}`);
    seen.add(n);
    return whole + render(lang, n);
  });
  if (seen.size !== 492 || Object.keys(G[lang]).length !== 492 ||
      Array.from({ length: 492 }, (_, i) => String(i + 1)).some(n => !seen.has(n))) {
    throw new Error(`${file}: expected one gist for each of equations 1–492; found ${seen.size}`);
  }
  const howto = /(<p class="howto">[^\n]*?)(<\/p>)/;
  if (!howto.test(s)) throw new Error(`${file}: no reading guide for the priority legend`);
  s = s.replace(howto, `$1<span class="eq-level-legend" data-hl-ui>${LEGEND[lang]}</span>$2`);
  s = s.replace('</head>', CSS + '</head>');
  fs.writeFileSync(file, s);
  console.log(file, lang, 'gists and priorities', seen.size);
}
