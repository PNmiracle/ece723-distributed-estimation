// Diagrams for the plain-words boxes of equations (1)–(149) (except (19)–(23), in figs.js).
// Same conventions as figs.js: fig(n, L => ({ svg, cap }) or an array of them).
const { C, setId, T, M: Mmath, rect, line, arrow, circ, path, svg, curve, axes, gauss } = require('./lib.js');
const P = require('./figs.js').parts;
const { W, tree2, dens, stack, lemma1Plot, entropyBars, box } = P;

const F = {};
// Chinese never goes in the math-italic font.
const M = (x, y, s, o) => (/[\u2e80-\u9fff√]/.test(s) ? T : Mmath)(x, y, s, o);
// Captions are HTML: escape, then turn ^{..}/^x and _{..}/_x into <sup>/<sub>.
const capHTML = c => String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/\^([A-Za-z0-9])/g, '<sup>$1</sup>')
  .replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/_([A-Za-z0-9])/g, '<sub>$1</sub>');
const fig = (n, make) => { F[n] = L => { setId(`eqfig${n}${L('z', 'e')}`); return [].concat(make(L)).map(f => ({ ...f, cap: capHTML(f.cap) })); }; };
// a side note: first line bold, the rest grey; items are strings or [text, {opts}]
function note(x, y, items, o = {}) {
  let s = '', yy = y;
  items.forEach((it, i) => {
    const [t, opt] = Array.isArray(it) ? it : [it, {}];
    const size = opt.size || (i === 0 ? 12.5 : 12);
    s += (opt.math ? M : T)(x, yy, t, { size, weight: i === 0 && !opt.math ? 600 : undefined, color: opt.color || (i === 0 ? C.ink : C.gray) });
    yy += opt.gap || (size + 7);
  });
  return s;
}
// a row of pool cells; hl: {index: colour}
function cells(x, y, n, hl = {}, o = {}) {
  let s = '';
  for (let k = 1; k <= n; k++) {
    const c = hl[k];
    s += rect(x + (k - 1) * 34, y, 30, 30, { fill: c ? c[1] : '#fff', stroke: c ? c[0] : C.line, sw: c ? 2 : 1.2, r: 5 });
    s += T(x + (k - 1) * 34 + 15, y + 20, String(k), { anchor: 'middle', size: 12, weight: c ? 700 : 400, color: c ? c[0] : C.gray });
  }
  return s;
}
// regime map for Table I: x = s/n, y = log N
function regimeMap(L, hl) {
  const ax = axes(70, 20, 330, 170, [0, 1], [0, 4], { xl: 's / n', yl: 'log N' });
  const X = ax.X, Y = ax.Y, lo = x => 2 + Math.log10(x), hi = x => 2 - Math.log10(x);
  const on = k => hl === k || hl === 'all';
  let s = ax.body;
  const region = (d, k, fill) => path(d, { fill, stroke: on(k) ? C.ink : 'none', sw: on(k) ? 2 : 0, op: on(k) || hl === 'all' ? 1 : 0.35 });
  s += region(`M${X(0)},${Y(0)}L${X(0.06)},${Y(0)}L${X(0.06)},${Y(4)}L${X(0)},${Y(4)}Z`, 'bits', C.purpleS);
  s += region(`M${X(0.6)},${Y(0)}L${X(1)},${Y(0)}L${X(1)},${Y(4)}L${X(0.6)},${Y(4)}Z`, 'samples', C.blueS);
  let dLow = `M${X(0.06)},${Y(0)}`; for (let k = 0; k <= 30; k++) { const x = 0.06 + 0.54 * k / 30; dLow += `L${X(x)},${Y(Math.max(0, lo(x)))}`; } dLow += `L${X(0.6)},${Y(0)}Z`;
  let dHigh = `M${X(0.06)},${Y(4)}`; for (let k = 0; k <= 30; k++) { const x = 0.06 + 0.54 * k / 30; dHigh += `L${X(x)},${Y(Math.min(4, hi(x)))}`; } dHigh += `L${X(0.6)},${Y(4)}Z`;
  let dGap = `M${X(0.06)},${Y(Math.max(0, lo(0.06)))}`; for (let k = 0; k <= 30; k++) { const x = 0.06 + 0.54 * k / 30; dGap += `L${X(x)},${Y(lo(x))}`; }
  for (let k = 30; k >= 0; k--) { const x = 0.06 + 0.54 * k / 30; dGap += `L${X(x)},${Y(Math.min(4, hi(x)))}`; } dGap += 'Z';
  s += region(dLow, 'pool', C.tealS) + region(dHigh, 'ms', C.greenS) + region(dGap, 'gap', C.redS);
  s += path(curve(x => lo(x), 0.06, 1, X, Y), { stroke: C.teal, sw: 1.4, dash: '4 3' }) + path(curve(x => Math.min(4, hi(x)), 0.06, 1, X, Y), { stroke: C.green, sw: 1.4, dash: '4 3' });
  s += M(X(0.8), Y(3.4), 'd/min{N,nm}', { anchor: 'middle', size: 11.5, color: C.blue });
  s += M(X(0.3), Y(0.45), 'd/N', { anchor: 'middle', size: 12, color: C.teal }) + M(X(0.28), Y(3.6), 'd/(ms)', { anchor: 'middle', size: 12, color: C.green });
  s += T(X(0.3), Y(2.05), L('未解决', 'open'), { anchor: 'middle', size: 12, weight: 700, color: C.red });
  s += M(X(0.58), Y(lo(0.58)) + 14, 'N = ms', { anchor: 'end', size: 11, color: C.teal }) + M(X(0.5), Y(hi(0.5)) - 6, 'N = n²m/s', { anchor: 'end', size: 11, color: C.green });
  s += note(430, 40, [L('表 I 的五个区域', 'The regions of Table I'), [L('紫：余量有界', 'purple: bounded surplus'), { color: C.purple }], [L('蓝：余量 ∝ n', 'blue: surplus ∝ n'), { color: C.blue }],
    [L('青：池子小', 'teal: small pool'), { color: C.teal }], [L('绿：池子大', 'green: large pool'), { color: C.green }], [L('红：中间重叠，未解决', 'red: intermediate, open'), { color: C.red }]]);
  return svg(W, 215, s);
}

