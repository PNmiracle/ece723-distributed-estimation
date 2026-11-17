// Diagrams for the plain-words boxes of equations (150)–(230), both languages.
// Each entry: n -> lang -> { svg, cap }. Equations without an entry get no diagram.
const { C, setId, T, M, rect, line, arrow, circ, path, svg, curve, axes, gauss } = require('./lib.js');

const W = 560;
const phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
const condMean = (a, b) => (phi(a) - phi(b)) / (Phi(b) - Phi(a));
function W0(y) { let w = Math.log(1 + y); for (let i = 0; i < 60; i++) { const e = Math.exp(w); w -= (w * e - y) / (e * (w + 1)); } return w; }

/* ---------------- shared components ---------------- */

// two-machine conversation tree; hl = leaf to highlight ('0' | '10' | '11' | null)
function tree2(x, y, L, hl, o = {}) {
  const A = [x + 70, y + 16], B = [x + 122, y + 76], l0 = [x + 18, y + 76], l10 = [x + 92, y + 136], l11 = [x + 152, y + 136];
  const node = ([cx, cy], s, col) => circ(cx, cy, 15, { fill: '#fff', stroke: col || C.blue }) + T(cx, cy + 5, s, { anchor: 'middle', weight: 700, color: col || C.blue });
  const leaf = ([cx, cy], s) => { const on = hl === s;
    return rect(cx - 19, cy - 13, 38, 26, { fill: on ? C.amberS : '#fff', stroke: on ? C.amber : C.line, sw: on ? 2.2 : 1.2 }) + T(cx, cy + 5, s, { anchor: 'middle', weight: 700, color: on ? C.amber : C.gray }); };
  const ed = (p, q, s, on) => line(p[0], p[1] + 15, q[0], q[1] - 14, { color: on ? C.amber : C.line, sw: on ? 2.4 : 1.4 }) +
    T((p[0] + q[0]) / 2 + (q[0] < p[0] ? -10 : 8), (p[1] + q[1]) / 2 + 4, s, { size: 12, color: C.gray, anchor: 'middle' });
  return ed(A, l0, '0', hl === '0') + ed(A, B, '1', hl === '10' || hl === '11') + ed(B, l10, '0', hl === '10') + ed(B, l11, '1', hl === '11') +
    node(A, 'A') + node(B, 'B', C.teal) + leaf(l0, '0') + leaf(l10, '10') + leaf(l11, '11') +
    (o.note === false ? '' : T(x + 2, y + 170, L('A 先说；只有 A 说 1 时 B 才接着说', 'A speaks first; B speaks only if A said 1'), { size: 11.5, color: C.gray }));
}

// (Z_A, Z_B) plane with the leaf event shaded as a rectangle
function plane(x, y, w, h, L, o = {}) {
  const [a0, a1] = o.a || [0.5, 0.95], [b0, b1] = o.b || [0.1, 0.45];
  let s = line(x, y + h, x + w + 6, y + h, { arrow: 'g', sw: 1.2 }) + line(x, y + h, x, y - 6, { arrow: 'g', sw: 1.2 });
  s += M(x + w + 8, y + h + 4, 'Z_A', { color: C.gray }) + M(x - 4, y - 10, 'Z_B', { color: C.gray });
  const rx = x + a0 * w, rw = (a1 - a0) * w, ry = y + h - b1 * h, rh = (b1 - b0) * h;
  s += rect(rx, y + h - 6, rw, 6, { fill: C.blue, r: 1 }) + rect(x - 6 + 6 - 6, ry, 6, rh, { fill: C.teal, r: 1 });
  s += rect(rx, ry, rw, rh, { fill: C.amberS, stroke: C.amber, sw: 2, r: 2 });
  s += M(rx + rw / 2, y + h + 18, 'E_A', { anchor: 'middle', color: C.blue, size: 13 }) + M(x - 10, ry + rh / 2 + 4, 'E_B', { anchor: 'end', color: C.teal, size: 13 });
  if (o.label !== false) s += T(rx + rw / 2, ry + rh / 2 + 4, o.label || 'E_A × E_B', { anchor: 'middle', size: 12, color: C.amber, weight: 700 });
  return s;
}

// bell curve with an interval shaded and the conditional-mean shift drawn
function dens(x, y, w, h, o = {}) {
  const X = t => x + (t + 3) / 6 * w, Y = v => y + h - v * h;
  let s = line(x, y + h, x + w, y + h, { color: C.line, sw: 1.2 });
  if (o.shade) {
    const [a, b] = o.shade; let d = `M${X(a)},${Y(0)}`;
    for (let k = 0; k <= 40; k++) { const t = a + (b - a) * k / 40; d += `L${X(t).toFixed(1)},${Y(gauss(t)).toFixed(1)}`; }
    d += `L${X(b)},${Y(0)}Z`; s += path(d, { fill: o.fillS || C.amberS, stroke: 'none' });
  }
  s += path(curve(gauss, -3, 3, X, Y), { stroke: o.color || C.blue, sw: 2 });
  s += line(X(0), y + h, X(0), y + 4, { color: C.gray, dash: '3 3', sw: 1 });
  if (o.shade && o.mean !== false) {
    const m = condMean(o.shade[0], o.shade[1]);
    s += line(X(m), y + h, X(m), y + 4, { color: C.amber, sw: 2 });
    s += arrow(X(0) + 2 * Math.sign(m), y + 14, X(m) - 3 * Math.sign(m), y + 14, { color: C.amber, arrowColor: 'a', sw: 2 });
  }
  return s;
}

// horizontal stacked bar; segs: [{v, fill, stroke, top, bot}]
function stack(x, y, w, h, segs, o = {}) {
  const tot = segs.reduce((a, b) => a + b.v, 0);
  let s = '', cx = x;
  for (const g of segs) {
    const gw = g.v / tot * w;
    s += rect(cx, y, gw, h, { fill: g.fill, stroke: g.stroke || '#fff', sw: g.stroke ? 1.6 : 2, r: 3, dash: g.dash });
    if (g.cross) s += `<g opacity=".45">${line(cx + 4, y + h - 4, cx + gw - 4, y + 4, { color: C.red, sw: 1.6 })}${line(cx + 4, y + 4, cx + gw - 4, y + h - 4, { color: C.red, sw: 1.6 })}</g>`;
    if (g.in) s += (g.inMath === false ? T : M)(cx + gw / 2, y + h / 2 + 5, g.in, { anchor: 'middle', size: g.inSize || 13, color: g.inColor || C.ink, weight: g.inMath === false ? 600 : undefined });
    if (g.bot) s += T(cx + gw / 2, y + h + 17, g.bot, { anchor: 'middle', size: 11.5, color: g.botColor || C.gray });
    cx += gw;
  }
  if (o.left) s += (o.leftMath === false ? T : M)(x - 8, y + h / 2 + 5, o.left, { anchor: 'end', size: 13, color: C.ink });
  return s;
}

// pool of six with two access sets; variant controls colouring
function pool(x, y, L, v = 'groups') {
  const P = { 1: [x + 40, y + 52], 2: [x + 92, y + 52], 3: [x + 160, y + 62], 4: [x + 228, y + 72], 5: [x + 280, y + 72], 6: [x + 360, y + 62] };
  let s = rect(x + 6, y + 22, 190, 62, { fill: v === 'same' ? C.purpleS : C.tealS, stroke: v === 'same' ? C.purple : C.teal, r: 31 }) +
          rect(x + 126, y + 40, 190, 62, { fill: 'rgba(61,90,128,.10)', stroke: C.blue, r: 31 });
  if (v === 'same') s = rect(x + 6, y + 22, 310, 80, { fill: C.purpleS, stroke: C.purple, r: 34 });
  s += T(x + 20, y + 14, v === 'same' ? L('两台机器拿到完全相同的编号', 'both machines hold the same indices') : L('机器 1 · S₁', 'machine 1 · S₁'), { size: 12.5, weight: 700, color: v === 'same' ? C.purple : C.teal });
  if (v !== 'same') s += T(x + 300, y + 118, L('机器 2 · S₂', 'machine 2 · S₂'), { size: 12.5, weight: 700, color: C.blue, anchor: 'end' });
  for (const k of [1, 2, 3, 4, 5, 6]) {
    const [cx, cy] = P[k]; const shared = v === 'same' ? k <= 5 : k === 3; const unused = k === 6;
    s += circ(cx, cy, k === 3 && v !== 'same' ? 18 : 15, { fill: shared ? C.amberS : unused ? '#fff' : '#fff', stroke: shared ? C.amber : C.gray, sw: shared ? 2.4 : 1.4, dash: unused ? '3 3' : undefined });
    s += T(cx, cy + 5, String(k), { anchor: 'middle', weight: shared ? 700 : 400, color: unused ? C.gray : C.ink });
  }
  if (v === 'same') {
    s += T(x + 360, y + 92, L('没用到', 'unused'), { anchor: 'middle', size: 11.5, color: C.gray });
  } else {
    s += T(x + 110, y + 122, L('共享 𝒢 = {3}', 'shared 𝒢 = {3}'), { anchor: 'middle', size: 12, weight: 700, color: C.amber });
    s += T(x + 360, y + 92, L('没用到', 'unused'), { anchor: 'middle', size: 11.5, color: C.gray });
  }
  return s;
}

/* ---------------- figures ---------------- */
const F = {};
const fig = (n, make) => { F[n] = L => { setId(`eqfig${n}${L('z', 'e')}`); return make(L); }; };

