import React, { useState } from "react";
import { PiCoins, PiCoinsBold } from "react-icons/pi";
import FundModal from "../../Components/Modal/FundModal";
import { useNavigate } from "react-router-dom";

interface FundCard {
  id: number;
  title: string;
  projectName: string;
  description: string;
  totalInvestors: number;
  dateCreated: string;
}

const FundsAndReporting: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const navigate = useNavigate();

  const handleSubmit = (data: SubmitData): void => {
    console.log("Form submitted:", data);
    setIsModalOpen(false);
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setMode("create");
  };

  const sampleEditData: Partial<FormData> = {
    name: "Growth Fund Alpha",
    fundSize: "$50M",
    fundType: "Growth Equity",
    targetGeographies: "North America",
    targetSectors: "Technology",
    targetMOIC: "3.5x",
    targetIRR: "25%",
    minimumInvestment: "$1M",
    fundLifetime: "7 years",
    fundDescription: "Focused on growth-stage tech companies",
  };
  // Static placeholder data
  const fundCards: FundCard[] = [
    {
      id: 1,
      title: "Loremipsum",
      projectName: "Project Name An sub va sit va elso ach shh",
      description:
        "Description: An sub va sit va elso ach An sub va sit va elso achAn sub va sit va elso ach",
      totalInvestors: 200,
      dateCreated: "12/12/2026",
    },
    {
      id: 2,
      title: "Loremipsum",
      projectName: "Project Name",
      description: "Description: An sub va sit va elso ach",
      totalInvestors: 300,
      dateCreated: "12/12/2026",
    },
    {
      id: 3,
      title: "Loremipsum",
      projectName: "Project Name",
      description: "Description: An sub va sit va elso ach",
      totalInvestors: 200,
      dateCreated: "12/12/2026",
    },
    {
      id: 4,
      title: "Loremipsum",
      projectName: "Project Name",
      description: "Description: An sub va sit va elso ach",
      totalInvestors: 200,
      dateCreated: "12/12/2026",
    },
    {
      id: 5,
      title: "Loremipsum",
      projectName: "Project Name",
      description: "Description: An sub va sit va elso ach",
      totalInvestors: 350,
      dateCreated: "12/12/2026",
    },
    {
      id: 6,
      title: "Loremipsum",
      projectName: "Project Name",
      description: "Description: An sub va sit va elso ach",
      totalInvestors: 500,
      dateCreated: "12/12/2026",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Fund Creation
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Create Fund
        </button>
      </div>

      {/* Content Section - Fund Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pt-4 mr-32 h-full">
        {fundCards.map((fund) => (
          <div key={fund.id} className="relative mt-8 h-full">
            {/* Circular Icon positioned at top-left */}
            <div className="absolute -top-8 left-6 w-16 h-16 bg-white rounded-full border-2 border-theme-sidebar-accent flex items-center justify-center z-10 ">
              <PiCoinsBold className="text-theme-sidebar-accent " size={28} />
            </div>

            {/* Card */}
            <div className=" rounded-3xl border-2 border-theme-sidebar-accent p-6 pt-8 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col justify-between">
              {/* Card Title */}
              <div className="text-center mb-6">
                <h2 className="text-base lg:text-xl font-poppins font-medium text-theme-primary-text">
                  {fund.title}
                </h2>
              </div>

              {/* Project Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="min-w-[20px]">
                    <img src="/assets/projectName.png" alt="project icon" />
                  </div>
                  <span className="text-sm lg:text-base font-medium text-theme-secondary-text">
                    {fund.projectName}
                  </span>
                </div>

                <div className="flex items-start gap-3 ">
                  <div className="min-w-[20px]">
                    <img src="/assets/description.png" alt="description icon" />
                  </div>
                  <span className="text-sm lg:text-base font-medium text-theme-secondary-text">
                    {fund.description}
                  </span>
                </div>
              </div>

              {/* Horizontal Separator */}
              <div className="border-t border-theme-sidebar-accent mb-8"></div>

              {/* Fund Statistics */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm lg:text-base font-medium text-gray-700">
                    Total Investors
                  </span>
                  <span className="text-sm lg:text-base font-semibold text-gray-800">
                    {fund.totalInvestors}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm lg:text-base font-medium text-gray-700">
                    Date Created
                  </span>
                  <span className="text-sm lg:text-base font-semibold text-gray-800">
                    {fund.dateCreated}
                  </span>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => {
                  navigate("../project");
                }}
                className="w-full bg-theme-sidebar-accent text-white py-3 px-4 rounded-2xl text-sm lg:text-base font-medium transition-colors duration-200"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <FundModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        mode={mode}
        initialData={mode === "edit" ? sampleEditData : null}
      />
    </div>
  );
};

export default FundsAndReporting;
