import { useState } from "react";
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
    { id: "dashboard", icon: <LayoutGrid size={22} />, label: "Dashboard" },
    // { id: "investors", icon: <Users size={22} />, label: "Investors" },
    // {
    //   id: "funds",
    //   icon: <PieChart size={22} />,
    //   label: "Agreement document",
    // },
    // { id: "tax", icon: <FileText size={20} />, label: "Tax Report" },
    // { id: "kyc", icon: <File size={20} />, label: "Documents" },
    // { id: "settings", icon: <Settings size={20} />, label: "Settings" },
    // { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    // { id: "support", icon: <HelpCircle size={20} />, label: "Support" },
  ];

  return (
    <div className=" w-full max-w-[302px] min-h-[calc(100vh-96px)]  overflow-hidden">
      <div className="bg-secondary p-6 flex flex-col h-full rounded-[40px]" >
        {/* Logo */}
        <div className="flex mt-6  mb-10 ">
          <img src="/assets/logo.png" alt="" className="h-full max-h-12  object-contain" />
        </div>

        {/* Menu Items */}
        <div className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-4 py-4 rounded-[10px] transition-colors  text-sm font-poppins font-normal ${
                activeItem === item.label
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-teal-100"
              }`}
              onClick={() => setActiveItem(item.label)}
            >
              <span className="mr-3 text-current ">{item.icon}</span>
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
