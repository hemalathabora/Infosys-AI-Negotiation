# Task 4 – Negotiation Scenario Selection

## 1. Selected Negotiation Scenario

**Scenario:** Vendor Pricing Negotiation

### Scenario Description

In this negotiation scenario, a **Buyer** wants to purchase a product or service from a **Vendor**. The Buyer wants to obtain the product at the lowest reasonable price while satisfying the required quality and delivery conditions.

The Vendor, on the other hand, wants to sell the product at a price that provides a reasonable profit while maintaining a good business relationship with the Buyer.

Both parties have different objectives and constraints. They must exchange offers and counteroffers until they reach an agreement or determine that an agreement is not possible.

This scenario is suitable for the multi-agent negotiation system because the Buyer and Vendor can each be represented by an independent AI agent with its own goals, constraints, and personality.

---

<img width="768" height="336" alt="image" src="https://github.com/user-attachments/assets/f1b57c74-3e86-4616-a3d8-de4e25891be7" />

# 2. Negotiating Parties

There are two primary negotiating parties:

1. **Buyer Agent**
2. **Vendor Agent**

Each party is represented by an AI agent that independently evaluates offers and generates responses according to its predefined objectives and constraints.

---

# 3. Party 1 – Buyer

## Role

The Buyer represents a customer or organization that wants to purchase a product or service from the Vendor.

The Buyer Agent participates in the negotiation on behalf of the customer and attempts to obtain the best possible deal.

## Primary Objective

The primary objective of the Buyer is:

> **Purchase the required product at the lowest possible price while satisfying quality and delivery requirements.**

The Buyer should not simply accept the lowest price. The offer should also satisfy the minimum quality and delivery requirements defined for the negotiation.

## Goals

The Buyer Agent has the following goals:

* Minimize the purchase price.
* Stay within the maximum available budget.
* Ensure that the product meets the required quality level.
* Obtain acceptable delivery terms.
* Avoid agreeing to unfavorable conditions.
* Complete the negotiation successfully if the deal provides sufficient value.
* Maintain a reasonable relationship with the Vendor.

## Constraints

The Buyer has several constraints that limit its negotiation decisions.

### Maximum Budget

The Buyer has a predefined maximum amount that it can spend.

For example:

```text
Maximum Budget = ₹1,00,000
```

The Buyer should not accept an offer above this amount.

### Minimum Quality Requirement

The Buyer requires a minimum acceptable quality level.

For example:

```text
Minimum Required Quality = 8/10
```

An offer with a very low price but unacceptable quality should be rejected.

### Maximum Acceptable Delivery Time

The Buyer also has a deadline for receiving the product.

For example:

```text
Maximum Delivery Time = 15 days
```

If the Vendor offers a price within the budget but cannot meet the delivery requirement, the Buyer may reject the offer.

## Personality

**Personality:** Risk-Averse and Cost-Conscious

The Buyer Agent carefully evaluates every offer before accepting it.

It does not immediately accept the Vendor's first proposal. Instead, it attempts to negotiate a better price while ensuring that the important requirements are satisfied.

## Negotiation Strategy

The Buyer Agent will generally follow this strategy:

1. Start with a relatively low initial offer.
2. Evaluate the Vendor's counteroffer.
3. Increase the offer gradually when necessary.
4. Give more importance to price than optional benefits.
5. Reject offers exceeding the maximum budget.
6. Accept an offer when it provides sufficient value.
7. Stop negotiating if the Vendor's terms become unacceptable.

---

# 4. Party 2 – Vendor

## Role

The Vendor represents a company or seller providing the required product or service to the Buyer.

The Vendor Agent negotiates with the Buyer to maximize the value of the deal while maintaining the possibility of reaching an agreement.

## Primary Objective

The primary objective of the Vendor is:

> **Sell the product at the highest reasonable price while maintaining an acceptable profit margin and reaching an agreement with the Buyer.**

The Vendor should avoid selling below its minimum acceptable price.

## Goals

The Vendor Agent has the following goals:

* Maximize the selling price.
* Maintain a healthy profit margin.
* Avoid accepting an unprofitable deal.
* Complete the sale successfully.
* Maintain a good relationship with the Buyer.
* Be flexible when necessary to prevent the negotiation from failing.
* Use delivery and service terms as possible negotiation variables.

## Constraints

### Minimum Acceptable Price

