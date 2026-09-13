# Concession Tracking — AI-Driven Multi-Agent Negotiation Platform

## 1. What Concession Tracking Means

Concession tracking measures and controls the degree to which an AI negotiation agent moves from its opening anchor position toward an agreement position. It ensures agents bargain strategically, make gradual concessions, respect persona-driven concession rates, and strictly adhere to numeric boundary constraints (`maximum_price` for Buyers, `minimum_price` for Vendors).

---

## 2. Key Components & Formulae

### Initial Position
The initial offer position made by an agent in Round 1. It is stored permanently for the entire negotiation session and is **never overwritten** across subsequent rounds.

### Target Position
The strategic goal value that the agent aims to achieve (`limit * 0.9` for Buyer, `limit * 1.1` for Vendor).

### Acceptable Limits (Hard Constraints)
- **Buyer (Minimizer)**: `maximum_price` (maximum budget cap). Offers exceeding this limit are strictly prohibited.
- **Vendor (Maximizer)**: `minimum_price` (minimum floor price). Offers below this limit are strictly prohibited.

### Step Concession
The non-negative price change between the current turn and the agent's previous turn:
$$\text{Concession Amount} = | \text{Price}_{\text{current}} - \text{Price}_{\text{previous}} |$$

$$\text{Step Concession \%} = \frac{| \text{Price}_{\text{current}} - \text{Price}_{\text{previous}} |}{| \text{Price}_{\text{previous}} |} \times 100$$

### Cumulative Concession
The total movement from the permanent initial position to the current offer:
$$\text{Cumulative Concession} = | \text{Price}_{\text{current}} - \text{Price}_{\text{initial}} |$$

$$\text{Cumulative Concession \%} = \frac{| \text{Price}_{\text{current}} - \text{Price}_{\text{initial}} |}{| \text{Price}_{\text{initial}} |} \times 100$$

---

## 3. Role-Aware Direction Logic

- **Buyer (Pay/Minimizer)**:
  - Higher price is worse for the buyer. Moving price upward (or toward target/vendor) is a concession:
  - Direction: `"toward_target"` when `current_price > previous_price` (or moving toward vendor).
  - Capacity: `maximum_price - current_price`.

- **Vendor (Earn/Maximizer)**:
  - Lower price is worse for the vendor. Moving price downward (or toward target/buyer) is a concession:
  - Direction: `"toward_target"` when `current_price < previous_price` (or moving toward buyer).
  - Capacity: `current_price - minimum_price`.

---

## 4. Personality Influence & Gradual Concessions

Personality determines the maximum allowed step concession per round:
- **Aggressive**: Small step concessions ($\sim 10-15\%$). Holds firm and protects bottom line.
- **Risk-Averse**: Very small/safe step concessions ($\sim 20-25\%$). Avoids deadlocks while preserving margin.
- **Collaborative**: Moderate step concessions ($\sim 30-35\%$). Seeks win-win convergence.

Concession Control prevents unrealistic single-round jumps, enforcing gradual movement across multi-round negotiations.

---

## 5. LLM Integration & Safety Layer

The LLM receives full concession state in prompt context:
- Initial position & Target
- Previous concessions & complete history
- Remaining concession capacity
- Role direction & personality instructions

### Post-LLM Validation Pipeline
```
LLM Proposed Offer
      ↓
Concession Control (Max Step Clamping & Gradual Movement)
      ↓
Constraint Validation (Hard Min/Max Limit Enforcement)
      ↓
Final Safe Offer & Log Recording
```

Gemini (or mock fallback) is **never allowed to bypass application constraints**. If the LLM proposes an excessive step or limit violation, the application layer clamps the offer to the closest valid boundary while preserving the LLM reasoning.

---

## 6. Orchestrator Negotiation Flow

```
Opponent Offer
      ↓
Offer Evaluation
      ↓
Decision
      ↓
Generate Counteroffer (Normal or LLM Mode)
      ↓
Concession Control
      ↓
Constraint Validation
      ↓
Update State
      ↓
Record Concession & History
      ↓
Next Turn
```

---

## 7. Numerical Example

```
Initial Buyer Offer: $95,000
Maximum Acceptable Budget Limit: $85,000

Round 1: $93,000 | Step Concession: $2,000 | Cumulative: $2,000
Round 2: $91,000 | Step Concession: $2,000 | Cumulative: $4,000
Round 3: $89,000 | Step Concession: $2,000 | Cumulative: $6,000
Round 4: $87,000 | Step Concession: $2,000 | Cumulative: $8,000
Round 5: $85,000 | Step Concession: $2,000 | Cumulative: $10,000

Result: Total Concession = $10,000. Maximum Acceptable ($85,000) respected.
```

---

## 8. Verification Results

- **Backend Pytest Suite**: 14/14 tests passed (`pytest -q`)
- **Frontend Build**: Passed (`npm run build`)
- **Frontend Linter**: 0 errors (`npm run lint`)