// (150) rectangle property
fig(150, L => ({
  svg: svg(W, 200, tree2(10, 10, L, '10') +
    arrow(205, 90, 255, 90, { sw: 2 }) + T(230, 80, L('等价', '⇔'), { anchor: 'middle', size: 12, color: C.gray }) +
    plane(300, 30, 220, 120, L, {}) +
    T(400, 192, L('记录 = 10 ⇔ A 满足清单 且 B 满足清单', 'leaf 10 ⇔ A meets its list AND B meets its list'), { size: 12, color: C.amber, weight: 600, anchor: 'middle' })),
  cap: L('一份完整记录对数据的要求，拆成“每台机器各管自己”的条件，在 (Z_A, Z_B) 平面里是一个长方形。', 'A complete transcript asks each machine only about its own data, so in the (Z_A, Z_B) plane the event is a rectangle.'),
}));

// (152) probabilities multiply, surprises add
fig(152, L => ({
  svg: svg(W, 150,
    M(20, 34, 'p(10) = p_A · p_B = ½ × ½ = ¼', { size: 15 }) +
    T(20, 60, L('取 ln(1/·)：惊讶度相加', 'take ln(1/·): surprises add'), { size: 12, color: C.gray }) +
    stack(70, 82, 300, 34, [{ v: 1, fill: C.blueS, in: 'ℓ_A = ln 2', bot: L('A 的惊讶', 'A’s surprise') }, { v: 1, fill: C.tealS, in: 'ℓ_B = ln 2', bot: L('B 的惊讶', 'B’s surprise') }]) +
    T(380, 104, '=', { size: 18 }) + rect(400, 82, 140, 34, { fill: C.amberS, stroke: C.amber }) + M(470, 104, 'ln 4 = ln 1/p(10)', { anchor: 'middle', size: 13 }) +
    T(470, 133, L('整条记录的惊讶', 'surprise of the whole leaf'), { anchor: 'middle', size: 11.5, color: C.gray })),
  cap: L('独立块 + 长方形：概率相乘，所以惊讶度（负对数概率）按机器相加。', 'Independent blocks and a rectangle: probabilities multiply, so surprises (negative log probabilities) add up machine by machine.'),
}));

// (153) posterior on a leaf factorizes
fig(153, L => ({
  svg: svg(W, 160,
    T(10, 18, L('在叶子 10 上：', 'On leaf 10:'), { size: 12.5, weight: 700 }) +
    dens(20, 40, 220, 80, { shade: [0.3, 3], mean: false }) + M(130, 140, 'Z_A | Z_A ∈ E_A', { anchor: 'middle', color: C.blue }) +
    T(270, 92, '×', { size: 22, anchor: 'middle', color: C.gray }) +
    dens(310, 40, 220, 80, { shade: [-3, -0.4], mean: false, color: C.teal, fillS: C.tealS }) + M(420, 140, 'Z_B | Z_B ∈ E_B', { anchor: 'middle', color: C.teal })),
  cap: L('知道落在哪片叶子后，各块仍然独立：每块只被“截”到自己的那一段。', 'Given the leaf, the blocks stay independent: each block is only cut down to its own region.'),
}));

// (154) score of a block given the transcript
fig(154, L => ({
  svg: svg(W, 150,
    dens(30, 30, 300, 90, { shade: [0.3, 3] }) +
    T(185, 24, L('偏移 = 条件平均', 'shift = conditional mean'), { size: 12, color: C.amber, anchor: 'middle' }) +
    M(180, 142, '0', { anchor: 'middle', color: C.gray }) +
    M(360, 52, 'a_i(t) = E[A_i | T = t]', { size: 14 }) +
    T(360, 76, L('无条件时得分平均为 0；', 'Unconditionally the score averages 0;'), { size: 12, color: C.gray }) +
    T(360, 94, L('只看通过检查的那部分，', 'keep only the part that passed'), { size: 12, color: C.gray }) +
    T(360, 112, L('平均就偏离了 0。', 'the check, and the mean moves.'), { size: 12, color: C.gray })),
  cap: L('块得分的分布（蓝）在被检查条件截断后（橙色区域），平均值从 0 移到 a_i(t)。', 'The block score (blue), restricted to the region its checks allow (orange), has its mean moved from 0 to a_i(t).'),
}));

// (155) other machines do not matter
fig(155, L => ({
  svg: svg(W, 150,
    dens(20, 30, 240, 80, { shade: [0.3, 3] }) + M(140, 134, L('机器 i：只看 E_i', 'machine i: only E_i'), { anchor: 'middle', color: C.blue }) +
    `<g opacity=".35">${dens(300, 30, 240, 80, { shade: [-3, -0.4], mean: false, color: C.teal, fillS: C.tealS })}</g>` +
    M(420, 134, L('其他机器的检查：不影响 a_i', 'other machines’ checks: no effect on a_i'), { anchor: 'middle', color: C.gray, size: 12 })),
  cap: L('长方形意味着：给定叶子，块 i 的条件分布只由它自己的事件 E_i 决定。', 'Because the leaf is a rectangle, block i’s conditional law depends only on its own event E_i.'),
}));

// (156) on a leaf, product mean splits
fig(156, L => {
  const x = 40, y = 20, w = 200, h = 120;
  let s = plane(x, y, w, h, L, { a: [0.55, 0.95], b: [0.1, 0.4], label: false });
  for (let k = 0; k < 26; k++) { const u = 0.57 + 0.36 * ((k * 7 + 3) % 26) / 26, v = 0.12 + 0.26 * ((k * 17 + 5) % 23) / 23; s += circ(x + u * w, y + h - v * h, 2.2, { fill: C.amber, stroke: 'none' }); }
  s += M(330, 60, 'E[A_1A_2^⊤ | T = t] = a_1(t) a_2(t)^⊤', { size: 14 }) +
    T(330, 86, L('叶子内两块各自随机、互不牵连，', 'Inside the leaf the two blocks vary separately,'), { size: 12, color: C.gray }) +
    T(330, 104, L('乘积的平均 = 平均的乘积。', 'so the mean of a product is a product of means.'), { size: 12, color: C.gray });
  return { svg: svg(W, 165, s), cap: L('叶子内的点在长方形里“横竖独立”地散开，所以交叉项的条件平均可以拆开。', 'Within the rectangle the points spread independently along each axis, so the cross term’s conditional mean factorizes.') };
});

// (157) cross terms cancel only on average
fig(157, L => {
  const leaves = [['00', -1], ['01', 1], ['10', 1], ['11', -1]].map(([k, s2]) => [k, (k[0] === '1' ? 1 : -1) * (k[1] === '1' ? 1 : -1)]);
  let s = T(10, 18, L('两台机器各发一位：“我的样本 > 0 吗”；四片叶子各占 ¼', 'Each machine sends one bit, “is my sample > 0?”; four leaves, ¼ each'), { size: 12, color: C.gray });
  const base = 95;
  s += line(40, base, 420, base, { color: C.line });
  leaves.forEach(([k, v], i) => {
    const cx = 80 + i * 90, hgt = 46 * v;
    s += rect(cx - 22, v > 0 ? base - hgt : base, 44, Math.abs(hgt), { fill: v > 0 ? C.blueS : C.redS, stroke: v > 0 ? C.blue : C.red, r: 2 });
    s += M(cx, base - hgt / 2 + 5, v > 0 ? '+c' : '−c', { anchor: 'middle', color: v > 0 ? C.blue : C.red });
    s += T(cx, 164, L(`叶子 ${k}`, `leaf ${k}`), { anchor: 'middle', size: 12, color: C.gray });
  });
  s += M(440, 70, 'a_1·a_2', { size: 13, color: C.gray }) + T(440, 100, L('每片叶子 ≠ 0', 'nonzero per leaf'), { size: 12, color: C.gray }) +
    T(440, 128, L('按 ¼ 加权平均 = 0', 'average with weights ¼ = 0'), { size: 12, weight: 700, color: C.teal });
  return { svg: svg(W, 176, s), cap: L('单片叶子上交叉项可以不为 0；对所有叶子按概率平均后，正负抵消为 0。', 'On a single leaf the cross term need not vanish; averaged over leaves with their probabilities, the positive and negative parts cancel.') };
});

// (158) transcript score = sum of block shifts
fig(158, L => ({
  svg: svg(W, 150,
    circ(60, 110, 3, { fill: C.ink, stroke: 'none' }) + T(52, 132, '0', { size: 12, color: C.gray }) +
    arrow(60, 110, 200, 70, { color: C.blue, arrowColor: 'b', sw: 2.4 }) + M(118, 76, 'a_1(T)', { color: C.blue }) +
    arrow(200, 70, 260, 120, { color: C.teal, arrowColor: 't', sw: 2.4 }) + M(238, 86, 'a_2(T)', { color: C.teal }) +
    arrow(260, 120, 340, 40, { color: C.purple, sw: 2.4 }) + M(318, 100, 'a_3(T)', { color: C.purple }) +
    arrow(60, 110, 340, 40, { color: C.amber, arrowColor: 'a', sw: 2.6, dash: '6 4' }) + M(180, 28, '∇ log p_θ(T) = Σ_i a_i(T)', { size: 14, color: C.amber }) +
    T(370, 92, L('记录的得分 = 各机器偏移首尾相接', 'transcript score = the machines’'), { size: 12, color: C.gray }) +
    T(370, 110, L('（每台只看自己的块）', 'shifts added tip to tail'), { size: 12, color: C.gray })),
  cap: L('通信记录的得分，就是每台机器的“得分偏移”向量相加。', 'The score of the transcript is the sum of the per-machine score shifts.'),
}));

