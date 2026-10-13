# Product Requirements Document (PRD) — NegoMind AI

## 1. Document Information
- **Project Name**: NegoMind AI (*Think • Negotiate • Grow*)
- **Repository**: [hemalathabora/Infosys-AI-Negotiation](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main)
- **Document Purpose**: Authoritative Product Requirements Document defining actual system capabilities, verified features, functional/non-functional requirements, data models, limitations, and future enhancements based on empirical source inspection.
- **Version**: 1.1.0
- **Last Updated Date**: 2026-10-11
- **Verification Status**: Verified against source repository, passing automated test suite (133 backend pytest tests passing, frontend Vite build clean), and Agile submission deliverables.

---

## 2. Executive Summary
**NegoMind AI** is an AI-driven, multi-agent negotiation training and simulation platform developed for academic and enterprise environments. The system enables users to:
1. **Simulate multi-round negotiations between autonomous AI agents** operating under distinct personas (Aggressive, Collaborative, Risk-averse) and numeric constraint boundaries.
2. **Practice interactive negotiations against AI opponents** in a human-in-the-loop arena with adaptive difficulty levels, real-time tactical hints, and automated performance scorecards.
3. **Execute contextual reasoning using dual AI engines**: Google Gemini / OpenAI LLMs with strict Pydantic JSON schemas and constraint guardrails, with an instant deterministic rule engine fallback (Normal Mode).
4. **Evaluate complex, multi-issue trade-offs** using a multi-attribute utility function that detects Pareto trade-offs vs. pure concessions.
5. **Track role-aware concession telemetry** (step size, decay rate, velocity, and ZOPA overlap).
6. **Detect deadlocks and execute structured resolution proposals** before declaring negotiation breakdown.
7. **Create custom scenarios** with configurable participants, objectives, and numeric boundaries via the Custom Scenario Builder.
8. **Audit, persist, and export historical negotiation sessions** in PDF, CSV, and JSON formats with strict user ownership authorization and formula injection protection.

---

## 3. Problem Statement
In real-world business, procurement, and compensation discussions, human negotiators frequently encounter costly challenges:
1. **Lack of Safe Training Environments**: Negotiators cannot risk real commercial capital or employment opportunities to practice counteroffers, concession pacing, and trade-off strategies.
2. **Suboptimal Value Creation (Fixed-Pie Fallacy)**: Parties focus solely on a single variable (e.g., price), failing to leverage complementary variables (delivery speed, warranty length, payment milestones) to discover Pareto-efficient outcomes.
3. **Uncontrolled Concessions**: Negotiators concede too rapidly without anchoring or recognizing concession decay patterns.
4. **Premature Deadlocks**: Negotiations collapse into deadlocks when non-overlapping initial positions appear insurmountable, even though a feasible Zone of Possible Agreement (ZOPA) exists.

NegoMind AI addresses these challenges through quantifiable concession math, multi-variable package calculations, real-time coaching, and AI counterpart simulations.

---

## 4. Product Vision
- **Current State**: A production-ready full-stack application featuring a FastAPI REST backend, React 19 + Tailwind CSS frontend, persistent SQLite/PostgreSQL storage, 3 verified default scenarios, a Custom Scenario Builder, dual LLM/Normal reasoning modes, automated deadlock resolution, multi-variable trade-off analytics, and complete session history export (PDF/CSV/JSON).
- **Target Evolution**: An enterprise-grade negotiation intelligence platform offering multi-party negotiations (>2 participants), audio-based voice negotiations with natural voice synthesis, organizational team benchmarking, and continuous reinforcement learning for AI agent personas.

---

## 5. Target Users
1. **Negotiation Trainees & Students**: Individuals practicing interactive bargaining against AI agents across beginner to expert difficulty levels.
2. **Procurement Professionals & Commercial Buyers**: Users simulating vendor pricing dynamics, calculating ZOPA thresholds, and evaluating multi-variable package trade-offs.
3. **Talent Acquisition & Job Candidates**: Users exploring compensation, benefits, and start-date package adjustments.
4. **Scenario Designers & Instructors**: Users configuring custom negotiation scenarios, variable constraints, and agent personas through the Custom Scenario Builder.
5. **System Administrators / Auditors**: Users reviewing historical transcripts, concession logs, and exporting compliance reports.

