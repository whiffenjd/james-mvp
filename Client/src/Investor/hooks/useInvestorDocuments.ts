// src/hooks/useInvestorDocuments.ts

import { useUpdateInvestorDocument } from "../../API/Endpoints/Funds/investors";
import { signPdf } from "../../utils/signPdf";


export const useInvestorDocuments = () => {
  const updateDocumentMutation = useUpdateInvestorDocument();

  const signAndUploadDocument = async (
    fundId: string,
    investorId: string,
    originalPdfUrl: string,
    signature: string
  ) => {
    try {
      // Fetch the original PDF
      const pdfBuffer = await fetch(originalPdfUrl).then((res) =>
        res.arrayBuffer()
      );

      // Sign the PDF (assuming signPdf is available)
      const signedPdfBytes = await signPdf(new Uint8Array(pdfBuffer), signature);

      // Create a File object from the signed PDF
      const signedPdfFile = new File(
        [signedPdfBytes],
        `signed-document-${investorId}.pdf`,
        { type: "application/pdf" }
      );

      // Upload the signed document and update status
      const response = await updateDocumentMutation.mutateAsync({
        fundId,
        investorId,
        document: signedPdfFile,
        status: true,
      });

      // Update Redux store with the new document info
    //   dispatch(
    //     updateInvestorDocument({
    //       investorId,
    //       documentUrl: response.data.investor.documentUrl,
    //       status: response.data.investor.status,
    //     })
    //   );

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