import { PenLine, Users, TrendingUp, BarChart3, FileText } from "lucide-react";
import React, { useState } from "react";
import CapitalCall from "../../FundManager/Funds and Reporting/project/CapitalCall";
import Distribution from "../../FundManager/Funds and Reporting/project/Distribution";
import Overview from "../../FundManager/Funds and Reporting/project/Overview";
import FundReports from "../../FundManager/Funds and Reporting/project/FundReports";

// Mock data for the project
const projectData = {
  projectName: "XYZ Project",
  date: "12-08-2025",
  fundType: "UK",
  fundSize: "45",
  targetGeographies: "UK",
  targetSectors: "45",
  targetMOIC: "3134",
  targetIRR: "Q34532",
  minimumInvestment: "$50000000",
  fundLifetime: "22342",
  fundDescription:
    "Lorem ipsum dolor sit amet consectetur. Etiam lorem maximus molestudae venenatis orci. Nullam quis consequat ipsum blandit.",
};

const actionsData = [
  {
    type: "Capital call",
    text: "Capital call has been initiated",
    time: "Today",
  },
  { type: "Investment", text: "John Doe invested $30,000", time: "Today" },
  {
    type: "Distribution",
    text: "Profit Distribution has been initiated",
    time: "Today",
  },
  {
    type: "Capital call",
    text: "Capital call has been initiated",
    time: "Today",
  },
  { type: "Investment", text: "John Doe invested $30,000", time: "Today" },
  {
    type: "Distribution",
    text: "Profit Distribution has been initiated",
    time: "Today",
  },
  {
    type: "Capital call",
    text: "Capital call has been initiated",
    time: "Today",
  },
  { type: "Investment", text: "John Doe invested $30,000", time: "Today" },
  {
    type: "Distribution",
    text: "Profit Distribution has been initiated",
    time: "Today",
  },
  {
    type: "Capital call",
    text: "Capital call has been initiated",
    time: "Today",
  },
  { type: "Investment", text: "John Doe invested $30,000", time: "Today" },
  {
    type: "Distribution",
    text: "Profit Distribution has been initiated",
    time: "Today",
  },
];

const fundingData = {
  allInvestors: 200,
  totalFundsNeeded: "$18000",
  fundsCollected: "84%",
};

// Tabs Component
const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "capital-call", label: "Capital Call", icon: TrendingUp },
    { id: "distribution", label: "Distribution", icon: Users },
    { id: "fund-reports", label: "Fund Reports", icon: FileText },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-wrap gap-7 font-poppins">
          {tabs.map((tab) => {
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
const TabContent = ({ activeTab }) => {
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
