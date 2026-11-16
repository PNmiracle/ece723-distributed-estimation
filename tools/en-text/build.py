# Stage 2: lines -> paragraph HTML with inline-math placeholders <span class="imath" data-tex="...">
import json, re, html, collections, statistics
L=json.load(open('lines.json')); rules=json.load(open('rules.json')); boxes=json.load(open('/home/claude/work/boxes.json'))
def ismath(f): return f.startswith(('CM','MS'))
def style(f): return 'bi' if 'MediItal' in f else 'b' if 'Medi' in f else 'i' if 'Ital' in f else 'r'
GREEK={'α':'alpha','β':'beta','γ':'gamma','δ':'delta','ϵ':'epsilon','ε':'varepsilon','η':'eta','θ':'theta','ϑ':'vartheta','κ':'kappa','λ':'lambda','µ':'mu','μ':'mu','ν':'nu','ξ':'xi','π':'pi','ρ':'rho','σ':'sigma','τ':'tau','ϕ':'phi','φ':'varphi','ψ':'psi','ω':'omega','χ':'chi','ζ':'zeta','ι':'iota',
 'Θ':'Theta','Σ':'Sigma','∆':'Delta','Δ':'Delta','Γ':'Gamma','Φ':'Phi','Π':'Pi','Λ':'Lambda','Ω':'Omega','Ψ':'Psi','Ξ':'Xi','Υ':'Upsilon'}
SYM={'−':'-','≤':r'\le','≥':r'\ge','∈':r'\in','∥':r'\|','′':r'\prime','{':r'\{','}':r'\}','→':r'\to','∞':r'\infty','⊤':r'\top','≪':r'\ll','≍':r'\asymp','∼':r'\sim','↦':r'\mapsto','⊆':r'\subseteq','⪯':r'\preceq','∗':'*','≫':r'\gg','⊗':r'\otimes','∨':r'\vee','·':r'\cdot','∩':r'\cap','\\':r'\setminus','⊂':r'\subset','≻':r'\succ','×':r'\times','≲':r'\lesssim','≳':r'\gtrsim','∅':r'\emptyset','ℓ':r'\ell','∑':r'\sum','∫':r'\int','⋃':r'\bigcup','√':r'\surd','|':'|','<':'<','>':'>','%':r'\%','#':r'\#','&':r'\&','_':r'\_'}
OPS={'log','exp','max','min','sup','inf','lim','det','sin','cos','tan','arg','dim','ker','Pr','liminf','limsup','cosh','sinh','tanh','ln','deg'}
ACC={'¯':'bar','ˆ':'hat','˜':'tilde','˙':'dot','¨':'ddot'}
def clean(t): return re.sub('[\ufe00-\ufe0f]','',t)
def glyph(c):
    t=clean(c['t']); f=c['f']
    if f.startswith('CMEX'):
        big = r'\Big' if c['top']<c['_lt']-3 else r'\big'
        if t in '([': return big+'l'+t
        if t in ')]': return big+'r'+t
        if t=='{': return big+r'l\{'
        if t=='}': return big+r'r\}'
        if t=='|': return big+'|'
    if f.startswith('MSBM') and t.isalpha(): return r'\mathbb{'+t+'}'
    if f.startswith('CMSS') and t.isalpha(): return r'\mathsf{'+t+'}'
    if f.startswith('CMBX'): return r'\mathbf{'+t+'}'
    if f.startswith('CMMIB'): return r'\boldsymbol{'+(('\\'+GREEK[t]) if t in GREEK else t)+'}'
    if f.startswith('CMSY') and t.isascii() and t.isalpha(): return r'\mathcal{'+t+'}'
    if t in GREEK: return '\\'+GREEK[t]
    if t in SYM: return SYM[t]
    return t
def join(toks):
    out=''
    for t in toks:
        if out and re.match(r'\\[A-Za-z]+$',out.split(' ')[-1] if False else re.findall(r'(\\[A-Za-z]+|.)$',out)[0]) and t[:1].isalpha(): out+=' '
        out+=t
    return out
