import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({ fullName, email, password });
      login(response);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { error?: string } };
        };
        setError(axiosErr.response?.data?.error || "Registration failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark app-ambient flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6" aria-label="AIBI-DSS home">
            <BrandMark size={32} />
            <span className="font-display text-xl font-bold text-fg">AIBI</span>
          </Link>
          <h1 className="text-[1.875rem] font-semibold text-fg leading-tight">Create your account</h1>
          <p className="text-surface-400 mt-1.5">It takes a minute, then you go straight to the dashboard.</p>
        </div>

        {/* Form card */}
        <div className="card p-6 sm:p-8" style={{ borderTop: "3px solid var(--rule)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="px-4 py-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="input-label"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="input-label"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@company.com"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="input-label"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show or hide password"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="input-label"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full min-h-[2.875rem] text-[0.9375rem]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t hairline text-center">
            <p className="text-surface-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-400 font-semibold underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
