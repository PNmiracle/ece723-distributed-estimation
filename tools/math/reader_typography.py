"""Use the displayed equations' mathematical typeface and scale in all prose."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[2]
CSS='''
/* Match the original numbered equations. Keep KaTeX's internal glyph fonts,
   script sizing and operator spacing, rather than inheriting prose fonts. */
@media screen {
 html[lang]{--reader-math-scale:1.21}
 html[lang="en"]{--reader-math-scale:1.04}
 html[lang] :is(.paper,.overview,.recap) .katex{
  font-family:KaTeX_Main,"Times New Roman",serif;
  font-size:calc(1em * var(--reader-math-scale));
  font-weight:400;
  font-style:normal;
  text-rendering:auto;
 }
 html[lang] .prose-formula,html[lang] .imath{
  font-style:normal;
 }
}
'''
for name in ['reading.html','reading-en.html']:
    path=ROOT/name;html=path.read_text()
    html=re.sub(r'<style id="reader-math-typography">.*?</style>\s*','',html,flags=re.S)
    path.write_text(html.replace('</head>',f'<style id="reader-math-typography">{CSS}</style>\n</head>'))
    print(name,'prose and displayed equation typography unified')
