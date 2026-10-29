import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh gradient-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6" aria-label="AIBI-DSS home">
            <BrandMark size={32} />
            <span className="font-display text-xl font-bold text-fg">AIBI</span>
          </Link>
          <h1 className="text-[1.875rem] font-semibold text-fg leading-tight">Sign in</h1>
          <p className="text-surface-400 mt-1.5">Pick up where the numbers left off.</p>
        </div>

        {/* Form card */}
        <div className="card p-6 sm:p-8" style={{ borderTop: "3px solid var(--rule)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="px-4 py-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

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
                placeholder="admin@aibi.com"
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
                  placeholder="••••••••"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full min-h-[2.875rem] text-[0.9375rem]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t hairline text-center">
            <p className="text-surface-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-400 font-semibold underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 text-center">
          <p className="text-surface-500 text-xs">
            Demo: admin@aibi.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
