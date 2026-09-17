# Task 3 End-to-End Test Matrix

Task 3 covers the three configured scenarios, two engine modes, and all nine two-agent personality combinations.

| Dimension | Coverage |
| --- | --- |
| Scenarios | Vendor Pricing Negotiation, Job Offer Negotiation, Project Budget Allocation |
| Modes | Normal / rule-based mode, Gemini LLM mode |
| Personalities | Aggressive, Collaborative, Risk-averse |
| Combinations | Aggressive/Aggressive, Aggressive/Collaborative, Aggressive/Risk-averse, Collaborative/Aggressive, Collaborative/Collaborative, Collaborative/Risk-averse, Risk-averse/Aggressive, Risk-averse/Collaborative, Risk-averse/Risk-averse |
| Execution paths | Step Agent Turn, Run to Completion, Reset/New Negotiation |
| Output checks | State updates, terminal status, history, concessions, Outcome Screen, PDF report |

## Automated Baseline

Run the backend regression suite:

```powershell
cd "UI DESIGN/backend"
python -m pytest tests -q
```

Run frontend validation:

```powershell
cd "UI DESIGN"
npm run lint
npm run build
```

## Manual Matrix Procedure

For each scenario and personality combination, run one session with the engine in Normal Mode and one with Gemini LLM Mode enabled. For every session, verify one Step Agent Turn adds exactly one history entry, Run to Completion stops at a terminal state, Reset creates a new session, and the Outcome Screen PDF contains the current scenario's final state and transcript.

Record agreement, accepted, rejected, deadlock/breakdown, and completed outcomes when the configured constraints produce them. If Gemini is unavailable, record whether the existing backend fallback completes the same checks without corrupting the session.
