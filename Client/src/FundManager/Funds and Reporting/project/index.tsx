
import { PenLine, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import FundModal from "../../../Components/Modal/FundModal";
import Tabs, { tabIds, type TabType } from "../../../Components/Tabs/Tabs"; // import TabType and tabIds
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { useAuth } from "../../../Context/AuthContext";
import type { FundDetail } from "../../../Redux/features/Funds/fundsSlice";
import { useCreateCapitalCall } from "../../../API/Endpoints/Funds/capitalCall";
import FundTransactionModal from "../../../Components/Modal/CapitalCallModal";
import { useCreateDistribution } from "../../../API/Endpoints/Funds/distributions";

const isValidTab = (tab: string | null): tab is TabType => {
  return tabIds.includes(tab as TabType);
};

const Project = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab: TabType = "overview";
  const { user } = useAuth(); // Assumed hook providing { role: string }


  const getInitialTab = (): TabType => {
    const tab = searchParams.get("tab");
    return isValidTab(tab) ? tab : defaultTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [fundData, setFundData] = useState<FundDetail | null>(null);
  const fund = useAppSelector((state) => state.funds.currentFund);
  const [isDistModalOpen, setIsDistModalOpen] = useState<boolean>(false); // Changed from isCapitalModalOpen

  const { mutateAsync: createCapitalCall } = useCreateCapitalCall(user?.id || "");
  const { mutateAsync: createDistribution } = useCreateDistribution(user?.id || "");

  useEffect(() => {
    if (fund) {
      setFundData(fund?.result);
    }
  }, [fund]);


  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    const tabInUrl = searchParams.get("tab");
    if (isValidTab(tabInUrl) && tabInUrl !== activeTab) {
      setActiveTab(tabInUrl);
    }
  }, [searchParams]);

  const handleClose = (): void => {
    setIsModalOpen(false);
  };

  const handleSubmit = (): void => {
    setIsModalOpen(false);
  };
  const handleSubmitCapitalCall = async (data: any) => {
    if (!fundData?.id) {
      console.error("❌ fund.id is missing!");
      return;
    }
    // Validate and parse the date
    let parsedDate: string;
    try {
      const dateValue = data.date ? new Date(data.date) : new Date();
      if (isNaN(dateValue.getTime())) {
        throw new Error("Invalid date format");
      }
      parsedDate = dateValue.toISOString();
    } catch (error) {
      console.error("❌ Date parsing failed:", error);
      return;
    }
    const payload = {
      ...data,
      fundId: fundData.id,
      date: parsedDate,
    };

    try {
      await createCapitalCall(payload);
      setIsCapitalModalOpen(false);
    } catch (error) {
      console.error("Capital call submission failed:", error);
    }
  };
  const handleSubmitDistribution = async (data: any) => {
    if (!fundData?.id) {
      console.error("❌ fund.id is missing!");
      return;
    }
    // Validate and parse the date
    let parsedDate: string;
    try {
      const dateValue = data.date ? new Date(data.date) : new Date();
      if (isNaN(dateValue.getTime())) {
        throw new Error("Invalid date format");
      }
      parsedDate = dateValue.toISOString();
    } catch (error) {
      console.error("❌ Date parsing failed:", error);
      return;
    }
    const payload = {
      ...data,
      fundId: fundData.id,
      date: parsedDate,
    };

    try {
      await createDistribution(payload);
      setIsDistModalOpen(false);
    } catch (error) {
      console.error("Capital call submission failed:", error);
    }
  };


  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Project
        </h1>
        {activeTab === 'overview' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2 "
          >
            <PenLine />
            Edit Fund
          </button>
        )}
        {activeTab === 'capital-call' && user?.role === 'fundManager' && (
          <button
            onClick={() => setIsCapitalModalOpen(true)}
            className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2"
          >
            <TrendingUp />
            Create Capital Call
          </button>
        )}
        {activeTab === 'distribution' && user?.role === 'fundManager' && (
          <button
            onClick={() => setIsDistModalOpen(true)}
            className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2"
          >
            <TrendingUp />
            Create Distribution
          </button>
        )}
      </div>

      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FundModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        mode={"edit"}
        initialData={fund?.result || {}}
      />

      <FundTransactionModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
        onSubmit={handleSubmitCapitalCall}
        mode={'create'}
        initialData={undefined}
        fund={fundData || null}
        entityType="capital"
      />
      <FundTransactionModal
        isOpen={isDistModalOpen}
        onClose={() => setIsDistModalOpen(false)}
        onSubmit={handleSubmitDistribution}
        mode={'create'}
        initialData={undefined}
        fund={fundData || null}
        entityType="distribution"
      />
    </div>
  );
};

export default Project;