---

## 6. Product Objectives
1. **Deterministic & Contextual Dual-Engine Reasoning**: Seamlessly execute negotiations using cloud LLMs (Google Gemini 1.5/2.0 Flash) or zero-latency local rule engines with automatic failover.
2. **Strict Financial Constraint Enforcement**: Prevent out-of-bounds agent agreements through backend validation guardrails (`validate_agent_constraints`), ensuring buyer ceiling budgets and seller price floors are never breached.
3. **Transparent Concession Analytics**: Measure step concession magnitude, cumulative concession decay rate, and remaining ZOPA capacity.
4. **Structured Multi-Variable Trade-Offs**: Balance multi-issue utility across non-price parameters to identify mutually beneficial concessions.
5. **Auditability & Ownership Security**: Ensure all sessions are tied to authenticated user accounts, preventing unauthorized cross-tenant data exposure and protecting exported files from formula injection.

---

## 7. Existing Features Inventory

| Feature / Subsystem | Primary Source File(s) | Verification Status | Evidence / Notes |
|---|---|---|---|
| **Scenario Selection** | `src/components/ScenarioSelector.jsx`, `backend/app/api/scenarios.py` | `IMPLEMENTED_AND_VERIFIED` | 3 preset scenarios (Vendor Pricing, Job Offer, Project Budget) verified in tests. |
| **Simulation Mode (AI vs AI)** | `backend/app/services/orchestrator.py`, `src/pages/NegotiationArena.jsx` | `IMPLEMENTED_AND_VERIFIED` | Verified by `test_milestone3.py`, `test_orchestrator.py`. |
| **Practice Mode (Human vs AI)** | `backend/app/services/practice_service.py`, `backend/app/services/orchestrator.py` | `IMPLEMENTED_AND_VERIFIED` | Interactive human turn execution, validated by `test_interactive_practice.py`. |
| **LLM Reasoning (Gemini & OpenAI)** | `backend/app/services/llm_reasoning.py` | `IMPLEMENTED_AND_VERIFIED` | Google GenAI SDK & OpenAI JSON schema support with automatic model fallback. |
| **Normal / Rule-Based Reasoning** | `backend/app/services/decision_logic.py`, `llm_reasoning.py` | `IMPLEMENTED_AND_VERIFIED` | Deterministic decision trees in `mock_llm_reasoning` and `decide_action`. |
| **Agent Configuration** | `src/pages/AgentConfiguration.jsx`, `backend/app/api/agents.py` | `IMPLEMENTED_AND_VERIFIED` | Role selection, personas (Aggressive, Collaborative, Risk-averse), constraints. |
| **Custom Scenario Builder** | `src/components/scenarios/CustomScenarioBuilder.jsx`, `backend/app/api/custom_scenarios.py` | `IMPLEMENTED_AND_VERIFIED` | Create, duplicate, edit, delete, and launch custom multi-variable scenarios. Verified by `test_custom_scenarios.py`. |
| **Negotiation Arena UI** | `src/pages/NegotiationArena.jsx` | `IMPLEMENTED_AND_VERIFIED` | Chat-style transcript, stance indicators, round metrics, concession charts. |
| **Offer Evaluation Engine** | `backend/app/services/offer_evaluation.py` | `IMPLEMENTED_AND_VERIFIED` | Evaluates utility, target position, and acceptability; verified by `test_offer_evaluation.py`. |
| **Accept / Counter / Reject Logic** | `backend/app/services/decision_logic.py` | `IMPLEMENTED_AND_VERIFIED` | Evaluates threshold conditions; verified across all 18 test suites. |
| **Constraint Guardrails** | `backend/app/services/llm_reasoning.py` | `IMPLEMENTED_AND_VERIFIED` | Clamps excessive concessions and out-of-boundary counteroffers (`validate_agent_constraints`). |
| **Concession Telemetry** | `backend/app/services/concession_tracking.py` | `IMPLEMENTED_AND_VERIFIED` | Step size, step %, cumulative decay, capacity, ZOPA; verified by `test_concession_tracking.py`. |
| **Deadlock Detection & Resolution** | `backend/app/services/deadlock_detection.py` | `IMPLEMENTED_AND_VERIFIED` | Stagnation checks, non-overlapping boundaries, resolution proposals; verified by `test_milestone3.py`. |
| **Multi-Variable Trade-off Engine** | `backend/app/services/tradeoff_engine.py` | `IMPLEMENTED_AND_VERIFIED` | Multi-issue package utility, Pareto detection; verified by `test_tradeoff_engine.py`. |
| **Practice Coaching & Hints** | `backend/app/services/practice_service.py` | `IMPLEMENTED_AND_VERIFIED` | Tactical hints (`/hint`) and performance scorecard (`/end`); verified by `test_interactive_practice.py`. |
| **User Authentication (Email/Password & OTP)** | `backend/app/api/auth.py`, `backend/app/services/auth_service.py` | `IMPLEMENTED_AND_VERIFIED` | PBKDF2 hashing, 6-digit OTP verification, bearer session tokens. Verified by `test_auth_avatar.py`. |
| **Google OAuth Integration** | `backend/app/api/auth.py`, `src/services/oauthService.js` | `IMPLEMENTED_AND_VERIFIED` | Google OAuth code flow and account linking; verified by `test_google_oauth.py`. |
| **Outcome Screen & Summary** | `src/components/OutcomeScreen.jsx` | `IMPLEMENTED_AND_VERIFIED` | Agreement details, rounds count, transcript log, objective fulfillment. |
| **Outcome Reports** | `src/pages/Reports.jsx`, `src/services/negotiationReport.js` | `IMPLEMENTED_AND_VERIFIED` | Detailed report layout with browser print-to-PDF (`window.print()`). |
| **Dashboard Analytics** | `backend/app/api/analytics.py`, `src/pages/Analytics.jsx` | `IMPLEMENTED_AND_VERIFIED` | Aggregated win rate, average rounds, session telemetry; verified by `test_analytics_and_guide.py`. |
| **Negotiation History Audit Log** | `backend/app/api/negotiations.py`, `src/pages/NegotiationHistory.jsx` | `IMPLEMENTED_AND_VERIFIED` | Authenticated session listing, search, filtering, pagination; verified by `test_negotiation_history.py`. |
| **Historical Session Detail View** | `backend/app/api/negotiations.py`, `src/pages/NegotiationHistory.jsx` | `IMPLEMENTED_AND_VERIFIED` | Read-only session detail, turn logs; verified by `test_negotiation_history.py`. |
| **History Exports (PDF, CSV, JSON)** | `backend/app/services/export_service.py`, `backend/app/api/negotiations.py` | `IMPLEMENTED_AND_VERIFIED` | ReportLab PDF, CSV with injection sanitization, JSON export; verified by `test_negotiation_history.py`. |
| **In-App AI Guide Bot** | `backend/app/api/guide.py`, `src/components/GuideBot.jsx` | `IMPLEMENTED_AND_VERIFIED` | Contextual AI assistant answering user questions; verified by `test_analytics_and_guide.py`. |
| **Voice AI Practice Mode** | Listed in Agile Product Backlog (`US-M4-07`) | `NOT_IMPLEMENTED` | Backlog item only; no speech recognition or audio synthesis code found in repository. |
| **Automated Test Suite** | `backend/tests/` | `IMPLEMENTED_AND_VERIFIED` | 133 automated pytest tests passing (100% pass rate). |

