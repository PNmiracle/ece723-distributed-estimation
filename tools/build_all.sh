#!/bin/bash
# Rebuild every plain-language callout on both reading pages (zh + en).
# Usage (from anywhere):  bash tools/build_all.sh            # all sections
#                         bash tools/build_all.sh sec-v-c    # just one section
set -e
cd "$(dirname "$0")/.."
ONLY="$1"

# section            next anchor   data file              PART (only for sec-vi.js)
SECTIONS="
sec-ii-a             sec-ii-b      sec-ii-a.js            -
sec-ii-b             sec-ii-c      sec-ii-b.js            -
sec-ii-c             sec-iii       sec-ii-c.js            -
sec-iii-a            sec-iii-b     sec-iii-a.js           -
sec-iii-b            sec-iii-c     sec-iii-b.js           -
sec-iii-c            sec-iii-d     sec-iii-c.js           -
sec-iii-d            sec-iii-e     sec-iii-d.js           -
sec-iii-e            sec-iv        sec-iii-e.js           -
sec-iv-a             sec-iv-b      sec-iv-a.js            -
sec-iv-b             sec-iv-c      sec-iv-b.js            -
sec-iv-c             sec-iv-d      sec-iv-c.js            -
sec-iv-d             sec-v         sec-iv-d.js            -
sec-v                sec-v-a       sec-v.js               -
sec-v-a              sec-v-b       sec-v-a.js             -
sec-v-b              sec-v-c       sec-v-b.js             -
sec-v-c              sec-v-d       sec-v-c.js             -
sec-v-d              sec-vi        sec-v-d.js             -
sec-vi               appendix      sec-vi.js              -
appendix             recap         sec-vi.js              app
"

echo "$SECTIONS" | while read -r sec next data part; do
  [ -z "$sec" ] && continue
  [ -n "$ONLY" ] && [ "$ONLY" != "$sec" ] && continue
  [ "$part" = "-" ] && part=""
  for pair in "reading.html zh" "reading-en.html en"; do
    page=${pair% *}; lang=${pair#* }
    PART="$part" node tools/build.js "$page" "$lang" "$sec" "$next" "tools/data/$data"
  done
done

# re-add the one-line "what / why" gists at the top of every callout (build.js rewrites the callouts)
node tools/gist/inject.js
python3 tools/gist/dependencies.py
node tools/notes/inject-bridges.js

# Refresh the inline Chinese terminology annotations on the English page.
python3 tools/term-zh/inject.py

# Refresh the Chinese equation explanations available inside the English cards.
python3 tools/plain-zh/inject.py

# Restore the original illustrations and fill any remaining gaps.
node tools/figs/inject.js
python3 tools/figs/structure.py

# Use mathematical typography in prose, proof maps and supplemental symbol keys.
python3 tools/math/typeset.py reading.html reading-en.html

# Refresh the bilingual lower-bound reader from the guided readers.
node tools/converse/build.js
