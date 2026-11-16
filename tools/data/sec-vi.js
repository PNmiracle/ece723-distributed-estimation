// VI (eqs 488–490) and appendix (491–492).
const T = String.raw;
const zhNotes = {
  488: [T`<b>唯一没解决的区间</b>：临界窗口里的"中等重叠"。余量无限变大但比 $n$ 慢，档案库不大也不小：比"几乎不撞车"小，又比"卷宗稀缺"大。`],
  489: [T`在这里，地板和天花板只差下界分母里的 $\bar r$：下界是 $\tfrac{d}{ms+\bar r}$，上界是 $\tfrac{d}{ms}$。要么证明 $\bar r$ 可以去掉，要么找到一个能利用重叠、做得更好的协议。`],
  490: [T`作者给出的一条充分路线：如果能证明这个<b>不含 $\bar r$</b> 的信息不等式（信息 ≤ $Cm$ × 条件熵），缺失的 $d/(ms)$ 下界就有了。这是论文留下的<b>开放问题</b>，可以想想看能不能做出来。`],
  491: [T`任意两台机器之间至少撞车一次的概率 ≤ 两两配对数 × 每对平均撞车数。所以档案库要大到 $N\gg n^2m^2$ 才能高概率"零撞车"。`],
  492: [T`重复访问占总访问的比例 ≤ $\tfrac{(n-1)m}{2N}$，只要 $N\gg nm$ 就趋于 0。但比例趋于 0 还不够把独立块的结论直接搬过来，因为目标误差可能指数级小。`],
};
const enNotes = {
  488: [T`<b>The only unresolved zone</b>: "intermediate overlap" inside the critical window. The surplus grows without bound but more slowly than $n$, and the archive is neither small nor huge: smaller than "almost no collisions", bigger than "files are scarce".`],
  489: [T`Here floor and ceiling differ only by the $\bar r$ in the lower bound's denominator: lower bound $\tfrac{d}{ms+\bar r}$, upper bound $\tfrac{d}{ms}$. Either $\bar r$ can be removed from the proof, or some protocol exploits overlap to do better.`],
  490: [T`A sufficient route the authors suggest: prove this information inequality <b>without $\bar r$</b> (information ≤ $Cm$ × conditional entropy), and the missing $d/(ms)$ lower bound follows. This is the paper's <b>open problem</b>; think about whether you can crack it.`],
  491: [T`The chance that some pair of machines collides at least once ≤ number of pairs × average collisions per pair. So the archive must be as big as $N\gg n^2m^2$ for "zero collisions" with high probability.`],
  492: [T`The fraction of repeated accesses is ≤ $\tfrac{(n-1)m}{2N}$, which tends to 0 once $N\gg nm$. But a vanishing fraction is not enough to transfer independent-block results directly, since the target error may be exponentially small.`],
};
const zhSyms = {
  488: [[T`s\to\infty,\ s=o(n)`, T`临界窗口：余量变大但比 $n$ 慢`], [T`\ll`, T`远小于`], [T`ms\ll N\ll\tfrac{n^2m}{s}`, T`中等大小的档案库`]],
  489: [[T`\bar r`, T`平均共享卷宗数`], [T`R_{\mathrm{BB}},\ R_{\mathrm{NI}}`, T`黑板、非交互的极小极大风险`]],
  490: [[T`\mathbb E_{\Theta,\mathcal S,R}`, T`对先验、设计、种子平均`], [T`J_{T\mid\mathcal S,R}`, T`给定设计和种子时记录的信息`], [T`H(T\mid\Theta,\mathcal S,R)`, T`记录的"废话量"`]],
  491: [[T`\exists\,i<j`, T`存在某一对机器`], [T`S_i\cap S_j\ne\varnothing`, T`两人清单有交集（撞车）`], [T`\binom n2\tfrac{m^2}N`, T`配对数 × 每对平均撞车数`]],
  492: [[T`nm-U`, T`重复访问的次数`], [T`\tfrac{(n-1)m}{2N}`, T`重复比例的上界`]],
};
const enSyms = {
  488: [[T`s\to\infty,\ s=o(n)`, T`critical window: surplus grows, but slower than $n$`], [T`\ll`, T`much less than`], [T`ms\ll N\ll\tfrac{n^2m}{s}`, T`a medium-sized archive`]],
  489: [[T`\bar r`, T`average number of shared files`], [T`R_{\mathrm{BB}},\ R_{\mathrm{NI}}`, T`blackboard and noninteractive minimax risks`]],
  490: [[T`\mathbb E_{\Theta,\mathcal S,R}`, T`average over prior, design and seeds`], [T`J_{T\mid\mathcal S,R}`, T`transcript information given design and seeds`], [T`H(T\mid\Theta,\mathcal S,R)`, T`the transcript's "filler"`]],
  491: [[T`\exists\,i<j`, T`there is some pair of machines`], [T`S_i\cap S_j\ne\varnothing`, T`their lists intersect (a collision)`], [T`\binom n2\tfrac{m^2}N`, T`pairs × average collisions per pair`]],
  492: [[T`nm-U`, T`number of repeated accesses`], [T`\tfrac{(n-1)m}{2N}`, T`cap on the repeat fraction`]],
};
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));
const part = keys => ({
  zh: { notes: pick(zhNotes, keys), syms: pick(zhSyms, keys) },
  en: { notes: pick(enNotes, keys), syms: pick(enSyms, keys) },
});
module.exports = process.env.PART === 'app' ? part([491, 492]) : part([488, 489, 490]);
