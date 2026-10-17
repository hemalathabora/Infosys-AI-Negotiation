# Agile Project Documentation — NegoMind AI

## 📋 Overview
This directory contains the authoritative Agile documentation, sprint breakdowns, user stories, task trackers, and final deliverables for the **NegoMind AI** project developed under the **Infosys InStep Internship Program**.

The primary macro-enabled spreadsheet workbook is:
👉 **[`Agile_Final_Submission_Corrected.xlsm`](./Agile_Final_Submission_Corrected.xlsm)**

---

## 👥 Scrum Team & Roles

| Team Member | Role | Primary Focus Areas |
|---|---|---|
| **Santanu Atta** | Full-Stack / Backend Lead | Orchestrator, Turn-Taking State Machine, Multi-Variable Trade-off Engine, Practice Mode, Deployment |
| **Hemalatha Bora** | Frontend / UI Lead | Agent Configuration UI, Negotiation Arena, In-App Guide Bot, Scenarios View, Theme System |
| **Shaik Mohammad Fawaz** | Logic / QA Lead | Decision Logic, Deadlock Detection, Constraint Guardrails, Automated Test Suite (120+ Tests) |
| **Bhanu Jahnavi Kodamanchili** | Analytics / Security Lead | User Authentication (OTP/OAuth), Negotiation History, Multi-Format Reports (PDF/CSV/JSON), ZOPA Visualization |

---

## 🏃 Sprint & Milestone Breakdown

### Sprint 1: Milestone 1 — Basic Design & Configuration
- **Sprint Goal**: Establish project scaffolding, core data schemas, agent persona configuration, and persistence infrastructure.
- **Duration**: 2 Weeks
- **Deliverables**:
  - `US-M1-01`: Define basic negotiation workflow & system parameters.
  - `US-M1-02`: Define Agent Personas for preset scenarios (Vendor Pricing, Job Offer, Budget Allocation).
  - `US-M1-03`: Scenario Selection connected to Agent Configuration state.
  - `US-M1-04`: Agent Configuration UI with editable role cards, priorities, and boundaries.
- **Status**: ✅ **COMPLETED & VERIFIED**

### Sprint 2: Milestone 2 — Negotiation State Machine & Reasoning Engine
- **Sprint Goal**: Implement turn-taking orchestrator, dual reasoning engine (LLM + Normal Mode), constraint validation, and concession tracking.
- **Duration**: 2 Weeks
- **Deliverables**:
  - `US-M2-01`: Negotiation state models (`negotiations`, `negotiation_messages`).
  - `US-M2-02`: Orchestrator interface with turn sequencing and state transitions.
  - `US-M2-03`: Pydantic structured offer schemas and response formats.
  - `US-M2-04`: Dual reasoning pipeline (Google Gemini / OpenAI LLM + Deterministic Rule Engine).
  - `US-M2-05`: Role-aware concession tracking math (step size, cumulative concessions, momentum).
  - `US-M2-06`: React state connection with negotiation telemetry.
- **Status**: ✅ **COMPLETED & VERIFIED**

### Sprint 3: Milestone 3 — Negotiation Arena, Practice Mode & Deadlock Detection
- **Sprint Goal**: Build interactive Negotiation Arena, Simulation Mode (AI vs AI), Practice Mode (Human vs AI), and automatic deadlock detection.
- **Duration**: 2 Weeks
- **Deliverables**:
  - `US-M3-01`: Negotiation Arena layout with turn feed, active turn indicators, and bid cards.
  - `US-M3-02`: Per-turn AI reasoning overlay showing rationale, concession data, and utility.
  - `US-M3-03`: Live stance indicators (Aggressive, Collaborative, Firm) and round telemetry.
  - `US-M3-04`: Human participant interface for interactive Practice Mode.
  - `US-M3-05`: User counteroffer input with numeric validation against hard constraints.
  - `US-M3-06`: Adaptive AI responses with coaching feedback and difficulty levels.
  - `US-M3-07`: Deadlock detection module (stagnation, repeated offers, non-overlapping constraints).
  - `US-M3-08`: ZOPA midpoint compromise resolution engine.
- **Status**: ✅ **COMPLETED & VERIFIED**

### Sprint 4: Milestone 4 — Outcomes, Reporting, Security & Final Submission
- **Sprint Goal**: Build outcome screens, multi-format audit export (PDF/CSV/JSON), user authentication, custom scenarios, and production deployment.
- **Duration**: 2 Weeks
- **Deliverables**:
  - `US-M4-01`: Outcome screen with agreement breakdown, round count, and concession trajectory.
  - `US-M4-02`: Multi-format download engine (ReportLab PDF generation, sanitized CSV, JSON export).
  - `US-M4-03`: End-to-end automated testing suite with 120+ passing pytest tests.
  - `US-M4-04`: Production configuration (`render.yaml`, `vercel.json`, `Procfile`).
  - `US-M4-05`: Multi-variable trade-off engine with Pareto efficiency scoring.
  - `US-M4-06`: In-App AI Guide Bot with quick contextual Q&A.
  - `US-M4-08`: Custom Scenario Builder allowing users to define new negotiation setups.
  - `US-M4-09`: User Authentication with PBKDF2 hashing, 6-digit email OTP, and Google OAuth.
  - `US-M4-10`: Interactive ZOPA Bargaining Zone visualizer.
- **Status**: ✅ **COMPLETED & VERIFIED**

---

## 📌 Definition of Done (DoD)
A User Story is considered **DONE** when:
1. **Code Implementation**: All functional requirements are coded in the repository.
2. **Constraint Verification**: Out-of-bounds inputs are clamped and validated.
3. **Automated Testing**: Pytest test cases are written and passing (100% pass rate).
4. **Code Review**: Changes are peer-reviewed and merged into the `main` branch.
5. **Documentation**: Added to `README.md`, `architecture.md`, and the Agile tracker.
6. **Cross-Theme & Responsive Support**: Verified in both Dark Mode and Light Mode across devices.

---

## 📁 Artifacts in this Directory
- **`Agile_Final_Submission_Corrected.xlsm`**: Master Excel workbook containing full sprint backlog, burn-down data, user story acceptance criteria, and evaluation scores.
- Additional technical documentation is located in the root [`PROJECT_DOCUMENTATION/`](../PROJECT_DOCUMENTATION/) directory.
