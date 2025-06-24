import { useState } from "react";
interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
}
const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className=" w-full max-w-[302px] min-h-[calc(100vh-96px)]  overflow-hidden">
      <div className="bg-secondary p-6 flex flex-col h-full rounded-[40px]">
        {/* Logo */}
        <div className="flex mt-6  mb-10 ">
          <img
            src="/assets/logo.png"
            alt=""
            className="h-full max-h-12  object-contain"
          />
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
