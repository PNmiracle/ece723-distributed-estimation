# Insert (or refresh) the highlight & notes feature in the given pages.
# Usage (from repo root): python3 tools/highlights/inject.py reading.html reading-en.html
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, 'hl.css'), encoding='utf-8').read().strip()
js = open(os.path.join(HERE, 'hl.js'), encoding='utf-8').read().strip()
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'\n?<style id="hl-style">.*?</style>', '', s, flags=re.S)
    s = re.sub(r'\n?<script id="hl-script">.*?</script>', '', s, flags=re.S)
    assert s.count('</head>') == 1 and s.count('</body>') == 1, f
    s = s.replace('</head>', f'<style id="hl-style">\n{css}\n</style>\n</head>')
    s = s.replace('</body>', f'<script id="hl-script">\n{js}\n</script>\n</body>')
    open(f, 'w', encoding='utf-8').write(s)
    print('injected', f)