The Vendor has a minimum price below which it cannot profitably sell the product.

For example:

```text
Minimum Acceptable Price = ₹80,000
```

The Vendor should reject any final proposal below this amount unless another benefit compensates for the lower price.

### Production / Service Cost

The Vendor has an internal cost associated with producing or providing the product.

For example:

```text
Production / Service Cost = ₹65,000
```

Selling significantly below this cost would result in a loss.

### Delivery Constraint

The Vendor also has a minimum realistic delivery period.

For example:

```text
Minimum Delivery Time = 7 days
```

The Vendor cannot promise delivery earlier than this if it is operationally impossible.

## Personality

**Personality:** Competitive but Flexible

The Vendor Agent initially tries to maximize profit and does not easily reduce its price.

However, it can become flexible if the Buyer provides a reasonable counteroffer or if accepting a slightly lower price increases the probability of closing the deal.

## Negotiation Strategy

The Vendor Agent will generally follow this strategy:

1. Start with a relatively high asking price.
2. Evaluate the Buyer's counteroffer.
3. Reduce the price gradually when necessary.
4. Avoid going below the minimum acceptable price.
5. Consider other terms such as delivery time or service benefits.
6. Accept an offer when the expected benefit is sufficiently high.
7. Reject the negotiation if the Buyer's final offer is unacceptable.

---
<img width="2048" height="1152" alt="image" src="https://github.com/user-attachments/assets/30f5f598-0b39-4284-a941-e55d23b6a272" />


# 5. Example Negotiation Parameters

The following parameters can be used as an example configuration for the scenario.

| Parameter               | Buyer                          | Vendor                       |
| ----------------------- | ------------------------------ | ---------------------------- |
| Role                    | Customer / Purchaser           | Seller / Supplier            |
| Main Goal               | Minimize purchase price        | Maximize selling price       |
| Initial Offer           | ₹70,000                        | ₹1,10,000                    |
| Maximum / Minimum Price | Maximum ₹1,00,000              | Minimum ₹80,000              |
| Quality Requirement     | Minimum 8/10                   | Maintain agreed quality      |
| Delivery Requirement    | Maximum 15 days                | Minimum 7 days               |
| Personality             | Risk-Averse, Cost-Conscious    | Competitive, Flexible        |
| Main Priority           | Low price + acceptable quality | High price + profitable deal |

These values are illustrative and can be changed depending on the specific product or service being negotiated.

---

# 6. Example Negotiation

Assume the Buyer wants to purchase a software development service.

The Vendor initially asks for:

```text
Vendor Initial Offer = ₹1,10,000
```

The Buyer considers this too expensive and proposes:

```text
Buyer Counteroffer = ₹70,000
```

The Vendor evaluates the offer.

Since ₹70,000 is below the Vendor's minimum acceptable price of ₹80,000, the Vendor rejects the offer and makes a counteroffer:

```text
Vendor Counteroffer = ₹1,00,000
```

The Buyer evaluates the new offer.

The Buyer's maximum budget is ₹1,00,000, so the offer is financially acceptable. However, the Buyer may still attempt to negotiate further:

```text
Buyer Counteroffer = ₹90,000
```

The Vendor evaluates the proposal.

If ₹90,000 provides an acceptable profit margin, the Vendor may accept:

```text
Vendor: ACCEPT
Agreed Price: ₹90,000
```

The negotiation ends successfully.

---

# 7. Possible Negotiation Outcomes

The negotiation can have three major outcomes.

## Outcome 1 – Agreement

Both parties reach an acceptable deal.

Example:

```text
Final Price: ₹90,000
Quality: 8.5/10
Delivery: 12 days

Buyer: ACCEPT
Vendor: ACCEPT
```

The negotiation is successful.

---

## Outcome 2 – Rejection

One party rejects the final proposal because it violates an important constraint.

Example:

```text
Buyer Maximum Budget: ₹1,00,000
Vendor Final Offer: ₹1,10,000
```

Since the Vendor's price exceeds the Buyer's maximum budget, the Buyer rejects the proposal.

```text
Buyer: REJECT
```

The negotiation ends without an agreement.

---

## Outcome 3 – Negotiation Timeout

The system may also terminate the negotiation if the agents continue exchanging counteroffers without reaching an agreement.

For example:

```text
Maximum Negotiation Rounds = 10
```

