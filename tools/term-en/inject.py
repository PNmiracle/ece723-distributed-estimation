"""Embed the English-equivalent annotations in the Chinese reader (reading.html).

Run after editing extra.tsv or ../term-zh/terms.tsv:  python3 tools/term-en/inject.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from terms import load  # noqa: E402

PAGE = HERE.parents[1] / "reading.html"
STYLE = """
.term-en{color:#3d6277;font:400 .8em/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;margin:0 .12em 0 .08em;white-space:nowrap;pointer-events:none}
body.no-term-en .term-en{display:none}
#toggle-en[aria-pressed="false"]{opacity:.7}
@media print{.term-en{color:#555}}
"""

terms = load()
data = json.dumps(terms, ensure_ascii=False, separators=(",", ":")).replace("</", r"<\/")
runtime = (HERE / "annotate.js").read_text(encoding="utf-8")
html = PAGE.read_text(encoding="utf-8")
html = re.sub(r"\n<(style|script)\b[^>]* id=\"term-en-(?:style|data|script)\"[^>]*>.*?</\1>", "", html, flags=re.S)
html = html.replace("</head>", f'\n<style id="term-en-style">{STYLE}</style></head>', 1)
i = html.rindex("</body>")
html = (html[:i] + f'\n<script type="application/json" id="term-en-data">{data}</script>\n'
        f'<script id="term-en-script">\n{runtime}</script>' + html[i:])
PAGE.write_text(html, encoding="utf-8")
glossed = sum(1 for en in terms.values() if en != "-")
print(f"Embedded {glossed} Chinese terms with English equivalents ({len(terms) - glossed} exclusions).")
