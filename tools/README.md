# tools/ — plain-language callouts for reading.html / reading-en.html

Every equation (1)–(492) on the two reading pages is followed by a green callout
("人话 · 式 (n)" / "In plain words · Eq. (n)") with:

- **符号速查 / Symbol cheat sheet** — each symbol in the equation, explained plainly;
- **读法 / Say** — pronunciation for hard-to-read symbols (added automatically from `say.js`);
- **是什么 / 有什么用 · What / Why it matters** — a one-line gist at the very top (stays visible when the callout is folded);
- **必读 / Core**, **关键推导 / Proof step**, or **推导细节 / Detail** — a suggested reading priority, also visible when folded;
- **这条式子在说什么 / What it says** — the plain explanation.

Selected paragraphs also end with a small **举个例子 / Example** button. It opens a short example in the existing note popover.

The callouts are generated from the data files here and written straight into the HTML,
so the published site needs no build step.

## Files

| File | What it is |
|---|---|
| `data/sec-*.js` | The content, one file per section. Each exports `{ zh: { notes, syms }, en: { notes, syms } }`. `notes[n]` is a list of paragraphs; `syms[n]` is a list of `[TeX, meaning]` rows. Text can contain inline math as `$...$` and `<b>` tags. |
| `gist/gist.json`, `gist/levels.js`, `gist/inject.js` | Bilingual quick explanations (`[what, why]` per equation) and suggested priorities. `node tools/gist/inject.js` writes them into both pages. |
| `notes/bridges.js` + `notes/inject-bridges.js` | Short examples in both languages, keyed by the numbered equation that follows the original prose. `node tools/notes/inject-bridges.js` updates the note buttons and their popovers. |
| `term-zh/terms.tsv`, `term-zh/inject.py` | English spellings and their Chinese equivalents. After editing the list, run `python3 tools/term-zh/inject.py` to refresh the annotations in `reading-en.html`. |
| `term-en/extra.tsv`, `term-en/inject.py` | English equivalents shown after Chinese terms in `reading.html` (once per paragraph, skipped where the text already gives the English in parentheses; switch: 英文术语 开/关). The table is `term-zh/terms.tsv` inverted, plus `extra.tsv` for wording only the Chinese reader uses (`-` = match but add nothing). After editing either list, run `python3 tools/term-en/inject.py`. |
| `plain-zh/inject.py` | Generates the English cards' “中文解读” disclosures and their shared data file from the rendered Chinese callouts. `build_all.sh` refreshes both outputs. |
| `converse/bridges.tsv`, `converse/build.js` | Bilingual links between the steps of the lower-bound proof; `node tools/converse/build.js` regenerates `converse.html`. |
| `say.js` | Pronunciation dictionary (Greek letters, script letters, ⪯, ≍, ⊗, sup/inf, hat/tilde, …). A symbol's reading is shown the first time it appears in a callout. |
| `build.js` | Rebuilds the callouts of one section on one page (replaces existing ones, inserts missing ones, keeps the CSS in sync). |
| `build_all.sh` | Runs `build.js` for every section on both pages. |
| `extract.py` | Dumps a section's text, TeX, and image-only equations (as contact-sheet PNGs) into `tools/.work/` — handy when writing new explanations. |
| `check.py` | Opens both pages in headless Chrome and reports KaTeX errors and callout counts per section. |

## Editing an explanation

1. For the short explanation or the priority label, edit `gist/gist.json` or `gist/levels.js`. For expanded explanations, find the equation in `data/` (e.g. eq. 434 is in `data/sec-v-c.js`) and edit the `zh` and/or `en` entry.
2. Rebuild that section (or everything):

   ```bash
   npm install katex            # once
   bash tools/build_all.sh sec-v-c
   ```

3. Optionally check rendering: `pip install playwright && python3 tools/check.py sec-v-c`.
4. Commit `reading.html`, `reading-en.html` and the changed data file.

To add a pronunciation, add a row to the `D` list in `say.js` (regex on the TeX, glyph, English reading, Chinese reading), then run `bash tools/build_all.sh`.

`build.js` throws on any KaTeX error, so a typo in the TeX stops the build instead of reaching the site.

## Highlights & notes (`highlights/`)

`hl.js` + `hl.css` add highlighting and note-taking to the reading pages:
select paper text, an equation explanation or a section guide → color toolbar (or press **H** / **N**); hover a formula → "＋ 笔记";
press **Option+Q** (**Alt+Q** on Windows) or click **Auto highlight / 连续高亮** to save each text selection in yellow without the toolbar; press the shortcut again or **Esc** to stop;
while Auto highlight is on, press **Cmd+Z** (**Ctrl+Z** on Windows) to undo the latest auto highlight on this page;
"🖍 笔记" in the top bar opens the list with filters, jump-to, Markdown export and JSON backup/restore.
Everything is stored in the reader's browser (`localStorage`, key `notes:<page>`); highlights are anchored by
section id + text offsets with a quote/context fallback, so they survive regenerated callouts.
Highlights are temporarily removed while the page's ✎ edit mode is on, so they never end up in saved edits.

After editing `hl.js` / `hl.css`, re-insert them (idempotent):

```bash
python3 tools/highlights/inject.py reading.html reading-en.html
```

## Recommended videos (`videos/`)

`videos/data.py` lists 17 recommended videos (or slide ranges) in viewing order. For each one it gives
the exact episode or time range, the duration, the language, the reason to watch, and the roadmap cards
and paper sections it supports. `videos/inject.py` writes them into the pages:

- **roadmap.html / roadmap-en.html** — a "📺 Video path" section above the concept map (`#videos`),
  a top-bar link, and a "Recommended videos" box in each related card;
- **reading.html / reading-en.html** — a "Companion videos" box at the end of the related section guides,
  a pointer in the one-page overview and a top-bar link.
  Finer-grained boxes too: chapter guides (`CHAPTERS`), right under sub-headings (`SUBS`, an ordered
  prerequisite list, e.g. `sec-ii-b-s2` for the Bernstein score condition) and right under the
  plain-language box of key equations (`EQS`). Each item says what to watch, how long, and why.
  Extra clips used only on the reading pages live in `CLIPS`.
  Every section and sub-heading has a box; where no video fits, the box (`items=[]`) says how to read
  that part instead. All video boxes are `<details>` and start folded; the Video-path section stays open.

After editing `data.py`:

```bash
python3 tools/videos/inject.py
```

The script is idempotent: inserted HTML sits between `<!--vid:…-->` / `<!--/vid-->` markers and is
replaced on every run. Boxes carry `data-hl-ui` (ignored by the highlighter) and their own `id`, so
existing highlights and saved in-page edits keep their anchors.

## Sub-heading guides (`subguide/`)

Every sub-heading (`<h4 class="sub-h">`, 61 on each reading page, numbered and unnumbered) is followed by a
small blue **本段导读 / Guide** box: *这段干什么 / What this part does* + *核心 / Key point*. Text lives in
`subguide/subguide.json` (keyed by the heading id; zh and en ids are identical). After editing:

```bash
node tools/subguide/inject.js      # idempotent; keeps the box directly under the heading
python3 tools/videos/inject.py     # (optional) video boxes then follow the guide
```

If headings are renumbered with `tools/toc/subheads.py`, check that the ids in `subguide.json` still match.
