# Project Phases and Task Tracker — NegoMind AI

## 1. Task Status Definitions
- `COMPLETED_AND_VERIFIED`: Code is implemented in the repository and verified through passing automated tests or interactive execution.
- `COMPLETED_BUT_NOT_VERIFIED`: Code is present in the repository but lacks an automated test case.
- `IN_PROGRESS`: Feature is actively under implementation with partial commits.
- `PARTIALLY_IMPLEMENTED`: Architectural scaffolding or UI components exist, but backend logic or full end-to-end flow is incomplete.
- `BLOCKED`: Development cannot proceed due to external dependency or unverified prerequisites.
- `NOT_STARTED`: Planned feature from Agile backlog with no source code present.
- `NEEDS_INVESTIGATION`: Discrepancy between documentation and code requires architectural audit.

---

## 2. Existing Milestone Inventory (Preserved from Agile Deliverables)

### Milestone 1: System & Agent Foundation
*(Agile Title: Milestone 1 — Basic Design & Configuration)*
- **Original Objective**: Establish core data models, agent profiles, negotiation scenarios, and persistence infrastructure.
- **Assigned Team Members**: Santanu Atta, Hemalatha Bora, Shaik Mohammad Fawaz.
- **Deliverables**: Agent profile schema, 3 preset scenarios, database models for sessions and turns.
- **Verified Status**: `COMPLETED_AND_VERIFIED` (Verified by `test_agents.py`, `test_negotiation.py`).

| User Story / Task ID | Title & Scope | Assignee | Status | Relevant Files | Tests |
|---|---|---|---|---|---|
| **US-M1-01** (Task 1) | Define basic negotiation workflow & system parameters | Team | `COMPLETED_AND_VERIFIED` | `backend/app/main.py`, `src/App.jsx` | `test_health.py` |
| **US-M1-02** (Task 2) | Define Agent Personas for all 3 scenarios | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `models/agent.py`, `negotiation_service.py` | `test_agents.py` |
| **US-M1-03** (Task 3) | Connect Scenario Selection with Agent Config | Santanu Atta | `COMPLETED_AND_VERIFIED` | `ScenarioSelector.jsx`, `AgentConfiguration.jsx` | Integration |
| **US-M1-04** (Task 4) | Agent Configuration UI with role cards | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `AgentConfiguration.jsx` | Frontend Build |

---

### Milestone 2: Negotiation Engine & Reasoning
*(Agile Title: Milestone 2 — Negotiation State & Logic)*
- **Original Objective**: Implement turn-taking orchestrator, dual reasoning (Gemini/OpenAI & Normal Mode), constraint guardrails, and concession tracking.
- **Assigned Team Members**: Hemalatha Bora, Shaik Mohammad Fawaz, Santanu Atta.
- **Deliverables**: Orchestrator state machine, Pydantic schemas, rule-based decision trees, concession telemetry math.
- **Verified Status**: `COMPLETED_AND_VERIFIED` (Verified by `test_reasoning.py`, `test_offer_evaluation.py`, `test_concession_tracking.py`).

| User Story / Task ID | Title & Scope | Assignee | Status | Relevant Files | Tests |
|---|---|---|---|---|---|
| **US-M2-01** (Task 5) | Create Negotiation State Model | Santanu Atta | `COMPLETED_AND_VERIFIED` | `models/negotiation.py`, `models/message.py` | `test_negotiation.py` |
| **US-M2-02** (Task 6) | Implement Orchestrator Interface | Santanu Atta | `COMPLETED_AND_VERIFIED` | `services/orchestrator.py` | `test_orchestrator.py` |
| **US-M2-03** (Task 7) | Define Offer Structure & Schemas | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `schemas/negotiation.py`, `schemas/response.py` | `test_offer_evaluation.py` |
| **US-M2-04** (Task 8) | Basic Negotiation Decision Logic | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `services/decision_logic.py`, `llm_reasoning.py` | `test_reasoning.py` |
| **US-M2-05** (Task 9) | Implement Concession Tracking Engine | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `services/concession_tracking.py` | `test_concession_tracking.py` |
| **US-M2-06** (Task 10)| Connect Existing UI with Negotiation State | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `useNegotiationEngine.js`, `NegotiationArena.jsx`| Frontend Build |

---

