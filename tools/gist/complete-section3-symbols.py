"""Repeat complete expressions, component definitions and bilingual readings per formula."""
from collections import defaultdict
from pathlib import Path
import json
import re
import subprocess

from bs4 import BeautifulSoup

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]

def rows(name, count):
    result=[]
    for line in (HERE/name).read_text().splitlines():
        if not line.strip():continue
        row=line.split('\t');assert len(row)==count,(name,row)
        assert all(part.strip() for part in row),(name,row)
        result.append(row)
    return result

readings={key:(en,zh) for key,en,zh in rows('section3_symbol_readings.tsv',3)}
definitions={key:(tex,en,zh,*readings[key]) for key,tex,en,zh in rows('section3_symbols.tsv',4)}
assert definitions.keys()==readings.keys()
mapping={int(n):keys.split() for n,keys in rows('section3_symbol_map.tsv',2)}
left={int(n):tuple(body) for n,*body in rows('section3_lhs.tsv',6)}
compounds=defaultdict(list)
for n,*body in rows('section3_compounds.tsv',6):compounds[int(n)].append(tuple(body))
assert set(mapping)==set(left)==set(range(73,231))
assert all(len(keys)>=2 and len(keys)==len(set(keys)) and set(keys)<=definitions.keys() for keys in mapping.values())
assert compounds.keys()<=mapping.keys()

def canonical(tex):
    tex=re.sub(r'\\(?:left|right|bigl|bigr|Bigl|Bigr|big|Big|quad|qquad)\b','',tex)
    tex=tex.replace(r'\mid','|').replace(r'\middle|','|')
    return re.sub(r'[\s{}]','',tex)

# Check that the reviewed first entry really is the complete printed left side.
def printed_left(tex):
    s=re.sub(r'\\(?:begin|end)\{(?:aligned|gathered)\}','',tex).replace('&','').replace(r'\\',' ')
    depth=0;i=0
    while i<len(s):
        if s[i]=='\\':
            m=re.match(r'\\(?:preceq|gtrsim|lesssim|leq?|geq?)(?![A-Za-z])',s[i:])
            if m and depth==0:return s[:i].strip()
            if s[i:i+2] in [r'\{',r'\}']:
                depth+=1 if s[i+1]=='{' else -1;i+=2;continue
            m=re.match(r'\\[A-Za-z]+|\\.',s[i:]);i+=len(m[0]) if m else 1;continue
        c=s[i]
        if depth==0 and (s[i:i+2]==':=' or c=='='):return s[:i].strip()
        if c in '{[(':depth+=1
        if c in '}])':depth-=1
        i+=1
    return s.strip().rstrip('.,')

INLINE=re.compile(r'\$([^$]+)\$')
EXPR_WORDS={'A_q':r'A_q','A_i':r'A_i','S_T':r'S_T','q_i':r'q_i','V_i':r'V_i','mu_E':r'\mu_E','h_T':r'h_T','d/m':r'd/m','R=r':r'R=r','t=2/(Ax)':r't=\frac2{Ax}','t=2d/(AmD)':r't=\frac{2d}{AmD}','t=d/(mD)':r't=\frac d{mD}'}
def format_meaning(text):
    pattern='|'.join(re.escape(x) for x in sorted(EXPR_WORDS,key=len,reverse=True))+r'|\b[A-Za-z]_[A-Za-z]\b'
    return ''.join('$'+part+'$' if i%2 else re.sub(pattern,lambda m:'$'+EXPR_WORDS.get(m[0],m[0])+'$',part) for i,part in enumerate(INLINE.split(text)))

all_rows=list(definitions.values())+list(left.values())+[row for group in compounds.values() for row in group]
tex=sorted({row[0] for row in all_rows}|{t for row in all_rows for text in row[1:3] for t in INLINE.findall(format_meaning(text))})
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

CSS='''
html[lang] .plain-syms[data-self-contained]{display:block;padding:12px 15px;font-size:calc(.9rem * var(--reader-scale,1));min-width:0}
html[lang=en] .plain-syms[data-self-contained]{font-size:.95em}
.symbol-repeat-note{display:block;font-size:.86em;color:#52665c;line-height:1.6;margin:3px 0 10px}
.symbol-section-label{display:block;font-size:.82em;font-weight:700;color:#466052;margin:12px 0 3px}
.symbol-entry{display:grid;grid-template-columns:minmax(80px,27%) minmax(0,1fr);gap:6px 14px;padding:9px 0;border-top:1px solid #dce8e1;min-width:0;align-items:start}
html[lang] .plain-syms .symbol-entry>.sym-k{display:block;text-align:left;white-space:nowrap;max-width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;padding:3px 0 5px}
html[lang] .plain-syms .symbol-entry>.sym-v{display:block;min-width:0;overflow-wrap:anywhere;line-height:1.65}
.symbol-entry.symbol-compound,.symbol-entry.symbol-wide{display:block}
.symbol-compound>.sym-k,.symbol-wide>.sym-k{margin-bottom:3px}
.symbol-overall{display:block;background:#eaf5ef;border:1px solid #b6d4c3;border-left:4px solid #297756;border-radius:6px;padding:11px 13px;margin:8px 0 12px}
.symbol-role{display:block;font-size:.82em;font-weight:700;color:#245b42;margin-bottom:5px}
.symbol-overall>.sym-k{font-size:1.08em;margin:3px 0 6px}
html[lang] .plain-syms .sym-say{display:block;white-space:normal;font-size:.86em;line-height:1.6;color:#455a66;margin-top:5px;overflow-wrap:anywhere}
.sym-say-en,.sym-say-zh{display:block}.sym-say b{font-weight:650;color:#385365}
@media(max-width:640px){html[lang] .plain-syms[data-self-contained]{padding:10px 11px}.symbol-entry{grid-template-columns:minmax(0,1fr);gap:2px;padding:10px 0}.symbol-overall{padding:9px 10px}.symbol-entry>.sym-k{margin-bottom:2px}}
@media print{.symbol-entry,.symbol-overall{break-inside:avoid}.symbol-overall{background:#f4f4f4;border-color:#777}.sym-say{color:#333}}
'''

