# WORKTRACE — AI-Powered Organisational Knowledge & Employee Handover Platform

> **Tagline:** *"When an employee leaves, their knowledge shouldn't leave with them."*

WORKTRACE is an enterprise-grade organizational knowledge retention and employee handover platform designed specifically for fast-paced retail, warehousing, logistics, and consumer goods distribution companies.

---

## 1. Primary Demonstration Workflow

WORKTRACE solves organizational memory loss through this end-to-end operational loop:

```
[Employee A (Rahul Sharma)] 
      │ 
      ▼ Submits 7 structured questions in daily activity reports
[WORKTRACE Central Knowledge Hub] 
      │ 
      ▼ Employee enters Notice Period
[Manager (Vikram Malhotra)] 
      │ Initiates Exit Handover sequence
      ▼
[Gemini 3.8 Flash AI Engine]
      │ Synthesizes 13 evidence-backed knowledge modules & detects gaps
      ▼
[Manager Reviews & Edits Sections]
      │ Adds manager verification notes, amends priorities, approves report
      ▼
[Successor (Neha Patel) Assigned & Access Granted]
      │ 
      ▼
[Interactive AI Successor Context Assistant]
      Answers questions with verifiable source record citations and anomaly alerts
```

---

## 2. Key Modules Implemented

### Module A: Authentication & Employee Directory
- **3 Roles Supported:**
  - **Employee:** Submit daily work activities, author operational SOPs, view personal records, access authorized handover information when assigned as a successor.
  - **Manager:** Supervise department activities, initiate exit handovers, review/edit AI-generated reports, approve handovers, assign successors.
  - **Administrator:** Manage user profiles, configure departments, inspect immutable audit logs, reset demonstration database.
- **Demo Personas (1-Click Switcher):**
  - `Vikram Malhotra` (Head of Operations & Supply Chain — **Manager**)
  - `Rahul Sharma` (Lead Warehouse Specialist — **Employee on Notice**)
  - `Neha Patel` (Inventory Operations Associate — **Successor to Rahul Sharma**)
  - `Devanshi Joshi` (Logistics Operations — **Successor to Amit Verma**)
  - `Ananya Sen` (VP of Human Capital & Governance — **Administrator**)

### Module B: Daily Work Activity Management
Captures structured daily reports featuring all **7 mandatory operational questions**:
1. *What work did you complete today?*
2. *What decisions did you make?*
3. *What problems did you encounter?*
4. *What actions did you take to resolve those problems?*
5. *What tasks are still pending?*
6. *Which people or departments were involved?*
7. *What important observations or lessons did you learn?*

Includes 1-click synthetic templates for rapid evaluation:
- *Cold Storage Pallet Shrinkage Incident*
- *Highway Transport Delay & Reefer Breakdown*
- *Secondary Packaging Vendor Bursting Test*

### Module C: Central Knowledge Repository
Searchable, filterable repository uniting daily activities, operational decisions, standard operating procedures, problem-resolution records, and documents with full author attribution, timestamps, and permission levels (*Public*, *Department*, *Management Confidential*).

### Module D: AI Knowledge Intelligence Engine
Analyzes authorized records using Gemini 3.8 Flash (`@google/genai`) to surface:
- Recurring operational failures (e.g. single-supplier packaging crush risk at Apex PolyPrint).
- Knowledge gaps and informal unwritten practices (e.g. Sunday chiller repair cash advance).
- Conflicting records and inventory count contradictions (e.g. Bay 4 physical bin discrepancy vs ERP balance).
- Verified managerial best practices (e.g. 05:00 AM dedicated DC arrival window).

### Module E: Employee Exit & Knowledge Handover
Structured 5-step lifecycle (*Not Started* &rarr; *Processing* &rarr; *Awaiting Review* &rarr; *Approved* &rarr; *Shared with Successor*) featuring **13 comprehensive handover modules**:
1. Employee core responsibilities
2. Completed operational projects
3. Important operational decisions & precedents
4. Pending tasks & open action items (with priority ratings)
5. Unresolved problems & vulnerabilities
6. Recurring operational issues
7. Documented solutions & workarounds
8. Key contacts & vendor escalations
9. Departmental dependencies
10. Standard Operating Procedures (SOPs)
11. Relevant supporting documents & audits
12. Evidence-based professional work patterns
13. Detected gaps, uncertainties & conflicting records

*Enforces strict human governance:* Handover reports cannot be shared with a successor until verified and approved by the supervising manager.

### Module F: AI Successor Context Assistant
Interactive conversational assistant allowing successors to query predecessor records:
- Cites original source records (e.g. `[act-001]`, `[doc-002]`) with clickable inspector modals.
- Cites dates and evidence classifications (*Evidence-supported*, *Verified by manager*, *Conflicting*, *Uncertain*).
- Refuses to hallucinate or invent unrecorded facts.
- Strictly observes role-based permission checks.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, React Router v7, Lucide React icons.
- **Backend:** Node.js, Express, TypeScript (`tsx`).
- **AI Integration:** Google GenAI SDK (`@google/genai`) invoking model `gemini-3.8-flash` on the server side with fallback synthesis.
- **Data Persistence:** File-backed persistent JSON database (`data/worktrace_db.json`) with initial synthetic seeding and 1-click reset.

---

## 4. Execution & Setup Instructions

### Environment Variables (`.env`):
```env
# Optional Gemini API Key. If omitted, WORKTRACE automatically uses its deterministic synthesizer.
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### Running Locally:
```bash
# Install dependencies
npm install

# Start full-stack dev server (Express + Vite)
npm run dev

# Run production build
npm run build
npm start
```
App runs at `http://localhost:3000`.
