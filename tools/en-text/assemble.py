import json,re
ROOT='/home/claude/ece723-distributed-estimation'
R=json.load(open('paras_rendered.json'))
s=open(f'{ROOT}/reading-en.html',encoding='utf-8').read()
m0=s.find('<main')
starts=[m.start() for m in re.finditer(r'<div class="para english">',s) if m.start()>m0]
out=[]; last=0; done=0
for i,st in enumerate(starts):
    if str(i) not in R: continue
    # find matching close of this div
    j=st; depth=0
    for m in re.finditer(r'<div\b|</div>',s[st:]):
        depth+= 1 if m.group(0)=='<div' else -1
        if depth==0: end=st+m.end(); break
    body=R[str(i)]
    cls={0:' abstract',1:' index-terms'}.get(i,'')
    inner=body if body.startswith('<table') else f'<p>{body}</p>'
    out.append(s[last:st]); out.append(f'<div class="para english{cls}">{inner}</div>'); last=end; done+=1
out.append(s[last:]); s2=''.join(out)
open(f'{ROOT}/reading-en.html','w',encoding='utf-8').write(s2)
print('replaced',done,'size',len(s),'->',len(s2),'scans left',s2.count('english-scan"'))
