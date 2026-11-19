# Native-text bilingual paper

`build.py` builds `bilingual.html` and the Section III print source from the paper
paragraphs in `reading-en.html` and `reading.html`. Diagrams, video links, speaker notes and recap panels are excluded from this
paper comparison. `guides.json` supplies a short bilingual reading aid under
every chapter, subsection and proof-step heading, before the original text.
The 85 guide pairs are labeled and visually separated from the paper itself. The separate guided readers retain those features.

The two languages share the same ordered heading, equation and table anchors.
Paragraphs are aligned within each anchor interval, then paired individually;
unequal counts fail the build. Both columns use the same font stack, body size
and line height. All 492 equations are copied from the native English reader,
with their original numbers and TeX/MathML; no scan or transparent text overlay
is used. Table I and the bibliography are retained.

`translation_review.json` is the durable review layer. Entries are keyed by the
preceding anchor and use zero-based paragraph indices. `en_all` / `zh_all`
replace a whole anchor interval; `en` / `zh` replace individual paragraphs.
This supports restoring omitted source material and repairing paragraph splits
without silently shifting later translations. It includes the statistical-model
passage restored against page 2 of the original paper, removal of a duplicate
English sentence in the Chinese source, and repairs to mistranslated conditions,
subscripts, powers, norms, information bounds and proof statements. For example,
robust encoding requires a total variation bound of sqrt(D/Q), not D/Q; complex
error is epsilon/sqrt(2), not epsilon/2; and the Gaussian quadratic-form matrix
is M_H, not an unindexed M.

The multilevel outline contains 85 heading pairs, including 61 subheadings and
nested proof steps. The Section III print source keeps its 28 heading pairs,
158 equations (73)–(230), all original connecting prose, the reviewed Chinese
translation and 28 bilingual reading guides. English is on the left, Chinese on the right, with shared equations
across the page. Print headings are bold and larger at each level.

Rebuild with:

```sh
KATEX_MODULE=/path/to/katex.cjs python3 tools/bilingual/build.py
```

KaTeX must be installed or supplied through `KATEX_MODULE`. Rendering is strict:
invalid TeX stops the build. `tools/build_all.sh` invokes this builder after the
guided readers are refreshed. To regenerate the PDF, print
`assets/downloads/ECE723_SectionIII_Bilingual.html` in Chromium with print media,
backgrounds enabled and CSS page size respected; wait for
`document.documentElement.dataset.printReady === 'true'` so fonts and formula
widths have settled. The PDF linked from the comparison page is stored alongside
the print source as `ECE723_SectionIII_Bilingual.pdf`.

The Section IV edition uses the same layout and rendering process. It contains
all 25 heading/guide pairs and equations (231)–(365), saved as
`assets/downloads/ECE723_SectionIV_Bilingual.html` and `.pdf`.

The comparison page loads the shared `tools/highlights/hl.js` notes interface
with `data-bilingual-notes`. Selection highlights and block notes attach to
stable paragraph, guide or equation IDs. All three language views share the
`notes:bilingual.html` browser store. Cmd+K / Ctrl+K toggles the notes panel;
JSON backup/restore and Markdown export are available there. Print sources do
not load the notes interface. Existing guided readers keep their own stores.
