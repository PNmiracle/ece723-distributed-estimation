// II-C (eqs 30–72), English. Theme: an archive (sample pool) of N case files; n analysts (processors) each
// borrow m random files; each may send only k bits to HQ (fusion center). Estimating θ = solving the case.
const T = String.raw;
const notes = {
  30: [
    T`The three most important symbols in the paper. $B$: the total number of bits all processors can send together. $s$: the bits each coordinate gets, minus the bits that rough localization must spend. What is left over is the <b>surplus</b>. $a_B$: the finest scale you can describe with only $B$ bits, the <b>bit floor</b>.`,
    T`Why rough localization costs $\tfrac12\log_2 m$ bits: a machine with $m$ data points can pin a coordinate down to accuracy $1/\sqrt m$. Pointing to a cell that small inside $[0,1]$ takes $\log_2\sqrt m=\tfrac12\log_2m$ bits.`,
    T`Why $a_B=2^{-2B/d}$: with $B/d$ bits per coordinate you can cut $[0,1]$ into $2^{B/d}$ cells of width $2^{-B/d}$, so the squared error is about $2^{-2B/d}$. $s$ can be negative, which means there are not even enough bits for rough localization.`,
  ],
  31: [
    T`Substitute $B/d=s+\tfrac12\log_2m$ into $a_B=2^{-2B/d}$ to get $a_B=2^{-2s}\cdot\tfrac1m$.`,
    T`In plain words: bit floor = single-machine accuracy $\tfrac1m$ × a discount $2^{-2s}$. Each extra bit of surplus makes the bit floor 4 times better than one machine. When $s$ is negative the bit floor is worse than one machine, and bits are the bottleneck.`,
  ],
  32: [
    T`$D_a$ counts how many analysts borrowed file $a$. Ask each analyst "is $a$ on your list?", score 1 for yes, and add up the answers.`,
  ],
  33: [
    T`$r(\mathcal S)$ counts how many files were borrowed by <b>at least two</b> analysts: the number of <b>shared observations</b>. A file counts once whether 2 or 10 people borrowed it.`,
    T`It matters because shared files make the analysts' data "collude", so their data are no longer independent, and the lower-bound proof has to pay a little extra.`,
  ],
  34: [
    T`Each analyst picks $m$ of the $N$ files at random, so the chance of picking a given file $a$ is $m/N$. With $n$ analysts picking independently, the number of times $a$ gets picked is the number of heads in $n$ flips of a coin with heads probability $m/N$: a binomial distribution.`,
  ],
  35: [
    T`$\bar r$ is the average number of shared files. The chance that a file is borrowed by at least two people = 1 − (chance nobody borrows it) − (chance exactly one person does); multiply by the total number of files $N$.`,
    T`Inside the brackets: $(1-m/N)^n$ is "none of the $n$ analysts picked it", and $n\cdot\tfrac mN\cdot(1-\tfrac mN)^{n-1}$ is "exactly one did" (there are $n$ choices for who).`,
    T`Note: $\bar r$ appears only in the lower bound. It represents the proof difficulty caused by shared data, not extra "free samples".`,
  ],
  36: [
    T`The <b>lower envelope</b>, think of it as the "floor": no protocol can have error below a constant times it. It takes the worst of four bottlenecks (times the dimension $d$):`,
    T`① $1/N$: the archive holds only $N$ files. ② $1/(nm)$: everyone together looked at most $nm$ files. ③ $a_B$: the messages total only $B$ bits. ④ $1/[m(1+s_+)+\bar r]$: refinement power after rough localization; in the lower-bound proof the denominator gains the shared term $\bar r$.`,
  ],
  37: [
    T`The <b>upper envelope</b>, think of it as the "ceiling": some protocol achieves error at most a constant times it. The four terms are exactly those of (36), except that the fourth denominator has no $\bar r$.`,
    T`So as long as $\bar r$ behaves, floor and ceiling meet and the problem is completely solved.`,
  ],
  38: [
    T`Combine the first two terms: the largest reciprocal is the reciprocal of the smallest number, so $d\max\{\tfrac1N,\tfrac1{nm}\}=\tfrac{d}{\min\{N,nm\}}$.`,
    T`In plain words: $\min\{N,nm\}$ is "the most distinct files anyone could see". The error $d/\min\{N,nm\}$ is the classic error you would get holding that many independent data points.`,
  ],
  39: [
    T`Floor ≤ ceiling. Simple reason: the fourth denominator has an extra nonnegative $\bar r$, which can only make that term smaller; the other three terms are identical.`,
    T`When $\bar r$ is large the two can be far apart, but that only says the lower-bound proof is not tight enough. It does not mean a better protocol exists.`,
  ],
  40: [
    T`Theorem 1, lower bound: even with the most powerful blackboard interaction, the error is at least $c$ times the floor $\mathcal L$.`,
    T`It holds uniformly over all $N\ge m\ge1$, as long as the number of processors $n$ is large enough.`,
  ],
  41: [
    T`Theorem 1, upper bound: using only the simplest noninteractive protocol, the error is already at most $C$ times the ceiling $\mathcal U$.`,
    T`This upper bound needs only the bounded identifying moments (24), not the score condition (19).`,
  ],
  42: [
    T`The heart of Theorem 1: (40), (13) and (41) chained into a "sandwich": floor ≤ best blackboard error ≤ best noninteractive error ≤ ceiling.`,
    T`Whenever $\mathcal L\asymp\mathcal U$ (same order), the two middle quantities are squeezed and the problem is solved. And since blackboard and noninteractive have the same order, <b>interaction does not help</b>.`,
  ],
  43: [
    T`Row 1 of Table I (bounded surplus, $s\le C_0$), first step. By (31), $\tfrac1m=a_B2^{2s}$; since $s\le C_0$, $2^{2s}\le2^{2C_0}$.`,
    T`In plain words: when the surplus is small, single-machine accuracy $\tfrac1m$ and the bit floor $a_B$ differ only by a constant factor. They are the same thing.`,
  ],
  44: [
    T`Every term in the ceiling is at most $\tfrac1m$: $N\ge m$, $nm\ge m$, $m(1+s_+)\ge m$, and a bigger denominator means a smaller reciprocal.`,
    T`With (43): $\mathcal U\lesssim d\tfrac1m\lesssim d\,a_B$, while the floor already contains $d\,a_B$. Squeezed from both sides, the error is $\asymp d\,2^{-2nk/d}$: <b>bits are the only bottleneck</b>.`,
  ],
  45: [
    T`Row 2 (surplus proportional to $n$, $s\ge\varepsilon n$). Since $1+s_+\ge s\ge\varepsilon n$, the refinement term is at most $\tfrac1{\varepsilon nm}$.`,
    T`In plain words: with this many bits, the refinement term is at most $\tfrac1\varepsilon$ times the total-access term $\tfrac1{nm}$, so it cannot become a new bottleneck.`,
  ],
  46: [
    T`Ratio of bit floor to total-access term: $a_B\big/\tfrac1{nm}=n\,2^{-2s}$. Since $s\ge\varepsilon n$, this is at most $n\,2^{-2\varepsilon n}$; exponential decay beats linear growth, so it goes to 0.`,
    T`In plain words: the bit term is negligible, leaving the sample term $d/\min\{N,nm\}$ in the ceiling. The floor contains that term too, so Row 2 follows: <b>with plenty of bits, the only limit is how much distinct data you can see</b>.`,
  ],
  47: [
    T`The <b>critical window</b>, where Rows 3 and 4 live: $s\to\infty$ but $s/n\to0$ (the surplus grows without bound, but much more slowly than $n$).`,
    T`Left: ratio of bit term to refinement term, $s\,2^{-2s}\to0$, so the bit term is negligible. Right: ratio of total-access term to refinement term, $s/n\to0$, so the access term is negligible too.`,
  ],
  48: [
    T`As $s\to\infty$, $s_+=s$ and $1+s\approx s$, so the refinement term $\tfrac1{m(1+s)}$ is essentially $\tfrac1{ms}$; their ratio tends to 1.`,
    T`In plain words: refinement power ≈ "samples per machine × surplus bits". Each extra bit of surplus is worth one more machine's worth of effective accuracy.`,
  ],
  49: [
    T`Inside the critical window the ceiling shrinks to two terms: "archive size" $\tfrac1N$ and "localize + refine" $\tfrac1{ms}$. The bit term and the access term are out of the game.`,
  ],
  50: [
    T`Row 3: the archive is not large, $N\le C_0\,ms$. Then $\tfrac1{ms}\le\tfrac{C_0}N$, so the refinement term is covered by the pool term.`,
    T`In plain words: the files themselves are scarce, so more bits do not help. The error is $\asymp d/N$, as good as "moving the whole archive to HQ".`,
  ],
  51: [
    T`An inequality that always holds. Left: files borrowed by ≥2 people. Middle: for each file, count how many pairs its borrowers form; if it was borrowed 2 or more times this is ≥ 1, so it beats the indicator. Right: the same thing counted the other way, for each pair of analysts, how many files they both borrowed.`,
    T`In plain words: <b>"shared files ≤ total pairwise collisions"</b>. The right side is easier, because each pair's collisions can be averaged on its own.`,
  ],
  52: [
    T`Analysts $i\ne j$ borrow independently, so a file is borrowed by both with probability $\tfrac mN\cdot\tfrac mN$; summing over $N$ files gives $\tfrac{m^2}N$.`,
    T`In plain words: two people collide on $m^2/N$ files on average. The bigger the archive, the rarer the collisions.`,
  ],
  53: [
    T`Plug (52) into (51) and take expectations: there are $\binom n2$ pairs of analysts, each colliding on $m^2/N$ files on average.`,
    T`So when the archive is large enough ($N\gtrsim n^2m/s$), $\bar r\lesssim ms$ and the shared term stops getting in the way.`,
  ],
  54: [
    T`Row 4 assumes a big archive: $N\ge c_0n^2m/s$. Into (53): $\bar r\le\tfrac{n^2}2\cdot\tfrac{m^2 s}{c_0 n^2 m}=\tfrac{ms}{2c_0}$.`,
    T`In plain words: total collisions are at most of order $ms$, which changes the floor's fourth term only by a constant.`,
  ],
  55: [
    T`The floor's fourth denominator is squeezed between $ms$ and a constant times $ms$ (for $s\ge1$, $m(1+s)\le2ms$). So that term is $\asymp\tfrac1{ms}$, the same order as the ceiling's fourth term.`,
  ],
  56: [
    T`Ratio of pool term to refinement term: $N/(ms)\ge c_0(n/s)^2$, and since $s/n\to0$ it goes to infinity. So $\tfrac1N\ll\tfrac1{ms}$ and the pool term is negligible.`,
    T`Conclusion (Row 4): floor and ceiling are both $\asymp d/(ms)$. With an archive so big that collisions are rare, <b>the bottleneck is "samples per machine × surplus bits"</b>.`,
  ],
  57: [
    T`Row 5: <b>full overlap</b>, $m=N$; every analyst borrowed the entire archive. So everyone can compute the same empirical moment $\mu_N$, as in (25).`,
  ],
  58: [
    T`Split the $B$ bits as evenly as possible across the $d$ coordinates: coordinate $j$ gets $B_j$ bits, within 1 of $B/d$ (bit counts must be whole numbers).`,
  ],
  59: [
    T`Coordinate $j$ lives in $[0,1]$. Cut it into $2^{B_j}$ equal cells and report the midpoint of the cell; the error is at most half a cell, $2^{-B_j-1}$, which squares to $\tfrac14\,2^{-2B_j}$. Summing over coordinates gives line 1.`,
    T`Using $B_j\ge B/d-1$ gives line 2: $\le d\,2^{-2B/d}$, exactly $d$ times the bit floor $a_B$.`,
    T`The clever part: every machine knows the same $B$-bit codeword, so <b>each one sends only its own $k$-bit slice</b>, like a relay jigsaw, and HQ assembles the full codeword.`,
  ],
  60: [
    T`Same as (26): the empirical moment of the whole archive is off by at most $d/(4N)$. This is the pool error.`,
  ],
  61: [
    T`HQ projects the quantized moment back onto the set of valid fingerprints and inverts it (nearest-point decoding, as in (28)–(29)). The parameter error is at most $2L$ times the moment error.`,
  ],
  62: [
    T`Combine (59)–(61) with $\|x+y\|^2\le2\|x\|^2+2\|y\|^2$: the worst-case error is $\lesssim d\,(\tfrac1N+2^{-2B/d})$, i.e. pool error + quantization error.`,
    T`The floor contains exactly the terms $\tfrac1N$ and $a_B$, and a sum of two terms is within a factor 2 of their maximum, so Row 5 follows.`,
    T`Lesson: overlap is not just "wasted samples". When everyone sees the same data, they can <b>split up and send different pieces of one shared description</b>.`,
  ],
  63: [
    T`The unresolved part of the critical window looks like this: solving $s=\tfrac{nk}d-\tfrac12\log_2m$ for $m$ gives $m=2^{2nk/d-2s}$. Since $s=o(n)$, the $2s$ in the exponent is much smaller than $2nk/d$, so $m$ grows <b>exponentially</b> in $n$.`,
    T`In plain words: you only land in the unresolved zone when each machine's data is exponentially huge. Ordinary polynomial growth is fully solved (Corollary 2).`,
  ],
  64: [
    T`Corollary 2, polynomial case: $m\asymp n^\alpha$, $N\asymp n^\beta$. The answer is $d/\min\{N,nm\}$, which in powers of $n$ reads $d\,n^{-\min\{\beta,\alpha+1\}}$.`,
    T`In plain words: with polynomial growth <b>bits are never the bottleneck</b> (because $\log m\ll n$). Whichever runs out first, the archive $N$ or total access $nm$, decides.`,
  ],
  65: [
    T`Exponential case: the error is about $2^{-n\min\{\lambda,2k/d\}}$. Here $\lambda$ is the exponential growth rate of per-machine data, and $2k/d$ is the exponential decay rate that bits can buy.`,
    T`In plain words: <b>data and bits, whichever is tighter sets the decay rate</b>. If data grow so fast that $\lambda>2k/d$, more data are useless and you are stuck on bits; otherwise you are stuck on data.`,
  ],
  66: [
    T`In the polynomial case $\log_2m=\alpha\log_2n+O(1)$; plugging into the definition of $s$ gives the left formula. $\log n$ is tiny next to $n$, so $s/n\to k/d>0$.`,
    T`In plain words: the surplus is proportional to $n$, which is exactly Row 2 of Table I ($s\ge\varepsilon n$), with answer $d/\min\{N,nm\}$.`,
  ],
  67: [
    T`Plug in $N\asymp n^\beta$ and $nm\asymp n^{\alpha+1}$. The smaller of two powers of $n$ is the one with the smaller exponent. This gives (64).`,
  ],
  68: [
    T`$\lambda_n$: the "per-machine exponential growth rate" of the local sample size $m$. For example, if $m=2^{3n}$ then $\lambda_n=3$. The $\lambda$ in (65) is its limit.`,
  ],
  69: [
    T`Two terms of the floor are enough: the total-access term $\tfrac1{nm}$ and the bit floor $2^{-2nk/d}$. Every protocol's error is at least $cd$ times the larger of the two.`,
  ],
  70: [
    T`Apply $-\tfrac1n\log_2$ to both sides: the smaller the error, the larger this "decay exponent"; and a maximum turns into a minimum under negative log.`,
    T`$-\tfrac1n\log_2\tfrac1{nm}=\lambda_n+\tfrac{\log_2n}n$ and $-\tfrac1n\log_22^{-2nk/d}=\tfrac{2k}d$. The constant term and $\tfrac{\log_2n}n$ both vanish as $n\to\infty$. So the decay exponent is <b>at most</b> $\min\{\lambda,2k/d\}$.`,
  ],
  71: [
    T`Ceiling side: $\tfrac1N$, $\tfrac1{nm}$ and $\tfrac1{m(1+s_+)}$ are all at most $\tfrac1m$, so the ceiling is $\lesssim d\max\{\tfrac1m,2^{-2nk/d}\}$.`,
  ],
  72: [
    T`Applying $-\tfrac1n\log_2$ again: the decay exponent is <b>at least</b> $\min\{\lambda_n,2k/d\}$ minus a vanishing correction.`,
    T`Together with (70), one from above and one from below, both limits equal $\min\{\lambda,2k/d\}$, proving (65).`,
  ],
};

