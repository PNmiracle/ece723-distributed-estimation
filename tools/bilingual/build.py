#!/usr/bin/env python3
"""Build aligned, native-text paper and Section III print source.

The two readers supply the paper paragraphs and identical numbered equations.
Stable heading/equation/table anchors align passages before individual paragraphs
are paired. translation_review.json records human-reviewed repairs, including
English omissions checked against the original paper. Bilingual reading guides
are separate from the original paper text at every heading level.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import copy
import html
import importlib.util
import json
import os
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
REVIEW = json.loads((HERE / 'translation_review.json').read_text())
GUIDES = json.loads((HERE / 'guides.json').read_text())
spec = importlib.util.spec_from_file_location('prose_math', ROOT / 'tools/math/typeset.py')
prose_math = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prose_math)


def events(filename):
    soup = BeautifulSoup((ROOT / filename).read_text(), 'html.parser')
    out = []
    for el in soup.select('.paper .sec-h,.paper .para,.paper figure.equation,.paper .refs'):
        classes = el.get('class', [])
        if 'sec-h' in classes:
            out.append(('heading', el.find_parent(class_='unit')['id'], el))
        elif 'equation' in classes:
            out.append(('equation', el['id'], el))
        elif 'refs' in classes:
            # Its child paragraphs are visited independently by the selector.
            out.append(('references', 'references-body', el))
        else:
            for node in el.find_all(recursive=False):
                if node.name == 'h4':
                    out.append(('heading', node['id'], node))
                elif node.name == 'table':
                    out.append(('table', 'paper-table-1', node))
                elif node.name == 'p':
                    out.append(('p', None, node))
    return soup, out


def groups(stream):
    out = {}; prev = 'paper-start'; paras = []
    for kind, ident, el in stream:
        if kind == 'p':
            paras.append(el)
        else:
            out[(prev, ident)] = paras
            prev, paras = ident, []
    out[(prev, 'paper-end')] = paras
    return out


def source_text(node):
    """Retain real TeX, never duplicate the KaTeX visual/MathML layers."""
    if isinstance(node, NavigableString):
        return str(node)
    classes = node.get('class', [])
    if node.name in {'button', 'script', 'style'} or any(c in classes for c in ['nref', 'term-en', 'term-zh']):
        return ''
    if node.get('data-tex') is not None:
        return '$' + node['data-tex'] + '$'
    if 'katex' in classes:
        a = node.select_one('annotation')
        tex = node.get('data-prose-tex') or (a.get_text() if a else None)
        if tex is None:
            raise ValueError('Inline math has no recoverable TeX')
        return '$' + tex + '$'
    text = ''.join(source_text(c) for c in node.children)
    if node.name in {'strong', 'b'}:
        return '**' + text + '**'
    if node.name in {'sup', 'sub'}:
        return ('^' if node.name == 'sup' else '_') + '{' + text + '}'
    return text


expressions = []
expression_ids = {}


def math_html(tex):
    if tex not in expression_ids:
        expression_ids[tex] = len(expressions)
        expressions.append(tex)
    return f'@@BILINGUAL_MATH_{expression_ids[tex]}@@'


def prose_html(text, language):
    text = re.sub(r'\s+', ' ', text).strip().replace('D ISTRIBUTED estimation', 'Distributed estimation')
    if language == 'zh':
        text = text.replace('转录', '通信记录').replace('条件乘积律', '条件乘积分布').replace('费舍尔信息', 'Fisher 信息')
        # The adjacent English column supplies terminology; remove repetitive glosses.
        text = re.sub(r'（[A-Za-z][A-Za-z -]{2,}）', '', text)
    # A few source fragments encode a base separately from its subscript.
    text = re.sub(r'([A-Za-z])\s*\$\{\}(_\{[^$]+?\}|_[A-Za-z0-9])\$', r'$\1\2$', text)
    parts = re.split(r'(\$[^$]+\$)', text)
    out = []
    for part in parts:
        if part.startswith('$') and part.endswith('$'):
            out.append(math_html(part[1:-1]))
        else:
            # Shared typography rules also cover legacy Unicode math in prose.
            for is_math, value in prose_math.chunks(part):
                if is_math:
                    out.append(math_html(value))
                else:
                    value = html.escape(value)
                    value = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', value)
                    value = re.sub(r'\((\d{1,3})\)', lambda m: f'<a class="eq-ref" href="#eq-{m[1]}">({m[1]})</a>' if 1 <= int(m[1]) <= 492 else m[0], value)
                    out.append(value)
    return ''.join(out)


def attr(text):
    return html.escape(text, quote=True)


def pair(ident, en, zh, classes='', level=None, chapter='', section=''):
    tag = f'h{level}' if level else 'p'
    return (f'<div id="{attr(ident)}" class="pair {classes}" data-chapter="{chapter}" data-section="{section}">'
            f'<div class="column english" lang="en"><{tag}>{prose_html(en,"en")}</{tag}></div>'
            f'<div class="column chinese" lang="zh-Hans"><{tag}>{prose_html(zh,"zh")}</{tag}></div></div>')


def guide_pair(ident, chapter, section):
    data = GUIDES[ident]
    columns = []
    for language, css, label in [('en', 'english', 'Plain-language guide'),
                                 ('zh', 'chinese', '通俗导读')]:
        sentences = ' '.join(data[language])
        columns.append(f'<div class="column {css}" lang="{language if language == "en" else "zh-Hans"}">'
                       f'<div class="guide-label">{label}</div><p>{prose_html(sentences,language)}</p></div>')
    return (f'<aside id="guide-{ident}" class="pair guide-pair" data-guide-for="{ident}" '
            f'data-chapter="{chapter}" data-section="{section}">'
            + ''.join(columns) + '</aside>')


ens, ene = events('reading-en.html')
zhs, zhe = events('reading.html')
en_anchors = [(k, i, n) for k, i, n in ene if k != 'p']
zh_anchors = [(k, i, n) for k, i, n in zhe if k != 'p']
assert [(k, i) for k, i, n in en_anchors] == [(k, i) for k, i, n in zh_anchors]
eg, zg = groups(ene), groups(zhe)
assert list(eg) == list(zg)
rows = []; headings = []; chapter = ''; section = ''; last = 'paper-start'; parent_subhead = False
pair_count = 0


def paragraphs(key):
    global pair_count
    ep = [source_text(n) for n in eg[key]]
    zp = [source_text(n) for n in zg[key]]
    fix = REVIEW.get(key[0], {})
    ep, zp = fix.get('en_all', ep), fix.get('zh_all', zp)
    for j, text in fix.get('en', {}).items(): ep[int(j)] = text
    for j, text in fix.get('zh', {}).items(): zp[int(j)] = text
    assert len(ep) == len(zp), (key, len(ep), len(zp))
    for j, (en, zh) in enumerate(zip(ep, zp)):
        assert en.strip() and zh.strip(), (key, j)
        rows.append(pair(f'pair-{key[0]}-{j+1}', en, zh, chapter=chapter, section=section))
        pair_count += 1


for (kind, ident, en), (_, _, zh) in zip(en_anchors, zh_anchors):
    paragraphs((last, ident))
    if kind == 'heading':
        if en.name in {'h2', 'h3'}:
            level = int(en.name[1]); section = ident; parent_subhead = False
            if level == 2: chapter = ident
        else:
            unit = en.find_parent(class_='unit')
            unit_level = int(unit.select_one('.sec-h').name[1])
            minor = 'minor' in en.get('class', [])
            level = (5 if minor and parent_subhead else 4) if unit_level == 3 else 3
            if not minor: parent_subhead = True
        et, zt = source_text(en), source_text(zh)
        headings.append({'id':ident,'level':level,'en':et,'zh':zt,'chapter':chapter})
        rows.append(pair(ident, et, zt, f'heading-pair heading-level-{level}', level, chapter, section))
        rows.append(guide_pair(ident, chapter, section))
    elif kind == 'equation':
        number = ident.split('-')[1]
        math = str(en.select_one('.math-source'))
        assert '<img' not in math and 'katex-mathml' in math
        rows.append(f'<figure class="equation" id="{ident}" data-chapter="{chapter}" data-section="{section}" aria-label="Equation {number}"><div class="equation-content">{math}<span class="eq-print-number">({number})</span></div><a class="equation-link" href="#{ident}" aria-label="Link to equation {number}">#</a></figure>')
    elif kind == 'table':
        tables = []
        for node, lang in [(en,'en'),(zh,'zh')]:
            node = copy.deepcopy(node)
            for cell in node.select('caption,th,td'):
                text = source_text(cell)
                cell.clear(); cell.append(BeautifulSoup(prose_html(text,lang),'html.parser'))
            tables.append(str(node))
        rows.append(f'<div class="pair table-pair" id="{ident}" data-chapter="{chapter}" data-section="{section}"><div class="column english" lang="en">{tables[0]}</div><div class="column chinese" lang="zh-Hans">{tables[1]}</div></div>')
    last = ident
paragraphs((last,'paper-end'))

# All mathematics is rendered once during the build, with accessible MathML.
renderer = r'''
const fs=require('fs');let katex;
for(const path of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex']){if(!path)continue;try{katex=require(path);break}catch{}}
if(!katex)throw Error('Set KATEX_MODULE to the KaTeX module path');
const result=JSON.parse(fs.readFileSync(0,'utf8')).map(tex=>katex.renderToString(tex,{output:'htmlAndMathml',throwOnError:true,strict:'error'}));
process.stdout.write(JSON.stringify(result));
'''
result = subprocess.run(['node','-e',renderer],input=json.dumps(expressions),text=True,capture_output=True)
if result.returncode: raise RuntimeError(result.stderr)
rendered = json.loads(result.stdout)


def substitute(text):
    return re.sub(r'@@BILINGUAL_MATH_(\d+)@@',lambda m:rendered[int(m[1])],text)


rows = [substitute(r) for r in rows]
assert len(headings) == 85
assert {h['id'] for h in headings} == set(GUIDES), 'Every heading needs exactly one bilingual guide'
assert pair_count == 766

# Build a real tree, so proof steps live beneath their containing subsection.
tree=[]; stack=[]
for h in headings:
    h = dict(h,children=[])
    while stack and stack[-1]['level'] >= h['level']: stack.pop()
    (stack[-1]['children'] if stack else tree).append(h)
    stack.append(h)


def toc(nodes):
    out=[]
    for h in nodes:
        children=h['children']
        en=re.sub(r'\*\*|\$', '', h['en']);zh=re.sub(r'\*\*|\$', '',h['zh'])
        out.append(f'<details class="toc-node toc-l{h["level"]}{"" if children else " toc-leaf"}"'+(' open' if h['level']==2 else '')+f'><summary><a href="#{h["id"]}"><span class="toc-en">{html.escape(en)}</span><span class="toc-zh">{html.escape(zh)}</span></a></summary>')
        if children:out.append('<div class="toc-children">'+toc(children)+'</div>')
        out.append('</details>')
    return ''.join(out)


katex_css=ens.find('style').get_text()
title_en='Communication-Constrained Parameter Estimation From Overlapping Samples'
title_zh='基于重叠样本的通信受限参数估计'
head='<!DOCTYPE html><html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title_en+' · 中英论文对照</title><style>'+katex_css+'</style>'
column_key='<div class="column-key"><span>ENGLISH · ORIGINAL PAPER</span><span>中文 · 对照译文</span></div>'
header='''<header class="topbar"><div class="bar-content"><div class="brand"><a href="index.html">⌂ 论文对照</a><small>英文正文 · 逐段对照 · 多级目录</small></div><div class="bar-tools"><form id="equation-jump"><label for="eq-input" data-en="Equation" data-zh="跳到公式">跳到公式</label><input id="eq-input" aria-label="Equation number" type="number" min="1" max="492" placeholder="1–492" required><button type="submit" data-en="Go" data-zh="跳转">跳转</button></form><a class="pdf-link" href="assets/downloads/ECE723_SectionIII_Bilingual.pdf" data-en="Section III PDF" data-zh="第三章对照 PDF">第三章对照 PDF</a><a class="pdf-link" href="assets/downloads/ECE723_SectionIV_Bilingual.pdf" data-en="Section IV PDF" data-zh="第四章对照 PDF">第四章对照 PDF</a><nav class="langsw" aria-label="Language view"><a href="?view=both" data-view="both">EN | 中</a><a href="?view=en" data-view="en">EN</a><a href="?view=zh" data-view="zh">中文</a></nav></div></div></header>'''
website=head+'<link rel="stylesheet" href="tools/bilingual/style.css"><link rel="stylesheet" href="tools/highlights/hl.css"></head><body>'+header+'<div class="layout"><aside class="sidebar"><details id="sections" open><summary data-en="Paper sections" data-zh="论文目录 · 展开子标题">论文目录 · 展开子标题</summary><nav>'+toc(tree)+'</nav></details></aside><main>'+column_key+substitute(pair('paper-title',title_en,title_zh,'title-pair'))+''.join(rows)+'</main></div><script src="tools/bilingual/reader.js"></script><script src="tools/highlights/hl.js" data-bilingual-notes></script></body></html>'
# The title contains no math, so rendering cannot introduce any new expression.
assert '@@BILINGUAL_MATH_' not in website
(ROOT/'bilingual.html').write_text(website)

print_script='''<script>document.fonts.ready.then(()=>{for(const host of document.querySelectorAll('.math-source')){const k=host.querySelector('.katex');if(!k)continue;const max=host.clientWidth;const width=k.getBoundingClientRect().width;if(width>max)host.style.fontSize=(Math.max(.65,max/width)*100)+'%';}for(const host of document.querySelectorAll('.column .katex')){const max=host.closest('.column').clientWidth;const width=host.getBoundingClientRect().width;if(width>max)host.style.fontSize=(max/width)+'em';}document.documentElement.dataset.printReady='true';});</script>'''
output=ROOT/'assets/downloads';output.mkdir(parents=True,exist_ok=True)
for chapter, roman, label, first, last, heading_count in [
    ('sec-iii', 'III', 'Converse / 下界证明', 73, 230, 28),
    ('sec-iv', 'IV', 'Achievability / 可达性与上界构造', 231, 365, 25),
]:
    section_rows=[r for r in rows if f'data-chapter="{chapter}"' in r]
    assert sum('class="equation"' in r for r in section_rows)==last-first+1
    assert sum('heading-pair' in r for r in section_rows)==heading_count
    assert sum('guide-pair' in r for r in section_rows)==heading_count
    meta=f'ECE 723 · Section {roman}: {label} · Equations ({first})–({last}) · English left / 中文右侧'
    print_html=head+'<style>'+(HERE/'style.css').read_text()+'</style></head><body><div class="layout"><main><div class="print-meta">'+meta+'</div>'+column_key+''.join(section_rows)+'</main></div>'+print_script+'</body></html>'
    (output/f'ECE723_Section{roman}_Bilingual.html').write_text(print_html)
(HERE/'build-report.json').write_text(json.dumps({'paragraph_pairs':pair_count,'native_equations':492,'heading_count':85,'bilingual_guides':len(GUIDES),'section_iii_equations':158,'section_iii_headings':28,'section_iii_guides':28,'section_iv_equations':135,'section_iv_headings':25,'section_iv_guides':25,'reviewed_anchor_groups':len(REVIEW),'inline_math_expressions':len(expressions)},indent=2)+'\n')
print((HERE/'build-report.json').read_text())
