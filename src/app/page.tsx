"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
};

type Plan = {
  id: string;
  name: string;
  monthlyPriceCents: number;
};

type Subscription = {
  customerId: string;
  planId: string;
  startDate: string;
  plan: Plan;
};

type BillingPreview = {
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

function formatMoney(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);

  const [billingPreview, setBillingPreview] =
    useState<BillingPreview | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [changeApplied, setChangeApplied] = useState(false);

  const customer = customers.find(
    (customer) => customer.id === selectedCustomer
  );

  // Load customers and plans when page loads
  useEffect(() => {
    async function loadInitialData() {
      try {
        setError("");

        const [customersResponse, plansResponse] = await Promise.all([
          fetch("http://localhost:5000/api/customers"),
          fetch("http://localhost:5000/api/plans"),
        ]);

        if (!customersResponse.ok || !plansResponse.ok) {
          throw new Error("Unable to load customer and plan data.");
        }

        const customersData: Customer[] =
          await customersResponse.json();

        const plansData: Plan[] =
          await plansResponse.json();

        setCustomers(customersData);
        setPlans(plansData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load application data."
        );
      }
    }

    loadInitialData();
  }, []);

  // Load selected customer's current subscription
  async function loadSubscription(customerId: string) {
    const response = await fetch(
      `http://localhost:5000/api/customers/${customerId}/subscription`
    );

    if (!response.ok) {
      throw new Error("Unable to load current subscription.");
    }

    const data: Subscription = await response.json();

    setCurrentSubscription(data);
  }

  // Customer dropdown change
  async function handleCustomerChange(customerId: string) {
    setSelectedCustomer(customerId);

    // Reset dependent fields
    setSelectedPlan("");
    setEffectiveDate("");
    setBillingPreview(null);
    setCurrentSubscription(null);
    setChangeApplied(false);
    setError("");

    if (!customerId) {
      return;
    }

    try {
      setLoading(true);

      await loadSubscription(customerId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load current subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  // Preview subscription change using backend billing service
  async function handlePreview() {
    if (
      !selectedCustomer ||
      !selectedPlan ||
      !effectiveDate
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setChangeApplied(false);

      const response = await fetch(
        "http://localhost:5000/api/subscription-change/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: selectedCustomer,
            newPlanId: selectedPlan,
            effectiveDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to preview subscription change."
        );
      }

      setBillingPreview(data);
    } catch (err) {
      setBillingPreview(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to preview subscription change."
      );
    } finally {
      setLoading(false);
    }
  }

  // Apply subscription change using backend API
  async function handleApplyChange() {
    if (
      !selectedCustomer ||
      !selectedPlan ||
      !effectiveDate
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/subscription-change/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: selectedCustomer,
            newPlanId: selectedPlan,
            effectiveDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to apply subscription change."
        );
      }

      // Reload subscription from backend
      await loadSubscription(selectedCustomer);

      setChangeApplied(true);
      setBillingPreview(null);
      setSelectedPlan("");
      setEffectiveDate("");
    } catch (err) {
      setChangeApplied(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to apply subscription change."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Subscription Change Simulator</h1>

      <p className="subtitle">
        Preview and apply subscription plan changes for customers.
      </p>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* Customer Selection */}
      <section className="card">
        <h2>Customer</h2>

        <label htmlFor="customer">
          Select Customer
        </label>

        <select
          id="customer"
          value={selectedCustomer}
          disabled={loading}
          onChange={(event) =>
            handleCustomerChange(event.target.value)
          }
        >
          <option value="">
            Select a customer
          </option>

          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>
          ))}
        </select>
      </section>

      {loading && (
        <p className="loading">
          Loading...
        </p>
      )}

      {/* Current Subscription */}
      {customer && currentSubscription && (
        <section className="card">
          <h2>Current Subscription</h2>

          <div className="detailRow">
            <span>Customer</span>
            <strong>
              {customer.name}
            </strong>
          </div>

          <div className="detailRow">
            <span>Current Plan</span>
            <strong>
              {currentSubscription.plan.name}
            </strong>
          </div>

          <div className="detailRow">
            <span>Monthly Price</span>
            <strong>
              $
              {formatMoney(
                currentSubscription.plan
                  .monthlyPriceCents
              )}
            </strong>
          </div>
        </section>
      )}

      {/* Change Subscription */}
      {customer && currentSubscription && (
        <section className="card">
          <h2>Change Subscription</h2>

          <label htmlFor="newPlan">
            New Plan
          </label>

          <select
            id="newPlan"
            value={selectedPlan}
            disabled={loading}
            onChange={(event) => {
              setSelectedPlan(event.target.value);
              setBillingPreview(null);
              setChangeApplied(false);
              setError("");
            }}
          >
            <option value="">
              Select a new plan
            </option>

            {plans
              .filter(
                (plan) =>
                  plan.id !==
                  currentSubscription.planId
              )
              .map((plan) => (
                <option
                  key={plan.id}
                  value={plan.id}
                >
                  {plan.name} - $
                  {formatMoney(
                    plan.monthlyPriceCents
                  )}
                </option>
              ))}
          </select>

          <label htmlFor="effectiveDate">
            Effective Date
          </label>

          <input
            id="effectiveDate"
            type="date"
            value={effectiveDate}
            disabled={loading}
            onChange={(event) => {
              setEffectiveDate(event.target.value);
              setBillingPreview(null);
              setChangeApplied(false);
              setError("");
            }}
          />

          <button
            type="button"
            disabled={
              loading ||
              !selectedPlan ||
              !effectiveDate
            }
            onClick={handlePreview}
          >
            {loading
              ? "Please wait..."
              : "Preview Change"}
          </button>
        </section>
      )}

      {/* Billing Preview */}
      {billingPreview && customer && (
        <section className="card preview">
          <h2>Billing Preview</h2>

          <div className="detailRow">
            <span>Effective Date</span>
            <strong>
              {billingPreview.effectiveDate}
            </strong>
          </div>

          <div className="detailRow">
            <span>Days in Billing Month</span>
            <strong>
              {billingPreview.daysInMonth}
            </strong>
          </div>

          <hr />

          <h3>Current Plan</h3>

          <div className="detailRow">
            <span>Plan</span>
            <strong>
              {billingPreview.currentPlan.name}
            </strong>
          </div>

          <div className="detailRow">
            <span>Usage Days</span>
            <strong>
              {billingPreview.oldPlanDays} days
            </strong>
          </div>

          <div className="detailRow">
            <span>Prorated Charge</span>
            <strong>
              $
              {formatMoney(
                billingPreview.oldPlanChargeCents
              )}
            </strong>
          </div>

          <hr />

          <h3>New Plan</h3>

          <div className="detailRow">
            <span>Plan</span>
            <strong>
              {billingPreview.newPlan.name}
            </strong>
          </div>

          <div className="detailRow">
            <span>Usage Days</span>
            <strong>
              {billingPreview.newPlanDays} days
            </strong>
          </div>

          <div className="detailRow">
            <span>Prorated Charge</span>
            <strong>
              $
              {formatMoney(
                billingPreview.newPlanChargeCents
              )}
            </strong>
          </div>

          <hr />

          <div className="detailRow total">
            <span>Total Charge</span>
            <strong>
              $
              {formatMoney(
                billingPreview.totalChargeCents
              )}
            </strong>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleApplyChange}
          >
            {loading
              ? "Applying..."
              : "Apply Change"}
          </button>
        </section>
      )}

      {changeApplied && (
        <p className="success">
          Subscription change applied successfully.
        </p>
      )}
    </main>
  );
}