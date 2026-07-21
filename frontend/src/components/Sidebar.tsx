import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Brain,
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  Truck,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Orders", path: "/orders", icon: ShoppingCart },
  { label: "Inventory", path: "/inventory", icon: Warehouse },
  { label: "Suppliers", path: "/suppliers", icon: Truck },
  { label: "Profile", path: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col
                  glass border-r border-surface-700/50
                  transition-all duration-300 ease-in-out
                  ${collapsed ? "w-[72px]" : "w-[240px]"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-700/50">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white whitespace-nowrap animate-fade-in">
            AIBI-DSS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         transition-all duration-200 group
                         ${
                           isActive
                             ? "gradient-primary text-white shadow-glow"
                             : "text-surface-400 hover:bg-surface-800/50 hover:text-white"
                         }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-surface-500 group-hover:text-white"
                }`}
              />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-surface-700/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                     text-surface-400 hover:bg-surface-800/50 hover:text-white
                     transition-all duration-200 text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