def build(cs, base, size):
    """cs: chars sorted by x. base: reference baseline (top-down). size: level size."""
    cs=sorted(cs,key=lambda c:(round(c['x0'],1),c['base']))
    thr=size*0.82
    accs=[c for c in cs if clean(c['t']) in ACC and c['f'].startswith(('CMR','CMEX')) and c.get('_tex') is None]
    for a in accs:
        cand=[d for d in cs if d is not a and d not in accs and d.get('_tex') is None and d['s']>=thr and (min(d['x1'],a['x1'])-max(d['x0'],a['x0']))>0.3*max(d['x1']-d['x0'],0.5)]
        if not cand: continue
        cand.sort(key=lambda d:d['x0'])
        cmd=ACC[clean(a['t'])]
        if len(cand)>1: cmd={'hat':'widehat','tilde':'widetilde'}.get(cmd,'overline')
        tex='\\'+cmd+'{'+build(cand,base,size)+'}'
        ids={id(d) for d in cand}|{id(a)}
        cs=[d for d in cs if id(d) not in ids]+[dict(cand[0],x0=cand[0]['x0'],x1=max(d['x1'] for d in cand),_tex=tex)]
    cs=sorted(cs,key=lambda c:(round(c['x0'],1),c['base']))
    toks=[]; i=0
    while i<len(cs):
        c=cs[i]
        if c.get('_tex') is not None:  # synthetic (frac/sqrt)
            toks.append(c['_tex']); i+=1; scripts_after=True
        elif c['s']>=thr or c['f'].startswith('CMEX'):
            t=clean(c['t'])
            # accent: attach to following base chars under it
            if t in ACC and c['f'].startswith(('CMR','CMEX')):
                under=[d for d in cs[i+1:] if d['x0']<c['x1']+0.5 and d['x1']>c['x0']-0.5 and d['s']>=thr and d is not c]
                if not under:  # accent may sort after base
                    under=[d for d in cs[:i] if d['x0']<c['x1']+0.5 and d['x1']>c['x0']-0.5 and d['s']>=thr]
                    if under and toks: toks.pop()
                inner=join([glyph(d) for d in under])
                cmd=ACC[t] if len(under)<=1 else 'wide'+ACC[t] if ACC[t] in('hat','tilde') else 'overline'
                if cmd=='bar' and len(under)>1: cmd='overline'
                toks.append('\\'+cmd+'{'+inner+'}')
                ids={id(d) for d in under}; rest=cs[i+1:]; cs=cs[:i+1]+[d for d in rest if id(d) not in ids]; i+=1
            elif t=='̸':
                toks.append(r'\not'); i+=1; continue
            else:
                # operator names: run of upright CMR letters
                if c['f'].startswith('CMR') and t.isalpha() and t not in GREEK:
                    j=i; word=''
                    while j<len(cs) and cs[j]['f'].startswith('CMR') and clean(cs[j]['t']).isalpha() and cs[j]['s']>=thr and clean(cs[j]['t']) not in GREEK and (j==i or cs[j]['x0']-cs[j-1]['x1']<1.2):
                        word+=clean(cs[j]['t']); j+=1
                    if word in OPS: toks.append('\\'+word)
                    elif len(word)>1: toks.append(r'\operatorname{'+word+'}') if word.islower() else toks.append(r'\mathrm{'+word+'}')
                    elif word in GREEK: toks.append('\\'+GREEK[word])
                    else: toks.append(r'\mathrm{'+word+'}')
                    i=j
                else:
                    t0=clean(c['t'])
                    if c['f'].startswith('CMEX') and t0=='(':
                        j=i+1
                        while j<len(cs) and cs[j]['s']<thr and not cs[j]['f'].startswith('CMEX'): j+=1
                        if j<len(cs) and j>i+1 and clean(cs[j]['t'])==')' and cs[j]['f'].startswith('CMEX'):
                            inner=cs[i+1:j]; szm=max(d['s'] for d in inner); mains=[d for d in inner if d['s']>=szm*0.82]
                            bs=sorted(set(round(d['base']) for d in mains)); cut=(bs[0]+bs[-1])/2
                            up=[d for d in mains if d['base']<cut]; dn=[d for d in mains if d['base']>=cut]
                            for d in inner:
                                if d in mains: continue
                                gu=min([abs(d['base']-e['base']) for e in up] or [99]); gd=min([abs(d['base']-e['base']) for e in dn] or [99])
                                (up if gu<gd else dn).append(d)
                            if up and dn:
                                sz=max(d['s'] for d in inner)
                                toks.append(r'\tbinom{'+build(up,statistics.median(d['base'] for d in up),sz)+'}{'+build(dn,statistics.median(d['base'] for d in dn),sz)+'}')
                                i=j+1; continue
                    toks.append(glyph(c)); i+=1
        else:
            toks.append('{}'); # orphan script with no base
        # gather scripts
        sc=[]
        while i<len(cs) and cs[i]['s']<thr and not cs[i]['f'].startswith('CMEX') and cs[i].get('_tex') is None:
            sc.append(cs[i]); i+=1
        if sc:
            mains=[d for d in sc if d['s']>=max(x['s'] for x in sc)*0.82]
            ups=[d for d in sc if d['base']<base-1.0]; dns=[d for d in sc if d['base']>=base-1.0]
            # nested scripts follow their group by proximity: assign smaller chars to group of nearest main char
            def grp(g):
                if not g: return ''
                gm=[d for d in g if d['s']>=max(x['s'] for x in g)*0.82] or g
                b=statistics.median(d['base'] for d in gm)
                return build(g,b,max(x['s'] for x in g))
            # reassign nested: tiny chars belong to group whose main chars are vertically nearest
            big=max(x['s'] for x in sc)
            tiny=[d for d in sc if d['s']<big*0.82]; up_m=[d for d in ups if d not in tiny]; dn_m=[d for d in dns if d not in tiny]
            if tiny and up_m and dn_m:
                for d in tiny:
                    nu=min(abs(d['base']-e['base']) for e in up_m); nd=min(abs(d['base']-e['base']) for e in dn_m)
                    (up_m if nu<nd else dn_m).append(d)
                ups,dns=up_m,dn_m
            elif tiny and up_m and not dn_m: ups=up_m+tiny; dns=[]
            elif tiny and dn_m and not up_m: dns=dn_m+tiny; ups=[]
            s_dn=grp(dns); s_up=grp(ups)
            if s_up in (r'\prime',): toks.append("'" + ('_{'+s_dn+'}' if s_dn else '')); continue
            if s_dn: toks.append('_{'+s_dn+'}')
            if s_up: toks.append('^{'+s_up.replace(r'\prime',"'" ) if s_up.startswith(r'\prime') and False else '^{'+s_up+'}')
    return join(toks)
