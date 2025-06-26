import {
  PenLine,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFundById } from "../../hooks/useFundById";
import { useAppSelector } from "../../../Redux/hooks";
import BasicLoader from "../../../Components/Loader/BasicLoader";

const fundingData = {
  allInvestors: 200,
  totalFundsNeeded: "$18000",
  fundsCollected: "84%",
};

const Overview = () => {
  const { id } = useParams<{ id: string }>();
  const [fundData, setFundData] = useState({});
  const { isLoading, error } = useFundById(id || "");
  const fund = useAppSelector((state) => state.funds.currentFund);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const documents = fundData?.documents || [];

  const openPdfModal = (pdfUrl, index = 0) => {
    setSelectedPdf(pdfUrl);
    setCurrentDocIndex(index);
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPdf("");
    setCurrentDocIndex(0);
  };

  const navigateToDocument = (direction) => {
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
      setFundData(fund?.result || {});
    } else {
      console.log("No fund data available");
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
            <h2 className="text-base lg:text-lg font-semibold  text-theme-primary-text">
              {fundData.projectName}
            </h2>
            <span className="text-sm text-theme-secondary-text  font-semibold font-poppins ">
              {fundData.date}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Type
              </div>
              <div className="text-theme-secondary-text">
                {fundData.fundType}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Size
              </div>
              <div className="text-theme-secondary-text">
                {fundData.fundSize}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target Geographies
              </div>
              <div className="text-theme-secondary-text">
                {fundData.targetGeographies}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target Sectors
              </div>
              <div className="text-theme-secondary-text">
                {fundData.targetSectors}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target MOIC
              </div>
              <div className="text-theme-secondary-text">
                {fundData.targetMOIC}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Target IRR
              </div>
              <div className="text-theme-secondary-text">
                {fundData.targetIRR}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Minimum Investment
              </div>
              <div className="text-theme-secondary-text">
                {fundData.minimumInvestment}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-theme-primary-text mb-1">
                Fund Lifetime
              </div>
              <div className="text-theme-secondary-text">
                {fundData.fundLifetime}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-theme-primary-text mb-2">
              Fund Description
            </div>
            <div className="text-theme-secondary-text text-sm leading-relaxed bg-gray-100 border p-4 rounded-lg">
              {fundData.fundDescription}
            </div>
          </div>

          {/* Fundraising Documents */}
          {/* <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Fundraising Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-theme-primary-text mb-1">
                  All Investors
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.allInvestors}
                </div>
              </div>
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-theme-primary-text mb-1">
                  Total Funds Needed
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.totalFundsNeeded}
                </div>
              </div>
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"
                      ></div>
                    ))}
                    <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white">5+</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-theme-primary-text mb-1">
                  Funds Collected
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.fundsCollected}
                </div>
              </div>
            </div>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className=" border rounded-lg p-4 text-center">
              <div className="flex items-center justify-start my-3  gap-4">
                <div className="text-lg text-theme-secondary-text font-medium">
                  Fundraising Documents
                </div>
              </div>

              {/* <div className="text-2xl font-bold text-gray-900  mt-10 bg-gray-100 rounded-[10px] p-4 w-[50%] mx-auto relative"></div> */}
              <button
                onClick={() => openPdfModal(fundData?.documents[0]?.fileUrl, 0)}
                className="bg-theme-sidebar-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mt-8 mb-8"
                disabled={!fundData?.documents?.length}
              >
                View Docs ({fundData?.documents?.length})
              </button>
            </div>
            {/* All Investors */}
            <div className=" border rounded-lg p-4 text-center">
              <div className="flex items-center justify-start my-3  gap-4">
                <div className="w-12 h-12 bg-theme-sidebar-accent rounded-full flex items-center justify-center ">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg text-theme-secondary-text font-medium">
                  All Investors
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900  mt-8 mb-8 bg-gray-100 rounded-[10px] p-4 w-[50%] mx-auto relative  text-theme-sidebar-accent">
                <div className="h-3 w-3 bg-gray-100  absolute left-3 rotate-45 bottom-[-6px]" />

                {fundData?.investors?.length || 0}
              </div>
            </div>

            <div className=" border rounded-lg p-4 text-center">
              <div className="flex items-center justify-start my-3  gap-4">
                <div className="w-12 h-12 bg-theme-sidebar-accent rounded-full flex items-center justify-center ">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg text-theme-secondary-text font-medium">
                  Total Funds Needed
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900  mt-8 mb-8 bg-gray-100 rounded-[10px] p-4 w-[50%] min-w-[50%] mx-auto relative  text-theme-sidebar-accent">
                <div className="h-3 w-3 bg-gray-100  absolute left-3 rotate-45 bottom-[-6px]" />

                {fundData?.fundSize || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] h-full relative pt-8 font-poppins ">
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
                  {documents.map((_, index) => (
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
