import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useInvestorFunds } from "../../FundManager/hooks/useInvestorFunds";
import { useAppSelector } from "../../Redux/hooks";
import CustomTable from "../../Components/Table/CustomTable";
import { X } from "lucide-react";
import SignaturePad from "react-signature-pad-wrapper";
import toast from "react-hot-toast";
import { useInvestorDocuments } from "../hooks/useInvestorDocuments";
import { Document, Page, pdfjs } from "react-pdf";
import type { InvestorFundSummary } from "../../API/Endpoints/Funds/funds";
import { PDFDocument } from "pdf-lib";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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

const SubscriptionDocuments = () => {
  const [fundsData, setFundsData] = useState<InvestorFundSummary[]>([]);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const { user } = useAuth();
  const [signature, setSignature] = useState<string | null>(null);
  const [currentFund, setCurrentFund] = useState<InvestorFundSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mode, setMode] = useState<"signature" | "date" | null>(null);
  const [placements, setPlacements] = useState<PagePlacement[]>([]);
  const [signatureSize, setSignatureSize] = useState<number>(0.5);
  const [dateFontSize, setDateFontSize] = useState<number>(12);
  const [dateText, setDateText] = useState<string>(new Date().toLocaleDateString());
  const [dragging, setDragging] = useState<{ index: number; type: "signature" | "date" } | null>(null);
  const { signAndUploadDocument } = useInvestorDocuments();

  const padRef = useRef<SignaturePad>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const { isLoading } = useInvestorFunds();
  const funds = useAppSelector((state) => state.investorFunds.funds);

  useEffect(() => {
    if (funds && funds.length > 0) {
      setFundsData(funds);
    }
  }, [isLoading, funds, user]);

  const handleAgreement = (fund: InvestorFundSummary) => {
    if (fund) {
      setCurrentFund(fund);
      setPdfSrc(fund.investors[0].documentUrl);
      setPlacements([]);
      setCurrentPage(1);
    } else {
      toast.error("Something went wrong, please try again later");
    }
  };

  const handleSaveSignature = () => {
    const dataURL = padRef.current?.toDataURL("image/png");
    if (dataURL) {
      setSignature(dataURL);
    } else {
      setSignature(null);
    }
  };

  const handleMouseDown = (index: number, type: "signature" | "date") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging({ index, type });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPlacements((prev) =>
      prev.map((p, i) =>
        i === dragging.index
          ? { ...p, [dragging.type]: { ...p[dragging.type]!, x, y } }
          : p
      )
    );
  };


  const handleMouseUp = () => {
    setDragging(null);
  };

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfContainerRef.current || !mode || dragging) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top; // Corrected here

    const newPlacement: PagePlacement = {
      page: currentPage,
      [mode]: {
        x,
        y,
        width: mode === "signature" ? 100 * signatureSize : 100,
        height: mode === "signature" ? 50 * signatureSize : 20,
        fontSize: mode === "date" ? dateFontSize : undefined,
      },
    };

    setPlacements((prev) => {
      const existing = prev.find((p) => p.page === currentPage);
      if (existing) {
        return prev.map((p) =>
          p.page === currentPage ? { ...p, [mode]: newPlacement[mode] } : p
        );
      }
      return [...prev, newPlacement];
    });
  };


  const handleSignPdf = async () => {
    if (!signature && placements.some((p) => p.signature)) {
      toast.error("Please provide a signature");
      return;
    }

    if (!currentFund || !currentFund.investors || currentFund.investors.length === 0) {
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
      console.log("placments before Y-flip", placements);

      // Load the PDF to get the page height(s)
      const response = await fetch(currentFund.investors[0].documentUrl);
      const pdfBuffer = new Uint8Array(await response.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      const transformedPlacements = placements.map((placement) => {
        const page = pdfDoc.getPage(placement.page - 1);
        const { height: pageHeight } = page.getSize();

        const updatedPlacement: PagePlacement = { page: placement.page };

        if (placement.signature) {
          updatedPlacement.signature = {
            ...placement.signature,
            y: pageHeight - placement.signature.y - placement.signature.height,
          };
        }

        if (placement.date) {
          const fontSize = placement.date.fontSize || 12;
          updatedPlacement.date = {
            ...placement.date,
            y: pageHeight - placement.date.y - fontSize,
          };
        }

        return updatedPlacement;
      });

      console.log("placements after Y-flip", transformedPlacements);

      await signAndUploadDocument(
        currentFund.id,
        currentFund.investors[0].investorId,
        currentFund.investors[0].documentUrl,
        signature || "",
        dateText,
        transformedPlacements
      );

      setPdfSrc(null);
      setCurrentFund(null);
      setSignature(null);
      setPlacements([]);
      toast.success("PDF Agreement Updated!");
    } catch (error) {
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

  const applyToAllPages = () => {
    const currentPlacement = placements.find((p) => p.page === currentPage);
    if (!currentPlacement) return;

    const newPlacements: PagePlacement[] = [];
    for (let i = 1; i <= numPages; i++) {
      newPlacements.push({
        page: i,
        signature: currentPlacement.signature,
        date: currentPlacement.date,
      });
    }
    setPlacements(newPlacements);
  };

  const clearCurrentPage = () => {
    setPlacements((prev) => prev.filter((p) => p.page !== currentPage));
  };

  const clearAllPages = () => {
    setPlacements([]);
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
            onClick={() => handleAgreement(row)}
            className="bg-theme-sidebar-accent text-white px-4 py-3 rounded-[10px] cursor-pointer min-w-[130px]"
          >
            Signed
          </button>
        ) : (
          <button
            onClick={() => handleAgreement(row)}
            className="bg-[#9E9E9E] text-white px-4 py-3 rounded-[10px] cursor-pointer min-w-[130px]"
          >
            Sign Now
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Funding List
        </h1>
      </div>
      <CustomTable columns={columns} data={fundsData} />

      {pdfSrc && (
        <div
          onClick={() => {
            setPdfSrc(null);
            setCurrentFund(null);
            setSignature(null);
            setPlacements([]);
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[40px] w-[90%] max-w-4xl max-h-[90vh] relative p-8 font-poppins flex"
          >
            <button
              onClick={() => {
                setPdfSrc(null);
                setCurrentFund(null);
                setSignature(null);
                setPlacements([]);
              }}
              className="p-2 hover:bg-gray-100 rounded absolute right-5 top-5 z-10"
            >
              <X className="w-6 h-6 text-theme-primary-text" />
            </button>

            {isDocumentSigned() ? (
              <div className="w-full relative">
                <h2 className="text-lg font-semibold mb-4 text-theme-primary-text text-center">
                  Signed Agreement Document
                </h2>
                <div className="w-full h-[80vh] overflow-auto">
                  <Document
                    file={pdfSrc}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    <Page
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={800}
                    />
                  </Document>
                </div>
                <div className="flex justify-center mt-4">
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="w-32 p-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent"
                  >
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        Page {page}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                {/* Sidebar for Controls */}
                <div className="w-1/4 pr-4 border-r">
                  <h2 className="text-lg font-semibold mb-4 text-theme-primary-text">
                    Document Signing
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Mode</label>
                    <select
                      value={mode || ""}
                      onChange={(e) =>
                        setMode(e.target.value as "signature" | "date" | null)
                      }
                      className="w-full p-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent"
                    >
                      <option value="">Select Mode</option>
                      <option value="signature">Signature</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  {mode === "signature" && (
                    <>
                      <SignaturePad
                        ref={padRef}
                        options={{
                          minWidth: 1,
                          backgroundColor: "rgba(255,255,255,1)",
                        }}
                        canvasProps={{
                          width: 200,
                          height: 100,
                          className: "border rounded",
                        }}
                      />
                      <div className="flex justify-between mt-2 gap-2">
                        <button
                          className="bg-theme-sidebar-accent text-white text-sm px-2 py-1.5 rounded flex-1"
                          onClick={handleSaveSignature}
                        >
                          Save
                        </button>
                        <button
                          className="bg-[#9E9E9E] text-white text-sm px-2 py-1.5 rounded flex-1"
                          onClick={() => {
                            setSignature(null);
                            padRef.current?.clear();
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">
                          Signature Size
                        </label>
                        <input
                          type="range"
                          min="0.2"
                          max="2"
                          step="0.1"
                          value={signatureSize}
                          onChange={(e) => setSignatureSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                  {mode === "date" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Date
                        </label>
                        <input
                          type="text"
                          value={dateText}
                          onChange={(e) => setDateText(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Date Font Size
                        </label>
                        <input
                          type="range"
                          min="8"
                          max="24"
                          step="1"
                          value={dateFontSize}
                          onChange={(e) => setDateFontSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Page</label>
                    <select
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent"
                    >
                      {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      className="bg-theme-sidebar-accent text-white text-sm px-2 py-1.5 rounded"
                      onClick={applyToAllPages}
                    >
                      Apply to All Pages
                    </button>
                    <button
                      className="bg-[#9E9E9E] text-white text-sm px-2 py-1.5 rounded"
                      onClick={clearCurrentPage}
                    >
                      Clear Current Page
                    </button>
                    <button
                      className="bg-[#9E9E9E] text-white text-sm px-2 py-1.5 rounded"
                      onClick={clearAllPages}
                    >
                      Clear All Pages
                    </button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div
                  className="w-3/4 pl-4 relative"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <h2 className="text-lg font-semibold mb-4 text-theme-primary-text text-center">
                    Agreement Document
                  </h2>
                  <div
                    ref={pdfContainerRef}
                    className="relative w-full h-[70vh] overflow-auto"
                    onClick={handlePdfClick}
                  >
                    <Document
                      file={pdfSrc}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                      <Page
                        pageNumber={currentPage}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={600}
                      />
                      {placements
                        .filter((p) => p.page === currentPage)
                        .map((p, index) => (
                          <div key={index}>
                            {p.signature && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: p.signature.x,
                                  top: p.signature.y,
                                  width: p.signature.width,
                                  height: p.signature.height,
                                  background: `url(${signature}) no-repeat center/contain`,
                                  cursor: dragging ? "grabbing" : "grab",
                                }}
                                onMouseDown={handleMouseDown(index, "signature")}
                              />
                            )}
                            {p.date && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: p.date.x,
                                  top: p.date.y,
                                  width: p.date.width,
                                  height: p.date.height,
                                  lineHeight: `${p.date.height}px`,
                                  fontSize: p.date.fontSize,
                                  color: "black",
                                  cursor: dragging ? "grabbing" : "grab",
                                }}
                                onMouseDown={handleMouseDown(index, "date")}
                              >
                                {dateText}
                              </div>
                            )}
                          </div>
                        ))}
                    </Document>
                  </div>

                  <div className="flex justify-center items-center mt-4">
                    <button
                      disabled={placements.length === 0 || loading}
                      onClick={handleSignPdf}
                      className="bg-theme-sidebar-accent disabled:bg-[#9E9E9E] disabled:cursor-not-allowed p-3 w-full max-w-[180px] rounded-[10px] text-white text-sm font-medium"
                      title={placements.length === 0 ? "Please add at least one signature or date" : ""}
                    >
                      {loading ? "Signing..." : "Agreed"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDocuments;