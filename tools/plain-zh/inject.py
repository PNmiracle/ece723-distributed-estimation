"""Build the English reader's click-to-show Chinese equation explanations."""
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ASSET = Path("assets/reading-plain-zh.js")
EXPECTED = set(map(str, range(1, 493)))
BOXES = re.compile(
    r'<figure class="equation" id="eq-(\d+)">.*?</figure>\s*<aside class="plain">(.*?)</aside>',
    flags=re.S,
)
HEADER = re.compile(r'^<span class="plain-tag">[^<]*</span><!--gist--><span class="eq-level [^"]+" data-hl-ui>[^<]*</span>')
REQUIRED = ['plain-gist', 'plain-syms', 'plain-more']


def collect(page):
    matches = BOXES.findall(page.read_text(encoding="utf-8"))
    if len(matches) != len(EXPECTED) or {n for n, _ in matches} != EXPECTED:
        raise ValueError(f"{page.name}: expected a plain-words box for each equation 1–492")
    for n, box in matches:
        if not all(f'class="{name}"' in box for name in REQUIRED):
            raise ValueError(f"{page.name}: equation {n} is missing a summary, symbols, or explanation")
    return matches


data = {}
for n, box in collect(ROOT / "reading.html"):
    body, count = HEADER.subn("", box, count=1)
    if count != 1:
        raise ValueError(f"reading.html: missing priority and header for equation {n}")
    data[n] = body.replace("<!--/gist-->", "", 1)

entries = ",\n".join(f'{json.dumps(n)}:{json.dumps(html, ensure_ascii=False)}' for n, html in data.items())
asset = "window.__readingPlainZh = {\n" + entries + "\n};\n"
digest = hashlib.sha256(asset.encode("utf-8")).hexdigest()[:12]

page = ROOT / "reading-en.html"
collect(page)
html = page.read_text(encoding="utf-8")
html = re.sub(r'\n<(style|script)\b[^>]* id="plain-zh-(?:style|script)"[^>]*>.*?</\1>', "", html, flags=re.S)
css = (HERE / "style.css").read_text(encoding="utf-8")
js = (HERE / "toggle.js").read_text(encoding="utf-8")
if html.count("</head>") != 1 or html.count("</body>") != 1:
    raise ValueError("reading-en.html: expected a single head and body")
html = html.replace("</head>", f'\n<style id="plain-zh-style">\n{css}</style></head>', 1)
html = html.replace(
    "</body>",
    f'\n<script id="plain-zh-script" data-src="{ASSET.as_posix()}?v={digest}">\n{js}</script></body>',
    1,
)
(ROOT / ASSET).parent.mkdir(exist_ok=True)
(ROOT / ASSET).write_text(asset, encoding="utf-8")
page.write_text(html, encoding="utf-8")
print(f"Linked {len(data)} Chinese equation explanations in the English reader.")
