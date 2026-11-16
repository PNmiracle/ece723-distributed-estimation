// Rebuild the green "人话 / In plain words" callouts after every equation of one section:
// symbol cheat sheet (with pronunciations from say.js) + plain explanation.
// Usage: node tools/build.js <reading.html|reading-en.html> <zh|en> <sec-id> <next-sec-id> <data file>
// Idempotent: existing callouts are replaced, missing ones inserted. Needs the `katex` npm package.
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }

const [file, lang, secId, nextId, dataMod] = process.argv.slice(2);
const _d = require(path.resolve(dataMod)); const { notes, syms } = _d[lang] || _d;
const L = lang === 'zh'
  ? { tag: n => `人话 · 式 (${n})`, symH: '符号速查', expH: '这条式子在说什么' }
  : { tag: n => `In plain words · Eq. (${n})`, symH: 'Symbol cheat sheet', expH: 'What it says' };

const tex = (t, display = false) => katex.renderToString(t, { output: 'html', throwOnError: true, displayMode: display });
const inline = txt => txt.replace(/\$([^$]+)\$/g, (_, t) => tex(t));

const { readings } = require('./say.js');
const sayLine = rs => !rs.length ? '' : `<span class="sym-say">${lang === 'zh' ? '读法：' : 'Say: '}` +
  rs.map(r => `${tex(r.g)} ${lang === 'zh' ? `${r.z}（英文 ${r.e}）` : r.e}`).join(' · ') + '</span>';
const aside = n => {
  const seen = new Set();
  const rows = (syms[n] || []).map(([k, v]) =>
    `<span class="sym-k">${tex(k)}</span><span class="sym-v">${inline(v)}${sayLine(readings(k, seen))}</span>`).join('');
  const paras = notes[n].map(p => `<span class="plain-more">${inline(p)}</span>`).join('');
  return `<aside class="plain"><span class="plain-tag">${L.tag(n)}</span>` +
    (rows ? `<span class="plain-syms"><span class="plain-sub">${L.symH}</span>${rows}</span>` : '') +
    `<span class="plain-sub">${L.expH}</span>${paras}</aside>`;
};

let s = fs.readFileSync(file, 'utf8');
const a = s.indexOf(`id="${secId}"`), b = s.indexOf(`id="${nextId}"`);
if (a < 0 || b < 0) throw new Error('section anchors');
let sec = s.slice(a, b);
let replaced = 0, inserted = 0;
for (const n of Object.keys(notes).map(Number)) {
  const f = sec.indexOf(`<figure class="equation" id="eq-${n}">`);
  if (f < 0) throw new Error(`eq-${n} not found`);
  const fe = sec.indexOf('</figure>', f) + 9;
  let rest = sec.slice(fe);
  const lead = rest.match(/^\s*/)[0];
  if (rest.slice(lead.length).startsWith('<aside class="plain">')) {
    rest = rest.slice(rest.indexOf('</aside>') + 8); replaced++;
  } else inserted++;
  sec = sec.slice(0, fe) + '\n' + aside(n) + (rest.startsWith('\n') ? '' : '\n') + rest;
}
s = s.slice(0, a) + sec + s.slice(b);

// CSS (screen rules, right after the .plain-tag rule). Idempotent.
s = s.replace(/\n@media \(max-width:640px\)\{\.plain-syms[^\n]*/g, '').replace(/\n\.sym-say\{[^}]*\}/g, '').replace(/\n\.plain-more\{[^}]*\}/g, '').replace(/\n\.plain-syms[^{]*\{[^}]*\}/g, '').replace(/\n\.plain-sub\{[^}]*\}/g, '');
const anchor = '.plain-tag{background:var(--green);margin:0 8px 0 0;vertical-align:1px}';
if (s.split(anchor).length !== 2) throw new Error('css anchor');
s = s.replace(anchor, anchor + [
  '',
  '.plain-more{display:block;margin-top:5px}',
  '.plain-sub{display:block;margin:9px 0 3px;font-size:.72rem;font-weight:700;letter-spacing:.08em;color:var(--green)}',
  '.plain-syms{display:grid;grid-template-columns:max-content 1fr;column-gap:14px;row-gap:3px;align-items:baseline;margin:6px 0 2px;padding:4px 12px 8px;background:rgba(255,255,255,.65);border-radius:6px;font-size:.9rem}',
  '.plain-syms .plain-sub{grid-column:1/-1;margin-top:4px}',
  '.plain-syms .sym-k{text-align:right;white-space:nowrap}',
  '.sym-say{display:block;font-size:.8rem;color:#5b6b63;margin-top:1px}',
  '@media (max-width:640px){.plain-syms{grid-template-columns:1fr}.plain-syms .sym-k{text-align:left}}',
].join('\n'));
fs.writeFileSync(file, s);
console.log(file, { replaced, inserted });
