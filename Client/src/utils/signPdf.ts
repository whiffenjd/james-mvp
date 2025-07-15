// src/utils/signPdf.ts

import { PDFDocument, rgb } from "pdf-lib";

interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
}

interface PagePlacement {
  page: number;
  signature?: Placement;
  date?: Placement;
}

export async function signPdf(
  pdfBuffer: Uint8Array,
  signatureDataURL: string,
  dateText: string,
  placements: PagePlacement[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const font = await pdfDoc.embedFont("Helvetica");

  for (const placement of placements) {
    const page = pdfDoc.getPage(placement.page - 1);

    if (placement.signature && signatureDataURL) {
      const pngImage = await pdfDoc.embedPng(signatureDataURL);
      page.drawImage(pngImage, {
        x: placement.signature.x,
        y: placement.signature.y,
        width: placement.signature.width,
        height: placement.signature.height,
      });
    }

    if (placement.date && dateText) {
      console.log("placment date", placement.date);
      console.log("date text", dateText);
      page.drawText(dateText, {
        x: placement.date.x,
        y: placement.date.y,
        size: placement.date.fontSize || 12,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  const signedPdfBytes = await pdfDoc.save();
  return signedPdfBytes;
}
