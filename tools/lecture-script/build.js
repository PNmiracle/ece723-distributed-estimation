// Build lecture-script.html: the English blackboard lecture for Section III, eqs. (150)–(230).
// Usage: node tools/lecture-script/build.js
const fs = require('node:fs');
const path = require('node:path');
let katex;
try { katex = require('katex'); } catch (_) { katex = require('/opt/npm-tools/node_modules/katex'); }

const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

// Reuse the KaTeX stylesheet with embedded fonts that the other pages already ship.
const katexStyle = read('reading-en.html').match(/<style>(\s*@font-face\{font-family:KaTeX_AMS;.*?)<\/style>/s)?.[1];
if (!katexStyle?.includes('.katex-display')) throw new Error('Cannot locate the embedded KaTeX stylesheet');

const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const tex = (src, displayMode) => katex.renderToString(decode(src.trim()), {
  displayMode, throwOnError: true, output: 'html', strict: 'ignore',
});

let body = read('tools/lecture-script/content.html').replace(/<!--[\s\S]*?-->/g, '');
let nDisplay = 0, nInline = 0;
body = body.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => (nDisplay++, tex(t, true)));
body = body.replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => (nInline++, tex(t, false)));

// Sections → contents, timeline and per-part meta line.
const parts = [];
let clock = 0;
body = body.replace(/<section class="part([^"]*)" id="([^"]+)" data-min="(\d+)" data-title="([^"]+)"(?: data-eqs="([^"]+)")?>\s*(<h2>[\s\S]*?<\/h2>)/g,
  (_, cls, id, min, title, eqs, h2) => {
    h2 = h2.replace(/^<h2>(<span class="pn">[^<]*<\/span>)([\s\S]*)<\/h2>$/, '<h2>$1<span class="ht">$2</span></h2>');
    min = Number(min);
    const start = clock;
    if (min) clock += min;
    parts.push({ id, min, title, eqs, start });
    const fmt = m => m + ':00';
    const meta = min ? '<div class="meta"><span>⏱ ' + min + ' min</span><span>starts at ' + fmt(start) + '</span>' +
      (eqs ? '<span>eqs. ' + eqs + '</span>' : '') + '</div>' : '';
    return '<section class="part' + cls + '" id="' + id + '" data-start="' + start + '" data-min="' + min + '">' + h2 + meta;
  });
const total = clock;
if (total !== 55) throw new Error('Timing adds up to ' + total + ' min, expected 55');

const toc = parts.map(p => '<li><a href="#' + p.id + '" data-id="' + p.id + '"><span class="tm">' +
  (p.min ? p.start + "'" : (p.id === 'prep' ? 'prep' : 'Q&amp;A')) + '</span><span>' + p.title +
  (p.eqs ? '<span class="eqs">' + p.eqs + '</span>' : '') + '</span></a></li>').join('');
const timeline = parts.filter(p => p.min).map(p => '<a href="#' + p.id + '" data-id="' + p.id + '" style="--w:' + p.min +
  '" title="' + p.title + ' · ' + p.min + ' min"><b><span class="ln">' + p.title.replace(/ · .*/, '') + '</span><span class="sh">' +
  ({ open: '★', close: '✓' }[p.id] || p.id.slice(1)) + '</span></b>' + p.min + '<span class="ln"> min</span><span class="sh">′</span></a>').join('');
const plan = JSON.stringify(parts.filter(p => p.min).map(p => ({ id: p.id, s: p.start, m: p.min, t: p.title })));

