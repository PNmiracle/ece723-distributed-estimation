# Mathematics in explanatory prose

`typeset.py` renders the literal prose fragments in `typography.tsv` with KaTeX.
It also keeps HTML subscripts and superscripts attached to their bases, and
typesets the added symbol-table keys. Existing KaTeX, MathML, SVG drawings and
the paper's displayed equations are preserved. A before/after invariant checks
every displayed equation.

Run this after building all prose, diagrams and print layouts:

```sh
python3 tools/math/typeset.py reading.html reading-en.html
python3 tools/math/typeset.py /path/to/print-layout.html
```

Install KaTeX on the Node module path, or set `KATEX_MODULE` to its module path.
Rendering is strict: malformed expressions stop the build instead of silently
falling back to plain text. Keep each rule mathematically explicit; the Unicode
fallback handles only individual symbol tokens, not algebraic interpretation.

`repair_prose.py` applies the reviewed, complete inline expressions in
`prose_repairs.json`. Use it before `typeset.py`: several translated paragraphs
previously had their integral limits, powers and indices split across unrelated
KaTeX spans and plain text. Reconstructing the whole expression also preserves
its mathematical grouping. Paragraph note buttons are retained, and numbered
references are linked. The repair pass is idempotent via stable paragraph ids.

`reader_typography.py` makes inline and added prose mathematics use the same
KaTeX font and relative size as the existing numbered equations. The original
language-specific scales (1.21 for Chinese and 1.04 for English) are preserved.
KaTeX's internal italic, bold, operator and script glyph rules remain intact.
The reader's global text-size control scales prose and mathematics together.
