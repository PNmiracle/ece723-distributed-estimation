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

  { id: 'x-two-limits', para: 3,
    en: { title: 'Two pipes and a toll booth',
      body: T`Think of estimating $\theta$ as filling a tank through two pipes.<br><b>Data pipe.</b> At most $\min\{N,nm\}$ distinct observations exist, so the error cannot beat about $1/\min\{N,nm\}$.<br><b>Wire pipe.</b> At most $nk$ bits are sent in total, so the error cannot beat about $2^{-2nk/d}$.<br><br>The third effect is a toll booth: before any bit can <i>refine</i> the estimate, each coordinate must first be located to about single-machine accuracy, which costs roughly $\tfrac12\log_2m$ bits per coordinate. When local blocks are huge ($m$ exponential in $n$), this toll eats much of the budget, and what is left over, the surplus $s$, decides the refinement term.` },
    zh: { title: '两根水管加一个收费站',
      body: T`把估计 $\theta$ 想成用两根水管给水箱灌水。<br><b>数据水管。</b>不同的观测最多 $\min\{N,nm\}$ 条，所以误差最多做到约 $1/\min\{N,nm\}$。<br><b>通信水管。</b>总共最多发 $nk$ 比特，所以误差最多做到约 $2^{-2nk/d}$。<br><br>第三个效应是"收费站"：比特要想<b>精修</b>估计，先得把每个坐标定位到单机精度附近，每个坐标大约要交 $\tfrac12\log_2m$ 比特的"过路费"。本地数据块极大（$m$ 随 $n$ 指数增长）时，这笔过路费吃掉预算的一大块，剩下的余量（surplus）$s$ 决定精修项。` } },

  { id: 'x-refine-term', para: 91,
    en: { title: 'Reading the refinement term [m(1+s₊)]⁻¹',
      body: T`With no surplus ($s\le0$) this term is just single-machine accuracy $1/m$: the bits are used up locating the parameter. Each extra surplus bit per coordinate then buys roughly one more machine's worth of averaging, so the term behaves like $\frac1m\cdot\frac1{1+s}$.<br><br>Once $s$ is of order $n$, you would be "averaging over" more machines than the $n$ that exist, so the data term $(nm)^{-1}$ takes over. That is why this term never promises more than the available samples allow.` },
    zh: { title: '怎么读精修项 [m(1+s₊)]⁻¹',
      body: T`没有余量（$s\le0$）时，这一项就是单机精度 $1/m$：比特全花在定位上了。之后每个坐标每多一比特余量，大致相当于多"平均"了一台机器的估计，所以这一项像 $\frac1m\cdot\frac1{1+s}$。<br><br>当 $s$ 达到 $n$ 的量级，相当于要对比实际存在的 $n$ 台还多的机器取平均，这时数据项 $(nm)^{-1}$ 接管。所以这一项永远不会承诺超过样本本身能给的精度。` } },

  { id: 'x-theorem1', para: 92,
    en: { title: 'Theorem 1 at a glance',
      body: T`Theorem 1 sandwiches the best achievable risk: $c\mathcal L\le R\le C\mathcal U$. Each envelope is the <i>maximum</i> of a few terms, and each term is one bottleneck: pool size $1/N$, total accessible data $1/(nm)$, total bits $a_B=2^{-2B/d}$, and localization-refinement.<br><br>"Maximum" means the worst bottleneck sets the pace, like the slowest station on an assembly line. Where the lower and upper envelopes share the same largest term, the rate is pinned down up to constants; Table I lists those regimes. The only mismatch is the shared-observation count $\bar r$ inside the lower envelope's last term.` },
    zh: { title: '一眼看懂定理 1',
      body: T`定理 1 把最优风险夹在两层"包络"之间：$c\mathcal L\le R\le C\mathcal U$。每个包络都是几项取<b>最大值</b>，每一项是一个瓶颈：样本池大小 $1/N$、可访问数据总量 $1/(nm)$、总比特数 $a_B=2^{-2B/d}$、定位-精修项。<br><br>"取最大"意味着最慢的那个瓶颈决定速度，就像流水线上最慢的工位。上下包络的最大项相同时，速率就被确定到常数倍——表 I 列的就是这些情形。唯一的差别是下包络最后一项里的共享观测数 $\bar r$。` } },

  { id: 'x-window', para: 101,
    en: { title: 'What is still open, and why',
      body: T`The gap lives in the critical window: local blocks are large enough that localization matters, and overlap is intermediate. The lower bound charges shared observations additively through $\bar r$, the expected number of overlaps; the upper bound does not exploit overlap at all. When $\bar r$ is small compared with $m(1+s)$ the two agree; in between they can differ.<br><br>Closing it needs either an encoder that profits from overlaps or a converse showing that raw-data encoders cannot. The Gaussian local-mean case is settled, but general raw data can encode <i>which</i> shared items differ, information that sample means throw away.` },
    zh: { title: '还没解决的是什么，为什么难',
      body: T`缺口在临界窗口（critical window）：本地块大到定位开始起作用，同时重叠程度居中。下界通过 $\bar r$（期望重叠数）以加法方式为共享观测记账；上界则完全没有利用重叠。$\bar r$ 相对 $m(1+s)$ 很小时两者一致，处在中间时就可能不一致。<br><br>要补上缺口，要么找到能从重叠中获益的编码器，要么证明原始数据编码器做不到。高斯局部均值的情形已经解决；但一般的原始数据可以编码"<b>哪些</b>共享样本不同"，这种信息在只看样本均值时会被丢掉。` } },

  { id: 'x-exp-rate', para: 132,
    en: { title: 'Polynomial vs exponential growth in one picture',
      body: T`Corollary 2 measures every size on the scale of $n$.<br><b>Polynomial.</b> If $N\asymp n^\beta$ and $m\asymp n^\alpha$, the risk is a power of $n$: $R\asymp dn^{-\min\{\beta,\alpha+1\}}$. The data bottleneck $\min\{N,nm\}$ decides, because $nk$ bits are plenty for polynomially many samples.<br><b>Exponential.</b> If $m$ grows like $2^{\lambda n}$, the error decays like $2^{-n\min\{\lambda,2k/d\}}$: you are limited either by the local data ($1/m=2^{-\lambda n}$) or by the wire ($2^{-2nk/d}$), whichever is weaker.` },
    zh: { title: '一张图看懂多项式与指数增长',
      body: T`推论 2 把所有规模都放到 $n$ 的尺度上衡量。<br><b>多项式。</b>若 $N\asymp n^\beta$、$m\asymp n^\alpha$，风险是 $n$ 的幂：$R\asymp dn^{-\min\{\beta,\alpha+1\}}$。这时数据瓶颈 $\min\{N,nm\}$ 说了算，因为对多项式量级的样本来说 $nk$ 比特绰绰有余。<br><b>指数。</b>若 $m$ 像 $2^{\lambda n}$ 那样增长，误差按 $2^{-n\min\{\lambda,2k/d\}}$ 衰减：要么受本地数据限制（$1/m=2^{-\lambda n}$），要么受通信限制（$2^{-2nk/d}$），取较弱的那个。` } },

  { id: 'x-extremes', para: 330,
    en: { title: 'Two sanity checks',
      body: T`<b>No shared observations ($r=0$).</b> Nothing is revealed, $G$ is empty, and the bound reduces to the classical independent-block bound: overlap costs nothing because there is none.<br><b>No private observations ($q=0$).</b> Every file a processor holds is also held by someone else. Once $G$ is revealed, the transcript is a deterministic function of $(G,R)$ and adds nothing, so the only information left is that of the $r$ shared observations themselves.<br><br>A good bound should reproduce both extremes, and this one does.` },
    zh: { title: '两个"极端情形"自检',
      body: T`<b>没有共享观测（$r=0$）。</b>没有东西被公开，$G$ 是空的，界退化为经典的独立样本块界：没有重叠，自然没有重叠代价。<br><b>没有私有观测（$q=0$）。</b>每台处理器手里的卷宗别人也都有。公开 $G$ 之后，通信记录是 $(G,R)$ 的确定性函数，不再增加任何信息，剩下的信息只有那 $r$ 条共享观测本身。<br><br>好的界应该在两个极端都说得通，这个界做到了。` } },

  { id: 'x-coords-share', para: 475,
    en: { title: 'Why coordinates may reuse the same data',
      body: T`The target is a sum over coordinates: $\mathbb E\|\widehat p-p\|^2=\sum_j\mathbb E(\widehat p_j-p_j)^2$. The expectation of a sum is the sum of expectations, with or without independence. So it is enough for each coordinate's estimate to be good on its own; the errors of different coordinates may be correlated.<br><br>That is why one processor can serve several coordinates from the same resampled block, as long as, for each fixed coordinate, different processors' statistics are independent given the pool.` },
    zh: { title: '为什么不同坐标可以共用同一份数据',
      body: T`目标是各坐标误差之和：$\mathbb E\|\widehat p-p\|^2=\sum_j\mathbb E(\widehat p_j-p_j)^2$。和的期望等于期望的和，不需要独立性。所以只要每个坐标单独估得好就够了，不同坐标的误差可以相关。<br><br>这就是为什么一台处理器可以用同一个重抽样块同时服务好几个坐标——只要对每个固定坐标，不同处理器的统计量在给定样本池时相互独立。` } },

  { id: 'x-measurable', para: 567,
    en: { title: 'Why a "measurable selection"?',
      body: T`The decoder maps the estimated moments $\widehat p$ back to a parameter by choosing a point of $\Theta$ whose moments are closest. If $\mu(\Theta)$ is not convex there can be ties: several equally close points.<br><br>Any of them works for the error bound, but the estimator must still be a proper random variable, so the tie-breaking rule has to be measurable. The selection theorem guarantees such a rule exists. It is a technicality: a promise that "pick any nearest point" can be written down consistently.` },
    zh: { title: '为什么要"可测选择"？',
      body: T`解码器要把估计出的矩 $\widehat p$ 映回参数：在 $\Theta$ 里挑一个矩最接近的点。如果 $\mu(\Theta)$ 不是凸的，可能出现"并列"：好几个点一样近。<br><br>挑哪个都不影响误差界，但估计量必须是一个正规的随机变量，所以"并列时怎么挑"的规则必须可测。可测选择定理（measurable selection theorem）保证这样的规则存在。这只是技术细节：保证"任挑一个最近点"能被一致地写下来。` } },

  { id: 'x-minimal', para: 636,
    en: { title: 'Why the covariance of T must stay away from zero',
      body: T`For an exponential family the moment map is $\nabla A$, and its slope is the covariance: $\nabla^2A(\theta)=\operatorname{Cov}_\theta T(X)$. If some combination $u^\top T$ had (almost) zero variance, moving $\theta$ in direction $u$ would barely change the moments: a flat direction, the thermometer problem again.<br><br>A uniform lower bound $aI_d$ on the covariance makes every direction visible, which gives the inverse-Lipschitz constant. Minimality (no redundant statistic) plus compactness of the parameter box provides that bound.` },
    zh: { title: '为什么 T 的协方差不能接近零',
      body: T`指数族（exponential family）的矩映射是 $\nabla A$，它的"斜率"就是协方差：$\nabla^2A(\theta)=\operatorname{Cov}_\theta T(X)$。如果某个组合 $u^\top T$ 的方差（几乎）为零，$\theta$ 沿方向 $u$ 移动时矩几乎不变——这是一个"平坦方向"，又回到了温度计读不准的问题。<br><br>协方差有一致下界 $aI_d$，就保证每个方向都"看得见"，从而得到逆利普希茨常数。最小性（minimal，没有冗余统计量）加上参数区域的紧性，提供了这个下界。` } },
];