If no agreement is reached within 10 rounds, the orchestrator can terminate the negotiation.

```text
Result: NO AGREEMENT
Reason: Maximum negotiation rounds exceeded
```

---
<img width="1270" height="631" alt="image" src="https://github.com/user-attachments/assets/5fe01895-d8b2-4405-9752-3605607e7c61" />


# 8. Agent Decision-Making

Each AI agent should make decisions based on its own objectives and constraints.

The Buyer Agent can evaluate a Vendor proposal using factors such as:

* Price
* Quality
* Delivery time
* Budget
* Previous offers
* Number of negotiation rounds

The Vendor Agent can evaluate a Buyer proposal using:

* Selling price
* Profit margin
* Delivery requirements
* Customer requirements
* Previous offers
* Probability of closing the deal

Therefore, the agents are not simply exchanging random messages.

Each agent receives the current negotiation state, evaluates the other agent's proposal, and decides whether to:

```text
ACCEPT
REJECT
COUNTEROFFER
```

---

<img width="685" height="480" alt="image" src="https://github.com/user-attachments/assets/97a12ae3-5c8d-4ba6-a2b4-1539ac7e8153" />


# 9. Negotiation Objective Summary

### Buyer Agent

**Role:** Customer / Purchaser

**Objective:** Obtain the best possible deal at the lowest reasonable price.

**Goal:**

* Minimize price.
* Stay within budget.
* Maintain required quality.
* Meet delivery requirements.

**Constraint:**

* Maximum budget.
* Minimum quality.
* Maximum delivery time.

**Personality:** Risk-Averse and Cost-Conscious.

---

### Vendor Agent

**Role:** Seller / Supplier

**Objective:** Maximize revenue and profit while successfully closing the deal.

**Goal:**

* Maximize selling price.
* Maintain profit margin.
* Satisfy reasonable customer requirements.
* Close the deal.

**Constraint:**

* Minimum acceptable selling price.
* Production/service cost.
* Minimum feasible delivery time.

**Personality:** Competitive but Flexible.

---

# 10. Why Vendor Pricing Negotiation Was Selected

Vendor Pricing Negotiation was selected because it provides a clear conflict of interests between the two negotiating agents.

The Buyer wants:

```text
Lower Price
      ↓
Better Deal
```

while the Vendor wants:

```text
Higher Price
      ↓
Higher Profit
```

At the same time, both parties have a common objective:

```text
Successful Agreement
```

This creates a realistic negotiation environment where both AI agents must balance their own objectives against the possibility of reaching a mutually acceptable agreement.

The scenario can also be easily extended later by introducing additional variables such as:

* Product quality
* Delivery time
* Warranty
* Support period
* Payment terms
* Bulk discount
* Contract duration
* Service level

Therefore, Vendor Pricing Negotiation provides a simple but effective starting scenario for implementing and testing the multi-agent negotiation system.

---

# 11. Final Scenario Definition

| Item               | Definition                                           |
| ------------------ | ---------------------------------------------------- |
| Selected Scenario  | Vendor Pricing Negotiation                           |
| Party 1            | Buyer                                                |
| Party 2            | Vendor                                               |
| Buyer Objective    | Minimize purchase cost while satisfying requirements |
| Vendor Objective   | Maximize selling price and profit                    |
| Buyer Constraint   | Maximum budget, minimum quality, delivery deadline   |
| Vendor Constraint  | Minimum acceptable price, cost, feasible delivery    |
| Buyer Personality  | Risk-Averse and Cost-Conscious                       |
| Vendor Personality | Competitive but Flexible                             |
| Possible Actions   | Accept, Reject, Counteroffer                         |
| Negotiation End    | Agreement, Rejection, or Timeout                     |
| Final Output       | Agreed deal or No Agreement                          |

## Conclusion

The selected scenario is **Vendor Pricing Negotiation**, involving two AI agents: a Buyer Agent and a Vendor Agent.

The Buyer Agent attempts to obtain the product or service at the lowest acceptable price while respecting its budget, quality, and delivery constraints. The Vendor Agent attempts to maximize its selling price and profit while ensuring that the final deal remains acceptable.

Both agents independently evaluate offers and generate **Accept, Reject, or Counteroffer** decisions based on their goals, constraints, and personalities.

This scenario provides a clear foundation for implementing the multi-agent negotiation system in later milestones.

