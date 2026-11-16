# Insert (or refresh) the ⌘K / Ctrl+K quick-jump palette.
# Usage (from repo root): python3 tools/palette/inject.py reading.html reading-en.html
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, 'palette.css'), encoding='utf-8').read().strip()
js = open(os.path.join(HERE, 'palette.js'), encoding='utf-8').read().strip()
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'\n?<style id="qj-style">.*?</style>', '', s, flags=re.S)
    s = re.sub(r'\n?<script id="qj-script">.*?</script>', '', s, flags=re.S)
    s = s.replace('</head>', f'<style id="qj-style">\n{css}\n</style>\n</head>')
    s = s.replace('</body>', f'<script id="qj-script">\n{js}\n</script>\n</body>')
    open(f, 'w', encoding='utf-8').write(s)
    print('injected', f)