---

## 8. Functional Requirements

### FR-001: Predefined Negotiation Scenario Selection
- **Description**: The system shall provide access to 3 standard preconfigured negotiation scenarios.
- **Purpose**: Enable instant training without manual scenario authoring.
- **User Interaction**: User clicks a scenario card on the Scenarios view or Dashboard.
- **Expected Behavior**: Loads predefined agent personas, roles, goals, and numeric constraints:
  1. *Vendor Pricing*: Alex Morgan (Buyer, Max $50,000) vs. Daniel Carter (Vendor, Min $42,000). ZOPA = $8,000.
  2. *Job Offer*: Michael Anderson (Employer, Max $110,000) vs. Sarah Mitchell (Candidate, Min $95,000). ZOPA = $15,000.
  3. *Project Budget*: James Wilson (Finance Director, Max $85,000) vs. Olivia Bennett (Department Head, Min $75,000). ZOPA = $10,000.
- **Backend Dependencies**: `GET /api/scenarios`, `GET /api/scenarios/{id}`, `backend/app/services/negotiation_service.py`.
- **Validation Requirements**: Initial offer positions and constraints must be strictly non-negative.
- **Acceptance Criteria**: Selecting a scenario populates initial values in Agent Configuration and Arena.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-002: Dual Participation Modes (Simulation vs. Practice)
- **Description**: The system shall support both AI-vs-AI autonomous simulation and Human-vs-AI interactive practice.
- **Purpose**: Allow passive analytical observation or active skill acquisition.
- **User Interaction**: Mode toggle selector in Agent Configuration page.
- **Expected Behavior**:
  - In *Simulation Mode*, the orchestrator switches turns automatically between two AI agents until termination or round limit.
  - In *Practice Mode*, the system sets `participant_type="human"` on the chosen user role, awaiting human input on their turn before generating the AI counter-response.
