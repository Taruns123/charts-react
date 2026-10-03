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
