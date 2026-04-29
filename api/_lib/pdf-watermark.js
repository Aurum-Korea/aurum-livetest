// Dynamic PDF watermarking.
//
// Adds a low-opacity diagonal stamp to every page identifying the member
// who downloaded the PDF. Designed to deter forwarding — every screenshot
// or sharing of the PDF identifies who leaked it.
//
// Watermark layout (per page):
//   - Diagonal repeating text in muted gold, ~6% opacity
//   - Footer line: "CONFIDENTIAL · <member email> · <timestamp> · DO NOT DISTRIBUTE"

import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export async function watermarkPdf(pdfBuffer, { email, code, timestamp }) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ts = timestamp || new Date().toISOString().slice(0, 16).replace('T', ' ');
  const ident = email || code || 'CONFIDENTIAL';
  const wmText = `${ident} · ${ts}`;
  const footerText = `CONFIDENTIAL · ${ident} · ${ts} · DO NOT DISTRIBUTE`;

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();

    // ── Diagonal repeating watermark (subtle, behind content) ─────────
    // Draw 4 diagonal lines of muted text at low opacity
    const wmFontSize = 14;
    const wmRows = 5;
    const wmCols = 3;
    for (let r = 0; r < wmRows; r++) {
      for (let c = 0; c < wmCols; c++) {
        const x = (c / wmCols) * width + 30;
        const y = (r / wmRows) * height + 30;
        page.drawText(wmText, {
          x, y,
          size: wmFontSize,
          font: helv,
          color: rgb(0.77, 0.65, 0.45),     // gold
          opacity: 0.06,
          rotate: degrees(-30),
        });
      }
    }

    // ── Footer stamp (small, muted, every page) ───────────────────────
    page.drawText(footerText, {
      x: 24,
      y: 18,
      size: 7.5,
      font: helvBold,
      color: rgb(0.54, 0.49, 0.42),         // muted gold
      opacity: 0.65,
    });
  }

  const out = await pdfDoc.save();
  return Buffer.from(out);
}