- **Backend Dependencies**: `POST /api/negotiations`, `POST /api/negotiations/{id}/turn`, `POST /api/negotiations/{id}/practice-turn`.
- **Validation Requirements**: In Practice Mode, `human_role` must match one of the participating agent IDs.
- **Acceptance Criteria**: Human cannot act on AI turns; AI responds immediately after human offer submission.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-003: Dual Reasoning Engine (LLM vs. Normal Mode)
- **Description**: The system shall operate with either cloud LLMs (Google Gemini / OpenAI) or a deterministic local rule engine.
- **Purpose**: Guarantee platform availability without external API key dependencies.
- **User Interaction**: Engine toggle in settings (`/api/settings/mode`) or automatic fallback when LLM keys are absent/invalid.
- **Expected Behavior**:
  - *LLM Mode*: Generates structured responses (`accept`, `counter`, `reject`, `offer`, `reasoning`) via prompt schemas.
  - *Normal Mode*: Executes deterministic rule-based logic in `mock_llm_reasoning` and `decision_logic.py`.
- **Backend Dependencies**: `GET /api/settings/mode`, `POST /api/settings/mode`, `GET /api/health/llm`.
- **Validation Requirements**: Output must conform to `LLMStructuredResponse` Pydantic schema regardless of engine mode.
- **Acceptance Criteria**: Disconnecting internet or providing invalid keys triggers automatic Normal Mode fallback without application crash.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-004: Constraint & Concession Enforcement Guardrails
- **Description**: Out-of-bounds proposals generated by AI agents must be validated and clamped to agent financial boundaries.
- **Purpose**: Prevent hallucinated or unauthorized financial commitments.
- **User Interaction**: Automatic backend execution during turn evaluation.
- **Expected Behavior**: If a buyer offers above their maximum budget or a vendor accepts below their minimum floor, `validate_agent_constraints` clamps the offer to the boundary and logs the constraint violation.
- **Backend Dependencies**: `backend/app/services/llm_reasoning.py`.
- **Validation Requirements**: Clamped offers must remain within `[minimum_price, maximum_price]`.
- **Acceptance Criteria**: Test `test_reasoning.py` verifies clamping of excessive buyer offers.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-005: Concession Telemetry Tracking
- **Description**: Every turn movement must be evaluated for concession magnitude, decay rate, and remaining capacity.
- **Purpose**: Quantify negotiation momentum and prevent rapid concession surrender.
- **User Interaction**: Real-time display in Negotiation Arena telemetry cards and Analytics charts.
- **Expected Behavior**:
  - Calculates step concession amount ($|P_t - P_{t-1}|$).
  - Calculates step percentage and cumulative percentage against initial position.
  - Calculates decay rate across rounds: positive decay indicates firming stance; negative decay indicates accelerating concessions.
