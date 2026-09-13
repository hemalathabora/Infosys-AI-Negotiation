# Concession Analytics Engine Documentation

## Overview

The **Concession Analytics System** provides a mathematically accurate, role-aware telemetry engine for multi-agent negotiation tracking. It calculates true concession movement, step and cumulative percentages, rate of concession decay, velocity, remaining capacity, and qualitative personality interpretations.

---

## Metric Definitions

### 1. What is a Concession?
A **Concession** is defined as a price movement AWAY from an agent's preferred starting anchor / target position and TOWARD the opponent's position / acceptable agreement zone.

- **Role-Aware Rules**:
  - **Buyer (Minimize)**: Price decreases ($P_{\text{current}} < P_{\text{previous}}$) are concessions towards target. Price increases are classified as `away_from_target` (not true concessions).
  - **Vendor (Maximize)**: Price increases ($P_{\text{current}} > P_{\text{previous}}$) are concessions towards target. Price decreases are classified as `away_from_target` (not true concessions).

### 2. Concession Amount
Step concession amount represents the non-negative magnitude of a single-turn true concession.
$$\text{Step Concession} = \begin{cases} P_{\text{previous}} - P_{\text{current}} & \text{if Buyer and } P_{\text{current}} < P_{\text{previous}} \\ P_{\text{current}} - P_{\text{previous}} & \text{if Vendor and } P_{\text{current}} > P_{\text{previous}} \\ 0 & \text{otherwise} \end{cases}$$

### 3. Concession Percentage
- **Step Concession %**:
$$\text{Step \%} = \frac{\text{Step Concession}}{|P_{\text{previous}}|} \times 100$$
- **Cumulative Concession %**:
$$\text{Cumulative \%} = \frac{\text{Cumulative Concession}}{|P_{\text{initial}}|} \times 100$$

### 4. Concession Velocity
Average true concession movement made per round:
$$\text{Concession Velocity} = \frac{\text{Cumulative True Concession}}{\text{Current Round}}$$

### 5. Rate of Concession Decay
Measures how concession step sizes decrease across successive rounds.
$$\text{Decay Rate} = \frac{\text{mean}(\text{early concessions}) - \text{mean}(\text{recent concessions})}{\text{mean}(\text{early concessions})} \times 100$$
- **Positive Decay (>0%)**: Concessions are shrinking over time (agent firming up position).
- **Zero Decay (0%)**: Concessions remain constant in size.
- **Negative Decay (<0%)**: Concessions are accelerating / expanding.
- **Null (`None`)**: Insufficient data (fewer than 2 concessions).

### 6. Concession Sum (Total True Concessions)
The sum of all **TRUE concessions** made by an agent. Movement `away_from_target` does NOT add to the Concession Sum.

### 7. Remaining Concession Capacity
The distance left before reaching the hard acceptable constraint limit:
- **Buyer**: $\max(0, \text{Maximum Price} - P_{\text{current}})$
- **Vendor**: $\max(0, P_{\text{current}} - \text{Minimum Price})$

---

## Detailed Calculation Examples

### Buyer Example

- **Profile**: Role = Buyer, Target = $80,000, Maximum Budget Limit = $85,000
- **Initial Position**: $95,000

| Turn | Offer | Movement | Direction | Step Concession | Cumulative Concession Sum | Remaining Capacity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Round 1** | $95,000 → $92,000 | -$3,000 | `toward_target` | $3,000 | $3,000 | $0 ($92k exceeds max $85k limit, capped at $85k capacity) |
| **Round 2** | $92,000 → $90,000 | -$2,000 | `toward_target` | $2,000 | $5,000 | $0 |
| **Round 3** | $90,000 → $88,000 | -$2,000 | `toward_target` | $2,000 | $7,000 | $0 |
| **Round 4** | $88,000 → $82,000 | -$6,000 | `toward_target` | $6,000 | $13,000 | $3,000 ($85k - $82k) |

- **Total True Concession**: $7,000 (after Round 3)
- **Remaining Capacity**: $3,000 (at $82,000 against $85,000 maximum limit)
- **Decay Rate**: Concessions = [3000, 2000, 2000] $\implies$ early mean = 3000, recent mean = 2000 $\implies$ Decay Rate = +33.33%

---

### Vendor Example

- **Profile**: Role = Vendor, Target = $85,000, Minimum Floor Limit = $80,000
- **Initial Position**: $75,000

| Turn | Offer | Movement | Direction | Step Concession | Cumulative Concession Sum | Remaining Capacity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Round 1** | $75,000 → $78,000 | +$3,000 | `toward_target` | $3,000 | $3,000 | $0 ($78k below floor limit $80k) |
| **Round 2** | $78,000 → $80,000 | +$2,000 | `toward_target` | $2,000 | $5,000 | $0 ($80k - $80k = $0 room) |
| **Round 3** | $80,000 → $77,000 | -$3,000 | `away_from_target` | $0 | $5,000 | $0 |
| **Round 4** | $77,000 → $83,000 | +$6,000 | `toward_target` | $6,000 | $11,000 | $3,000 ($83k - $80k) |

---

## UI Dashboard & Analytics Interpretation

1. **Dashboard Widget**: Connects directly to backend API `/api/negotiations/{id}/analytics` and displays real-time agent concession sums, rate of decay %, and capacity left.
2. **Analytics View**: Displays initial, target, current positions, decay slope, convergence progress, and automated qualitative interpretations (e.g. *"Agent is making increasingly smaller concessions"*).
3. **Empty States**: If fewer than 2 concessions exist, decay rate displays *"Insufficient rounds to calculate decay"* instead of misleading 0% values.
