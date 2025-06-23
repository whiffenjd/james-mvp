import { PenLine, Users, TrendingUp, BarChart3, FileText } from "lucide-react";
import React, { useState } from "react";

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

const Overview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Project Details */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {projectData.projectName}
            </h2>
            <span className="text-sm text-gray-500">{projectData.date}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Fund Type
              </div>
              <div className="text-gray-900">{projectData.fundType}</div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Fund Size
              </div>
              <div className="text-gray-900">{projectData.fundSize}</div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Target Geographies
              </div>
              <div className="text-gray-900">
                {projectData.targetGeographies}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Target Sectors
              </div>
              <div className="text-gray-900">{projectData.targetSectors}</div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Target MOIC
              </div>
              <div className="text-gray-900">{projectData.targetMOIC}</div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Target IRR
              </div>
              <div className="text-gray-900">{projectData.targetIRR}</div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Minimum Investment
              </div>
              <div className="text-gray-900">
                {projectData.minimumInvestment}
              </div>
            </div>
            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Fund Lifetime
              </div>
              <div className="text-gray-900">{projectData.fundLifetime}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Fund Description
            </div>
            <div className="text-gray-900 text-sm leading-relaxed bg-gray-100 border p-4 rounded-lg">
              {projectData.fundDescription}
            </div>
          </div>

          {/* Fundraising Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Fundraising Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1">All Investors</div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.allInvestors}
                </div>
              </div>
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Total Funds Needed
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.totalFundsNeeded}
                </div>
              </div>
              <div className="bg-gray-100 border rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"
                      ></div>
                    ))}
                    <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white">5+</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Funds Collected
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {fundingData.fundsCollected}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Actions Sidebar */}
      {/* <div className="lg:col-span-1">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Last Actions
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {actionsData.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 mb-1">
                    {action.text}
                  </div>
                  <div className="text-xs text-gray-500">{action.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Overview;