// (159) square of sum = sum of squares on average
fig(159, L => {
  const sq = (x, y, s, f, lab) => rect(x, y, s, s, { fill: f, stroke: '#fff', r: 2 }) + M(x + s / 2, y + s / 2 + 5, lab, { anchor: 'middle', size: 12 });
  let s = sq(20, 20, 70, C.blueS, '‖a_1‖²') + sq(90, 90, 50, C.tealS, '‖a_2‖²') +
    rect(90, 20, 50, 70, { fill: C.redS, stroke: '#fff', r: 2 }) + rect(20, 90, 70, 50, { fill: C.redS, stroke: '#fff', r: 2 }) +
    M(115, 59, '×', { anchor: 'middle', color: C.red, size: 15 }) + M(55, 120, '×', { anchor: 'middle', color: C.red, size: 15 }) +
    rect(20, 20, 120, 120, { stroke: C.ink, sw: 1.4, r: 2 });
  s += M(170, 60, 'E‖Σ_i a_i‖² = Σ_i E‖a_i‖² + Σ_{i≠j} E[a_i·a_j]', { size: 14 }) +
    T(170, 88, L('红色交叉项按 (157) 平均为 0，', 'The red cross terms average to 0 by (157),'), { size: 12, color: C.red }) +
    T(170, 108, L('所以 n 台机器不会多出 n 倍。', 'so n machines cost no extra factor n.'), { size: 12, color: C.gray });
  return { svg: svg(W, 150, s), cap: L('和的平方 = 各自平方 + 交叉项；交叉项平均消失，只剩各块的平方。', 'Square of a sum = squares + cross terms; the cross terms vanish on average, leaving the squares.') };
});

// (160) rarer events move the score more; (168) sub-Gaussian
function lemma1Plot(L, subOnly) {
  const ax = axes(60, 22, 300, 120, [0, 4], [0, 16], { xl: 'ℓ = ln(1/p)', yl: '‖a‖²' });
  let s = ax.body + path(curve(l => 2 * l, 0, 4, ax.X, ax.Y), { stroke: C.teal, sw: 2.4 });
  if (!subOnly) s += path(curve(l => 4 * l + 2 * 0.36 * l * l, 0, 4, ax.X, ax.Y), { stroke: C.amber, sw: 2.4, dash: '6 4' });
  s += M(ax.X(3.6), ax.Y(7.2) + 18, '2vq·ℓ', { color: C.teal, anchor: 'middle' });
  if (!subOnly) s += M(ax.X(2.5), ax.Y(14.5), '4vqℓ + 2b²ℓ²', { color: C.amber, anchor: 'middle' });
  s += T(ax.X(0.1), 168, L('← 常见事件（p≈1）', '← common event (p≈1)'), { size: 11.5, color: C.gray }) +
    T(ax.X(4), 168, L('罕见事件 →', 'rare event →'), { size: 11.5, color: C.gray, anchor: 'end' }) +
    T(390, 60, subOnly ? L('次高斯（b = 0）：', 'Sub-Gaussian (b = 0):') : L('越罕见的检查，', 'The rarer the check,'), { size: 12.5, weight: 600 }) +
    T(390, 80, subOnly ? L('只剩直线，', 'only the straight line,') : L('知道它通过后', 'the more learning it passed'), { size: 12, color: C.gray }) +
    T(390, 98, subOnly ? L('没有 ℓ² 的弯曲部分', 'no ℓ² bend') : L('得分能偏得越多', 'can move the score'), { size: 12, color: C.gray });
  return svg(W, 178, s);
}
fig(160, L => ({ svg: lemma1Plot(L, false), cap: L('引理 1 用在每块上：偏移的平方被这次检查的惊讶度 ℓ 控制（实线：次高斯；虚线：Bernstein 多出的 ℓ² 项）。', 'Lemma 1 on each block: the squared shift is controlled by the surprise ℓ of its check (solid: sub-Gaussian; dashed: the extra ℓ² term under Bernstein).') }));
fig(168, L => ({ svg: lemma1Plot(L, true), cap: L('得分次高斯时，平方偏移只与块大小乘惊讶度成正比。', 'With a sub-Gaussian score the squared shift is just proportional to block size times surprise.') }));

// (161)/(162) average surprise = entropy
function entropyBars(L, highlight) {
  const leaves = [['0', 0.5], ['10', 0.25], ['11', 0.25]];
  const ax = axes(60, 30, 330, 110, [0, 1], [0, 1.6], { xl: L('概率', 'prob.'), xlMath: false, yl: L('惊讶度 ℓ（单位 ln 2）', 'surprise ℓ (units of ln 2)'), ylMath: false });
  let s = ax.body, cx = 0;
  leaves.forEach(([k, p], i) => {
    const h = Math.log2(1 / p) * 55; // bar height in px: 55 px per ln 2
    const x0 = ax.X(cx), x1 = ax.X(cx + p);
    s += rect(x0 + 1, 140 - h, x1 - x0 - 2, h, { fill: [C.blueS, C.tealS, C.purpleS][i], stroke: [C.blue, C.teal, C.purple][i], r: 2 });
    s += T((x0 + x1) / 2, 140 - h + 18, L(`叶子 ${k}`, `leaf ${k}`), { anchor: 'middle', size: 12, weight: 600 });
    s += M((x0 + x1) / 2, 136, `p=${p === 0.5 ? '½' : '¼'}`, { anchor: 'middle', size: 12, color: C.gray });
    cx += p;
  });
  s += line(ax.X(0), 140 - 1.5 * 55, ax.X(1), 140 - 1.5 * 55, { color: C.amber, dash: '6 4', sw: 2 }) +
    M(ax.X(1) + 8, 140 - 1.5 * 55 + 4, 'H = 1.5 ln 2', { color: C.amber, size: 13 }) +
    T(410, 120, highlight ? L('面积 = 平均惊讶 = 熵', 'area = average surprise = entropy') : L('各台惊讶相加', 'per-machine surprises add'), { size: 12, color: C.gray });
  return svg(W, 160, s);
}
fig(162, L => ({ svg: entropyBars(L, true), cap: L('按概率加权平均惊讶度，就是记录的熵：信息被熵卡住。', 'Averaging surprise with the leaf probabilities gives the transcript entropy, which then caps the information.') }));

// (163) sum of squares <= square of sum
fig(163, L => ({
  svg: svg(W, 150,
    rect(20, 15, 72, 72, { fill: C.blueS, stroke: '#fff', r: 2 }) + M(56, 56, 'ℓ_A²', { anchor: 'middle' }) +
    rect(92, 87, 48, 48, { fill: C.tealS, stroke: '#fff', r: 2 }) + M(116, 116, 'ℓ_B²', { anchor: 'middle' }) +
    rect(92, 15, 48, 72, { fill: C.greenS, stroke: '#fff', r: 2 }) + rect(20, 87, 72, 48, { fill: C.greenS, stroke: '#fff', r: 2 }) +
    M(116, 56, 'ℓ_Aℓ_B', { anchor: 'middle', size: 11 }) + M(56, 116, 'ℓ_Aℓ_B', { anchor: 'middle', size: 11 }) +
    rect(20, 15, 120, 120, { stroke: C.ink, sw: 1.4, r: 2 }) +
    M(170, 60, 'ℓ_A² + ℓ_B² ≤ (ℓ_A + ℓ_B)² = ln² 1/p(t)', { size: 14 }) +
    T(170, 88, L('绿色交叉块非负（惊讶度 ≥ 0），', 'The green cross pieces are ≥ 0 (surprises are ≥ 0),'), { size: 12, color: C.green }) +
    T(170, 108, L('所以大正方形盖住两个小正方形。', 'so the big square covers the two small ones.'), { size: 12, color: C.gray })),
  cap: L('把平方和换成整条记录惊讶的平方：大正方形 = 两个小正方形 + 两块非负长方形。', 'Trading the sum of squares for the squared surprise of the whole leaf: big square = two small squares + two nonnegative rectangles.'),
}));

// (165) at most 2^B leaves
fig(165, L => {
  let s = ''; const lv = 3, x0 = 30, w = 300;
  for (let d = 0; d <= lv; d++) for (let k = 0; k < 2 ** d; k++) {
    const cx = x0 + (k + 0.5) * w / 2 ** d, cy = 20 + d * 38;
    if (d < lv) for (const c of [0, 1]) s += line(cx, cy, x0 + (2 * k + c + 0.5) * w / 2 ** (d + 1), cy + 38, { color: C.line, sw: 1.2 });
    s += d === lv ? rect(cx - 9, cy - 8, 18, 16, { fill: C.amberS, stroke: C.amber, r: 3 }) : circ(cx, cy, 5, { fill: C.blueS, stroke: C.blue });
  }
  s += T(360, 60, L('每位 0 或 1，最多 B 位', 'Each bit is 0 or 1, at most B bits'), { size: 12.5, weight: 600 }) +
    M(360, 84, L('⇒ 叶子数 ≤ 2^B', '⇒ #leaves ≤ 2^B'), { size: 14, color: C.amber }) +
    M(360, 110, L('⇒ E ln² 1/p ≤ K_B', '⇒ E ln² 1/p ≤ K_B'), { size: 14 }) +
    T(30, 156, L('（图中 B = 3：8 片叶子）', '(here B = 3: 8 leaves)'), { size: 11.5, color: C.gray });
  return { svg: svg(W, 165, s), cap: L('固定随机数后，协议是一棵深度不超过 B 的二叉树，叶子至多 2^B 片；引理 2 据此控制平方惊讶。', 'With seeds fixed the protocol is a binary tree of depth ≤ B, so there are at most 2^B leaves; Lemma 2 then controls the squared surprise.') };
});

