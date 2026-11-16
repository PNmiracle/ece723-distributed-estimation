# -*- coding: utf-8 -*-
"""Recommended videos for the learning path and the reading pages.

Edit this file, then run:  python3 tools/videos/inject.py
Every link below was checked when it was added (Nov 2026). Durations are the
lengths shown on the hosting page; "≈" marks an estimate.
"""

YT = 'https://www.youtube.com/watch?v='
BILI_HDP = 'https://www.bilibili.com/video/BV1gZ4y1W7ED'   # 滕佳烨《高维概率》合集（此链接是第 2 集）
BILI_IT = 'https://www.bilibili.com/video/BV1kE411E7HX'    # 上海交大 程帆《信息论》2020 春（分 P）
MIT650 = 'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-6-video/'
EE378C14 = 'https://web.stanford.edu/class/ee378c/lecture14_annotated.pdf'
EE378C2 = 'https://web.stanford.edu/class/ee378c/lecture2_annotated.pdf'

# Each step: one concrete video (or slide range) and the exact part to watch.
#   minutes : what to budget (None = unknown, shown as "—")
#   opt     : optional (not counted in the core total)
#   lang    : 'zh' or 'en' (language of the video itself)
#   cards   : roadmap card ids (without the "c-" prefix) this step helps with
#   alt     : optional second link {zh,en,url,lang}
STEPS = [
  # ---------- A. 概率与贝叶斯直觉 ----------
  dict(id='bayes3b1b', phase='A', lang='en', minutes=15, opt=True,
       url=YT + 'HZGCoVF3YvM',
       src_zh='3Blue1Brown', src_en='3Blue1Brown',
       title_zh='Bayes theorem, the geometry of changing beliefs', title_en='Bayes theorem, the geometry of changing beliefs',
       part_zh='全片 15 分钟：0:00 例子 → 4:09 推出公式 → 10:13 直觉化',
       part_en='whole video, 15 min: 0:00 example → 4:09 the formula → 10:13 making it intuitive',
       why_zh='用面积图讲清先验、似然、后验三者的关系。van Trees 不等式里的“先验”和后验分布都建立在这个直觉上。已经熟悉贝叶斯公式可跳过。',
       why_en='Area pictures for prior, likelihood and posterior. The prior in the van Trees inequality and the posterior law build on exactly this picture. Skip if Bayes’ rule is already second nature.',
       cards=['p-bayes', 'prior', 'posterior']),
  dict(id='tsitsiklis12', phase='A', lang='en', minutes=25, approx=True,
       url='https://www.ocw.mit.edu/courses/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/resources/lecture-12-iterated-expectations-sum-of-a-random-number-of-random-variables',
       src_zh='MIT 6.041 · John Tsitsiklis', src_en='MIT 6.041 · John Tsitsiklis',
       title_zh='Lecture 12: Iterated Expectations', title_en='Lecture 12: Iterated Expectations',
       part_zh='只看前半节：“E[X|Y] 本身是一个随机变量”和全期望公式；后半节“随机个数随机变量之和”可跳过',
       part_en='first half only: “E[X|Y] is itself a random variable” and the law of iterated expectations; skip the second half (sum of a random number of variables)',
       why_zh='论文式 (75) 的核心一句话是“通信记录的 score = 原始 score 在给定记录下的条件期望”。先把“条件期望是随机变量”想清楚，III-A 就读得懂了。',
       why_en='Eq. (75) says “the score of the transcript is the conditional expectation of the raw score given the transcript”. Once “a conditional expectation is a random variable” clicks, III-A reads easily.',
       cards=['cond-exp', 'score-identity']),

  # ---------- B. 集中不等式 ----------
  dict(id='hdp2', phase='B', lang='zh', minutes=14,
       url=BILI_HDP,
       src_zh='B站 · 滕佳烨《高维概率》', src_en='Bilibili · Jiaye Teng, High-Dimensional Probability (in Chinese)',
       title_zh='第 2 集 Hoeffding 不等式（13:37）', title_en='Episode 2: Hoeffding inequality (13:37)',
       part_zh='全集。没有概率论速成背景的话，可以先看第 1 集“高维概率简介”（18:17）',
       part_en='whole episode. Episode 1, the introduction (18:17), is a gentle warm-up if needed',
       why_zh='有界变量的平均值偏离均值的概率是指数级小。论文第 IV 节（IV-B、IV-C）控制一比特测量误差、第 V 节的“有界得分准则”都用它。',
       why_en='Averages of bounded variables deviate with exponentially small probability. Sections IV-B/IV-C (one-bit measurement error) and the bounded-score criterion of Section V use it.',
       cards=['mgf', 'subgauss', 'hoeffding']),
  dict(id='hdp3', phase='B', lang='zh', minutes=10,
       url=BILI_HDP,
       src_zh='B站 · 滕佳烨《高维概率》', src_en='Bilibili · Jiaye Teng, High-Dimensional Probability (in Chinese)',
       title_zh='第 3 集 Bernstein 不等式（9:29）', title_en='Episode 3: Bernstein inequality (9:29)',
       part_zh='全集（打开链接后，在右侧“合集”列表点第 3 集）',
       part_en='whole episode (open the link, then pick episode 3 in the collection list on the right)',
       why_zh='论文下界用的假设 (19) 就是 score 的 Bernstein 型集中条件。看的时候分清两项：方差项 σ² 管“正常波动”，b·t 项管“偶尔的大值”；高斯模型 b = 0，就是次高斯。III-B 的引理 2 控制的正是 b > 0 时多出来的那一项。',
       why_en='Assumption (19), used by the lower bound, is a Bernstein-type concentration condition on the score. Keep the two terms apart: the variance σ² handles ordinary fluctuations, the b·t term handles occasional large values; the Gaussian model has b = 0 (sub-Gaussian). Lemma 2 in III-B controls exactly the extra term when b > 0.',
       cards=['bernstein', 'block-score']),
  dict(id='hdp67', phase='B', lang='zh', minutes=24, opt=True,
       url=BILI_HDP,
       src_zh='B站 · 滕佳烨《高维概率》', src_en='Bilibili · Jiaye Teng, High-Dimensional Probability (in Chinese)',
       title_zh='第 6 集 次高斯随机向量（15:25）+ 第 7 集 随机向量 Concentration（8:53）', title_en='Episodes 6 + 7: sub-Gaussian random vectors (15:25), concentration of random vectors (8:53)',
       part_zh='两集都看（在右侧“合集”列表点第 6、7 集）；第 8 集以后与本文无关，可跳过',
       part_en='both episodes (pick 6 and 7 in the collection list); episodes 8+ are not needed for this paper',
       why_zh='参数是 d 维时，论文要求条件对每个单位方向 u 都成立，这就是“随机向量”版本的集中性。只研究 d = 1 时可以先跳过。',
       why_en='With a d-dimensional parameter the condition must hold in every unit direction u — that is concentration of random vectors. Skip for now if you focus on d = 1.',
       cards=['subgauss', 'block-score']),

  # ---------- C. 得分与 Fisher 信息 ----------
  dict(id='mit650a', phase='C', lang='en', minutes=17,
       url=YT + 'JTbZP0yt9qc&t=33s', alt=dict(zh='OCW 页面（含字幕稿）', en='OCW page (with transcript)', url=MIT650),
       src_zh='MIT 18.650 · Philippe Rigollet', src_en='MIT 18.650 · Philippe Rigollet',
       title_zh='Lecture 6: MLE (cont.) and the Method of Moments', title_en='Lecture 6: MLE (cont.) and the Method of Moments',
       part_zh='0:33–17:06：Fisher 信息矩阵；两种等价定义（一阶导的方差 / 二阶导的负期望）及其证明',
       part_en='0:33–17:06: the Fisher information matrix; the two equivalent definitions (variance of the first derivative / minus expected second derivative) and the proof',
       why_zh='把 score 和 Fisher 信息的定义一次讲透，还推导了“score 的方差 = −E[二阶导]”。这正是论文 II-B 和 (73)–(84) 的出发点。',
       why_en='Defines the score and Fisher information carefully and proves “variance of the score = −E[second derivative]” — the starting point of II-B and (73)–(84).',
       cards=['score', 'fisher', 'n-gradient', 'n-matrix']),
  dict(id='mit650b', phase='C', lang='en', minutes=10,
       url=YT + 'JTbZP0yt9qc&t=1026s', alt=dict(zh='OCW 页面', en='OCW page', url=MIT650),
       src_zh='MIT 18.650 · Philippe Rigollet', src_en='MIT 18.650 · Philippe Rigollet',
       title_zh='Lecture 6（续）', title_en='Lecture 6 (cont.)',
       part_zh='17:06–27:08：Fisher 信息 = 似然的曲率（与 KL 散度的联系）；22:51 起是正则性条件（支撑不依赖参数、真值不在边界、可交换求导与积分）',
       part_en='17:06–27:08: Fisher information as curvature of the likelihood (link to KL); from 22:51 the regularity conditions (support not depending on θ, true value not on the boundary, swapping derivative and integral)',
       why_zh='论文 II-B 的正则性假设（如 (16) 的求导积分可交换）和这里列的条件基本对应；“曲率”直觉也解释了 Fisher 信息为什么能衡量“可区分程度”。',
       why_en='The regularity assumptions in II-B (e.g. swapping derivative and integral in (16)) largely match this list; the curvature picture explains why Fisher information measures how distinguishable nearby parameters are.',
       cards=['fisher', 'regularity', 'kl-tv']),
  dict(id='mit650c', phase='C', lang='en', minutes=6,
       url=YT + 'JTbZP0yt9qc&t=1628s', alt=dict(zh='OCW 页面', en='OCW page', url=MIT650),
       src_zh='MIT 18.650 · Philippe Rigollet', src_en='MIT 18.650 · Philippe Rigollet',
       title_zh='Lecture 6（续）', title_en='Lecture 6 (cont.)',
       part_zh='27:08–32:36：MLE 的渐近方差 = Fisher 信息的逆，平方风险 ≈ 1/(n·I)。32:36 起讲矩估计，可以停了',
       part_en='27:08–32:36: asymptotic variance of the MLE = inverse Fisher information, squared risk ≈ 1/(n·I). Stop at 32:36 (method of moments)',
       why_zh='“风险 ≈ 1 / 总 Fisher 信息”是整条下界证明的直觉。van Trees 不等式把它变成对所有估计器、所有协议都成立的下界。',
       why_en='“Risk ≈ 1 / total Fisher information” is the intuition behind the whole lower bound; the van Trees inequality turns it into a bound valid for every estimator and protocol.',
       cards=['fisher', 'risk-order', 'gauss-mean', 'sq-risk', 'van-trees']),

  # ---------- D. 信息论 ----------
  dict(id='it-p3', phase='D', lang='zh', minutes=59,
       url=BILI_IT + '?p=3', alt=dict(zh='英文替代：MacKay Lecture 2（51:08）', en='English alternative: MacKay Lecture 2 (51:08)', url='https://new.videolectures.net/videos/mackay_course_02', lang='en'),
       src_zh='B站 · 上海交大 程帆《信息论》', src_en='Bilibili · SJTU Information Theory, Fan Cheng (in Chinese)',
       title_zh='P3 lec-2 Part1：信息熵、联合熵、条件熵、链式法则（58:49）', title_en='P3 lec-2 Part 1: entropy, joint and conditional entropy, chain rule (58:49)',
       part_zh='全 P（可 1.25 倍速）',
       part_en='whole part (1.25× speed is fine)',
       why_zh='第 III 节的熵预算 (118) 就是用链式法则把 H(T|W) 拆成 I(Θ;T|W) + H(T|Θ,W)。条件熵和链式法则必须熟。',
       why_en='The entropy budget (118) in Section III splits H(T|W) into I(Θ;T|W) + H(T|Θ,W) with the chain rule — conditional entropy and the chain rule must be fluent.',
       cards=['entropy', 'self-info', 'entropy-budget', 'bit-nat']),
  dict(id='it-p4', phase='D', lang='zh', minutes=62,
       url=BILI_IT + '?p=4', alt=dict(zh='英文替代：MacKay Lecture 6（54:41）', en='English alternative: MacKay Lecture 6 (54:41)', url='https://new.videolectures.net/videos/mackay_course_06', lang='en'),
       src_zh='B站 · 上海交大 程帆《信息论》', src_en='Bilibili · SJTU Information Theory, Fan Cheng (in Chinese)',
       title_zh='P4 lec-2 Part2：相对熵、KL 距离、互信息（1:02:05）', title_en='P4 lec-2 Part 2: relative entropy, KL divergence, mutual information (1:02:05)',
       part_zh='全 P',
       part_en='whole part',
       why_zh='互信息 I(Θ;T|W) 是熵预算里“真正关于参数的那部分比特”；KL 也会在 Fisher 信息的曲率解释中再次出现。',
       why_en='The mutual information I(Θ;T|W) is the part of the bit budget that actually tells you about the parameter; KL reappears in the curvature view of Fisher information.',
       cards=['mutual-info', 'kl-tv']),
  dict(id='it-p5', phase='D', lang='zh', minutes=78,
       url=BILI_IT + '?p=5',
       src_zh='B站 · 上海交大 程帆《信息论》', src_en='Bilibili · SJTU Information Theory, Fan Cheng (in Chinese)',
       title_zh='P5 lec-2 Part3：信息不等式、数据处理不等式、信息图、Fano 不等式（1:18:28）', title_en='P5 lec-2 Part 3: information inequalities, data-processing inequality, Fano (1:18:28)',
       part_zh='重点是数据处理不等式；Fano 不等式本文没用，可快进',
       part_en='focus on the data-processing inequality; Fano is not used in this paper and can be skimmed',
       why_zh='“对数据做处理不能增加信息”。论文用的是它的 Fisher 信息版本（Jensen 推出处理后 Fisher 信息不增），证明结构一模一样。',
       why_en='“Processing cannot create information.” The paper uses the Fisher-information version (via Jensen, processing cannot increase Fisher information); the proof pattern is the same.',
       cards=['dpi', 'jensen-cs']),
  dict(id='it-p14', phase='D', lang='zh', minutes=66, opt=True,
       url=BILI_IT + '?p=14',
       src_zh='B站 · 上海交大 程帆《信息论》', src_en='Bilibili · SJTU Information Theory, Fan Cheng (in Chinese)',
       title_zh='P14 lec-7 Part1：微分熵、多元高斯分布（1:05:42）', title_en='P14 lec-7 Part 1: differential entropy, multivariate Gaussian (1:05:42)',
       part_zh='选看：重点是微分熵的定义和高斯的微分熵',
       part_en='optional: the definition of differential entropy and the Gaussian case',
       why_zh='参数 Θ 是连续的，下界里要用先验的微分熵。只想走通主线的话，记住“微分熵可以为负、只有差值有意义”即可。',
       why_en='Θ is continuous, so the lower bound uses the differential entropy of the prior. For the main line it is enough to know it can be negative and only differences matter.',
       cards=['diff-entropy', 'prior']),

  # ---------- E. 通信协议与 rectangle ----------
  dict(id='ee378c14-setup', phase='E', lang='en', minutes=10, approx=True, slides=True,
       url=EE378C14,
       src_zh='Stanford EE378C · 韩彦骏（讲义）', src_en='Stanford EE378C · Yanjun Han (slides)',
       title_zh='Lecture 14: Communication/privacy constrained estimation', title_en='Lecture 14: Communication/privacy constrained estimation',
       part_zh='讲义第 4–5 页（页脚 4/26–5/26）：分布式估计的 minimax 问题；非交互（SMP）、顺序交互、黑板三种协议',
       part_en='slides 4–5 (footer 4/26–5/26): the distributed minimax problem; noninteractive (SMP), sequential and blackboard protocols',
       why_zh='一页图就把“n 台机器各发 k 比特 → 融合中心估计”的标准设定和三种协议摆清楚了，正好对应论文 II-A。',
       why_en='One picture lays out the standard “n machines, k bits each → fusion center” setting and the three protocol types — exactly Section II-A.',
       cards=['distributed', 'noninteractive', 'blackboard', 'fusion', 'budget', 'minimax']),
  dict(id='ee378c2', phase='E', lang='en', minutes=5, approx=True, slides=True,
       url=EE378C2,
       src_zh='Stanford EE378C · 韩彦骏（讲义）', src_en='Stanford EE378C · Yanjun Han (slides)',
       title_zh='Lecture 2: Importance of Problem Structure', title_en='Lecture 2: Importance of Problem Structure',
       part_zh='讲义第 4 页（页脚 4/16）“Blackboard communication protocol”：协议树，树深 = 比特数',
       part_en='slide 4 (footer 4/16) “Blackboard communication protocol”: the protocol tree, depth = number of bits',
       why_zh='把黑板协议画成二叉树：每个节点由谁发言只取决于已公开的历史。读论文黑板协议的定义和引理 3 前先看这一页。',
       why_en='Draws a blackboard protocol as a binary tree where who speaks next depends only on the public history. Look at it before the blackboard definition and Lemma 3.',
       cards=['blackboard', 'transcript']),
  dict(id='odonnell23b', phase='E', lang='en', minutes=37,
       url=YT + 'zFHWmmThdT4', alt=dict(zh='预热：同系列 Communication complexity basics', en='warm-up: Communication complexity basics (same series)', url=YT + 'mQQ36cDnmR8', lang='en'),
       src_zh='CMU CS Theory Toolkit · Ryan O’Donnell', src_en='CMU CS Theory Toolkit · Ryan O’Donnell',
       title_zh='Lecture 23b: Deterministic Communication Complexity（37 分钟）', title_en='Lecture 23b: Deterministic Communication Complexity (37 min)',
       part_zh='从开头看到 “Combinatorial Rectangle / Mondrian style” 讲完；最后的 log-rank 猜想可以跳过',
       part_en='from the start through “Combinatorial Rectangle / Mondrian style”; the closing log-rank conjecture can be skipped',
       why_zh='引理 3 的关键：固定一条通信记录后，满足它的输入集合是“矩形”（每台机器的约束只涉及自己的输入）。这节课用通信矩阵把这件事讲得非常直观。',
       why_en='The key to Lemma 3: fixing a transcript, the set of inputs consistent with it is a rectangle (each machine’s constraint involves only its own input). The communication-matrix picture here makes this very concrete.',
       cards=['rectangle', 'transcript', 'blackboard']),

  # ---------- F. 把工具拼成下界 ----------
  dict(id='ee378c14-lb', phase='F', lang='en', minutes=30, approx=True, slides=True,
       url=EE378C14,
       src_zh='Stanford EE378C · 韩彦骏（讲义）', src_en='Stanford EE378C · Yanjun Han (slides)',
       title_zh='Lecture 14（续）：Tool II = 量化 Fisher 信息 + van Trees', title_en='Lecture 14 (cont.): Tool II = quantized Fisher information + van Trees',
       part_zh='讲义第 16–20 页：16 量化 Fisher 信息（输出 Y 的 score = 原始 score 的条件期望）→ 17 van Trees 不等式 → 18 推论与交互协议下的张量化 → 19 次高斯 score 时的 Fisher 信息上界 → 20 高斯均值 k 比特的下界',
       part_en='slides 16–20: 16 quantized Fisher information (score of Y = conditional expectation of the raw score) → 17 van Trees → 18 corollaries and tensorization under interaction → 19 Fisher bounds for sub-Gaussian scores → 20 the k-bit Gaussian-mean lower bound',
       why_zh='这五页就是论文第 III 节的“独立样本块、单台机器”简化版。先过一遍，再读 III-A 到 III-C 会顺很多；论文的新东西（共享观测、定位成本）则在 III-D、III-E。',
       why_en='These five slides are the “independent blocks” version of Section III. Read them first and III-A to III-C become much easier; what is new in the paper (shared observations, localization cost) is in III-D and III-E.',
       cards=['score-identity', 'van-trees', 'chain-rule', 'prior', 'bayes-risk', 'm-lb-easy', 'event-score', 'm-lb-gauss', 'm-lb-assembly', 'bernstein']),
  dict(id='canonne', phase='F', lang='en', minutes=None, opt=True,
       url='https://www.itsoc.org/video/estimation-and-hypothesis-testing-under-information-constraints-part-13',
       src_zh='IEEE 信息论学会 · Clément Canonne（2021 港中文 Croucher 暑期课）', src_en='IEEE ITSoc · Clément Canonne (2021 Croucher Summer Course, CUHK)',
       title_zh='Estimation and Hypothesis Testing under Information Constraints（1/3）', title_en='Estimation and Hypothesis Testing under Information Constraints (1/3)',
       part_zh='第 1 讲（共 3 讲）。进阶选看，适合读完第 III 节之后',
       part_en='part 1 of 3. Advanced and optional — best after you have read Section III',
       why_zh='系统介绍通信、本地隐私等信息约束下证 minimax 下界的通用方法，覆盖非交互和交互两种设定。可以用来回答“这篇论文的下界方法和别的方法比怎么样”这类追问。',
       why_en='A systematic tutorial on proving minimax lower bounds under communication and local-privacy constraints, both noninteractive and interactive. Good preparation for questions like “how does this lower-bound technique compare with others?”.',
       cards=['minimax', 'lower-upper', 'm-lb-map', 'distributed']),
]

