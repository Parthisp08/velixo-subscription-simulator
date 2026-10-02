# Velixo Subscription Change Simulator - Backend

Simple Node.js + Express + TypeScript backend for the assignment. It deliberately uses in-memory seeded data instead of adding an unnecessary database dependency.

## Run

```bash
npm install
npm run dev
```

Server: `http://localhost:5000`

## APIs

- `GET /health`
- `GET /api/customers`
- `GET /api/plans`
- `GET /api/customers/:id/subscription`
- `POST /api/subscription-change/preview`
- `POST /api/subscription-change/apply`

### Preview example

```json
{
  "customerId": "c1",
  "newPlanId": "pro",
  "effectiveDate": "2026-10-15"
}
```

The billing service keeps money in integer cents, calculates UTC month length, gives the old plan the days before the effective date and the new plan the effective date onward, and rounds each prorated charge to cents.

`preview` does not mutate subscription data. `apply` recalculates on the server and then updates the in-memory subscription.
