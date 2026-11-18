import sys
from pathlib import Path
from urllib.parse import urljoin
import re
import json
from bisect import bisect_right
from bs4 import BeautifulSoup, Comment, NavigableString

source = Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/ECE723_Converse_Color_Speaker.html')
out = Path(sys.argv[2]) if len(sys.argv)>2 else Path('/tmp/ECE723_Converse_Monochrome_Speaker.html')
soup = BeautifulSoup(source.read_text(), 'html.parser')

# Match each original shade to a distinct texture, leaving white as white.
textures = {
    '#dcefed': ('diagonal', '<path d="M-2 8L8 -2M2 10L10 2"/>'),
    '#e3ecf7': ('horizontal', '<path d="M0 3H8"/>'),
    '#fbecd3': ('dots', '<circle cx="3" cy="3" r="1" fill="#777" stroke="none"/>'),
    '#f9e3e0': ('crosshatch', '<path d="M0 0L8 8M8 0L0 8"/>'),
    '#ece4f6': ('vertical', '<path d="M3 0V8"/>'),
    '#e1f2e1': ('reverse diagonal', '<path d="M-2 0L8 10M2 -2L10 6"/>'),
}
line_patterns = {
    '#3d5a80': None, '#9a5b00': '2 3', '#0f6b6b': '7 3',
    '#2e7d32': '7 2 2 2', '#b3261e': '2 2', '#6b3fa0': '10 3',
}
dark_tones = {
    '#3d5a80': '#1c1c1c', '#9a5b00': '#4a4a4a', '#0f6b6b': '#595959',
    '#2e7d32': '#383838', '#b3261e': '#111111', '#6b3fa0': '#2b2b2b',
}
replacements = {
    18: {'orange line': 'dotted line'},
    19: {'Orange: Bernstein': 'Dotted: Bernstein', 'Blue: a Poisson': 'Solid: a Poisson',
         'Green dashed:': 'Dashed:', 'blue curve': 'solid curve', 'orange curve': 'dotted curve',
         '(green dashed)': '(dashed)', '(blue)': '(solid)', 'orange': 'Bernstein bound'},
    43: {'(purple)': '(vertical stripes)'},
    45: {'(blue)': '(horizontal stripes)'},
    47: {'red wedge': 'crosshatched wedge'},
    49: {'(teal)': '(diagonal stripes)'},
    54: {'(green)': '(reverse diagonal stripes)'},
    98: {'red dots': 'dots at the endpoints'},
    109: {'(orange)': '(posterior curve)'},
    143: {'orange area': 'dotted area'},
    154: {'(blue)': '(full curve)', '(orange)': '(dotted region)'},
    170: {'(orange)': '(dotted overlap)'},
    197: {'(blue)': '(solid curve)', '(green)': '(dashed curve)'},
}
legend = {
    'purple: bounded surplus': 'Vertical: bounded surplus',
    'blue: surplus ∝ n': 'Horizontal: surplus ∝ n',
    'teal: small pool': 'Diagonal: small pool',
    'green: large pool': 'Reverse diagonal: large pool',
    'red: intermediate, open': 'Crosshatch: intermediate, open',
}
color_pattern = re.compile(r'^#(?:[0-9a-f]{3}|[0-9a-f]{6})$', re.I)

def gray(other):
    rgba = re.fullmatch(r'rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)', other)
    if rgba:
        v = round(.213*int(rgba[1])+.715*int(rgba[2])+.072*int(rgba[3]))
        return f'rgba({v},{v},{v},{rgba[4]})' if rgba[4] else f'rgb({v},{v},{v})'
    if not color_pattern.fullmatch(other):
        return other
    values = other[1:]
    if len(values) == 3:
        values = ''.join(v*2 for v in values)
    r, g, b = (int(values[i:i+2], 16) for i in range(0, 6, 2))
    v = round(.213*r + .715*g + .072*b)
    return '#' + f'{v:02x}'*3

