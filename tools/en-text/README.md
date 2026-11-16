One-time conversion of the English reading page from scanned crops to real text (Nov 2026).

Each old crop was located in the paper PDF (`boxes.json`: page + box in PDF points). The scripts then read the PDF's
characters with fonts and positions (`extract.py`), rebuild lines, text runs and inline math as TeX (`build.py`:
scripts, accents, fractions, radicals, binomials, operator names), link equation references and add Table I
(`post.py`), render the math with KaTeX (`render.js`) and replace each paragraph's scan with `<p>` text (`assemble.py`).
They ran against the pre-conversion `reading-en.html` (see git history) and the paper PDF; paths inside are absolute.
