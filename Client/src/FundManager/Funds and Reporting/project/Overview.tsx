import { Users, TrendingUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFundById } from "../../hooks/useFundById";
import { useAppSelector } from "../../../Redux/hooks";
import BasicLoader from "../../../Components/Loader/BasicLoader";
import type {
  FundDetail,
  FundDocument,
} from "../../../Redux/features/Funds/fundsSlice";
import { HistoryTimeline } from "../../../Components/HistoryTimeline";
import { useAuth } from "../../../Context/AuthContext";
import { formatDateToDDMMYYYY } from "../../../utils/dateUtils";

const Overview = () => {
  const { id } = useParams<{ id: string }>();
  const [fundData, setFundData] = useState<FundDetail | null>(null);
  const { isLoading } = useFundById(id || "");
  const fund = useAppSelector((state) => state.funds.currentFund);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const documents = fundData?.documents || [];
  const { user } = useAuth();

  const openPdfModal = (pdfUrl: string | undefined, index: number = 0) => {
    if (pdfUrl) {
      setSelectedPdf(pdfUrl);
      setCurrentDocIndex(index);
      setShowPdfModal(true);
    }
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPdf("");
    setCurrentDocIndex(0);
  };

  const navigateToDocument = (direction: "next" | "prev") => {
    let newIndex;
    if (direction === "next") {
      newIndex =
        currentDocIndex + 1 >= documents.length ? 0 : currentDocIndex + 1;
    } else {
      newIndex =
        currentDocIndex - 1 < 0 ? documents.length - 1 : currentDocIndex - 1;
    }
    setCurrentDocIndex(newIndex);
    setSelectedPdf(documents[newIndex].fileUrl);
  };

  useEffect(() => {
    if (fund) {
      setFundData({
        ...fund?.result,
      });
    }
  }, [fund, isLoading]);

  if (isLoading) {
    return <BasicLoader />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Project Details */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-theme-primary-text">
              {fundData?.name}
            </h2>
            <span className="text-sm text-theme-secondary-text font-semibold font-poppins">
              {fundData?.createdAt
                ? formatDateToDDMMYYYY(fundData?.createdAt)
                : "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Type
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.fundType}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Size
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.fundSize && fundData?.currency
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: fundData.currency,
                    }).format(Number(fundData.fundSize))
                  : "N/A"}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Currency
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.currency || "N/A"}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target Geographies
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.targetGeographies}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target Sectors
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.targetSectors}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target MOIC
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.targetMOIC}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target IRR
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.targetIRR}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Minimum Investment
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.minimumInvestment && fundData?.currency
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: fundData.currency,
                    }).format(Number(fundData.minimumInvestment))
                  : "N/A"}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Lifetime
              </div>
              <div className="text-theme-secondary-text">
                {fundData?.fundLifetime}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-theme-primary-text mb-2">
              Fund Description
            </div>
            <div className="text-theme-secondary-text text-sm leading-relaxed bg-gray-100 border p-4 rounded-lg">
              {fundData?.fundDescription}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fundraising Documents */}
            <div className="border rounded-lg p-6 text-center min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-start mb-4 gap-4">
                <div className="text-sm text-theme-secondary-text font-medium">
                  Fundraising Documents
                </div>
              </div>
              <button
                onClick={() => openPdfModal(fundData?.documents[0]?.fileUrl, 0)}
                className="bg-theme-sidebar-accent text-white px-4 py-3 rounded-md text-sm font-medium transition-colors w-full max-w-[200px] mx-auto"
                disabled={!fundData?.documents?.length}
              >
                View Docs ({fundData?.documents?.length || 0})
              </button>
            </div>
            {user?.role !== "investor" && (
              <>
                {/* All Investors */}
                <div className="border rounded-lg p-6 text-center min-h-[200px] flex flex-col justify-between">
                  <div className="flex items-center justify-start mb-4 gap-4">
                    <div className="w-8 h-8 bg-theme-sidebar-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-theme-secondary-text font-medium">
                      All Investors
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-2xl font-bold text-theme-sidebar-accent bg-gray-100 rounded-lg p-4 min-w-[80px] mx-auto inline-block">
                      {fundData?.investors?.length || 0}
                    </div>
                    <div className="h-3 w-3 bg-gray-100 absolute left-1/2 transform -translate-x-1/2 rotate-45 -bottom-1.5" />
                  </div>
                </div>

                {/* Required Funds */}
                <div className="border rounded-lg p-6 text-center min-h-[200px] flex flex-col justify-between">
                  <div className="flex items-center justify-start mb-4 gap-4">
                    <div className="w-8 h-8 bg-theme-sidebar-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-theme-secondary-text font-medium">
                      Required Funds
                    </div>
                  </div>
                  <div className="relative group flex justify-center">
                    <div className="text-2xl font-bold text-theme-sidebar-accent bg-gray-100 rounded-lg p-4 min-w-[100px] max-w-[200px] mx-auto inline-block truncate text-center cursor-pointer">
                      {fundData?.fundSize && fundData?.currency
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: fundData.currency,
                            notation: "compact",
                          }).format(Number(fundData.fundSize))
                        : "0"}
                    </div>
                    <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-gray-700 text-sm bg-white px-3 py-1 rounded-lg shadow transition-all duration-500 whitespace-nowrap">
                      {fundData?.fundSize && fundData?.currency
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: fundData.currency,
                          }).format(Number(fundData.fundSize))
                        : "0"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[90vh] overflow-y-auto">
        <HistoryTimeline history={fundData?.history || []} />
      </div>
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] h-full relative pt-8 font-poppins">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fundraising Document {currentDocIndex + 1} of{" "}
                  {documents.length}
                </h3>
                {documents.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateToDocument("prev")}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Previous document"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => navigateToDocument("next")}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Next document"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={closePdfModal}
                className="p-1 hover:bg-gray-100 rounded absolute right-5 top-5"
              >
                <X className="w-6 h-6 text-theme-primary-text" />
              </button>
            </div>
            <div className="flex-1 p-4 h-[75vh]">
              <iframe
                src={selectedPdf}
                className="w-full h-full border-0 rounded"
                title="Fundraising Document"
              />
            </div>
            {documents.length > 1 && (
              <div className="flex justify-center items-center p-4">
                <div className="flex items-center gap-2">
                  {documents.map((_: FundDocument, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentDocIndex(index);
                        setSelectedPdf(documents[index].fileUrl);
                      }}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentDocIndex
                          ? "bg-theme-sidebar-accent"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      title={`Go to document ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
