# Stage 1: per English paragraph, pull PDF chars inside its crop boxes, rebuild lines, split into text/math runs.
import pdfplumber, json, re, collections, html, sys
ROOT='/home/claude/ece723-distributed-estimation'
pdf=pdfplumber.open('/home/claude/work/paper.pdf')
boxes=json.load(open('/home/claude/work/boxes.json'))
en=open(f'{ROOT}/reading-en.html',encoding='utf-8').read()
m0=en.find('<main')
starts=[m.start() for m in re.finditer(r'<div class="para english">',en) if m.start()>m0]
scans=[m.start() for m in re.finditer(r'<div class="english-scan">',en) if m.start()>m0]
assert len(scans)==818, len(scans)
import bisect
crop_para=[bisect.bisect_right(starts,p)-1 for p in scans]
chars={}
def page_chars(p):
    if p not in chars:
        pg=pdf.pages[p-1]; H=pg.height
        chars[p]=[dict(t=c['text'],f=c['fontname'].split('+')[-1],s=round(c['size'],2),x0=c['x0'],x1=c['x1'],top=c['top'],bot=c['bottom'],base=H-c['matrix'][5]) for c in pg.chars]
    return chars[p]
def ismath(f): return f.startswith('CM') or f.startswith('MS')
def style(f):
    return 'bi' if 'MediItal' in f else 'b' if 'Medi' in f else 'i' if 'Ital' in f else 'r'
paras=collections.defaultdict(list)   # para -> list of lines (each list of chars)
weird={}
for k,b in enumerate(boxes):
    cs=[c for c in page_chars(b['page']) if b['x']-1<= (c['x0']+c['x1'])/2 <= b['x']+b['w']+1 and b['y']-1 <= (c['top']+c['bot'])/2 <= b['y']+b['h']+1]
    mains=sorted([c for c in cs if c['s']>=8.5 and not c['f'].startswith('CMEX') and c['t']!='√'],key=lambda c:c['base'])
    if not mains: mains=sorted(cs,key=lambda c:c['base'])
    bl=[]
    for c in mains:
        if bl and abs(c['base']-bl[-1][-1])<3: bl[-1].append(c['base'])
        else: bl.append([c['base']])
    bases=[sorted(x)[len(x)//2] for x in bl]
    lines=[[] for _ in bases]
    for c in cs:
        i=min(range(len(bases)),key=(lambda i:abs(bases[i]-c['base']-6.3)) if (c['t']=='√' and c['f'].startswith('CMSY')) else (lambda i:abs(bases[i]-3-(c['top']+c['bot'])/2)) if (c['f'].startswith('CMEX') or c['t']=='√') else (lambda i:abs(bases[i]-c['base']))); c=dict(c,dy=bases[i]-c['base'],k=k); lines[i].append(c)
    fs=collections.Counter((c['f'],c['s']) for c in cs if not ismath(c['f']))
    if any(s<9 for (f,s) in fs if fs[(f,s)]>5): weird[k]={f'{f}@{s}':n for (f,s),n in fs.items()}
    for L in lines: L.sort(key=lambda c:(round(c['x0'],1),-c['dy']))
    paras[crop_para[k]].extend([dict(k=k,base=bases[i],x0=min(c['x0'] for c in L),chars=L) for i,L in enumerate(lines) if L])
json.dump({'paras':{str(p):v for p,v in paras.items()},'weird':weird,'crop_para':crop_para},open('lines.json','w'))
print('paras',len(paras),'weird crops',len(weird)); 
for k,v in weird.items(): print(k,crop_para[k],v)