// (166) average over seeds
fig(166, L => {
  let s = '';
  ['r₁', 'r₂', 'r₃'].forEach((r, i) => {
    const x = 20 + i * 120;
    s += rect(x, 20, 100, 70, { fill: '#fff', stroke: C.line }) + T(x + 50, 40, L(`种子 ${r}`, `seed ${r}`), { anchor: 'middle', size: 12, weight: 600 }) +
      M(x + 50, 66, 'J_{T|R=r}', { anchor: 'middle', size: 13 }) + arrow(x + 50, 92, 210, 122, { sw: 1.2 });
  });
  s += rect(140, 122, 140, 30, { fill: C.tealS, stroke: C.teal }) + M(210, 142, 'J_{T,R} = E_R J_{T|R}', { anchor: 'middle', size: 13 }) +
    T(400, 60, L('随机数的分布不含 θ：', 'The seeds’ law has no θ:'), { size: 12.5, weight: 600 }) +
    T(400, 80, L('它自己没有信息，', 'no information of their own,'), { size: 12, color: C.gray }) +
    T(400, 98, L('只需按种子平均。', 'so just average over them.'), { size: 12, color: C.gray });
  return { svg: svg(W, 165, s), cap: L('每个固定种子下各证一次，再按种子的分布平均。', 'Prove the bound for each fixed seed, then average over the seed distribution.') };
});

// (170)–(173) shared and private observations
fig(170, L => ({ svg: svg(W, 136, pool(70, 4, L)), cap: L('被至少两台机器拿到的编号进共享区 𝒢（橙）；其余各归本机的私有区 V₁={1,2}、V₂={4,5}。', 'Indices held by at least two machines form the shared set 𝒢 (orange); the rest are private: V₁={1,2}, V₂={4,5}.') }));
fig(171, L => ({
  svg: svg(W, 130, stack(140, 30, 330, 34, [{ v: 1, fill: C.amberS, in: 'G = (X_3)' }, { v: 2, fill: C.tealS, in: 'V_1 = (X_1, X_2)' }, { v: 2, fill: C.blueS, in: 'V_2 = (X_4, X_5)' }], { left: L('读出数值', 'values'), leftMath: false }) +
    stack(140, 84, 330, 26, [{ v: 1, fill: '#fff', stroke: C.amber, in: 'r = 1' }, { v: 2, fill: '#fff', stroke: C.teal, in: 'q_1 = 2' }, { v: 2, fill: '#fff', stroke: C.blue, in: 'q_2 = 2' }], { left: L('计数', 'counts'), leftMath: false }) +
    M(140, 126, L('q = max q_i = 2', 'q = max q_i = 2'), { size: 13, color: C.gray })),
  cap: L('把每区的样本值读成向量，再数个数：r 是共享条数，q 是最大的私有块。', 'Read each group’s values as a vector and count them: r shared values, q the largest private block.'),
}));
fig(172, L => ({
  svg: svg(W, 110, ['G', 'V_1', 'V_2'].map((g, i) => rect(70 + i * 150, 30, 100, 44, { fill: [C.amberS, C.tealS, C.blueS][i], stroke: [C.amber, C.teal, C.blue][i] }) + M(120 + i * 150, 58, g, { anchor: 'middle', size: 15 })).join('') +
    M(195, 58, '⊥', { anchor: 'middle', size: 18, color: C.red }) + M(345, 58, '⊥', { anchor: 'middle', size: 18, color: C.red }) +
    T(280, 100, L('互不重叠的编号 ⇒ 互相独立；组内也是独立抽样', 'disjoint indices ⇒ independent groups; i.i.d. inside each'), { anchor: 'middle', size: 12, color: C.gray })),
  cap: L('设计固定后，三组用的是不同的池子编号，所以彼此独立。', 'Once the design is fixed the three groups use different pool indices, so they are independent.'),
}));
fig(173, L => ({
  svg: svg(W, 100, stack(150, 30, 270, 34, [{ v: 2, fill: C.tealS, in: L('私有 q₁ = 2', 'private q₁ = 2'), inMath: false }, { v: 1, fill: C.amberS, in: L('共享 1', 'shared 1'), inMath: false }], { left: L('机器 1 的 m = 3 条', 'machine 1’s m = 3'), leftMath: false }) +
    M(285, 92, L('q_i ≤ m，因此 q ≤ m', 'q_i ≤ m, hence q ≤ m'), { anchor: 'middle', size: 13, color: C.gray })),
  cap: L('私有块只是这台机器那 m 条数据的一部分。', 'A private block is just part of the machine’s m samples.'),
}));

// (174)–(177) Theorem 2 budget bars
function thm2(L, variant) {
  const rows = {
    174: [{ v: 1.2, fill: C.amberS, in: 'dv·r', bot: L('共享：每条 ≤ dv', 'shared: ≤ dv each') }, { v: 3, fill: C.tealS, in: '4vq·H(T|G,R)', bot: L('私有：受熵限制', 'private: capped by entropy') }, { v: 0.9, fill: C.purpleS, in: '2b²K_B', bot: L('厚尾修正', 'heavy-tail fix') }],
    176: [{ v: 1.2, fill: C.amberS, in: 'dv·r', bot: L('共享：不变', 'shared: unchanged') }, { v: 1.5, fill: C.tealS, in: '2vq·H', bot: L('系数减半', 'half the factor') }, { v: 0.9, fill: '#fff', stroke: C.purple, dash: '4 3', in: '2b²K_B', cross: true, bot: L('b = 0：没有', 'b = 0: gone') }],
    177: [{ v: 1.2, fill: C.amberS, in: 'd·r', bot: L('每条共享样本：迹 = d', 'each shared sample: trace d') }, { v: 1.5, fill: C.tealS, in: '2q·H(T|G,R)', bot: L('v = 1', 'v = 1') }],
  }[variant];
  let s = stack(120, 34, 400, 38, rows, { left: 'tr J_{T,R} ≤' });
  if (variant === 174) s += T(120, 18, L('上界 = 三块相加（加法，不是乘法）', 'upper bound = three pieces added (additive, not multiplied)'), { size: 12, color: C.gray });
  if (variant === 176) s += T(120, 18, L('次高斯得分（b = 0）', 'sub-Gaussian score (b = 0)'), { size: 12, color: C.gray });
  if (variant === 177) s += T(120, 18, L('高斯均值模型 N(θ, I)：v = 1，b = 0', 'Gaussian mean N(θ, I): v = 1, b = 0'), { size: 12, color: C.gray });
  return svg(W, 100, s);
}
fig(174, L => ({ svg: thm2(L, 174), cap: L('定理 2：共享样本按条数加信息（每条至多 dv），私有部分按“知道共享值后的通信熵”计。', 'Theorem 2: shared samples add information per sample (at most dv each); the private part is charged by the transcript entropy given the shared values.') }));
fig(175, L => ({
  svg: svg(W, 150, stack(130, 20, 300, 32, [{ v: 1.2, fill: C.amberS, in: 'dv·r' }, { v: 3, fill: C.tealS, in: '4vq·H(T|G,R)' }, { v: 0.9, fill: C.purpleS, in: '2b²K_B' }], { left: '(174)' }) +
    stack(130, 84, 400, 32, [{ v: 1.2, fill: C.amberS, in: 'dv·r' }, { v: 4.6, fill: C.tealS, stroke: C.teal, in: '4vm·H(T|R)' }, { v: 0.9, fill: C.purpleS, in: '2b²K_B' }], { left: '(175)' }) +
    T(130, 140, L('q → m（更大），H(T|G,R) → H(T|R)（更大）：界变松，但更好用', 'q → m (larger), H(T|G,R) → H(T|R) (larger): looser but easier to use'), { size: 12, color: C.gray })),
  cap: L('把私有块大小放宽成 m、把条件熵放宽成 H(T|R)，中间一段变长，换来一个能直接代入的形式。', 'Relaxing q to m and H(T|G,R) to H(T|R) lengthens the middle piece, in exchange for a form that plugs straight in.'),
}));
fig(176, L => ({ svg: thm2(L, 176), cap: L('次高斯时：共享项不变，私有项系数从 4 变 2，Bernstein 修正消失。', 'Sub-Gaussian case: shared term unchanged, private factor 4 → 2, Bernstein correction gone.') }));
fig(177, L => ({ svg: thm2(L, 177), cap: L('高斯均值例子：常数全部显式。', 'Gaussian mean example: every constant explicit.') }));