/* ===================== II-A sampling and communication ===================== */
fig(1, L => {
  let s = path(curve(x => 40 * gauss(x), -3, 3, x => 70 + x * 22, y => 70 - y), { stroke: C.blue, sw: 2 }) + line(4, 70, 136, 70, { color: C.line, sw: 1 });
  s += M(70, 92, 'P_θ', { anchor: 'middle', size: 14, color: C.blue }) + T(70, 112, L('未知的分布', 'unknown law'), { anchor: 'middle', size: 11.5, color: C.gray });
  s += arrow(140, 59, 184, 59, { sw: 1.6, color: C.gray });
  s += cells(190, 44, 8, {}) + T(476, 64, '…', { size: 16, color: C.gray });
  s += M(330, 100, 'X_1, …, X_N  iid', { anchor: 'middle', size: 14 }) + T(330, 122, L('同一个编号 = 同一条数据，不是两份拷贝', 'same index = same sample, never two copies'), { anchor: 'middle', size: 12, color: C.gray });
  return { svg: svg(W, 135, s), cap: L('公共池：从同一个未知分布独立抽出 N 条数据，按编号 1…N 放好。', 'The common pool: N independent draws from one unknown law, labelled 1…N.') };
});
fig(2, L => {
  let s = T(10, 24, L('机器 1', 'machine 1'), { size: 12, weight: 700, color: C.teal }) + cells(80, 6, 10, { 2: [C.teal, C.tealS], 5: [C.teal, C.tealS], 7: [C.teal, C.tealS] });
  s += T(10, 70, L('机器 2', 'machine 2'), { size: 12, weight: 700, color: C.blue }) + cells(80, 52, 10, { 1: [C.blue, C.blueS], 5: [C.blue, C.blueS], 9: [C.blue, C.blueS] });
  s += line(80 + 4 * 34 + 15, 38, 80 + 4 * 34 + 15, 50, { color: C.amber, sw: 2 }) + T(80 + 4 * 34 + 15, 104, L('可能撞到同一编号', 'they may hit the same index'), { anchor: 'middle', size: 12, color: C.amber });
  s += M(440, 30, 'P(S_i = A) = 1 / C(N, m)', { size: 13 }) + note(440, 54, [['', {}], L('每组 m 个编号机会相同；', 'every m-set equally likely;'), L('各机器独立地抽', 'machines draw independently')]);
  return { svg: svg(W, 115, s), cap: L('每台机器从池里均匀地抽 m 个不同编号（例：N = 10，m = 3）；不同机器各抽各的，所以会重叠。', 'Each machine draws m distinct indices uniformly (here N = 10, m = 3); machines draw independently, so their sets can overlap.') };
});
fig(3, L => {
  const H = { 1: [C.blue, C.blueS], 2: [C.teal, C.tealS], 5: [C.amber, C.amberS], 7: [C.teal, C.tealS], 9: [C.blue, C.blueS] };
  let s = cells(20, 20, 10, H) + T(20 + 4 * 34 + 15, 66, L('5 被两台拿到，只数一次', '5 is held twice, counted once'), { anchor: 'middle', size: 12, color: C.amber });
  s += M(390, 30, 'U(S) = |S_1 ∪ S_2| = 5', { size: 14 }) + note(390, 56, [['', {}], L('总访问 nm = 6', 'total accesses nm = 6'), L('池子 N = 10', 'pool size N = 10'), [L('U ≤ min{N, nm}', 'U ≤ min{N, nm}'), { color: C.teal }]]);
  return { svg: svg(W, 125, s), cap: L('把所有清单合起来、重复的编号只数一次，就是真正能看到的不同样本数 U；它既不超过池子大小，也不超过访问次数。', 'Merge all lists and count repeated indices once: that is U, the number of distinct samples anyone sees, at most the pool size and at most the number of accesses.') };
});
fig(4, L => ({
  svg: svg(W, 110, T(10, 22, L('机器 1 手里的 Z_1：', 'Machine 1 holds Z_1:'), { size: 12.5, weight: 600 }) +
    [2, 5, 7].map((a, i) => rect(20 + i * 120, 34, 110, 40, { fill: C.tealS, stroke: C.teal }) + M(75 + i * 120, 59, `(${a}, X_${a})`, { anchor: 'middle', size: 14 })).join('') +
    note(400, 44, [L('编号 + 数值', 'index + value'), L('知道“是哪一条”，才能', 'knowing which sample it is'), L('认出和别人共享的样本', 'reveals what is shared')])),
  cap: L('本地数据带编号：机器知道自己拿的是池里的哪几条，所以能知道哪些和别的机器重合。', 'Local data carry their indices: a machine knows which pool samples it holds, so overlaps with others are known.'),
}));
fig(5, L => {
  let s = '';
  for (let i = 0; i < 3; i++) {
    const y = 14 + i * 40;
    s += rect(10, y, 120, 30, { fill: '#fff', stroke: C.teal }) + T(70, y + 20, L(`机器 ${i + 1}`, `machine ${i + 1}`), { anchor: 'middle', size: 12, weight: 600, color: C.teal });
    s += arrow(130, y + 15, 250, 70, { color: C.gray }) + T(140, i === 2 ? y + 30 : y + 9, L('k 位', 'k bits'), { size: 11, color: C.gray });
  }
  s += rect(250, 50, 120, 40, { fill: C.amberS, stroke: C.amber }) + T(310, 75, L('融合中心', 'fusion center'), { anchor: 'middle', size: 12.5, weight: 700, color: C.amber });
  s += M(390, 40, 'M_i = f_i(Z_i, S, R_0, R_i)', { size: 13 }) + note(390, 66, [['', {}], L('同时发，互不看对方', 'all at once, nobody listens'), L('至多 k 位 / 台', 'at most k bits each')]);
  return { svg: svg(W, 140, s), cap: L('非交互协议：每台机器只看自己的数据、公开清单和随机数，各自发出至多 k 位。', 'Noninteractive protocol: each machine looks only at its own data, the public design and seeds, and sends at most k bits.') };
});
fig(6, L => ({ svg: svg(W, 80, stack(150, 18, 360, 34, [{ v: 1, fill: C.tealS, in: 'M_1' }, { v: 1, fill: C.blueS, in: 'M_2' }, { v: 0.6, fill: C.faint, in: '…', inMath: false }, { v: 1, fill: C.purpleS, in: 'M_n' }], { left: 'T_{NI} =' }) + T(150, 72, L('按机器编号排好；消息之间可能因为共享数据而相关', 'ordered by machine; messages may be dependent through shared data'), { size: 11.5, color: C.gray })), cap: L('整份通信记录就是 n 条消息排在一起。', 'The transcript is just the n messages side by side.') }));
fig(7, L => ({
  svg: svg(W, 190, tree2(10, 10, L, null) +
    note(230, 40, [L('谁下一个说、何时停：', 'Who speaks next, when to stop:'), L('只能由黑板上已有的内容', 'only from what is already'), L('（和公开信息）决定', 'on the board (and public info)'),
      [L('✗ 不能偷看私有数据来决定', '✗ never from private data'), { color: C.red }], [L('否则“谁在说话”本身就泄露信息', 'or the choice itself leaks information'), { color: C.red }]])),
  cap: L('黑板协议的调度规则：发言顺序和停止时刻都是公开历史的函数。这条规定让第 III 节的“长方形”性质成立。', 'Blackboard scheduling: the order of speakers and the stopping time depend only on the public history. This rule is what makes the rectangle property of Section III work.'),
}));
fig(8, L => ({
  svg: svg(W, 110, rect(10, 30, 170, 44, { fill: '#fff', stroke: C.line }) + T(20, 50, L('黑板：1 0 1', 'board: 1 0 1'), { size: 12.5, weight: 600 }) + T(20, 66, L('（大家都看得见）', '(everyone sees it)'), { size: 11, color: C.gray }) +
    arrow(180, 52, 240, 52, { sw: 2 }) + rect(240, 30, 140, 44, { fill: C.tealS, stroke: C.teal }) + M(310, 57, 'g(Z_i, t^{r−1})', { anchor: 'middle', size: 13 }) +
    arrow(380, 52, 430, 52, { sw: 2 }) + T(470, 57, L('写 0 或 1', 'writes 0/1'), { anchor: 'middle', size: 12.5, weight: 600 })),
  cap: L('轮到机器 i 时，它用自己的数据和黑板上已有的位决定下一位。', 'When it is machine i’s turn, it decides the next bit from its own data and the bits already on the board.'),
}));
fig(9, L => ({ svg: svg(W, 90, stack(110, 18, 400, 32, [{ v: 1, fill: C.tealS, in: 'k' }, { v: 1, fill: C.blueS, in: 'k' }, { v: 0.7, fill: C.faint, in: '…', inMath: false }, { v: 1, fill: C.purpleS, in: 'k' }], { left: 'L ≤' }) + M(310, 76, 'B = nk', { anchor: 'middle', size: 14, color: C.amber })), cap: L('每台机器一生最多写 k 位，所以整块黑板最多 B = nk 位。', 'Each machine writes at most k bits in total, so the board holds at most B = nk bits.') }));
fig(10, L => {
  let s = ''; const lv = 3, x0 = 30, w = 300;
  for (let d = 0; d <= lv; d++) for (let k = 0; k < 2 ** d; k++) {
    const cx = x0 + (k + 0.5) * w / 2 ** d, cy = 20 + d * 38;
    if (d < lv) for (const c of [0, 1]) s += line(cx, cy, x0 + (2 * k + c + 0.5) * w / 2 ** (d + 1), cy + 38, { color: C.line, sw: 1.2 });
    s += d === lv ? rect(cx - 9, cy - 8, 18, 16, { fill: C.amberS, stroke: C.amber, r: 3 }) : circ(cx, cy, 5, { fill: C.blueS, stroke: C.blue });
  }
  s += note(360, 50, [L('至多 B 次二选一', 'At most B binary choices'), [L('⇒ 至多 2^B 种完整记录', '⇒ at most 2^B transcripts'), { color: C.amber }], [L('⇒ 熵 ≤ B ln 2', '⇒ entropy ≤ B ln 2'), {}]]);
  return { svg: svg(W, 165, s), cap: L('固定清单和随机数后，协议是一棵深度不超过 B 的二叉决策树：最多 2^B 片叶子，熵至多 B ln 2 纳特（图中 B = 3）。', 'With design and seeds fixed, the protocol is a binary tree of depth at most B: at most 2^B leaves, so entropy at most B ln 2 nats (here B = 3).') };
});
fig(11, L => ({
  svg: svg(W, 90, ['T', 'S', 'R_0'].map((t, i) => rect(10 + i * 60, 26, 50, 34, { fill: '#fff', stroke: C.blue }) + M(35 + i * 60, 48, t, { anchor: 'middle', size: 14 })).join('') +
    arrow(190, 43, 250, 43, { sw: 2 }) + rect(250, 23, 130, 40, { fill: C.amberS, stroke: C.amber }) + M(315, 48, 'δ(T, S, R_0)', { anchor: 'middle', size: 13.5 }) + arrow(380, 43, 430, 43, { sw: 2 }) + M(440, 48, 'θ̂', { size: 16, color: C.amber }) +
    T(10, 82, L('看不到原始数据，也看不到私有随机数', 'no raw data, no private seeds'), { size: 11.5, color: C.gray })),
  cap: L('融合中心只能用通信记录、公开清单和公共随机数来估计参数。', 'The fusion center estimates from the transcript, the public design and the public seed only.'),
}));
fig(12, L => {
  const ax = axes(60, 20, 300, 130, [0, 1], [0, 1], { xl: 'θ', yl: L('风险', 'risk'), ylMath: false });
  const rA = t => 0.25 + 0.5 * Math.exp(-((t - 0.75) ** 2) / 0.02), rB = t => 0.45 + 0.1 * Math.sin(6 * t);
  let s = ax.body + path(curve(rA, 0, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.2 }) + path(curve(rB, 0, 1, ax.X, ax.Y), { stroke: C.teal, sw: 2.2 });
  s += line(ax.X(0), ax.Y(0.75), ax.X(1), ax.Y(0.75), { color: C.blue, dash: '4 3', sw: 1.2 }) + line(ax.X(0), ax.Y(0.55), ax.X(1), ax.Y(0.55), { color: C.teal, dash: '4 3', sw: 1.2 });
  s += M(ax.X(1) + 4, ax.Y(0.75) + 4, L('A 最坏', 'A worst'), { size: 11, color: C.blue }) + M(ax.X(1) + 4, ax.Y(0.55) + 4, L('B 最坏 ✓', 'B worst ✓'), { size: 11, color: C.teal });
  s += note(445, 70, [L('先 sup：每个方案的最坏 θ', 'sup: worst θ for each plan'), L('再 inf：挑最坏情况最好的', 'inf: pick the best worst case')]);
  return { svg: svg(W, 172, s), cap: L('极小极大：方案 A 平均不错但在某处很差，B 处处中等；按“最坏情况”比较，选 B。', 'Minimax: plan A is good on average but bad somewhere, B is moderate everywhere; compared by the worst case, B wins.') };
});
fig(13, L => ({
  svg: svg(W, 140, `<ellipse cx="160" cy="70" rx="140" ry="58" fill="${C.blueS}" stroke="${C.blue}" stroke-width="1.6"/><ellipse cx="120" cy="76" rx="76" ry="34" fill="${C.tealS}" stroke="${C.teal}" stroke-width="1.6"/>` +
    T(120, 82, L('非交互 NI', 'noninteractive NI'), { anchor: 'middle', size: 12.5, weight: 700, color: C.teal }) + T(240, 40, L('黑板 BB', 'blackboard BB'), { anchor: 'middle', size: 12.5, weight: 700, color: C.blue }) +
    M(340, 60, 'R_{BB} ≤ R_{NI}', { size: 15 }) + note(340, 86, [['', {}], L('选项更多，最优只会更好', 'more options, optimum no worse')])),
  cap: L('非交互方案都是黑板方案（按固定顺序说话、不理会别人）。所以黑板下界也是非交互下界；非交互上界也是黑板上界。', 'Every noninteractive protocol is a blackboard protocol, so a lower bound for BB also holds for NI, and an upper bound for NI also holds for BB.'),
}));

