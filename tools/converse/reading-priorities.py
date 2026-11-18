"""Share the Section III print priorities and speaking bridges with both readers."""
from collections import Counter
from html import escape
import json
from pathlib import Path
import re
import subprocess

from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((ROOT/'tools/print/converse_priorities.json').read_text())
CORE=set(DATA['core']);IMPORTANT=set(DATA['important'])
SPEECH={}
for lang,suffix in [('en',''),('zh','.zh')]:
    SPEECH[lang]={int(n):body for n,body in (line.split('\t',1) for line in (ROOT/f'tools/gist/converse_speech{suffix}.tsv').read_text().splitlines())}
    assert set(SPEECH[lang])==set(range(73,231))

ZH=[
 ('A. 工具与基本下界','把得分变成信息，再把信息和比特预算变成风险下界。','先理解得分恒等式、数据处理、迹的链式法则、van Trees 不等式，以及抽样下界、比特下界和剩余熵预算。保留 (85)、(86)、(96)、(116) 的定义与常数。先验积分 (87)–(95) 和 van Trees 的计算 (97)–(100) 可以留到第二遍，但要记住 (85)、(101) 的结论。'),
 ('B. 罕见事件与得分偏移','用事件的惊讶度控制条件得分均值，再用比特数控制惊讶度代价。','重点是 (121)–(123) 的事件得分界、(120) 的尾部条件，以及 (139) 的惊讶度二阶矩界。用 (128)、(130) 理解证明思路；倾斜参数的代数计算 (132)–(135) 和尾积分 (140)–(144) 可以后读，先保留结论及条件化要求。'),
 ('C. 独立私有块','长方形结构保住条件独立性，进而消掉得分的交叉项。','这是下界证明的结构核心：长方形 (150)、乘积后验 (153)、信息求和 (159)。连接它们的重要步骤是 (152)、(157)、(158)、(162)、(165)：惊讶度相加、交叉项抵消，再用比特预算控制修正项。种子平均的整理 (166)–(167) 可后读。'),
 ('D. 重叠与共享数据','在证明里揭示共享观测，再对私有数据使用独立块引理。','先看共享／私有分解 (170)，以及信息上界 (174)、(176)、(192)。用 (172)、(181)、(182)、(184)、(188) 理解为什么这样归约合法。平均的整理 (185)–(187) 可后读；没有私有数据时，再查 (191) 的边界情况。'),
 ('E. 合并并反解下界','结合 Fisher 信息与熵预算，消去定位成本，再反解风险下限。','沿 (197)、(198) 走到定位抵消 (202)、标量对数不等式 (206) 和精估下界 (219)，最后在 (220) 合并所有下限。理解变量替换 (200)、(205) 和反解思路 (211)。常数整理 (199)、(207)–(208)、(226) 与分类计算 (214)–(218) 可后读。高斯分支 (221)–(230) 重点看 (227)、Lambert 反函数 (229) 和最终界 (230)。')
]
MATH=re.compile(r'\$([^$]+)\$')
symbols={'SZ':r'S_Z','ST':r'S_T','LT':r'L_T','hT':r'h_T','Vi':r'V_i'}
for n,text in SPEECH['en'].items():
    text=re.sub(r'\b(SZ|ST|LT|hT|Vi|Z|T|G|D|B|q|m|n|s|p|t|x|r|u|F|Q)\b',lambda m:'$'+symbols.get(m[0],m[0])+'$',text)
    if n==196:text=text.replace('into A','into $A$')
    SPEECH['en'][n]=text
tex=sorted({t for notes in SPEECH.values() for text in notes.values() for t in MATH.findall(text)})
js=r'''
const fs=require('fs');let k;
for(const n of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex'])if(n)try{k=require(n);break}catch{}
if(!k)throw Error('KaTeX module unavailable');const out={};
for(const t of JSON.parse(fs.readFileSync(0,'utf8')))out[t]=k.renderToString(t,{output:'htmlAndMathml',throwOnError:true,strict:'error'});
process.stdout.write(JSON.stringify(out));
'''
r=subprocess.run(['node','-e',js],input=json.dumps(tex),capture_output=True,text=True)
if r.returncode:raise RuntimeError(r.stderr)
RENDERED=json.loads(r.stdout)