// (178) data processing: more observed => more information
fig(178, L => ({
  svg: svg(W, 130,
    rect(20, 30, 110, 60, { fill: C.faint, stroke: C.line }) + T(75, 56, L('数据', 'data'), { anchor: 'middle', weight: 600 }) + M(75, 76, 'G, V_1, V_2', { anchor: 'middle', size: 12 }) +
    arrow(130, 60, 200, 60) + rect(200, 40, 70, 40, { fill: '#fff', stroke: C.blue }) + M(235, 65, 'T', { anchor: 'middle', size: 15 }) +
    arrow(270, 60, 360, 60) + M(320, 52, 'T', { anchor: 'middle', color: C.gray }) +
    line(75, 90, 75, 112, { color: C.amber, dash: '4 3' }) + line(75, 112, 380, 112, { color: C.amber, dash: '4 3' }) + arrow(380, 112, 380, 82, { color: C.amber, arrowColor: 'a', dash: '4 3' }) +
    T(230, 128, L('额外把 G 也交给融合中心（只为算上界）', 'also hand G to the fusion center (only for the bound)'), { anchor: 'middle', size: 11.5, color: C.amber }) +
    rect(360, 40, 120, 40, { fill: C.amberS, stroke: C.amber }) + M(420, 65, 'J_T ⪯ J_{G,T}', { anchor: 'middle', size: 13 })),
  cap: L('多看一份数据只会让信息更多，所以 J_{G,T} 是 J_T 的合法上界。', 'Seeing more can only add information, so J_{G,T} is a valid upper bound on J_T.'),
}));
fig(179, L => ({
  svg: svg(W, 90, stack(150, 26, 360, 36, [{ v: 1.4, fill: C.amberS, in: 'tr J_G', bot: L('直接看共享值', 'seeing the shared values') }, { v: 3, fill: C.tealS, in: 'E_G tr J_{T|G}', bot: L('知道共享值后记录还说了多少', 'what T adds once G is known') }], { left: 'tr J_{G,T} =' })),
  cap: L('链式法则：联合信息 = 共享值本身的信息 + 知道共享值后记录的额外信息。', 'Chain rule: joint information = information in G itself + what the transcript adds once G is known.'),
}));
fig(180, L => ({
  svg: svg(W, 120,
    circ(110, 60, 20, { fill: C.amberS, stroke: C.amber, sw: 2.4 }) + T(110, 66, '3', { anchor: 'middle', weight: 700 }) +
    arrow(132, 52, 220, 30, { color: C.teal, arrowColor: 't' }) + arrow(132, 68, 220, 92, { color: C.blue, arrowColor: 'b' }) +
    T(226, 34, L('机器 1', 'machine 1'), { size: 12, color: C.teal }) + T(226, 96, L('机器 2', 'machine 2'), { size: 12, color: C.blue }) +
    M(330, 54, 'J_G = r · I_X', { size: 15 }) + T(330, 78, L('被两台拿到，仍只算一份数据', 'held twice, still one sample'), { size: 12, color: C.gray })),
  cap: L('共享编号无论被几台机器拿到，都只贡献一份独立数据的信息。', 'However many machines hold a shared index, it contributes the information of one sample.'),
}));
fig(182, L => ({
  svg: svg(W, 130,
    rect(40, 30, 120, 60, { fill: C.amberS, stroke: C.amber }) + M(100, 56, 'G = g', { anchor: 'middle', size: 15 }) + T(100, 78, L('固定（钉住）', 'fixed (pinned)'), { anchor: 'middle', size: 12, color: C.amber }) +
    rect(210, 30, 120, 60, { fill: C.tealS, stroke: C.teal, dash: '5 3' }) + M(270, 56, 'V_1', { anchor: 'middle', size: 15 }) + T(270, 78, L('仍随机', 'still random'), { anchor: 'middle', size: 12, color: C.teal }) +
    rect(380, 30, 120, 60, { fill: C.blueS, stroke: C.blue, dash: '5 3' }) + M(440, 56, 'V_2', { anchor: 'middle', size: 15 }) + T(440, 78, L('仍随机', 'still random'), { anchor: 'middle', size: 12, color: C.blue }) +
    M(355, 62, '⊥', { anchor: 'middle', size: 18, color: C.red }) +
    T(270, 118, L('给定 G = g，私有块的分布不变、彼此独立 → 回到独立块', 'given G = g the private blocks keep their law and stay independent → back to independent blocks'), { anchor: 'middle', size: 12, color: C.gray })),
  cap: L('把共享值钉住后，剩下的私有块仍独立同分布，这正是引理 3 需要的设定。', 'Pinning the shared values leaves independent private blocks, exactly the setting of Lemma 3.'),
}));
fig(183, L => ({
  svg: svg(W, 120,
    rect(30, 26, 220, 64, { fill: '#fff', stroke: C.teal }) + T(140, 50, L('机器 1 的规则', 'machine 1’s rule'), { anchor: 'middle', size: 12, weight: 600 }) +
    M(140, 74, 'f(V_1, X_3, history)', { anchor: 'middle', size: 13 }) +
    arrow(255, 58, 305, 58, { sw: 2 }) + M(280, 42, 'X_3 = g', { anchor: 'middle', size: 12, color: C.amber }) +
    rect(310, 26, 220, 64, { fill: C.tealS, stroke: C.teal }) + M(420, 62, 'f_g(V_1, history)', { anchor: 'middle', size: 13 }) +
    T(280, 112, L('共享值变成写死的常数；参数只通过私有数据进入', 'the shared value becomes a hard-coded constant; θ enters only through private data'), { anchor: 'middle', size: 12, color: C.gray })),
  cap: L('固定共享值与随机数后，每台机器的规则只读私有块，黑板协议照样能重放。', 'With the shared values and seeds fixed, each rule reads only its private block and the blackboard protocol replays as before.'),
}));
fig(184, L => ({
  svg: svg(W, 90, [L('固定 g、种子', 'fix g and seeds'), L('独立私有块，≤ q 条', 'independent private blocks, ≤ q each'), L('套用引理 3', 'apply Lemma 3')].map((t, i) =>
    rect(20 + i * 180, 24, 160, 40, { fill: [C.amberS, C.tealS, C.blueS][i], stroke: [C.amber, C.teal, C.blue][i] }) + T(100 + i * 180, 49, t, { anchor: 'middle', size: 12.5, weight: 600 }) + (i < 2 ? arrow(180 + i * 180, 44, 198 + i * 180, 44, { sw: 2 }) : '')).join('') +
    M(280, 84, '4vq·H(T | G = g, R) + 2b²K_B', { anchor: 'middle', size: 13, color: C.teal })),
  cap: L('III-D 的关键一步：固定共享值后，直接借用 III-C 的引理 3。', 'The key step of III-D: once the shared values are fixed, reuse Lemma 3 from III-C.'),
}));
fig(186, L => ({
  svg: svg(W, 90, stack(150, 26, 370, 36, [{ v: 1.2, fill: C.amberS, in: 'r·tr I_X', bot: L('(180) 共享样本', '(180) shared samples') }, { v: 3, fill: C.tealS, in: '4vq·H(T|G,R=ρ)', bot: L('(185) 私有部分', '(185) private part') }, { v: 0.9, fill: C.purpleS, in: '2b²K_B' }], { left: 'tr J_{T|R=ρ} ≤' })),
  cap: L('把两块拼回 (181)：固定种子下的记录信息被卡住。', 'Put the two pieces back into (181): the transcript information for a fixed seed is capped.'),
}));

// (188) conditioning reduces entropy
fig(188, L => ({
  svg: svg(W, 150,
    `<circle cx="130" cy="82" r="62" fill="${C.tealS}" stroke="${C.teal}" stroke-width="1.6"/><circle cx="215" cy="82" r="62" fill="${C.amberS}" stroke="${C.amber}" stroke-width="1.6" opacity=".7"/>` +
    M(102, 86, 'H(T|G,R)', { anchor: 'middle', size: 12 }) + M(173, 86, 'I(T;G|R)', { anchor: 'middle', size: 10.5 }) + M(245, 86, 'G', { anchor: 'middle', size: 14 }) +
    M(110, 14, L('左圈：H(T|R)', 'left circle: H(T|R)'), { anchor: 'middle', size: 12.5, color: C.teal }) +
    M(330, 50, 'H(T|R) − H(T|G,R) = I(T;G|R) ≥ 0', { size: 13.5 }) +
    T(330, 76, L('知道共享值，记录平均更确定；', 'Knowing G makes T more predictable;'), { size: 12, color: C.gray }) +
    T(330, 94, L('少掉的正是两者的互信息。', 'the drop is their mutual information.'), { size: 12, color: C.gray })),
  cap: L('左圈是记录的熵；和 G 重叠的部分是互信息，去掉它剩下 H(T|G,R)，所以 H(T|G,R) ≤ H(T|R)。', 'The left circle is the transcript entropy; the overlap with G is the mutual information, and removing it leaves H(T|G,R) ≤ H(T|R).'),
}));

// (190) Gaussian score
fig(190, L => {
  const ax = axes(60, 20, 260, 100, [-3, 3], [0, 1.1], { xl: 'ξ = X − θ' });
  let s = ax.body + path(curve(gauss, -3, 3, ax.X, ax.Y), { stroke: C.blue, sw: 2.2 }) + line(ax.X(0), ax.Y(0), ax.X(0), ax.Y(1), { dash: '3 3', sw: 1 });
  s += arrow(ax.X(0), ax.Y(0.6), ax.X(1), ax.Y(0.6), { color: C.amber, arrowColor: 'a' }) + arrow(ax.X(0), ax.Y(0.6), ax.X(-1), ax.Y(0.6), { color: C.amber, arrowColor: 'a' }) +
    T(ax.X(0), ax.Y(0.6) - 8, L('标准差 1', 'sd 1'), { anchor: 'middle', size: 11.5, color: C.amber }) +
    M(360, 50, 'ξ_θ(X) ~ N(0, I_d)', { size: 14 }) + M(360, 74, 'I_X = I_d,  v = 1,  b = 0', { size: 13, color: C.gray }) +
    T(360, 98, L('高斯得分本身就是标准高斯', 'the Gaussian score is itself standard normal'), { size: 12, color: C.gray });
  return { svg: svg(W, 145, s), cap: L('高斯均值模型里，得分就是“观测减均值”，在真参数下是标准高斯，所以 v = 1、b = 0。', 'In the Gaussian mean model the score is observation minus mean, standard normal under the true parameter, so v = 1 and b = 0.') };
});
fig(191, L => ({ svg: svg(W, 130, pool(70, 4, L, 'same')), cap: L('极端情形：每条可见数据都被共享，私有块为空，信息至多是直接看 r 条数据（q = 0）。', 'Extreme case: every visible sample is shared, no private block, so the information is at most that of the r samples (q = 0).') }));

