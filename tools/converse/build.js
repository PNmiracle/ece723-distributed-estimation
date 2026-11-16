// Rebuild the bilingual, equations-only lower-bound reader from the guided readers.
const fs = require('node:fs');
const path = require('node:path');
let katex;
try { katex = require('katex'); } catch (_) { katex = require('/opt/npm-tools/node_modules/katex'); }
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const en = read('reading-en.html');
const zh = read('reading.html');
const gists = JSON.parse(read('tools/gist/gist.json'));
const esc = str => str.replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const inline = str => str.split(/(\$[^$]+\$)/).map((part, i) => i % 2 ?
  katex.renderToString(part.slice(1, -1), { output: 'htmlAndMathml', throwOnError: true }) : esc(part)).join('');

const bridges = new Map();
for (const row of read('tools/converse/bridges.tsv').trimEnd().split('\n')) {
  if (row.startsWith('#') || !row.trim()) continue;
  const [id, english, chinese, extra] = row.split('\t');
  const n = Number(id);
  if (!Number.isInteger(n) || n < 74 || n > 230 || !english?.trim() || !chinese?.trim() || extra !== undefined || bridges.has(n)) {
    throw new Error('Invalid bridge into equation ' + id);
  }
  bridges.set(n, {en: english, zh: chinese});
}
if (bridges.size !== 157) throw new Error('Missing equation transitions');

function extract(html) {
  const start = html.indexOf('<section class="unit unit-h2" id="sec-iii"');
  const end = html.indexOf('<section class="unit unit-h2" id="sec-iv"');
  if (start < 0 || end <= start) throw new Error('Cannot locate the lower-bound section');
  const section = html.slice(start, end);
  const events = [];
  function add(patt, get) {
    for (const m of section.matchAll(patt)) events.push({ offset: m.index, ...get(m) });
  }
  add(/<section class="unit unit-h3" id="([^"]+)"[^>]*>\s*<h3[^>]*>(.*?)<\/h3>/gs,
      m => ({type: 'section', id: m[1], title: m[2]}));
  add(/<h4 class="sub-h[^"]*" id="([^"]+)"[^>]*>(.*?)<\/h4>/gs,
      m => ({type: 'subsection', id: m[1], title: m[2]}));
  add(/<figure class="equation" id="eq-(\d+)">.*?<\/figure>/gs,
      m => ({type: 'equation', id: m[1], number: Number(m[1]), figure: m[0]}));
  return events.sort((a,b) => a.offset - b.offset);
}

const english = extract(en);
const chinese = extract(zh);
if (english.length !== chinese.length || english.some((x, i) => x.id !== chinese[i].id || x.type !== chinese[i].type)) {
  throw new Error('English and Chinese paper section structure differs');
}
const actual = english.filter(e => e.type === 'equation').map(e => e.number);
if (actual.length !== 158 || actual.some((n, i) => n !== 73 + i)) throw new Error('Expected equations 73–230 in paper order');
if (english.filter(e => e.type === 'section').length !== 5) throw new Error('Expected sections III-A through III-E');

const pair = (type, e, z, labels = false) => '<div class="pair ' + type + '">' +
  '<div lang="zh-Hans">' + (labels ? '<span class="lang-label">中文</span>' : '') + '<p>' + z + '</p></div>' +
  '<div lang="en">' + (labels ? '<span class="lang-label">ENGLISH</span>' : '') + '<p>' + e + '</p></div></div>';

let sectionOpen = false;
const body = english.map((item, i) => {
  const other = chinese[i];
  if (item.type === 'section') {
    const link = (sectionOpen ? '</section>\n' : '') + '<section class="chapter" aria-labelledby="' + item.id +
      '"><h2 id="' + item.id + '"><span lang="zh-Hans">' + other.title + '</span><span lang="en">' + item.title + '</span></h2>';
    sectionOpen = true;
    return link;
  }
  if (item.type === 'subsection') return '<h3 id="' + item.id + '"><span lang="zh-Hans">' + other.title +
    '</span><span lang="en">' + item.title + '</span></h3>';
  const n = item.number;
  const what = gists.en[n]?.[0], 什么 = gists.zh[n]?.[0];
  if (!what?.trim() || !什么?.trim()) throw new Error('Missing explanation for equation ' + n);
  const transition = bridges.get(n);
  const bridge = !transition ? '' : pair('bridge' + (n === 150 ? ' focus-start' : ''), inline(transition.en), inline(transition.zh)) + '\n';
  return bridge + '<article class="eq-item' + (n >= 150 ? ' focus' : '') + '" aria-label="式 (' + n + ')">' +
    item.figure + pair('explain', inline(what), inline(什么), true) + '</article>';
}).join('\n') + '\n</section>';

const katexStyle = en.match(/<style>(\s*@font-face\{font-family:KaTeX_AMS;.*?)<\/style>/s)?.[1];
if (!katexStyle?.includes('.katex-display')) throw new Error('Cannot locate the embedded math fonts and stylesheet');
const nav = ['a','b','c','d','e'].map(letter => '<a href="#sec-iii-' + letter + '">III-' + letter.toUpperCase() + '</a>').join('');
const html = '<!doctype html>\n<html lang="zh-Hans"><head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<title>公式 + 人话 · 下界证明 | Equations in Plain Words</title>\n' +
  '<style>\n' + katexStyle + '\n' + read('tools/converse/style.css') + '</style></head><body>\n' +
  '<header class="wrap"><span class="source" lang="en">ECE723 · III. CONVERSE</span>' +
  '<h1>公式 + 人话</h1><p class="subtitle"><span lang="en">Equations in plain words</span> · 中英对照 · 式 (73)–(230)</p>' +
  '<p class="links"><a href="reading.html#sec-iii">中文原文导读</a><a lang="en" href="reading-en.html#sec-iii">Full English reader</a></p></header>\n' +
  '<div class="toolbar"><div class="wrap"><nav aria-label="下界证明目录">' + nav +
  '<a class="focus-link" href="#eq-150">重点 150–230 ↘</a></nav>' +
  '<form id="jump"><label for="equation-number">式号</label>' +
  '<input id="equation-number" type="number" min="73" max="230" inputmode="numeric" placeholder="73–230" required>' +
  '<button type="submit">跳转</button></form></div></div>\n' +
  '<main class="wrap">\n' + body + '\n</main>\n' +
  '<footer class="wrap"><a href="index.html">返回学习指南</a></footer>\n' +
  '<script>\n' + read('tools/converse/jump.js') + '</script>\n</body></html>\n';
fs.writeFileSync(path.join(root, 'converse.html'), html);
console.log('Built converse.html:', actual.length, 'equations and', bridges.size, 'bilingual transitions.');
