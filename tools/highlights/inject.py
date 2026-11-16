# Insert (or refresh) the highlight & notes feature in the given pages.
# Usage (from repo root): python3 tools/highlights/inject.py reading.html reading-en.html
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, 'hl.css'), encoding='utf-8').read().strip()
js = open(os.path.join(HERE, 'hl.js'), encoding='utf-8').read().strip()
def embed(s, tag, id_, contents, before):
    block = f'<{tag} id="{id_}">\n{contents}\n</{tag}>'
    # Keep the existing script order: English term labels initialize after highlights.
    s, count = re.subn(rf'<{tag} id="{id_}">.*?</{tag}>', lambda _: block, s, flags=re.S)
    return s if count else s.replace(before, f'{block}\n{before}')

for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    assert s.count('</head>') == 1 and s.count('</body>') == 1, f
    s = embed(s, 'style', 'hl-style', css, '</head>')
    s = embed(s, 'script', 'hl-script', js, '</body>')
    open(f, 'w', encoding='utf-8').write(s)
    print('injected', f)
