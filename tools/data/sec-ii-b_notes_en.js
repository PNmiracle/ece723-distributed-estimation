const T = String.raw;
module.exports = {
  14: [
    T`$\xi_\theta(x)$ is the <b>score</b>: how much the log-likelihood of this data point changes when you nudge $\theta$ slightly. Think of it as the data point "voting" for the direction in which $\theta$ looks more plausible.`,
    T`$I_X(\theta)$ is the <b>Fisher information</b>: the covariance matrix of those mean-zero votes. Along a unit direction, it is the average squared size of the vote in that direction. It measures local sensitivity; Section III uses van Trees to turn an information cap into a risk floor.`,
  ],
  15: [
    T`Two requirements. <b>Left</b>: the score has finite mean square, so votes may be unbounded, but their average squared size and Fisher information are finite. <b>Right</b>: at the true parameter the score averages to zero, so the data do not systematically push $\theta$ to one side.`,
    T`Average over repeated draws from the true model. An individual likelihood need not peak at the true parameter; it is the average of the pushes that is zero.`,
  ],
  16: [
    T`Total probability is always 1, whatever $\theta$ is. So "integrate first, then differentiate" is the derivative of the constant 1, which is 0. If you may swap differentiation and integration, "differentiate first, then integrate" is also 0.`,
    T`In plain words: when $\theta$ changes, probability mass only <b>moves</b> between values of $x$; nothing is created or destroyed, so outflow and inflow cancel. Substituting $\nabla_\theta p_\theta = p_\theta\,\xi_\theta$ gives the zero-mean identity $\mathbb E_\theta\xi_\theta(X)=0$ in (15).`,
    T`This is why the support $\mathcal X_0$ must not depend on $\theta$. For a model like $\mathrm{Uniform}[0,\theta]$, whose boundary moves, swapping the order produces an extra boundary term and the identity breaks.`,
  ],
  17: [
    T`How the message $T$ is produced: first, $q$ raw observations $z=(x_1,\dots,x_q)$ are drawn under the true $\theta$. Then the processor turns them into a message $t$ by a rule $K(t\mid z)$ that <b>does not depend on $\theta$</b> (quantizing, compressing and adding noise all count). Averaging over all possible raw data gives the probability of seeing message $t$.`,
    T`Key point: $\theta$ enters only through the raw data $\prod_a p_\theta(x_a)$. The processor's rule $K$ itself knows nothing about $\theta$.`,
  ],
  18: [
    T`When you differentiate (17), $\theta$ appears only in $\prod_a p_\theta(x_a)$. So: <b>the score of the message = the sum of the raw-data scores, averaged conditionally on having seen $T$</b>.`,
    T`In plain words: a message is a blurred version of the data. The same message can come from many different raw datasets, and the message's "vote" on $\theta$ is the average of their votes. Averaging cancels part of the votes, so a message can never carry more information than the raw data. This is the starting point for every communication lower bound later (a Fisher-information version of the data-processing inequality).`,
  ],
  19: [
    T`The paper's core assumption on the score. The left side is the log moment-generating function (log-MGF) of the score in direction $u$; it measures how heavy the score's tails are.`,
    T`For small $u$ the right side is $\approx \tfrac{v}{2}\|u\|^2$, as for a Gaussian with variance at most $v$. With $b=0$ this is <b>sub-Gaussian</b>; $b>0$ allows heavier, exponential-type tails (sub-exponential), which covers Poisson, exponential and covariance-estimation models.`,
    T`Look at the denominator: $b=0$ puts no restriction on the tilt; with $b>0$ the bound holds for $b\|u\|<1$. The value $v$ caps directional variance; it need not describe the actual size of a typical vote.`,
  ],
  20: [
    T`Split $u$ in (19) into "direction × step": $u = t\,a$, where $a$ is a unit vector and $t$ a scalar. Then $\|u\|=|t|$, and (19) becomes this one-dimensional statement.`,
    T`In plain words: not only along the coordinate axes but in <b>every oblique direction</b>, the projection $a^\top\xi_\theta$ obeys the same tail control.`,
  ],
  21: [
    T`The second derivative of a log-MGF at $t=0$ is the variance. Since the score has mean 0, that variance is $\mathbb E_\theta(a^\top\xi_\theta)^2 = a^\top I_X(\theta)\,a$, the Fisher information in direction $a$.`,
    T`Why $\le v$: both sides of (20) have value 0 and first derivative 0 at $t=0$, and the left never exceeds the right. So near $t=0$ the left side cannot curve more than the right side, whose second derivative is $v$.`,
    T`In plain words: "tails under control" automatically gives "variance under control". In any direction, one observation carries at most $v$ information.`,
  ],
  22: [
    T`Writing "(21) holds for every direction $a$" in matrix form gives $I_X(\theta)\preceq vI_d$: the information matrix is at most $v$ in every direction. Summing over the $d$ coordinate directions gives trace $\le dv$.`,
    T`In plain words: one observation carries at most $v$ units of information per direction and at most $dv$ in total. Information from independent observations adds up, so the $U$ distinct observations a protocol can access carry total information (trace) at most $dvU$.`,
  ],
  23: [
    T`Add up the scores of the $q$ independent observations in a block to get the block score $A_q$. Log-MGFs of independent variables add, so the variance factor becomes $qv$ while the tail-shape parameter $b$ stays the same.`,
    T`In plain words: The $q$ independent observations carry at most $qv$ information in each unit direction. Receiving $q$ copies of one observation would not give this sum.`,
    T`What it is for: later we need to control the conditional mean of the block score given some communication event $E$. This tail bound keeps that conditional mean under control even when $E$ is rare: its norm is bounded by a constant times $\sqrt{qv\log(1/\mathbb P(E))}$ (plus a term $b\log(1/\mathbb P(E))$ when $b>0$).`,
  ],
  24: [
    T`Line 1: $\mu(\theta)$ is the expectation of the statistic $\psi$; think of it as the parameter's "fingerprint". Because $\psi$ takes values in $[0,1]^d$, it is easy to estimate and easy to compress into bits.`,
    T`Line 2 (inverse Lipschitz): if two parameters have close fingerprints, the parameters themselves must be close, with the distance inflated by at most a factor $L$. So estimating $\mu$ to accuracy $\varepsilon$ gives $\theta$ to accuracy $L\varepsilon$ when the input is itself a valid moment. For a noisy moment, decode first as in (28); (29) gives the final bound.`,
    T`Example: in the Bernoulli model $X\sim\mathrm{Bern}(\theta)$, take $\psi(x)=x$; then $\mu(\theta)=\theta$ and $L=1$. The upper bound uses this moment condition; it does not need the score-tail condition (19).`,
  ],
  25: [
    T`Compute $\psi$ once for each of the $N$ observations in the pool, then average.`,
    T`In plain words: this is the sample average you could compute "if all the data sat on one machine", an ideal benchmark. A distributed protocol tries to get as close to it as possible under limited communication.`,
  ],
  26: [
    T`The variance of an average of independent samples is the single-sample variance divided by $N$; then sum over the $d$ coordinates. A variable taking values in $[0,1]$ has variance at most $\tfrac14$ (reached when it is 0 or 1 with equal probability), so the total error is $\le d/(4N)$.`,
    T`In plain words: this is an <b>upper bound</b> for the full-pool moment estimator. Even a perfect report of that moment may differ from its population value. See (257) for combining sampling and communication errors, and (107) for the separate universal sampling lower bound.`,
    T`Note that this identity does not need the coordinates of $\psi$ to be independent: the squared errors of the coordinates simply add.`,
  ],
  27: [
    T`Draw a uniform random number $V\in[0,1]$, independent of $X$. Record 1 if $V\le\psi_j(X)$ and 0 otherwise. Given $X$, the probability of recording 1 is exactly $\psi_j(X)$; averaging over $X$ gives $\mu_j(\theta)$.`,
    T`In plain words: a continuous number in $[0,1]$ becomes a <b>coin</b> whose probability of heads is exactly the moment we want to estimate. The randomized report takes one bit and preserves the mean in expectation (at the cost of a little extra Bernoulli noise; the variance is still $\le\tfrac14$).`,
    T`This step lets Section IV reduce the general problem to distributed Bernoulli estimation.`,
  ],
  28: [
    T`The estimated moment $\widehat\mu$ is noisy and need not land exactly on the set of valid fingerprints $\{\mu(\vartheta):\vartheta\in\Theta\}$. So among all candidate parameters, pick the one whose fingerprint is <b>closest</b> to $\widehat\mu$.`,
    T`In plain words: <b>nearest-point decoding</b>, like projecting a point that drifted off a surface back onto the surface and reading off the parameter there.`,
  ],
  29: [
    T`Three steps. Line 1: the inverse-Lipschitz condition (24) turns parameter error into fingerprint error. Line 2: the triangle inequality, detouring through $\widehat\mu$. Line 3: since $\widehat\theta$ is the nearest point, the distance from $\mu(\widehat\theta)$ to $\widehat\mu$ is at most the distance from the true fingerprint $\mu(\theta)$ to $\widehat\mu$, so the two terms merge into a factor 2.`,
    T`In plain words: <b>parameter error $\le 2L\,\times$ moment error</b>. Estimate the moments well and the parameter follows; the "2" is the cost of projecting and $L$ is the amplification of inverting. Squaring and taking expectations: $\mathbb E\|\widehat\theta-\theta\|^2\le 4L^2\,\mathbb E\|\widehat\mu-\mu(\theta)\|^2$.`,
  ],
};
