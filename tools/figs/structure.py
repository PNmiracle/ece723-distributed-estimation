"""Fill missing equation illustrations in both reading pages using their MathML.

Run after the hand-drawn SVG injector. Each original design stays in place.
"""
from collections import Counter
from html import escape
from pathlib import Path
import re

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
RELATIONS = {
    '=': ('Equal', '相等'), '≔': ('Definition', '定义'),
    ':=': ('Definition', '定义'), '≡': ('Identity', '恒等'),
    '≤': ('Upper bound', '上界'), '<': ('Strict upper bound', '严格上界'),
    '≥': ('Lower bound', '下界'), '>': ('Strict lower bound', '严格下界'),
    '≲': ('Upper bound up to a constant', '常数倍上界'),
    '≳': ('Lower bound up to a constant', '常数倍下界'),
    '≍': ('Same order', '同阶'), '≈': ('Approximation', '近似'),
    '≪': ('Smaller scale', '更小的量级'), '≫': ('Larger scale', '更大的量级'),
    '∈': ('Membership', '所属集合'), '⊂': ('Subset', '子集'), '⊆': ('Subset', '子集'),
    '→': ('Limit', '极限'), '⟶': ('Limit', '极限'), '∼': ('Distribution or equivalence', '分布或渐近关系'),
    '⇒': ('Implication', '推出'), '⇔': ('Equivalence', '等价'),
    '≠': ('Distinct quantities', '不相等'),
}
FEATURES = [
    ('mfrac', ('Ratio: numerator over denominator', '比值：分子除以分母')),
    ('msqrt', ('Square root', '平方根')),
    ('munderover', ('Indexed operation', '按指标运算')),
    ('msubsup', ('Indexed term or operation', '带指标的项或运算')),
    ('msup', ('Power or superscript', '幂或上标')),
]

CSS = '''
.eq-structure{padding:6px 8px}
.structure-rows{display:grid;gap:4px}
.structure-row{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:4px;align-items:center}
.structure-row.single{grid-template-columns:minmax(0,1fr)}
.structure-cell{display:block;min-width:0;text-align:center;border:1px solid #adb9b8;border-radius:5px;padding:2px 3px;overflow-x:auto}
.structure-cell math{display:inline-block;font-size:1em}
.structure-link{text-align:center;line-height:1.15}
.structure-link b{display:block;color:#135f5e;font-size:1.18em}
.structure-role{display:block;font:650 .67em/1.15 system-ui,sans-serif;color:#343b3b}
'''

def direct(node):
    return node.find_all(recursive=False)


def unwrap(nodes):
    while len(nodes) == 1 and nodes[0].name in {'mrow', 'mstyle'}:
        nodes = direct(nodes[0])
    return nodes


def math(nodes):
    return '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>' + ''.join(map(str,nodes)) + '</mrow></math>'


def row_nodes(root):
    if root.name != 'mtable':
        yield unwrap([root])
        return
    for tr in direct(root):
        yield [node for td in direct(tr) for node in unwrap(direct(td))]


def clauses(nodes):
    """Split only at commas outside visible pairs of delimiters."""
    depth = 0
    start = 0
    for i, node in enumerate(nodes):
        if node.name != 'mo':
            continue
        symbol = node.get_text(strip=True)
        if symbol in {'(', '[', '{', '⟨'}:
            depth += 1
        elif symbol in {')', ']', '}', '⟩'}:
            depth = max(0, depth - 1)
        elif symbol in {',', ';'} and depth == 0:
            yield nodes[start:i]
            start = i + 1
    yield nodes[start:]


def comparisons(nodes, carry):
    depth = 0
    start = 0
    left = None
    relation = None
    i = 0
    while i < len(nodes):
        node = nodes[i]
        token = node.get_text(strip=True) if node.name == 'mo' else ''
        if token in {'(', '[', '{', '⟨'}:
            depth += 1
        elif token in {')', ']', '}', '⟩'}:
            depth = max(0, depth - 1)
        step = 1
        if token == ':' and i + 1 < len(nodes) and nodes[i + 1].get_text(strip=True) == '=':
            token = ':='
            step = 2
        if depth == 0 and token in RELATIONS:
            current = nodes[start:i]
            if left and current:
                yield left, relation, current
            if not any(node.get_text(strip=True) for node in current):
                current = carry if start == 0 else []
            left, relation, start = current, token, i + step
        i += step
    if left and start < len(nodes):
        yield left, relation, nodes[start:]


def diagram(root, lang, caption):
    rows = []
    carry = []
    for nodes in row_nodes(root):
        for clause in clauses(nodes):
            for left, op, right in comparisons(clause, carry):
                carry = right
                role = RELATIONS[op][lang]
                rows.append(f'<div class="structure-row"><span class="structure-cell">{math(left)}</span>'
                            f'<span class="structure-link"><b>{escape(op)}</b><small class="structure-role">{role}</small></span>'
                            f'<span class="structure-cell">{math(right)}</span></div>')
    if not rows:
        for name, label in FEATURES:
            feature = root.find(name)
            if feature is not None:
                rows.append(f'<div class="structure-row single"><span class="structure-cell">'
                            f'<small class="structure-role">{label[lang]}</small>{math([feature])}</span></div>')
                break
    if not rows:
        label = ('Expression to read', '读式重点')[lang]
        rows.append(f'<div class="structure-row single"><span class="structure-cell">'
                    f'<small class="structure-role">{label}</small>{math([root])}</span></div>')
    return ('<!--structure--><figure class="eq-fig eq-structure"><div class="structure-rows">'
            + ''.join(rows) + '</div><figcaption>' + caption + '</figcaption></figure><!--/structure-->')


def build(html, lang):
    html = re.sub(r'<!--structure-->.*?<!--/structure-->', '', html, flags=re.S)
    html = re.sub(r'<style id="structure-diagrams">.*?</style>\n?', '', html, flags=re.S)
    soup = BeautifulSoup(html, 'html.parser')
    insertions = {}
    existing = 0
    for eq in soup.select('figure.equation[id^="eq-"]'):
        plain = eq.find_next_sibling(class_='plain')
        if plain.select_one('.eq-fig'):
            existing += 1
            continue
        root = eq.select_one('math semantics')
        root = direct(root)[0]
        what = plain.select_one('.gist-row')
        if what:
            what = BeautifulSoup(str(what), 'html.parser').select_one('.gist-row')
            for el in what.select('.gist-k,.katex-mathml'):
                el.decompose()
            caption = what.decode_contents().strip()
        else:
            caption = escape(('Read the displayed expression.', '阅读上方公式。')[lang])
        insertions[eq['id'].split('-')[1]] = diagram(root, lang, caption)
    counts = Counter()
    def insert(match):
        n = match.group(2)
        block = insertions.get(n)
        if block is None:
            return match.group(0)
        counts[n] += 1
        return match.group(0) + block
    html = re.sub(r'((?:人话 · 式|In plain words · Eq\.) \((\d+)\)</span>.*?<!--/gist-->)', insert, html, flags=re.S)
    assert len(counts) == len(insertions) and all(v == 1 for v in counts.values())
    assert len(counts) + existing == 492
    return html.replace('</head>', f'<style id="structure-diagrams">{CSS}</style>\n</head>'), len(counts), existing


if __name__ == '__main__':
    for name, lang in [('reading.html', 1), ('reading-en.html', 0)]:
        page = ROOT / name
        result, added, existing = build(page.read_text(), lang)
        page.write_text(result)
        print(f'{name}: {existing} equations with illustrations, {added} with new structure diagrams')