def inline(text):
    html='';start=0
    for match in MATH.finditer(text):
        html+=escape(text[start:match.start()])+'<span class="prose-formula" data-tex="'+escape(match[1],quote=True)+'">'+RENDERED[match[1]]+'</span>'
        start=match.end()
    return html+escape(text[start:])

def linked(text):
    return re.sub(r'\((\d+)\)',lambda m:f'<a class="eq-ref" href="#eq-{m[1]}">{m[0]}</a>',escape(text))

CSS='''
.rp-panel{margin:1em 0 1.3em;padding:15px 17px;border:1px solid #bdcddd;border-left:4px solid #255ca7;border-radius:9px;background:#f6f9fd;font-family:inherit;line-height:1.65}
.rp-panel h3{font-size:1.05em;margin:0 0 .35em}.rp-panel p{margin:.35em 0}
.rp-help,.rp-caution{font-size:.86em;color:#4b5c70}
.rp-legend{display:flex;flex-wrap:wrap;gap:.35em .8em;margin:.5em 0}
.rp-tier{display:inline-block;font-size:.76em;line-height:1.5;padding:1px 7px;border:1px solid #54718d;border-radius:5px;white-space:nowrap;font-weight:700;letter-spacing:.02em}
.rp-core{background:#255ca7;border-color:#255ca7;color:#fff}.rp-important{background:#eaf5ef;border-color:#62977b;color:#205b3d}.rp-skim{background:#fafafa;border:1px dashed #84909c;color:#56616b;font-weight:500}
.rp-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:.65em 0;font-size:.86em}
.rp-controls select,.rp-controls button{font:inherit;color:#18334b;background:#fff;border:1px solid #aebfd1;border-radius:6px;padding:5px 9px;cursor:pointer}
.rp-status{font-size:.86em;color:#526171}
.rp-route{margin-top:.7em}.rp-route>summary,.rp-focus>summary{cursor:pointer;font-weight:650}
.rp-route-row{padding:.55em 0;border-top:1px solid #d9e3ec}.rp-route-row strong{display:block;font-size:.93em}
.rp-route-row a{display:inline-block;margin-right:.45em;white-space:nowrap}.rp-route-row p{font-size:.86em;color:#4b5c70}
.rp-focus{border-left:3px solid #98b0c8;background:#f7f9fc;padding:7px 11px;margin:.6em 0 1em;font-size:.9em;line-height:1.65}
.rp-focus p{margin:.5em 0 .2em}.rp-focus a{white-space:nowrap}
.equation-priority-card{margin:.8em 0 1.3em;min-width:0;border-top:1px solid #d5e0e8}
.equation-priority-card[data-priority=core]{border-top:2px solid #255ca7}
.equation-priority-card[data-priority=skim]{border-top-style:dashed}
.rp-card-summary{display:flex;align-items:center;gap:8px;cursor:pointer;padding:7px 3px;font-size:.87em;color:#354a60;list-style:none;user-select:none}
.rp-card-summary::-webkit-details-marker{display:none}.rp-card-summary::before{content:'▸';color:#536f88}
.equation-priority-card[open]>.rp-card-summary::before{content:'▾'}
.rp-open-hint,.rp-close-hint{margin-inline-start:auto;font-size:.82em;color:#697582}
.equation-priority-card[open]>.rp-card-summary .rp-open-hint,.equation-priority-card:not([open])>.rp-card-summary .rp-close-hint{display:none}
.rp-card-body{min-width:0;padding-top:3px}.rp-card-body>.para{margin-top:.3em}
.rp-card-body>.equation{margin-top:.55em}
.rp-card-body>.plain .eq-level.rp-tier{font-size:.76em;vertical-align:1px}
.rp-card-body>.plain[data-priority=core]{border-left-color:#255ca7}
.rp-card-body>.plain[data-priority=skim]{border-left-color:#89949e;border-left-style:dashed}
.speaker-bridge{margin:.55em 0 .7em;padding:9px 12px;border:1px solid #bdd4e3;border-left:3px solid #397e9e;border-radius:6px;background:#f0f7fb;font-size:.93em;line-height:1.7}
.speaker-bridge>summary{cursor:pointer;font-size:.86em;font-weight:650;color:#245778}
.speaker-text{margin-top:.4em;color:#243f52}.speaker-text .katex{white-space:nowrap}
@media(max-width:640px){.topbar .bar-content{min-width:0;max-width:100%;flex-wrap:nowrap}.topbar .tools{width:100%;min-width:0;max-width:100%}.topbar .brand{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis}.paper .typeset-prose>.katex,.paper .prose-formula>.katex,.paper .imath>.katex{display:inline-block;max-width:100%;overflow-x:auto;overflow-y:hidden;vertical-align:middle;padding:2px 0}.rp-panel{padding:11px 12px}.rp-controls{gap:7px}.rp-card-summary{gap:6px;flex-wrap:wrap}.rp-open-hint,.rp-close-hint{margin-inline-start:0}.rp-tier{font-size:.78em}.speaker-bridge{padding:8px 10px}}
@media print{.rp-controls,.rp-status,.rp-open-hint,.rp-close-hint{display:none}.rp-panel,.rp-focus,.speaker-bridge{break-inside:avoid}}
'''

