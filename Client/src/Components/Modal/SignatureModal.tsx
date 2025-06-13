import React, { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const containerRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  useEffect(() => {
    const resizeCanvas = () => {
      if (sigCanvas.current && containerRef.current) {
        const width = containerRef.current.offsetWidth;
        sigCanvas.current.clear(); // Optional: clear on resize
        sigCanvas.current.getCanvas().width = width;
        sigCanvas.current.getCanvas().height = 200; // fixed or responsive height
        setIsEmpty(true);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please provide a signature.");
      return;
    }
    const dataUrl = sigCanvas.current?.getCanvas().toDataURL("image/png");
    onSave(dataUrl || "");
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
    >
      <div
        ref={containerRef}
        className="bg-white p-6 rounded-xl shadow-xl max-w-md  w-full  space-y-4 "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium font-poppins">Please sign below</h2>
        <SignatureCanvas
          onEnd={() => setIsEmpty(sigCanvas.current?.isEmpty() ?? true)}
          ref={sigCanvas}
          canvasProps={{
            width: 400,
            height: 200,
            className: "w-full h-auto border border-gray-300 rounded",
          }}
        />
        <div className="flex justify-between space-x-3 pt-3">
          <button
            onClick={onClose}
            className=" bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <div className="flex space-x-2">
            {!isEmpty && (
              <button
                onClick={clearSignature}
                className=" bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300  font-medium transition-all duration-300 ease-in-out transform "
              >
                Clear
              </button>
            )}

            <button
              onClick={saveSignature}
              className=" bg-[#2FB5B4] text-white py-3 px-4 rounded-lg hover:bg-[#147574] transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
