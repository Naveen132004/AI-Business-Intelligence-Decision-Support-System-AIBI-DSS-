import {
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Database,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Unified Dashboard",
    description:
      "Sales, inventory, and finance data in a single, real-time view. No more spreadsheet chaos.",
  },
  {
    icon: TrendingUp,
    title: "Sales Forecasting",
    description:
      "AI-powered demand predictions with explainable SHAP insights and model validation metrics.",
  },
  {
    icon: Brain,
    title: "Business Health Score",
    description:
      "A composite 0–100 score with per-component breakdowns explaining exactly why your business is healthy — or not.",
  },
  {
    icon: MessageSquare,
    title: "RAG Business Assistant",
    description:
      "Ask natural-language questions grounded in your own data. Every answer cites its sources.",
  },
  {
    icon: Database,
    title: "Centralized Data",
    description:
      "One source of truth for products, orders, inventory, customers, and expenses.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Admin and Employee roles with JWT authentication keeping your data secure.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-dark">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AIBI-DSS
            </span>
          </div>
          <a
            href="/login"
            className="px-5 py-2.5 rounded-lg gradient-primary text-white text-sm font-semibold 
                       hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            Sign In
          </a>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
            AI-Powered Business Intelligence
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 animate-slide-up">
            Transforming Data into{" "}
            <span className="text-gradient">Intelligent Decisions</span>
          </h1>

          <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 animate-slide-up">
            Consolidate sales, inventory, and finance data into one platform —
            layered with AI forecasting, explainable health scores, and a
            natural-language assistant grounded in your data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <a
              href="/login"
              className="px-8 py-3.5 rounded-xl gradient-primary text-white font-semibold text-base
                         hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl glass text-surface-200 font-semibold text-base
                         hover:bg-surface-800/60 transition-all duration-300"
            >
              Explore Features
            </a>
          </div>
        </div>
      </header>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-surface-400 text-lg max-w-xl mx-auto">
            Three deep AI features — not shallow many — built on top of a solid
            business data foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl glass hover:shadow-glow transition-all duration-300 
                         hover:-translate-y-1 cursor-default animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4
                              group-hover:bg-primary-500/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-surface-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-surface-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            AIBI-DSS &middot; Final Year Project &middot; CSBS
          </p>
          <p className="text-surface-600 text-xs">
            Built with React, Spring Boot, FastAPI &amp; PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