SCRIPT=r'''
(() => {
 const panel=document.getElementById('converse-reading-priorities');if(!panel)return;
 const zh=document.documentElement.lang.startsWith('zh');
 const cards=[...document.querySelectorAll('.equation-priority-card')];
 const speech=[...document.querySelectorAll('.speaker-bridge')];
 const select=document.getElementById('rp-mode'),button=document.getElementById('rp-speech'),status=document.getElementById('rp-status');
 const get=(k,f)=>{try{return localStorage.getItem(k)??f}catch{return f}},save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let mode=get('ece723-converse-reading-mode','all');if(!['all','important','core'].includes(mode))mode='all';
 function count(){const n=cards.filter(x=>x.open).length;status.textContent=zh?`展开 ${n} / 158 条公式`:`${n} / 158 formula cards open`;}
 function setMode(value,persist=true){mode=value;select.value=value;cards.forEach(c=>{c.open=value==='all'||c.dataset.priority==='core'||(value==='important'&&c.dataset.priority==='important')});if(persist)save('ece723-converse-reading-mode',value);count();}
 select.addEventListener('change',()=>setMode(select.value));cards.forEach(c=>c.addEventListener('toggle',count));
 function speechLabel(){const n=speech.filter(x=>x.open).length;button.textContent=zh?`串词：${n===speech.length?'全部展开':n===0?'已收起':'部分展开'}`:`Speaking notes: ${n===speech.length?'open':n===0?'closed':'mixed'}`;button.setAttribute('aria-pressed',n===0?'false':n===speech.length?'true':'mixed');}
 function setSpeech(open,persist=true){speech.forEach(x=>x.open=open);if(persist)save('ece723-converse-speaking-open',open?'1':'0');speechLabel();}
 button.addEventListener('click',()=>setSpeech(!speech.every(x=>x.open)));speech.forEach(x=>x.addEventListener('toggle',speechLabel));
 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}const target=document.getElementById(id),card=target?.closest('.equation-priority-card');if(card&&!card.open){card.open=true;count();requestAnimationFrame(()=>target.scrollIntoView({block:'center'}));}}
 setMode(mode,false);setSpeech(get('ece723-converse-speaking-open','1')!=='0',false);
 addEventListener('hashchange',revealHash);revealHash();
 // Existing jump/search controls update history directly after scrolling.
 for(const name of ['pushState','replaceState']){const original=history[name];history[name]=function(...args){const result=original.apply(this,args);revealHash();return result;};}
 document.getElementById('equation-jump')?.addEventListener('submit',()=>{const card=document.getElementById('eq-'+document.getElementById('eq-input').value)?.closest('.equation-priority-card');if(card)card.open=true;},true);
 let printState;addEventListener('beforeprint',()=>{printState=[...cards,...speech].map(x=>[x,x.open]);printState.forEach(([x])=>x.open=true);});addEventListener('afterprint',()=>printState?.forEach(([x,open])=>x.open=open));
})();
'''