- **Backend Dependencies**: `backend/app/services/concession_tracking.py`, `GET /api/negotiations/{id}/metrics`.
- **Validation Requirements**: Movement away from target (hardening) must not increase cumulative concession sum.
- **Acceptance Criteria**: Verified by 13 unit tests in `test_concession_tracking.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-006: Deadlock Detection & Automated Resolution
- **Description**: Detect price stagnation and non-overlapping constraint boundaries, attempting structured compromise before termination.
- **Purpose**: Prevent infinite loops and provide win-win compromise proposals.
- **User Interaction**: Arena displays deadlock warning and resolution proposal card.
- **Expected Behavior**:
  - Detects stagnation when offer changes fall below minimum threshold over $N$ rounds.
  - Generates a mathematically sound compromise offer within the overlap zone ($[\text{Min}_{\text{Vendor}}, \text{Max}_{\text{Buyer}}]$).
  - If rejected or outside ZOPA, declares negotiation `breakdown`.
- **Backend Dependencies**: `backend/app/services/deadlock_detection.py`, `backend/app/services/orchestrator.py`.
- **Validation Requirements**: Maximum 1 resolution attempt permitted per session.
- **Acceptance Criteria**: Verified by `test_milestone3.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-007: Custom Scenario Builder
- **Description**: Users can create, update, duplicate, delete, and launch custom negotiation scenarios.
- **Purpose**: Expand negotiation simulation beyond predefined scenarios.
- **User Interaction**: Visual form in `CustomScenarioBuilder.jsx` allowing participant, variable, and objective configuration.
- **Expected Behavior**: Persists scenario to `custom_scenarios` table and translates it into an orchestrator-compatible session.
- **Backend Dependencies**: `backend/app/api/custom_scenarios.py`, `backend/app/models/custom_scenario.py`.
- **Validation Requirements**: Custom scenario must define at least two valid participants with assigned roles.
- **Acceptance Criteria**: Verified by `test_custom_scenarios.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-008: Multi-Variable Trade-off Engine
- **Description**: Evaluate multi-issue packages containing non-price attributes (delivery days, payment terms, warranty).
- **Purpose**: Support realistic enterprise contract negotiations with trade-off detection.
- **User Interaction**: Arena variable input sliders/fields for multi-issue bargaining.
- **Expected Behavior**: Computes normalized multi-attribute utility $U \in [0.0, 1.0]$ and classifies proposals as Pareto trade-offs, pure concessions, or hardening.
- **Backend Dependencies**: `backend/app/services/tradeoff_engine.py`, `backend/app/schemas/tradeoff.py`.
- **Validation Requirements**: Sum of issue weights must equal 1.0.
- **Acceptance Criteria**: Verified by 12 tests in `test_tradeoff_engine.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-009: User Authentication & Profile Security
- **Description**: Secure account registration, sign-in, email verification via 6-digit OTP, and Google OAuth.
- **Purpose**: Provide personalized, private negotiation histories and protect user records.
- **User Interaction**: AuthPage modal with tabbed sign-in/sign-up forms and OTP verification step.
- **Expected Behavior**: Generates secure bearer tokens (`nego_token_{user_id}_{random}`) and sets user profile state.
- **Backend Dependencies**: `backend/app/api/auth.py`, `backend/app/services/auth_service.py`.
- **Validation Requirements**: Passwords must be hashed using PBKDF2 with unique cryptographic salt.
- **Acceptance Criteria**: Verified by `test_auth_avatar.py` and `test_google_oauth.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

### FR-010: Negotiation History Audit & Multi-Format Export
- **Description**: Persist completed sessions to backend database, allow search/filter/pagination, and export in PDF, CSV, and JSON formats.
- **Purpose**: Deliver verifiable audit trails and downloadable transcripts for learning evaluation.
- **User Interaction**: Negotiation History page (`/history`) with filter controls, session detail modal, and download buttons.
- **Expected Behavior**:
  - `GET /api/negotiations/history`: Retrieves user-owned sessions with search, mode, outcome, and date filters.
  - `GET /api/negotiations/{id}/detail`: Returns chronological turn-by-turn history.
  - `GET /api/negotiations/{id}/export?format={pdf|csv|json}`: Generates ReportLab PDF, sanitized CSV, or cleaned JSON.
- **Backend Dependencies**: `backend/app/api/negotiations.py`, `backend/app/services/export_service.py`.
- **Validation Requirements**:
  - Enforce ownership check (`verify_negotiation_ownership`): 403 Forbidden for cross-user requests.
  - Protect CSV exports against formula injection (`sanitize_csv_cell`).
  - Strip passwords, tokens, and API keys from JSON exports.
- **Acceptance Criteria**: Verified by 13 tests in `test_negotiation_history.py`.
- **Status**: `IMPLEMENTED_AND_VERIFIED`.

---

## 9. Non-Functional Requirements

### 9.1 Security
- **Authentication**: Bearer token session authorization required for private session detail, history listing, and exports.
- **Authorization**: Backend strictly compares session `user_id` against the authenticated token user ID (`verify_negotiation_ownership`).
- **Data Protection**: Secrets (LLM API keys, database credentials, OAuth client secrets) are loaded via environment variables and never returned in API responses or export files.
- **Formula Injection Prevention**: CSV export cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are sanitized with a leading single quote (`'`).

