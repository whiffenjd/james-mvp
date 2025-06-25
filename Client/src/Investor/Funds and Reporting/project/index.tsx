import { PenLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import Tabs from "../../../Components/Tabs/Tabs";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";

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

const InvestorsProject = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = "overview";
  const tabFromUrl = searchParams.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const fund = useAppSelector((state) => state.funds.currentFund);

  console.log("Current Fund Data://", fund);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    const tabInUrl = searchParams.get("tab");
    if (tabInUrl && tabInUrl !== activeTab) {
      setActiveTab(tabInUrl);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Project
        </h1>
        {/* <button
          onClick={() => setIsModalOpen(true)}
          className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2 "
        >
          <PenLine />
          Edit Fund
        </button> */}
      </div>
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default InvestorsProject;
