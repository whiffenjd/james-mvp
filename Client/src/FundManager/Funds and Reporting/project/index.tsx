import { PenLine } from "lucide-react";
import React, { useState } from "react";
import FundModal from "../../../Components/Modal/FundModal";
import Tabs from "../../../Components/Tabs/Tabs";

type Props = {};

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

const Project = (props: Props) => {
  const [activeTab, setActiveTab] = useState("overview");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  const handleClose = (): void => {
    setIsModalOpen(false);
  };
  const handleSubmit = (data: SubmitData): void => {
    console.log("Form submitted:", data);
    setIsModalOpen(false);
  };
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Project
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2 "
        >
          <PenLine />
          Edit Fund
        </button>
      </div>
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FundModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        mode={"edit"}
        initialData={sampleEditData}
      />
    </div>
  );
};

export default Project;