### 9.2 Reliability & Fault Tolerance
- **Database Fallback**: If the configured external PostgreSQL database is unreachable, `database.py` logs a warning and falls back to local `sqlite:///./negotiation.db`.
- **LLM Failover**: If Gemini or OpenAI encounters rate limits (HTTP 429), authentication errors (HTTP 401), or network timeouts, the orchestrator seamlessly fails over to the local deterministic rule engine.

### 9.3 Performance
- **Local Rule Engine Turn Latency**: < 15ms execution time per turn.
- **LLM Turn Latency**: 800ms – 2,200ms depending on cloud model latency.
- **Export Generation**: PDF generation via ReportLab takes < 150ms for typical 5-round transcripts.
- **Test Suite**: Entire 133-test backend test suite executes in < 4.0 seconds.

### 9.4 Usability & Design
- **Theme**: Premium dark-mode interface (`#0C0C0F` background, Emerald `#34D399` accents, Slate text).
- **Feedback**: Dynamic loaders (`CinematicLoader`), toast messages, and contextual AI guide bot (`GuideBot.jsx`).
- **Responsive Layout**: Fluid layouts adapting to desktop (1440px+), tablet, and mobile displays.

---

## 10. User Journeys

### Journey 1: Autonomous AI Simulation
1. User logs in or enters guest mode and navigates to **Negotiation Scenarios**.
2. Selects *Vendor Pricing Negotiation*.
3. Reviews agent cards (Buyer *Alex Morgan* vs. Vendor *Daniel Carter*).
4. Keeps mode as **Simulation Mode** (AI vs. AI) and selects round limit (e.g., 5 rounds).
5. Enters **Negotiation Arena** and clicks **Start Negotiation** or **Auto Play**.
6. Watches turn-by-turn counteroffers, AI reasoning overlays, and real-time concession telemetry.
7. Reaches **Outcome Screen** on agreement or deadlock.
8. Clicks **Export Report (PDF)** or reviews transcript.

