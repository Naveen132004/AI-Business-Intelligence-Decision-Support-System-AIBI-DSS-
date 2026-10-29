/* ────────────────────────────────────────────────────────────
   DEV-ONLY preview mock.
   Enable from the browser console:  aibiPreview()   then reload.
   Disable:  aibiPreview(false)
   Lets the authenticated UI render with canned data when no
   backend is running — used for design/QA only. Tree-shaken
   out of production builds (guarded by import.meta.env.DEV).
   ──────────────────────────────────────────────────────────── */
import type { AxiosInstance } from "axios";

const FLAG = "aibi_preview";

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

const months = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
});

const routes: Array<[RegExp, (m: RegExpMatchArray) => unknown]> = [
  [/(\/users\/me|\/auth\/refresh)$/, () => ({
    id: 1, userId: 1, fullName: "Ada Lovelace", email: "ada@aibi.com",
    role: "ADMIN", token: "preview.token.value",
  })],
  [/\/dashboard\/stats$/, () => ({
    totalOrders: 1284, activeProducts: 96, totalRevenue: 8734500,
    totalCustomers: 412, totalExpenses: 2140000,
  })],
  [/\/dashboard\/sales-chart$/, () => months.map((m, i) => ({
    month: m,
    revenue: 420000 + Math.round(Math.sin(i / 1.7) * 180000) + i * 22000,
    orderCount: 70 + Math.round(Math.cos(i / 2) * 24) + i,
  }))],
  [/\/dashboard\/recent-orders$/, () => [
    { id: 1051, customerName: "Globex Corp", orderDate: iso(1), status: "DELIVERED", totalAmount: 184000 },
    { id: 1050, customerName: "Initech", orderDate: iso(2), status: "SHIPPED", totalAmount: 92500 },
    { id: 1049, customerName: "Umbrella Ltd", orderDate: iso(3), status: "CONFIRMED", totalAmount: 47300 },
    { id: 1048, customerName: "Stark Industries", orderDate: iso(4), status: "PENDING", totalAmount: 265000 },
    { id: 1047, customerName: "Wayne Enterprises", orderDate: iso(6), status: "CANCELLED", totalAmount: 15900 },
  ]],
  [/\/inventory\/low-stock$/, () => [
    { id: 3, productName: "USB-C Hub 8-in-1", quantityInStock: 4, reorderLevel: 20 },
    { id: 7, productName: "Mechanical Keyboard TKL", quantityInStock: 9, reorderLevel: 25 },
    { id: 11, productName: "27\" 4K Monitor", quantityInStock: 2, reorderLevel: 10 },
  ]],
  [/\/inventory$/, () => []],
  [/\/products\/categories$/, () => ["Electronics", "Accessories", "Peripherals", "Cables"]],
  [/\/products$/, () => []],
  [/\/customers$/, () => []],
  [/\/orders$/, () => []],
  [/\/suppliers$/, () => []],
  [/\/expenses/, () => []],
];

export function installPreviewMock(api: AxiosInstance) {
  if (!import.meta.env.DEV) return;

  (window as unknown as { aibiPreview: (on?: boolean) => void }).aibiPreview = (on = true) => {
    if (on) {
      localStorage.setItem(FLAG, "1");
      localStorage.setItem("aibi_token", "preview.token.value");
      localStorage.setItem("aibi_user", JSON.stringify({
        userId: 1, fullName: "Ada Lovelace", email: "ada@aibi.com", role: "ADMIN",
      }));
    } else {
      localStorage.removeItem(FLAG);
      localStorage.removeItem("aibi_token");
      localStorage.removeItem("aibi_user");
    }
    location.reload();
  };

  if (localStorage.getItem(FLAG) !== "1") return;

  api.interceptors.request.use((config) => {
    const url = (config.baseURL ?? "") + (config.url ?? "");
    for (const [re, make] of routes) {
      const match = url.match(re);
      if (match) {
        config.adapter = async () => ({
          data: make(match), status: 200, statusText: "OK",
          headers: {}, config, request: {},
        });
        return config;
      }
    }
    // Unmatched: return empty 200 rather than a network error.
    config.adapter = async () => ({
      data: [], status: 200, statusText: "OK", headers: {}, config, request: {},
    });
    return config;
  });
}