// (192) average over random designs
fig(192, L => {
  const P = [1 / 20, 9 / 20, 9 / 20, 1 / 20];
  const ax = axes(60, 22, 260, 110, [-0.5, 3.5], [0, 0.5], { xl: 'r(S)', yl: L('概率', 'prob.'), ylMath: false });
  let s = ax.body;
  P.forEach((p, k) => { s += rect(ax.X(k) - 22, ax.Y(p), 44, ax.Y(0) - ax.Y(p), { fill: C.amberS, stroke: C.amber, r: 2 }) + T(ax.X(k), ax.Y(0) + 16, String(k), { anchor: 'middle', size: 12, color: C.gray }); });
  s += line(ax.X(1.5), ax.Y(0), ax.X(1.5), ax.Y(0.5), { color: C.teal, dash: '6 4', sw: 2 }) + M(ax.X(1.5) + 6, ax.Y(0.48), 'r̄ = 1.5', { color: C.teal });
  s += T(350, 50, L('例：N = 6，n = 2，m = 3', 'Example: N = 6, n = 2, m = 3'), { size: 12.5, weight: 600 }) +
    T(350, 72, L('每次随机抽清单，共享条数不同；', 'each random design shares a different number;'), { size: 12, color: C.gray }) +
    T(350, 90, L('平均下来就是 r̄ = m²/N。', 'on average r̄ = m²/N.'), { size: 12, color: C.gray });
  return { svg: svg(W, 160, s), cap: L('对随机抽样清单取平均：共享条数 r(S) 变成它的期望 r̄，这就是下界里 r̄ 的来源。', 'Averaging over random designs turns the shared count r(S) into its expectation r̄, which is how r̄ enters the lower bound.') };
});
// (193) average over the prior
fig(193, L => {
  const ax = axes(60, 20, 260, 100, [0, 1], [0, 2.2], { xl: 'θ', yl: 'π(θ)' });
  let s = ax.body + path(curve(t => 2 * Math.sin(Math.PI * t) ** 2, 0, 1, ax.X, ax.Y), { stroke: C.purple, sw: 2.2 });
  s += T(ax.X(0), 140, '0', { anchor: 'middle', size: 12, color: C.gray }) + T(ax.X(1), 140, '1', { anchor: 'middle', size: 12, color: C.gray });
  s += M(350, 50, 'π(θ) = 2 sin²(πθ)', { size: 14 }) + T(350, 74, L('按先验平均每个 θ 的信息界；', 'Average the bound over θ with the prior;'), { size: 12, color: C.gray }) +
    M(350, 96, 'H(T|S,R) → h_T = H(T|Θ,S,R)', { size: 13, color: C.teal });
  return { svg: svg(W, 150, s), cap: L('再按光滑先验（边界处为 0）对参数平均，熵变成“知道参数后”的剩余熵 h_T。', 'Averaging over the smooth prior (zero at the edges) turns the entropy into h_T, what remains once the parameter is known.') };
});

// (194) the two jobs of the bits
fig(194, L => ({
  svg: svg(W, 110, stack(120, 34, 420, 38, [{ v: 3, fill: C.blueS, in: 'I(Θ; T | W)', bot: L('告诉融合中心 θ 在哪', 'tells where θ is') }, { v: 2, fill: C.tealS, in: 'h_T = H(T | Θ, W)', bot: L('θ 固定后剩下的随机性', 'randomness left once θ is fixed') }], { left: 'B ln 2 ≥' }) +
    T(120, 18, L('每个比特只能做两件事之一（式 117）', 'each bit does one of two jobs (eq. 117)'), { size: 12, color: C.gray })),
  cap: L('总比特预算 = 关于 θ 的信息 + 剩余熵 h_T；误差越小，第一块越大，留给 h_T 的越少。', 'Total budget = information about θ + leftover entropy h_T; the smaller the risk, the larger the first piece and the less room for h_T.'),
}));
fig(195, L => ({
  svg: svg(W, 95, stack(150, 26, 380, 36, [{ v: 1.2, fill: C.amberS, in: 'dv·r̄' }, { v: 3, fill: C.tealS, in: '4vm·h_T', bot: L('只有这块随 h_T 变', 'only this piece depends on h_T') }, { v: 0.9, fill: C.purpleS, in: '2b²K_B' }], { left: 'E_Θ tr J_{T,S,R} ≤' })),
  cap: L('信息上界的最终形式：共享样本、剩余熵乘块大小、厚尾代价三部分。', 'Final form of the information bound: shared samples, block size times leftover entropy, and the heavy-tail cost.'),
}));

// (197) / (203) squeeze plot
function squeeze(L, emph) {
  const ax = axes(70, 20, 300, 130, [0, 1], [0, 1], { xl: L('风险 D（对数刻度）', 'risk D (log scale)'), xlMath: false });
  const lhs = x => 0.08 / (x + 0.03) * 1.4, rhs = x => 0.18 + 0.32 * x;
  let s = ax.body;
  const xs = 0.36;
  s += path(`M${ax.X(0)},${ax.Y(0)}L${ax.X(0)},${ax.Y(1)}L${ax.X(xs)},${ax.Y(1)}L${ax.X(xs)},${ax.Y(0)}Z`, { fill: C.redS, stroke: 'none', op: 0.8 });
  s += path(curve(x => Math.min(1.02, lhs(x)), 0.05, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 }) + path(curve(rhs, 0, 1, ax.X, ax.Y), { stroke: C.teal, sw: 2.4 });
  s += M(ax.X(0.42), ax.Y(0.93), 'd²/D', { color: C.blue }) + M(ax.X(0.82), ax.Y(rhs(0.82)) - 10, 'A m h_T + Q', { color: C.teal, anchor: 'middle' });
  s += T(ax.X(xs / 2), ax.Y(0.12), L('不可能', 'impossible'), { anchor: 'middle', size: 12, weight: 700, color: C.red });
  s += line(ax.X(xs), ax.Y(0), ax.X(xs), ax.Y(1), { color: C.red, dash: '4 3' }) + M(ax.X(xs), 168, 'D_{min}', { anchor: 'middle', color: C.red });
  s += rect(400, 30, 14, 4, { fill: C.blue, r: 1 }) + T(420, 36, L('需要的信息', 'information needed'), { size: 12, color: C.blue, weight: 600 }) +
    T(420, 52, L('（van Trees，D 越小越大）', '(van Trees; grows as D shrinks)'), { size: 11, color: C.gray }) +
    rect(400, 66, 14, 4, { fill: C.teal, r: 1 }) + T(420, 72, L('预算允许的信息', 'information allowed'), { size: 12, color: C.teal, weight: 600 }) +
    T(420, 88, emph ? L('（只有余量 s 能变成信息）', '(only the surplus s helps)') : L('（D 越小越小）', '(shrinks as D shrinks)'), { size: 11, color: C.gray }) +
    T(400, 116, emph ? L('所以下界看 s 不看 B', 'so the bound sees s, not B') : L('交点 = 最小可能误差', 'crossing = smallest D'), { size: 12, weight: 600, color: C.red });
  return svg(W, 178, s);
}
fig(197, L => ({ svg: squeeze(L, false), cap: L('“需要的信息”（蓝）随误差变小而暴涨，“预算允许的信息”（绿）却在变小；交点左边的误差不可能达到。', 'The information needed (blue) explodes as D shrinks while the information the budget allows (green) shrinks; risks left of the crossing are impossible.') }));
fig(203, L => ({ svg: squeeze(L, true), cap: L('代入熵预算后，同一个夹逼：右边由余量 s 决定，所以结论里出现 s 而不是 B。', 'The same squeeze after substituting the budget: the right side is driven by the surplus s, which is why s, not B, appears in the result.') }));

// (198) entropy budget vs risk
fig(198, L => {
  const ax = axes(70, 20, 280, 110, [0, 1], [0, 1], { xl: 'ln D', yl: L('h_T 的上限', 'cap on h_T'), ylMath: false });
  let s = ax.body + path(curve(x => 0.15 + 0.75 * x, 0, 1, ax.X, ax.Y), { stroke: C.teal, sw: 2.4 });
  s += M(ax.X(0.62), ax.Y(0.75), '(B/d) ln 2 + c_π + ½ ln(D/d)', { size: 12.5, color: C.teal, anchor: 'end' });
  s += arrow(ax.X(0.75), ax.Y(0.2), ax.X(0.3), ax.Y(0.2), { color: C.amber, arrowColor: 'a' }) + T(ax.X(0.52), ax.Y(0.2) + 18, L('要求误差更小', 'demand smaller risk'), { anchor: 'middle', size: 11.5, color: C.amber });
  s += T(380, 60, L('误差每缩小 e² 倍，', 'Each e² cut in risk'), { size: 12, weight: 600 }) + T(380, 80, L('每坐标就少 1 nat', 'removes 1 nat per'), { size: 12, color: C.gray }) + T(380, 98, L('可用的剩余熵', 'coordinate of leftover entropy'), { size: 12, color: C.gray });
  return { svg: svg(W, 160, s), cap: L('熵预算：剩余熵的上限随 ln D 线性下降，要求越小的误差，留给 h_T 的空间越少。', 'Entropy budget: the cap on h_T falls linearly in ln D, so a smaller target risk leaves less room for h_T.') };
});