const script = `
(function(){
  var b=document.body, store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  // view mode
  var seg=document.querySelectorAll('#view button');
  function setView(v){b.dataset.view=v;seg.forEach(function(x){x.classList.toggle('on',x.dataset.v===v)});store.set('ls-view',v)}
  seg.forEach(function(x){x.onclick=function(){setView(x.dataset.v)}});
  var q=new URLSearchParams(location.search).get('view');
  setView(q||store.get('ls-view')||'full');
  // font size
  var fs=Number(store.get('ls-fs'))||17;
  function setFs(v){fs=Math.max(14,Math.min(24,v));document.documentElement.style.setProperty('--fs',fs+'px');store.set('ls-fs',fs)}
  setFs(fs);
  document.getElementById('fsm').onclick=function(){setFs(fs-1)};
  document.getElementById('fsp').onclick=function(){setFs(fs+1)};
  // scrollspy
  var links={};document.querySelectorAll('[data-id]').forEach(function(a){(links[a.dataset.id]=links[a.dataset.id]||[]).push(a)});
  var secs=[].slice.call(document.querySelectorAll('section.part'));
  function spy(){var y=window.scrollY+120,cur=secs[0].id;secs.forEach(function(s){if(s.offsetTop<=y)cur=s.id});
    Object.keys(links).forEach(function(k){links[k].forEach(function(a){a.classList.toggle('on',k===cur)})})}
  window.addEventListener('scroll',spy,{passive:true});spy();
  // rehearsal timer
  var PLAN=${plan}, t0=null, acc=0, tick=null, clockEl=document.getElementById('clock'), planEl=document.getElementById('plan'), go=document.getElementById('go');
  function el(){return acc+(t0?(Date.now()-t0):0)}
  function fmt(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
  function render(){var ms=el(),min=ms/60000,due=PLAN[PLAN.length-1];
    PLAN.forEach(function(p){if(min>=p.s)due=p});if(min<PLAN[0].s+PLAN[0].m)due=PLAN[0];
    clockEl.textContent=fmt(ms);clockEl.classList.toggle('late',min>${total});
    Object.keys(links).forEach(function(k){links[k].forEach(function(a){a.classList.toggle('due',(t0||acc)&&k===due.id)})});
    planEl.textContent=(t0||acc)?('now: '+due.t+' ('+due.s+'–'+(due.s+due.m)+' min)'):'${total}-min plan';}
  go.onclick=function(){if(t0){acc+=Date.now()-t0;t0=null;clearInterval(tick);go.textContent='▶ Start';go.classList.add('go')}
    else{t0=Date.now();tick=setInterval(render,500);go.textContent='❚❚ Pause';go.classList.remove('go')}render()};
  document.getElementById('reset').onclick=function(){acc=0;if(t0){t0=Date.now()}render()};
  render();
  window.addEventListener('beforeprint',function(){document.querySelectorAll('details').forEach(function(d){d.open=true})});
})();`;

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lecture script · Section III, eqs. (150)–(230) | ECE723 study guide</title>
<meta name="description" content="A word-for-word English blackboard lecture for the second half of the converse (Section III, eqs. 150–230): rectangles, the additive shared-sample bound, where the surplus s comes from, and the open gap. With a board plan, timing and rehearsal timer.">
<style>
${katexStyle}
${read('tools/lecture-script/style.css')}</style></head>
<body data-view="full">
<header class="hero"><div class="wrap">
<div class="k">ECE723 · SECTION III · LECTURE SCRIPT</div>
<h1>Proving the hardest term of the lower bound, <em>at the blackboard</em></h1>
<p class="sub">Eqs. (150)–(230) · PDF pp. 13–17 · about ${total} minutes · a word-for-word script with a board plan</p>
<p class="zh" lang="zh-Hans">英文演讲逐字稿 · 含三块黑板的板书计划、计时和备问答</p>
<div class="chips"><a href="index.html">← Study guide home</a><a href="converse.html#eq-150">Equations (150)–(230) in plain words</a><a href="reading-en.html#sec-iii">Section III, guided reading</a></div>
<div class="timeline" aria-label="Timeline">${timeline}</div>
<div class="tlabels"><span>0 min</span><span>${total} min</span></div>
</div></header>
<div class="bar"><div class="wrap">
<a class="home" href="index.html">ECE723</a>
<div class="seg" id="view" role="group" aria-label="View"><button data-v="full">Full</button><button data-v="script">Script only</button><button data-v="board">Board only</button></div>
<div class="seg" role="group" aria-label="Text size"><button id="fsm" title="Smaller text">A−</button><button id="fsp" title="Larger text">A+</button></div>
<div class="timer"><span class="plan" id="plan"></span><span class="clock" id="clock">0:00</span><button class="go" id="go">▶ Start</button><button id="reset">Reset</button></div>
</div></div>
<div class="wrap layout">
<nav class="toc" aria-label="Contents"><h3>CONTENTS</h3><ol>${toc}</ol>
<p class="tip"><b>Rehearse:</b> press Start and speak. The part you should be on is marked in amber.<br><b>Prepare the board:</b> switch to Board only.</p></nav>
<main>
${body.trim()}
<footer>Unofficial study notes for the ECE723 course project. Equation numbers follow the 33-page working paper. The paper is authoritative; this script simplifies on purpose.</footer>
</main></div>
<script>${script}</script>
</body></html>
`;
fs.writeFileSync(path.join(root, 'lecture-script.html'), html);
console.log('lecture-script.html written:', (html.length / 1024).toFixed(0) + ' KB,', nDisplay, 'display +', nInline, 'inline formulas,', total, 'min');
