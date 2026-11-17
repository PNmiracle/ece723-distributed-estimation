"""Typeset prose mathematics without touching the paper's displayed equations.

Usage: python3 tools/math/typeset.py file.html [file.html ...]
Set KATEX_MODULE to an installed KaTeX module if it is not on the Node path.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

from bs4 import BeautifulSoup, Comment, NavigableString

HERE = Path(__file__).resolve().parent
RULES = dict(line.split('\t', 1) for line in (HERE/'typography.tsv').read_text().splitlines()
             if line and not line.startswith('#'))
GREEK = dict(zip('αβγδεζηθϑικλμνξοπρστυφϕχψωΓΔΘΛΞΠΣΦΨΩℓ',
    [r'\alpha',r'\beta',r'\gamma',r'\delta',r'\varepsilon',r'\zeta',r'\eta',r'\theta',
     r'\vartheta',r'\iota',r'\kappa',r'\lambda',r'\mu',r'\nu',r'\xi',r'o',r'\pi',
     r'\rho',r'\sigma',r'\tau',r'\upsilon',r'\varphi',r'\phi',r'\chi',r'\psi',r'\omega',
     r'\Gamma',r'\Delta',r'\Theta',r'\Lambda',r'\Xi',r'\Pi',r'\Sigma',r'\Phi',r'\Psi',r'\Omega',r'\ell']))
PATTERN = re.compile(r'(?<![A-Za-z0-9])(?:'+'|'.join(re.escape(k) for k in sorted(RULES,key=len,reverse=True))+r')(?![A-Za-z0-9])')
SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀ','0123456789-+T')
SUB = str.maketrans('₀₁₂₃₄₅₆₇₈₉₋₊','0123456789-+')
MATH_WORD = re.compile(r'(?<![A-Za-z])(?:[A-Za-zα-ωΑ-Ωϑϕℓ]+(?:[₀-₉]+|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀ]+)|[α-ωΑ-Ωϑϕℓ]+[A-Za-z0-9]*)(?:′)?')


def unicode_tex(text):
    text=re.sub(r'([A-Za-z])̄',r'\\overline{\1}',text)
    text=re.sub(r'([A-Za-z])̂',r'\\widehat{\1}',text)
    text=re.sub(r'[₀-₉₋₊]+',lambda m:'_{'+m[0].translate(SUB)+'}',text)
    text=re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀ]+',lambda m:'^{'+m[0].translate(SUP)+'}',text)
    text=''.join(GREEK.get(c,c)+' ' if c in GREEK else c for c in text)
    return text.replace('−','-').replace('′',"'").replace('ᵀ',r'^{\mathsf T}')


def chunks(text):
    """Non-overlapping explicit rules first; Unicode math tokens fill the gaps."""
    out=[];cursor=0
    for m in PATTERN.finditer(text):
        out.extend(unicode_chunks(text[cursor:m.start()]))
        out.append((True,RULES[m[0]]));cursor=m.end()
    out.extend(unicode_chunks(text[cursor:]))
    return out


def unicode_chunks(text):
    out=[];cursor=0
    for m in MATH_WORD.finditer(text):
        if m.start()>cursor:out.append((False,text[cursor:m.start()]))
        out.append((True,unicode_tex(m[0])));cursor=m.end()
    if cursor<len(text):out.append((False,text[cursor:]))
    return out


def protected(node):
    for p in node.parents:
        if p.name in {'script','style','svg','math','code','annotation'} or 'katex' in p.get('class',[]):
            return True
    return False


def symbol_tex(node):
    if isinstance(node,NavigableString):return unicode_tex(str(node))
    inner=''.join(symbol_tex(c) for c in node.children)
    if node.name=='sub':return '_{'+inner+'}'
    if node.name=='sup':return '^{'+inner+'}'
    return inner


def html_powers(soup):
    """Keep an HTML superscript/subscript attached to its mathematical base."""
    for container in soup.select('figcaption,.sym-v'):
        for tag in list(container.select('sup,sub')):
            if not tag.parent or protected(tag) or tag.find_parent(['sup','sub']):continue
            prev=tag.previous_sibling
            if not isinstance(prev,NavigableString):continue
            match=re.search(r'([A-Za-z0-9α-ωΑ-Ωϑϕℓ]+)$',str(prev))
            if not match:continue
            prefix=str(prev)[:match.start()]
            tex=unicode_tex(match[0])+symbol_tex(tag)
            placeholder=soup.new_tag('span',attrs={'class':'html-math-source','data-latex':tex})
            prev.replace_with(NavigableString(prefix))
            tag.replace_with(placeholder)
            while True:
                nxt=placeholder.next_sibling
                if getattr(nxt,'name',None) in {'sub','sup'}:
                    tex+=symbol_tex(nxt);nxt.extract()
                elif isinstance(nxt,NavigableString) and re.fullmatch(r'[A-Zα-ωΑ-Ωϑϕℓ]+',str(nxt)):
                    tex+=unicode_tex(str(nxt));nxt.extract()
                else:break
            placeholder['data-latex']=tex


def process(paths):
    def displayed(soup):
        return [(e.get('id'),str(e.select_one('.math-source') or e.select_one('.katex')))
                for e in soup.select('.equation')]
    documents=[];equations={};tasks=[];expressions=set()
    for path in paths:
        soup=BeautifulSoup(path.read_text(),'html.parser')
        equations[path]=displayed(soup)
        html_powers(soup)
        for node in soup.select('.html-math-source'):
            tex=node['data-latex'];expressions.add(tex);tasks.append((node,[(True,tex)],True))
        # New supplemental symbol keys have HTML subscripts, unlike the original keys.
        for node in soup.select('.sym-k'):
            if not node.select_one('.katex,math'):
                tex=symbol_tex(node).strip()
                if tex:
                    expressions.add(tex);tasks.append((node,[(True,tex)],True))
        keys={id(n) for n,_,_ in tasks}
        for node in list(soup.find_all(string=True)):
            if isinstance(node,Comment) or not str(node).strip() or protected(node):continue
            if any(id(p) in keys for p in node.parents):continue
            parts=chunks(str(node))
            if any(is_math for is_math,_ in parts):
                expressions.update(value for is_math,value in parts if is_math)
                tasks.append((node,parts,False))
        documents.append((path,soup))
    renderer=r'''
const fs=require('fs');
let katex;
for(const name of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex']){
 if(!name)continue;try{katex=require(name);break;}catch(e){}
}
if(!katex)throw Error('KaTeX module unavailable');
const result={};
for(const tex of JSON.parse(fs.readFileSync(0,'utf8'))){
 result[tex]=katex.renderToString(tex,{output:'html',throwOnError:true,strict:'error'});
}
process.stdout.write(JSON.stringify(result));
'''
    result=subprocess.run(['node','-e',renderer],input=json.dumps(sorted(expressions)),capture_output=True,text=True)
    if result.returncode:raise RuntimeError(result.stderr)
    rendered=json.loads(result.stdout)
    for node,parts,is_key in tasks:
        host=documents[0][1].new_tag('span',attrs={'class':'typeset-prose'})
        for is_math,value in parts:
            if is_math:
                math=BeautifulSoup(rendered[value],'html.parser')
                math.select_one('.katex')['data-prose-tex']=value
                host.append(math)
            else:host.append(NavigableString(value))
        if is_key:
            node.clear();node.append(host)
        else:node.replace_with(host)
    css='''
.typeset-prose{display:inline}
.typeset-prose>.katex{font-size:1.02em;white-space:nowrap}
.proof-step{display:block}
.proof-step .typeset-prose>.katex{font-size:1.03em}
.formula-prelude .katex{font-size:1em}
'''
    for path,soup in documents:
        existing=soup.select_one('#prose-math-typography')
        if existing:existing.decompose()
        style=soup.new_tag('style',id='prose-math-typography');style.string=css;soup.head.append(style)
        # Main displayed equations are an invariant, not a typography-editing target.
        assert displayed(soup)==equations[path],path
        path.write_text(str(soup))
        print(path.name,len(soup.select('[data-prose-tex]')),'typeset prose expressions')
    print(len(rendered),'distinct mathematical expressions rendered without errors')


if __name__=='__main__':
    process([Path(p) for p in sys.argv[1:]])
