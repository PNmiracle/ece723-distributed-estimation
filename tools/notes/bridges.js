// Short examples attached to the paragraph immediately before the numbered equation.
const T = String.raw;
module.exports = {
  3: {
    zh: ['借了几次，和借了几本', '两台机器分别拿到编号 1、2 和 2、3。清单上有四次访问，但只有三条不同的数据；编号 2 不会因为被抄了一遍就变成新样本。'],
    en: ['Four checkouts, three books', 'Two machines hold IDs 1 and 2, and IDs 2 and 3. That is four accesses but only three distinct draws. Copying ID 2 does not create a new observation.'],
  },
  7: {
    zh: ['谁举手，会不会泄题？', '如果规定「谁看到异常谁先举手」，举手这件事已经传了一条消息。黑板协议要求大家只看公开记录就能知道谁先发言。'],
    en: ['Can raising a hand leak the answer?', 'If whoever sees an anomaly speaks first, their turn itself sends a message. The blackboard schedule has to be predictable from public information.'],
  },
  12: {
    zh: ['给每个方案出最难的一题', '像比较两把雨伞：先测每把伞碰到最难应付的天气时有多漏，再挑最坏表现较好的那把。这里的「天气」是未知参数。'],
    en: ['Give every scheme its toughest test', 'Think of comparing umbrellas: test each in the weather it handles worst, then choose the one with the better worst performance. Here the unknown parameter plays the role of the weather.'],
  },
  19: {
    zh: ['放大镜为什么有上限？', T`指数像放大镜：少数特别大的得分，会被放大得比普通波动快得多。$b=0$ 时这条二次上界适用于任意放大倍数；$b>0$ 时，论文只要求它在一定范围内成立。`],
    en: ['Why limit the magnification?', T`Exponential weighting is a magnifier: rare, large scores grow much faster than ordinary fluctuations. With $b=0$ the quadratic bound holds at every tilt; with $b>0$ the paper requires it only over a limited range.`],
  },
  21: {
    zh: ['只在原点摸一摸曲线', T`如果投影得分等概率取 $-2$ 和 $2$，均值是 0，方差是 4；它的 log-MGF 在 0 处的曲率也恰好是 4。不用看远处的尾巴，就能从曲线刚开始弯的程度读出方差。`],
    en: ['A tiny bend tells you the variance', T`If the projected score is equally likely to be $-2$ or $2$, its mean is 0 and its variance is 4. The log-MGF has curvature exactly 4 at zero; you can read the variance from this local bend.`],
  },
  27: {
    zh: ['小数变硬币', '服务器收不到 0.7 这个小数，只能收 0 或 1。让拥有 0.7 的机器用七成概率报 1，收集许多这样的回答，平均值就能估这一类小数的均值。'],
    en: ['Make a coin out of a decimal', 'Instead of sending 0.7, a machine can send 1 seven times out of ten in expectation. Averaging many such reports estimates the mean of the underlying decimals.'],
  },
  35: {
    zh: ['数共享数据，不用给所有编号做联合排查', '逐个给编号贴标签：「至少两人拿到」就记 1。即使不同编号的标签互相关联，「贴了多少张」的期望仍等于每张标签贴上去的概率之和。'],
    en: ['Count shared items one ID at a time', 'Give an ID a sticker if at least two machines hold it. Even when the stickers are dependent, the expected sticker count is the sum of their individual probabilities.'],
  },
  62: {
    zh: ['大家拿的是同一张数独答案', '完全重叠时，每台机器都算得出同一个平均值。它们可以约好各抄几位、拼成一份更精细的报告，不需要先彼此交换数据。'],
    en: ['Everyone has the same answer sheet', 'With full overlap, every machine computes the same average. They can agree to send different parts of its encoding, producing a finer report without talking to each other.'],
  },
  78: {
    zh: ['先抵消，还是先平方？', '如果同一条消息背后有两个等可能的得分 −1 和 3，先平均再平方得到 1，先平方再平均却得到 5。这就是合并消息可能丢掉的信号。'],
    en: ['Cancel first, or square first?', 'If a message can come equally often from scores −1 and 3, averaging first gives a square of 1; squaring first gives an average of 5. That is signal the grouping can hide.'],
  },
  98: {
    zh: ['固定观测，再移动真值', '把观测固定，就像把估计值的图钉按在纸上。真值向右挪一格，「估计减真值」就少一格；先验在边界压到零，让分部积分不留下端点项。'],
    en: ['Pin the estimate and move the truth', 'With the observation fixed, the estimate is pinned down. Move the true value one step right and estimate minus truth drops by one; the prior vanishes at the boundaries so no endpoint term remains.'],
  },
  114: {
    zh: ['多一位，理想网格细一半', '一维里，多一位可以把同样大小的区间切成两倍多的格子，格宽减半，因此平方尺度变成四分之一。这是比特项指数的直觉。'],
    en: ['One more bit halves the ideal grid spacing', 'In one dimension, an extra bit can double the number of bins across the same interval. Half the width means a quarter of the squared scale, which gives intuition for the bit exponent.'],
  },
  155: {
    zh: ['每人只检查自己的答题卡', '记录已经固定：它告诉每台机器该核对哪些答案。只要原本的私有数据独立，甲的答题卡通过了，也不会改变乙在通过自己检查后的分布。'],
    en: ['Check only your own answer sheet', 'A fixed transcript tells each machine which answers to check. With independent inputs, learning that one machine passed does not change another machine’s law after its own checks.'],
  },
  183: {
    zh: ['锁定剧本，再重放黑板', '把共享数据和随机数都锁定，剩下只需换不同的私有数据重放。凡是能重现目标记录的输入，其概率加起来就是公式左边。'],
    en: ['Lock the script, then replay the board', 'Lock in the shared data and seeds, then replay with different private inputs. The probability on the left adds all inputs that reproduce the target transcript.'],
  },
  200: {
    zh: ['先统一尺子再比较', '如果通常一台机器的总平方误差尺度是 $d/m$，那么 $x=0.1$ 就表示当前误差只有这个参考尺度的十分之一。这里比的是误差，不是样本数。'],
    en: ['Compare on the same ruler', 'If $d/m$ is the reference squared-error scale for one machine, then $x=0.1$ means one tenth of that scale. The ratio compares errors, not sample counts.'],
  },
  237: {
    zh: ['开过的抽屉，和没开过的抽屉', '想像从 10 个编号里藏了 4 个，重抽过程已露出其中 2 个。给定这段历史，剩下两个位置可以是其他 8 个编号里的任意一对，仍等可能。'],
    en: ['Two open drawers, two still hidden', 'Imagine a list of four out of ten IDs, of which two have appeared. Given the resampling history, the last two slots are still equally likely to be any pair among the eight unseen IDs.'],
  },
  261: {
    zh: ['加噪声为什么有用？', '像把不同录音的背景音调到相近音量，好用同一个解码办法。这里噪声会损失一些精度，但让离散的正面比例更像编码器熟悉的高斯输入。'],
    en: ['Why add noise on purpose?', 'Think of bringing recordings to a common background level so one decoder can handle them. Noise costs some precision, but it makes the discrete head fraction behave more like the encoder’s Gaussian input.'],
  },
  274: {
    zh: ['一次只换一块积木', '两座积木塔用的零件不同。一次只替换一件，换前换后保持其他部分不变，就能量出这一件造成的差；最后再把差累加。'],
    en: ['Swap one block at a time', 'To compare two towers of different blocks, swap one block while holding all the others fixed. Measure that change, then add the changes across the swaps.'],
  },
  309: {
    zh: ['先看时针，再看分针', '只看分针的「15 分」，不知道是几点十五。慢针先排除大部分可能，快针才有办法在剩下的小范围里分出细节。'],
    en: ['Hour hand first, minute hand second', 'A minute hand at 15 does not tell you which hour it is. Read the slower hand to narrow the possibilities before using the faster one for detail.'],
  },
  334: {
    zh: ['快针的另一圈不用再找了', '前几轮已经把范围缩窄。最后一轮即使在别处看见相似的表针位置，也只从这段小区间里挑最吻合的概率。'],
    en: ['Do not search the next revolution', 'Earlier rounds narrowed the range. Even if the fast hand gives a similar reading elsewhere, the final decoder only searches within that narrow interval.'],
  },
  348: {
    zh: ['概率不可能报成负数', '如果真概率是 0.2，估成 −0.1 的误差是 0.3；改报 0，误差变成 0.2。只要真值在 0 到 1 之间，越界值拉回端点都有同样的效果。'],
    en: ['A probability cannot be negative', 'If the true probability is 0.2, reporting −0.1 misses by 0.3; reporting 0 misses by 0.2. Moving an out-of-range estimate to the endpoint works this way for any true value in the interval.'],
  },
  375: {
    zh: ['不问温度，只问过不过零', '如果温度的分布整体向右移，零度以上的日子会更多。就算每一天只报「过零了没有」，长期的比例也能反推平均温度。'],
    en: ['Ask whether it crossed zero', 'If temperatures shift upward, more days land above zero. Even if each day reports only yes or no, the long-run proportion can recover the mean in this Gaussian model.'],
  },
  388: {
    zh: ['最后一面用的是剩余预算', '给骰子第 1 面加一点概率时，最后一面就得让出同样多。若恰好掷出最后一面，提高任何一个前面的概率都会让这个结果更不可能。'],
    en: ['The last face gets the leftover budget', 'Adding probability to face 1 takes the same amount from the last face. If the last face appears, increasing any of the other probabilities makes that observation less likely.'],
  },
  415: {
    zh: ['预测八成，结果却是 0', '模型若给标签 1 分配 0.8 的概率，却看到 0，括号里的残差是 −0.8。这个负数把更新方向转向降低这条样本的预测概率。'],
    en: ['Predict 80%, see a zero', 'If the model predicts 0.8 for label 1 but observes 0, the residual is −0.8. The score points toward lowering the predicted probability for that example.'],
  },
  435: {
    zh: ['关门时数空场', '不逐个数进店的人，只记一天是不是一个人也没来。到访率更高时，空场的日子变少，这个问题仍能区分到访率。'],
    en: ['Count empty days', 'Instead of reporting every visitor count, record whether the shop had zero visitors that day. Higher arrival rates make empty days less common, so the yes/no answer still identifies the rate.'],
  },
  446: {
    zh: ['只问电梯有没有在一分钟内到', '不记具体等了几秒，只记是否赶在截止时间前到。电梯到达越快，回答「有」的频率越高；在指数模型下，这个频率能反推事件率。'],
    en: ['Did the elevator arrive within a minute?', 'Report only whether the wait ended before the deadline. In the exponential model, a higher arrival rate means more yes answers, and their frequency reveals the rate.'],
  },
  466: {
    zh: ['把斜着的椭圆转正', '在白化坐标里换到矩阵自己的主轴，就像把斜放的椭圆转正。原先互相混着的二次项消失，剩下互相独立的「每轴平方减均值」。'],
    en: ['Turn the tilted ellipse upright', 'In whitened coordinates, rotate to the matrix’s own axes. The mixed terms disappear, leaving independent centered squares, one for each axis.'],
  },
  483: {
    zh: ['合唱比两段独唱多出什么？', '如果两条信号常朝同一方向摆动，它们和的方差会比各自方差相加更大。差出来的部分恰好是两倍协方差，也可能为负。'],
    en: ['What does the duet add?', 'If two signals tend to move together, their sum fluctuates more than the two individual variances add up to. The difference is twice the covariance and can be negative if they move in opposite directions.'],
  },
  492: {
    zh: ['每万次只撞一次，仍然撞了', '一万次访问中只有一次重复，比例已经很小，但两台机器仍拿到了同一条观测。所以不能把「比例很小」换成「机器互相独立」。'],
    en: ['One collision in ten thousand is still a collision', 'One repeat in ten thousand accesses is a tiny fraction, but two machines still share a draw. A small fraction alone does not make their blocks independent.'],
  },
};
