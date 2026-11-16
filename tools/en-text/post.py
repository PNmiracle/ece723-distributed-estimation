import json,re,html
o=json.load(open('paras_html.json'))
def im(t): return '<span class="imath" data-tex="'+html.escape(t,quote=True)+'"></span>'
o['102']=('<table class="paper-table"><caption><span class="tcap-n">TABLE I</span>Resolved regimes for fixed '+im('d')+', '+im('k')+'. Each row gives the order of both '+im(r'R_{\mathrm{BB}}')+' and '+im(r'R_{\mathrm{NI}}')+'. Constants implicit in '+im(r'\lesssim')+' and '+im(r'\gtrsim')+' are fixed.</caption>'
 '<thead><tr><th scope="col">Condition</th><th scope="col">Risk order</th></tr></thead><tbody>'
 +''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a,b in [
   (im(r's\le C_0')+', fixed '+im('C_0'), im(r'd\,2^{-2nk/d}')),
   (im(r's\ge\varepsilon n')+', fixed '+im(r'\varepsilon>0'), im(r'd/\min\{N,nm\}')),
   (im(r'1\ll s\ll n')+', '+im(r'N\lesssim ms'), im('d/N')),
   (im(r'1\ll s\ll n')+', '+im(r'N\gtrsim n^2m/s'), im('d/(ms)')),
   (im('m=N'), im(r'd\,(N^{-1}\vee 2^{-2nk/d})'))])+'</tbody></table>')
EQ=set(range(1,493))
def link(h):
    parts=re.split(r'(<[^>]+>)',h); out=[]; inspan=0
    for p in parts:
        if p.startswith('<'): out.append(p); continue
        out.append(re.sub(r'\((\d{1,3})\)',lambda m:f'<a class="eq-ref" href="#eq-{m.group(1)}">({m.group(1)})</a>' if int(m.group(1)) in EQ else m.group(0),p))
    return ''.join(out)
n=0
for k in o:
    if k!='102': h=link(o[k]); n+=h.count('eq-ref'); o[k]=h
json.dump(o,open('paras_html2.json','w'),ensure_ascii=False); print('eq links',n)
