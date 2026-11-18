"""Add localized proof maps, symbol definitions, and overview links to the readers."""
from bisect import bisect_right
from collections import Counter
from html import escape
from pathlib import Path
import re

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ASIDE = re.compile(
    r'(<aside class="plain"[^>]*>\s*<span class="plain-tag">'
    r'(?:人话 · 式|In plain words · Eq\.) \((\d+)\)</span>)(.*?)(</aside>)',
    re.S,
)
CSS = '''
.proof-map{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr);gap:.35rem;margin:0;padding:0;list-style:none;align-items:stretch}
.proof-step{display:flex;align-items:center;justify-content:center;text-align:center;min-width:0;padding:.45rem .35rem;border:1px solid #bcccdc;border-radius:6px;background:#edf4fa;color:#23435c;font:inherit;font-size:.88em;line-height:1.3;overflow-wrap:anywhere}
.proof-step.current{background:#dbf2e9;border-color:#438573;color:#123e32;font-weight:700}
.proof-arrow{align-self:center;color:#587086;font-weight:700}
.overview-resources{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .8rem;margin:.6rem 0 .9rem}
.overview-resources a{color:#195d73;text-underline-offset:.15em}
.overview-resources .pdf-download{display:inline-block;padding:.25rem .55rem;border:1px solid #84b4bd;border-radius:5px;background:#eaf7fb;font-weight:650}
.plain-syms .sym-k,.plain-syms .sym-v{min-width:0;overflow-wrap:anywhere}
.plain-syms .sym-k{max-width:100%;overflow-x:auto}
@media(min-width:641px){.plain-syms{grid-template-columns:fit-content(35%) minmax(0,1fr)}}
@media(max-width:480px){
  .proof-map{grid-template-columns:minmax(0,1fr);gap:.12rem}
  .proof-arrow{justify-self:center;transform:rotate(90deg);line-height:1}
}
'''
SECTIONS = [
    ('sec-i', 'Introduction', '引言'),
    ('sec-ii', 'Model and results', '模型与结果'),
    ('sec-iii', 'Converse', '下界'),
    ('sec-iv', 'Achievability', '上界'),
    ('sec-v', 'Examples', '示例'),
    ('sec-vi', 'Discussion', '讨论'),
    ('appendix', 'Appendix', '附录'),
]


def rows(name, lang):
    suffix = '.zh' if lang else ''
    return [line.split('|') for line in (HERE / f'{name}{suffix}.txt').read_text().splitlines()]


def key_text(value):
    return re.sub(r'[\s\u200b\u2061]+', '', value)


def proof_map(steps, lang):
    arrows = '<li class="proof-arrow" aria-hidden="true">›</li>'
    boxes = []
    for i, label in enumerate(steps):
        attributes = 'class="proof-step current" aria-current="step"' if i == 1 else 'class="proof-step"'
        boxes.append(f'<li {attributes}>{escape(label)}</li>')
    caption = ('How this equation fits into the proof.', '这条公式在证明中的作用。')[lang]
    return f'<!--structure--><figure class="eq-fig eq-structure"><ol class="proof-map">{arrows.join(boxes)}</ol><figcaption>{caption}</figcaption></figure><!--/structure-->'


def supplement(eq, plain, glossary):
    sheet = plain.select_one('.plain-syms')
    if sheet is None:
        return ''
    math = eq.select_one('.katex-mathml')
    atoms = {key_text(atom.get_text()) for atom in math.select('mi,msub,msubsup,msup')}
    known = {key_text(key.get_text()) for key in sheet.select('.sym-k')}
    matches = [(display, meaning) for first, last, needle, display, meaning in glossary
               if first <= int(eq['id'][3:]) <= last and needle in atoms and needle not in known]
    if not matches:
        return ''
    pairs = ''.join(f'<span class="sym-k"><i>{display}</i></span><span class="sym-v">{meaning}</span>'
                    for display, meaning in matches[:2])
    return f'<!--study-symbols-->{pairs}<!--/study-symbols-->'


