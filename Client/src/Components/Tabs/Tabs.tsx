// import { Users, TrendingUp, BarChart3, FileText } from "lucide-react";
// import CapitalCall from "../../FundManager/Funds and Reporting/project/CapitalCall";
// import Distribution from "../../FundManager/Funds and Reporting/project/Distribution";
// import Overview from "../../FundManager/Funds and Reporting/project/Overview";
// import FundReports from "../../FundManager/Funds and Reporting/project/FundReports";

// export type TabType =
//   | "overview"
//   | "capital-call"
//   | "distribution"
//   | "fund-reports";

// // Props interface for Tabs component
// export interface TabsProps {
//   activeTab: TabType;
//   onTabChange: (tab: TabType) => void;
// }

// // Props interface for TabContent component
// interface TabContentProps {
//   activeTab: TabType;
// }

// const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
//   const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
//     { id: "overview", label: "Overview", icon: BarChart3 },
//     { id: "capital-call", label: "Capital Call", icon: TrendingUp },
//     { id: "distribution", label: "Distribution", icon: Users },
//     { id: "fund-reports", label: "Fund Reports", icon: FileText },
//   ];

//   return (
//     <>
//       <div className="mb-6">
//         <div className="flex flex-wrap gap-7 font-poppins">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => onTabChange(tab.id as TabType)}
//                 className={`flex items-center gap-2 px-4 py-3 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
//                   activeTab === tab.id
//                     ? "bg-theme-sidebar-accent text-white"
//                     : "bg-white text-theme-sidebar-accent border border-theme-sidebar-accent"
//                 } min-w-[190px] flex items-center justify-center`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//       <TabContent activeTab={activeTab} />
//     </>
//   );
// };

// export default Tabs;

// // Tab Content Component
// const TabContent = ({ activeTab }: TabContentProps) => {
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "overview":
//         return <Overview />;
//       case "capital-call":
//         return <CapitalCall />;
//       case "distribution":
//         return <Distribution />;
//       case "fund-reports":
//         return <FundReports />;
//       default:
//         return <Overview />;
//     }
//   };

//   return (
//     <div className="transition-all duration-200">{renderTabContent()}</div>
//   );
// };

import { Users, TrendingUp, BarChart3, FileText } from "lucide-react";
import CapitalCall from "../../FundManager/Funds and Reporting/project/CapitalCall";
import Distribution from "../../FundManager/Funds and Reporting/project/Distribution";
import Overview from "../../FundManager/Funds and Reporting/project/Overview";
import FundReports from "../../FundManager/Funds and Reporting/project/FundReports";

// Define tab type as a union of string literals
export const tabIds = [
  "overview",
  "capital-call",
  "distribution",
  "fund-reports",
] as const;
export type TabType = (typeof tabIds)[number];

// Define individual tab config type
interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

// Tabs array with full typing
const tabConfigs: TabConfig[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "capital-call", label: "Capital Call", icon: TrendingUp },
  { id: "distribution", label: "Distribution", icon: Users },
  { id: "fund-reports", label: "Fund Reports", icon: FileText },
];

// Props interface for Tabs component
export interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

// Tab Content component props
interface TabContentProps {
  activeTab: TabType;
}

// Tabs Component
const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  return (
    <>
      <div className="mb-6">
        <div className="flex flex-wrap gap-7 font-poppins">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-theme-sidebar-accent text-white"
                    : "bg-white text-theme-sidebar-accent border border-theme-sidebar-accent"
                } min-w-[190px] flex items-center justify-center`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <TabContent activeTab={activeTab} />
    </>
  );
};

export default Tabs;

// Tab Content Component
const TabContent = ({ activeTab }: TabContentProps) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "capital-call":
        return <CapitalCall />;
      case "distribution":
        return <Distribution />;
      case "fund-reports":
        return <FundReports />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="transition-all duration-200">{renderTabContent()}</div>
  );
};
