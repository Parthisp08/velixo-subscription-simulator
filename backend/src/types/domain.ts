export type Customer = { id: string; name: string };
export type Plan = { id: string; name: string; monthlyPriceCents: number };
export type Subscription = { customerId: string; planId: string; startDate: string };

export type ChangeRequest = {
  customerId: string;
  newPlanId: string;
  effectiveDate: string;
};

export type Preview = {
  customerId: string;
  currentPlan: Plan;
  newPlan: Plan;
  effectiveDate: string;
  daysInMonth: number;
  oldPlanDays: number;
  newPlanDays: number;
  oldPlanChargeCents: number;
  newPlanChargeCents: number;
  totalChargeCents: number;
};
