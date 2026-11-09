// Business-dashboard math (pure, tested). Pricing constants mirror the pitch.
export const AVG_TICKET_USD = 7;
export const MATCH_FEE_USD = 0.5;
export const VISIT_FEE_USD = 1.5;
export const PRO_PRICE_USD = 79;

export function cafeRevenue(visits: number, ticket = AVG_TICKET_USD) {
  return visits * ticket;
}

export function cafeSpend(o: { promotedMatches: number; visits: number; pro: boolean }, fees = { match: MATCH_FEE_USD, visit: VISIT_FEE_USD, pro: PRO_PRICE_USD }) {
  return o.promotedMatches * fees.match + o.visits * fees.visit + (o.pro ? fees.pro : 0);
}

export function roiMultiple(revenue: number, spend: number) {
  return spend <= 0 ? 0 : revenue / spend;
}

export interface Assumptions {
  cafes: number; pctPaying: number; matchesPerCafe: number; feePerMatch: number;
  feePerVisit: number; proPrice: number; cac: number;
  visitRate?: number; proShare?: number; churn?: number; growth?: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  cafes: 120, pctPaying: 35, matchesPerCafe: 180, feePerMatch: 0.5, feePerVisit: 1.5, proPrice: 79, cac: 450,
};

/** Monthly revenue per paying café. visitRate = share of matches that become verified visits. */
export function arpc(a: Assumptions) {
  const visitRate = a.visitRate ?? 0.3, proShare = a.proShare ?? 0.25;
  return a.matchesPerCafe * a.feePerMatch + a.matchesPerCafe * visitRate * a.feePerVisit + proShare * a.proPrice;
}

export function monthlyRevenue(a: Assumptions) {
  return a.cafes * (a.pctPaying / 100) * arpc(a);
}

export function ltv(a: Assumptions) {
  const churn = a.churn ?? 0.06;
  return arpc(a) / churn;
}

export function ltvCac(a: Assumptions) {
  return a.cac <= 0 ? 0 : ltv(a) / a.cac;
}

export function project12(a: Assumptions) {
  const g = a.growth ?? 0.08;
  return Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, revenue: Math.round(monthlyRevenue({ ...a, cafes: a.cafes * Math.pow(1 + g, i) })) }));
}
