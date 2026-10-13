# Project Memory and Development Context — NegoMind AI

## 1. Project Identity
- **Name**: NegoMind AI (*Think • Negotiate • Grow*)
- **Repository**: `hemalathabora/Infosys-AI-Negotiation`
- **Purpose**: Academic and enterprise multi-agent negotiation training and simulation platform.
- **Key Technologies**: Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2, ReportLab, Google Gemini & OpenAI LLMs, React 19, Vite 8, Tailwind CSS 3.4.
- **Application Roots**:
  - Frontend SPA Root: `UI DESIGN/`
  - Backend API Root: `UI DESIGN/backend/`

---

## 2. Repository Map

| Path | Responsibility |
|---|---|
| `UI DESIGN/src/App.jsx` | Main frontend layout, page router, authentication listener, session recorder. |
| `UI DESIGN/src/pages/` | Application page views (Dashboard, AgentConfiguration, NegotiationArena, Analytics, Reports, NegotiationHistory, AuthPage). |
| `UI DESIGN/src/components/` | Reusable UI widgets (TopNavigation, Sidebar, OutcomeScreen, TugOfWarBargainingZone, GuideBot). |
| `UI DESIGN/src/services/api.js` | Authoritative frontend REST client for all backend FastAPI endpoints. |
| `UI DESIGN/src/context/AuthContext.jsx`| User authentication context, bearer token management, profile state. |
| `UI DESIGN/src/engine/` | Client-side JavaScript negotiation fallback orchestrator (offline use). |
| `UI DESIGN/backend/app/main.py` | FastAPI application entrypoint, CORS configuration, router registration, global error handler. |
| `UI DESIGN/backend/app/config.py` | Pydantic BaseSettings loading environment variables from `.env`. |
| `UI DESIGN/backend/app/database.py` | SQLAlchemy database engine setup with automatic SQLite fallback. |
| `UI DESIGN/backend/app/api/` | REST API routers (`auth.py`, `negotiations.py`, `custom_scenarios.py`, `scenarios.py`, `agents.py`, `analytics.py`, `guide.py`). |
| `UI DESIGN/backend/app/models/` | SQLAlchemy models (`user.py`, `negotiation.py`, `message.py`, `custom_scenario.py`, `agent.py`). |
| `UI DESIGN/backend/app/services/orchestrator.py` | Multi-agent negotiation turn management and state machine. |
| `UI DESIGN/backend/app/services/llm_reasoning.py` | LLM prompt generation, structured JSON parsing, constraint clamping guardrails. |
| `UI DESIGN/backend/app/services/decision_logic.py` | Rule-based decision logic and utility scoring. |
| `UI DESIGN/backend/app/services/offer_evaluation.py` | Authoritative target position resolver and acceptability evaluator. |
| `UI DESIGN/backend/app/services/concession_tracking.py` | Single-source mathematical concession telemetry engine. |
| `UI DESIGN/backend/app/services/deadlock_detection.py` | Price stagnation detection and automated resolution proposals. |
| `UI DESIGN/backend/app/services/tradeoff_engine.py` | Multi-variable package calculations and Pareto efficiency detection. |
| `UI DESIGN/backend/app/services/practice_service.py` | NLP offer parsing, difficulty level scaling, tactical hints, scorecard. |
| `UI DESIGN/backend/app/services/export_service.py` | Server-side ReportLab PDF, sanitized CSV, and JSON export generator. |
| `UI DESIGN/backend/app/services/auth_service.py` | Password hashing (PBKDF2), OTP management, session tokens, Google OAuth. |
| `UI DESIGN/backend/tests/` | 18 automated pytest test modules (133 passed tests). |

---

## 3. Architectural Source of Truth
- **Frontend Entrypoint**: `UI DESIGN/src/main.jsx`
- **Backend Entrypoint**: `UI DESIGN/backend/app/main.py`
- **Negotiation Engine**: `backend/app/services/orchestrator.py` (authoritative)
- **Database Engine**: `backend/app/database.py`
- **API Client**: `UI DESIGN/src/services/api.js`
- **Authentication**: `backend/app/services/auth_service.py` (backend) & `src/context/AuthContext.jsx` (frontend)
- **Concession Math**: `backend/app/services/concession_tracking.py`
- **History & Export**: `backend/app/api/negotiations.py` & `backend/app/services/export_service.py`

---

## 4. Negotiation Behavior
1. **Participation Modes**:
   - *Simulation Mode*: Autonomous AI agent vs. AI agent turn progression.
   - *Practice Mode*: Human user vs. AI agent with adaptive difficulty (Beginner, Intermediate, Advanced, Expert).
2. **Reasoning Modes**:
   - *LLM Mode*: Google Gemini or OpenAI generating structured JSON decisions (`accept`, `counter`, `reject`, `offer`, `reasoning`).
   - *Normal Mode*: Deterministic rule-based decision trees (`mock_llm_reasoning`) with instant response time.
3. **Constraint Clamping**: `validate_agent_constraints` detects and clamps proposals violating buyer ceilings or seller floors.
4. **Concession Telemetry**: Measures step size, step %, cumulative decay rate, velocity, and remaining capacity.
5. **Deadlock Resolution**: Stagnation triggers at most 1 compromise proposal within the ZOPA. If rejected, session terminates as `breakdown`.
6. **Termination Logic**: Concludes on explicit acceptance (`agreement`), explicit rejection (`rejected`), unresolvable deadlock (`breakdown`), or max round limit (`completed`).