for name,lang in [('reading.html','zh'),('reading-en.html','en')]:
    path=ROOT/name;soup=BeautifulSoup(path.read_text(),'html.parser')
    def snapshot():
        return ([str(e.select_one('.katex')) for e in soup.select('.equation')],
                [str(p) for p in soup.select('.para')],
                [str(x) for x in soup.select('.plain-gist,.plain-syms,.eq-fig')])
    before=snapshot()
    equations={int(e['id'][3:]):e for e in soup.select('figure.equation[id]')}
    for card in soup.select('.equation-priority-card'):
        body=card.select_one('.rp-card-body')
        for child in list(body.contents):card.insert_before(child.extract())
        card.decompose()
    for node in soup.select('#converse-reading-priorities,.rp-focus,.speaker-bridge,#web-reading-priority-style,#web-reading-priority-script'):
        node.decompose()
    zh=lang=='zh'
    labels={'core':'A · 核心必读' if zh else 'A · Core','important':'B · 重要支撑' if zh else 'B · Important','skim':'C · 可略读' if zh else 'C · Skim proof'}
    panel=soup.new_tag('section',id='converse-reading-priorities',attrs={'class':'rp-panel'})
    title=soup.new_tag('h3');title.string='第三节：分层阅读与演讲串词' if zh else 'Section III: reading priorities and speaking notes';panel.append(title)
    p=soup.new_tag('p');p.string='与打印版一致：28 条核心、64 条重要支撑、66 条可略读的证明细节。' if zh else 'Matches the print edition: 28 core steps, 64 important supports, 66 skimmable proof details.';panel.append(p)
    legend=soup.new_tag('div',attrs={'class':'rp-legend','data-hl-ui':''})
    for level in labels:
        badge=soup.new_tag('span',attrs={'class':['rp-tier','rp-'+level]});badge.string=labels[level];legend.append(badge)
    panel.append(legend)
    controls=soup.new_tag('div',attrs={'class':'rp-controls','data-hl-ui':''})
    label=soup.new_tag('label',attrs={'for':'rp-mode'});label.string='阅读模式' if zh else 'Reading mode';controls.append(label)
    select=soup.new_tag('select',id='rp-mode')
    for value,cn,en in [('all','展开全部','Open all'),('important','展开核心＋重要','Core + important'),('core','只展开核心','Core only')]:
        option=soup.new_tag('option',value=value);option.string=cn if zh else en;select.append(option)
    controls.append(select)
    button=soup.new_tag('button',id='rp-speech',type='button');button.string='串词：全部展开' if zh else 'Speaking notes: open';controls.append(button)
    status=soup.new_tag('span',id='rp-status',attrs={'class':'rp-status','role':'status','aria-live':'polite'});controls.append(status);panel.append(controls)
    p=soup.new_tag('p',attrs={'class':'rp-help'});p.string='阅读模式收起非选中公式卡片；点开任意卡片仍可查看完整内容。串词可逐条收起，也可一键切换。' if zh else 'Reading modes collapse other formula cards; open any card to read it in full. Speaking notes can be toggled individually or together.';panel.append(p)
    route=soup.new_tag('details',attrs={'class':'rp-route'})
    summary=soup.new_tag('summary');summary.string='展开核心阅读路线' if zh else 'Show the core reading route';route.append(summary)
    for i,section in enumerate(DATA['sections']):
        row=soup.new_tag('div',attrs={'class':'rp-route-row'})
        strong=soup.new_tag('strong');strong.string=ZH[i][0] if zh else section['name'];row.append(strong)
        for n in section['core']:
            a=soup.new_tag('a',href='#eq-'+str(n));a.string=f'({n})';row.append(a)
        p=soup.new_tag('p');p.string=ZH[i][1] if zh else section['purpose'];row.append(p);route.append(row)
    p=soup.new_tag('p',attrs={'class':'rp-caution'});p.string='可略读表示先记结论与适用条件，证明细节留到第二遍。(221)–(230) 的核心标签用于更精细的高斯分支。这些是学习分级。' if zh else 'Skim the proof on a first pass; retain its conclusion and assumptions. Core labels in (221)-(230) apply to the sharper Gaussian branch. These are study-guide priorities.';route.append(p);panel.append(route)
    soup.select_one('#sec-iii > .sec-h').insert_after(panel)
    for i,section in enumerate(DATA['sections']):
        focus=soup.new_tag('details',attrs={'class':'rp-focus'})
        summary=soup.new_tag('summary');summary.string=('本小节怎么读 · ' if zh else 'Reading focus · ')+(ZH[i][0] if zh else section['name']);focus.append(summary)
        p=soup.new_tag('p');p.append(BeautifulSoup(linked(ZH[i][2] if zh else section['guide']),'html.parser'));focus.append(p)
        soup.select_one('#'+section['id']+' > .sec-h').insert_after(focus)
    counts=Counter()
    for n in range(73,231):
        level='core' if n in CORE else 'important' if n in IMPORTANT else 'skim';counts[level]+=1
        figure=equations[n];aside=figure.find_next_sibling('aside',class_='plain');assert aside is not None,n
        old=aside.select_one('.eq-level')
        if old:
            old['class']=['eq-level','rp-tier','rp-'+level];old.string=labels[level]
        aside['data-priority']=level
        previous=figure.find_previous_sibling()
        intro=previous if previous and previous.name=='div' and 'para' in previous.get('class',[]) else None
        card=soup.new_tag('details',id='read-eq-'+str(n),attrs={'class':'equation-priority-card','data-equation':str(n),'data-priority':level,'open':''})
        summary=soup.new_tag('summary',attrs={'class':'rp-card-summary','data-hl-ui':''})
        title=soup.new_tag('span');title.string=('公式 ' if zh else 'Equation ')+f'({n})';summary.append(title)
        badge=soup.new_tag('span',attrs={'class':['rp-tier','rp-'+level]});badge.string=labels[level];summary.append(badge)
        for cls,text in [('rp-open-hint','展开公式与讲解' if zh else 'Open formula and explanation'),('rp-close-hint','收起' if zh else 'Collapse')]:
            hint=soup.new_tag('span',attrs={'class':cls});hint.string=text;summary.append(hint)
        card.append(summary)
        body=soup.new_tag('div',attrs={'class':'rp-card-body'});card.append(body)
        (intro or figure).insert_before(card)
        if intro:body.append(intro.extract())
        speech=soup.new_tag('details',attrs={'class':'speaker-bridge','data-equation':str(n),'open':''})
        head=soup.new_tag('summary');head.string=('演讲串词' if zh else 'Speaking bridge')+f' · ({n})';speech.append(head)
        text=soup.new_tag('div',attrs={'class':'speaker-text'});text.append(BeautifulSoup(inline(SPEECH[lang][n]),'html.parser'));speech.append(text);body.append(speech)
        body.append(figure.extract());body.append(aside.extract())
    assert snapshot()==before,'Original equations, paragraphs or explanation content changed'
    assert counts=={'core':28,'important':64,'skim':66}
    style=soup.new_tag('style',id='web-reading-priority-style');style.string=CSS;soup.head.append(style)
    script=soup.new_tag('script',id='web-reading-priority-script');script.string=SCRIPT;soup.body.append(script)
    path.write_text(str(soup));print(name,dict(counts),'158 bilingual speaking bridges; original content preserved')