### Milestone 3: Negotiation Arena & Practice Mode
*(Agile Title: Milestone 3 — Negotiation Arena & Practice Mode)*
- **Original Objective**: Interactive web arena, autonomous Simulation Mode, human-in-the-loop Practice Mode, and deadlock detection.
- **Assigned Team Members**: Shaik Mohammad Fawaz, Hemalatha Bora, Santanu Atta.
- **Deliverables**: Arena turn transcript feed, stance badges, reasoning overlays, human turn submission, deadlock resolution.
- **Verified Status**: `COMPLETED_AND_VERIFIED` (Verified by `test_practice_mode.py`, `test_milestone3.py`, `test_interactive_practice.py`).

| User Story / Task ID | Title & Scope | Assignee | Status | Relevant Files | Tests |
|---|---|---|---|---|---|
| **US-M3-01** (Task 11) | Negotiation Arena UI with chat transcript | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `NegotiationArena.jsx` | Frontend Build |
| **US-M3-02** (Task 12) | Per-Turn Agent Reasoning Display | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `NegotiationArena.jsx` | Frontend Build |
| **US-M3-03** (Task 13) | Live Stance Indicators & Round Metrics | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `TugOfWarBargainingZone.jsx` | Frontend Build |
| **US-M3-04** (Task 14) | Human Participant Interface (Practice Mode)| Santanu Atta | `COMPLETED_AND_VERIFIED` | `NegotiationArena.jsx`, `orchestrator.py` | `test_practice_mode.py` |
| **US-M3-05** (Task 15) | User Offer & Response Input | Santanu Atta | `COMPLETED_AND_VERIFIED` | `NegotiationArena.jsx`, `api.js` | `test_interactive_practice.py`|
| **US-M3-06** (Task 16) | Human-to-AI Integration & Reactions | Santanu Atta | `COMPLETED_AND_VERIFIED` | `orchestrator.py`, `practice_service.py` | `test_interactive_practice.py`|
| **US-M3-07** (Task 17) | Deadlock Detection Module | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `services/deadlock_detection.py` | `test_milestone3.py` |
| **US-M3-08** (Task 18) | Stalled Negotiation Detection | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `services/deadlock_detection.py` | `test_milestone3.py` |
| **US-M3-09** (Task 19) | Resolution / Breakdown Handling | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `services/orchestrator.py` | `test_milestone3.py` |
| **US-M3-10** (Task 20) | Practice Mode Cross-Scenario Validation | Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `tests/test_practice_mode.py` | 13 Pytest Tests |
| **US-M3-11** (Task 21) | Module Integration (Arena, Practice, Deadlock)| All Members | `COMPLETED_AND_VERIFIED` | `App.jsx`, `NegotiationArena.jsx` | Full Test Suite |

---

### Milestone 4: Outcomes, Reporting & Finalization
*(Agile Title: Milestone 4 — Outcome, Testing, Deployment & Extensions)*
- **Original Objective**: Outcome screen, printable and downloadable summary reports, multi-variable trade-offs, authentication, custom scenarios, and production deployment.
- **Assigned Team Members**: Bhanu Jahnavi Kodamanchili, Hemalatha Bora, Santanu Atta, Shaik Mohammad Fawaz.
- **Deliverables**: Outcome summary, report generation, analytics dashboard, auth system, custom scenarios.
- **Verified Status**: `COMPLETED_AND_VERIFIED` across all core requirements.

| User Story / Task ID | Title & Scope | Assignee | Status | Relevant Files | Tests |
|---|---|---|---|---|---|
| **US-M4-01** (Task 22) | Outcome Screen layout & information hierarchy| Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `src/components/OutcomeScreen.jsx` | Frontend Build |
| **US-M4-02** (Task 23) | Downloadable transcript & summary report | Bhanu Jahnavi Kodamanchili | `COMPLETED_AND_VERIFIED` | `services/export_service.py`, `Reports.jsx` | `test_negotiation_history.py` |
| **US-M4-03** (Task 24) | End-to-end testing across Simulation & Practice| Shaik Mohammad Fawaz | `COMPLETED_AND_VERIFIED` | `tests/test_milestone3.py`, `test_interactive_practice.py` | 133 Pytest Tests |
| **US-M4-04** (Task 25) | Production deployment config & setup | Santanu Atta | `COMPLETED_AND_VERIFIED` | `render.yaml`, `vercel.json`, `Procfile` | Production Specs |
| **US-M4-05** (Task 26) | Multi-Variable Trade-off Engine | Santanu Atta | `COMPLETED_AND_VERIFIED` | `services/tradeoff_engine.py` | `test_tradeoff_engine.py` (12 tests) |
| **US-M4-06** (Task 27) | In-App AI Guide Bot | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `api/guide.py`, `GuideBot.jsx` | `test_analytics_and_guide.py` |
| **US-M4-07** (Task 28) | Voice AI Interactive Practice Mode | Shaik Mohammad Fawaz | `NOT_IMPLEMENTED` | Agile Backlog only | None (Discrepancy) |
| **US-M4-08** (Task 29) | Custom Scenario Builder | Hemalatha Bora | `COMPLETED_AND_VERIFIED` | `api/custom_scenarios.py`, `CustomScenarioBuilder.jsx` | `test_custom_scenarios.py` (4 tests) |
| **US-M4-09** (Task 30) | User Authentication & Sign In / Sign Up | Bhanu Jahnavi Kodamanchili | `COMPLETED_AND_VERIFIED` | `api/auth.py`, `services/auth_service.py`, `AuthPage.jsx` | `test_auth_avatar.py`, `test_google_oauth.py` |
| **US-M4-10** (Task 31) | ZOPA Bargaining Zone Visualization | Bhanu Jahnavi Kodamanchili | `COMPLETED_AND_VERIFIED` | `TugOfWarBargainingZone.jsx` | Frontend Build |

