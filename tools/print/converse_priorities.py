"""Add compact reading priorities without removing or rewriting any formula card."""
from collections import Counter
from copy import deepcopy
import json
from pathlib import Path
import re
import sys

from bs4 import BeautifulSoup, NavigableString

HERE=Path(__file__).resolve().parent
DATA=json.loads((HERE/'converse_priorities.json').read_text())
core=set(DATA['core']);important=set(DATA['important'])
assert not core&important
assert core|important <= set(range(73,231))
assert {n for s in DATA['sections'] for n in s['core']}==core
source=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/ECE723_Converse_Color_Speaker.html')
out=Path(sys.argv[2]) if len(sys.argv)>2 else source
soup=BeautifulSoup(source.read_text(),'html.parser')

def preserved():
    return [str(x) for x in soup.select('.equation')], [x.get_text(' ',strip=True) for x in soup.select('.gist-origin,.plain-syms,.eq-fig')]

before=preserved()
for node in soup.select('.read-priority,.priority-guide,.priority-section-note,#reading-priority-style'):
    node.decompose()
for entry in soup.select('.entry'):
    entry['class']=[c for c in entry.get('class',[]) if not c.startswith('read-level-')]
labels={'core':'A CORE','important':'B IMPORTANT','skim':'C SKIM PROOF'}
counts=Counter()
for note in soup.select('.speaker-note[data-equation]'):
    n=int(note['data-equation'])
    level='core' if n in core else 'important' if n in important else 'skim'
    counts[level]+=1
    badge=soup.new_tag('span',attrs={'class':['read-priority','priority-'+level],'data-priority':level})
    badge.string=labels[level]
    note.insert(0,badge)
    entry=soup.select_one('#eq-'+str(n)).find_parent(class_='entry')
    entry['class'].append('read-level-'+level)

guide=soup.new_tag('section',attrs={'class':'priority-guide','aria-label':'Reading priorities'})
heading=soup.new_tag('h2');heading.string='Read the proof in layers';guide.append(heading)
p=soup.new_tag('p')
p.string=f"Study-guide priorities: {counts['core']} core steps, {counts['important']} important supports, and {counts['skim']} proof details. All 158 equations remain."
guide.append(p)
legend=soup.new_tag('p',attrs={'class':'priority-legend'})
for level,meaning in [('core','Main result or structural idea: understand and explain it.'),('important','Definition, assumption, or link needed to use a core result.'),('skim','Read the formula and takeaway; defer the derivation on a first pass.')]:
    item=soup.new_tag('span',attrs={'class':'priority-legend-item'})
    badge=soup.new_tag('span',attrs={'class':['read-priority','priority-'+level]});badge.string=labels[level]
    item.append(badge);item.append(' '+meaning);legend.append(item)
guide.append(legend)
table=soup.new_tag('table',attrs={'class':'priority-route'})
for section in DATA['sections']:
    row=soup.new_tag('tr')
    title=soup.new_tag('th');title.string=section['name'];row.append(title)
    cell=soup.new_tag('td')
    for i,n in enumerate(section['core']):
        if i:cell.append(', ')
        a=soup.new_tag('a',href='#eq-'+str(n));a.string=f'({n})';cell.append(a)
    purpose=soup.new_tag('span',attrs={'class':'priority-purpose'});purpose.string=section['purpose'];cell.append(purpose)
    row.append(cell);table.append(row)
guide.append(table)
p=soup.new_tag('p',attrs={'class':'priority-caution'})
p.string='Skim means defer the proof, not its assumptions or conclusion. Core labels in (221)-(230) apply to the sharper Gaussian branch. The section notes below say what to retain.'
guide.append(p)
soup.select_one('.talk-reading').insert_after(guide)
for section in DATA['sections']:
    header=soup.select_one('#'+section['id'])
    assert header is not None,section['id']
    note=soup.new_tag('p',attrs={'class':'priority-section-note'})
    strong=soup.new_tag('strong');strong.string='Reading focus. ';note.append(strong)
    text=section['guide'];cursor=0
    for match in re.finditer(r'\((\d+)\)',text):
        note.append(text[cursor:match.start()])
        a=soup.new_tag('a',href='#eq-'+match[1]);a.string=match[0];note.append(a);cursor=match.end()
    note.append(text[cursor:]);header.insert_after(note)
style=soup.new_tag('style',id='reading-priority-style')
style.string='''
.columns.talk-main{line-height:1.20}
.read-priority{display:inline-block;white-space:nowrap;font:700 6.8pt/1.2 Arial,sans-serif;padding:1pt 3pt;margin-right:4pt;vertical-align:.5pt;letter-spacing:.025em;border:1pt solid #444;color:#222;background:#fff}
.priority-core{color:#fff;background:#174f78;border:1.2pt solid #174f78}
.priority-important{color:#214e3c;border:.7pt solid #49765e;background:#fff}
.priority-skim{color:#444;border:.7pt dashed #777;background:#fff;font-weight:400}
.read-level-core{border-left:2.3pt solid #174f78}
.read-level-skim{border-left:1pt dashed #999}
.priority-guide{margin:7pt 0 9pt;padding:6pt 8pt;border:1pt solid #8da8ba;border-radius:4pt;break-inside:avoid;font:8pt/1.2 Arial,sans-serif}
.priority-guide h2{font:700 11pt/1.15 Arial,sans-serif;margin:0 0 4pt;padding:0;border:0;color:#173e66}
.priority-guide p{margin:3pt 0}
.priority-legend-item{display:block;margin:3pt 0}
.priority-legend .read-priority{min-width:67pt;text-align:center}
.priority-route{width:100%;border-collapse:collapse;margin:4pt 0;font:8pt/1.2 Arial,sans-serif;break-inside:avoid}
.priority-route th,.priority-route td{padding:3pt 4pt;border-top:.45pt solid #bbb;text-align:left;vertical-align:top}
.priority-route th{width:29%;font-weight:700}
.priority-route a{white-space:nowrap;text-decoration:underline}
.priority-purpose{display:block;color:#444;margin-top:2pt;font-size:7.6pt}
.priority-caution{font-size:7.5pt;color:#333}
.priority-section-note{padding:4pt 5pt;border:.7pt solid #9ab6c3;border-left:2pt solid #397e9e;background:#f4f8fb;font:8pt/1.25 Arial,sans-serif;margin:4pt 0 6pt;break-inside:avoid;break-after:avoid}
.priority-section-note a{color:inherit;text-decoration:underline;white-space:nowrap}
'''
soup.head.append(style)
assert preserved()==before,'A formula or explanation changed'
assert sum(counts.values())==158
out.write_text(str(soup))
print(dict(counts),'all formula and explanation content preserved')