replacements.update({
75:{'(orange)':'(dotted region)'},
127:{'orange = inside E':'dotted = inside E'},
129:{'grey: original; orange: conditioned':'grey: original; dotted: conditioned'},
159:{'The red cross terms':'The cross terms marked ×'},
163:{'The green cross pieces':'The hatched cross pieces'},
230:{'Blue: exact bound':'Solid: exact bound','Orange dashed:':'Dotted:'},
})

for index, diagram in enumerate(soup.select('.eq-fig:has(svg)')):
    svg = diagram.svg
    equation = int(diagram.parent.select_one('.equation')['id'][3:])
    used = {}
    for node in svg.select('[fill], [stroke]'):
        fill = node.get('fill', '').lower()
        stroke = node.get('stroke', '').lower()
        if fill in textures and node.name not in {'text', 'tspan'}:
            key = used.setdefault(fill, f'gray-{index}-{len(used)}')
            node['fill'] = f'url(#{key})'
        elif fill:
            node['fill'] = ('#1c1c1c' if node.name in {'text','tspan'} and gray(fill) not in {'#ffffff','none'}
                            else dark_tones.get(fill, gray(fill)))
        if stroke:
            node['stroke'] = '#969696' if stroke == '#c9d3cf' else dark_tones.get(stroke, gray(stroke))
            if node.name in {'path','line','polyline'} and not node.has_attr('marker-end') and line_patterns.get(stroke):
                node['stroke-dasharray'] = line_patterns[stroke]
    if used:
        parts = []
        for hue, key in used.items():
            _, mark = textures[hue]
            parts.append(f'<pattern id="{key}" patternUnits="userSpaceOnUse" width="8" height="8">'
                         f'<rect width="8" height="8" fill="#fafafa"/>'
                         f'<g stroke="#929292" stroke-width=".85" fill="none">{mark}</g></pattern>')
        svg.insert(0, BeautifulSoup('<defs>'+''.join(parts)+'</defs>', 'html.parser').defs)
    changes = {**legend, **replacements.get(equation, {})}
    for root in [svg, diagram.figcaption]:
        for phrase in list(root.find_all(string=True)):
            if isinstance(phrase, Comment):
                continue
            new = str(phrase)
            for old, label in changes.items():
                new = new.replace(old, label)
            if new != str(phrase):
                phrase.replace_with(NavigableString(new))

for node in soup.select('style,[style]'):
    if node.name == 'style' and node.string:
        node.string = re.sub(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', lambda m: gray(m[0]), str(node.string))
    elif node.has_attr('style'):
        node['style'] = re.sub(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', lambda m: gray(m[0]), node['style'])


soup.title.string='ECE723 Converse · Black-and-white Speaker Edition'
soup.select_one('.talk-course').string='ECE723 · BLACK-AND-WHITE SPEAKER EDITION'
style=soup.new_tag('style')
style.string="""
body{color:#111}.talk-title h1,.talk-course,.talk-main>h2,.talk-main>h3,.talk-main>h4{color:#111}
.speaker-note{background:#f5f5f5;border-left-color:#444}.speaker-note strong{color:#111}
.gist-k,.plain-sub,.diagram-label{color:#111;border-color:#777;background:#f4f4f4}
.gist-dependencies,.gist-dependencies a,.eq-print-number,a{color:#222}
.proof-step{background:#fff;border-color:#888;color:#222}.proof-step.current{background:#ededed;border-color:#555;color:#111}
.entry>.equation{background:#fafafa;border-color:#aaa}.plain-syms,.entry .plain-syms{background:#fafafa}
.eq-fig figcaption{color:#222}
"""
soup.head.append(style)
assert len(soup.select('.equation'))==158
assert len(soup.select('.speaker-note'))==158
assert len(soup.select('.gist-origin'))==158
assert len(soup.select('.eq-fig'))==158
out.write_text(str(soup))
print('Monochrome speaker edition: 158 formulas, speaking notes and diagrams')
