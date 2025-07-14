// src/hooks/useInvestorDocuments.ts

import { useUpdateInvestorDocument } from "../../API/Endpoints/Funds/investors";
import { signPdf } from "../../utils/signPdf";

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

export const useInvestorDocuments = () => {
  const updateDocumentMutation = useUpdateInvestorDocument();

  const signAndUploadDocument = async (
    fundId: string,
    investorId: string,
    originalPdfUrl: string,
    signature: string,
    dateText: string,
    placements: PagePlacement[]
  ) => {
    try {
      const pdfBuffer = await fetch(originalPdfUrl).then((res) =>
        res.arrayBuffer()
      );
      const signedPdfBytes = await signPdf(
        new Uint8Array(pdfBuffer),
        signature,
        dateText,
        placements
      );

      const signedPdfFile = new File(
        [signedPdfBytes],
        `signed-document-${investorId}.pdf`,
        { type: "application/pdf" }
      );

      const response = await updateDocumentMutation.mutateAsync({
        fundId,
        investorId,
        document: signedPdfFile,
        status: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    signAndUploadDocument,
    isLoading: updateDocumentMutation.isPending,
    error: updateDocumentMutation.error,
  };
};
