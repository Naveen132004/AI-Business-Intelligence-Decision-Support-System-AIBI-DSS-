import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Pencil,
  Lock,
  Check,
  X,
  Loader2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/authApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // ── Edit Profile State ─────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.fullName ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  // ── Change Password State ──────────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // ── Handlers ───────────────────────────────────────

  const handleNameSave = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }
    setNameError("");
    setNameLoading(true);
    try {
      const profile = await authApi.updateProfile({ fullName: editName.trim() });
      updateUser({ fullName: profile.fullName });
      setNameSuccess("Name updated successfully");
      setIsEditingName(false);
      setTimeout(() => setNameSuccess(""), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setNameError(axiosErr.response?.data?.error || "Failed to update name");
      } else {
        setNameError("Network error. Please try again.");
      }
    } finally {
      setNameLoading(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditName(user?.fullName ?? "");
    setNameError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setPasswordError(axiosErr.response?.data?.error || "Failed to change password");
      } else {
        setPasswordError("Network error. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Generate initials for the avatar
  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <div className="min-h-screen gradient-dark">
      {/* Top Nav */}
      <nav className="glass border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-fg transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-fg" />
            </div>
            <span className="text-lg font-bold text-fg">AIBI-DSS</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-800/50 
                       text-surface-400 hover:text-fg transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 
                          shadow-lg shadow-primary-500/20 ring-4 ring-primary-500/10">
            <span className="text-3xl font-bold text-fg">{initials}</span>
          </div>
          <h1 className="text-2xl font-bold text-fg">{user?.fullName}</h1>
          <p className="text-surface-400 text-sm mt-1">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium
                           bg-primary-500/10 text-primary-300 border border-primary-500/20">
            <Shield className="w-3 h-3" />
            {user?.role}
          </span>
        </div>

        {/* Profile Info Card */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-fg mb-5 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-400" />
            Profile Information
          </h2>

          {/* Success message */}
          {nameSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm animate-fade-in">
              {nameSuccess}
            </div>
          )}

          {/* Full Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-surface-400 mb-2">
              Full Name
            </label>
            {isEditingName ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 
                             text-fg placeholder:text-surface-500 
                             focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                             transition-all duration-200"
                  autoFocus
                />
                {nameError && (
                  <p className="text-danger text-sm">{nameError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleNameSave}
                    disabled={nameLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium
                               hover:shadow-glow transition-all duration-200 disabled:opacity-50"
                  >
                    {nameLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleNameCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800/50 
                               text-surface-300 text-sm font-medium hover:bg-surface-700/50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-fg">{user?.fullName}</p>
                <button
                  onClick={() => {
                    setEditName(user?.fullName ?? "");
                    setIsEditingName(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/50 
                             text-surface-300 text-sm hover:bg-surface-700/50 hover:text-fg transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-surface-400 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 text-fg">
              <Mail className="w-4 h-4 text-surface-500" />
              <span>{user?.email}</span>
            </div>
          </div>

          {/* Role (read-only) */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-surface-400 mb-2">
              Role
            </label>
            <div className="flex items-center gap-3 text-fg">
              <Shield className="w-4 h-4 text-surface-500" />
              <span>{user?.role === "ADMIN" ? "Administrator" : "Employee"}</span>
            </div>
          </div>

          {/* Member since */}
          <div>
            <label className="block text-sm font-medium text-surface-400 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-3 text-fg">
              <Calendar className="w-4 h-4 text-surface-500" />
              <span className="text-surface-300 text-sm">
                Information available from your profile
              </span>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <h2 className="text-lg font-semibold text-fg mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-400" />
            Security
          </h2>

          {/* Success message */}
          {passwordSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm animate-fade-in">
              {passwordSuccess}
            </div>
          )}

          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg text-sm font-medium">Password</p>
                <p className="text-surface-400 text-sm mt-0.5">
                  Last changed — update regularly for security
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800/50 
                           text-surface-300 text-sm font-medium hover:bg-surface-700/50 hover:text-fg transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                  {passwordError}
                </div>
              )}

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-surface-300 mb-2"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 
                             text-fg placeholder:text-surface-500 
                             focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                             transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-surface-300 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 
                             text-fg placeholder:text-surface-500 
                             focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                             transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-surface-300 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 
                             text-fg placeholder:text-surface-500 
                             focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                             transition-all duration-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg gradient-primary text-white text-sm font-semibold
                             hover:shadow-glow transition-all duration-200 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setPasswordError("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-800/50 
                             text-surface-300 text-sm font-medium hover:bg-surface-700/50 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
