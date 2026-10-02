import { NextFunction, Request, Response } from "express";
import { applyChange, previewChange } from "../services/billingService";
import { ChangeRequest } from "../types/domain";

function validateBody(req: Request): ChangeRequest {
  const { customerId, newPlanId, effectiveDate } = req.body ?? {};
  if (!customerId || !newPlanId || !effectiveDate) {
    throw new Error("customerId, newPlanId and effectiveDate are required");
  }
  return { customerId, newPlanId, effectiveDate };
}

export function preview(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(previewChange(validateBody(req)));
  } catch (error) {
    next(error);
  }
}

export function apply(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ message: "Subscription updated", preview: applyChange(validateBody(req)) });
  } catch (error) {
    next(error);
  }
}
