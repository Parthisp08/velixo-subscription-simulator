import { Customer, Plan, Subscription } from "../types/domain";

export const customers: Customer[] = [
  { id: "c1", name: "Acme Corp" },
  { id: "c2", name: "Northwind Ltd" }
];

export const plans: Plan[] = [
  { id: "basic", name: "Basic", monthlyPriceCents: 2999 },
  { id: "pro", name: "Pro", monthlyPriceCents: 5999 },
  { id: "enterprise", name: "Enterprise", monthlyPriceCents: 9999 }
];

export const subscriptions: Subscription[] = [
  { customerId: "c1", planId: "basic", startDate: "2026-10-01" },
  { customerId: "c2", planId: "pro", startDate: "2026-10-01" }
];
