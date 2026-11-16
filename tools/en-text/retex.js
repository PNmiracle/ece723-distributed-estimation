// Replace the TeX of inline formulas on the English page and re-render them with KaTeX.
// Usage: node tools/en-text/retex.js   (edit FIX below: old TeX -> new TeX; applies to every span with that TeX)
const fs = require('fs'), path = require('path');
let katex; try { katex = require('katex'); } catch (e) { katex = require('/opt/npm-tools/node_modules/katex'); }
const R = String.raw;
const FIX = {
  [R`\int^{\infty}2x\mathbf{1}\{L>x\}dx`]: R`\int_{0}^{\infty}2x\,\mathbf{1}\{L_{T}>x\}\,dx`,
  [R`0\le K(t|z)\le1`]: R`0\le K(t\mid z)\le1`,
  [R`H_{\theta}(T|R)`]: R`H_{\theta}(T\mid R)`,
  [R`S_{T}=\mathbb{E}_{\theta}[S_{Z}|T]`]: R`S_{T}=\mathbb{E}_{\theta}[S_{Z}\mid T]`,
  [R`\mathbb{E}[f(A)|\hat{v}=w]`]: R`\mathbb{E}[f(A)\mid\hat{v}=w]`,
  [R`\mathsf{P}_{E}=\mathsf{P}(\cdot|E)`]: R`\mathsf{P}_{E}=\mathsf{P}(\cdot\mid E)`,
  [R`i|T=t,R=r)`]: R`i\mid T=t,R=r)`,
  [R`p_{\theta}^{G,T}(g,t)=p_{\theta}^{G}(g)p_{\theta}^{T|G}(t|g)`]: R`p_{\theta}^{G,T}(g,t)=p_{\theta}^{G}(g)\,p_{\theta}^{T|G}(t\mid g)`,
  ...(global.EXTRA || {}),
};
const esc = t => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = t => t.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function retex(file, fix) {
  let s = fs.readFileSync(file, 'utf8'), out = '', i = 0, n = 0;
  const open = /<span class="imath" data-tex="([^"]*)">/g; let m;
  while ((m = open.exec(s))) {
    const tex = unesc(m[1]); if (!(tex in fix)) continue;
    // find the matching </span>
    let j = m.index + m[0].length, depth = 1; const tag = /<span\b|<\/span>/g; tag.lastIndex = j;
    let t; while ((t = tag.exec(s))) { depth += t[0] === '</span>' ? -1 : 1; if (!depth) break; }
    const end = t.index + 7, nt = fix[tex];
    out += s.slice(i, m.index) + `<span class="imath" data-tex="${esc(nt)}">${katex.renderToString(nt, {output: 'html', throwOnError: true, strict: false})}</span>`;
    i = end; open.lastIndex = end; n++;
  }
  fs.writeFileSync(file, out + s.slice(i)); return n;
}
module.exports = { retex };
if (require.main === module) console.log('re-rendered', retex(path.join(__dirname, '..', '..', 'reading-en.html'), FIX));
