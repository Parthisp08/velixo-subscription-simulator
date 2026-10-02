import { describe, expect, it } from "vitest";
import { previewChange } from "./billingService";

describe("previewChange", () => {
  it("prorates an Oct 15 Basic -> Pro change without overlapping days", () => {
    const result = previewChange({
      customerId: "c1",
      newPlanId: "pro",
      effectiveDate: "2026-10-15"
    });

    expect(result.daysInMonth).toBe(31);
    expect(result.oldPlanDays).toBe(14);
    expect(result.newPlanDays).toBe(17);
    expect(result.oldPlanChargeCents).toBe(1354);
    expect(result.newPlanChargeCents).toBe(3290);
    expect(result.totalChargeCents).toBe(4644);
  });
});