def build(html, lang):
    for marker in ('structure', 'study-symbols', 'study-links'):
        html = re.sub(rf'<!--{marker}-->.*?<!--/{marker}-->', '', html, flags=re.S)
    html = re.sub(r'<style id="structure-diagrams">.*?</style>\n?', '', html, flags=re.S)
    soup = BeautifulSoup(html, 'html.parser')
    routes = rows('proof_steps', lang)
    starts = [int(row[0]) for row in routes]
    assert starts == [int(row[0]) for row in rows('proof_steps', 0)]
    assert starts == sorted(set(starts))
    focus = dict(rows('proof_spotlights', lang))
    assert focus.keys() == dict(rows('proof_spotlights', 0)).keys()
    gloss = rows('print_glossary', 0)
    meaning = ([x[0] for x in rows('print_glossary', 1)] if lang else [x[-1] for x in gloss])
    assert len(gloss) == len(meaning)
    glossary = [(int(first), int(last), needle, label, definition)
                for (first, last, needle, label, _), definition in zip(gloss, meaning)]

    figures, symbols = {}, {}
    existing = 0
    for eq in soup.select('figure.equation[id^="eq-"]'):
        n = eq['id'][3:]
        plain = eq.find_next_sibling(class_='plain')
        symbols[n] = supplement(eq, plain, glossary)
        if plain.select_one('.eq-fig'):
            existing += 1
            continue
        route = routes[bisect_right(starts, int(n)) - 1][1:]
        route[1] = focus.get(n, route[1])
        figures[n] = proof_map(route, lang)
    assert len(figures) + existing == 492

    seen = Counter()
    def insert(match):
        opened, n, body, closed = match.groups()
        seen[n] += 1
        if symbols[n]:
            body, count = re.subn(
                r'(<span class="plain-syms">\s*<span class="plain-sub">[^<]*</span>)',
                lambda part: part.group(0) + symbols[n], body, count=1)
            assert count == 1, n
        if n in figures:
            assert '<!--/gist-->' in body, n
            body = body.replace('<!--/gist-->', '<!--/gist-->' + figures[n], 1)
        return opened + body + closed
    html = ASIDE.sub(insert, html)
    assert len(seen) == 492 and all(v == 1 for v in seen.values())

    download = ('Download black-and-white PDF', '下载黑白打印 PDF')[lang]
    mono_download = ('Section III · black-and-white speaker PDF', '第三节 · 黑白演讲稿 PDF')[lang]
    color_download = ('Section III · color speaker PDF', '第三节 · 彩色演讲稿 PDF')[lang]
    label = ('Jump to section', '跳到章节')[lang]
    links = ''.join(f'<a href="#{anchor}">{item[lang]}</a>' for anchor, *item in SECTIONS)
    block = (f'<!--study-links--><nav class="overview-resources" aria-label="{label}">'
             f'<a class="pdf-download" href="assets/downloads/ECE723_Equations_Monochrome.pdf" download>{download}</a>'
             f'<a class="pdf-download" href="assets/downloads/ECE723_Converse_Color_Speaker.pdf" download>{color_download}</a>'
             f'<a class="pdf-download" href="assets/downloads/ECE723_Converse_Monochrome_Speaker.pdf" download>{mono_download}</a>'
             f'{links}</nav><!--/study-links-->')
    html, changed = re.subn(r'(<section class="overview" id="overview">\s*<h2[^>]*>[^<]+</h2>)',
                            lambda m: m.group(0) + block, html, count=1)
    assert changed == 1
    if not lang:
        html = html.replace('<b>Interaction does not help</b>',
                           '<b>When the bounds match, interaction does not improve the rate</b>')
    return html.replace('</head>', f'<style id="structure-diagrams">{CSS}</style>\n</head>'), len(figures), existing


if __name__ == '__main__':
    for name, lang in [('reading.html', 1), ('reading-en.html', 0)]:
        page = ROOT / name
        result, added, existing = build(page.read_text(), lang)
        page.write_text(result)
        print(f'{name}: {existing} equations with original illustrations, {added} with proof maps')
