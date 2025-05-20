import React, { useState } from "react";
import {
  LayoutGrid,
  Users,
  PieChart,
  FileText,
  File,
  Settings,
  Bell,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Tax Report");

  const menuItems = [
    { id: "dashboard", icon: <LayoutGrid size={20} />, label: "Dashboard" },
    { id: "investors", icon: <Users size={20} />, label: "Investors" },
    {
      id: "funds",
      icon: <PieChart size={20} />,
      label: "Reporting",
    },
    { id: "tax", icon: <FileText size={20} />, label: "Tax Report" },
    { id: "kyc", icon: <File size={20} />, label: "Documents" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "support", icon: <HelpCircle size={20} />, label: "Support" },
  ];

  return (
    <div className="h-screen w-60 bg-teal-500  overflow-hidden">
      <div className="bg-white p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="h-6 w-6 bg-teal-200 flex items-center justify-center rounded-sm">
            <div className="h-0 w-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-teal-500"></div>
          </div>
          <span className="ml-2 text-teal-600 font-bold text-xl">LOGO</span>
        </div>

        {/* Menu Items */}
        <div className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeItem === item.label
                  ? "bg-teal-600 text-white"
                  : "text-teal-600 hover:bg-teal-50"
              }`}
              onClick={() => setActiveItem(item.label)}
            >
              <span className="mr-3 text-current">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom space */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default Sidebar;
