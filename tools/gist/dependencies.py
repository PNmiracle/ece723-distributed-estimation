"""Complete the bilingual derivation rows and their traceable equation dependencies.

Run after gist/inject.js. Existing derivations (14–29) retain their rendered math.
"""
from collections import defaultdict
from html import escape
import json
from pathlib import Path
import re
import subprocess

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PATTERN = re.compile(r'<!--gist-->.*?<!--/gist-->', re.S)
REFERENCE = re.compile(r'(?<![\w′])\((\d+)\)')
RANGE = re.compile(r'\((\d+)\)\s*[–—-]\s*\((\d+)\)')
CSS = '''
.gist-origin{padding-top:.2em}
.gist-dependencies{display:block;margin:.3em 0 0;font-size:.9em}
.gist-dependencies a{white-space:nowrap;text-decoration:underline;text-underline-offset:.14em}
.gist-dependency-label{font-weight:650;margin-right:.35em}
'''


def references(text):
    values = set(map(int, REFERENCE.findall(text)))
    for a, b in RANGE.findall(text):
        values.update(range(int(a), int(b) + 1))
    return {n for n in values if 1 <= n <= 492}


def linked(text):
    return REFERENCE.sub(lambda m: f'<a class="eq-ref" href="#eq-{m[1]}">({m[1]})</a>'
                         if 1 <= int(m[1]) <= 492 else m[0], escape(text))


def load():
    result = subprocess.run(
        ['node', '-e', "process.stdout.write(JSON.stringify(require('./origins.js')))"],
        cwd=HERE, text=True, capture_output=True, check=True)
    notes = {int(n): item for n, item in json.loads(result.stdout).items()}
    assert set(notes) == set(range(1, 493))
    graph = json.loads((HERE/'dependency_links.json').read_text())
    parents = {n: sorted({r for r in references(item['en']) if r < n}
                         | set(graph['extra_parents'].get(str(n), [])))
               for n, item in notes.items()}
    users = defaultdict(set)
    for target, inputs in parents.items():
        for source in inputs:
            assert 1 <= source <= 492 and source != target, (source, target)
            users[source].add(target)
    return notes, parents, users, graph['terminal_uses']


def build(html, lang, notes, parents, users, terminal):
    html = re.sub(r'<style id="derivation-links">.*?</style>\n?', '', html, flags=re.S)
    number = 0
    observed = set()
    def update(match):
        nonlocal number
        number += 1
        n = number
        observed.add(n)
        fragment = BeautifulSoup(match[0], 'html.parser')
        gist = fragment.select_one('.plain-gist')
        assert gist is not None, n
        old = gist.select_one('.gist-origin')
        # Preserve the mathematics already typeset for the original derivations.
        if old is not None and 14 <= n <= 29:
            origin = old.extract()
            for extra in origin.select('.gist-dependencies'):
                extra.decompose()
        else:
            if old:
                old.decompose()
            origin = fragment.new_tag('span', attrs={'class':'gist-row gist-origin'})
            label = fragment.new_tag('span', attrs={'class':'gist-k', 'data-hl-ui':''})
            label.string = '2. Where it comes from' if lang == 'en' else '2. 怎么推导来的'
            origin.append(label)
            origin.append(BeautifulSoup(linked(notes[n][lang]), 'html.parser'))
        origin.select_one('.gist-k').string = '2. Where it comes from' if lang == 'en' else '2. 怎么推导来的'
        for extra in gist.select('.gist-dependencies'):
            extra.decompose()
        rows = gist.find_all('span', class_='gist-row', recursive=False)
        assert len(rows) == 2, (n,len(rows))
        what, why = rows
        what.select_one('.gist-k').string = '1. What' if lang == 'en' else '1. 是什么'
        why.select_one('.gist-k').string = '3. Why it matters' if lang == 'en' else '3. 有什么用'
        why.insert_before(origin)

        def line(host, label, content):
            row = fragment.new_tag('span', attrs={'class':'gist-dependencies'})
            title = fragment.new_tag('span', attrs={'class':'gist-dependency-label'})
            title.string = label
            row.append(title)
            row.append(BeautifulSoup(content, 'html.parser'))
            host.append(row)

        if parents[n]:
            links = ', '.join(f'<a class="eq-ref" href="#eq-{k}">({k})</a>' for k in parents[n])
            line(origin, 'Uses' if lang=='en' else '用到', links)
        if users[n]:
            links = ', '.join(f'<a class="eq-ref" href="#eq-{k}">({k})</a>' for k in sorted(users[n]))
            line(why, 'Used by' if lang=='en' else '用于／支撑公式', links)
        if str(n) in terminal:
            text = terminal[str(n)][0 if lang=='en' else 1]
            line(why, 'Role' if lang=='en' else '在论证中的作用', linked(text))
        return str(fragment)

    html = PATTERN.sub(update, html)
    assert observed == set(range(1,493)),len(observed)
    return html.replace('</head>',f'<style id="derivation-links">{CSS}</style>\n</head>')


if __name__ == '__main__':
    notes, parents, users, terminal = load()
    for name, lang in [('reading.html','zh'),('reading-en.html','en')]:
        path=ROOT/name
        path.write_text(build(path.read_text(),lang,notes,parents,users,terminal))
        print(name, '492 derivations and dependency rows')
    (HERE/'dependency_graph.json').write_text(json.dumps({
        'parents':parents,'used_by':{n:sorted(users[n]) for n in range(1,493)}
    },ensure_ascii=False,indent=2)+'\n')
