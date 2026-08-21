# Agent Configuration Screen — Wireframe

`agent-configuration.html` is a self-contained, working wireframe (open it
directly in any browser — no build step, no dependencies beyond Google Fonts).

## What it covers (per Milestone 1 task 4)

- **Scenario selection** — folder-tab style switcher across the three templates (Vendor Pricing pre-filled and active).
- **Agent name / role** — editable text field per agent.
- **Personality selection** — toggle "seals," one active choice per agent (Collaborative / Risk-averse / Aggressive).
- **Goals & constraints** — ledger-style rows showing goal, hard limit, and opening offer per agent.
- **Start Negotiation button** — locks configuration and hands off to the Orchestrator (stubbed for now; wired to real state in Milestone 2).

## Design concept

The screen is built around a **boardroom** metaphor: two facing panels
(Buyer / Vendor) separated by a brass "table seam," like opposing sides of a
negotiating table. It's meant to visually set up the tension the simulator is
built around before the negotiation even starts.

- **Palette** — deep ink-navy background with warm parchment panels; buyer
  reads cool green, vendor reads warm rust, tied together by a brass accent
  used for the seam, tabs, and primary action.
- **Type** — `Fraunces` (a contract/treaty-flavored serif) for headings,
  `Inter` for UI text, `IBM Plex Mono` for numbers, stats, and labels — so
  negotiation figures read like ledger entries.
- **Interaction** — personality selection and scenario tabs are functional
  (click to toggle/switch); the Start button gives a status message. Real
  state management, validation, and the handoff into the Negotiation Arena
  transcript view are Milestone 2/3 work.

## Known placeholders (intentional for Milestone 1)

- Only the Vendor Pricing scenario is pre-filled with real data; Job Offer
  and Budget Allocation tabs are visually present but not yet wired.
- The "Agreement Zone Width" and "Max Rounds" stats are static — they'll be
  computed live once the Orchestrator (Milestone 2) tracks real state.
