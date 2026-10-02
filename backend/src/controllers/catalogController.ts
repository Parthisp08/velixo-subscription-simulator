import { Request, Response } from "express";
import { customers, plans, subscriptions } from "../data/store";

export function getCustomers(_req: Request, res: Response) {
  res.json(customers);
}

export function getPlans(_req: Request, res: Response) {
  res.json(plans);
}

export function getSubscription(req: Request, res: Response) {
  const subscription = subscriptions.find(s => s.customerId === req.params.id);
  if (!subscription) return res.status(404).json({ message: "Subscription not found" });
  const plan = plans.find(p => p.id === subscription.planId);
  return res.json({ ...subscription, plan });
}
