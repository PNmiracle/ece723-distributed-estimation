"""Apply the shared header/contents controls to root website pages only."""
from pathlib import Path
import re
import sys
ROOT=Path(__file__).resolve().parents[2]
LINK='<link id="site-chrome-css" rel="stylesheet" href="tools/site-chrome/chrome.css">'
SCRIPT='<script id="site-chrome-js" src="tools/site-chrome/chrome.js"></script>'
def apply(text):
    text=re.sub(r'<link\b[^>]*\bid="site-chrome-css"[^>]*>','',text)
    text=re.sub(r'<script\b[^>]*\bid="site-chrome-js"[^>]*>.*?</script>','',text,flags=re.S)
    assert text.count('</head>')==text.count('</body>')==1
    return text.replace('</head>',LINK+'</head>').replace('</body>',SCRIPT+'</body>')
if __name__=='__main__':
    paths=[ROOT/p for p in sys.argv[1:]] if sys.argv[1:] else sorted(ROOT.glob('*.html'))
    for path in paths:
        path.write_text(apply(path.read_text()))
    print('Shared compact header / contents:',len(paths),'pages')
