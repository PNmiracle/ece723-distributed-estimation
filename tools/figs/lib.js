// Small SVG drawing helpers for the equation diagrams (tools/figs).
// Labels use a mini syntax: x_i, x_{ab}, x^2, x^{ab} become sub/superscripts.
const C = {
  ink: '#1d2327', gray: '#5b6670', line: '#c9d3cf', faint: '#eef1f0',
  teal: '#0f6b6b', tealS: '#dcefed', blue: '#3d5a80', blueS: '#e3ecf7',
  amber: '#9a5b00', amberS: '#fbecd3', red: '#b3261e', redS: '#f9e3e0',
  green: '#2e7d32', greenS: '#e1f2e1', purple: '#6b3fa0', purpleS: '#ece4f6',
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// mini TeX: _x, _{xy}, ^x, ^{xy}
function ml(s, size) {
  const d = Math.round(size * 0.32);
  let out = '', i = 0;
  s = String(s);
  while (i < s.length) {
    const ch = s[i];
    if ((ch === '_' || ch === '^') && i + 1 < s.length) {
      let arg;
      if (s[i + 1] === '{') { const j = s.indexOf('}', i + 2); arg = s.slice(i + 2, j); i = j + 1; }
      else { arg = s[i + 1]; i += 2; }
      const dy = ch === '_' ? d : -d * 1.25;
      out += `<tspan dy="${dy}" font-size="${Math.round(size * 0.72)}">${esc(arg)}</tspan><tspan dy="${-dy}">​</tspan>`;
    } else { out += esc(ch); i++; }
  }
  return out;
}

// Rough text extent, so svg() can widen its view box instead of clipping long labels.
const ext = { min: 0, max: 0 };
function measure(s, size) {
  const plain = String(s).replace(/[_^]\{([^}]*)\}/g, '$1').replace(/[_^](.)/g, '$1');
  let w = 0;
  for (const ch of plain) w += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? size : size * 0.56;
  return w;
}
function T(x, y, s, o = {}) {
  const size = o.size || 13;
  const w = measure(s, size), a = o.anchor === 'middle' ? w / 2 : o.anchor === 'end' ? w : 0;
  ext.min = Math.min(ext.min, x - a); ext.max = Math.max(ext.max, x - a + w);
  const attrs = [`x="${x}"`, `y="${y}"`, `font-size="${size}"`, `fill="${o.color || C.ink}"`];
  if (o.anchor) attrs.push(`text-anchor="${o.anchor}"`);
  if (o.weight) attrs.push(`font-weight="${o.weight}"`);
  const cls = o.math ? 'fm' : 'ft';
  return `<text class="${cls}" ${attrs.join(' ')}>${ml(s, size)}</text>`;
}
const M = (x, y, s, o = {}) => T(x, y, s, { ...o, math: true });
const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 4}" fill="${o.fill || 'none'}" stroke="${o.stroke || 'none'}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
// Arrowhead ids are unique per diagram: a marker inside a folded (display:none) box cannot serve others.
let mid = 'f';
const setId = id => { mid = id; };
const line = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.color || C.gray}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${mid}-${o.arrow})"` : ''}/>`;
const arrow = (x1, y1, x2, y2, o = {}) => line(x1, y1, x2, y2, { ...o, arrow: o.arrowColor || 'g' });
const circ = (x, y, r, o = {}) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill || '#fff'}" stroke="${o.stroke || C.gray}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
const path = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.stroke || C.ink}" stroke-width="${o.sw || 1.8}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''} stroke-linejoin="round"/>`;

const markers = () => `<defs>${[['g', C.gray], ['t', C.teal], ['b', C.blue], ['a', C.amber], ['r', C.red], ['k', C.ink]].map(([k, c]) =>
  `<marker id="${mid}-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;

function svg(w, h, body, label) {
  const x0 = Math.floor(Math.min(0, ext.min - 6)), x1 = Math.ceil(Math.max(w, ext.max + 6));
  ext.min = 0; ext.max = 0;
  w = x1 - x0;
  return `<svg viewBox="${x0} 0 ${w} ${h}" width="${w}" role="img" aria-label="${esc(label || '')}" xmlns="http://www.w3.org/2000/svg">${markers()}${body}</svg>`;
}

// polyline of a function on a plot box
function curve(f, x0, x1, X, Y, n = 120) {
  let d = '';
  for (let k = 0; k <= n; k++) {
    const x = x0 + (x1 - x0) * k / n, y = f(x);
    if (!isFinite(y)) continue;
    d += (d ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(y).toFixed(1);
  }
  return d;
}
// axes box; returns scale functions
function axes(px, py, pw, ph, xr, yr, o = {}) {
  const X = x => px + (x - xr[0]) / (xr[1] - xr[0]) * pw;
  const Y = y => py + ph - (y - yr[0]) / (yr[1] - yr[0]) * ph;
  let body = line(px, py + ph, px + pw + 8, py + ph, { arrow: 'g', sw: 1.2 }) + line(px, py + ph, px, py - 8, { arrow: 'g', sw: 1.2 });
  if (o.xl) body += o.xlMath === false ? T(px + pw + 10, py + ph + 4, o.xl, { size: 12, color: C.gray }) : M(px + pw + 10, py + ph + 4, o.xl, { size: 13, color: C.gray });
  if (o.yl) body += o.ylMath === false ? T(px - 4, py - 12, o.yl, { size: 12, color: C.gray, anchor: 'start' }) : M(px + 6, py - 8, o.yl, { size: 13, color: C.gray });
  return { X, Y, body };
}
// bell curve path on a box
const gauss = x => Math.exp(-x * x / 2);

module.exports = { C, esc, ml, setId, T, M, rect, line, arrow, circ, path, svg, curve, axes, gauss };
