import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import BrandMark from "./BrandMark";

interface AppLayoutProps {
  children: React.ReactNode;
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function roleLabel(role?: string) {
  if (!role) return "";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen gradient-dark app-ambient">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden glass-panel border-x-0 border-t-0 sticky top-0 z-50 rounded-none">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="p-2.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-fg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="font-display text-base font-bold text-fg">AIBI</span>
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="p-2.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-fg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 modal-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-[240px] h-full" onClick={(e) => e.stopPropagation()}>
              <Sidebar />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:ml-[240px] min-h-screen">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-end gap-3 px-8 h-[64px] glass-panel border-x-0 border-t-0 rounded-none sticky top-0 z-30">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-fg">{user?.fullName}</p>
            <p className="text-xs text-surface-500">{roleLabel(user?.role)}</p>
          </div>
          <div className="w-9 h-9 rounded-full grid place-items-center text-xs font-semibold shrink-0 text-primary-300"
               style={{ background: "var(--p-50)", border: "1px solid var(--hairline-strong)" }} aria-hidden="true">
            {initials(user?.fullName)}
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-fg transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8 max-w-[1400px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
