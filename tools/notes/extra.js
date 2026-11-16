// Extra click-to-open notes with intuitive explanations for the hardest paragraphs.
// para = index of the paragraph (<div class="para">) in <main>; the two pages are aligned 1:1.
// Text uses $...$ for inline math; tools/notes/inject.js renders it with KaTeX.
const T = String.raw;
module.exports = [
  { id: 'x-reveal-seeds', para: 33,
    en: { title: 'Why may we hand the fusion center extra information?',
      body: T`A lower bound says that <i>no</i> procedure can beat a certain error. If we also give the fusion center the private seeds, it can only do better: it is free to ignore anything it does not need. So if even this better-informed center cannot beat the bound, the real center, which sees less, cannot either.<br><br>Exam analogy: if a student with an open book still cannot score above 60, a closed-book student cannot either. The same trick returns later, when the shared observations $G$ are revealed inside the Fisher-information comparison.` },
    zh: { title: '为什么可以白送给融合中心额外信息？',
      body: T`下界说的是：<b>任何</b>方法的误差都低不过某个值。把私有随机种子（private seeds）也交给融合中心（fusion center），它只会做得更好——用不上的信息直接忽略即可。所以只要连这个"更有本事"的融合中心都突破不了下界，真实的、看到更少信息的融合中心就更突破不了。<br><br>好比考试：开卷的学生都考不过 60 分，闭卷的更考不过。后面在费舍尔信息（Fisher information）比较里把共享观测 $G$ 也"公开"，用的是同一个思路。` } },

  { id: 'x-transcript-score', para: 48,
    en: { title: 'The score of a message is an average of data scores',
      body: T`The transcript $T$ is a blurred picture of the data $Z$. The identity above says $\nabla_\theta\log p_\theta(t)=\mathbb E_\theta[\,S_Z\mid T=t\,]$: the score of the message equals the average score of all data sets that would have produced that message.<br><br>Picture a crowd: each data point pushes the estimate in some direction (its score). The message only reports the <i>average</i> push of everyone who could have sent it, so individual detail is lost. Averaging never increases spread, which is why a message never carries more Fisher information than the data behind it.` },
    zh: { title: '消息的得分 = 数据得分的平均',
      body: T`通信记录（transcript）$T$ 是数据 $Z$ 的一张"模糊照片"。上面的恒等式说 $\nabla_\theta\log p_\theta(t)=\mathbb E_\theta[\,S_Z\mid T=t\,]$：消息的得分（score）等于所有"会发出这条消息"的数据的得分的平均。<br><br>想象一群人：每个数据点都把估计往某个方向推（这就是它的得分）。消息只报告所有可能发出它的人的<b>平均</b>推力，个体细节就丢了。取平均不会让波动变大，所以消息里的费舍尔信息（Fisher information）永远不超过它背后的数据。` } },

  { id: 'x-rare-events', para: 235,
    en: { title: 'How far can a rare message move the score?',
      body: T`Condition on an event of probability $p$ (say, one transcript value). The rarer the event, the more "surprising" it is, and the further it can push the conditional mean of the block score away from $0$.<br><br>For a sub-Gaussian score the push is at most of order $\sqrt{\ln(1/p)}$, so its square grows like $\ln(1/p)$, which is exactly the self-information of the event. Averaging over transcript values turns $\ln(1/p)$ into entropy. That is why transcript entropy, and hence the number of bits, controls Fisher information.<br><br>A Bernstein (sub-exponential) score has heavier tails: the push can also grow like $\ln(1/p)$ itself, so the square picks up a $(\ln(1/p))^2$ term. This is the origin of the extra $b^2(B+1)^2$ correction.` },
    zh: { title: '一条罕见消息能把得分推多远？',
      body: T`对一个概率为 $p$ 的事件（比如某个通信记录取值）取条件。事件越罕见、越"出人意料"，它就能把样本块得分（block score）的条件均值从 $0$ 推得越远。<br><br>得分是次高斯（sub-Gaussian）时，推力最多是 $\sqrt{\ln(1/p)}$ 量级，平方后约为 $\ln(1/p)$——正好是这个事件的自信息（self-information）。对所有记录取值平均，$\ln(1/p)$ 就变成了熵（entropy）。所以记录的熵（也就是比特数）管住了费舍尔信息。<br><br>伯恩斯坦（Bernstein，次指数）得分的尾巴更重：推力还可以像 $\ln(1/p)$ 本身那样增长，平方后多出 $(\ln(1/p))^2$ 一项——这就是额外修正项 $b^2(B+1)^2$ 的来历。` } },

  { id: 'x-identifiability', para: 64,
    en: { title: 'Why the moment map must not be too flat',
      body: T`The construction estimates the moments $\mu(\theta)$ and then inverts. If $\mu$ were one-to-one but nearly flat somewhere, two very different values of $\theta$ would have almost the same moments, and a tiny moment error would become a huge parameter error.<br><br>The inverse-Lipschitz condition rules this out: moving $\theta$ by $\delta$ moves $\mu(\theta)$ by at least $\delta/L$. So a moment error $\varepsilon$ costs at most $L\varepsilon$ in $\theta$, uniformly over the parameter region.<br><br>Thermometer analogy: a tube whose mercury barely moves with temperature is technically one-to-one, but useless for accurate readings.` },
    zh: { title: '为什么矩映射不能"太平"？',
      body: T`构造的思路是先估计矩 $\mu(\theta)$，再反解出 $\theta$。如果 $\mu$ 虽然一一对应、却在某处几乎是平的，那么两个相差很大的 $\theta$ 会有几乎相同的矩，矩上的一点点误差就会变成参数上的巨大误差。<br><br>逆利普希茨（inverse-Lipschitz）条件排除了这种情况：$\theta$ 移动 $\delta$，$\mu(\theta)$ 至少移动 $\delta/L$。于是矩误差 $\varepsilon$ 在 $\theta$ 上最多变成 $L\varepsilon$，而且在整个参数区域上一致成立。<br><br>好比温度计：如果水银柱几乎不随温度动，它在数学上仍是一一对应的，但根本读不准。` } },

  { id: 'x-d-moments', para: 74,
    en: { title: 'Why exactly d moments?',
      body: T`The bits are split across moment coordinates, and each coordinate's error shrinks like $2^{-2(\text{its bits})}$. With $d$ coordinates each gets about $B/d$ bits, which gives the floor $2^{-2B/d}$.<br><br>With $r>d$ moments, each would get only $B/r$ bits and the error would behave like $2^{-2B/r}$, a worse exponent, even though the parameter has only $d$ degrees of freedom. Spending bits on $r$ redundant numbers wastes budget on information that could have been computed from the others.` },
    zh: { title: '为什么恰好用 d 个矩？',
      body: T`比特预算是按矩的坐标分配的，每个坐标的误差大约按 $2^{-2(\text{分到的比特数})}$ 缩小。$d$ 个坐标各分到约 $B/d$ 比特，于是得到底线 $2^{-2B/d}$。<br><br>如果用 $r>d$ 个矩，每个只能分到 $B/r$ 比特，误差就变成 $2^{-2B/r}$——指数更差，尽管参数本身只有 $d$ 个自由度。把比特花在 $r$ 个冗余数字上，等于在"本可以由其他数算出来"的信息上浪费预算。` } },

  { id: 'x-entropy-budget', para: 209,
    en: { title: 'The transcript is a suitcase with two compartments',
      body: T`At most $B$ bits means the transcript's entropy is at most $B\ln2$ nats. That capacity is shared:<br>(i) information about the parameter, $I(\Theta;T\mid W)$, which small risk forces to be large (roughly $\tfrac d2\ln(1/\text{risk})$);<br>(ii) the conditional entropy $H(T\mid\Theta,W)$, the variability left in the message once the parameter is fixed.<br><br>Since $H(T\mid W)=I(\Theta;T\mid W)+H(T\mid\Theta,W)\le B\ln2$, the more you must say about <i>where</i> $\Theta$ is, the less room remains in the second compartment. The Fisher-information bounds are stated in terms of that second compartment, and this is how the localization cost enters the lower bound.` },
    zh: { title: '通信记录是一个分两格的行李箱',
      body: T`最多 $B$ 比特，意味着记录的熵最多是 $B\ln2$ 奈特（nat）。这点容量要分给两样东西：<br>（i）关于参数的信息 $I(\Theta;T\mid W)$——风险要小，它就必须大（约 $\tfrac d2\ln(1/\text{风险})$）；<br>（ii）条件熵 $H(T\mid\Theta,W)$——参数固定之后，消息里还剩下的随机性。<br><br>因为 $H(T\mid W)=I(\Theta;T\mid W)+H(T\mid\Theta,W)\le B\ln2$，需要说清"$\Theta$ 大概在哪"的部分越多，第二格就越小。后面的费舍尔信息界是用第二格写的，定位代价（localization cost）就是这样进入下界的。` } },

  { id: 'x-rectangle', para: 266,
    en: { title: 'Why a transcript event factorizes',
      body: T`Fix the seeds, so the protocol is deterministic. The complete transcript $t$ occurs exactly when every processor's data agree with the bits that processor was supposed to send at its turns, and each such condition involves only that processor's own block.<br><br>So $\{T=t\}=\{Z_1\in A_1\}\cap\cdots\cap\{Z_n\in A_n\}$ is a "rectangle". With independent blocks its probability is a product $\prod_i\mathbb P(Z_i\in A_i)$, and entropy and Fisher information split into per-processor pieces.<br><br>Relay-quiz analogy: the final answer sheet appears if and only if each runner answers their own questions the same way; no runner needs to see anyone else's data.` },
    zh: { title: '为什么一条通信记录的事件能"拆开相乘"？',
      body: T`固定随机种子后，协议是确定性的。完整记录 $t$ 出现，当且仅当每台处理器的数据都和"它在自己发言时应发的比特"一致，而每个这样的条件只涉及该处理器自己的样本块。<br><br>所以 $\{T=t\}=\{Z_1\in A_1\}\cap\cdots\cap\{Z_n\in A_n\}$ 是一个"矩形"（rectangle）。样本块相互独立，于是概率是乘积 $\prod_i\mathbb P(Z_i\in A_i)$，熵和费舍尔信息也就能按处理器拆开。<br><br>好比接力答题：最后那张答卷出现，当且仅当每个选手都按同样方式回答了自己的题；谁都不需要看别人的数据。` } },

  { id: 'x-reveal-shared', para: 295,
    en: { title: 'Photocopied files: reveal the shared ones',
      body: T`Processors are dependent only because some pool files are photocopied into several hands. The proof gives those shared files $G$ to the fusion center for free; this can only help it, so a lower bound stays valid.<br><br>Once $G$ is known, what remains at each processor is its private files, which nobody else holds: independent blocks again, so the independent-block machinery applies. The shared files are paid for separately, by their own Fisher information, which is at most proportional to the number $r$ of distinct shared files. That separate payment is the additive penalty.` },
    zh: { title: '复印件问题：把共享的卷宗公开',
      body: T`处理器之间之所以相关，只是因为有些卷宗被"复印"给了好几个人。证明里把这些共享观测 $G$ 免费交给融合中心——这只会帮它，所以下界依然成立。<br><br>知道 $G$ 之后，每台处理器手里剩下的是别人都没有的私有卷宗：又回到了相互独立的样本块，独立样本块的那套工具就能用了。共享卷宗单独结账：它们自带的费舍尔信息，最多与不同共享观测的个数 $r$ 成正比。这笔单独的账，就是"加法"惩罚（additive penalty）。` } },

  { id: 'x-g-not-free', para: 334,
    en: { title: 'Revealing G: allowed in one ledger, not in the other',
      body: T`The proof keeps two ledgers.<br><b>Fisher-information ledger.</b> Revealing $G$ is fine here: it only increases information, so an upper bound on information remains an upper bound.<br><b>Entropy (bit) ledger.</b> Side information here must not depend on $\Theta$. The design $\mathcal S$ and seeds $R$ are parameter-free, so conditioning on them is harmless. But $G$ consists of real observations from $P_\theta$ and carries information about $\Theta$.<br><br>Treating $G$ as free side information would let the bound pretend that this parameter information came from nowhere, effectively counting it twice. Keeping $G$ out of the entropy ledger is what yields the refined additive bound.` },
    zh: { title: '公开 G：一本账里可以，另一本账里不行',
      body: T`证明里记着两本账。<br><b>费舍尔信息账。</b>这里公开 $G$ 没问题：它只会让信息变多，信息的上界仍然是上界。<br><b>熵（比特）账。</b>这里的边信息（side information）必须与 $\Theta$ 无关。抽样设计 $\mathcal S$ 和种子 $R$ 都与参数无关，以它们为条件无妨；但 $G$ 是来自 $P_\theta$ 的真实观测，本身就带着关于 $\Theta$ 的信息。<br><br>如果把 $G$ 当成免费的边信息，就等于假装这部分参数信息凭空而来，相当于重复计算。把 $G$ 挡在熵账之外，才得到精细的加法型下界。` } },

  { id: 'x-design-avg', para: 409,
    en: { title: 'Independent only after averaging over who saw what',
      body: T`Fix the pool. If you also fix which processor holds which files ($\mathcal S$), two processors that share a file produce dependent resampled draws: both may pick that file.<br><br>But the access sets are random, and the resampling rule is built so that, averaged over the random access set, each processor's draws look like fresh uniform draws from the whole pool, independently across processors. The guarantee is about this averaged law, which is exactly what the random-design risk (12) measures.<br><br>Coin analogy: the coin you pull from your pocket depends on what is in your pocket, but if pockets are filled at random, it is just a random coin from the mint.` },
    zh: { title: '只有对"谁看到了什么"取平均后才独立',
      body: T`固定整个样本池。如果再固定"哪台处理器拿到哪些卷宗"（$\mathcal S$），那么共享同一份卷宗的两台处理器，重抽样（resampling）结果是相关的：两人都可能抽到它。<br><br>但访问集合本身是随机的，而重抽样规则的设计保证了：对随机访问集合取平均后，每台处理器的抽样就像从整个池子里重新均匀抽取，且不同处理器之间相互独立。这个保证说的是平均后的分布，正好对应随机设计风险（random-design risk）(12)。<br><br>好比硬币：你从口袋里掏出的硬币取决于口袋里装了什么；但如果口袋是随机装的，掏出来的就只是造币厂里随机的一枚硬币。` } },

  { id: 'x-smoothing', para: 437,
    en: { title: 'Why add Gaussian noise on purpose?',
      body: T`The off-the-shelf scalar encoder expects Gaussian-like statistics with a known scale. The raw average $\bar U$ of $q$ coins has variance $p(1-p)/q$, which depends on the unknown $p$ and is tiny near $0$ or $1$.<br><br>Adding independent Gaussian noise with variance about $(1-\hat v)/q$, where $\hat v$ estimates $p(1-p)$ from a separate group of coins, tops every statistic up to the same total variance, about $1/q$.<br><br>Shim analogy: to level a wobbly table you slide a shim under each leg, sized by a gap you measured separately; afterwards every leg has the same height. Measuring the gap on separate data keeps the shim independent of what it compensates.` },
    zh: { title: '为什么要故意加高斯噪声？',
      body: T`现成的标量编码器要求统计量近似高斯、且尺度已知。$q$ 枚硬币的原始平均 $\bar U$ 方差是 $p(1-p)/q$，取决于未知的 $p$，在 $p$ 接近 $0$ 或 $1$ 时非常小。<br><br>加上方差约为 $(1-\hat v)/q$ 的独立高斯噪声（其中 $\hat v$ 用另一组硬币估计 $p(1-p)$），就把每个统计量的总方差都"补齐"到约 $1/q$。<br><br>好比垫桌脚：桌子不稳，就按单独量好的缝隙大小给每条腿塞垫片，之后每条腿一样高。用另一组数据量缝隙，保证垫片和它要补偿的东西相互独立。` } },

  { id: 'x-clock', para: 492,
    en: { title: 'Clock hands: coarse frequencies localize, fine ones refine',
      body: T`A one-bit measurement of the characteristic function at frequency $t$ reports a phase, a point on a circle. A high frequency is a fast-turning hand: very sensitive to small changes in $p$, but it wraps around many times, so one reading is ambiguous. A low frequency is the hour hand: unambiguous but coarse.<br><br>The decoder reads the hour hand first, then progressively faster hands, each time already knowing which turn it is on. Finally, fresh processors read the fastest hand for refinement. This is how one bit per processor can still reach exponentially small error.` },
    zh: { title: '时钟指针：低频定位，高频精修',
      body: T`在频率 $t$ 上对特征函数（characteristic function）做一比特测量，得到的是一个相位，也就是圆上的一个点。高频像转得飞快的指针：对 $p$ 的微小变化非常敏感，但会绕好多圈，单看一次读数分不清是第几圈。低频像时针：不会混淆，但很粗。<br><br>解码器先读时针，再读越来越快的指针，每次都已经知道快指针在第几圈；最后用新的一批处理器读最快的那根针做精修。这就是每台处理器只发一比特、误差仍能指数级变小的原因。` } },

  { id: 'x-cov-tails', para: 749,
    en: { title: 'Why a covariance score is not sub-Gaussian',
      body: T`For Gaussian covariance estimation the score is a quadratic form in $X$, a combination of squared Gaussians like $\chi^2$ variables. For $Z\sim N(0,1)$, $\mathbb E e^{tZ^2}=(1-2t)^{-1/2}$ blows up at $t=1/2$: squared Gaussians have exponential, not Gaussian, tails.<br><br>A sub-Gaussian bound needs $\mathbb E e^{tA}<\infty$ for every real $t$, which fails here. The moment-generating function is still finite near $0$, which is exactly the Bernstein (sub-exponential) condition with $b>0$. That is why this example uses the $b>0$ branch of the converse.` },
    zh: { title: '为什么协方差的得分不是次高斯？',
      body: T`估计高斯协方差时，得分是 $X$ 的二次型，即若干高斯变量平方的组合，类似 $\chi^2$ 变量。对 $Z\sim N(0,1)$ 有 $\mathbb E e^{tZ^2}=(1-2t)^{-1/2}$，在 $t=1/2$ 处爆掉：高斯的平方是指数尾，不是高斯尾。<br><br>次高斯（sub-Gaussian）要求对所有实数 $t$ 都有 $\mathbb E e^{tA}<\infty$，这里做不到。但矩母函数（moment-generating function）在 $0$ 附近仍然有限，这正是 $b>0$ 的伯恩斯坦（Bernstein，次指数）条件。所以这个例子走的是下界证明中 $b>0$ 的那条分支。` } },
];
