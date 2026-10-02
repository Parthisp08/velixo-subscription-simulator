import { customers, plans, subscriptions } from "../data/store";
import { ChangeRequest, Preview } from "../types/domain";

function parseDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid effective date");
  return parsed;
}

function daysInUtcMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

function prorate(monthlyPriceCents: number, days: number, monthDays: number): number {
  return Math.round((monthlyPriceCents * days) / monthDays);
}

export function previewChange(input: ChangeRequest): Preview {
  const customer = customers.find(c => c.id === input.customerId);
  if (!customer) throw new Error("Customer not found");

  const subscription = subscriptions.find(s => s.customerId === input.customerId);
  if (!subscription) throw new Error("Subscription not found");

  const currentPlan = plans.find(p => p.id === subscription.planId);
  const newPlan = plans.find(p => p.id === input.newPlanId);
  if (!currentPlan || !newPlan) throw new Error("Plan not found");
  if (currentPlan.id === newPlan.id) throw new Error("New plan must be different from current plan");

  const effective = parseDate(input.effectiveDate);
  const monthDays = daysInUtcMonth(effective);
  const effectiveDay = effective.getUTCDate();

  // New plan starts on effective date; old plan ends the previous day.
  const oldPlanDays = effectiveDay - 1;
  const newPlanDays = monthDays - oldPlanDays;

  const oldPlanChargeCents = prorate(currentPlan.monthlyPriceCents, oldPlanDays, monthDays);
  const newPlanChargeCents = prorate(newPlan.monthlyPriceCents, newPlanDays, monthDays);

  return {
    customerId: customer.id,
    currentPlan,
    newPlan,
    effectiveDate: input.effectiveDate,
    daysInMonth: monthDays,
    oldPlanDays,
    newPlanDays,
    oldPlanChargeCents,
    newPlanChargeCents,
    totalChargeCents: oldPlanChargeCents + newPlanChargeCents
  };
}

export function applyChange(input: ChangeRequest): Preview {
  // Recalculate on apply so the server remains the source of truth.
  const preview = previewChange(input);
  const subscription = subscriptions.find(s => s.customerId === input.customerId)!;
  subscription.planId = input.newPlanId;
  subscription.startDate = input.effectiveDate;
  return preview;
}
