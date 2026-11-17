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
