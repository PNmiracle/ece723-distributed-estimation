"""Give every Section III equation its own complete, repeated symbol definitions."""
from pathlib import Path
import json
import re
import subprocess

from bs4 import BeautifulSoup

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
definitions={}
for line in (HERE/'section3_symbols.tsv').read_text().splitlines():
    if line.strip():
        key,tex,en,zh=line.split('\t');assert key not in definitions,key
        definitions[key]=(tex,en,zh)
mapping={int(n):keys.split() for n,keys in (l.split('\t',1) for l in (HERE/'section3_symbol_map.tsv').read_text().splitlines())}
assert set(mapping)==set(range(73,231))
assert all(len(keys)>=2 and set(keys)<=definitions.keys() for keys in mapping.values())
tex=sorted({definitions[key][0] for keys in mapping.values() for key in keys})
js=r'''
const fs=require('fs');let k;
for(const n of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex'])if(n)try{k=require(n);break}catch{}
if(!k)throw Error('KaTeX module unavailable');const out={};
for(const t of JSON.parse(fs.readFileSync(0,'utf8')))out[t]=k.renderToString(t,{output:'htmlAndMathml',throwOnError:true,strict:'error'});
process.stdout.write(JSON.stringify(out));
'''
r=subprocess.run(['node','-e',js],input=json.dumps(tex),capture_output=True,text=True)
if r.returncode:raise RuntimeError(r.stderr)
rendered=json.loads(r.stdout)
for name,lang in [('reading.html','zh'),('reading-en.html','en')]:
    path=ROOT/name;soup=BeautifulSoup(path.read_text(),'html.parser')
    before=[str(e.select_one('.katex')) for e in soup.select('.equation')]
    equations={int(e['id'][3:]):e for e in soup.select('figure.equation[id]')}
    total=0
    for n,keys in mapping.items():
        equation=equations[n];aside=equation.find_next_sibling('aside',class_='plain')
        assert aside is not None,n
        sheet=aside.select_one('.plain-syms');assert sheet is not None,n
        sheet.clear();sheet['data-self-contained']='true'
        title=soup.new_tag('span',attrs={'class':'plain-sub'})
        title.string='符号速查 · 本式逐项' if lang=='zh' else 'Symbol cheat sheet · this equation';sheet.append(title)
        note=soup.new_tag('span',attrs={'class':'symbol-repeat-note'})
        note.string='逐式重复定义，便于独立阅读。' if lang=='zh' else 'Repeated here so this formula can stand alone.';sheet.append(note)
        for key in keys:
            tex,en,zh=definitions[key]
            k=soup.new_tag('span',attrs={'class':'sym-k','data-symbol':key});k.append(BeautifulSoup(rendered[tex],'html.parser'))
            v=soup.new_tag('span',attrs={'class':'sym-v'});v.string=zh if lang=='zh' else en
            sheet.append(k);sheet.append(v);total+=1
    assert [str(e.select_one('.katex')) for e in soup.select('.equation')]==before
    old=soup.select_one('#self-contained-symbol-style')
    if old:old.decompose()
    style=soup.new_tag('style',id='self-contained-symbol-style')
    style.string='.symbol-repeat-note{grid-column:1/-1;font-size:.82em;color:#52665c;line-height:1.5;margin:0 0 5px}.plain-syms[data-self-contained] .sym-v{line-height:1.65}.plain-syms[data-self-contained] .sym-k{align-self:start;padding-top:.12em}'
    soup.head.append(style);path.write_text(str(soup));print(name,'158 self-contained symbol sheets;',total,'repeated definitions')
