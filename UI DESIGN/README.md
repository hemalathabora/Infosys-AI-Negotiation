# Agent Configuration UI — Multi-Agent Negotiation Simulator

Frontend for the **AI-Driven Multi-Agent Negotiation Training & Simulation
Platform**. This package implements the **Agent Configuration** page:
scenario selection, agent persona display, configuration validation, and a
structured handoff object for the Orchestrator module.

```
USER → SCENARIO SELECTION → AGENT CONFIGURATION → ORCHESTRATOR → AI AGENTS → NEGOTIATION → OUTCOME REPORT
```

This UI owns everything up to and including **Agent Configuration**. It does
**not** implement LLM reasoning, negotiation strategy, offer/counteroffer
logic, deadlock handling, or agent-to-agent communication — those belong to
the Orchestrator and Agent Reasoning modules (other team members).

## Stack

- **React 19 + Vite** — no existing repo was found to integrate with, so this
  was scaffolded fresh per the "prefer React + Vite if no framework is
  specified" fallback rule.
- **Tailwind CSS** for styling, configured with the dark AI-product palette
  (`tailwind.config.js`: `bg`, `card`, `border`, `primary`, `success`,
  `warning`, `textPrimary`, `textSecondary`).
- Plain JavaScript (JSX) with JSDoc typedefs in `src/types/negotiation.js` —
  no TypeScript toolchain was introduced since none existed.

## Running the project

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the production build
npm run lint       # oxlint — 0 errors on this codebase
```

## Project structure

```
src/
  components/
    TopNavigation.jsx
    Sidebar.jsx
    ScenarioSelector.jsx
    ScenarioDescription.jsx
    AgentCard.jsx
    AgentHeader.jsx
    GoalSection.jsx
    ConstraintList.jsx
    PersonalityBadge.jsx
    ConfigurationStatus.jsx
    StartNegotiationButton.jsx
    LoadingState.jsx
    ErrorState.jsx
    EmptyState.jsx
  pages/
    AgentConfiguration.jsx
  data/
    scenarios.js          # approved demo data (vendor pricing only)
  services/
    scenarioService.js     # data access + validation + orchestrator handoff
  hooks/
    useScenarioConfiguration.js
  types/
    negotiation.js         # JSDoc typedefs for Scenario / Agent / Handoff
```

## Scenario data

Only **Vendor Pricing Negotiation** ships with real persona data, per the
approved demo data in the spec. **Job Offer Negotiation** and **Project
Budget Allocation** are wired into the selector and data model
(`src/data/scenarios.js`) but intentionally carry no invented agent data —
selecting them shows an empty state ("coming soon") until the team supplies
real personas. This keeps the data-driven architecture ready for drop-in
without fabricating values.

## Orchestrator handoff

`Start Negotiation` validates the current scenario's two agents (name, role,
goal, ≥1 constraint, personality all present), then builds:

```json
{
  "scenario_id": "vendor_pricing",
  "agents": [
    { "id": "buyer", "name": "Buyer", "role": "Procurement Manager", "goal": "Lowest possible unit price", "constraints": ["Maximum $50,000"], "personality": "Risk-averse" },
    { "id": "vendor", "name": "Vendor", "role": "Sales Representative", "goal": "Maximize profit margin", "constraints": ["Minimum $42,000"], "personality": "Aggressive" }
  ]
}
```

There is no Negotiation Arena route in this repo yet, so on click the UI
shows this handoff object inline instead of navigating — swap the body of
`handleStartNegotiation` in `src/pages/AgentConfiguration.jsx` for a router
push (or a call into the Orchestrator's entry point) once that module exists.
No LLM or negotiation logic is called from the UI.

## States implemented

- **Loading** — skeleton agent cards + "Loading agent personas..."
- **Error** — "Unable to load agent configuration." with a Retry button
  (triggered by requesting an unknown scenario id; wire real fetch failures
  into `scenarioService.js` the same way)
- **Empty** — shown when a scenario has no agent data yet
- **Success** — two agent cards, configuration status banner, enabled CTA

## Verified

- `npm run build` — clean production build, no errors
- `npm run lint` (oxlint) — 0 errors, 1 informational warning on the standard
  data-fetching `useEffect` pattern
- Scenario switching re-renders agent cards with no page reload
- Desktop: two cards side-by-side; mobile (< lg breakpoint): stacked cards,
  no horizontal scroll; sidebar collapses behind a menu button
- Personality is always shown as icon **+ text label**, never color alone
- Keyboard focus is visible on the scenario select, nav links, and buttons

## Suggested Git workflow (Member 3 — UI/Frontend)

```bash
git checkout -b member3-ui
git add frontend/   # or wherever this package lives in the monorepo
git commit -m "Implement agent configuration UI"
```

## My UI contribution (for submission writeup)

Built the complete Agent Configuration screen: scenario selector driving a
data-driven two-card agent layout, a reusable `AgentCard` composed of
smaller presentational pieces (`AgentHeader`, `GoalSection`,
`ConstraintList`, `PersonalityBadge`), loading/error/empty states, client-side
configuration validation, and a `StartNegotiationButton` that assembles and
surfaces the structured handoff object the Orchestrator will consume. No
negotiation logic, LLM calls, or agent communication is implemented here —
this module's job ends at producing a valid, structured configuration.
