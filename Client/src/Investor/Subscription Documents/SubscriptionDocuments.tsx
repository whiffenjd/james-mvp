import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useInvestorFunds } from "../../FundManager/hooks/useInvestorFunds";
import { useAppSelector } from "../../Redux/hooks";
import CustomTable from "../../Components/Table/CustomTable";
import { Calendar, Edit3, MousePointer, X } from "lucide-react";
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
      setShowSignaturePad(false)

    } else {
      setSignature(null);
    }
  };


  const handleMouseDown = (index: number, type: "signature" | "date") => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging({ index, type });
  };

  // const handleMouseMove = (e: React.MouseEvent) => {
  //   if (!dragging || !pdfContainerRef.current) return;

  //   const container = pdfContainerRef.current;
  //   const rect = container.getBoundingClientRect();

  //   // Calculate position relative to the PDF container including scroll offset
  //   const x = e.clientX - rect.left + container.scrollLeft;
  //   const y = e.clientY - rect.top + container.scrollTop;

  //   // Find the PDF page element to get its bounds
  //   const pdfPage = container.querySelector('.react-pdf__Page');
  //   if (!pdfPage) return;

  //   const pageRect = pdfPage.getBoundingClientRect();
  //   const containerRect = container.getBoundingClientRect();

  //   // Calculate position relative to the PDF page
  //   const pageX = e.clientX - pageRect.left;
  //   const pageY = e.clientY - pageRect.top;

  //   // Ensure the signature/date stays within page bounds
  //   const maxX = pdfPage.clientWidth - (dragging.type === "signature" ? 100 * signatureSize : 100);
  //   const maxY = pdfPage.clientHeight - (dragging.type === "signature" ? 50 * signatureSize : 20);

  //   const constrainedX = Math.max(0, Math.min(pageX, maxX));
  //   const constrainedY = Math.max(0, Math.min(pageY, maxY));

  //   setPlacements((prev) =>
  //     prev.map((p, i) =>
  //       i === dragging.index
  //         ? {
  //           ...p,
  //           [dragging.type]: {
  //             ...p[dragging.type]!,
  //             x: constrainedX,
  //             y: constrainedY
  //           }
  //         }
  //         : p
  //     )
  //   );
  // };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !pdfContainerRef.current) return;

    const container = pdfContainerRef.current;
    const pdfPage = container.querySelector('.react-pdf__Page');
    if (!pdfPage) return;

    const pageRect = pdfPage.getBoundingClientRect();

    const pageX = e.clientX - pageRect.left;
    const pageY = e.clientY - pageRect.top;

    // 🧠 Get current dimensions from placements
    const current = placements[dragging.index];
    const item = current[dragging.type];

    if (!item) return;

    const itemWidth = item.width;
    const itemHeight = item.height;

    const maxX = pdfPage.clientWidth - itemWidth;
    const maxY = pdfPage.clientHeight - itemHeight;

    const constrainedX = Math.max(0, Math.min(pageX, maxX));
    const constrainedY = Math.max(0, Math.min(pageY, maxY));

    setPlacements((prev) =>
      prev.map((p, i) =>
        i === dragging.index
          ? {
            ...p,
            [dragging.type]: {
              ...p[dragging.type]!,
              x: constrainedX,
              y: constrainedY,
            },
          }
          : p
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfContainerRef.current || !mode || dragging) return;

    // Get the PDF page element
    const pdfPage = e.currentTarget.querySelector('.react-pdf__Page');
    if (!pdfPage) return;

    const pageRect = pdfPage.getBoundingClientRect();

    // Calculate position relative to the PDF page
    const x = e.clientX - pageRect.left;
    const y = e.clientY - pageRect.top;

    // Ensure click is within page bounds
    if (x < 0 || y < 0 || x > pdfPage.clientWidth || y > pdfPage.clientHeight) {
      return;
    }

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
      console.log("placements before transformation", placements);

      // Load the PDF to get the page dimensions
      const response = await fetch(currentFund.investors[0].documentUrl);
      const pdfBuffer = new Uint8Array(await response.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Get the rendered PDF page element to calculate scaling factors
      const pdfPageElement = pdfContainerRef.current?.querySelector('.react-pdf__Page');
      if (!pdfPageElement) {
        throw new Error("PDF page element not found");
      }

      const renderedWidth = pdfPageElement.clientWidth;
      const renderedHeight = pdfPageElement.clientHeight;

      const transformedPlacements = placements.map((placement) => {
        const page = pdfDoc.getPage(placement.page - 1);
        const { width: actualWidth, height: actualHeight } = page.getSize();

        // Calculate scaling factors between rendered PDF and actual PDF dimensions
        const scaleX = actualWidth / renderedWidth;
        const scaleY = actualHeight / renderedHeight;

        console.log(`Page ${placement.page} - Rendered: ${renderedWidth}x${renderedHeight}, Actual: ${actualWidth}x${actualHeight}`);
        console.log(`Scale factors - X: ${scaleX}, Y: ${scaleY}`);

        const updatedPlacement: PagePlacement = { page: placement.page };

        if (placement.signature) {
          // Apply scaling and Y-flip transformation
          const scaledX = placement.signature.x * scaleX;
          const scaledY = placement.signature.y * scaleY;
          const scaledWidth = placement.signature.width * scaleX;
          const scaledHeight = placement.signature.height * scaleY;

          updatedPlacement.signature = {
            ...placement.signature,
            x: scaledX,
            y: actualHeight - scaledY - scaledHeight, // Y-flip with scaled values
            width: scaledWidth,
            height: scaledHeight,
          };

          console.log(`Signature - Original: (${placement.signature.x}, ${placement.signature.y}), Scaled: (${scaledX}, ${scaledY}), Final: (${updatedPlacement.signature.x}, ${updatedPlacement.signature.y})`);
        }

        if (placement.date) {
          const fontSize = placement.date.fontSize || 12;

          // Log original placement
          console.log(`--- Date Placement Debug ---`);
          console.log(`Original Date Placement:`, {
            x: placement.date.x,
            y: placement.date.y,
            width: placement.date.width,
            height: placement.date.height,
            fontSize,
          });

          const scaledX = placement.date.x * scaleX;
          const scaledY = placement.date.y * scaleY;
          const scaledWidth = placement.date.width * scaleX;
          const scaledHeight = placement.date.height * scaleY;
          const scaledFontSize = fontSize * scaleY;

          console.log(`Scaled Date Placement:`, {
            scaledX,
            scaledY,
            scaledWidth,
            scaledHeight,
            scaledFontSize,
          });

          const flippedY = actualHeight - scaledY - fontSize;

          console.log(`Flipping Calculation:`);
          console.log(`actualHeight: ${actualHeight}`);
          console.log(`scaledY: ${scaledY}`);
          console.log(`scaledFontSize (used in flip): ${scaledFontSize}`);
          console.log(`Final Y after flip (flippedY): ${flippedY}`);

          updatedPlacement.date = {
            ...placement.date,
            x: scaledX,
            y: flippedY,
            width: scaledWidth,
            height: scaledHeight,
            fontSize: fontSize,
          };

          console.log(`Final Transformed Date Placement:`, updatedPlacement.date);
        }

        return updatedPlacement;
      });

      console.log("placements after transformation", transformedPlacements);

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
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)


  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().split("T")[0]
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    setDateText(date.toLocaleDateString())
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">Funding List</h1>
      </div>

      <CustomTable columns={columns} data={fundsData} />

      {pdfSrc && (
        <div
          onClick={() => {
            setPdfSrc(null)
            setCurrentFund(null)
            setSignature(null)
            setPlacements([])
            setMode(null)
            setShowSignaturePad(false)
            setShowDatePicker(false)
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[40px] w-[95%] max-w-7xl max-h-[98vh] relative p-8 font-poppins flex"
          >
            <button
              onClick={() => {
                setPdfSrc(null)
                setCurrentFund(null)
                setSignature(null)
                setPlacements([])
                setMode(null)
                setShowSignaturePad(false)
                setShowDatePicker(false)
              }}
              className="p-2 hover:bg-gray-100 rounded-full absolute right-5 top-5 z-10 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {isDocumentSigned() ? (
              // Signed Document View
              <div className="w-full relative">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">Signed Agreement Document</h2>
                <div className="w-full h-[80vh] overflow-auto bg-gray-100 p-4 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <Document
                      file={pdfSrc}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      className="w-full max-w-4xl"
                    >
                      {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                        <div key={pageNum} className="mb-4 shadow-lg">
                          <Page
                            pageNumber={pageNum}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(800, window.innerWidth * 0.6)}
                            className="mx-auto"
                          />
                        </div>
                      ))}
                    </Document>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Sidebar */}
                <div className="w-1/3 pr-6 border-r border-gray-200">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Document Signing Tools</h2>

                  {/* Mode Selection - Enhanced */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">Select Tool</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMode(mode === "signature" ? null : "signature")}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${mode === "signature"
                          ? "border-theme-sidebar-accent  text-theme-sidebar-accent"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                      >
                        <Edit3 className="w-5 h-5" />
                        <span className="text-sm font-medium">Signature</span>
                      </button>
                      <button
                        onClick={() => setMode(mode === "date" ? null : "date")}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${mode === "date"
                          ? "border-theme-sidebar-accent bg-blue-50 text-theme-sidebar-accent"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">Date</span>
                      </button>
                    </div>
                  </div>

                  {/* Signature Section - Enhanced */}
                  {mode === "signature" && (
                    <div className="mb-6 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-theme-sidebar-accent">Signature Setup</h3>
                        <MousePointer className="w-4 h-4 text-theme-sidebar-accent" />
                      </div>

                      {signature ? (
                        <div className="mb-4">
                          <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                            <img
                              src={signature || "/placeholder.svg"}
                              alt="Signature"
                              className="max-w-full h-12 object-contain"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowSignaturePad(true)}
                              className="flex-1 bg-theme-sidebar-accent text-white text-sm px-3 py-2 rounded  transition-colors"
                            >
                              Edit Signature
                            </button>
                            <button
                              onClick={() => setSignature(null)}
                              className="flex-1 bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSignaturePad(true)}
                          className="w-full bg-theme-sidebar-accent text-white text-sm px-3 py-3 rounded hover:scale-105 transition-all duration-200  flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Create Signature
                        </button>
                      )}

                      {signature && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2 text-theme-sidebar-accent">
                            Signature Size: {signatureSize}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={signatureSize}
                            onChange={(e) => setSignatureSize(Number(e.target.value))}
                            className="w-full accent-theme-sidebar-accent"
                          />
                        </div>
                      )}

                      <p className="text-xs text-theme-sidebar-accent mt-3">Click on the document to place your signature</p>
                    </div>
                  )}

                  {/* Date Section - Enhanced */}
                  {mode === "date" && (
                    <div className="mb-6 p-4  rounded-lg border border-theme-sidebar-accent">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-theme-sidebar-accent">Date Setup</h3>
                        <Calendar className="w-4 h-4 text-theme-sidebar-accent" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-theme-sidebar-accent">Select Date</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={formatDateForInput(dateText)}
                              onChange={handleDateChange}
                              className="flex-1 p-2 border border-theme-sidebar-accent rounded-md text-sm focus:outline-none focus:ring-2 "
                            />
                            <button
                              onClick={() => setShowDatePicker(true)}
                              className="px-3 py-2 bg-theme-sidebar-accent text-white rounded  transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-theme-sidebar-accent">Custom Date Text</label>
                          <input
                            type="text"
                            value={dateText}
                            onChange={(e) => setDateText(e.target.value)}
                            className="w-full p-2 border border-theme-sidebar-accent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent "
                            placeholder="Enter custom date format"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-theme-sidebar-accent">
                            Font Size: {dateFontSize}px
                          </label>
                          <input
                            type="range"
                            min="8"
                            max="24"
                            step="1"
                            value={dateFontSize}
                            onChange={(e) => setDateFontSize(Number(e.target.value))}
                            className="w-full accent-theme-sidebar-accent"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-theme-sidebar-accent mt-3">Click on the document to place the date</p>
                    </div>
                  )}

                  {/* Page Navigation - Enhanced */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Current Page</label>
                    <select
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent"
                    >
                      {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                        <option key={page} value={page}>
                          Page {page} of {numPages}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons - Enhanced */}
                  <div className="space-y-3">
                    <button
                      className="w-full   border-2 text-theme-sidebar-accent border-theme-sidebar-accent text-sm px-4 py-3 rounded-lg  transition-colors font-medium"
                      onClick={applyToAllPages}
                      disabled={!mode || (mode === "signature" && !signature) || (mode === "date" && !dateText)}
                    >
                      Apply to All Pages
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                        onClick={clearCurrentPage}
                      >
                        Clear Page
                      </button>
                      <button
                        className="bg-red-500 text-white text-sm px-3 py-2 rounded hover:bg-red-600 transition-colors"
                        onClick={clearAllPages}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Viewer - Enhanced */}
                <div className="w-2/3 pl-6 relative flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Agreement Document</h2>

                  {mode && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 text-center">
                        {mode === "signature"
                          ? signature
                            ? "Click on the document to place your signature"
                            : "Please create a signature first"
                          : "Click on the document to place the date"}
                      </p>
                    </div>
                  )}

                  <div
                    ref={pdfContainerRef}
                    className="relative w-full flex-1 overflow-auto bg-gray-50 p-6 rounded-lg shadow-inner"
                    style={{
                      maxHeight: "calc(80vh - 160px)",
                      minHeight: "60vh",
                      cursor:
                        mode && ((mode === "signature" && signature) || (mode === "date" && dateText))
                          ? "crosshair"
                          : "default",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div
                      className="relative mx-auto shadow-lg"
                      onClick={handlePdfClick}
                      style={{ width: "fit-content" }}
                    >
                      <Document file={pdfSrc} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                        <Page
                          pageNumber={currentPage}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={650}
                          className="bg-white"
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
                                    zIndex: 10,
                                    // border:
                                    //   dragging?.index === index
                                    //     ? "2px dashed #3B82F6"
                                    //     : "1px solid rgba(59, 130, 246, 0.3)",
                                    // borderRadius: "4px",
                                    // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  }}
                                  onMouseDown={handleMouseDown(index, "signature")}
                                />
                              )}
                              {p.date && (
                                <div
                                  style={{
                                    position: "absolute",
                                    left: p.date.x - 20,
                                    top: p.date.y,
                                    width: p.date.width,
                                    height: p.date.height,
                                    lineHeight: `${p.date.height}px`,
                                    fontSize: p.date.fontSize,
                                    color: "black",
                                    cursor: dragging ? "grabbing" : "grab",
                                    zIndex: 10,
                                    // border:
                                    //   dragging?.index === index
                                    //     ? "2px dashed #10B981"
                                    //     : "1px solid rgba(16, 185, 129, 0.3)",
                                    // borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    // backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                  </div>

                  <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200">
                    <button
                      disabled={placements.length === 0 || loading}
                      onClick={handleSignPdf}
                      className="bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-8 py-4 rounded-lg text-white text-lg font-semibold transition-all duration-200 hover:bg-green-700 hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:hover:shadow-none"
                      title={placements.length === 0 ? "Please add at least one signature or date" : ""}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing Document...
                        </div>
                      ) : (
                        "Complete Signing"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Signature Pad Popup */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Create Your Signature</h3>
              <button
                onClick={() => setShowSignaturePad(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="border-2 border-gray-300 rounded-lg mb-4">
              <SignaturePad
                ref={padRef}
                options={{
                  minWidth: 1,
                  maxWidth: 3,
                  backgroundColor: "rgba(255,255,255,1)",
                  penColor: "black",
                }}
                canvasProps={{
                  width: "400",
                  height: "150",
                  className: "rounded-lg",
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-theme-sidebar-accent text-white px-4 py-2 rounded-lg  transition-colors"
                onClick={handleSaveSignature}
              >
                Save Signature
              </button>
              <button
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => padRef.current?.clear()}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Popup */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Choose Date</label>
                <input
                  type="date"
                  value={formatDateForInput(dateText)}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Quick Options</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDateText(new Date().toLocaleDateString())
                      setShowDatePicker(false)
                    }}
                    className="p-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setDateText(tomorrow.toLocaleDateString())
                      setShowDatePicker(false)
                    }}
                    className="p-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setShowDatePicker(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDocuments;