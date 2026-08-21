# AI-Driven Multi-Agent Negotiation Training & Simulation Platform

**Milestone 1 Deliverables** (Week 1–2, ~10 hours)

This repo contains the design-phase output for Milestone 1: system workflow, agent
persona model, scenario selection, and the Agent Configuration UI wireframe.

## Folder structure

```
negotiation-simulator/
├── README.md                          ← you are here
└── milestone-1/
    ├── 01-system-workflow.md          ← end-to-end negotiation flow (diagram + notes)
    ├── 02-agent-personas.md           ← Buyer & Vendor persona definitions
    ├── 03-scenario-selection.md       ← chosen scenario: Vendor Pricing Negotiation
    └── ui-wireframe/
        ├── agent-configuration.html   ← working, styled Agent Configuration screen
        └── README.md                 ← how to view it + design notes
```

## Milestone 1 scope

- [x] Design the basic system workflow
- [x] Define agent personas (Buyer + Vendor)
- [x] Select one negotiation scenario (Vendor Pricing Negotiation)
- [x] Build a UI wireframe for the Agent Configuration screen

## How to view

- Markdown files render directly on GitHub (the workflow diagram uses Mermaid,
  which GitHub renders natively — no extra tooling needed).
- Open `milestone-1/ui-wireframe/agent-configuration.html` directly in a browser,
  or serve the folder locally, e.g.:

  ```bash
  cd milestone-1/ui-wireframe
  python3 -m http.server 8000
  # then visit http://localhost:8000/agent-configuration.html
  ```

## Next milestone

Milestone 2 builds the Orchestrator Agent, the LLM-powered offer generation
engine, and the counteroffer/concession evaluation module on top of this
design.
