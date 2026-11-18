# Converse print editions

The Section III speaker editions retain equations (73)-(230), the full
plain-language panels, diagrams, symbol sheets and speaking notes.

After producing the color speaker HTML, add reading priorities before making
the monochrome edition:

```sh
python3 tools/print/converse_priorities.py /path/to/color-speaker.html
python3 tools/print/converse_monochrome.py /path/to/color-speaker.html /path/to/monochrome-speaker.html
```

Print each self-contained HTML with a browser PDF renderer using its CSS page
size and margins, background graphics enabled, and no browser headers/footers.

`converse_priorities.json` records the study-guide judgment: 28 core steps,
64 important supports, and 66 proof details to skim on a first pass. These are
learning priorities, not importance labels assigned by the paper. Skimming
defers derivation, not the statement's assumptions or conclusion. The initial
route table and five section notes identify which conclusions to retain; the
Gaussian branch is identified separately. Every formula receives a label, and
solid/dashed borders make the distinction work in monochrome as well as color.

The priority pass asserts that all displayed formulas and explanation panels
remain unchanged. Both passes preserve all 158 formula cards.

## Refresh from the website

`sync_converse_color.py` refreshes the existing speaker layout using the current
English reader. It retains all 158 displayed formulas, copies the current
explanations, diagrams, speaking notes and repeated symbol tables, and inserts
all 22 paragraph guides beneath their matching subheadings. It preserves the
compact two-column layout and A4 sizing.

```sh
python3 tools/print/sync_converse_color.py
```

The reusable print source is
`assets/downloads/ECE723_Converse_Color_Speaker.html`; render it to the PDF with
the same basename. Long symbol keys receive a separate full-width line within
their column, and speaking paragraphs stay intact while formula frames may split.
The English reader remains the content source; the print HTML supplies the layout.
