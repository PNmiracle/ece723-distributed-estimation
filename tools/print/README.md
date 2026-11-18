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