---

## 3. Negotiation History and Multi-Format Download Feature Tracker

The following specific tasks trace the implementation and verification of the Negotiation History audit log, session detail view, and multi-format export system:

### TASK H-001: Inspect Existing Negotiation Persistence
- **Description**: Audit SQLAlchemy `negotiations` and `negotiation_messages` tables for schema completeness, round indexing, and JSON fields.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: Verified `NegotiationModel` and `NegotiationMessageModel` in `backend/app/models/`.
- **Relevant Files**: `backend/app/models/negotiation.py`, `backend/app/models/message.py`.
- **Required Tests**: `backend/tests/test_negotiation.py`.

### TASK H-002: Audit Existing History Hooks and API Routes
- **Description**: Verify backend routes `/api/negotiations/history` and frontend hook `useNegotiationHistory.js`.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: Functional session querying, caching, and auto-syncing on negotiation completion.
- **Relevant Files**: `backend/app/api/negotiations.py`, `src/hooks/useNegotiationHistory.js`, `src/App.jsx`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 1 & 8).

### TASK H-003: Verify Session Ownership and Authorization
- **Description**: Enforce multi-tenant security by ensuring that private sessions are only accessible by their rightful creator.
- **Priority**: P0 (Security)
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `verify_negotiation_ownership()` in `backend/app/api/negotiations.py`, rejecting cross-user access with HTTP 403 and unauthenticated calls with HTTP 401.
- **Relevant Files**: `backend/app/api/negotiations.py`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 4, 5, 6).

### TASK H-004: Implement Missing History Retrieval
- **Description**: Deliver rich querying on `/api/negotiations/history` supporting keyword search, mode filter, outcome filter, date range filters, and server pagination.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: Filtered database queries returning `NegotiationHistoryListResponse`.
- **Relevant Files**: `backend/app/api/negotiations.py`, `src/services/api.js`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 1 & 8).

### TASK H-005: Implement Historical Session Detail View
- **Description**: Build full read-only detail view returning complete turn-by-turn history, agent parameters, and final terms.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `GET /api/negotiations/{id}/detail` returning `NegotiationDetailResponse`; detailed modal in `NegotiationHistory.jsx`.
- **Relevant Files**: `backend/app/api/negotiations.py`, `src/pages/NegotiationHistory.jsx`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 2, 9, 11).

### TASK H-006: Implement Server-Side PDF Export
- **Description**: Generate clean, professional PDF summaries of completed sessions using ReportLab Platypus.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `generate_session_pdf()` in `backend/app/services/export_service.py`; endpoint `GET /api/negotiations/{id}/export?format=pdf`.
- **Relevant Files**: `backend/app/services/export_service.py`, `backend/app/api/negotiations.py`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 3, 10).

### TASK H-007: Implement CSV Export with Formula Injection Protection
- **Description**: Generate structured CSV exports for single sessions with full turn rows, protecting against DDE formula injection.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `generate_session_csv()` and `sanitize_csv_cell()` in `export_service.py`; endpoint `GET /api/negotiations/{id}/export?format=csv`.
- **Relevant Files**: `backend/app/services/export_service.py`, `backend/app/api/negotiations.py`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 3, 10, 13).

### TASK H-008: Implement JSON Export with Secret Redaction
- **Description**: Generate sanitized JSON export stripping passwords, API keys, and internal tokens.
- **Priority**: P2
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `sanitize_session_for_export()` in `export_service.py`; endpoint `GET /api/negotiations/{id}/export?format=json`.
- **Relevant Files**: `backend/app/services/export_service.py`, `backend/app/api/negotiations.py`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 3, 10, 12).

