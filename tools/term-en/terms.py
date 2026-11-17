"""Chinese → English term table for the Chinese reader (reading.html)."""
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load():
    terms = {}
    # Invert the English → Chinese list: its first spelling is the canonical English term.
    for line in (HERE.parent / "term-zh" / "terms.tsv").read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        zh, spellings = line.split("\t")
        terms.setdefault(zh.strip(), spellings.split("|")[0].strip())
    for n, line in enumerate((HERE / "extra.tsv").read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        zh, en = line.split("\t")
        if not zh.strip() or not en.strip():
            raise ValueError(f"extra.tsv line {n}: empty field")
        terms[zh.strip()] = en.strip()
    # Never annotate single characters other than 熵: they occur inside unrelated words.
    return {zh: en for zh, en in terms.items() if len(zh) > 1 or zh == "熵"}
