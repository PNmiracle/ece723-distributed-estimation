# Insert (or refresh) the English page's typography and copy-as-TeX handler.
# Usage (from repo root): python3 tools/en-type/inject.py reading-en.html
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, 'en-type.css'), encoding='utf-8').read().strip()
js = open(os.path.join(HERE, 'en-type.js'), encoding='utf-8').read().strip()
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'\n?<style id="en-type">.*?</style>', '', s, flags=re.S)
    s = re.sub(r'\n?<script id="en-type-js">.*?</script>', '', s, flags=re.S)
    # drop the old scan-overlay rules
    s = re.sub(r'\n(?:\.english-scan|\.transcript)[^\n]*', '', s)
    s = s.replace('</head>', f'<style id="en-type">\n{css}\n</style>\n</head>')
    s = s.replace('</body>', f'<script id="en-type-js">\n{js}\n</script>\n</body>')
    open(f, 'w', encoding='utf-8').write(s)
    print('injected', f)
