"""Repair fragmented inline mathematics as whole expressions, preserving UI notes."""
from copy import deepcopy
from html import escape
import json
import os
from pathlib import Path
import re
import subprocess

from bs4 import BeautifulSoup

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
DATA=json.loads((HERE/'prose_repairs.json').read_text())
MATH=re.compile(r'\$([^$]+)\$')
REF=re.compile(r'(?<![\w])\((\d+)\)')


def compact(s):
    return re.sub(r'\s+','',s)


def link_prose(text):
    return REF.sub(lambda m:f'<a class="eq-ref" href="#eq-{m[1]}">({m[1]})</a>'
                   if 1<=int(m[1])<=492 else m[0],escape(text))


documents=[];jobs=[];tex=set()
for name,repairs in DATA.items():
    soup=BeautifulSoup((ROOT/name).read_text(),'html.parser')
    for row in repairs:
        key,selector,prefix,template,*rest=row
        matches=soup.select(f'[data-prose-repair="{key}"]')
        if not matches:
            host=soup.select_one(rest[0]) if rest else soup
            if host is None:raise ValueError((name,key,'missing scope',rest))
            matches=[p for p in host.select(selector) if compact(p.get_text()).startswith(compact(prefix))]
            if key=='para-estimator-derivative':
                matches=[p for p in matches if '求导时，估计器的第' in p.get_text()]
        if len(matches)!=1:raise ValueError((name,key,len(matches),prefix))
        jobs.append((soup,matches[0],key,template))
        tex.update(MATH.findall(template))
    documents.append((name,soup))

js=r'''
const fs=require('fs');let k;
for(const n of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex']){
 if(n)try{k=require(n);break;}catch{}
}
if(!k)throw Error('KaTeX module unavailable');
const out={};for(const t of JSON.parse(fs.readFileSync(0,'utf8')))
 out[t]=k.renderToString(t,{output:'htmlAndMathml',throwOnError:true,strict:'error'});
process.stdout.write(JSON.stringify(out));
'''
r=subprocess.run(['node','-e',js],input=json.dumps(sorted(tex)),capture_output=True,text=True)
if r.returncode:raise RuntimeError(r.stderr)
rendered=json.loads(r.stdout)
for soup,node,key,template in jobs:
    notes=[deepcopy(x) for x in node.select('button.nref')]
    node.clear();node['data-prose-repair']=key
    start=0
    for match in MATH.finditer(template):
        node.append(BeautifulSoup(link_prose(template[start:match.start()]),'html.parser'))
        span=soup.new_tag('span',attrs={'class':'prose-formula','data-tex':match[1]})
        span.append(BeautifulSoup(rendered[match[1]],'html.parser'))
        node.append(span);start=match.end()
    node.append(BeautifulSoup(link_prose(template[start:]),'html.parser'))
    for note in notes:node.append(' ');node.append(note)

for name,soup in documents:
    (ROOT/name).write_text(str(soup))
    print(name,len(DATA[name]),'paragraph/caption repairs')
print(len(rendered),'complete expressions rendered with strict KaTeX')
