// import { useEffect, useState } from "react";
// import Tabs from "../../../Components/Tabs/Tabs";
// import { useSearchParams } from "react-router-dom";

// type TabType = "overview" | "capital-call" | "distribution" | "fund-reports";

// const InvestorsProject = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const defaultTab = "overview";
//   const tabFromUrl = searchParams.get("tab") || defaultTab;
//   const [activeTab, setActiveTab] = useState(tabFromUrl);

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

//   return (
//     <div className="min-h-screen p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
//         <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
//           Project
//         </h1>
//       </div>
//       <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
//     </div>
//   );
// };

// export default InvestorsProject;

import { useEffect, useState } from "react";
import Tabs, { tabIds, type TabType } from "../../../Components/Tabs/Tabs";
import { useSearchParams } from "react-router-dom";

// Type guard to ensure URL tab is valid
const isValidTab = (tab: string | null): tab is TabType => {
  return tabIds.includes(tab as TabType);
};

const InvestorsProject = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab: TabType = "overview";

  const getInitialTab = (): TabType => {
    const tab = searchParams.get("tab");
    return isValidTab(tab) ? tab : defaultTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

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

  return (
    <div className=" p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Project
        </h1>
      </div>
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default InvestorsProject;
