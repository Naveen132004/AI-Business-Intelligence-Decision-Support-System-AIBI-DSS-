import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  Truck,
  Receipt,
  TrendingUp,
  HeartPulse,
  Bot,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BrandMark from "./BrandMark";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Products", path: "/products", icon: Package },
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Orders", path: "/orders", icon: ShoppingCart },
      { label: "Inventory", path: "/inventory", icon: Warehouse },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Expenses", path: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Forecast", path: "/forecast", icon: TrendingUp },
      { label: "Health", path: "/health-score", icon: HeartPulse },
      { label: "Assistant", path: "/assistant", icon: Bot },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", path: "/profile", icon: UserCircle }],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col
                  glass-panel border-y-0 border-l-0 rounded-none
                  transition-[width] duration-300 ease-in-out
                  ${collapsed ? "w-[76px]" : "w-[240px]"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[64px] border-b hairline shrink-0">
        <BrandMark size={28} />
        {!collapsed && (
          <span className="flex flex-col leading-none whitespace-nowrap animate-fade-in">
            <span className="font-display text-[17px] font-bold text-fg">AIBI</span>
            <span className="text-[11px] text-surface-500 mt-1">Decision support</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-medium text-surface-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}
                                ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: theme + collapse */}
      <div className="p-3 border-t hairline space-y-1 shrink-0">
        {collapsed ? (
          <div className="flex justify-center">
            <ThemeToggle compact />
          </div>
        ) : (
          <ThemeToggle />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                     text-surface-400 hover:bg-surface-800 hover:text-fg
                     transition-colors text-sm"
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
