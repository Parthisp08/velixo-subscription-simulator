import { Router } from "express";
import { getCustomers, getPlans, getSubscription } from "../controllers/catalogController";
import { apply, preview } from "../controllers/subscriptionController";

const router = Router();

router.get("/customers", getCustomers);
router.get("/plans", getPlans);
router.get("/customers/:id/subscription", getSubscription);
router.post("/subscription-change/preview", preview);
router.post("/subscription-change/apply", apply);

export default router;
