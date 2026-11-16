# Render both pages in headless Chrome and report KaTeX errors and callout counts per section.
# Usage (from repo root): python3 tools/check.py sec-ii-b sec-iii-a ...   (needs playwright + Chrome)
import sys, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
secs=sys.argv[1:]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome') if os.path.exists('/usr/bin/google-chrome') else p.chromium.launch()
    for f in ['reading.html','reading-en.html']:
        pg=b.new_page(viewport={'width':1100,'height':1300})
        pg.goto('file://'+os.path.join(ROOT,f), wait_until='load', timeout=120000); pg.wait_for_timeout(3000)
        r=pg.evaluate("""(secs)=>secs.map(s=>{const e=document.getElementById(s);return [s,e.querySelectorAll('figure.equation').length,e.querySelectorAll('aside.plain').length,e.querySelectorAll('.plain-syms').length]})""", secs)
        print(f,'katex-errors',pg.evaluate("document.querySelectorAll('.katex-error').length"),r)
    b.close()
