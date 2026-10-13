# NegoMind AI — Engineering & Architecture Documentation Index

Welcome to the authoritative engineering documentation repository for **NegoMind AI** (*Think • Negotiate • Grow*).

This directory serves as the centralized source of truth for software engineers, product managers, technical writers, and AI coding assistants working on the NegoMind AI platform.

---

## 📚 Documentation Suite Navigation

| Document | Primary File | Scope & Purpose |
|---|---|---|
| **Product Requirements** | [prd.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/prd.md) | Authoritative product requirements, user personas, verified feature inventory, functional requirements (FR-001 to FR-010), non-functional requirements, limitations, and traceability matrix. |
| **System Architecture** | [architecture.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/architecture.md) | Technical architecture, repository layout, technology stack, frontend/backend architecture, negotiation state machine, database models, complete API endpoint inventory, security architecture, and Mermaid sequence diagrams. |
| **Development Rules** | [rules.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/rules.md) | Mandatory engineering rules and development constraints covering sources of truth, constraint clamping, security authorization, CSV formula injection prevention, and test regression policies. |
| **Phases & Task Tracker** | [phases/task.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/phases/task.md) | Agile milestones (Milestones 1–4), sprint task inventory, definition of done, and detailed task tracker for the Negotiation History and Multi-Format Download feature (TASK H-001 to H-014). |
| **UI/UX & Design** | [design.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/design.md) | Visual design principles, Tailwind design system tokens (colors, typography, surfaces), page inventory, negotiation UX flows, history audit UX, accessibility, and error handling states. |
| **Project Memory** | [memory.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/PROJECT_DOCUMENTATION/memory.md) | Concise operational memory for future developers and AI assistants: architectural anchors, source-of-truth pointers, known issues, testing commands, configuration keys, and update protocols. |

---

## ⚡ Quick System Facts & Verification Summary

- **Repository**: [hemalathabora/Infosys-AI-Negotiation](https://github.com/hemalathabora/Infosys-AI-Negotiation)
- **Primary Roots**:
  - Frontend SPA: `UI DESIGN/` (React 19 + Vite 8 + Tailwind CSS 3.4)
  - Backend API: `UI DESIGN/backend/` (Python FastAPI + SQLAlchemy 2.0 + Pydantic v2 + ReportLab)
- **Automated Test Suite**:
  - Test framework: `pytest`
  - Total Passing Tests: **133 passed (100% pass rate)**
  - Test Execution Time: ~3.7 seconds
- **Frontend Build Status**:
  - Build command: `npm run build`
  - Vite compilation: Clean (0 errors, build artifacts generated in `dist/`)
- **Key Subsystems Verified**:
  - Dual Reasoning Engine (Google Gemini / OpenAI vs. Local Deterministic Rule Engine)
  - Simulation Mode (AI vs. AI) & Practice Mode (Human vs. AI)
  - Single-Source Mathematical Concession Telemetry (`concession_tracking.py`)
  - Automated Deadlock Detection & ZOPA Compromise Resolution
  - Multi-Variable Trade-off Engine (Multi-issue utility & Pareto detection)
  - Custom Scenario Builder (CRUD & direct session launch)
  - Negotiation History Audit Log & Multi-Format Exports (PDF via ReportLab, CSV with formula injection sanitization, JSON)
  - User Authentication (PBKDF2 passwords, 6-digit OTP verification, Google OAuth)

---

## 🛠️ Essential Developer Commands

### 1. Run Automated Backend Tests
```powershell
cd "UI DESIGN\backend"
python -m pytest
```

### 2. Start Backend Development Server
```powershell
cd "UI DESIGN\backend"
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Documentation: `http://localhost:8000/docs`

### 3. Start Frontend Development Server
```powershell
cd "UI DESIGN"
npm run dev
```
- Web Application: `http://localhost:5173`

### 4. Build Frontend Production Bundle
```powershell
cd "UI DESIGN"
npm run build
```

---

## ⚠️ Important Discrepancies & Security Notices

1. **Security - Demo OTP Exposure in API Responses**:
   The `/api/auth/signup`, `/api/auth/signin`, and `/api/auth/resend-otp` endpoints currently return `demo_otp` in their JSON responses to facilitate local demonstration without requiring active SMTP credentials. In production deployment, `demo_otp` MUST be removed and OTP delivery restricted exclusively to verified emails.
2. **Architecture - Parallel Frontend Fallback Engine**:
   A mirrored JavaScript negotiation engine exists in `UI DESIGN/src/engine/`. It serves strictly as an offline demonstration fallback. The Python FastAPI backend (`backend/app/services/`) remains the authoritative source of truth.
3. **Agile Feature Discrepancy**:
   Agile item `US-M4-07` ("Voice AI Interactive Practice Mode") is documented in sprint planning but is currently `NOT_IMPLEMENTED` in source code.
