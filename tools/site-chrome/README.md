# Shared site header and contents controls

`inject.py` adds the shared CSS and script to all ten root website pages. It is
idempotent and deliberately excludes downloadable print sources. The complete
build invokes it last; the comparison-page builder also reapplies it when either
comparison reader is regenerated on its own.

`chrome.js` adapts each existing contents panel and toolbar, or supplies a small
utility bar and section outline on pages without them. The Contents button
removes/restores the sidebar column and stores the global preference in
`ece723:contents-visible`. Existing contents links and handlers are retained.

`chrome.css` keeps desktop controls on one compact row. At 900px and below,
the title and controls use at most two rows; controls scroll horizontally rather
than wrapping further. Controls remain keyboard accessible and no action is
removed. Print styles hide the added controls.

Reading-page headers keep only contents, notes, continuous highlighting, language
switching, and the font-size control where available. Search, equation jump, PDF
links and other secondary actions live under More tools in the contents panel.
Cmd+K search remains available independently of that panel.