---

## 5. Important Existing Features
- **Fully Implemented & Verified**: Scenario Selection, Simulation Mode, Practice Mode, LLM Reasoning, Normal Mode Reasoning, Agent Configuration, Custom Scenario Builder, Negotiation Arena, Offer Evaluation, Constraint Guardrails, Concession Telemetry, Deadlock Detection, Multi-Variable Trade-off Engine, Practice Coaching & Scorecards, Authentication (Email/Password & OTP), Google OAuth, History Audit Log, History Exports (PDF, CSV, JSON), In-App Guide Bot.
- **Partially Implemented**: Email OTP Dispatch (backend code exists, but returns `demo_otp` in JSON responses when SMTP is unconfigured).
- **Not Implemented**: Voice AI Interactive Practice Mode (planned in Agile Backlog as `US-M4-07`, but no speech code exists in repository).

---

## 6. Current Known Issues
1. **Security - Demo OTP Exposure**: Endpoints `/api/auth/signup` and `/api/auth/resend-otp` return `demo_otp` in HTTP responses, which must be disabled in production environments.
2. **Architecture - Dual Engine Code**: Parallel JS engine in `src/engine/` duplicates logic from Python `backend/app/services/`. Python is authoritative.
3. **Database - Dynamic Alter Table Migrations**: Database schema updates are executed via manual `ALTER TABLE` statements in `main.py` rather than Alembic migrations.

---

## 7. Testing Commands
- **Backend Test Suite**:
  ```powershell
  cd "UI DESIGN\backend"
  python -m pytest
  ```
  *Validates*: 133 tests across all 18 modules (engines, APIs, auth, exports, ownership).
- **Frontend Production Build**:
  ```powershell
  cd "UI DESIGN"
  npm run build
  ```
  *Validates*: Vite bundling, asset optimization, JSX syntax correctness.
- **Frontend Linter**:
  ```powershell
  cd "UI DESIGN"
  npm run lint
  ```
  *Validates*: Oxlint rules and React Hooks compliance.

---

## 8. Configuration (Environment Variable Names)
*Secret values are omitted for security.*
- **Backend (`UI DESIGN/backend/.env`)**:
  - `LLM_PROVIDER`: Reasoning provider (`gemini`, `openai`, `mock`).
  - `LLM_API_KEY`: API key for Gemini or OpenAI.
  - `LLM_MODEL`: Model identifier (e.g., `gemini-1.5-flash`).
  - `DATABASE_URL`: Connection string (`sqlite:///./negotiation.db` or PostgreSQL URI).
  - `PORT`, `HOST`: Network port and host binding.
  - `CORS_ORIGINS`: Comma-separated list of allowed frontend origins.
  - `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`: Mail settings.
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google OAuth.
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: GitHub OAuth.
- **Frontend (`UI DESIGN/.env`)**:
  - `VITE_API_BASE_URL`: Base URL for FastAPI backend (default: `http://localhost:8000/api`).

---

## 9. Development Rules Summary
1. The Python FastAPI backend is the **authoritative state**; the frontend is a presentation layer.
2. Every offer must pass through `validate_agent_constraints` to clamp financial boundaries.
3. Never trust a client-supplied user ID; always derive identity from the bearer token.
4. Enforce resource ownership before returning session history or generating exports.
5. All CSV cells must be sanitized against formula injection (`sanitize_csv_cell`).
6. All 133 tests must pass before considering a backend modification complete.

---

## 10. Current Work (Negotiation History & Export Feature)
- Backend endpoints (`/history`, `/history/export`, `/{id}/detail`, `/{id}/export`, `/record`) are **fully implemented and verified**.
- ReportLab PDF generation, sanitized CSV export, and clean JSON exports are **fully implemented and verified**.
- 13 dedicated automated tests in `test_negotiation_history.py` pass cleanly.
- Frontend page `NegotiationHistory.jsx` and hook `useNegotiationHistory.js` are fully integrated with search, filters, pagination, and download actions.

---

## 11. Important Architectural Decisions
- **ADR-001**: Dual reasoning pipeline (Gemini / OpenAI vs. Normal Mode) prevents hard external API dependencies.
- **ADR-002**: Centralized concession math in `concession_tracking.py` ensures identical metrics across evaluators, telemetry, and reports.
- **ADR-003**: Server-side ReportLab PDF generation guarantees standardized, downloadable documents regardless of user browser.
- **ADR-004**: Automatic SQLite fallback guarantees zero-setup local execution when cloud PostgreSQL is unreachable.

---

## 12. Unknowns
- Status of future Voice AI implementation (Agile `US-M4-07`): Confirmed not present in codebase.
- SMTP production deployment schedule: Demo OTP currently remains active for local verification.

---

## 13. Updating Project Memory
Update this document whenever:
1. A new backend route or service is added or refactored.
2. A database model schema is modified.
3. A security patch is applied (e.g., disabling `demo_otp`).
4. Test counts or test suites are expanded.
5. Deployment configurations are modified.