const S = {
  n: [T`n`, T`number of processors (analysts)`],
  k: [T`k`, T`bits each processor may send (each analyst's message length cap)`],
  d: [T`d`, T`parameter dimension: how many numbers we are guessing`],
  m: [T`m`, T`files each processor borrows (local sample size)`],
  N: [T`N`, T`total number of files in the archive (sample pool)`],
  B: [T`B=nk`, T`total bit budget of all processors`],
  s: [T`s`, T`surplus: bits per coordinate left after rough localization; can be negative`],
  sp: [T`s_+`, T`the larger of $s$ and 0: a negative surplus counts as 0`],
  aB: [T`a_B`, T`bit floor: the finest squared-error scale reachable with only $B$ bits`],
  rbar: [T`\bar r`, T`average number of files shared by ≥2 people`],
  L: [T`\mathcal L`, T`lower envelope, the "floor" for the error`],
  U: [T`\mathcal U`, T`upper envelope, the "ceiling" for the error`],
  RBB: [T`R_{\mathrm{BB}}`, T`with blackboard interaction allowed: the best protocol's error at the worst $\theta$ (minimax risk)`],
  RNI: [T`R_{\mathrm{NI}}`, T`the same quantity when only noninteractive protocols are allowed`],
  RA: [T`R_{\mathrm A}`, T`either $R_{\mathrm{NI}}$ or $R_{\mathrm{BB}}$; the conclusion is the same for both`],
  asymp: [T`\asymp`, T`same order: the two sides differ only by constant factors`],
  lesssim: [T`\lesssim`, T`"at most a constant times"`],
  to: [T`\longrightarrow`, T`tends to, as $n\to\infty$`],
};
const syms = {
  30: [S.B, S.n, S.k, S.d, [T`B/d`, T`average bits per coordinate`], [T`\tfrac12\log_2m`, T`bits needed to roughly localize one coordinate to single-machine accuracy $1/\sqrt m$`], S.s, S.sp, S.aB],
  31: [S.aB, S.s, [T`\tfrac1m`, T`the squared-error scale one machine achieves alone`], [T`2^{-2s}`, T`the discount the surplus buys: each +1 in $s$ divides the error by 4`]],
  32: [[T`a`, T`file number, $1$ to $N$`], [T`S_i`, T`the list of files analyst $i$ borrowed (size $m$)`], [T`\mathbf 1\{a\in S_i\}`, T`"is $a$ on $i$'s list?" 1 if yes, 0 if no`], [T`\sum_{i=1}^n`, T`add up the $n$ analysts' answers`], [T`D_a`, T`file $a$'s "popularity": how many people borrowed it`]],
  33: [[T`\mathcal S=(S_1,\dots,S_n)`, T`all borrowing lists, public in advance`], [T`\mathbf 1\{D_a\ge2\}`, T`"was $a$ borrowed by at least two people?"`], [T`r(\mathcal S)`, T`the number of shared files`], S.N],
  34: [[T`D_a`, T`how many times file $a$ was borrowed`], [T`\sim`, T`"is distributed as"`], [T`\operatorname{Bin}(n,p)`, T`binomial: number of heads in $n$ flips of a coin with heads probability $p$`], [T`m/N`, T`the chance one analyst borrows $a$`]],
  35: [S.rbar, [T`\mathbb E`, T`average over the random borrowing lists`], [T`(1-m/N)^n`, T`chance that nobody borrows it`], [T`n\tfrac mN(1-\tfrac mN)^{n-1}`, T`chance that exactly one person borrows it`], S.N],
  36: [S.L, S.d, [T`\max\{\cdots\}`, T`pick the worst of the four bottlenecks`], [T`N^{-1}`, T`limit from the archive size`], [T`(nm)^{-1}`, T`limit from total access: everyone together saw only $nm$ files`], S.aB, [T`[m(1+s_+)+\bar r]^{-1}`, T`limit on refinement power, with the extra shared term $\bar r$ in the lower bound`]],
  37: [S.U, [T`[m(1+s_+)]^{-1}`, T`limit on refinement power: samples per machine × (1 + surplus)`], S.sp, [T`N^{-1},\ (nm)^{-1},\ a_B`, T`as in (36): archive, total access, bits`]],
  38: [[T`\min\{N,nm\}`, T`the most distinct files anyone could see`], [T`\tfrac{d}{\min\{N,nm\}}`, T`the classic error with that many independent data points`]],
  39: [S.L, S.U, [T`\le`, T`the floor is never above the ceiling`]],
  40: [S.RBB, [T`c>0`, T`a fixed constant that does not change with $N,m,n$`], S.L, [T`n_L`, T`the "$n$ is large enough" threshold`], [T`N\ge m\ge1`, T`valid for any legal archive and borrowing size`]],
  41: [S.RNI, [T`C>0`, T`another fixed constant`], S.U, [T`n_U`, T`the threshold on $n$ for the upper bound`]],
  42: [[T`c\mathcal L`, T`the floor`], S.RBB, S.RNI, [T`C\mathcal U`, T`the ceiling`]],
  43: [[T`C_0`, T`a fixed cap on the surplus: $s\le C_0$`], [T`\tfrac1m`, T`single-machine accuracy`], S.aB, [T`2^{2C_0}`, T`a constant that does not change with $n$`]],
  44: [[T`\tfrac1N,\ \tfrac1{nm},\ \tfrac1{m(1+s_+)}`, T`the three non-bit terms of the ceiling`], [T`\tfrac1m`, T`their common upper bound`], S.sp],
  45: [[T`\varepsilon>0`, T`a fixed small constant: the surplus is at least $\varepsilon n$`], [T`\tfrac1{m(1+s_+)}`, T`refinement term`], [T`\tfrac1{\varepsilon nm}`, T`a constant times the total-access term`]],
  46: [S.aB, [T`(nm)^{-1}`, T`total-access term`], [T`n2^{-2s}`, T`their ratio`], [T`n2^{-2\varepsilon n}`, T`linear × exponential decay, tends to 0`], S.to],
  47: [[T`(ms)^{-1}`, T`the star of the critical window: samples per machine × surplus`], [T`s2^{-2s}`, T`bit term ÷ the star, tends to 0`], [T`s/n`, T`total-access term ÷ the star, tends to 0`], S.to],
  48: [[T`[m(1+s)]^{-1}`, T`refinement term (for $s>0$, $s_+=s$)`], [T`\tfrac s{1+s}`, T`their ratio, tends to 1`]],
  49: [S.U, S.asymp, [T`N^{-1}`, T`archive term`], [T`(ms)^{-1}`, T`refinement term`]],
  50: [[T`C_0`, T`a fixed constant: $N\le C_0ms$, i.e. the archive is not large`], [T`\tfrac1{ms}`, T`refinement term`], [T`\tfrac{C_0}N`, T`a constant times the archive term`]],
  51: [[T`r(\mathcal S)`, T`number of shared files`], [T`\binom{D_a}2`, T`how many pairs the $D_a$ borrowers of $a$ can form`], [T`\sum_{i<j}`, T`sum over every pair of analysts`], [T`|S_i\cap S_j|`, T`files both $i$ and $j$ borrowed (their collisions)`]],
  52: [[T`\mathbb E|S_i\cap S_j|`, T`how many files two people collide on, on average`], [T`\mathbb P(a\in S_i)`, T`chance that $i$ borrows $a$, equal to $m/N$`], [T`\tfrac{m^2}N`, T`$N$ files × chance both borrow it, $(m/N)^2$`]],
  53: [S.rbar, [T`\binom n2`, T`number of analyst pairs, about $n^2/2$`], [T`\tfrac{m^2}N`, T`average collisions per pair`]],
  54: [S.rbar, [T`c_0>0`, T`a fixed constant: "big archive" means $N\ge c_0n^2m/s$`], [T`ms`, T`samples per machine × surplus`]],
  55: [[T`m(1+s)+\bar r`, T`the denominator of the floor's fourth term`], [T`2+\tfrac1{2c_0}`, T`a constant`], [T`ms`, T`the star squeezed in the middle`]],
  56: [[T`N/(ms)`, T`how "unimportant" the archive term is relative to refinement`], [T`c_0(n/s)^2`, T`its lower bound, which tends to infinity`], S.to],
  57: [[T`m=N`, T`everyone borrowed the whole archive`], [T`\mu_N`, T`the archive's empirical moment; everyone computes the same value`], [T`\psi(X_a)`, T`the score of file $a$ (see (24))`]],
  58: [[T`B_j`, T`bits given to coordinate $j$ (a whole number)`], [T`\sum_j B_j=B`, T`exactly $B$ bits in total, no more, no less`], [T`|B_j-B/d|\le1`, T`split as evenly as possible`]],
  59: [[T`\widetilde\mu_N`, T`quantized empirical moment: each coordinate reports its cell's midpoint`], [T`2^{B_j}`, T`how many cells coordinate $j$ is cut into`], [T`\tfrac14 2^{-2B_j}`, T`half a cell width, squared`], [T`d2^{-2B/d}`, T`$d$ times the bit floor`]],
  60: [[T`\mathbb E_\theta`, T`average when the truth is $\theta$`], [T`\mu_N-\mu(\theta)`, T`gap between the empirical moment and the true fingerprint`], [T`\tfrac d{4N}`, T`the pool error`]],
  61: [[T`\widehat\theta`, T`HQ's estimate`], [T`L`, T`fingerprint magnifier, see (24)`], [T`\widetilde\mu_N`, T`quantized empirical moment`], [T`\mu(\theta)`, T`true fingerprint`]],
  62: [[T`\sup_{\theta\in\Theta}`, T`grade against the worst possible truth`], [T`C`, T`a fixed constant`], [T`N^{-1}`, T`pool error`], [T`2^{-2B/d}`, T`quantization (bit) error`]],
  63: [S.m, [T`2nk/d`, T`twice the bits per coordinate`], [T`s\to\infty`, T`the surplus keeps growing`], [T`s=o(n)`, T`$s$ grows much more slowly than $n$ ($s/n\to0$)`]],
  64: [S.RA, [T`\alpha`, T`growth power of the local sample size: $m\asymp n^\alpha$`], [T`\beta`, T`growth power of the archive size: $N\asymp n^\beta$, $\beta\ge\alpha$`], [T`\min\{\beta,\alpha+1\}`, T`whichever hits its limit first, archive or total access`], S.asymp],
  65: [[T`\lambda`, T`exponential growth rate of the local sample size: $\tfrac1n\log_2m\to\lambda$`], [T`\tfrac{2k}d`, T`the exponential decay rate bits can buy`], [T`-\tfrac1n\log_2R_{\mathrm A}`, T`the error's "decay exponent": bigger means the error falls faster`], S.to],
  66: [S.s, [T`\tfrac{\alpha}2\log_2n`, T`the cost of rough localization, only logarithmic`], [T`O(1)`, T`a bounded leftover`], [T`\tfrac kd`, T`the limit of $s/n$, a positive number`]],
  67: [[T`\min\{N,nm\}`, T`the number of distinct files one can see`], [T`n^\beta,\ n^{\alpha+1}`, T`archive size, total access`], S.asymp],
  68: [[T`\lambda_n`, T`exponential growth rate of the local sample size at step $n$`], [T`\log_2 m`, T`which power of 2 $m$ is`]],
  69: [S.RA, [T`c`, T`a fixed constant`], [T`(nm)^{-1}`, T`total-access term`], [T`2^{-2nk/d}`, T`the bit floor $a_B$`]],
  70: [[T`-\tfrac1n\log_2R_{\mathrm A}`, T`decay exponent`], [T`\lambda_n+\tfrac{\log_2n}n`, T`exponent from the total-access term`], [T`\tfrac{2k}d`, T`exponent from the bit term`], [T`\tfrac{\log_2(cd)}n`, T`correction from the constant, tends to 0`]],
  71: [S.RA, [T`C`, T`a fixed constant`], [T`m^{-1}`, T`single-machine accuracy, the common cap of the other three terms`], [T`2^{-2nk/d}`, T`the bit floor`]],
  72: [[T`\min\{\lambda_n,\tfrac{2k}d\}`, T`the smaller of the data exponent and the bit exponent`], [T`\tfrac{\log_2(Cd)}n`, T`constant correction, tends to 0`]],
};
module.exports = { notes, syms };
