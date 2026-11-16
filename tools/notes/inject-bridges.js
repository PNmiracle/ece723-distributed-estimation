// Attach short reading examples to the original prose immediately before an
// equation. Reuse the existing note popover so closed notes add no new rows.
const fs = require('fs');
const path = require('path');
let katex;
try { katex = require('katex'); } catch (_) { katex = require('/opt/npm-tools/node_modules/katex'); }
const bridges = require('./bridges.js');
const root = path.join(__dirname, '..', '..');
const inline = s => s.split(/(\$[^$]+\$)/g).map(t => t.length > 1 && t.startsWith('$') && t.endsWith('$')
  ? katex.renderToString(t.slice(1, -1), { output: 'html', throwOnError: true })
  : t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('');
const CSS = `<style id="prose-tip-css">
.nref.prose-tip{color:#344f69;background:#eef4fa;border-color:#cbdced;line-height:1.35;padding:1px 7px;margin-inline-start:.45em;white-space:nowrap;vertical-align:baseline}
.nref.prose-tip:hover{background:#ddebf9}
.nref.prose-tip:focus-visible{outline:2px solid #537ba5;outline-offset:2px}
</style>`;

for (const [page, lang, label] of [['reading.html','zh','举个例子'], ['reading-en.html','en','Example']]) {
  const file = path.join(root, page);
  let s = fs.readFileSync(file, 'utf8')
    .replace(/ <button type="button" class="nref prose-tip"[^>]*>[^<]*<\/button>/g, '')
    .replace(/<style id="prose-tip-css">[\s\S]*?<\/style>/, '');
  const notes = {};
  for (const [n, entries] of Object.entries(bridges)) {
    const [title, body] = entries[lang];
    const id = `prose-eq-${n}`;
    notes[id] = { title: inline(title), body: inline(body) };
    const fig = `<figure class="equation" id="eq-${n}">`;
    const i = s.indexOf(fig);
    const before = s.slice(0, i);
    // Check the exact end of the original paragraph. Do not silently attach a
    // note to a heading/guide if the source page's structure changes.
    const ending = /<\/p>(\s*<\/div>\s*)$/;
    if (i < 0 || !ending.test(before) || s.indexOf(fig, i + fig.length) >= 0) {
      throw new Error(`${page}: missing unique paragraph immediately before ${fig}`);
    }
    const chip = ` <button type="button" class="nref prose-tip" data-note="${id}" data-hl-ui>${label}</button>`;
    s = before.replace(ending, `${chip}</p>$1`) + s.slice(i);
  }
  const data = /(<script type="application\/json" id="gl-data">)([\s\S]*?)(<\/script>)/;
  if (!data.test(s)) throw new Error(`${page}: note store not found`);
  s = s.replace(data, (_, start, json, end) => {
    const d = JSON.parse(json);
    for (const id of Object.keys(d.N)) if (/^prose-eq-\d+$/.test(id)) delete d.N[id];
    Object.assign(d.N, notes);
    return start + JSON.stringify(d).replace(/<\//g, '<\\/') + end;
  });
  fs.writeFileSync(file, s.replace('</head>', CSS + '</head>'));
  console.log(page, 'prose examples', Object.keys(notes).length);
}