### Journey 2: Interactive Practice Session with Coaching
1. User navigates to **Configure Agents** and toggles mode to **Practice Mode**.
2. Chooses their role as **Buyer**, selecting **Intermediate** difficulty.
3. Enters **Negotiation Arena** and reviews the opponent's opening proposal.
4. Uses the natural language text box (e.g., *"I can offer $46,000 if you provide 14-day delivery"*) or numeric sliders.
5. Requests an intelligent in-session tactical hint (`Fetch Hint`).
6. Submits counteroffer; AI Vendor dynamically evaluates package utility and returns a counteroffer.
7. Upon agreement, reviews the **Performance Scorecard** evaluating Deal Efficiency, Value Claimed, and Strategy Adherence.

### Journey 3: Custom Scenario Authoring
1. User navigates to **Scenarios** and clicks **Custom Scenario Builder**.
2. Enters scenario title, description, category, and max rounds.
3. Defines Participant 1 (e.g., *Client*, Max Price $70,000) and Participant 2 (e.g., *Agency*, Min Price $55,000).
4. Adds multi-variable issue parameters (Project Scope, Turnaround Time).
5. Saves scenario; backend persists it to SQLite/PostgreSQL `custom_scenarios` table.
6. Clicks **Launch Negotiation** to immediately start simulating the custom scenario.

### Journey 4: Reviewing & Exporting Negotiation History
1. User logs into their account and navigates to **Negotiation History** via the sidebar.
2. Views tabular list of all completed sessions with outcome badges, date timestamps, and settlement prices.
3. Filters by outcome (`Agreement`), mode (`Practice`), or searches for `"vendor"`.
4. Clicks **View Details** to open a modal containing the complete turn-by-turn transcript and concession breakdown.
5. Clicks **Download PDF** to receive a ReportLab-generated summary document.
6. Clicks **Export All History (CSV)** to download an aggregate spreadsheet for offline analysis.

---

## 11. Data Requirements
- **Users**: Unique ID, email, full name, password hash, auth provider (`email`, `google`, `github`), verification flag, timestamps.
- **Agents**: ID, name, role, persona, goals JSON, constraints JSON, objectives JSON.
- **Negotiations**: ID, user ID (owner), scenario ID, mode, human role, difficulty, current round, max rounds, status, participating agents JSON, current/previous offer JSON, deadlock info JSON, live metrics JSON.
- **Messages**: ID, negotiation ID, round, agent ID, decision, proposed offer JSON, reasoning, parameters JSON, timestamp.
- **Custom Scenarios**: ID, user ID, name, category, description, participants JSON, variables JSON, objectives JSON, constraints JSON, agents JSON, max rounds, mode.

---

## 12. Security and Privacy Requirements
1. **Ownership Enforcement**: Any request to `GET /api/negotiations/{id}/detail` or `GET /api/negotiations/{id}/export` must reject mismatched users with `403 Forbidden`.
2. **Secret Masking**: Backend diagnostic endpoints (`/api/health`) must invoke `mask_secrets` to redact database passwords and API keys.
3. **No Secrets in Bundles**: Frontend production builds (`dist/`) must never contain private API keys, SMTP passwords, or OAuth client secrets.
4. **OTP Transmission Discrepancy**: Real production systems must send OTP exclusively via email/SMS. In the current codebase, `demo_otp` is returned in development JSON responses, which must be secured for production deployment.

---

## 13. Acceptance Criteria
- **AC-01**: Simulation mode runs to completion across 5 rounds without unhandled exceptions.
- **AC-02**: In Practice mode, human offers below 0 or non-numeric inputs are rejected with descriptive HTTP 400 errors.
- **AC-03**: Clamping logic in `validate_agent_constraints` guarantees no accepted agreement exceeds the buyer ceiling or falls below the seller floor.
- **AC-04**: History detail view returns chronological message order (`round 1, 2, 3...`).
- **AC-05**: CSV export prepends single quotes to cells beginning with `=`, `+`, `-`, or `@`.
- **AC-06**: Unauthorized users attempting to export another user's session receive HTTP 403.
- **AC-07**: Backend pytest suite executes 133 tests with 0 failures.

---