for name,lang in [('reading.html','zh'),('reading-en.html','en')]:
    path=ROOT/name;soup=BeautifulSoup(path.read_text(),'html.parser');zh=lang=='zh'
    before=[str(e.select_one('.katex')) for e in soup.select('.equation')]
    equations={int(e['id'][3:]):e for e in soup.select('figure.equation[id]')}
    total=0
    for n,keys in mapping.items():
        equation=equations[n];aside=equation.find_next_sibling('aside',class_='plain');assert aside is not None,n
        sheet=aside.select_one('.plain-syms');assert sheet is not None,n
        if n not in [153,173]:assert canonical(left[n][0])==canonical(printed_left(equation.select_one('annotation').get_text())),n
        sheet.clear();sheet['data-self-contained']='true';sheet['data-complete-readings']='true'
        title=soup.new_tag('span',attrs={'class':'plain-sub'});title.string='4. 符号与读法 · 本式完整' if zh else '4. Symbols and readings · this equation';sheet.append(title)
        note=soup.new_tag('span',attrs={'class':'symbol-repeat-note'});note.string='先读左侧整体，再逐项拆开；每项都重复给出中英文读法。' if zh else 'Start with the complete left side, then unpack its parts. Both readings repeat under every entry.';sheet.append(note)
        seen=set()
        def add(key,body,kind):
            tex,enmeaning,zhmeaning,enread,zhread=body
            canon=canonical(tex)
            if canon in seen:return False
            seen.add(canon)
            classes=['symbol-entry','symbol-'+kind]
            if kind=='atom' and len(tex)>26:classes.append('symbol-wide')
            row=soup.new_tag('span',attrs={'class':classes})
            if kind=='overall':
                label=soup.new_tag('span',attrs={'class':'symbol-role','data-hl-ui':''})
                label.string=('左侧整体 · 接前文' if zh else 'Complete left side · continued') if n==153 else ('本式第一条约束' if zh else 'First constraint') if n==173 else ('本式整体量' if zh else 'Complete expression') if n==213 else ('左侧整体' if zh else 'Complete left-hand expression')
                row.append(label)
            k=soup.new_tag('span',attrs={'class':'sym-k','data-symbol':key});k.append(BeautifulSoup(rendered[tex],'html.parser'));row.append(k)
            v=soup.new_tag('span',attrs={'class':'sym-v'})
            meaning=format_meaning(zhmeaning if zh else enmeaning);start=0
            for match in INLINE.finditer(meaning):
                v.append(meaning[start:match.start()]);v.append(BeautifulSoup(rendered[match[1]],'html.parser'));start=match.end()
            v.append(meaning[start:])
            say=soup.new_tag('span',attrs={'class':'sym-say'})
            for cls,label,text,readlang in [('sym-say-en','EN · ',enread,'en'),('sym-say-zh','中 · ',zhread,'zh-Hans')]:
                voice=soup.new_tag('span',attrs={'class':cls,'lang':readlang});b=soup.new_tag('b');b.string=label;voice.append(b);voice.append(text);say.append(voice)
            v.append(say);row.append(v);sheet.append(row)
            return True
        total+=add('whole-lhs',left[n],'overall')
        for j,body in enumerate(compounds[n]):total+=add('compound-'+str(j),body,'compound')
        label=soup.new_tag('span',attrs={'class':'symbol-section-label','data-hl-ui':''});label.string='逐项拆开 · 基本符号与运算' if zh else 'Unpack the symbols and operations';sheet.append(label)
        # Full contextual entropy/information expressions above replace ambiguous bare abbreviations.
        for key in keys:
            if key in ['Htheta','H','I','hpost'] and any(re.match(r'(?:H|h|I)(?:_|\()',row[0]) for row in compounds[n]):continue
            total+=add(key,definitions[key],'atom')
        assert sheet.select_one('[data-symbol]')['data-symbol']=='whole-lhs'
        assert len(sheet.select('.sym-k'))==len(sheet.select('.sym-say-en'))==len(sheet.select('.sym-say-zh'))
    assert [str(e.select_one('.katex')) for e in soup.select('.equation')]==before
    old=soup.select_one('#self-contained-symbol-style')
    if old:old.decompose()
    style=soup.new_tag('style',id='self-contained-symbol-style');style.string=CSS;soup.head.append(style)
    path.write_text(str(soup));print(name,'158 complete-left expressions;',total,'definitions, each with Chinese and English reading')
