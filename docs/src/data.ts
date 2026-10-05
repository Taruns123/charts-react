export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monthly recurring revenue for a growing B2B SaaS, in USD. */
export const mrr = [18200, 20950, 23400, 25100, 28900, 31800, 34600, 39200, 43100, 48700, 55300, 61840].map((v, i) => ({
  month: months[i],
  mrr: v,
}));

/** Weekly signups by acquisition channel. */
export const signups = [
  [412, 188, 96], [438, 205, 101], [455, 172, 118], [501, 230, 124],
  [489, 268, 131], [532, 251, 140], [578, 240, 152], [561, 296, 149],
  [604, 318, 167], [655, 287, 181], [640, 342, 176], [702, 365, 198],
].map(([organic, paid, referral], i) => ({ week: `W${i + 1}`, organic, paid, referral }));

/** Quarterly sales by region, USD. */
export const regionalSales = [
  { quarter: "Q1", na: 182000, emea: 126000, apac: 74000 },
  { quarter: "Q2", na: 204000, emea: 141000, apac: 92000 },
  { quarter: "Q3", na: 198000, emea: 158000, apac: 117000 },
  { quarter: "Q4", na: 241000, emea: 172000, apac: 139000 },
];

/** Revenue mix by month, USD thousands. */
export const revenueMix = [
  [38, 9, 4], [41, 8, 5], [44, 11, 5], [46, 10, 6], [51, 12, 7], [55, 11, 8],
  [58, 14, 8], [63, 13, 9], [67, 15, 11], [72, 14, 12], [79, 17, 13], [86, 18, 15],
].map(([subscriptions, services, addons], i) => ({ month: months[i], subscriptions, services, addons }));

/** Daily active users by platform over two weeks. */
export const activeUsers = [
  [3120, 1840], [3260, 1910], [3410, 2040], [3180, 1880], [2650, 1420], [2410, 1310], [3350, 2010],
  [3520, 2150], [3610, 2230], [3740, 2290], [3580, 2170], [2890, 1600], [2620, 1450], [3810, 2380],
].map(([web, mobile], i) => ({ day: `Oct ${i + 1}`, web, mobile }));

export const datasets = {
  mrr: { label: "SaaS MRR", data: mrr, xKey: "month", series: [{ key: "mrr", label: "MRR" }], currency: true },
  signups: {
    label: "Weekly signups",
    data: signups,
    xKey: "week",
    series: [
      { key: "organic", label: "Organic" },
      { key: "paid", label: "Paid" },
      { key: "referral", label: "Referral" },
    ],
    currency: false,
  },
  regional: {
    label: "Regional sales",
    data: regionalSales,
    xKey: "quarter",
    series: [
      { key: "na", label: "North America" },
      { key: "emea", label: "EMEA" },
      { key: "apac", label: "APAC" },
    ],
    currency: true,
  },
  users: {
    label: "Daily active users",
    data: activeUsers,
    xKey: "day",
    series: [
      { key: "web", label: "Web" },
      { key: "mobile", label: "Mobile" },
    ],
    currency: false,
  },
} as const;

export type DatasetId = keyof typeof datasets;

