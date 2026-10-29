import { Link } from "react-router-dom";
import {
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Database,
  MessageSquare,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
} from "lucide-react";
import BrandMark from "../components/BrandMark";

/* ── Content ─────────────────────────────────────────────────── */

const aiFeatures = [
  {
    icon: TrendingUp,
    title: "Sales forecasting",
    desc: "Projects demand for the months ahead from your order history, with an upper and lower bound so you can plan for both.",
    how: "Facebook Prophet · component breakdown",
  },
  {
    icon: Brain,
    title: "Business health score",
    desc: "One score from 0 to 100 across sales, revenue growth, inventory and expenses — with a plain-language reason for each part and what to fix first.",
    how: "Weighted scoring · ranked recommendations",
  },
  {
    icon: MessageSquare,
    title: "Ask your data",
    desc: "Type a question like “which products are running low?” and get an answer grounded in your own records, with the rows it used.",
    how: "pgvector retrieval · Google Gemini",
  },
];

const modules = [
  { title: "Dashboard", desc: "Revenue, orders, customers and stock alerts on one page.", icon: BarChart3 },
  { title: "Products", desc: "Catalogue with SKUs, categories, unit and cost prices.", icon: Package },
  { title: "Orders", desc: "Multi-item orders that deduct stock and move through a clear status.", icon: ShoppingCart },
  { title: "Customers", desc: "Contact details and order history for every account.", icon: Users },
  { title: "Suppliers", desc: "Vendor directory linked to the stock they supply.", icon: Truck },
  { title: "Inventory", desc: "Quantities, reorder levels and audited adjustments.", icon: Database },
  { title: "Expenses", desc: "Spending by category and month, alongside revenue.", icon: Receipt },
  { title: "Accounts & access", desc: "Sign-in with JWT and admin or employee roles.", icon: Shield },
];

const techStack = [
  "React 19", "TypeScript", "Spring Boot 3.4", "Java 21", "PostgreSQL 16",
  "pgvector", "FastAPI", "Prophet", "Google Gemini",
];

/* Sample revenue path for the hero sheet (12 months, illustrative) */
const sample = [42, 47, 44, 52, 58, 55, 61, 66, 63, 71, 76, 82];
const W = 480, H = 120, PAD = 6;
const max = Math.max(...sample), min = Math.min(...sample) - 8;
const pts = sample.map((v, i) => [
  PAD + (i * (W - PAD * 2)) / (sample.length - 1),
  H - PAD - ((v - min) / (max - min)) * (H - PAD * 2),
]);
const linePath = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const areaPath = `${linePath} L${W - PAD} ${H - PAD} L${PAD} ${H - PAD} Z`;
const last = pts[pts.length - 1];

/* ── Page ────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="ld">
      <header className="ld-nav">
        <div className="ld-wrap">
          <Link to="/" className="ld-brand" aria-label="AIBI-DSS home">
            <BrandMark size={30} />
            <b>AIBI</b>
            <span>Decision support</span>
          </Link>
          <nav className="ld-links" aria-label="Main">
            <a href="#features">What the AI adds</a>
            <a href="#modules">Modules</a>
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/register" className="btn btn-primary">Create account</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="ld-hero">
          <div className="ld-wrap ld-hero-grid">
            <div>
              <h1 className="ld-enter">Know where the business stands before the day starts.</h1>
              <p className="ld-lead ld-enter ld-enter-2">
                AIBI keeps sales, stock, customers, suppliers and expenses in one ledger — then forecasts
                demand, scores business health and answers questions about your own numbers.
              </p>
              <div className="ld-actions ld-enter ld-enter-3">
                <Link to="/register" className="btn btn-primary">Create an account</Link>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
              </div>
            </div>

            <figure className="ld-sheet ld-enter ld-enter-2" aria-label="Sample monthly statement">
              <div className="ld-sheet-head">
                <h2>Monthly statement</h2>
                <span>Last 12 months</span>
              </div>
              <dl className="ld-sheet-figs">
                <div>
                  <dt>Revenue</dt>
                  <dd className="figure">₹87.3L<small>+8.7% vs last month</small></dd>
                </div>
                <div>
                  <dt>Orders</dt>
                  <dd className="figure">1,284<small>+12% vs last month</small></dd>
                </div>
                <div>
                  <dt>Health score</dt>
                  <dd className="figure">78<small>Good · 4 factors</small></dd>
                </div>
              </dl>
              <div className="ld-sheet-chart">
                <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue rising over twelve months">
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke="var(--chart-grid)" strokeWidth="1" />
                  ))}
                  <path d={areaPath} fill="var(--chart-1)" opacity="0.08" />
                  <path className="ld-sheet-line" d={linePath} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx={last[0]} cy={last[1]} r="4" fill="var(--chart-1)" stroke="var(--card-bg)" strokeWidth="2" />
                  <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="var(--hairline-strong)" strokeWidth="1" />
                </svg>
              </div>
              <ul className="ld-sheet-rows">
                <li className="flag-row"><span>USB-C Hub 8-in-1 is below its reorder level</span><span>4 left</span></li>
                <li><span>Forecast for next month</span><span>₹91.2L ± 6%</span></li>
                <li><span>Largest expense this month</span><span>Salaries</span></li>
              </ul>
              <figcaption className="ld-sheet-caption">Sample figures for illustration.</figcaption>
            </figure>
          </div>
        </section>

        <section className="ld-sec ld-sec-alt" id="features">
          <div className="ld-wrap">
            <h2>Three ways the AI helps you decide</h2>
            <p className="ld-sec-intro">
              Each one works from the records already in the system, and shows its reasoning so you can check it.
            </p>
            <div className="ld-ai">
              {aiFeatures.map((f) => (
                <article key={f.title}>
                  <h3><f.icon size={20} strokeWidth={1.75} aria-hidden="true" />{f.title}</h3>
                  <p>{f.desc}</p>
                  <p className="ld-how">{f.how}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ld-sec" id="modules">
          <div className="ld-wrap">
            <h2>Everything the day-to-day runs on</h2>
            <p className="ld-sec-intro">
              Eight modules share one database, so a sale updates stock, revenue and the forecast together.
            </p>
            <div className="ld-mods">
              {modules.map((m) => (
                <div key={m.title} className="ld-mod">
                  <m.icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ld-stack" aria-label="Built with">
              {techStack.map((t) => <span key={t}>{t}</span>)}
            </div>
          </div>
        </section>

        <section className="ld-cta">
          <div className="ld-wrap">
            <h2>Open the ledger and see this month’s numbers.</h2>
            <div className="ld-actions">
              <Link to="/register" className="btn btn-primary">Create an account</Link>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <div className="ld-wrap">
          <span>© 2026 AIBI-DSS. Final year project, Computer Science &amp; Business Systems.</span>
          <span>React, Spring Boot and FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
