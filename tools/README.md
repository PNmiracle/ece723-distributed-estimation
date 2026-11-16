# tools/ — plain-language callouts for reading.html / reading-en.html

Every equation (1)–(492) on the two reading pages is followed by a green callout
("人话 · 式 (n)" / "In plain words · Eq. (n)") with:

- **符号速查 / Symbol cheat sheet** — each symbol in the equation, explained plainly;
- **读法 / Say** — pronunciation for hard-to-read symbols (added automatically from `say.js`);
- **这条式子在说什么 / What it says** — the plain explanation.

The callouts are generated from the data files here and written straight into the HTML,
so the published site needs no build step.

## Files

| File | What it is |
|---|---|
| `data/sec-*.js` | The content, one file per section. Each exports `{ zh: { notes, syms }, en: { notes, syms } }`. `notes[n]` is a list of paragraphs; `syms[n]` is a list of `[TeX, meaning]` rows. Text can contain inline math as `$...$` and `<b>` tags. |
| `say.js` | Pronunciation dictionary (Greek letters, script letters, ⪯, ≍, ⊗, sup/inf, hat/tilde, …). A symbol's reading is shown the first time it appears in a callout. |
| `build.js` | Rebuilds the callouts of one section on one page (replaces existing ones, inserts missing ones, keeps the CSS in sync). |
| `build_all.sh` | Runs `build.js` for every section on both pages. |
| `extract.py` | Dumps a section's text, TeX, and image-only equations (as contact-sheet PNGs) into `tools/.work/` — handy when writing new explanations. |
| `check.py` | Opens both pages in headless Chrome and reports KaTeX errors and callout counts per section. |

## Editing an explanation

1. Find the equation number in `data/` (e.g. eq. 434 is in `data/sec-v-c.js`) and edit the `zh` and/or `en` entry.
2. Rebuild that section (or everything):

   ```bash
   npm install katex            # once
   bash tools/build_all.sh sec-v-c
   ```

3. Optionally check rendering: `pip install playwright && python3 tools/check.py sec-v-c`.
4. Commit `reading.html`, `reading-en.html` and the changed data file.

To add a pronunciation, add a row to the `D` list in `say.js` (regex on the TeX, glyph, English reading, Chinese reading), then run `bash tools/build_all.sh`.

`build.js` throws on any KaTeX error, so a typo in the TeX stops the build instead of reaching the site.