PHASES = {
  'A': ('概率与贝叶斯直觉', 'Probability and Bayesian intuition'),
  'B': ('集中不等式', 'Concentration inequalities'),
  'C': ('得分与 Fisher 信息', 'Score and Fisher information'),
  'D': ('信息论', 'Information theory'),
  'E': ('通信协议与 rectangle', 'Protocols and the rectangle property'),
  'F': ('把工具拼成下界', 'Putting the lower bound together'),
}

# Shortest useful path if time is tight.
QUICK = ['hdp3', 'mit650a', 'mit650c', 'it-p3', 'odonnell23b', 'ee378c14-lb']

# Reading page: which steps to show under each section guide, with a section-specific note.
SECTIONS = {
  'sec-ii-a': [
    ('ee378c14-setup', '先看这两页图，再读本节的抽样与协议定义。', 'Look at these two slides before reading the sampling and protocol definitions.'),
    ('ee378c2', '本节黑板协议定义的树状图。', 'A tree picture for this section’s blackboard protocol.'),
  ],
  'sec-ii-b': [
    ('mit650a', '本节开头 score（式 (15) 前后）和 Fisher 信息的定义。', 'The definitions of the score (around Eq. (15)) and Fisher information at the start of this section.'),
    ('mit650b', '从 22:51 起对照本节的正则性条件 (16)–(18)。', 'From 22:51, compare with this section’s regularity conditions (16)–(18).'),
    ('hdp3', '假设 (19) 的 Bernstein 型 score 条件。', 'The Bernstein-type score condition (19).'),
    ('hdp67', 'd 维时“对每个方向 u 成立”的含义（选看）。', 'What “for every direction u” means when d > 1 (optional).'),
  ],
  'sec-ii-c': [
    ('mit650c', '包络里 1/N、1/(nm) 两项就是“风险 ≈ 1/(样本数 × Fisher 信息)”。', 'The 1/N and 1/(nm) terms are “risk ≈ 1/(samples × Fisher information)”.'),
  ],
  'sec-iii-a': [
    ('tsitsiklis12', '式 (75)：记录的 score = 原始 score 的条件期望。', 'Eq. (75): the transcript’s score is a conditional expectation of the raw score.'),
    ('ee378c14-lb', '第 16–18 页对应本节的得分恒等式和 van Trees (96)–(102)。', 'Slides 16–18 match the score identity and van Trees (96)–(102).'),
    ('bayes3b1b', '先验、后验是什么（选看）。', 'What prior and posterior mean (optional).'),
  ],
  'sec-iii-b': [
    ('hdp3', '引理 2 控制 Bernstein 条件多出来的平方项。', 'Lemma 2 controls the extra quadratic term of the Bernstein condition.'),
    ('ee378c14-lb', '第 19 页：次高斯 score 时 Fisher 信息的上界，是本节的简化版。', 'Slide 19: Fisher bounds for sub-Gaussian scores — a simplified version of this section.'),
  ],
  'sec-iii-c': [
    ('odonnell23b', '引理 3 的 rectangle 性质。', 'The rectangle property behind Lemma 3.'),
    ('it-p3', '(147)–(159) 把记录概率取负对数平均后得到熵。', '(147)–(159) take −log of the transcript probability and average it to get entropy.'),
  ],
  'sec-iii-d': [
    ('it-p4', '条件互信息和“共享观测不能当作免费边信息”。', 'Conditional mutual information, and why shared observations are not free side information.'),
    ('it-p5', '数据处理不等式的思路。', 'The data-processing pattern.'),
  ],
  'sec-iii-e': [
    ('it-p3', '熵预算 (118)：H(T|W) = I(Θ;T|W) + H(T|Θ,W)。', 'The entropy budget (118): H(T|W) = I(Θ;T|W) + H(T|Θ,W).'),
    ('ee378c14-lb', '第 20 页：独立样本时高斯均值的 k 比特下界，可与本节结果对照。', 'Slide 20: the k-bit Gaussian-mean bound with independent samples, to compare with this section.'),
    ('it-p14', '先验的微分熵（选看）。', 'Differential entropy of the prior (optional).'),
  ],
  'sec-iv-b': [
    ('hdp2', '二项统计量的集中性。', 'Concentration of the binomial statistic.'),
  ],
  'sec-iv-c': [
    ('hdp2', '控制一比特测量的误差。', 'Controlling the one-bit measurement error.'),
  ],
  'sec-v-b': [
    ('hdp2', '“有界得分准则”就是 Hoeffding 引理。', 'The bounded-score criterion is Hoeffding’s lemma.'),
  ],
}
