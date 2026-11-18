"""Refresh the compact color speaker edition from the current English reader.

Usage: python3 tools/print/sync_converse_color.py [existing-speaker-template.html]
The generated HTML is also the reusable layout template for the next refresh.
"""
from copy import deepcopy
from pathlib import Path
import re
import sys
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
OUTPUT=ROOT/'assets/downloads/ECE723_Converse_Color_Speaker.html'
TEMPLATE=Path(sys.argv[1]) if len(sys.argv)>1 else OUTPUT
src=BeautifulSoup((ROOT/'reading-en.html').read_text(),'html.parser')
out=BeautifulSoup(TEMPLATE.read_text(),'html.parser')
# Remove only previously generated guide boxes and style, retaining the print layout.
for node in out.select('.print-sub-guide,#print-sub-guide-style'):
    node.decompose()
equations={int(e['id'][3:]):e for e in src.select('figure.equation[id]')}
web_speakers={int(e['data-equation']):e.select_one('.speaker-text') for e in src.select('.speaker-bridge[data-equation]')}
entries=out.select('.entry');assert len(entries)==158
speakers={int(x['data-equation']):x for x in out.select('.speaker-note[data-equation]')}
original_math=[str(e.select_one('.equation')) for e in entries]
for entry in entries:
    number=int(entry.select_one('.equation')['id'][3:])
    aside=equations[number].find_next_sibling('aside',class_='plain')
    explain=entry.select_one('.explain');assert explain is not None,number
    new=deepcopy(aside)
    diagrams=[x.extract() for x in new.select('.eq-fig')]
    syms=new.select_one('.plain-syms');assert syms is not None;syms.extract()
    for node in new.select('.plain-tag,.eq-level,.sym-say,.symbol-repeat-note'):
        node.decompose()
    new.name='div';new['class']=['explain'];new.attrs.pop('data-priority',None)
    explain.replace_with(new)
    for old in entry.select(':scope > .eq-fig,:scope > .plain-syms'):old.decompose()
    for diagram in diagrams:
        caption=diagram.select_one('figcaption')
        if caption and not caption.select_one('.diagram-label'):
            label=out.new_tag('span',attrs={'class':'diagram-label'});label.string=f'Diagram · ({number})';caption.insert(0,' ');caption.insert(0,label)
        entry.append(diagram)
    for node in syms.select('.symbol-repeat-note'):node.decompose()
    entry.append(syms)
    speaker=speakers[number]
    priority=speaker.select_one('.read-priority');priority=priority.extract() if priority else None
    text=web_speakers[number]
    speaker.clear()
    if priority:speaker.append(priority)
    label=out.new_tag('strong');label.string=f'Speaking · ({number})';speaker.append(label);speaker.append(' ')
    for child in text.contents:speaker.append(deepcopy(child))
# Add every website paragraph guide immediately after its matching print subheading.
web_heads=src.select('[id^="sec-iii-"] h4.sub-h');print_heads=out.select('main h4')
assert len(web_heads)==len(print_heads)==22,(len(web_heads),len(print_heads))
for web,printed in zip(web_heads,print_heads):
    assert re.sub(r'\s+','',web.get_text())==re.sub(r'\s+','',printed.get_text()),(web.get_text(),printed.get_text())
    printed['id']=web['id']
    guide=src.find(id='sg-'+web['id']);assert guide is not None
    copied=deepcopy(guide);copied['class']=['print-sub-guide']
    printed.insert_after(copied)
# The website's original math/diagram styles and print-only compact guide treatment.
for style_id in ['reader-math-fonts','prose-math-typography','original-equation-typography']:
    style=src.find('style',id=style_id)
    if style:
        old=out.find('style',id=style_id)
        if old:old.decompose()
        out.head.append(deepcopy(style))
css=out.new_tag('style',id='print-sub-guide-style')
css.string='''
.print-sub-guide{font:8pt/1.22 Georgia,serif;margin:3pt 0 5pt;padding:4pt 5pt;border:.6pt solid #91b1ca;border-left:2pt solid #39759d;border-radius:3pt;background:#eef5fb;break-inside:avoid}
.print-sub-guide .guide-tag{font:700 7.3pt/1.2 Arial;color:#234f72;margin-bottom:2pt}
.print-sub-guide .sg-row{margin:1pt 0}.print-sub-guide b{color:#244e6c}
.speaker-note{break-inside:avoid;break-after:auto;box-decoration-break:clone}
.symbol-repeat-note{display:none}
.entry .plain-syms{grid-template-columns:fit-content(29%) minmax(0,1fr);gap:1.5pt 5pt;line-height:1.2}
.entry .plain-syms .sym-k{min-width:0;max-width:100%;overflow:visible;text-align:left}
.entry .plain-syms .sym-v{min-width:0;overflow-wrap:anywhere}
.entry .katex{font-size:1em}.entry>.equation .katex{font-size:1.04em}
.entry .plain-syms .katex{font-size:.94em}
.print-sub-guide .katex{font-size:1em}
'''
out.head.append(css)
# Long conditional-matrix keys get their own line instead of colliding with definitions.
old=out.find('script',id='print-symbol-fit')
if old:old.decompose()
fit=out.new_tag('script',id='print-symbol-fit')
fit.string=r"""
document.fonts.ready.then(() => {
  const sheetWidth=(210-18-5)/2*96/25.4-16;
  for(const key of document.querySelectorAll('.plain-syms .sym-k')){
    const range=document.createRange();range.selectNodeContents(key);
    const width=range.getBoundingClientRect().width;
    if(width>sheetWidth*.29){
      key.style.gridColumn='1 / -1';
      if(key.nextElementSibling)key.nextElementSibling.style.gridColumn='1 / -1';
    }
    if(width>sheetWidth){const math=key.querySelector('.katex');if(math)math.style.zoom=sheetWidth/width;}
  }
  document.documentElement.dataset.printReady='true';
});
"""
out.body.append(fit)

# Align website fragment references with the print IDs; outside references remain online.
for link in out.select('a[href^="#eq-"]'):
    n=int(link['href'][4:])
    if not 73<=n<=230:link['href']='https://pnmiracle.github.io/ece723-distributed-estimation/reading-en.html'+link['href']
assert [str(e.select_one('.equation')) for e in out.select('.entry')]==original_math
assert len(out.select('.print-sub-guide'))==22
assert len(out.select('.plain-syms'))==len(out.select('.speaker-note'))==len(out.select('.eq-fig'))==158
assert not out.select('[data-complete-readings]'),'Withdrawn expanded symbol layout must not return'
OUTPUT.write_text(str(out));print(OUTPUT,'22 paragraph guides; 158 formulas, speaking notes, diagrams and current symbol tables')