// (200) normalized risk
fig(200, L => {
  let s = line(60, 70, 470, 70, { arrow: 'g', sw: 1.2 }) + T(478, 74, 'D', { size: 13, color: C.gray });
  s += line(250, 62, 250, 78, { color: C.ink, sw: 2 }) + M(250, 96, 'd/m', { anchor: 'middle', size: 13 }) + T(250, 52, L('一台机器自己能做到的', 'what one machine achieves'), { anchor: 'middle', size: 11.5, color: C.gray });
  s += T(150, 112, 'x < 1', { anchor: 'middle', size: 12.5, color: C.teal, weight: 700 }) + T(150, 128, L('比单机好', 'better than one machine'), { anchor: 'middle', size: 11.5, color: C.teal });
  s += T(370, 112, 'x > 1', { anchor: 'middle', size: 12.5, color: C.amber, weight: 700 }) + T(370, 128, L('比单机差', 'worse than one machine'), { anchor: 'middle', size: 11.5, color: C.amber });
  s += M(60, 20, 'x = mD / d = D / (d/m)', { size: 14 });
  return { svg: svg(W, 140, s), cap: L('把误差和“单机尺度” d/m 相比，得到无量纲的 x。', 'Compare the risk with the one-machine scale d/m to get the dimensionless x.') };
});

// (201)/(202)/(225) cancellation of ½ ln m
function cancel(L, done) {
  let s = stack(170, 18, 340, 34, [{ v: 2.2, fill: C.tealS, in: 's ln 2', bot: L('余量', 'surplus') }, { v: 1.6, fill: C.amberS, in: '½ ln m', bot: L('定位成本', 'localization cost'), cross: done }], { left: '(B/d) ln 2 =' });
  s += stack(170, 92, 340, 34, [{ v: 2.2, fill: C.blueS, in: '½ ln x', bot: L('相对单机的误差', 'risk vs one machine') }, { v: 1.6, fill: C.amberS, in: '− ½ ln m', cross: done }], { left: '½ ln(D/d) =' });
  if (done) s += M(170, 164, 'h_T / d ≤ s ln 2 + c_π + ½ ln x', { size: 14, color: C.teal });
  else s += T(170, 164, L('两边各有一块 ½ ln m，符号相反', 'each side carries ½ ln m, with opposite signs'), { size: 12, color: C.gray });
  return svg(W, 176, s);
}
fig(201, L => ({ svg: cancel(L, false), cap: L('把总位数拆成“余量 + 定位成本”，把误差拆成“相对误差 + 单机尺度”。', 'Split the bits into surplus + localization cost, and the risk into relative risk + one-machine scale.') }));
fig(202, L => ({ svg: cancel(L, true), cap: L('两块 ½ ln m 抵消：定位到单机精度的那部分比特，不留给精修。剩下的只有余量 s。', 'The two ½ ln m pieces cancel: the bits spent localizing to one-machine accuracy are gone, and only the surplus s is left.') }));
fig(225, L => ({ svg: cancel(L, true), cap: L('高斯情形同样抵消：ln m 消掉定位成本，留下 −ln t。', 'The same cancellation in the Gaussian case: ln m removes the localization cost and leaves −ln t.') }));

// (205)/(206)/(211) inverting t + ln t <= C F
function tlnt(L, cases) {
  const ax = axes(60, 20, 300, 130, [0.05, 6], [-2, 8], { xl: 't' });
  let s = ax.body + line(ax.X(0.05), ax.Y(0), ax.X(6), ax.Y(0), { color: C.line, sw: 1 });
  s += path(curve(t => t + Math.log(t), 0.12, 6, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 }) + path(curve(t => t, 0.05, 6, ax.X, ax.Y), { stroke: C.gray, sw: 1.4, dash: '5 4' });
  s += line(ax.X(0.05), ax.Y(5), ax.X(6), ax.Y(5), { color: C.amber, sw: 2 }) + M(ax.X(6) + 4, ax.Y(5) + 4, 'C_1F', { color: C.amber });
  const tc = 3.69; s += line(ax.X(tc), ax.Y(-2), ax.X(tc), ax.Y(5), { color: C.red, dash: '4 3' }) + M(ax.X(tc), ax.Y(-2) + 16, L('t 的上限', 'max t'), { anchor: 'middle', size: 12, color: C.red });
  s += M(ax.X(5.2), ax.Y(7.6), 't + ln t', { color: C.blue }) + M(ax.X(4.9), ax.Y(4.3), 't', { color: C.gray });
  if (cases) {
    s += line(ax.X(1), ax.Y(-2), ax.X(1), ax.Y(8), { color: C.teal, dash: '2 3', sw: 1.4 });
    s += T(400, 60, L('t ≥ 1：ln t ≥ 0，直接丢掉', 't ≥ 1: ln t ≥ 0, drop it'), { size: 12, color: C.teal, weight: 600 }) + T(400, 84, L('t < 1：F ≥ 1 已经盖住 t', 't < 1: F ≥ 1 already covers t'), { size: 12, color: C.teal, weight: 600 });
  } else {
    s += T(400, 60, L('t ∝ 1/误差', 't ∝ 1/risk'), { size: 12.5, weight: 600 }) + T(400, 80, L('t + ln t 和 t 几乎一样', 't + ln t ≈ t'), { size: 12, color: C.gray }) + T(400, 98, L('卡住 t ⇒ 卡住误差', 'cap t ⇒ cap the risk'), { size: 12, color: C.gray });
  }
  return svg(W, 178, s);
}
fig(205, L => ({ svg: tlnt(L, false), cap: L('改用 t = 2/(Ax)（与误差成反比）：t + ln t 增长得和 t 差不多，所以上限 C₁F 直接给出 t 的上限。', 'Switch to t = 2/(Ax), inversely proportional to the risk: t + ln t grows like t, so the cap C₁F caps t.') }));
fig(211, L => ({ svg: tlnt(L, true), cap: L('分两种情况取逆：t ≥ 1 时扔掉对数；t < 1 时 F ≥ 1 已足够。', 'Invert in two cases: for t ≥ 1 drop the log; for t < 1 the fact F ≥ 1 suffices.') }));

// (209) F and (212) the denominator
fig(209, L => ({ svg: svg(W, 90, stack(70, 26, 460, 36, [{ v: 0.8, fill: C.faint, in: '1' }, { v: 2, fill: C.tealS, in: 's_+', bot: L('余量', 'surplus') }, { v: 1.4, fill: C.amberS, in: 'r̄/m', bot: L('共享规模', 'sharing') }, { v: 1.4, fill: C.purpleS, in: '(B+1)²/m', bot: L('厚尾修正', 'heavy tail') }], { left: 'F =' })), cap: L('把余量、共享规模、厚尾修正打包成一个尺度 F（加 1 保证 F ≥ 1）。', 'Bundle surplus, sharing and the heavy-tail correction into one scale F (the 1 keeps F ≥ 1).') }));
fig(212, L => ({
  svg: svg(W, 110, stack(110, 30, 420, 36, [{ v: 1, fill: C.faint, in: 'm', bot: L('单机', 'one machine') }, { v: 2, fill: C.tealS, in: 'm·s_+', bot: L('精修', 'refinement') }, { v: 1.3, fill: C.amberS, in: 'r̄', bot: L('共享', 'shared') }, { v: 1.3, fill: C.purpleS, stroke: C.red, in: '(B+1)²', bot: L('多出来的，下一步去掉', 'extra, removed next'), botColor: C.red }], { left: 'D ≳ d /' })),
  cap: L('取逆得到误差下界：分母比目标多了一项 (B+1)²。', 'Inverting gives the risk bound, with one extra term (B+1)² in the denominator.'),
}));

