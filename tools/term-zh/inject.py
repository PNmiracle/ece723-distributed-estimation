"""Embed the Chinese terminology index and annotation script in the English reader."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parents[1] / "reading-en.html"
NORMALIZE = str.maketrans({**dict.fromkeys("‐‑‒–—−", "-"), "’": "'", "‘": "'"})
STYLE = """
.term-zh {
  color: #3d6277;
  font-family: "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  font-size: .83em;
  font-weight: 400;
  pointer-events: none;
}
"""

terms = {}
for line_number, line in enumerate((HERE / "terms.tsv").read_text().splitlines(), 1):
    if not line.strip() or line.startswith("#"):
        continue
    translation, aliases = line.split("\t")
    for alias in aliases.split("|"):
        key = " ".join(alias.lower().translate(NORMALIZE).split())
        if not translation.strip() or not key:
            raise ValueError(f"Empty term or translation: line {line_number}")
        if terms.setdefault(key, translation) != translation:
            raise ValueError(f"Conflicting translation for {alias!r}: line {line_number}")

data = json.dumps(terms, ensure_ascii=False, separators=(",", ":")).replace("</", r"<\/")
runtime = (HERE / "annotate.js").read_text()
html = PAGE.read_text()
html = re.sub(r"\n<(style|script)\b[^>]* id=\"term-zh-(?:style|data|script)\"[^>]*>.*?</\1>", "", html, flags=re.S)
html = html.replace("</head>", f'\n<style id="term-zh-style">{STYLE}</style></head>', 1)
html = html.replace(
    "</body>",
    f'\n<script type="application/json" id="term-zh-data">{data}</script>\n'
    f'<script id="term-zh-script">\n{runtime}</script></body>',
    1,
)
PAGE.write_text(html)
print(f"Embedded {len(terms)} English spellings for {len(set(terms.values()))} Chinese terms.")