### TASK H-009: Implement Export-All Functionality
- **Description**: Enable authenticated users to export their complete negotiation history portfolio in bulk.
- **Priority**: P2
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `GET /api/negotiations/history/export?format={csv|json|pdf}` and frontend button in `NegotiationHistory.jsx`.
- **Relevant Files**: `backend/app/api/negotiations.py`, `src/pages/NegotiationHistory.jsx`.
- **Required Tests**: `backend/tests/test_negotiation_history.py` (Tests 6, 8, 10).

### TASK H-010: Add Frontend History Navigation and Filters
- **Description**: Implement responsive user interface for Negotiation History featuring search bars, filter dropdowns, session table, detail modal, and download buttons.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `NegotiationHistory.jsx`, integrated into `App.jsx`, `Sidebar.jsx`, and `TopNavigation.jsx`.
- **Relevant Files**: `src/pages/NegotiationHistory.jsx`, `src/App.jsx`, `src/components/Sidebar.jsx`.
- **Required Tests**: Frontend Vite build clean (`npm run build`).

### TASK H-011: Add Authentication and Ownership Tests
- **Description**: Create automated pytest test cases validating that unauthenticated users receive 401 and cross-user attempts receive 403.
- **Priority**: P0 (Security)
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: Tests 4, 5, 6 in `test_negotiation_history.py`.
- **Relevant Files**: `backend/tests/test_negotiation_history.py`.
- **Required Tests**: `pytest tests/test_negotiation_history.py`.

### TASK H-012: Add Export Correctness and Security Tests
- **Description**: Create test cases validating Content-Type headers, formula injection defense (`'=1+1`), secret scrubbing, and safe handling of incomplete/deadlock sessions.
- **Priority**: P0 (Security)
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: Tests 10, 11, 12, 13 in `test_negotiation_history.py`.
- **Relevant Files**: `backend/tests/test_negotiation_history.py`.
- **Required Tests**: `pytest tests/test_negotiation_history.py`.

### TASK H-013: Run Regression Tests
- **Description**: Execute complete backend test suite to verify that history and export additions introduce zero regressions.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: 133 tests collected and 133 passed in 3.68s.
- **Relevant Files**: `backend/tests/`.
- **Required Tests**: `pytest backend/tests`.

### TASK H-014: Update Project Documentation
- **Description**: Create comprehensive engineering documentation in `PROJECT_DOCUMENTATION/` documenting all verified features, rules, architecture, and task statuses.
- **Priority**: P1
- **Status**: `COMPLETED_AND_VERIFIED`
- **Deliverables**: `prd.md`, `architecture.md`, `rules.md`, `phases/task.md`, `design.md`, `memory.md`, and `README.md`.
- **Relevant Files**: `PROJECT_DOCUMENTATION/`.
- **Required Tests**: Cross-document verification.

---

## 4. Definition of Done (DoD)
A task or user story is considered Complete only when:
1. **Source Code Implemented**: Feature is fully coded within the appropriate frontend or backend directory.
2. **Automated Tests Added & Passing**: Unit or integration tests exist in `backend/tests/` and pass with 0 failures.
3. **Authorization & Security Verified**: Endpoint ownership, token validity, and input sanitization have been validated.
4. **No Regressions**: Full 133-test regression suite passes cleanly.
5. **Frontend Production Build Clean**: Vite production bundle builds without errors (`npm run build`).
6. **Documentation Updated**: Feature is reflected in `PROJECT_DOCUMENTATION/`.

---

## 5. Current Blockers and Unknowns
- **Blocker**: None. Core application builds, runs, and passes all tests cleanly.
- **Unknown 1 (Voice AI Practice Mode)**: Agile item `US-M4-07` is documented in sprint planning but has no corresponding codebase implementation. Confirmed as unimplemented feature request.
- **Unknown 2 (Production Mail Service)**: The backend contains an endpoint for external mail service (`MAIL_SERVICE_URL`), but currently falls back to returning `demo_otp` in JSON responses when SMTP credentials are not configured.

---

## 6. Next Recommended Tasks
1. **Task REC-001 (P0)**: Secure OTP transmission by disabling `demo_otp` in production environments and enforcing SMTP delivery.
2. **Task REC-002 (P1)**: Implement database migrations using Alembic to replace manual `ALTER TABLE` statements in `main.py`.
3. **Task REC-003 (P2)**: Implement Voice AI Practice Mode using the Web Speech API or Whisper STT to complete Agile Story `US-M4-07`.
4. **Task REC-004 (P3)**: Unify frontend fallback orchestrator (`src/engine/`) with backend API response schemas to prevent divergence.