// (214)/(215) case m >= n^2
fig(214, L => ({
  svg: svg(W, 120,
    T(20, 22, L('情况一：m ≥ n²（本地数据很多）', 'Case 1: m ≥ n² (big local blocks)'), { size: 12.5, weight: 700 }) +
    rect(130, 40, 120, 26, { fill: C.purpleS, stroke: C.purple }) + M(190, 58, '(B+1)²', { anchor: 'middle' }) +
    M(270, 58, '≤ (k+1)² n² ≤ (k+1)² m', { size: 13.5 }) +
    rect(130, 80, 380, 26, { fill: C.faint, stroke: C.line }) + M(320, 98, 'm(1+s_+) + r̄', { anchor: 'middle' }) +
    T(122, 98, L('已有', 'already'), { anchor: 'end', size: 12, color: C.gray }) + T(122, 58, L('多余', 'extra'), { anchor: 'end', size: 12, color: C.gray })),
  cap: L('B = nk，所以 (B+1)² 最多是 n² 的常数倍；m ≥ n² 时它被分母里已有的 m 吸收。', 'B = nk, so (B+1)² is at most a constant times n²; when m ≥ n² it is absorbed by the m already in the denominator.'),
}));
fig(215, L => ({ svg: svg(W, 90, stack(110, 26, 420, 36, [{ v: 4, fill: C.tealS, in: 'm(1+s_+) + r̄' }, { v: 1.3, fill: C.purpleS, in: '(B+1)²' }], { left: '≤ [1+(k+1)²] ×' }) + T(110, 84, L('整体只放大一个常数，量级不变', 'only a constant factor, same order'), { size: 12, color: C.gray })), cap: L('情况一：把 (B+1)² 并进去只改变常数。', 'Case 1: folding (B+1)² in changes only the constant.') }));
// (216)/(217) case m < n^2
fig(216, L => ({
  svg: svg(W, 110, T(20, 22, L('情况二：m < n²', 'Case 2: m < n²'), { size: 12.5, weight: 700 }) +
    stack(150, 38, 380, 36, [{ v: 0.7, fill: C.amberS, in: '½log₂m', bot: L('≤ log₂ n：很小', '≤ log₂ n: small') }, { v: 4, fill: C.tealS, in: L('余量 s ≥ nk/(2d)', 'surplus s ≥ nk/(2d)'), inMath: false, bot: L('与 n 同阶', 'of order n') }], { left: L('每坐标 nk/d 位', 'nk/d bits per coord.'), leftMath: false })),
  cap: L('本地数据不多时，定位成本只有对数级，预算的大半都是余量。', 'With small local blocks the localization cost is only logarithmic, so most of the budget is surplus.'),
}));
fig(217, L => ({ svg: svg(W, 110, T(20, 22, L('n 足够大时 log₂ n ≤ nk/(2d)', 'for large n, log₂ n ≤ nk/(2d)'), { size: 12.5, weight: 700 }) + stack(150, 38, 380, 36, [{ v: 1, fill: C.amberS, in: L('≤ 一半', '≤ half'), inMath: false, bot: L('定位', 'localization') }, { v: 1, fill: C.tealS, in: L('≥ 一半', '≥ half'), inMath: false, bot: L('余量', 'surplus') }], { left: L('每坐标预算', 'budget per coord.'), leftMath: false })), cap: L('机器足够多时，对数级的定位成本花不掉一半预算。', 'With enough machines the logarithmic localization cost cannot use up half the budget.') }));
// (218)/(219) regimes along m
function regimes(L) {
  let s = line(40, 70, 520, 70, { arrow: 'g', sw: 1.4 }) + M(528, 74, 'm', { color: C.gray });
  s += line(280, 58, 280, 82, { color: C.ink, sw: 2 }) + M(280, 100, 'n²', { anchor: 'middle' });
  s += rect(42, 34, 234, 26, { fill: C.blueS, stroke: C.blue }) + T(159, 52, L('访问项 d/(nm) 已更大', 'access term d/(nm) already larger'), { anchor: 'middle', size: 12 });
  s += rect(284, 34, 234, 26, { fill: C.tealS, stroke: C.teal }) + T(401, 52, L('(B+1)² 被 m 吸收', '(B+1)² absorbed by m'), { anchor: 'middle', size: 12 });
  s += M(280, 128, 'R_{BB} ≳ d / [m(1+s_+) + r̄]', { anchor: 'middle', size: 14, color: C.amber });
  return svg(W, 140, s);
}
fig(219, L => ({ svg: regimes(L), cap: L('两种情况覆盖了所有 m：第四条下限在任何本地数据规模下都成立。', 'The two cases cover every m, so the fourth lower bound holds at any local sample size.') }));

// (220) four limits, take the largest
fig(220, L => {
  const terms = [['1/N', L('池子大小', 'pool size'), 0.35, C.blue], ['1/(nm)', L('总访问量', 'total accesses'), 0.5, C.teal], ['2^{−2B/d}', L('总比特', 'total bits'), 0.2, C.purple], ['1/[m(1+s_+)+r̄]', L('定位 + 精修', 'localize + refine'), 0.8, C.amber]];
  let s = '';
  terms.forEach(([m, lab, v, c], i) => {
    const y = 18 + i * 32, top = i === 3;
    s += T(130, y + 16, lab, { anchor: 'end', size: 12, color: C.gray }) + rect(140, y, v * 300, 22, { fill: top ? C.amberS : C.faint, stroke: top ? C.amber : C.line, sw: top ? 2.2 : 1.2 }) + M(148 + v * 300, y + 16, m, { size: 13, color: top ? C.amber : C.ink });
  });
  s += T(140, 152, L('风险 ≥ c·d × 四者中最大的一个（这里假设第四项最大）', 'risk ≥ c·d × the largest of the four (here the fourth wins)'), { size: 12, color: C.gray });
  return { svg: svg(W, 160, s), cap: L('四条限制同时成立，误差至少是其中最大的那条：这就是下界包络 ℒ。', 'All four limits hold at once, so the risk is at least the largest of them: the lower envelope ℒ.') };
});

// (221) Gaussian info bound
fig(221, L => ({ svg: svg(W, 90, stack(150, 26, 370, 36, [{ v: 1.2, fill: C.amberS, in: 'd·r̄', bot: L('共享', 'shared') }, { v: 2, fill: C.tealS, in: '2m·h_T', bot: L('系数 2m（次高斯）', 'factor 2m (sub-Gaussian)') }], { left: 'E_Θ tr J ≤' })), cap: L('高斯模型没有厚尾项，信息上界只剩两块。', 'The Gaussian model has no heavy-tail term, so only two pieces remain.') }));
// (223) t = d/(mD)
fig(223, L => {
  const ax = axes(70, 20, 280, 110, [0.2, 3], [0, 5], { xl: 'D / (d/m)', yl: 't' });
  let s = ax.body + path(curve(x => 1 / x, 0.2, 3, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  s += M(380, 60, 't = d / (mD)', { size: 14 }) + T(380, 84, L('t 越大，误差越小', 'larger t = smaller risk'), { size: 12, color: C.gray });
  return { svg: svg(W, 150, s), cap: L('t 是“相对单机尺度的误差”的倒数。', 't is the reciprocal of the risk measured in one-machine units.') };
});
// (227)–(229) Lambert W
function lambert(L, note) {
  const ax = axes(60, 20, 300, 130, [0, 2.2], [0, 18], { xl: 't', yl: 'y' });
  let s = ax.body + path(curve(t => t * Math.exp(t), 0, 2.2, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  const y0 = 10, t0 = W0(y0);
  s += line(ax.X(0), ax.Y(y0), ax.X(t0), ax.Y(y0), { color: C.amber, dash: '4 3', sw: 1.8 }) + line(ax.X(t0), ax.Y(y0), ax.X(t0), ax.Y(0), { color: C.amber, dash: '4 3', sw: 1.8, arrow: 'a' });
  s += M(ax.X(0) + 6, ax.Y(y0) - 6, 'y = e^z', { color: C.amber, size: 12.5 }) + M(ax.X(t0), ax.Y(0) + 16, 'W_0(y)', { anchor: 'middle', color: C.amber, size: 12.5 });
  s += M(ax.X(1.7), ax.Y(15), 'y = t e^t', { color: C.blue });
  s += T(400, 60, note[0], { size: 12.5, weight: 600 }) + T(400, 80, note[1], { size: 12, color: C.gray }) + T(400, 98, note[2], { size: 12, color: C.gray });
  return svg(W, 178, s);
}
fig(227, L => ({ svg: lambert(L, [L('t + ln t ≤ z', 't + ln t ≤ z'), L('⇔ t e^t ≤ e^z', '⇔ t e^t ≤ e^z'), L('曲线递增 ⇒ t ≤ W₀(e^z)', 'increasing ⇒ t ≤ W₀(e^z)')]), cap: L('把对数移到左边后，右边每一项都能直接算出来，下一步取指数。', 'With the log moved left, every term on the right is computable; next, exponentiate.') }));
fig(229, L => ({ svg: lambert(L, [L('W₀ = t e^t 的反函数', 'W₀ inverts t e^t'), L('从纵轴的 y 出发，', 'Start at height y,'), L('横着走到曲线再落下', 'go across to the curve, then down')]), cap: L('Lambert W 函数：已知 y，求满足 t e^t = y 的正数 t。', 'The Lambert W function: given y, find the positive t with t e^t = y.') }));
// (230) explicit bound vs surplus
fig(230, L => {
  const ax = axes(70, 24, 300, 126, [0, 20], [0, 0.45], { xl: L('余量 s', 'surplus s'), xlMath: false, yl: L('下界 ÷ (d/m)', 'bound ÷ (d/m)'), ylMath: false });
  const c = Math.log(Math.PI * Math.E ** 3 / 2);
  let s = ax.body + path(curve(sv => 1 / W0(Math.exp(2 * sv * Math.LN2 + c)), 0, 20, ax.X, ax.Y), { stroke: C.blue, sw: 2.6 });
  s += path(curve(sv => 1 / (2 * Math.LN2 * sv), 1.7, 20, ax.X, ax.Y), { stroke: C.amber, sw: 1.8, dash: '6 4' });
  const v10 = 1 / W0(Math.exp(20 * Math.LN2 + c));
  s += circ(ax.X(10), ax.Y(v10), 4, { fill: C.blue, stroke: '#fff' }) + M(ax.X(10) + 8, ax.Y(v10) - 8, '1/14.6', { color: C.blue, size: 12.5 });
  s += T(400, 50, L('蓝：精确下界 (230)', 'Blue: exact bound (230)'), { size: 12, color: C.blue, weight: 600 }) +
    T(400, 72, L('橙虚线：1/(2 ln2 · s)', 'Orange dashed: 1/(2 ln2 · s)'), { size: 12, color: C.amber, weight: 600 }) +
    T(400, 96, L('r̄ = 0，m 很大时', 'with r̄ = 0, m large'), { size: 12, color: C.gray });
  return { svg: svg(W, 175, s), cap: L('高斯情形的显式下界：误差至少是单机尺度 d/m 除以 W₀(e^z)。s = 10 时约为 d/(14.6 m)，和近似式 d/(2 ln 2·ms) 很接近。', 'The explicit Gaussian bound: the risk is at least the one-machine scale d/m divided by W₀(e^z). At s = 10 that is about d/(14.6 m), close to the approximation d/(2 ln 2 · ms).') };
});

module.exports = F;
