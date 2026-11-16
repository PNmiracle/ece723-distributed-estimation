# Dump one section of reading.html for writing explanations: text with TeX, plus contact sheets of
# the equations that exist only as images. Usage (from repo root):
#   python3 tools/extract.py <sec-id> <next-sec-id>  -> tools/.work/<sec>.txt and <sec>_img_K.png
import re,html,base64,io,sys,os
from PIL import Image, ImageDraw
sec_id,next_id=sys.argv[1:3]
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=os.path.join(ROOT,'tools','.work'); os.makedirs(OUT,exist_ok=True)
s=open(os.path.join(ROOT,'reading.html'),encoding='utf-8').read()
a=s.find(f'id="{sec_id}"'); b=s.find(f'id="{next_id}"'); sec=s[a:b]
def tx(x):
    x=re.sub(r'<span class="katex"><span class="katex-mathml">.*?<annotation encoding="application/x-tex">(.*?)</annotation>.*?</span></span></span>', lambda m:'$'+html.unescape(m.group(1))+'$', x, flags=re.S)
    x=re.sub(r'<span class="katex">.*?</span></span></span></span>','',x,flags=re.S)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',x))).strip()
parts=re.split(r'(<figure class="equation" id="eq-\d+">.*?</figure>|<aside class="plain">.*?</aside>|<aside class="guide">.*?</aside>|<div class="para[^"]*">.*?</div>)',sec,flags=re.S)
o=[];imgs=[]
for p in parts:
    if p.startswith('<figure'):
        i=re.search(r'id="eq-(\d+)"',p).group(1); t=re.search(r'annotation encoding="application/x-tex">(.*?)</annotation>',p,re.S)
        if t: o.append(f'[{i}] $$ {html.unescape(t.group(1))} $$')
        else:
            o.append(f'[{i}] (IMG)'); im=re.search(r'base64,([^"]+)"',p)
            imgs.append((i,Image.open(io.BytesIO(base64.b64decode(im.group(1)))).convert('RGB')))
    elif p.startswith('<aside class="plain">'): o.append('  >>OLD: '+tx(p)[:160])
    elif p.startswith('<aside class="guide">'): o.append('GUIDE: '+tx(p))
    elif p.startswith('<div class="para'): o.append(tx(p))
open(os.path.join(OUT,f'{sec_id}.txt'),'w').write('\n'.join(o))
W=1000; pages=[]; cur=[]; h=0
for n,img in imgs:
    sc=min(0.85,(W-60)/img.width); im=img.resize((int(img.width*sc),int(img.height*sc)))
    if h+im.height+14>1500 and cur: pages.append(cur); cur=[]; h=0
    cur.append((n,im)); h+=im.height+14
if cur: pages.append(cur)
for k,pg in enumerate(pages):
    H=sum(im.height+14 for _,im in pg)+6; c=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(c); y=3
    for n,im in pg:
        d.text((2,y+im.height//2-5),f'({n})',fill='red'); c.paste(im,(50,y)); d.line((0,y+im.height+7,W,y+im.height+7),fill='#ddd'); y+=im.height+14
    c.save(os.path.join(OUT,f'{sec_id}_img_{k}.png'))
print(sec_id, 'chars',sum(map(len,o)),'img pages',len(pages))
