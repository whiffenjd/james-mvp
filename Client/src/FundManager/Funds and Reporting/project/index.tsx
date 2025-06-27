// import { PenLine } from "lucide-react";
// import { useEffect, useState } from "react";
// import FundModal from "../../../Components/Modal/FundModal";
// import Tabs from "../../../Components/Tabs/Tabs";
// import { useSearchParams } from "react-router-dom";
// import { useAppSelector } from "../../../Redux/hooks";

// const Project = () => {
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const defaultTab = "overview";
//   const tabFromUrl = searchParams.get("tab") || defaultTab;
//   const [activeTab, setActiveTab] = useState(tabFromUrl);
//   const fund = useAppSelector((state) => state.funds.currentFund);

//   const handleTabChange = (tabId: string) => {
//     setActiveTab(tabId);
//     setSearchParams({ tab: tabId });
//   };

//   useEffect(() => {
//     const tabInUrl = searchParams.get("tab");
//     if (tabInUrl && tabInUrl !== activeTab) {
//       setActiveTab(tabInUrl);
//     }
//   }, [searchParams]);

//   const handleClose = (): void => {
//     setIsModalOpen(false);
//   };
//   const handleSubmit = (): void => {
//     setIsModalOpen(false);
//   };
//   return (
//     <div className="min-h-screen p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
//         <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
//           Project
//         </h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="bg-theme-sidebar-accent text-white px-8 py-2 rounded-[10px] text-sm font-normal transition-colors duration-200 flex items-center gap-2 "
//         >
//           <PenLine />
//           Edit Fund
//         </button>
//       </div>
//       <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

//       <FundModal
//         isOpen={isModalOpen}
//         onClose={handleClose}
//         onSubmit={handleSubmit}
//         mode={"edit"}
//         initialData={fund?.result || {}}
//       />
//     </div>
//   );
// };

// export default Project;

import { PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import FundModal from "../../../Components/Modal/FundModal";
import Tabs, { tabIds, type TabType } from "../../../Components/Tabs/Tabs"; // import TabType and tabIds
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";

const isValidTab = (tab: string | null): tab is TabType => {
  return tabIds.includes(tab as TabType);
};

const Project = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab: TabType = "overview";

  const getInitialTab = (): TabType => {
    const tab = searchParams.get("tab");
    return isValidTab(tab) ? tab : defaultTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

  const fund = useAppSelector((state) => state.funds.currentFund);

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
        initialData={fund?.result || {}}
      />
    </div>
  );
};

export default Project;