def math_tex(cs, line_base, size, rl):
    cs=[dict(c) for c in cs]
    for c in cs: c['_lt']=line_base-size*0.75
    # fractions / radicals via rules on this line
    for r in rl:
        inx=[c for c in cs if c['x0']>=r['x0']-0.6 and c['x1']<=r['x1']+0.6 and c.get('_tex') is None]
        rad=[c for c in cs if clean(c['t'])=='√' and abs(c['x1']-r['x0'])<1.5]
        if rad:
            under=[c for c in inx if c['base']>r['top']+1]
            if not under: continue
            tex=r'\sqrt{'+build(under,line_base,size)+'}'
            ids={id(c) for c in under}|{id(rad[0])}
            cs=[c for c in cs if id(c) not in ids]+[dict(rad[0],_tex=tex)]
        else:
            num=[c for c in inx if c['bot']<=r['top']+0.6]; den=[c for c in inx if c['top']>=r['bot']-0.6]
            if not num or not den: continue
            sz=max(c['s'] for c in num+den)
            tex=(r'\tfrac{' if sz<size*0.85 else r'\frac{')+build(num,statistics.median(c['base'] for c in num),sz)+'}{'+build(den,statistics.median(c['base'] for c in den),sz)+'}'
            ids={id(c) for c in num+den}
            cs=[c for c in cs if id(c) not in ids]+[dict(num[0],x0=r['x0'],x1=r['x1'],s=size,base=line_base,_tex=tex)]
    return build(cs,line_base,size)

def esc(t): return html.escape(t,quote=False)
def tex_attr(t): return html.escape(t,quote=True)
STY={'r':('',''),'i':('<em>','</em>'),'b':('<b>','</b>'),'bi':('<b><em>','</em></b>')}
def line_items(l):
    b=boxes[l['k']]; page=b['page']; cs=l['chars']
    sz=collections.Counter(c['s'] for c in cs if c['s']>=8.5).most_common(1); size=sz[0][0] if sz else 9.96
    rl=[r for r in rules[str(page)] if b['x']-1<=r['x0'] and r['x1']<=b['x']+b['w']+1 and abs((r['top']+r['bot'])/2-(l['base']-size*0.3))<size*0.9]
    qed=any(abs(r['x1']-r['x0']-6)<0.7 for r in rl); rl=[r for r in rl if abs(r['x1']-r['x0']-6)>=0.7]
    items=[]; maxx=None
    for c in cs:
        m=ismath(c['f'])
        if maxx is not None:
            gap=c['x0']-maxx
            if gap>0.2*size and not (m and items and items[-1][0]=='m'): items.append(('sp',))
            elif gap>0.2*size: items.append(('msp',))
        if m: items.append(('m',c))
        else: items.append(('t',style(c['f']),c['t']))
        maxx=c['x1'] if maxx is None else max(maxx,c['x1'])
    return items,size,rl,qed
