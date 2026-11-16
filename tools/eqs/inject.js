// Replace display equations that were scanned images with KaTeX, from tools/eqs/tex.json
// ({E: {n: TeX}, PRE: {n: lead-in text on the English page}}). Idempotent.
// Usage (from repo root): node tools/eqs/inject.js
const fs = require('fs'), path = require('path');
let katex; try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }
const { E, PRE } = JSON.parse(fs.readFileSync(path.join(__dirname, 'tex.json'), 'utf8'));
const inl = s => s.replace(/\$([^$]+)\$/g, (_, t) => `<span class="imath" data-tex="${t.replace(/"/g, '&quot;')}">${katex.renderToString(t, { output: 'html', strict: false })}</span>`);
for (const [file, lang] of [['reading.html', 'zh'], ['reading-en.html', 'en']]) {
  const f = path.join(__dirname, '..', '..', file);
  let s = fs.readFileSync(f, 'utf8'), n = 0;
  for (const [num, tex] of Object.entries(E)) {
    const re = new RegExp(`(<figure class="equation" id="eq-${num}"><div class="equation-content">)<img class="source-formula"[^>]*>(</div>)`);
    const html = katex.renderToString(tex, { displayMode: true, output: 'htmlAndMathml', throwOnError: true, strict: false });
    s = s.replace(re, (_, a, b) => { n++; return `${a}<div class="math-source rendered">${html}</div><span class="eq-print-number">(${num})</span>${b}`; });
    // add a missing number to an equation converted by an earlier run
    s = s.replace(new RegExp(`(<figure class="equation" id="eq-${num}">[\\s\\S]*?</div>)(</div><a class="equation-link")`), (m, a, b) => a.includes('eq-print-number') ? m : `${a}<span class="eq-print-number">(${num})</span>${b}`);
    if (lang === 'en' && PRE[num]) {
      const fig = `<figure class="equation" id="eq-${num}">`;
      s = s.replace(new RegExp(`<p class="eq-lead">(?:(?!</p>).)*</p>\\n?(?=${fig})`, 's'), '');
      s = s.replace(fig, `<p class="eq-lead">${inl(PRE[num])}</p>\n${fig}`);
    }
  }
  if (!s.includes('.eq-lead{')) s = s.replace('</head>', '<style id="eq-lead-style">\n.eq-lead{margin:.2em 0 -.2em}\n</style>\n</head>');
  fs.writeFileSync(f, s);
  console.log(file, 'equations converted', n, 'images left', (s.match(/class="source-formula"/g) || []).length);
}