## 14. Current Limitations
1. **Demo OTP Exposure in API Responses**: The `/api/auth/signup` and `/api/auth/resend-otp` endpoints include `demo_otp` in the JSON response to facilitate local demonstration without requiring active SMTP credentials. This must be disabled in production environments.
2. **Browser Native Print-to-PDF on Reports Page**: While the backend provides server-side ReportLab PDF generation for history exports (`/api/negotiations/{id}/export?format=pdf`), the standalone `Reports.jsx` page primarily uses browser-native `window.print()` styling.
3. **Voice AI Practice Mode Unimplemented**: Planned in Agile Sprint Backlog as `US-M4-07`, but no speech recognition or voice API code exists in the repository.
4. **Single-Round Resolution Limit**: Deadlock resolution is currently capped at 1 automatic proposal attempt before declaring breakdown.

---

## 15. Future Enhancements
1. **Production SMTP Enforcement**: Gate `demo_otp` behind `DEBUG=True` or remove it completely in production configuration.
2. **Speech Recognition Integration**: Implement Web Speech API / Whisper STT for true hands-free Voice AI Practice Mode.
3. **Multi-Party Coalition Bargaining**: Expand orchestrator beyond 2 agents to model complex multilateral negotiations (e.g., 3+ stakeholders).
4. **Interactive Graph Visualizations**: Render 2D Pareto frontier curves and dynamic indifference contours in the multi-variable analytics tab.

---

## 16. Traceability Matrix

| Requirement ID | Backend API / Service File | Frontend UI Component | Verification Test Case | Agile Backlog Mapping | Status |
|---|---|---|---|---|---|
| **FR-001** (Scenarios) | `app/api/scenarios.py`, `app/services/negotiation_service.py` | `src/components/ScenarioSelector.jsx` | `test_agents.py`, `test_negotiation.py` | `US-M1-01`, `US-M1-02` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-002** (Dual Modes) | `app/services/orchestrator.py`, `app/api/negotiations.py` | `src/pages/AgentConfiguration.jsx`, `NegotiationArena.jsx` | `test_practice_mode.py`, `test_milestone3.py` | `US-M3-01`, `US-M3-02` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-003** (Dual Reasoning) | `app/services/llm_reasoning.py`, `app/services/decision_logic.py` | `src/components/ReadyBanner.jsx`, `App.jsx` | `test_reasoning.py`, `test_health.py` | `US-M2-04`, `US-M4-04` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-004** (Guardrails) | `app/services/llm_reasoning.py` | `src/pages/NegotiationArena.jsx` | `test_reasoning.py`, `test_offer_evaluation.py` | `US-M2-04` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-005** (Concession Math) | `app/services/concession_tracking.py` | `src/components/TugOfWarBargainingZone.jsx` | `test_concession_tracking.py` (13 tests) | `US-M2-05`, `US-M4-11` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-006** (Deadlock Handling)| `app/services/deadlock_detection.py` | `src/pages/NegotiationArena.jsx` | `test_milestone3.py` | `US-M3-03` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-007** (Custom Scenarios) | `app/api/custom_scenarios.py`, `models/custom_scenario.py` | `src/components/scenarios/CustomScenarioBuilder.jsx` | `test_custom_scenarios.py` (4 tests) | `US-M4-09` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-008** (Multi-Variable) | `app/services/tradeoff_engine.py`, `schemas/tradeoff.py` | `src/pages/NegotiationArena.jsx` | `test_tradeoff_engine.py` (12 tests) | `US-M4-06` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-009** (Authentication) | `app/api/auth.py`, `app/services/auth_service.py` | `src/pages/AuthPage.jsx`, `context/AuthContext.jsx` | `test_auth_avatar.py`, `test_google_oauth.py` | `US-M4-10` | `IMPLEMENTED_AND_VERIFIED` |
| **FR-010** (History & Export) | `app/api/negotiations.py`, `services/export_service.py` | `src/pages/NegotiationHistory.jsx`, `services/api.js` | `test_negotiation_history.py` (13 tests) | `US-M4-02` | `IMPLEMENTED_AND_VERIFIED` |
