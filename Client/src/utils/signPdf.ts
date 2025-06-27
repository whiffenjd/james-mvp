import { PDFDocument } from "pdf-lib";

export async function signPdf(pdfBuffer: Uint8Array, signatureDataURL: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const pngImage = await pdfDoc.embedPng(signatureDataURL);
  const pngDims = pngImage.scale(0.5);

  const { width } = firstPage.getSize();

  // Draw signature in bottom-right corner
  firstPage.drawImage(pngImage, {
    x: width - pngDims.width - 50,
    y: 50,
    width: pngDims.width,
    height: pngDims.height,
  });

  const signedPdfBytes = await pdfDoc.save();
  return signedPdfBytes;
}