def render(lines):
    out=[]  # list of html pieces; we keep a structured list first
    seq=[]  # ('t',st,txt) ('m',chars,base,size,rl) ('sp',) ('nl',) 
    qed=False; disp=[]
    for l in lines:
        b=boxes[l['k']]
        l['chars']=[c for c in l['chars'] if not c['f'].startswith('CMEX') or (c['bot']<=b['y']+b['h']+1.5 and c['top']>=b['y']-1.5)]
    lines=[l for l in lines if any(c['s']>=8.5 and not c['f'].startswith('CMEX') for c in l['chars'])]
    for li,l in enumerate(lines):
        items,size,rl,q=line_items(l); qed=qed or q
        b=boxes[l['k']]
        onlymath=all(it[0]!='t' or not it[2].strip() for it in items)
        if onlymath and l['x0']-b['x']>18 and len(lines)>1:
            seq.append(('disp',[it[1] for it in items if it[0]=='m'],l['base'],size,rl)); continue
        if li>0 and seq and seq[-1][0]!='disp': seq.append(('nl',))
        cur=None
        for it in items:
            if it[0]=='m':
                if seq and seq[-1][0]=='m': seq[-1][1].append(it[1])
                elif len(seq)>=2 and seq[-1][0]=='msp' and seq[-2][0]=='m': seq.pop(); seq[-1][1].append(it[1])
                else: seq.append(['m',[it[1]],l['base'],size,rl])
            elif it[0]=='msp': seq.append(('msp',))
            elif it[0]=='sp':
                if seq and seq[-1][0]=='t': seq[-1]=('t',seq[-1][1],seq[-1][2]+' ')
                else: seq.append(('sp',))
            else:
                if seq and seq[-1][0]=='t' and (seq[-1][1]==it[1] or seq[-1][2].endswith(' ') and False): seq[-1]=('t',it[1],seq[-1][2]+it[2])
                elif seq and seq[-1][0]=='t' and seq[-1][2].endswith(' ') and seq[-1][1]!=it[1]:
                    seq[-1]=('t',seq[-1][1],seq[-1][2][:-1]); seq.append(('sp',)); seq.append(('t',it[1],it[2]))
                else: seq.append(('t',it[1],it[2]))
    return seq,qed
WORDS=collections.Counter()
def finish(seq):
    h=''; st_open=None
    for i,s in enumerate(seq):
        if s[0]=='t':
            o,c=STY[s[1]]; h+=o+esc(s[2])+c
        elif s[0] in('sp','msp'): h+=' '
        elif s[0]=='nl':
            # dehyphenate
            m=re.search(r'([A-Za-z]+)-(</(?:em|b)>)*$',h)
            nxt=seq[i+1] if i+1<len(seq) else None
            if m and nxt and nxt[0]=='t' and re.match(r'[a-z]',nxt[2]):
                w2=re.match(r'[a-z]+',nxt[2]).group(0); joined=m.group(1)+w2; hy=m.group(1)+'-'+w2
                if WORDS[hy.lower()]>WORDS[joined.lower()]: pass  # keep hyphen
                else: h=h[:m.start()]+m.group(1)+(m.group(2) or '')
                # if hyphen kept, no space
            else: h+=' '
        elif s[0]=='m':
            t=re.sub(r'\.\.\.',r'\\ldots ',math_tex(s[1],s[2],s[3],s[4])).strip(); h+='<span class="imath" data-tex="'+tex_attr(t)+'"></span>'
        elif s[0]=='disp':
            t=math_tex(s[1],s[2],s[3],s[4]); h+='<span class="dmath" data-tex="'+tex_attr(t)+'"></span>'
    h=re.sub(r'</(em|b)>( ?)<\1>',r'\2',h); h=re.sub(r'</em></b>( ?)<b><em>',r'\1',h); h=re.sub(r' {2,}',' ',h).strip()
    return h
# word stats for hyphenation decisions (whole-document text)
for p,lines in L['paras'].items():
    for l in lines:
        prev=None; w=''
        for c in l['chars']:
            if not ismath(c['f']) and (prev is None or c['x0']-prev['x1']<1.8): w+=c['t']
            else:
                if w: WORDS[re.sub(r'[^\w-]','',w).lower()]+=1
                w=c['t'] if not ismath(c['f']) else ''
            prev=c
        if w: WORDS[re.sub(r'[^\w-]','',w).lower()]+=1
OUT={}
for p,lines in L['paras'].items():
    seq,qed=render(lines)
    h=finish(seq)
    if qed: h+=' <span class="qed" aria-label="end of proof">∎</span>'
    OUT[p]=h
json.dump(OUT,open('paras_html.json','w'),ensure_ascii=False)
print(len(OUT))