/* ===================== II-B statistical assumptions ===================== */
fig(14, L => {
  const ax = axes(60, 20, 280, 130, [-0.5, 2.5], [-3.5, 0.3], { xl: 'θ', yl: L('log p_θ(x)', 'log p_θ(x)') });
  const ll = t => -((t - 1.2) ** 2) / 0.9 - 0.3;
  let s = ax.body + path(curve(ll, -0.5, 2.5, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  const t0 = 0.5, sl = -2 * (t0 - 1.2) / 0.9;
  s += line(ax.X(t0 - 0.6), ax.Y(ll(t0) - 0.6 * sl), ax.X(t0 + 0.6), ax.Y(ll(t0) + 0.6 * sl), { color: C.amber, sw: 2 }) + circ(ax.X(t0), ax.Y(ll(t0)), 4, { fill: C.amber, stroke: '#fff' });
  s += M(ax.X(t0) + 10, ax.Y(ll(t0)) + 18, L('斜率 = 得分 ξ_θ(x)', 'slope = score ξ_θ(x)'), { size: 12, color: C.amber });
  s += note(370, 50, [L('得分：往哪边挪 θ，', 'Score: which way to move θ'), L('这条数据会更像真的', 'to make this x more likely'), [L('I_X = E[ξ ξ^⊤]：', 'I_X = E[ξ ξ^⊤]:'), { math: true, color: C.blue }], L('斜率平方的平均', 'average squared slope')]);
  return { svg: svg(W, 172, s), cap: L('得分是对数似然对参数的斜率；Fisher 信息是这个斜率平方的平均：数据对参数越敏感，信息越多。', 'The score is the slope of the log-likelihood in θ; Fisher information is the average squared slope. The more sensitive the data are to θ, the more information.') };
});
fig(15, L => ({
  svg: svg(W, 140, dens(30, 20, 300, 90, { color: C.blue }) + M(180, 130, '0', { anchor: 'middle', color: C.gray }) +
    note(370, 46, [L('平均 = 0', 'mean = 0'), L('不系统性偏向哪一边', 'no systematic push'), [L('E‖ξ‖² < ∞', 'E‖ξ‖² < ∞'), { math: true }], L('二阶矩有限', 'finite second moment')])),
  cap: L('真参数下，得分的分布以 0 为中心，方差有限。', 'Under the true parameter the score is centred at 0 with finite variance.'),
}));
fig(16, L => {
  const ax = axes(40, 20, 300, 100, [-3, 5], [0, 1.1], { xl: 'x' });
  let s = ax.body + path(curve(x => gauss(x), -3, 5, ax.X, ax.Y), { stroke: C.blue, sw: 2.2, fill: 'none' }) + path(curve(x => gauss(x - 1.5), -3, 5, ax.X, ax.Y), { stroke: C.teal, sw: 2.2, dash: '6 4' });
  s += M(ax.X(0), ax.Y(1.05), 'p_θ', { anchor: 'middle', color: C.blue }) + M(ax.X(1.5), ax.Y(1.05), 'p_{θ+h}', { anchor: 'middle', color: C.teal });
  s += note(370, 46, [L('面积永远是 1', 'Area is always 1'), L('参数怎么挪都不变', 'however θ moves'), [L('⇒ ∫ ∇p_θ = ∇ 1 = 0', '⇒ ∫ ∇p_θ = ∇ 1 = 0'), { math: true, color: C.amber }]]);
  return { svg: svg(W, 150, s), cap: L('挪动参数时密度会变形，但总面积始终是 1；把求导移进积分，就得到“导数积分为 0”，也就是得分均值为 0。', 'Moving θ reshapes the density but its area stays 1; moving the derivative inside the integral gives zero, i.e. the score has mean zero.') };
});
fig(17, L => {
  const ax = axes(40, 20, 300, 110, [-3, 3], [0, 1.1], { xl: 'z' });
  const K = z => 1 / (1 + Math.exp(-3 * z));
  let s = ax.body + path(curve(gauss, -3, 3, ax.X, ax.Y), { stroke: C.blue, sw: 2 }) + path(curve(K, -3, 3, ax.X, ax.Y), { stroke: C.amber, sw: 2, dash: '6 4' });
  let d = `M${ax.X(-3)},${ax.Y(0)}`; for (let k = 0; k <= 60; k++) { const z = -3 + 6 * k / 60; d += `L${ax.X(z)},${ax.Y(gauss(z) * K(z))}`; } d += `L${ax.X(3)},${ax.Y(0)}Z`;
  s += path(d, { fill: C.tealS, stroke: C.teal, sw: 1.4 });
  s += M(ax.X(-2.2), ax.Y(0.5), 'p_θ(z)', { color: C.blue }) + M(ax.X(2.3), ax.Y(1.02), 'K(t|z)', { color: C.amber, anchor: 'middle' });
  s += note(370, 50, [L('绿色面积 = p^T_θ(t)', 'green area = p^T_θ(t)'), L('每份数据发出 t 的概率 K，', 'chance K that data z sends t,'), L('按数据的概率加权求和', 'weighted by how likely z is')]);
  return { svg: svg(W, 160, s), cap: L('一条消息 t 的概率：把“数据为 z 时发出 t 的概率”按数据分布加权积分。', 'The probability of a message t: integrate “the chance z sends t” against the data density.') };
});
fig(18, L => ({
  svg: svg(W, 150, dens(30, 30, 300, 90, { shade: [0.3, 3] }) + T(185, 24, L('收到 t：只剩这部分数据', 'given t: only this part remains'), { size: 12, color: C.amber, anchor: 'middle' }) +
    note(370, 46, [['∇ log p^T_θ(T) = E[Σ_a ξ_θ(X_a) | T]', { math: true, size: 12.5, color: C.ink }], L('消息的得分 =', 'score of the message ='), L('能产生它的数据的得分平均', 'average score of data that send it')])),
  cap: L('得分恒等式：只看到消息时，它的得分就是原始数据得分在“这条消息”条件下的平均（橙线是平均移到的位置）。', 'Score identity: the score of the message is the average data score among data that produce it (the orange line marks where that average sits).'),
}));
fig(24, L => {
  const ax = axes(60, 20, 260, 130, [0, 1], [0, 1], { xl: 'θ', yl: 'μ(θ)' });
  const mu = t => 0.15 + 0.7 * (t + 0.25 * Math.sin(Math.PI * t) * 0.6);
  let s = ax.body + path(curve(mu, 0, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  const a = 0.45, b = 0.6;
  s += line(ax.X(a), ax.Y(0), ax.X(a), ax.Y(mu(a)), { color: C.amber, dash: '3 3', sw: 1 }) + line(ax.X(b), ax.Y(0), ax.X(b), ax.Y(mu(b)), { color: C.amber, dash: '3 3', sw: 1 });
  s += line(ax.X(0), ax.Y(mu(a)), ax.X(a), ax.Y(mu(a)), { color: C.teal, dash: '3 3', sw: 1 }) + line(ax.X(0), ax.Y(mu(b)), ax.X(b), ax.Y(mu(b)), { color: C.teal, dash: '3 3', sw: 1 });
  s += M(ax.X((a + b) / 2), ax.Y(0) + 16, 'Δθ', { anchor: 'middle', color: C.amber }) + M(ax.X(0) - 6, ax.Y((mu(a) + mu(b)) / 2) + 4, 'Δμ', { anchor: 'end', color: C.teal });
  s += note(350, 50, [L('曲线不能太平：', 'The curve is never flat:'), [L('‖Δθ‖ ≤ L ‖Δμ‖', '‖Δθ‖ ≤ L ‖Δμ‖'), { math: true, color: C.blue }], L('矩估得准 ⇒ 参数也估得准', 'moments right ⇒ θ right'), L('ψ ∈ [0,1]：有界特征', 'ψ ∈ [0,1]: bounded features')]);
  return { svg: svg(W, 172, s), cap: L('可识别的有界矩：特征平均值 μ(θ) 随参数变化，而且斜率有下界，所以知道 μ 就能稳定地反推 θ（上界构造只用这个假设）。', 'Bounded identifying moments: the feature mean μ(θ) moves with θ at a rate bounded below, so knowing μ pins θ down stably (the only assumption the upper bound uses).') };
});
fig(25, L => {
  let s = line(30, 60, 330, 60, { color: C.line });
  [0.1, 0.25, 0.3, 0.55, 0.6, 0.62, 0.8, 0.9].forEach(v => { s += circ(30 + v * 300, 60, 5, { fill: C.blueS, stroke: C.blue }); });
  s += line(30 + 0.515 * 300, 36, 30 + 0.515 * 300, 84, { color: C.amber, sw: 2.4 }) + M(30 + 0.515 * 300, 30, 'μ_N', { anchor: 'middle', color: C.amber, size: 14 });
  s += T(30, 100, '0', { size: 12, color: C.gray }) + T(330, 100, '1', { size: 12, color: C.gray, anchor: 'end' });
  s += note(360, 40, [L('每个点 = ψ(X_a)', 'each dot = ψ(X_a)'), L('橙线 = 整池的平均', 'orange = average over the pool'), L('（上界构造真正想传的量）', '(what the scheme really sends)')]);
  return { svg: svg(W, 115, s), cap: L('经验矩：给池里每条数据算特征 ψ，取 N 份的平均。', 'Empirical moment: compute ψ for every pool sample and average the N values.') };
});
fig(26, L => {
  const ax = axes(60, 20, 260, 110, [0, 1], [0, 0.3], { xl: 'p', yl: 'p(1−p)' });
  let s = ax.body + path(curve(p => p * (1 - p), 0, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 }) + line(ax.X(0), ax.Y(0.25), ax.X(1), ax.Y(0.25), { color: C.amber, dash: '4 3' });
  s += M(ax.X(1) + 4, ax.Y(0.25) + 4, '1/4', { color: C.amber }) + note(370, 50, [L('取值在 [0,1] 的变量：', 'Any variable in [0,1]:'), L('方差 ≤ 1/4', 'variance ≤ 1/4'), [L('平均 N 次 ⇒ ≤ 1/(4N)', 'average N times ⇒ ≤ 1/(4N)'), { math: true, color: C.teal }]]);
  return { svg: svg(W, 150, s), cap: L('有界特征的方差最多 1/4（在 p = ½ 时取到），所以 N 条样本的平均每个坐标方差至多 1/(4N)。', 'A bounded feature has variance at most 1/4 (reached at p = ½), so the average of N samples has per-coordinate variance at most 1/(4N).') };
});
fig(27, L => {
  let s = rect(30, 40, 300, 22, { fill: '#fff', stroke: C.line, r: 3 }) + rect(30, 40, 210, 22, { fill: C.tealS, stroke: C.teal, r: 3 });
  s += T(135, 56, L('U = 1', 'U = 1'), { anchor: 'middle', size: 12, weight: 700, color: C.teal }) + T(285, 56, 'U = 0', { anchor: 'middle', size: 12, color: C.gray });
  s += line(240, 32, 240, 70, { color: C.amber, sw: 2.4 }) + M(240, 26, 'ψ(X) = 0.7', { anchor: 'middle', size: 12.5, color: C.amber });
  s += T(30, 86, '0', { size: 12, color: C.gray }) + T(330, 86, '1', { size: 12, color: C.gray, anchor: 'end' }) + T(180, 100, L('均匀地扔一个 V ∈ [0,1]', 'drop a uniform V in [0,1]'), { anchor: 'middle', size: 12, color: C.gray });
  s += note(360, 40, [L('P(U = 1) = ψ(X)', 'P(U = 1) = ψ(X)'), L('把数值变成一枚硬币，', 'Turns a value into a coin'), L('平均值不变', 'with the same mean')]);
  return { svg: svg(W, 115, s), cap: L('随机伯努利化：特征值 0.7 就以七成概率发 1。这样每条数据都变成一枚均值相同的硬币。', 'Randomized Bernoulli: a feature value of 0.7 becomes a 1 with probability 0.7, so every sample turns into a coin with the same mean.') };
});
fig(28, L => {
  let s = path('M40,120 C110,30 220,20 330,70', { stroke: C.blue, sw: 2.4 }) + T(330, 92, 'μ(Θ)', { size: 13, color: C.blue, anchor: 'end' });
  s += circ(200, 110, 5, { fill: C.amber, stroke: '#fff' }) + M(208, 124, 'μ̂', { color: C.amber, size: 14 });
  s += line(200, 110, 186, 40, { color: C.amber, dash: '4 3' }) + circ(186, 40, 5, { fill: C.teal, stroke: '#fff' }) + M(192, 34, 'μ(θ̂)', { color: C.teal });
  s += note(370, 50, [L('估出来的点可能不在曲线上', 'The estimate may be off the curve'), L('取曲线上最近的点，', 'take the nearest point on it,'), L('再读出它对应的 θ̂', 'then read off its θ̂')]);
  return { svg: svg(W, 140, s), cap: L('解码：在所有合法参数的矩曲线 μ(Θ) 上找离估计 μ̂ 最近的点。', 'Decoding: find the point of the moment curve μ(Θ) closest to the estimate μ̂.') };
});
fig(29, L => {
  let s = circ(60, 110, 5, { fill: C.blue, stroke: '#fff' }) + M(50, 132, 'μ(θ)', { color: C.blue });
  s += circ(170, 40, 5, { fill: C.amber, stroke: '#fff' }) + M(176, 34, 'μ̂', { color: C.amber, size: 14 });
  s += circ(250, 100, 5, { fill: C.teal, stroke: '#fff' }) + M(256, 118, 'μ(θ̂)', { color: C.teal });
  s += line(60, 110, 170, 40, { color: C.amber, sw: 2 }) + line(170, 40, 250, 100, { color: C.teal, sw: 2, dash: '5 3' }) + line(60, 110, 250, 100, { color: C.ink, sw: 1.4 });
  s += M(98, 68, 'ε', { color: C.amber, size: 14 }) + M(216, 64, '≤ ε', { color: C.teal, size: 13 });
  s += note(310, 46, [L('最近点不会比真点更远', 'The nearest point is no farther'), L('⇒ 两点距离 ≤ 2ε', '⇒ the two points are ≤ 2ε apart'), [L('‖θ̂ − θ‖ ≤ 2L ε', '‖θ̂ − θ‖ ≤ 2L ε'), { math: true, color: C.blue }]]);
  return { svg: svg(W, 145, s), cap: L('三角不等式：估计到真矩是 ε，到选中的矩至多也是 ε，合起来 2ε，再乘反推系数 L。', 'Triangle inequality: the estimate is ε from the truth and at most ε from the chosen moment, 2ε in all, times the inverse constant L.') };
});

/* ===================== II-C uniform envelopes ===================== */
fig(30, L => ({ svg: svg(W, 100, stack(140, 20, 380, 36, [{ v: 1.4, fill: C.amberS, in: '½ log₂ m', bot: L('定位：精确到单机 1/√m', 'localize to one machine’s 1/√m') }, { v: 2.4, fill: C.tealS, in: L('余量 s', 'surplus s'), inMath: false, bot: L('剩下的用来精修', 'left for refinement') }], { left: L('每坐标 B/d 位', 'B/d bits per coord.'), leftMath: false })), cap: L('余量 s：每个坐标分到的比特数，减去把参数定位到单机精度所需的 ½ log₂ m 位。', 'Surplus s: the bits per coordinate minus the ½ log₂ m needed to localize the parameter to one machine’s accuracy.') }));
fig(31, L => {
  let s = '';
  [1, 2, 4].forEach((k, i) => { const x = 20 + i * 120; s += rect(x, 20, 96, 96, { fill: '#fff', stroke: C.line }); for (let j = 1; j < k; j++) s += line(x + 96 * j / k, 20, x + 96 * j / k, 116, { color: C.line, sw: 1 }) + line(x, 20 + 96 * j / k, x + 96, 20 + 96 * j / k, { color: C.line, sw: 1 }); s += rect(x, 20, 96 / k, 96 / k, { fill: C.amberS, stroke: C.amber, sw: 1.5, r: 1 }); s += T(x + 48, 134, L(`每坐标 ${i} 位`, `${i} bit${i === 1 ? '' : 's'} per coord.`), { anchor: 'middle', size: 11.5, color: C.gray }); });
  s += note(390, 44, [L('多 1 位：格宽减半，', 'One more bit halves the cell,'), L('平方误差变成 1/4', 'squared error × 1/4'), [L('a_B = 2^{−2B/d} = 2^{−2s}/m', 'a_B = 2^{−2B/d} = 2^{−2s}/m'), { math: true, color: C.amber }]]);
  return { svg: svg(W, 145, s), cap: L('比特底线：每个坐标多一位，格子边长减半，平方误差缩为四分之一。', 'The bit floor: one more bit per coordinate halves the cell side and quarters the squared error.') };
});
fig(32, L => {
  let s = T(10, 20, L('编号 a = 5 出现在哪些清单里？', 'Which lists contain index a = 5?'), { size: 12, weight: 600 });
  ['{2,5,7}', '{1,5,9}', '{3,4,8}', '{5,6,10}'].forEach((t, i) => { const y = 34 + i * 26, hit = t.includes('5,') || t.includes(',5,') || t.includes('{5'); s += M(20, y + 14, `S_${i + 1} = ${t}`, { size: 12.5 }) + T(170, y + 14, hit ? '✓  +1' : '—', { size: 12.5, weight: 700, color: hit ? C.amber : C.line }); });
  s += M(260, 80, 'D_5 = 3', { size: 16, color: C.amber }) + note(360, 60, [L('访问次数 D_a', 'Multiplicity D_a'), L('= 拿到编号 a 的机器数', '= how many machines hold a')]);
  return { svg: svg(W, 145, s), cap: L('访问次数：数一数编号 a 出现在几台机器的清单里。', 'Multiplicity: count how many machines’ lists contain index a.') };
});
fig(33, L => {
  const v = [3, 4, 2, 1], lab = ['0', '1', '2', '3+'];
  let s = line(40, 120, 300, 120, { color: C.line });
  v.forEach((h, i) => { const sh = i >= 2; s += rect(54 + i * 62, 120 - h * 22, 44, h * 22, { fill: sh ? C.amberS : C.faint, stroke: sh ? C.amber : C.line, r: 2 }) + T(76 + i * 62, 138, lab[i], { anchor: 'middle', size: 12, color: C.gray }); });
  s += T(170, 156, L('访问次数 D_a', 'multiplicity D_a'), { anchor: 'middle', size: 11.5, color: C.gray });
  s += note(330, 50, [L('r(S) = 橙色柱的编号个数', 'r(S) = indices in the orange bars'), L('至少两台拿到就算共享', 'shared = held by ≥ 2 machines'), L('拿到 5 次也只算 1 个', 'held 5 times still counts once')]);
  return { svg: svg(W, 165, s), cap: L('共享编号数 r(S)：访问次数 ≥ 2 的编号有几个（每个只数一次）。', 'The shared count r(S): how many indices have multiplicity at least 2, each counted once.') };
});
function binom(L, cut) {
  const n = 4, p = 0.3, pmf = [0, 1, 2, 3, 4].map(k => { const c = [1, 4, 6, 4, 1][k]; return c * p ** k * (1 - p) ** (n - k); });
  let s = line(40, 130, 330, 130, { color: C.line });
  pmf.forEach((q, k) => { const out = cut && k < 2; s += rect(52 + k * 56, 130 - q * 230, 40, q * 230, { fill: out ? '#fff' : cut ? C.amberS : C.blueS, stroke: out ? C.line : cut ? C.amber : C.blue, dash: out ? '4 3' : undefined, r: 2 }) + T(72 + k * 56, 148, String(k), { anchor: 'middle', size: 12, color: C.gray }); });
  return s;
}
fig(34, L => ({ svg: svg(W, 160, binom(L, false) + note(360, 50, [L('D_a ~ Bin(n, m/N)', 'D_a ~ Bin(n, m/N)'), L('每台独立地以 m/N 的机会拿到 a', 'each machine holds a w.p. m/N'), L('（图中 n = 4，m/N = 0.3）', '(here n = 4, m/N = 0.3)')])), cap: L('一个固定编号被几台机器拿到，服从二项分布。', 'The number of machines holding a fixed index is binomial.') }));
fig(35, L => ({ svg: svg(W, 160, binom(L, true) + note(360, 46, [L('r̄ = N · P(D_a ≥ 2)', 'r̄ = N · P(D_a ≥ 2)'), L('= N[1 − P(0) − P(1)]', '= N[1 − P(0) − P(1)]'), L('虚线：没人拿到 / 只有一台', 'dashed: nobody / only one'), L('（这里约 0.35 N）', '(here about 0.35 N)')])), cap: L('期望共享数：每个编号共享的概率是“去掉 0 次和 1 次”剩下的部分，乘 N 个编号。', 'Expected shared count: the chance an index is shared is what remains after removing multiplicity 0 and 1, times N indices.') }));
function envelope(L, withR) {
  const terms = [['1/N', L('池子大小', 'pool size'), 0.35, C.blue], ['1/(nm)', L('总访问量', 'total accesses'), 0.5, C.teal], ['2^{−2B/d}', L('总比特', 'total bits'), 0.2, C.purple],
    [withR ? '1/[m(1+s_+)+r̄]' : '1/[m(1+s_+)]', L('定位 + 精修', 'localize + refine'), withR ? 0.6 : 0.8, C.amber]];
  let s = '';
  terms.forEach(([m, lab, v, c], i) => { const y = 14 + i * 32, top = i === 3; s += T(130, y + 16, lab, { anchor: 'end', size: 12, color: C.gray }) + rect(140, y, v * 300, 22, { fill: top ? C.amberS : C.faint, stroke: top ? C.amber : C.line, sw: top ? 2 : 1.2 }) + M(148 + v * 300, y + 16, m, { size: 13, color: top ? C.amber : C.ink }); });
  s += T(140, 148, withR ? L('ℒ = d × 四项中最大者（下界用）', 'ℒ = d × the largest of four (lower)') : L('𝒰 = d × 四项中最大者（上界用；第四项分母没有 r̄）', '𝒰 = d × the largest of four (upper; no r̄ in the fourth)'), { size: 12, color: C.gray });
  return svg(W, 160, s);
}
fig(36, L => ({ svg: envelope(L, true), cap: L('下界包络 ℒ：池子、访问量、比特、精修四种限制，取最大的那个。', 'Lower envelope ℒ: four limits (pool, accesses, bits, refinement); take the largest.') }));
fig(37, L => ({ svg: envelope(L, false), cap: L('上界包络 𝒰：同样四项，唯一的区别是第四项分母里没有共享数 r̄。', 'Upper envelope 𝒰: the same four terms; the only difference is no r̄ in the fourth denominator.') }));
fig(38, L => ({ svg: svg(W, 110, stack(150, 20, 220, 30, [{ v: 1, fill: C.blueS, in: 'N' }], { left: L('池子', 'pool'), leftMath: false }) + stack(150, 60, 330, 30, [{ v: 1, fill: C.tealS, in: 'nm' }], { left: L('总访问', 'accesses'), leftMath: false }) + note(400, 32, [[L('看得到的 ≤ 较短的那根', 'visible ≤ the shorter bar'), {}], [L('d/min{N, nm}', 'd/min{N, nm}'), { math: true, color: C.blue }]])), cap: L('能看到的独立样本数被池子和访问次数中较小者卡住；取倒数，较小者给出较大的误差项。', 'The number of independent samples seen is capped by the smaller of pool size and accesses; inverting, the smaller one gives the larger error term.') }));
fig(39, L => ({ svg: svg(W, 110, stack(150, 18, 300, 30, [{ v: 3, fill: C.tealS, in: 'm(1+s_+)' }], { left: '𝒰:' }) + stack(150, 60, 380, 30, [{ v: 3, fill: C.tealS, in: 'm(1+s_+)' }, { v: 0.8, fill: C.redS, in: 'r̄' }], { left: 'ℒ:' }) + T(150, 106, L('分母更大 ⇒ 第四项更小 ⇒ ℒ ≤ 𝒰', 'bigger denominator ⇒ smaller term ⇒ ℒ ≤ 𝒰'), { size: 12, color: C.gray })), cap: L('两个包络只差第四项分母里的 r̄；r̄ ≥ 0，所以下界包络不会超过上界包络。', 'The envelopes differ only by r̄ in the fourth denominator; since r̄ ≥ 0, the lower envelope never exceeds the upper one.') }));
function sandwich(L, hl) {
  let s = line(30, 60, 520, 60, { color: C.line, sw: 2 });
  const pts = [['cℒ', 70, C.purple, 'low'], ['R_{BB}', 200, C.blue, 'bb'], ['R_{NI}', 320, C.teal, 'ni'], ['C𝒰', 460, C.amber, 'up']];
  pts.forEach(([t, x, c, k]) => { s += circ(x, 60, 6, { fill: c, stroke: '#fff' }) + M(x, 88, t, { anchor: 'middle', size: 14, color: c }); });
  s += [130, 260, 390].map(x => M(x, 66, '≤', { anchor: 'middle', size: 15, color: C.gray })).join('');
  const lab = { low: [L('第 III 节：允许交互也躲不开', 'Section III: even with interaction'), 70], up: [L('第 IV 节：不交互就能做到', 'Section IV: achieved without interaction'), 460], mid: [L('两侧同阶 ⇒ 交互帮不上忙', 'same order ⇒ interaction cannot help'), 265] }[hl];
  if (lab) s += T(lab[1], 30, lab[0], { anchor: 'middle', size: 12, weight: 600, color: C.ink });
  return svg(W, 105, s);
}
fig(40, L => ({ svg: sandwich(L, 'low'), cap: L('定理 1 的下界：即使机器能边听边说，最优风险也至少是 cℒ。', 'The lower half of Theorem 1: even with interaction, the optimal risk is at least cℒ.') }));
fig(41, L => ({ svg: sandwich(L, 'up'), cap: L('定理 1 的上界：机器各发各的，就能把最坏风险压到 C𝒰 以内。', 'The upper half of Theorem 1: with independent messages the worst-case risk is at most C𝒰.') }));
fig(42, L => ({ svg: sandwich(L, 'mid'), cap: L('两头夹住：当 ℒ 与 𝒰 同阶时，交互和非交互的最优风险同阶。', 'The sandwich: whenever ℒ and 𝒰 have the same order, interactive and noninteractive optima have the same order.') }));
fig(43, L => ({ svg: regimeMap(L, 'bits'), cap: L('表 I 第一行（紫）：余量有界时，误差由总比特数决定，d·2^{−2nk/d}。', 'Table I, row 1 (purple): with bounded surplus the error is set by the total bits, d·2^{−2nk/d}.') }));
fig(45, L => ({ svg: regimeMap(L, 'samples'), cap: L('表 I 第二行（蓝）：余量与 n 同阶时，比特足够多，误差由可见样本数决定。', 'Table I, row 2 (blue): with surplus of order n there are plenty of bits, and the visible-sample count decides.') }));
fig(47, L => ({ svg: regimeMap(L, 'all'), cap: L('临界窗口（中间带）：1 ≪ s ≪ n 时只剩池子项 d/N 和精修项 d/(ms) 竞争；中间那块红色是论文没解决的部分。', 'The critical window (middle band): for 1 ≪ s ≪ n only the pool term d/N and the refinement term d/(ms) compete; the red wedge is the unresolved part.') }));
fig(49, L => ({ svg: regimeMap(L, 'pool'), cap: L('表 I 第三行（青）：池子比 ms 小，样本数先卡住精度，误差 d/N。', 'Table I, row 3 (teal): the pool is smaller than ms, so samples bind first: error d/N.') }));
fig(51, L => {
  let s = T(10, 20, L('编号 5 被 3 台机器拿到：', 'Index 5 held by 3 machines:'), { size: 12.5, weight: 600 });
  const P3 = [[70, 60], [180, 60], [125, 120]];
  [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => { s += line(P3[a][0], P3[a][1], P3[b][0], P3[b][1], { color: C.amber, sw: 2 }); });
  P3.forEach(([x, y], i) => { s += circ(x, y, 18, { fill: '#fff', stroke: C.teal, sw: 1.6 }) + T(x, y + 5, `S${i + 1}`, { anchor: 'middle', size: 12, weight: 700, color: C.teal }); });
  s += note(250, 44, [L('r(S) 里算 1 次', 'r(S) counts it once'), L('两两交集里出现 C(3,2) = 3 次', 'pairwise overlaps count C(3,2) = 3'), [L('r(S) ≤ Σ_{i<j} |S_i ∩ S_j|', 'r(S) ≤ Σ_{i<j} |S_i ∩ S_j|'), { math: true, color: C.amber }]]);
  return { svg: svg(W, 150, s), cap: L('共享数不超过两两交集之和：一个编号被越多台拿到，就在越多对里重复计数。', 'The shared count is at most the sum of pairwise overlaps: an index held by more machines is counted in more pairs.') };
});
fig(52, L => ({ svg: svg(W, 100, M(20, 40, 'P(a ∈ S_i) P(a ∈ S_j) = (m/N)²', { size: 14 }) + M(20, 74, L('× N 个编号 = m²/N', '× N indices = m²/N'), { size: 14, color: C.amber }) + note(330, 32, [L('两份独立的清单', 'Two independent lists'), L('平均重叠 m²/N 条', 'overlap m²/N on average'), L('（N 很大时很少撞）', '(rare when N is large)')])), cap: L('两台机器平均重叠多少：每个编号被两台同时拿到的概率是 (m/N)²，乘以 N。', 'How much two machines overlap on average: each index is held by both with probability (m/N)², times N.') }));
fig(53, L => {
  let s = ''; const n = 5, cx = 90, cy = 70, R = 50, Pn = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + 2 * Math.PI * i / n; Pn.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) s += line(Pn[i][0], Pn[i][1], Pn[j][0], Pn[j][1], { color: C.amber, sw: 1.4 });
  Pn.forEach(([x, y], i) => { s += circ(x, y, 12, { fill: C.tealS, stroke: C.teal }) + T(x, y + 4, String(i + 1), { anchor: 'middle', size: 11, weight: 700 }); });
  s += note(190, 44, [L('n 台机器有 C(n,2) 对（图中 10 对）', 'n machines form C(n,2) pairs (10 here)'), L('每对平均重叠 m²/N', 'each pair overlaps m²/N on average'), [L('r̄ ≤ C(n,2) · m²/N', 'r̄ ≤ C(n,2) · m²/N'), { math: true, color: C.amber }]]);
  return { svg: svg(W, 135, s), cap: L('把所有机器对的平均重叠加起来，就是共享数期望的上界。', 'Adding the average overlaps of all machine pairs bounds the expected shared count.') };
});
fig(54, L => ({ svg: regimeMap(L, 'ms'), cap: L('表 I 第四行（绿）：池子大到 N ≳ n²m/s 时，共享数 r̄ 至多与 ms 同阶，上下界都是 d/(ms)。', 'Table I, row 4 (green): with N ≳ n²m/s the shared count r̄ is at most of order ms, and both bounds are d/(ms).') }));
fig(57, L => ({ svg: svg(W, 120, [1, 2, 3].map(i => rect(20, 6 + (i - 1) * 36, 300, 28, { fill: C.purpleS, stroke: C.purple, r: 14 }) + T(30, 25 + (i - 1) * 36, L(`机器 ${i}：整池 1…N`, `machine ${i}: the whole pool`), { size: 12, color: C.purple, weight: 600 })).join('') + note(350, 40, [L('每台都算出同一个 μ_N', 'Everyone computes the same μ_N'), L('不用再“各自估计”，', 'no need to estimate separately:'), L('只需把同一个数分段发出', 'just send pieces of one number')])), cap: L('完全重叠（m = N）：所有机器看见整池，算出完全相同的特征平均值。', 'Complete overlap (m = N): every machine sees the whole pool and computes the same feature mean.') }));
fig(58, L => ({ svg: svg(W, 100, stack(120, 20, 400, 34, [{ v: 4, fill: C.tealS, in: 'B_1 = 4' }, { v: 4, fill: C.blueS, in: 'B_2 = 4' }, { v: 3, fill: C.purpleS, in: 'B_3 = 3' }], { left: 'B = 11' }) + T(120, 80, L('平均分，余数一人一位：各坐标相差至多 1 位', 'split evenly, remainder one bit each: differ by ≤ 1'), { size: 12, color: C.gray })), cap: L('比特分配：B 位平摊到 d 个坐标，各坐标相差不超过一位。', 'Bit allocation: B bits shared among d coordinates, differing by at most one.') }));
fig(59, L => {
  let s = rect(30, 40, 320, 26, { fill: '#fff', stroke: C.line, r: 2 });
  for (let k = 1; k < 8; k++) s += line(30 + k * 40, 40, 30 + k * 40, 66, { color: C.line, sw: 1 });
  for (let k = 0; k < 8; k++) s += circ(50 + k * 40, 53, 3, { fill: C.teal, stroke: 'none' });
  s += circ(178, 53, 4, { fill: C.amber, stroke: '#fff' }) + line(170, 76, 178, 76, { color: C.amber, sw: 2.4 }) + line(170, 71, 170, 81, { color: C.amber, sw: 1.4 }) + line(178, 71, 178, 81, { color: C.amber, sw: 1.4 }) + T(174, 98, L('误差 ≤ 半格', 'error ≤ half a cell'), { anchor: 'middle', size: 12, color: C.amber });
  s += T(30, 30, '0', { size: 12, color: C.gray }) + T(350, 30, '1', { size: 12, color: C.gray, anchor: 'end' }) + note(380, 36, [L('坐标 j 用 b = B_j 位', 'coordinate j gets b = B_j bits'), L('⇒ 2^b 个格子，报中点', '⇒ 2^b cells, report the midpoint'), ['|err| ≤ 2^{−b−1}', { math: true, color: C.amber }]]);
  return { svg: svg(W, 110, s), cap: L('均匀量化：把 [0,1] 切成 2^{B_j} 格，报所在格的中点，误差不超过半格。', 'Uniform quantization: cut [0,1] into 2^{B_j} cells and report the midpoint; the error is at most half a cell.') };
});
fig(62, L => ({ svg: svg(W, 90, stack(160, 20, 340, 34, [{ v: 1, fill: C.blueS, in: 'd/N', bot: L('池子的抽样误差', 'pool sampling error') }, { v: 1, fill: C.purpleS, in: 'd·2^{−2B/d}', bot: L('量化误差', 'quantization error') }], { left: 'sup E‖θ̂−θ‖² ≲' })), cap: L('完全重叠时上界只剩两项：有限样本和有限比特；与下界里的同两项吻合。', 'With complete overlap the upper bound has just two terms, finite samples and finite bits, matching the same two terms of the lower bound.') }));
fig(63, L => {
  const ax = axes(70, 20, 280, 120, [0, 40], [0, 30], { xl: 'n', yl: 'log₂ m' });
  let s = ax.body + path(curve(n => 2 * n * 0.5 - 2 * Math.sqrt(n), 4, 40, ax.X, ax.Y), { stroke: C.red, sw: 2.4 }) + path(curve(n => 3 * Math.log2(n), 1, 40, ax.X, ax.Y), { stroke: C.gray, sw: 1.6, dash: '5 4' });
  s += M(ax.X(14), ax.Y(28), L('窗口里：近似线性', 'window: nearly linear'), { size: 11.5, color: C.red }) + M(ax.X(39), ax.Y(9), L('多项式：对数级', 'polynomial: logarithmic'), { anchor: 'end', size: 11.5, color: C.gray });
  s += note(380, 50, [['m = 2^{2nk/d − 2s}', { math: true, size: 13 }], L('s = o(n) 时，', 'With s = o(n),'), L('单机样本要随 n 指数增长', 'm must grow exponentially')]);
  return { svg: svg(W, 165, s), cap: L('未决窗口的要求：s 远小于 n 时，m 必须指数级增长；所以多项式增长的情形都已解决。', 'What the open window needs: with s much smaller than n, m must grow exponentially, so every polynomial coupling is already resolved.') };
});
fig(64, L => {
  const ax = axes(70, 20, 280, 120, [0, 3], [0, 3.2], { xl: 'α', yl: L('衰减幂次', 'decay power'), ylMath: false });
  const beta = 2;
  let s = ax.body + path(curve(a => Math.min(beta, a + 1), 0, 3, ax.X, ax.Y), { stroke: C.blue, sw: 2.6 }) + line(ax.X(1), ax.Y(0), ax.X(1), ax.Y(2), { color: C.line, dash: '3 3' });
  s += M(ax.X(0.4), ax.Y(1.75), 'α + 1', { color: C.blue }) + M(ax.X(2.2), ax.Y(2) - 8, 'β', { color: C.blue }) + T(ax.X(0.5), ax.Y(0) + 16, L('访问量更少', 'accesses bind'), { anchor: 'middle', size: 11, color: C.gray }) + T(ax.X(2), ax.Y(0) + 16, L('池子更小', 'pool binds'), { anchor: 'middle', size: 11, color: C.gray });
  s += note(380, 50, [['m ≍ n^α, N ≍ n^β', { math: true, size: 13 }], ['R ≍ d·n^{−min(β, α+1)}', { math: true, size: 13, color: C.blue }], L('（图中 β = 2）', '(here β = 2)')]);
  return { svg: svg(W, 165, s), cap: L('多项式增长时，误差按 n 的幂次下降；幂次取池子 β 和访问量 α+1 中较小的。', 'With polynomial growth the risk falls as a power of n: the smaller of the pool exponent β and the access exponent α+1.') };
});
fig(65, L => {
  const ax = axes(70, 20, 280, 120, [0, 3], [0, 2], { xl: 'λ', yl: L('指数速率', 'exponential rate'), ylMath: false });
  let s = ax.body + path(curve(l => Math.min(l, 1.2), 0, 3, ax.X, ax.Y), { stroke: C.purple, sw: 2.6 }) + line(ax.X(0), ax.Y(1.2), ax.X(3), ax.Y(1.2), { color: C.line, dash: '3 3' });
  s += M(ax.X(0.5), ax.Y(0.75), 'λ', { color: C.purple }) + M(ax.X(2.4), ax.Y(1.2) - 8, '2k/d', { color: C.purple });
  s += note(380, 50, [['λ = lim (log₂ m)/n', { math: true, size: 13 }], L('先随数据增长变快，', 'Grows with the data rate,'), L('到 2k/d 被比特卡住', 'then capped by bits at 2k/d')]);
  return { svg: svg(W, 165, s), cap: L('指数尺度：误差以 2^{−n·rate} 衰减，rate 取数据增长指数 λ 与比特精度 2k/d 的较小者。', 'On the exponential scale the risk decays like 2^{−n·rate}, with rate the smaller of the data exponent λ and the bit precision 2k/d.') };
});

/* ===================== III-A score identities, Bayesian inequality ===================== */
fig(73, L => ({
  svg: svg(W, 100, rect(10, 30, 120, 40, { fill: C.blueS, stroke: C.blue }) + M(70, 55, 'Z ~ p^Z_θ', { anchor: 'middle', size: 14 }) + arrow(130, 50, 200, 50, { sw: 2 }) +
    rect(200, 30, 130, 40, { fill: '#fff', stroke: C.gray }) + M(265, 55, 'K(t | z)', { anchor: 'middle', size: 14 }) + T(265, 88, L('不含 θ 的加工', 'processing without θ'), { anchor: 'middle', size: 11.5, color: C.gray }) +
    arrow(330, 50, 400, 50, { sw: 2 }) + M(420, 55, 'T', { size: 16, color: C.amber }) + T(440, 55, L('= 消息', '= message'), { size: 12, color: C.gray })),
  cap: L('一般的“数据 → 消息”通道：参数只通过数据 Z 进入，加工方式 K 本身不依赖 θ。', 'A general data → message channel: θ enters only through the data Z; the processing K does not depend on θ.'),
}));
fig(75, L => ({
  svg: svg(W, 140, [-1.6, -0.4, 0.9, 2.1].map((z, i) => { const x = 30 + i * 62, inT = i >= 2; return rect(x, 30, 52, 30, { fill: inT ? C.amberS : C.faint, stroke: inT ? C.amber : C.line }) + M(x + 26, 50, `z_${i + 1}`, { anchor: 'middle', size: 12.5 }) + (inT ? arrow(x + 26, 62, 200, 100, { color: C.amber, arrowColor: 'a', sw: 1.4 }) : ''); }).join('') +
    rect(160, 100, 80, 30, { fill: '#fff', stroke: C.amber }) + M(200, 120, 'T = t', { anchor: 'middle', size: 13 }) +
    note(300, 40, [L('能发出 t 的数据（橙）', 'Data that can send t (orange)'), L('把它们的得分按后验权重平均', 'average their scores with'), L('就是消息的得分', 'posterior weights: the message score')])),
  cap: L('(75) 得分恒等式：消息的得分 = 所有兼容的原始输入的得分，在“收到这条消息”条件下的平均。不需要数据独立。', '(75), the score identity: the message score is the average score of all inputs compatible with the message, conditional on receiving it. No independence needed.'),
}));
fig(76, L => ({ svg: svg(W, 90, stack(140, 20, 380, 34, [{ v: 1, fill: C.blueS, in: 'I_X' }, { v: 1, fill: C.blueS, in: 'I_X' }, { v: 0.6, fill: C.faint, in: '…', inMath: false }, { v: 1, fill: C.blueS, in: 'I_X' }], { left: 'J_Z = q·I_X =' }) + T(140, 76, L('独立样本：得分相加，信息相加（交叉项均值为 0）', 'independent samples: scores add, information adds (cross terms average 0)'), { size: 12, color: C.gray })), cap: L('q 条独立样本的信息就是单条信息的 q 倍。', 'q independent samples carry q times the information of one.') }));
function jensenFig(L) {
  const ax = axes(40, 20, 300, 110, [-3, 3], [0, 1.1], { xl: L('得分', 'score'), xlMath: false });
  let s = ax.body + path(curve(x => gauss(x / 1.5) * 0.66, -3, 3, ax.X, ax.Y), { stroke: C.blue, sw: 2.2 }) + path(curve(x => gauss(x / 0.7), -3, 3, ax.X, ax.Y), { stroke: C.amber, sw: 2.4 });
  s += M(ax.X(-2.1), ax.Y(0.38), 'S_Z', { color: C.blue }) + M(ax.X(0.75), ax.Y(0.95), 'S_T = E[S_Z | T]', { color: C.amber });
  s += note(370, 46, [L('取条件平均会“收窄”', 'Conditional averaging narrows'), L('S_T 的方差 ≤ S_Z 的方差', 'Var S_T ≤ Var S_Z'), [L('J_T ⪯ J_Z', 'J_T ⪯ J_Z'), { math: true, color: C.amber }]]);
  return svg(W, 155, s);
}
fig(78, L => ({ svg: jensenFig(L), cap: L('条件 Jensen：消息的得分是数据得分的条件平均，平均会把分布收窄，所以方差（信息）不会更大。', 'Conditional Jensen: the message score is a conditional average of the data score, and averaging narrows the spread, so its variance (information) is no larger.') }));
fig(79, L => ({ svg: jensenFig(L), cap: L('Fisher 信息的数据处理不等式：在任何方向上，加工后的数据都不会比原始数据有更多信息。', 'Data processing for Fisher information: in every direction, processed data never carry more information than the raw data.') }));
fig(80, L => ({ svg: svg(W, 90, stack(150, 20, 360, 34, [{ v: 1.3, fill: C.amberS, in: 'S_G' }, { v: 2, fill: C.tealS, in: 'S_{T|G}' }], { left: 'S_{G,T} =' }) + T(150, 76, L('先看 G，再看已知 G 后的 T：对数似然相加，得分也相加', 'first G, then T given G: log-likelihoods add, so do scores'), { size: 12, color: C.gray })), cap: L('联合观测的得分拆成两段之和。', 'The score of a joint observation splits into a sum of two pieces.') }));
fig(82, L => ({ svg: svg(W, 90, M(20, 40, 'E[S_G S_{T|G}^⊤] = E[S_G · E[S_{T|G}^⊤ | G]] = 0', { size: 14 }) + T(20, 70, L('给定 G，第二段平均为 0，所以交叉项消失', 'given G the second piece averages to 0, so the cross term vanishes'), { size: 12, color: C.gray })), cap: L('两段得分不相关：先固定 G，第二段的条件均值为零。', 'The two pieces are uncorrelated: fixing G, the second has conditional mean zero.') }));
fig(83, L => ({ svg: svg(W, 90, stack(150, 20, 360, 36, [{ v: 1.3, fill: C.amberS, in: 'J_G', bot: L('先知道 G', 'knowing G') }, { v: 2, fill: C.tealS, in: 'E_G J_{T|G}', bot: L('已知 G 后 T 还能说多少', 'what T adds given G') }], { left: 'J_{G,T} =' })), cap: L('Fisher 信息的链式法则：总信息 = 先知道 G 的信息 + 已知 G 后消息额外提供的信息（对 G 平均）。第 III-D 节靠它把共享样本单独拿出来。', 'Chain rule for Fisher information: total = information in G + what the message adds once G is known (averaged over G). Section III-D uses it to set the shared samples apart.') }));
function priorPlot(L, withScore) {
  const ax = axes(60, 20, 270, 120, [0, 1], withScore ? [-7, 7] : [0, 2.2], { xl: 'θ', yl: withScore ? L('先验得分', 'prior score') : 'π(θ)', ylMath: !withScore });
  let s = ax.body;
  if (withScore) {
    s += line(ax.X(0), ax.Y(0), ax.X(1), ax.Y(0), { color: C.line, sw: 1 }) + path(curve(t => 2 * Math.PI / Math.tan(Math.PI * t), 0.235, 0.765, ax.X, ax.Y), { stroke: C.amber, sw: 2.4 });
    s += M(ax.X(0.55), ax.Y(4.5), '2π cot(πθ)', { color: C.amber });
  } else s += path(curve(t => 2 * Math.sin(Math.PI * t) ** 2, 0, 1, ax.X, ax.Y), { stroke: C.purple, sw: 2.4 });
  return s;
}
fig(85, L => ({ svg: svg(W, 165, priorPlot(L, false) + note(370, 46, [L('每个坐标：2 sin²(πθ_j)', 'each coordinate: 2 sin²(πθ_j)'), L('两端降到 0（边界项消失）', 'zero at both ends (no boundary terms)'), [L('h(π) = d(ln 2 − 1)', 'h(π) = d(ln 2 − 1)'), { math: true, color: C.purple }], [L('J_π = 4π² d', 'J_π = 4π² d'), { math: true, color: C.purple }]])), cap: L('证明用的光滑先验：两端为 0，熵和信息都能算出精确值。', 'The smooth prior of the proof: zero at both ends, with exactly computable entropy and information.') }));
fig(86, L => ({ svg: svg(W, 165, priorPlot(L, true) + note(370, 46, [L('先验的得分', 'The prior’s own score'), L('在边界附近很大，', 'is large near the edges,'), L('但那里先验密度几乎为 0', 'where the prior is nearly 0'), [L('平均平方 = 4π²', 'mean square = 4π²'), { math: true, color: C.amber }]])), cap: L('先验也有得分（对数先验的斜率）；它的平方按先验平均，就是先验信息 J_π。', 'The prior has a score too (slope of its log); its mean square under the prior is the prior information J_π.') }));
fig(96, L => ({
  svg: svg(W, 90, rect(10, 26, 110, 40, { fill: C.purpleS, stroke: C.purple }) + M(65, 51, 'Θ ~ π', { anchor: 'middle', size: 14 }) + arrow(120, 46, 170, 46, { sw: 2 }) +
    rect(170, 26, 110, 40, { fill: C.blueS, stroke: C.blue }) + M(225, 51, 'Y | Θ', { anchor: 'middle', size: 14 }) + arrow(280, 46, 330, 46, { sw: 2 }) +
    rect(330, 26, 80, 40, { fill: C.amberS, stroke: C.amber }) + M(370, 51, 'θ̂(Y)', { anchor: 'middle', size: 14 }) + M(430, 51, 'D = E‖θ̂ − Θ‖²', { size: 13.5 })),
  cap: L('贝叶斯风险：先随机抽参数，再由它生成观测，最后对这两层随机性平均平方误差。', 'Bayes risk: draw the parameter, then the observation, and average the squared error over both layers.'),
}));
fig(97, L => ({ svg: svg(W, 80, M(20, 32, 'q(θ, y) = π(θ) · p^Y_θ(y)', { size: 14.5 }) + M(20, 62, '∇ log q = ∇ log π + ∇ log p^Y_θ', { size: 14, color: C.teal }) + note(340, 28, [L('联合密度 = 先验 × 似然', 'joint = prior × likelihood'), L('取对数求导：两个得分相加', 'log-derivative: two scores add')])), cap: L('联合密度和它的得分：先验部分 + 数据部分。', 'The joint density and its score: a prior part plus a data part.') }));
fig(98, L => {
  const ax = axes(60, 20, 260, 110, [0, 1], [0, 1.1], { xl: 'θ_j' });
  let s = ax.body + path(curve(t => Math.sin(Math.PI * t) ** 2, 0, 1, ax.X, ax.Y), { stroke: C.purple, sw: 2.2 });
  s += circ(ax.X(0), ax.Y(0), 5, { fill: C.red, stroke: '#fff' }) + circ(ax.X(1), ax.Y(0), 5, { fill: C.red, stroke: '#fff' });
  s += note(350, 44, [L('分部积分', 'Integration by parts'), L('边界项 = 先验在两端的值 = 0', 'boundary term = prior at the ends = 0'), L('误差对 θ_j 的导数是 −1', 'd(error)/dθ_j = −1'), [L('⇒ E[(θ̂_j − Θ_j) Q_j] = 1', '⇒ E[(θ̂_j − Θ_j) Q_j] = 1'), { math: true, color: C.amber }]]);
  return { svg: svg(W, 150, s), cap: L('先验在边界处为 0（红点），分部积分没有边界项，只留下常数 1。', 'The prior vanishes at the edges (red dots), so integration by parts leaves no boundary term, only the constant 1.') };
});
fig(99, L => ({
  svg: svg(W, 140, arrow(60, 110, 230, 60, { color: C.blue, arrowColor: 'b', sw: 2.4 }) + arrow(60, 110, 200, 20, { color: C.amber, arrowColor: 'a', sw: 2.4 }) +
    M(150, 100, 'θ̂ − Θ', { color: C.blue }) + M(108, 52, 'Q', { color: C.amber, size: 15 }) +
    note(280, 40, [['d = E⟨θ̂ − Θ, Q⟩', { math: true, size: 13.5 }], ['≤ √(E‖θ̂ − Θ‖²) · √(E‖Q‖²)', { math: true, size: 13, color: C.teal }], L('Cauchy–Schwarz：内积 ≤ 长度之积', 'Cauchy–Schwarz: inner product ≤ product of lengths')])),
  cap: L('d 个坐标各贡献 1，合计 d；内积不超过两个向量长度的乘积，于是误差长度 × 信息长度 ≥ d。', 'Each coordinate contributes 1, so d in total; an inner product is at most the product of the lengths, so error length × information length ≥ d.'),
}));
fig(100, L => ({ svg: svg(W, 90, stack(150, 20, 360, 36, [{ v: 1, fill: C.purpleS, in: 'J_π', bot: L('先验的信息', 'prior information') }, { v: 2.4, fill: C.blueS, in: 'E_Θ tr J_Y(Θ)', bot: L('数据（记录）的信息', 'information in the data') }], { left: 'E‖Q‖² =' })), cap: L('总得分的平方平均 = 先验信息 + 数据信息（交叉项因数据得分均值为 0 而消失）。', 'The mean square of the total score is prior information plus data information (the cross term vanishes because the data score has mean zero).') }));
fig(101, L => {
  const ax = axes(70, 20, 270, 120, [0, 10], [0, 1], { xl: L('平均信息', 'average information'), xlMath: false, yl: L('误差下限', 'risk floor'), ylMath: false });
  let s = ax.body + path(curve(J => 1 / (J + 1.2), 0, 10, ax.X, ax.Y), { stroke: C.blue, sw: 2.6 });
  s += M(ax.X(5), ax.Y(0.45), 'D ≥ d² / (E tr J_Y + J_π)', { anchor: 'middle', size: 13.5, color: C.blue });
  s += note(380, 50, [L('van Trees 不等式', 'van Trees inequality'), L('信息越少，误差下限越高', 'less information, higher floor'), L('对有偏估计也成立', 'holds for biased estimators too')]);
  return { svg: svg(W, 165, s), cap: L('van Trees：任何估计器的贝叶斯风险至少是 d² 除以（数据信息 + 先验信息）。整个下界证明都靠它把“信息上界”变成“误差下界”。', 'van Trees: any estimator’s Bayes risk is at least d² over (data information + prior information). The whole converse uses it to turn information bounds into risk bounds.') };
});
fig(102, L => {
  const ax = axes(60, 20, 280, 110, [0, 1], [0, 1], { xl: 'θ', yl: L('风险', 'risk'), ylMath: false });
  const r = t => 0.35 + 0.3 * Math.sin(5 * t) ** 2;
  let s = ax.body + path(curve(r, 0, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 }) + line(ax.X(0), ax.Y(0.65), ax.X(1), ax.Y(0.65), { color: C.red, dash: '4 3' }) + line(ax.X(0), ax.Y(0.5), ax.X(1), ax.Y(0.5), { color: C.purple, dash: '4 3' });
  s += M(ax.X(1) + 4, ax.Y(0.65) + 4, L('最坏', 'worst'), { color: C.red, size: 12 }) + M(ax.X(1) + 4, ax.Y(0.5) + 4, L('先验平均', 'prior average'), { color: C.purple, size: 12 });
  s += note(400, 50, [L('最坏 ≥ 平均', 'Worst ≥ average'), L('所以贝叶斯下界', 'so a Bayes lower bound'), L('也是极小极大下界', 'is a minimax lower bound')]);
  return { svg: svg(W, 155, s), cap: L('对每个方案，最坏参数的风险都不小于按先验平均的风险；证明里只需给后者找下界。', 'For every protocol the worst-case risk is at least the prior-averaged risk, so the proof only needs to bound the latter.') };
});
fig(104, L => {
  const N = 100, m = 10, ax = axes(70, 20, 280, 120, [0, 40], [0, 140], { xl: 'n', yl: L('可见样本数', 'visible samples'), ylMath: false });
  let s = ax.body + path(curve(n => n * m, 0, 14, ax.X, ax.Y), { stroke: C.teal, sw: 1.6, dash: '5 4' }) + line(ax.X(0), ax.Y(N), ax.X(40), ax.Y(N), { color: C.blue, dash: '5 4', sw: 1.6 });
  s += path(curve(n => N * (1 - (1 - m / N) ** n), 0, 40, ax.X, ax.Y), { stroke: C.amber, sw: 2.6 });
  s += M(ax.X(12), ax.Y(130), 'nm', { color: C.teal }) + M(ax.X(38), ax.Y(N) - 6, 'N', { color: C.blue, anchor: 'end' }) + M(ax.X(25), ax.Y(70), 'E U', { color: C.amber });
  s += note(380, 50, [['E U = N[1 − (1 − m/N)^n]', { math: true, size: 12.5 }], L('先跟着 nm 涨，', 'Follows nm at first,'), L('后被池子 N 封顶', 'then capped by the pool N'), L('（N = 100，m = 10）', '(N = 100, m = 10)')]);
  return { svg: svg(W, 165, s), cap: L('期望可见样本数：机器少时几乎没有重叠，跟着 nm 增长；机器多了以后被池子大小 N 封顶。', 'Expected visible samples: with few machines there is little overlap and it tracks nm; with many machines it saturates at the pool size N.') };
});
fig(105, L => ({ svg: svg(W, 90, stack(160, 20, 340, 34, [{ v: 1, fill: C.blueS, in: 'dv' }, { v: 1, fill: C.blueS, in: 'dv' }, { v: 0.6, fill: C.faint, in: '…', inMath: false }, { v: 1, fill: C.blueS, in: 'dv' }], { left: 'tr J_{T|W} ≤ dv·U(S)' }) + T(160, 76, L('消息只是 U 条可见独立数据的加工品；每条至多 dv', 'the message processes U independent visible samples; each ≤ dv'), { size: 12, color: C.gray })), cap: L('固定清单和随机数后，记录的信息不超过可见样本的信息：U 条，每条至多 dv。', 'With design and seeds fixed, the transcript carries no more than the visible samples: U of them, at most dv each.') }));
fig(107, L => {
  const ax = axes(70, 20, 280, 120, [0, 40], [0, 1], { xl: 'n', yl: L('风险下界', 'risk floor'), ylMath: false });
  const N = 100, m = 10, EU = n => N * (1 - (1 - m / N) ** n);
  let s = ax.body + path(curve(n => 6 / (EU(n) + 6), 0.3, 40, ax.X, ax.Y), { stroke: C.blue, sw: 2.6 }) + line(ax.X(0), ax.Y(6 / 106), ax.X(40), ax.Y(6 / 106), { color: C.blue, dash: '4 3', sw: 1.2 });
  s += M(ax.X(39), ax.Y(6 / 106) - 6, '≈ d/N', { anchor: 'end', color: C.blue, size: 12 });
  s += note(380, 50, [['R_{BB} ≥ d / (v E U + 4π²)', { math: true, size: 12.5 }], L('可见独立数据越少，', 'Fewer visible samples,'), L('风险底线越高', 'higher risk floor'), ['≳ d / min{N, nm}', { math: true, size: 12.5, color: C.blue }]]);
  return { svg: svg(W, 165, s), cap: L('把可见样本的信息界放进 van Trees，得到下界的前两项：机器多了也降不过 d/N 量级。', 'Feeding the visible-sample bound into van Trees gives the first two terms of the lower bound: adding machines cannot push below order d/N.') };
});
function postFig(L) {
  const ax = axes(40, 20, 300, 110, [0, 1], [0, 4.5], { xl: 'θ' });
  let s = ax.body + path(curve(t => 2 * Math.sin(Math.PI * t) ** 2, 0, 1, ax.X, ax.Y), { stroke: C.purple, sw: 2, dash: '5 4' }) + path(curve(t => 4 * Math.exp(-((t - 0.62) ** 2) / 0.006), 0, 1, ax.X, ax.Y), { stroke: C.amber, sw: 2.4 });
  s += M(ax.X(0.15), ax.Y(1.6), L('先验', 'prior'), { color: C.purple, size: 12 }) + M(ax.X(0.66), ax.Y(4.2), L('看完记录后', 'after the record'), { color: C.amber, size: 12 });
  return s;
}
fig(109, L => ({ svg: svg(W, 150, postFig(L) + note(370, 40, [L('后验越窄，熵越小', 'Narrower posterior, lower entropy'), L('方差给定时，高斯的熵最大', 'for a given variance the Gaussian'), L('⇒ 熵 ≤ (d/2) ln(2πe D_y/d)', 'has the most ⇒ h ≤ (d/2) ln(2πe D_y/d)')])), cap: L('看完记录后参数的剩余不确定性（橙）被它的平方误差控制：同方差下高斯分布的熵最大。', 'The uncertainty left about θ after the record (orange) is controlled by its squared error: for a given variance the Gaussian has the largest entropy.') }));
fig(111, L => ({ svg: svg(W, 150, postFig(L) + note(370, 40, [L('信息 = 宽的熵 − 窄的熵', 'information = wide − narrow entropy'), ['I(Θ; T, W) ≥ h(π) − (d/2) ln(2πeD/d)', { math: true, size: 12 }], L('误差小 ⇒ 记录必须解释很多', 'small risk ⇒ the record must explain a lot')])), cap: L('误差越小，后验越窄，记录必须提供的关于参数的信息就越多。', 'The smaller the risk, the narrower the posterior, and the more information about θ the record must carry.') }));
fig(113, L => ({ svg: svg(W, 90, stack(170, 20, 340, 34, [{ v: 3, fill: C.blueS, in: 'I(Θ; T | W)' }, { v: 1.2, fill: C.tealS, in: L('其余', 'rest'), inMath: false }], { left: 'H(T | W) ≤ B ln 2:' }) + T(170, 76, L('能告诉你的参数信息，至多是记录本身的不确定性', 'information about θ is at most the record’s own uncertainty'), { size: 12, color: C.gray })), cap: L('记录至多 B 位：它的熵不超过 B ln 2，关于参数的信息只能更少。', 'The record has at most B bits: its entropy is at most B ln 2, and the information about θ can only be less.') }));
fig(114, L => {
  let s = rect(30, 20, 120, 120, { fill: '#fff', stroke: C.ink, sw: 1.4 });
  for (let k = 1; k < 4; k++) s += line(30 + 30 * k, 20, 30 + 30 * k, 140, { color: C.line, sw: 1 }) + line(30, 20 + 30 * k, 150, 20 + 30 * k, { color: C.line, sw: 1 });
  s += rect(90, 50, 30, 30, { fill: C.amberS, stroke: C.amber, sw: 2 }) + circ(104, 63, 3, { fill: C.red, stroke: 'none' });
  s += note(180, 40, [L('B 位最多区分 2^B 个格子', 'B bits tell apart at most 2^B cells'), L('d 维里每格边长 ≈ 2^{−B/d}', 'in d dimensions each side ≈ 2^{−B/d}'), [L('D ≥ (2d / πe³) · 2^{−2B/d}', 'D ≥ (2d / πe³) · 2^{−2B/d}'), { math: true, color: C.amber }], L('（图中 d = 2，B = 4：16 格）', '(here d = 2, B = 4: 16 cells)')]);
  return { svg: svg(W, 160, s), cap: L('比特底线：B 位只能把参数立方体分成 2^B 块，所以误差不可能小于格子大小。', 'The bit floor: B bits split the parameter cube into at most 2^B cells, so the error cannot beat the cell size.') };
});
function budget(L, small) {
  const a = small ? 3.6 : 2.2, b = small ? 0.6 : 2;
  return stack(130, 20, 400, 34, [{ v: a, fill: C.blueS, in: 'I(Θ; T | W)', bot: L('辨认参数', 'identify θ') }, { v: b, fill: C.tealS, in: 'h_T', bot: L('θ 固定后剩下的', 'left once θ is fixed') }], { left: 'B ln 2 ≥' });
}
fig(116, L => ({ svg: svg(W, 100, budget(L, false) + T(130, 92, L('已知真参数、清单和种子，样本仍随机，消息仍会变：h_T 衡量这种变动', 'even with θ, design and seeds known, samples are random and the message varies: h_T measures it'), { size: 11.5, color: C.gray })), cap: L('剩余熵 h_T：知道参数以后，记录还剩多少随机性。', 'Leftover entropy h_T: how random the record still is once θ is known.') }));
fig(117, L => ({ svg: svg(W, 90, budget(L, false)), cap: L('同一份比特预算拆成两部分：一部分辨认参数，一部分是参数已知后的剩余随机性。', 'The same bit budget splits in two: part identifies θ, part is randomness left once θ is known.') }));
fig(118, L => ({ svg: svg(W, 170, T(130, 14, L('误差中等：', 'moderate risk:'), { size: 12, weight: 600 }) + budget(L, false).replace(/y="20"/g, 'y="20"') + `<g transform="translate(0,80)">${T(130, 14, L('误差很小：', 'small risk:'), { size: 12, weight: 600 })}${budget(L, true)}</g>`), cap: L('预算固定：要求的误差越小，辨认参数要用掉越多比特，留给 h_T 的越少。后面 Fisher 信息被 h_T 控制，这就是夹逼的来源。', 'With a fixed budget, a smaller target risk uses more bits to identify θ and leaves less for h_T. Later the Fisher information is controlled by h_T, which is where the squeeze comes from.') }));

/* ===================== III-B concentration of a block score ===================== */
fig(119, L => ({ svg: svg(W, 80, M(20, 40, 'A_q = ξ_θ(X_1) + … + ξ_θ(X_q)', { size: 15 }) + T(20, 66, L('一块里 q 条样本的得分加起来，就是这块的得分', 'the scores of the q samples in a block add up to the block score'), { size: 12, color: C.gray })), cap: L('块得分：一台机器所持 q 条独立样本的得分之和。', 'Block score: the sum of the scores of the q independent samples a machine holds.') }));
fig(121, L => ({
  svg: svg(W, 170, dens(20, 40, 240, 80, { shade: [-0.2, 3] }) + T(140, 30, L('常见事件（p ≈ 0.6）', 'common event (p ≈ 0.6)'), { anchor: 'middle', size: 12, color: C.gray }) +
    dens(300, 40, 240, 80, { shade: [1.4, 3] }) + T(420, 30, L('罕见事件（p ≈ 0.08）', 'rare event (p ≈ 0.08)'), { anchor: 'middle', size: 12, color: C.gray }) +
    M(280, 160, '‖E[A_q | E]‖ ≤ √(2vq ln(1/p)) + b ln(1/p)', { anchor: 'middle', size: 14, color: C.amber })),
  cap: L('引理 1：知道一个事件发生后，块得分的平均会偏移；事件越罕见（右），允许的偏移越大，但只按 √ln(1/p) 增长。', 'Lemma 1: learning that an event happened shifts the average block score; the rarer the event (right), the larger the allowed shift, but it grows only like √ln(1/p).'),
}));
fig(122, L => ({ svg: lemma1Plot(L, false), cap: L('把偏移界平方：线性项 4vqℓ 加上厚尾带来的平方项 2b²ℓ²。', 'Squaring the shift bound: a linear term 4vqℓ plus the heavy-tail quadratic term 2b²ℓ².') }));
fig(123, L => ({ svg: lemma1Plot(L, true), cap: L('次高斯（b = 0）时直接平方，只剩随惊讶度线性增长的 2vqℓ。', 'With a sub-Gaussian score (b = 0) the square is just 2vqℓ, linear in the surprise.') }));
fig(125, L => ({
  svg: svg(W, 140, line(60, 120, 260, 120, { color: C.line, sw: 1 }) + line(60, 120, 60, 10, { color: C.line, sw: 1 }) + arrow(60, 120, 200, 40, { color: C.amber, arrowColor: 'a', sw: 2.6 }) + M(206, 38, 'μ_E', { color: C.amber, size: 14 }) +
    arrow(60, 120, 103, 95, { color: C.red, arrowColor: 'r', sw: 2.2 }) + M(84, 92, 'e', { color: C.red, size: 14 }) +
    note(300, 40, [L('沿偏移自己的方向看', 'Look along the shift itself'), ['e = μ_E / ‖μ_E‖', { math: true, size: 13.5, color: C.red }], ['⟨e, μ_E⟩ = ‖μ_E‖', { math: true, size: 13.5 }], L('多维问题变成一维', 'a d-dim problem becomes 1-dim')])),
  cap: L('选方向 e 等于偏移本身的方向，投影长度就是偏移大小；于是只需用 (19) 的一维形式。', 'Choose the direction e along the shift itself; the projection is the full length, so the one-dimensional form of (19) suffices.'),
}));
fig(126, L => {
  const ax = axes(60, 20, 260, 110, [-1.5, 1.5], [0, 4.6], { xl: 'x' });
  let s = ax.body + path(curve(x => Math.exp(x), -1.5, 1.5, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  const a = -1.2, b = 1.2;
  s += line(ax.X(a), ax.Y(Math.exp(a)), ax.X(b), ax.Y(Math.exp(b)), { color: C.amber, sw: 1.8, dash: '5 4' }) + circ(ax.X(0), ax.Y((Math.exp(a) + Math.exp(b)) / 2), 4, { fill: C.amber, stroke: '#fff' }) + circ(ax.X(0), ax.Y(1), 4, { fill: C.blue, stroke: '#fff' });
  s += M(ax.X(0) - 8, ax.Y((Math.exp(a) + Math.exp(b)) / 2) - 6, 'E e^X', { color: C.amber, anchor: 'end' }) + M(ax.X(0) + 8, ax.Y(1) + 16, 'e^{E X}', { color: C.blue });
  s += note(370, 50, [L('指数是凸的：', 'exp is convex:'), [L('e^{E X} ≤ E e^X', 'e^{E X} ≤ E e^X'), { math: true, color: C.amber }], L('换成后者，就能用 (19)', 'the right side is what (19) controls')]);
  return { svg: svg(W, 150, s), cap: L('Jensen：先平均再取指数，不超过先取指数再平均。证明把平均偏移的指数换成指数的平均，好让 (19) 派上用场。', 'Jensen: exponentiating an average is at most averaging the exponential. The proof makes this swap so that (19) applies.') };
});
fig(127, L => {
  const w = [0.15, 0.25, 0.2, 0.25, 0.15], inE = [false, false, true, true, false];
  let s = T(20, 20, L('原来的权重', 'original weights'), { size: 12, weight: 600 }) + T(300, 20, L('条件化之后', 'after conditioning'), { size: 12, weight: 600 });
  w.forEach((p, i) => { s += rect(20 + i * 46, 110 - p * 300, 36, p * 300, { fill: inE[i] ? C.amberS : C.faint, stroke: inE[i] ? C.amber : C.line, r: 2 }); });
  w.forEach((p, i) => { const q = inE[i] ? p / 0.45 : 0; s += rect(300 + i * 46, 110 - q * 150, 36, Math.max(q * 150, 0.5), { fill: inE[i] ? C.amberS : '#fff', stroke: inE[i] ? C.amber : C.line, r: 2, dash: inE[i] ? undefined : '3 3' }); });
  s += arrow(255, 70, 290, 70, { sw: 2 }) + T(272, 60, '×1/p', { anchor: 'middle', size: 11.5, color: C.amber });
  s += T(150, 130, L('橙色 = 事件 E 内（p = 0.45）', 'orange = inside E (p = 0.45)'), { anchor: 'middle', size: 11.5, color: C.gray }) + T(410, 130, L('E 外清零，E 内放大 1/p', 'outside zeroed, inside × 1/p'), { anchor: 'middle', size: 11.5, color: C.gray });
  return { svg: svg(W, 140, s), cap: L('条件平均 = 只留事件内的部分再除以 p；对正的量，把事件外的也加回来只会更大。', 'A conditional average keeps only the event and divides by p; for a positive quantity, adding back the outside only makes it larger.') };
});
fig(129, L => ({ svg: svg(W, 140, `<g>${T(20, 20, L('重新加权的代价', 'The cost of reweighting'), { size: 12, weight: 600 })}</g>` + [0.15, 0.25, 0.2, 0.25, 0.15].map((p, i) => { const inE = i === 2 || i === 3, q = inE ? p / 0.45 : 0; return rect(20 + i * 46, 110 - p * 300, 36, p * 300, { fill: C.faint, stroke: C.line, r: 2 }) + rect(26 + i * 46, 110 - q * 150, 24, Math.max(0.5, q * 150), { fill: inE ? C.amberS : 'none', stroke: inE ? C.amber : 'none', r: 2 }); }).join('') + note(280, 40, [['D(P_E ‖ P) = ln(1/p)', { math: true, size: 14, color: C.amber }], L('灰：原分布；橙：条件化后', 'grey: original; orange: conditioned'), L('越罕见，挪动越大，代价越高', 'rarer events cost more')])), cap: L('条件化的 KL 代价恰好是 ln(1/p)，这就是“惊讶度”在偏移界里出现的原因。', 'The KL cost of conditioning is exactly ln(1/p), which is why the surprise appears in the shift bound.') }));
fig(130, L => {
  const ax = axes(60, 20, 270, 120, [0.15, 2.5], [0, 8], { xl: 'λ' });
  const l = 2, vq = 1, f1 = x => l / x, f2 = x => vq * x / (2 * (1 - 0.3 * x)), f = x => f1(x) + f2(x);
  let s = ax.body + path(curve(f1, 0.25, 2.5, ax.X, ax.Y), { stroke: C.blue, sw: 1.8, dash: '5 4' }) + path(curve(f2, 0.15, 2.5, ax.X, ax.Y), { stroke: C.purple, sw: 1.8, dash: '5 4' }) + path(curve(f, 0.25, 2.5, ax.X, ax.Y), { stroke: C.amber, sw: 2.6 });
  let best = 0.25; for (let x = 0.25; x < 2.5; x += 0.005) if (f(x) < f(best)) best = x;
  s += circ(ax.X(best), ax.Y(f(best)), 5, { fill: C.red, stroke: '#fff' }) + M(ax.X(best), ax.Y(f(best)) - 10, 'λ_*', { anchor: 'middle', color: C.red });
  s += M(ax.X(0.4), ax.Y(7.5), 'ℓ/λ', { color: C.blue }) + M(ax.X(2.45), ax.Y(f2(2.45)) + 22, L('尾界代价', 'tail cost'), { color: C.purple, anchor: 'end', size: 12 });
  s += note(380, 50, [L('λ 大：罕见代价 ℓ/λ 小', 'Large λ: small ℓ/λ'), L('λ 小：尾界代价小', 'small λ: small tail cost'), L('折中点 λ_* 给出最紧的界', 'the balance λ_* is tightest')]);
  return { svg: svg(W, 165, s), cap: L('选 λ：两项一个随 λ 下降、一个上升，取它们的和最小处附近（论文给出显式的 λ_*）。', 'Choosing λ: one term falls and one rises with λ; take a value near the minimum of their sum (the paper gives an explicit λ_*).') };
});
fig(136, L => ({ svg: entropyBars(L, true), cap: L('把每条消息当作一个事件，按出现概率平均：平均惊讶就是消息的熵。', 'Treat each message as an event and average with its probability: the average surprise is the message entropy.') }));
fig(138, L => {
  const ax = axes(70, 20, 260, 110, [0.01, 1], [0, 4.6], { xl: 'p', yl: 'ln(1/p)' });
  let s = ax.body + path(curve(p => Math.log(1 / p), 0.012, 1, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 });
  s += note(370, 50, [L('自信息 = 惊讶度', 'Self-information = surprise'), L('越罕见的消息，', 'The rarer the message,'), L('看到它越“惊讶”', 'the bigger the surprise')]);
  return { svg: svg(W, 150, s), cap: L('惊讶度 ln(1/p)：概率越小越大，概率为 1 时为 0。', 'Surprise ln(1/p): larger for rarer messages, zero for a sure one.') };
});
function tailFig(L, area) {
  const B = 4, a = B * Math.LN2, ax = axes(70, 20, 280, 110, [0, 8], [0, 1.1], { xl: 'x', yl: 'P(L_T > x)' });
  let s = ax.body;
  if (area) { let d = `M${ax.X(0)},${ax.Y(0)}`; for (let k = 0; k <= 60; k++) { const x = 8 * k / 60; d += `L${ax.X(x)},${ax.Y(Math.min(1, 2 ** B * Math.exp(-x)) * x / 8)}`; } d += `L${ax.X(8)},${ax.Y(0)}Z`; s += path(d, { fill: C.amberS, stroke: 'none' }); }
  s += path(curve(x => Math.min(1, 2 ** B * Math.exp(-x)), 0, 8, ax.X, ax.Y), { stroke: C.blue, sw: 2.4 }) + line(ax.X(a), ax.Y(0), ax.X(a), ax.Y(1), { color: C.gray, dash: '4 3' }) + M(ax.X(a), ax.Y(0) + 16, 'B ln 2', { anchor: 'middle', color: C.gray, size: 12 });
  s += M(ax.X(1.2), ax.Y(1) - 6, '1', { color: C.blue }) + M(ax.X(5.5), ax.Y(0.4), '2^B e^{−x}', { color: C.blue });
  return s;
}
fig(139, L => ({ svg: svg(W, 160, tailFig(L, false) + note(380, 46, [L('单条消息可以极罕见，', 'A single message can be very rare,'), L('但消息种类 ≤ 2^B', 'but there are ≤ 2^B kinds'), [L('E L_T² ≤ (B ln2)² + 2B ln2 + 2', 'E L_T² ≤ (B ln2)² + 2B ln2 + 2'), { math: true, size: 12, color: C.amber }]])), cap: L('引理 2：惊讶度的尾巴在 B ln 2 之后按指数衰减，所以平方惊讶的平均有统一上界 K_B（图中 B = 4）。', 'Lemma 2: the tail of the surprise decays exponentially beyond B ln 2, so its mean square has a uniform bound K_B (here B = 4).') }));
fig(140, L => ({ svg: svg(W, 160, tailFig(L, false) + note(380, 46, [L('惊讶 > x ⇔ 概率 < e^{−x}', 'surprise > x ⇔ prob < e^{−x}'), L('这样的消息至多 2^B 条', 'at most 2^B such messages'), L('⇒ 总概率 ≤ 2^B e^{−x}', '⇒ total ≤ 2^B e^{−x}')])), cap: L('惊讶超过 x 的消息每条概率都小于 e^{−x}，最多 2^B 条，总概率因此有指数尾。', 'Each message with surprise above x has probability below e^{−x}, and there are at most 2^B of them, giving an exponential tail.') }));
fig(143, L => ({ svg: svg(W, 160, tailFig(L, true) + note(380, 46, [L('E L² = ∫ 2x P(L > x) dx', 'E L² = ∫ 2x P(L > x) dx'), L('左段用 1，右段用指数界', 'use 1 left, the tail right'), [L('= a² + 2a + 2', '= a² + 2a + 2'), { math: true, color: C.amber }]])), cap: L('把平方惊讶的平均写成尾积分（橙色面积的形状），在 B ln 2 处分两段积分。', 'Write the mean squared surprise as a tail integral (shape of the orange area) and split it at B ln 2.') }));
fig(146, L => ({ svg: svg(W, 110, [1, 2, 3].map(i => rect(20 + (i - 1) * 150, 30, 130, 40, { fill: [C.tealS, C.blueS, C.purpleS][i - 1], stroke: [C.teal, C.blue, C.purple][i - 1] }) + M(85 + (i - 1) * 150, 55, `Z_${i}: q_${i} ≤ q`, { anchor: 'middle', size: 13 })).join('') + M(160, 56, '⊥', { anchor: 'middle', size: 16, color: C.red }) + M(310, 56, '⊥', { anchor: 'middle', size: 16, color: C.red }) + T(240, 100, L('先研究最简单的情形：各机器的数据块互相独立（III-D 再处理重叠）', 'the easy case first: independent private blocks (III-D handles overlap)'), { anchor: 'middle', size: 12, color: C.gray })), cap: L('III-C 的设定：每台机器有自己的独立样本块，至多 q 条。', 'The setting of III-C: each machine has its own independent block of at most q samples.') }));
fig(147, L => ({ svg: svg(W, 90, stack(140, 20, 380, 36, [{ v: 3, fill: C.tealS, in: '4vq·H_θ(T|R)', bot: L('平均惊讶 × 块大小', 'avg. surprise × block size') }, { v: 1, fill: C.purpleS, in: '2b²K_B', bot: L('厚尾修正', 'heavy-tail fix') }], { left: 'tr J_{T,R} ≤' })), cap: L('引理 3：独立私有块下，记录的信息被“熵 × 块大小”控制，交互也一样。证明在 (150)–(169)。', 'Lemma 3: with independent private blocks the transcript information is controlled by entropy × block size, interaction included. Proof in (150)–(169).') }));
fig(148, L => ({ svg: svg(W, 80, stack(140, 20, 300, 36, [{ v: 3, fill: C.tealS, in: '2vq·H_θ(T|R)' }], { left: 'tr J_{T,R} ≤' }) + T(450, 42, L('b = 0：没有平方项', 'b = 0: no square term'), { size: 12, color: C.gray })), cap: L('次高斯情形：只需平均惊讶（熵），系数减半。', 'Sub-Gaussian case: only the average surprise (entropy) is needed, with half the factor.') }));
fig(149, L => {
  const bits = [['1', 'A'], ['0', 'B'], ['1', 'A'], ['1', 'C'], ['0', 'A']], col = { A: [C.teal, C.tealS], B: [C.blue, C.blueS], C: [C.purple, C.purpleS] };
  let s = T(20, 20, L('一份完整记录 t = 10110：每位由谁写？', 'A full record t = 10110: who wrote each bit?'), { size: 12.5, weight: 600 });
  bits.forEach(([b, w], i) => { s += rect(20 + i * 50, 34, 42, 42, { fill: w === 'A' ? col.A[1] : '#fff', stroke: col[w][0], sw: w === 'A' ? 2.4 : 1.2 }) + T(41 + i * 50, 61, b, { anchor: 'middle', size: 16, weight: 700, color: col[w][0] }) + T(41 + i * 50, 92, w, { anchor: 'middle', size: 12, color: col[w][0] }); });
  s += note(300, 40, [L('E_A(t)：机器 A 的数据必须', 'E_A(t): A’s data must reproduce'), L('在第 1、3、5 位写出 1、1、0', 'bits 1, 3, 5 as 1, 1, 0'), L('（给定前面的历史）', '(given the earlier history)')]);
  return { svg: svg(W, 110, s), cap: L('块事件：固定一整份记录，回看机器 A 负责的那些位置，A 的本地数据必须逐位重现它们。所有机器的块事件取交集，就是 (150) 的长方形。', 'Block event: fix a full record and look at the positions machine A wrote; A’s data must reproduce those bits. Intersecting all machines’ block events gives the rectangle of (150).') };
});

module.exports = F;
