import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
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
    <div className="min-h-screen gradient-dark">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden glass border-b border-surface-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-white transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-bold text-white">AIBI-DSS</span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-[240px] h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:ml-[240px] min-h-screen">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-end px-8 py-4 border-b border-surface-800/30">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.fullName}
              </p>
              <p className="text-xs text-surface-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-white transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
