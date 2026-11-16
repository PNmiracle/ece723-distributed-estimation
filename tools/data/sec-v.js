// V intro (eqs 366–370): affine reparameterization only changes constants.
const T = String.raw;
module.exports = {
zh: {
  notes: {
    366: [T`很多模型的"自然参数" $\eta$ 不住在单位立方体里。用一个固定的仿射变换（平移 $c$ + 可逆矩阵 $A$）把它搬到 $[0,1]^d$，就像换一把尺子量同一个东西。`],
    367: [T`链式法则：新坐标下的得分 = $A^\top$ × 旧坐标下的得分。`],
    368: [T`换尺子后，伯恩斯坦条件 (19) 的常数只放大了一个固定倍数：$v$ 乘 $\|A\|^2$，$b$ 乘 $\|A\|$。`],
    369: [T`有界识别矩也照样成立：$\theta$ 的误差 ≤ $\|A^{-1}\|$ × $\eta$ 的误差 ≤ 常数 × 指纹误差。`],
    370: [T`两套坐标下的平方误差只差常数倍，所以误差的<b>量级</b>完全不受影响。`],
  },
  syms: {
    366: [[T`\eta`, T`模型原本的自然参数`], [T`c`, T`固定的平移`], [T`A`, T`固定的可逆矩阵（伸缩、旋转）`]],
    367: [[T`\xi_\theta,\ \xi_\eta`, T`新、旧坐标下的得分`], [T`A^\top`, T`$A$ 的转置`]],
    368: [[T`\|A\|_{\mathrm{op}}`, T`算子范数：$A$ 最多能把向量拉长几倍`], [T`v_\theta,\ b_\theta`, T`新坐标下的常数`]],
    369: [[T`\|A^{-1}\|_{\mathrm{op}}`, T`逆矩阵最多拉长几倍`], [T`L_\eta`, T`旧坐标下的指纹放大倍数`], [T`\mu_\eta`, T`旧坐标下的矩映射`]],
    370: [[T`\sigma_{\min}(A)`, T`$A$ 的最小奇异值：最多把向量压短到几倍`], [T`\widehat\eta,\ \widehat\theta`, T`两套坐标下的估计`]],
  },
},
en: {
  notes: {
    366: [T`Many models have a "natural parameter" $\eta$ that does not live in the unit cube. A fixed affine map (shift $c$ + invertible matrix $A$) moves it to $[0,1]^d$, like measuring the same thing with a different ruler.`],
    367: [T`Chain rule: the score in new coordinates = $A^\top$ × the score in old coordinates.`],
    368: [T`After changing the ruler, the constants in the Bernstein condition (19) grow only by a fixed factor: $v$ times $\|A\|^2$, $b$ times $\|A\|$.`],
    369: [T`Bounded identifying moments still work: error in $\theta$ ≤ $\|A^{-1}\|$ × error in $\eta$ ≤ constant × fingerprint error.`],
    370: [T`Squared errors in the two coordinate systems differ only by constant factors, so the <b>order</b> of the error is unaffected.`],
  },
  syms: {
    366: [[T`\eta`, T`the model's original natural parameter`], [T`c`, T`a fixed shift`], [T`A`, T`a fixed invertible matrix (stretch, rotate)`]],
    367: [[T`\xi_\theta,\ \xi_\eta`, T`scores in new and old coordinates`], [T`A^\top`, T`transpose of $A$`]],
    368: [[T`\|A\|_{\mathrm{op}}`, T`operator norm: the most $A$ can stretch a vector`], [T`v_\theta,\ b_\theta`, T`constants in the new coordinates`]],
    369: [[T`\|A^{-1}\|_{\mathrm{op}}`, T`the most the inverse can stretch`], [T`L_\eta`, T`fingerprint magnifier in old coordinates`], [T`\mu_\eta`, T`moment map in old coordinates`]],
    370: [[T`\sigma_{\min}(A)`, T`smallest singular value of $A$: the most it can shrink a vector`], [T`\widehat\eta,\ \widehat\theta`, T`estimates in the two coordinates`]],
  },
},
};
