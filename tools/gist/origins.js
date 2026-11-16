// Section II-B: distinguish definitions, assumptions, constructions, and derivations.
const T = String.raw;
module.exports = {
  14: {
    zh: T`这是两个定义。先对对数密度求梯度，得到一个样本给出的 score；再把这个向量和它的转置相乘并取平均，定义 Fisher 信息矩阵。`,
    en: T`These are two definitions. Differentiate the log density to get the score of one draw. Average the outer product of that score with itself to define the Fisher information matrix.`,
  },
  15: {
    zh: T`有限二阶矩是正则性要求。均值为零来自 (16)：把 score 乘回密度，就得到密度的导数；这些导数积分为零。`,
    en: T`The finite second moment is a regularity requirement. The zero mean comes from (16): multiplying the score by the density gives the derivative of the density, whose integral is zero.`,
  },
  16: {
    zh: T`先用概率密度的积分恒等于 1，所以对参数求导得 0。在本文的正则条件下，把求导移进积分，就得到另一边。`,
    en: T`The density integrates to 1 for every parameter value, so differentiating that integral gives zero. The paper’s regularity conditions let us move the derivative inside the integral.`,
  },
  17: {
    zh: T`用全概率公式：先固定一组原始样本，算它产生这条消息的概率，再按样本的联合密度加权积分。样本独立，所以联合密度是各自密度的乘积。`,
    en: T`Use the law of total probability: fix a raw dataset, take its chance of producing the message, and integrate against the dataset’s joint density. Independence makes that density a product.`,
  },
  18: {
    zh: T`对 (17) 求导：消息规则与参数无关，只有样本密度的乘积要用乘积法则。再除以消息的概率（密度），积分里的权重就变成给定消息后的样本条件分布。`,
    en: T`Differentiate (17). The message rule is fixed, so the product rule only acts on the sample densities. Divide by the message probability (or density), and the weights in the integral become the conditional distribution of the data given the message.`,
  },
  19: {
    zh: T`这是论文加在模型上的尾部假设。作者用一个二次项刻画原点附近的大小，再用分母里的参数 $b$ 容许更重的尾部。`,
    en: T`This is a tail assumption on the model. The quadratic term sets the scale near zero, and the denominator with $b$ allows heavier tails.`,
  },
  20: {
    zh: T`在 (19) 中写 $u=ta$，其中 $a$ 是单位向量。于是内积变成 $t$ 乘以沿 $a$ 的 score 投影，且 $\\|u\\|=|t|$。`,
    en: T`Substitute $u=ta$ into (19), with $a$ a unit vector. The inner product becomes $t$ times the projected score along $a$, and $\\|u\\|=|t|$.`,
  },
  21: {
    zh: T`在 $t=0$ 附近比较 (20) 两边的二次项：常数项和一次项都是零，左边的二阶导是投影的方差，右边的二阶导是 $v$。`,
    en: T`Compare the quadratic terms on both sides of (20) near $t=0$. The constant and linear terms vanish; the second derivative on the left is the projected variance, and the one on the right is $v$.`,
  },
  22: {
    zh: T`把 (21) 对所有单位方向的限制写成矩阵不等式；再分别代入 $d$ 个坐标轴方向并相加，得到迹的上界。`,
    en: T`Write the bound in (21) for every unit direction as a matrix inequality. Apply it to the $d$ coordinate axes and add the results to bound the trace.`,
  },
  23: {
    zh: T`独立样本的 score 相加后，和的指数期望可以拆成各自的指数期望之积。取对数把乘法变成加法，再把 (19) 的上界加 $q$ 次。`,
    en: T`For independent samples, the exponential expectation of the sum factors into a product of individual expectations. Take logs to turn the product into a sum, then add $q$ copies of the bound in (19).`,
  },
  24: {
    zh: T`第一行定义总体特征均值：先对观测应用 $\\psi$，再取期望。第二行是额外的模型假设，要求从均值反推参数时，小误差不会被无限放大。`,
    en: T`The first line defines the population feature mean by applying $\\psi$ to an observation and taking its expectation. The second line is a model assumption that limits how much errors can grow when we recover the parameter from that mean.`,
  },
  25: {
    zh: T`把 (24) 里的总体期望换成经验平均：对池里的每个样本算同一个 $\\psi$，把结果加起来再除以 $N$。`,
    en: T`Replace the population expectation in (24) with an empirical average: apply the same $\\psi$ to each observation in the pool, add the results, and divide by $N$.`,
  },
  26: {
    zh: T`(25) 无偏，所以平方误差的期望是各坐标方差之和。样本独立让每个坐标的方差除以 $N$；每个特征值都在 $[0,1]$ 内，单个的方差最多为 $1/4$。`,
    en: T`The average in (25) is unbiased, so its expected squared error is the sum of the coordinate variances. Independence across draws divides each variance by $N$, and a feature in $[0,1]$ has variance at most $1/4$.`,
  },
  27: {
    zh: T`这是一个随机编码规则：在 $[0,1]$ 上均匀抽一个数，落在阈值 $\\psi_j(X)$ 以下就记 1。给定 $X$，这一步记 1 的概率就是该阈值；再对 $X$ 取平均。`,
    en: T`Construct the bit by drawing a uniform number on $[0,1]$ and recording 1 if it falls below $\\psi_j(X)$. Given $X$, the chance of a 1 equals that threshold. Average over $X$ to get the unconditional mean.`,
  },
  28: {
    zh: T`这是解码规则的定义：对每个候选参数算它的理论矩，比较它与估计矩的距离，再选距离最小的那个参数。`,
    en: T`This defines the decoder: compute each candidate parameter’s theoretical moment, compare its distance to the estimated moment, and choose the parameter with the smallest distance.`,
  },
  29: {
    zh: T`先用 (24) 把参数误差转成矩的距离，再用三角不等式，经由估计矩把距离拆成两段。(28) 保证拟合那一段不比真实矩那一段长，所以出现因子 2。`,
    en: T`Use (24) to bound parameter error by a distance between moments. Split that distance at the estimated moment using the triangle inequality. Rule (28) makes the fitted leg no longer than the true leg, which gives the factor of 2.`,
  },
};
