#!/usr/bin/env python3
"""Estrae testo (pypdf) e immagini delle pagine (pymupdf, 110 dpi) da un PDF.

Uso: python scripts/estrai-pdf.py <file.pdf> [cartella_uscita]
Default cartella di uscita: cartella temporanea di sistema.
Non scrivere dentro il repository, tranne in dati/ (escluso da git).
"""
import sys
import tempfile
from pathlib import Path

import fitz  # pymupdf
from pypdf import PdfReader


def main():
    if len(sys.argv) < 2:
        print("Uso: estrai-pdf.py <file.pdf> [cartella_uscita]", file=sys.stderr)
        sys.exit(2)
    sys.stdout.reconfigure(encoding="utf-8")
    pdf = Path(sys.argv[1])
    if len(sys.argv) > 2:
        out = Path(sys.argv[2])
        out.mkdir(parents=True, exist_ok=True)
    else:
        out = Path(tempfile.mkdtemp(prefix="piano-pdf-"))

    reader = PdfReader(str(pdf))
    for i, page in enumerate(reader.pages, 1):
        print(f"===== PAGINA {i} =====")
        print(page.extract_text() or "")

    doc = fitz.open(str(pdf))
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(dpi=110)
        pix.save(str(out / f"pagina-{i}.png"))
    print(f"\nImmagini salvate in: {out}")


if __name__ == "__main__":
    main()
