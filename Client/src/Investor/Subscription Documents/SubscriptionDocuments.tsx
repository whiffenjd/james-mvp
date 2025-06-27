import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useInvestorFunds } from "../../FundManager/hooks/useInvestorFunds";
import { useAppSelector } from "../../Redux/hooks";
import CustomTable from "../../Components/Table/CustomTable";
import { X } from "lucide-react";
import SignaturePad from "react-signature-pad-wrapper";
import toast from "react-hot-toast";
import { useInvestorDocuments } from "../hooks/useInvestorDocuments";
import type { InvestorFundSummary } from "../../API/Endpoints/Funds/funds";

const SubscriptionDocuments = () => {
  const [fundsData, setFundsData] = useState<InvestorFundSummary[]>([]);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const { user } = useAuth();
  const [signature, setSignature] = useState<string | null>(null);
  const [currentFund, setCurrentFund] = useState<InvestorFundSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { signAndUploadDocument } = useInvestorDocuments();

  const padRef = useRef<SignaturePad>(null);

  const handleSave = () => {
    const dataURL = padRef.current?.toDataURL("image/png");
    // setSignature(dataURL);
    if (dataURL) {
      setSignature(dataURL);
    } else {
      setSignature(null);
    }
  };

  const { isLoading } = useInvestorFunds();
  const funds = useAppSelector((state) => state.investorFunds.funds);

  useEffect(() => {
    if (funds && funds?.length > 0) {
      setFundsData(funds);
    }
  }, [isLoading, funds, user]);

  const handleAgreement = (fund: InvestorFundSummary) => {
    if (fund) {
      setCurrentFund(fund);
      setPdfSrc(fund.investors[0].documentUrl);
    } else {
      toast.error("something went wrong, please try again later");
    }
  };

  const handleSignPdf = async () => {
    if (!signature) {
      toast.error("Please sign the document first");
      return;
    }

    if (
      !currentFund ||
      !currentFund.investors ||
      currentFund.investors.length === 0
    ) {
      toast.error("No investors found for this fund");
      return;
    }

    if (!currentFund.investors[0].documentUrl) {
      toast.error("No document URL found for the first investor");
      return;
    }

    if (!currentFund.investors[0].investorId) {
      toast.error("Investor ID is missing");
      return;
    }

    try {
      setLoading(true);

      await signAndUploadDocument(
        currentFund.id,
        currentFund.investors[0].investorId,
        currentFund.investors[0].documentUrl,
        signature
      );

      setPdfSrc(null);
      setCurrentFund(null);
      setSignature(null);
      toast.success("PDF Agreement Updated!");
    } catch (error) {
      // toast.error(`Failed to sign and upload document: ${error.message}`);
      if (error instanceof Error) {
        toast.error(`Failed to sign and upload document: ${error.message}`);
      } else {
        toast.error("Failed to sign and upload document");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDocumentSigned = () => {
    return currentFund?.investors?.[0]?.status === true;
  };

  const columns = [
    {
      title: "Project Name",
      key: "name",
    },
    {
      title: "Total Funding Amount",
      key: "fundSize",
    },
    {
      title: "Status",
      key: "status",
      render: (row: InvestorFundSummary) => (
        <span>{row.investors[0].status ? "Signed" : "Pending"}</span>
      ),
    },
    {
      title: "Details",
      key: "action",
      render: (row: InvestorFundSummary) =>
        row.investors[0].status === true ? (
          <button
            onClick={() => {
              handleAgreement(row);
            }}
            className="bg-theme-sidebar-accent text-white  px-4 py-3 rounded-[10px] cursor-pointer min-w-[130px]"
          >
            Signed
          </button>
        ) : (
          <button
            onClick={() => {
              handleAgreement(row);
            }}
            className="bg-[#9E9E9E]  text-white  px-4 py-3 rounded-[10px] cursor-pointer min-w-[130px]"
          >
            Sign Now
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Funding List
        </h1>
      </div>
      <CustomTable columns={columns} data={fundsData} />

      {pdfSrc && (
        <div
          onClick={() => setPdfSrc(null)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[40px] w-[70%] max-w-2xl max-h-[90vh] relative p-8 font-poppins"
          >
            <button
              onClick={() => setPdfSrc(null)}
              className="p-1 hover:bg-gray-100 rounded absolute right-5 top-5"
            >
              <X className="w-6 h-6 text-theme-primary-text" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-theme-primary-text text-center">
              Agreement Document
            </h2>

            <div className="relative w-full h-[70vh]">
              <iframe
                src={pdfSrc}
                className="w-full h-full border-0 rounded"
                title="Fundraising Document"
              />

              {/* Only show signature pad if document isn't signed */}
              {!isDocumentSigned() && (
                <div className="absolute bottom-4 right-7 bg-white border rounded-lg shadow-lg p-2 z-10">
                  <h3 className="text-sm font-poppins font-medium text-center">
                    Sign Here
                  </h3>
                  <SignaturePad
                    ref={padRef}
                    options={{
                      minWidth: 1,
                      backgroundColor: "rgba(255,255,255,1)",
                    }}
                    canvasProps={{
                      width: "350",
                      height: "200",
                      className: "border rounded",
                    }}
                  />
                  <div className="flex justify-end space-x-2 mt-1">
                    <button
                      className="bg-theme-sidebar-accent text-white text-sm px-2 py-1.5 rounded"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="bg-[#9E9E9E] text-white text-sm px-2 py-1.5 rounded"
                      onClick={() => {
                        setSignature(null);
                        padRef.current?.clear();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Only show sign button if document isn't signed */}
            {!isDocumentSigned() && (
              <div className="flex justify-center items-center mt-4">
                <button
                  disabled={signature === null || loading}
                  onClick={handleSignPdf}
                  className="bg-theme-sidebar-accent disabled:bg-[#9E9E9E] disabled:cursor-not-allowed p-3 w-full max-w-[180px] rounded-[10px] text-white text-sm font-medium"
                  title={
                    signature === null
                      ? "Please sign and save the document first"
                      : ""
                  }
                >
                  {loading ? "Signing..." : "Agreed"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDocuments;
