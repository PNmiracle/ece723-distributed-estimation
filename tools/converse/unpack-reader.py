"""Expose original reader nodes before generators that expect adjacent prose/formulas."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
for name in ['reading.html','reading-en.html']:
    path=ROOT/name;soup=BeautifulSoup(path.read_text(),'html.parser')
    before=[str(x) for x in soup.select('figure.equation,.plain')]
    for card in soup.select('.equation-priority-card'):
        body=card.select_one('.rp-card-body');assert body is not None
        for child in list(body.contents):card.insert_before(child.extract())
        card.decompose()
    for note in soup.select('.speaker-bridge'):note.decompose()
    assert [str(x) for x in soup.select('figure.equation,.plain')]==before
    path.write_text(str(soup))
    print(name,'original prose/formula adjacency restored for generation')
