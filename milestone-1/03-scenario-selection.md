# 3. Negotiation Scenario Selection

## Chosen scenario: Vendor Pricing Negotiation

Of the three pre-built templates (Vendor Pricing Negotiation, Job Offer
Negotiation, Project Budget Allocation), **Vendor Pricing Negotiation** is
selected for Milestone 1's build-out and testing.

**Why this one:** it has the clearest single-variable core (price), which
makes it the fastest scenario to validate the Orchestrator loop, offer
generation, and concession logic on in Milestone 2, before extending to the
multi-variable scenarios (job offers involve salary + benefits + start date;
budget allocation involves multiple competing line items).

## Negotiating parties

| | Party A: Buyer | Party B: Vendor |
|---|---|---|
| **Represents** | Procurement Manager | Sales Representative |
| **Objective** | Purchase a bulk components order at the lowest possible unit price, within budget | Sell the components order at the highest possible price, above cost |
| **Hard limit** | $50,000 maximum (cannot exceed) | $42,000 minimum (will not go below) |
| **Opening position** | Anchors low (e.g. ~$40,000) | Anchors high (e.g. ~$58,000) |
| **Success condition** | Final price ≤ $50,000 | Final price ≥ $42,000 |

## Negotiation subject

A single bulk order of components, negotiated purely on **total price**.
Quantity, quality spec, and delivery timeline are fixed and out of scope for
this scenario — keeping the negotiable surface to one dimension (price) so
Milestone 1/2 testing can clearly observe concession behavior without
confounding variables.

## Agreement zone

```
Vendor floor                                   Buyer ceiling
   $42,000 ─────────────────────────────────────── $50,000
              ↑ zone of possible agreement (ZOPA) ↑
```

Any final price landing in the $42,000–$50,000 range is a successful
negotiated outcome for both parties. A price outside this range (or no
agreement after the deadlock threshold) counts as a breakdown.