export const usd = (v: number) => "$" + v.toLocaleString("en-US");
export const usdCompact = (v: number) =>
  v >= 1e6 ? "$" + (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : v >= 1e3 ? "$" + Math.round(v / 1e3) + "K" : "$" + v;

/** Monthly net cash flow, USD thousands — goes negative some months. */
export const cashFlow = [12, -4, 8, 15, -9, 6, 18, 22, -3, 14, 25, 31].map((net, i) => ({ month: months[i], net }));

/** Revenue (USD thousands) and gross margin (fraction) by month. */
export const revenueMargin = [
  [182, 0.58], [195, 0.6], [210, 0.61], [204, 0.59], [232, 0.63], [248, 0.64],
  [262, 0.66], [281, 0.65], [276, 0.67], [305, 0.69], [329, 0.7], [352, 0.72],
].map(([revenue, margin], i) => ({ month: months[i], revenue, margin }));

/** New vs expansion bookings with a monthly target, USD thousands. */
export const bookings = [
  [64, 18, 90], [71, 22, 90], [58, 25, 95], [80, 21, 95], [86, 30, 100], [77, 34, 100],
  [92, 29, 110], [99, 36, 110], [88, 41, 115], [104, 38, 115], [112, 45, 120], [126, 49, 120],
].map(([fresh, expansion, target], i) => ({ month: months[i], fresh, expansion, target }));

/** B2B accounts: feature adoption vs 12-month retention, sized by ARR. */
const accountRows: Array<[string, string, number, number, number]> = [
  ["Northwind", "Enterprise", 82, 96, 186000], ["Helios Labs", "Enterprise", 74, 92, 142000], ["Quanta Freight", "Enterprise", 61, 88, 210000],
  ["Brightline", "Enterprise", 38, 84, 128000], ["Vertex Health", "Enterprise", 88, 97, 240000], ["Arcadia Retail", "Enterprise", 45, 71, 96000],
  ["Lumen & Co", "Team", 71, 90, 42000], ["Fieldnote", "Team", 64, 86, 36000], ["Parcel Bay", "Team", 33, 66, 28000],
  ["Kitebase", "Team", 52, 79, 31000], ["Monarch HR", "Team", 79, 93, 48000], ["Tandem Ops", "Team", 27, 58, 22000],
  ["Ridgeway", "Team", 58, 83, 39000], ["Oakroom", "Team", 41, 74, 26000], ["Sundial", "Starter", 22, 52, 6000],
  ["Pebble CRM", "Starter", 48, 69, 9000], ["Driftwood", "Starter", 35, 61, 7000], ["Ferngully", "Starter", 66, 82, 11000],
  ["Lowtide", "Starter", 18, 47, 5000], ["Mapleleaf", "Starter", 57, 76, 8000], ["Cobalt Bikes", "Starter", 29, 55, 6500],
];
export const accounts = accountRows.map(([name, plan, adoption, retention, arr]) => ({ name, plan, adoption, retention, arr }));

/** Revenue by plan, USD. */
export const planRevenue = [
  { plan: "Enterprise", revenue: 412000 },
  { plan: "Team", revenue: 268000 },
  { plan: "Pro", revenue: 174000 },
  { plan: "Starter", revenue: 92000 },
  { plan: "Add-ons", revenue: 41000 },
];

/** Sessions by traffic source. */
export const trafficSources = [
  { source: "Organic search", sessions: 38200 },
  { source: "Direct", sessions: 24100 },
  { source: "Referral", sessions: 15800 },
  { source: "Social", sessions: 11900 },
  { source: "Email", sessions: 9700 },
];

/** Cloud spend by service this month, USD. */
export const cloudSpend = [
  { service: "Compute", cost: 18400 },
  { service: "Storage", cost: 7200 },
  { service: "Network", cost: 4100 },
  { service: "Other", cost: 2300 },
];

/** Daily series for KPI cards (last 30 days). */
const wave = (n: number, base: number, amp: number, trend: number, seed: number) =>
  Array.from({ length: n }, (_, i) => Math.round(base + trend * i + amp * Math.sin(i / 2.3 + seed) + amp * 0.45 * Math.sin(i * 1.7 + seed * 3)));
export const kpis = {
  mrr: wave(30, 54800, 520, 235, 1),
  active: wave(30, 3320, 210, 16, 2.2),
  churn: wave(30, 268, 22, -2.1, 0.7).map((v) => v / 100),
  signups: wave(30, 148, 34, 1.4, 4.1),
};

export const pct = (v: number) => Math.round(v * 100) + "%";
export const usdK = (v: number) => (v === 0 ? "$0" : (v < 0 ? "-$" : "$") + Math.abs(v) + "K");
