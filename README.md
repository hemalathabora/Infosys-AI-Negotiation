# AI-Driven Multi-Agent Negotiation Platform — Agent Configuration UI

Frontend for the **AI-Driven Multi-Agent Negotiation Training & Simulation Platform**.
This package implements the **Agent Configuration** experience — scenario selection, agent
persona display, configuration validation, and the structured handoff object consumed by the
Orchestrator/negotiation engine.

```
USER → SCENARIO SELECTION → AGENT CONFIGURATION → ORCHESTRATOR → AI AGENTS → NEGOTIATION → OUTCOME REPORT
```

## ✨ Features

- **Scenario Selector** — choose a negotiation scenario (e.g. Vendor Pricing, Job Offer,
  Project Budget Allocation) and preview its description.
- **Agent Configuration Cards** — view each agent's role, goal, constraints, and personality
  before a negotiation starts, with clear loading / error / empty states.
- **Client-side Validation** — ensures both agents have the required fields before a
  negotiation can be started.
- **Dashboard & Analytics** — negotiation status flow, agent performance, activity timeline,
  and reports.
- **Guide Bot** — an in-app assistant with a guided tour and contextual suggestions.
- **Negotiation Engine (client-side)** — offer/decision logic, concession tracking, and state
  management for simulated negotiations.
- Fully responsive UI with a dark, modern design system.

## 🛠️ Tech Stack

- **React 19** + **Vite** for a fast dev/build workflow
- **Tailwind CSS** for styling
- **lucide-react** for icons
- Plain JavaScript (JSX) with JSDoc typedefs for lightweight type safety
- **oxlint** for linting

## 📂 Project Structure

```
src/
  components/        # Reusable UI components (cards, banners, nav, sidebar, etc.)
    dashboard/        # Dashboard-specific widgets
    guide/             # Guide bot UI pieces
  pages/              # Route-level pages (Dashboard, AgentConfiguration, NegotiationArena, Analytics, Reports)
  data/               # Static/demo data (scenarios, dashboard data, guide knowledge base)
  services/           # Data access, validation, and orchestrator handoff logic
  engine/             # Client-side negotiation engine (offers, decisions, state, concessions)
  hooks/              # Custom React hooks
  types/              # JSDoc type definitions
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (comes with Node.js)

### Installation

```bash
git clone <repository-url>
cd "UI DESIGN"
npm install
```

### Available Scripts

```bash
npm run dev       # Start the dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # Run oxlint
```

## 🧩 Orchestrator Handoff

Clicking **Start Negotiation** validates the selected scenario's agents and produces a
structured handoff object for the negotiation engine/orchestrator, for example:

```json
{
  "scenario_id": "vendor_pricing",
  "agents": [
    { "id": "buyer", "name": "Buyer", "role": "Procurement Manager", "goal": "Lowest possible unit price", "constraints": ["Maximum $50,000"], "personality": "Risk-averse" },
    { "id": "vendor", "name": "Vendor", "role": "Sales Representative", "goal": "Maximize profit margin", "constraints": ["Minimum $42,000"], "personality": "Aggressive" }
  ]
}
```

## 📱 Responsiveness & Accessibility

- Desktop: agent cards laid out side-by-side
- Mobile (< `lg` breakpoint): cards stack vertically, sidebar collapses behind a menu button
- Personality is always shown as an **icon + text label**, never color alone
- Keyboard focus is visible on interactive elements (selects, nav links, buttons)

## 👥 Designed by Team 4

| # | Name |
|---|------|
| 1 | Santanu Atta |
| 2 | Hemalatha Bora |
| 3 | Shaik Mohammed Fawaz |

## 📄 License

This project is intended for academic/educational use as part of a team submission.
