// Pronunciation dictionary for hard-to-read symbols: [regex on TeX, glyph TeX, English reading, Chinese reading]
const T = String.raw;
const greek = [
  ['alpha', T`\alpha`, 'alpha /ˈælfə/', '阿尔法'],
  ['beta', T`\beta`, 'beta /ˈbeɪtə/', '贝塔'],
  ['gamma', T`\gamma`, 'gamma /ˈɡæmə/', '伽马'],
  ['Gamma', T`\Gamma`, 'capital gamma', '大写伽马'],
  ['delta', T`\delta`, 'delta /ˈdɛltə/', '德尔塔'],
  ['Delta', T`\Delta`, 'capital delta', '大写德尔塔'],
  ['epsilon', T`\epsilon`, 'epsilon /ˈɛpsɪlɒn/', '艾普西隆'],
  ['varepsilon', T`\varepsilon`, 'epsilon /ˈɛpsɪlɒn/', '艾普西隆'],
  ['eta', T`\eta`, 'eta /ˈiːtə/', '伊塔'],
  ['theta', T`\theta`, 'theta /ˈθiːtə/', '西塔'],
  ['Theta', T`\Theta`, 'capital theta', '大写西塔'],
  ['vartheta', T`\vartheta`, 'curly theta (var-theta)', '花体西塔'],
  ['iota', T`\iota`, 'iota /aɪˈoʊtə/', '约塔'],
  ['lambda', T`\lambda`, 'lambda /ˈlæmdə/', '兰布达'],
  ['mu', T`\mu`, 'mu /mjuː/', '缪'],
  ['nu', T`\nu`, 'nu /njuː/', '纽'],
  ['xi', T`\xi`, 'xi /ksaɪ/ or /zaɪ/', '克赛'],
  ['pi', T`\pi`, 'pi /paɪ/', '派'],
  ['rho', T`\rho`, 'rho /roʊ/', '柔'],
  ['sigma', T`\sigma`, 'sigma /ˈsɪɡmə/', '西格玛'],
  ['phi', T`\phi`, 'phi /faɪ/', '斐（法伊）'],
  ['varphi', T`\varphi`, 'phi /faɪ/', '斐（法伊）'],
  ['psi', T`\psi`, 'psi /saɪ/', '普赛'],
  ['omega', T`\omega`, 'omega /oʊˈmeɪɡə/', '欧米伽'],
  ['Phi', T`\Phi`, 'capital phi /faɪ/', '大写斐'],
  ['Sigma', T`\Sigma`, 'capital sigma', '大写西格玛'],
  ['tau', T`\tau`, 'tau /taʊ/', '陶'],
  ['kappa', T`\kappa`, 'kappa /ˈkæpə/', '卡帕'],
  ['chi', T`\chi`, 'chi /kaɪ/', '凯'],
  ['zeta', T`\zeta`, 'zeta /ˈziːtə/', '泽塔'],
  ['Lambda', T`\Lambda`, 'capital lambda', '大写兰布达'],
  ['Psi', T`\Psi`, 'capital psi', '大写普赛'],
  ['Omega', T`\Omega`, 'capital omega', '大写欧米伽'],
];
const D = [
  ...greek.map(([n, g, e, z]) => [new RegExp('\\\\' + n + '(?![a-zA-Z])'), g, e, z]),
  [/\\ell(?![a-zA-Z])/, T`\ell`, 'ell (script l)', '花体 l'],
  [/\\nabla/, T`\nabla`, 'nabla /ˈnæblə/, "grad"', '纳布拉，读"梯度"'],
  [/\\partial/, T`\partial`, 'partial /ˈpɑːrʃəl/', '偏导，读"偏"'],
  [/\\mathbb\s*\{?E/, T`\mathbb E`, 'E, "expectation of"', '期望 E'],
  [/\\mathbb\s*\{?P/, T`\mathbb P`, 'P, "probability of"', '概率 P'],
  [/\\mathbb\s*\{?R/, T`\mathbb R`, 'R, "the reals"', '实数集 R'],
  [/\\mathbf\s*\{?1/, T`\mathbf 1`, 'bold one, "indicator of"', '示性函数（粗体 1）'],
  [/\\preceq/, T`\preceq`, '"precedes or equals" (matrix ≤)', '"不超过"（矩阵序）'],
  [/\\asymp/, T`\asymp`, '"is of the order of"', '"同阶于"'],
  [/\\lesssim/, T`\lesssim`, '"is at most of order"', '"小于约等于"'],
  [/\\gtrsim/, T`\gtrsim`, '"is at least of order"', '"大于约等于"'],
  [/\\(big)?otimes/, T`\otimes`, '"o-times", tensor / product', '"圈乘"，独立乘积'],
  [/\\top/, T`^\top`, '"transpose"', '转置，读 "T"'],
  [/\\prod/, T`\prod`, 'product (capital pi)', '连乘（大写派）'],
  [/\\sup(?![a-z])/, T`\sup`, 'sup, "supremum" /suːˈpriːməm/', '上确界，读 "sup"'],
  [/\\inf(?![a-z])/, T`\inf`, 'inf, "infimum" /ɪnˈfɪməm/', '下确界，读 "inf"'],
  [/arg\\,min/, T`\operatorname*{arg\,min}`, '"arg min"', '"使……最小的那个"'],
  [/\\operatorname\{tr\}/, T`\operatorname{tr}`, '"trace"', '迹（trace）'],
  [/\\operatorname\{Var\}/, T`\operatorname{Var}`, '"variance"', '方差'],
  [/\\operatorname\{Bin\}/, T`\operatorname{Bin}`, '"binomial"', '二项分布'],
  [/\\binom/, T`\binom{n}{k}`, '"n choose k"', '组合数，读"n 选 k"'],
  [/\\lfloor/, T`\lfloor\cdot\rfloor`, '"floor"', '向下取整'],
  [/\\lceil/, T`\lceil\cdot\rceil`, '"ceiling"', '向上取整'],
  [/\\langle/, T`\langle\cdot,\cdot\rangle`, '"inner product"', '内积（尖括号）'],
  [/\\(wide)?hat/, T`\widehat{a}`, '"hat", e.g. "theta hat"', '戴帽，读"……帽"，表示估计值'],
  [/\\(bar|overline)/, T`\bar a`, '"bar", e.g. "r bar"', '横杠，读"……拔"，表示平均'],
  [/\\(wide)?tilde/, T`\widetilde a`, '"tilde" /ˈtɪldə/', '波浪号，读"……tilde"'],
  [/W_0/, T`W_0`, '"Lambert W zero" /ˈlæmbərt/', '朗伯 W 函数（主支）'],
  [/\\Re(?![a-zA-Z])/, T`\Re`, '"real part of"', '实部'],
  [/\\Im(?![a-zA-Z])/, T`\Im`, '"imaginary part of"', '虚部'],
  [/\\sim(?![a-zA-Z])/, T`\sim`, '"is distributed as"', '"服从"'],
  [/iid/, T`\stackrel{\mathrm{iid}}{\sim}`, '"i.i.d.", independent and identically distributed', '"独立同分布"'],
  [/\\setminus/, T`\setminus`, '"minus" (set difference)', '差集，读"减去"'],
  [/\\(big)?cap/, T`\cap`, '"intersect"', '交集'],
  [/\\(big)?cup/, T`\cup`, '"union"', '并集'],
  [/\\mathrm\{TV\}/, T`\mathrm{TV}`, '"total variation"', '全变差'],
  [/\\operatorname\{diag\}/, T`\operatorname{diag}`, '"diag", diagonal matrix', '对角矩阵'],
  [/\\operatorname\{det\}|\\det/, T`\det`, '"determinant"', '行列式'],
  [/\\mathrm\{op\}/, T`\|\cdot\|_{\mathrm{op}}`, '"operator norm"', '算子范数'],
  [/\\succeq/, T`\succeq`, '"succeeds or equals" (matrix ≥)', '"不小于"（矩阵序）'],
  [/\\succ(?!eq)/, T`\succ`, '"is positive definite" (succ)', '"正定"'],
  [/\\operatorname\{Cov\}/, T`\operatorname{Cov}`, '"covariance"', '协方差'],
  [/\\nabla\^2/, T`\nabla^2`, '"Hessian" (nabla squared)', '黑塞矩阵（Hessian）'],
  [/\\mathrm\{F\}/, T`\|\cdot\|_{\mathrm F}`, '"Frobenius norm" /frəʊˈbiːniəs/', '弗罗贝尼乌斯范数'],
  [/\\stackrel\{\\mathrm\s*\{?d\}?\}/, T`\stackrel{\mathrm d}{=}`, '"equal in distribution"', '"同分布"'],
  [/\\exists/, T`\exists`, '"there exists"', '"存在"'],
  [/\\varnothing|\\emptyset/, T`\varnothing`, '"empty set"', '空集'],
  [/\\ll(?![a-z])/, T`\ll`, '"is much less than"', '"远小于"'],
  [/\\gg(?![a-z])/, T`\gg`, '"is much greater than"', '"远大于"'],
  [/\\bmod/, T`\bmod`, '"mod"', '取余（mod）'],
  [/\\notin/, T`\notin`, '"not in"', '"不属于"'],
  [/\\arg(?![a-z\\])/, T`\arg`, '"argument" (angle)', '辐角'],
  [/\\mathsf\s*\{?([A-Z])/, null, null, null, 'sf'],
  [/\\mathcal\s*\{?([A-Z])/, null, null, null, 'cal'],
];
// Returns readings [{glyph, en, zh}] for a TeX string, excluding keys already in `seen`.
function readings(tex, seen) {
  const out = [];
  for (const [re, g, e, z, kind] of D) {
    if (kind) {
      const reG = new RegExp(re.source, 'g'); let m;
      while ((m = reG.exec(tex))) {
        const L = m[1], key = kind + L;
        if (seen.has(key)) continue; seen.add(key);
        out.push(kind === 'cal'
          ? { g: `\\mathcal ${L}`, e: `script ${L} ("curly ${L}")`, z: `花体 ${L}` }
          : { g: `\\mathsf ${L}`, e: `sans-serif ${L}`, z: `无衬线 ${L}` });
      }
      continue;
    }
    if (re.test(tex) && !seen.has(g)) { seen.add(g); out.push({ g, e, z }); }
  }
  return out;
}
module.exports = { readings };
