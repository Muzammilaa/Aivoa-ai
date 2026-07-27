# AIVOA.AI Complaint Management System — Master Project Spec

> **Instructions for AI coding tool:** Read this entire document before writing any code.
> Implement in the exact phase order listed below. After each phase, stop and summarize
> what you built before moving to the next phase. Do not invent additional scope beyond
> what is listed. If something is ambiguous, make the simplest reasonable choice and note
> the assumption in a comment.

## 1. Objective

Build an AI-powered Customer Complaint Management System for the pharmaceutical
manufacturing industry (API and FDF products), used inside a Quality Management System (QMS).

Core workflow: a user uploads or pastes a raw customer complaint (document, email, or text)
→ an AI pipeline extracts structured fields from it → the extracted data auto-populates a
structured complaint form → the user reviews and saves the complaint to a database.

## 2. Mandatory Tech Stack

- Frontend: React (Vite) + Redux Toolkit
- Backend: Python 3.11 + FastAPI
- AI orchestration: LangGraph
- LLM: Groq API, model `gemma2-9b-it` (optionally `llama-3.3-70b-versatile` for heavier reasoning)
- Database: SQLite for local dev (file-based, zero setup), via SQLAlchemy ORM
  (structured so it can swap to Postgres later by changing the connection string only)
- Font: Google Inter, loaded via Google Fonts or self-hosted

## 3. Folder Structure

```
aivoa-complaint-system/
├── PROJECT_SPEC.md          <- this file, do not delete
├── backend/
│   ├── venv/
│   ├── .env                 <- GROQ_API_KEY=xxx (never commit this)
│   ├── .env.example
│   ├── requirements.txt
│   ├── main.py               <- FastAPI app entrypoint
│   ├── database.py           <- SQLAlchemy engine/session setup
│   ├── models.py              <- SQLAlchemy ORM models
│   ├── schemas.py             <- Pydantic request/response schemas
│   ├── routers/
│   │   ├── complaints.py     <- CRUD endpoints
│   │   ├── intake.py         <- upload/paste + AI extraction endpoint
│   │   └── chat.py           <- "ask about this complaint" endpoint
│   ├── agent/
│   │   ├── graph.py           <- LangGraph graph definition
│   │   ├── nodes.py           <- individual node functions
│   │   ├── state.py           <- shared state schema (TypedDict)
│   │   └── llm.py             <- Groq client setup
│   └── sample_data/
│       ├── complaint_1.txt
│       ├── complaint_2.txt
│       └── complaint_3.txt
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── store/
    │   │   ├── store.ts
    │   │   └── complaintSlice.ts
    │   ├── components/
    │   │   ├── ComplaintForm.tsx      <- left panel
    │   │   ├── AIAssistantPanel.tsx   <- right panel
    │   │   ├── FileUpload.tsx
    │   │   └── ChatBox.tsx
    │   └── api/
    │       └── complaintApi.ts        <- fetch calls to backend
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## 4. Database Schema

Table: `complaints`

| Column                | Type      | Notes                              |
|-----------------------|-----------|-------------------------------------|
| id                    | integer   | primary key, autoincrement          |
| complaint_source      | string    | e.g. email, phone, portal           |
| customer_name         | string    |                                      |
| product_name          | string    |                                      |
| product_strength_grade| string    |                                      |
| batch_lot_number      | string    |                                      |
| manufacturing_date    | date      | nullable                            |
| expiry_date           | date      | nullable                            |
| quantity_affected     | string    | e.g. "50 kg"                        |
| complaint_type        | string    |                                      |
| complaint_date        | date      |                                      |
| description           | text      |                                      |
| initial_severity      | string    | Low / Medium / High / Critical      |
| priority              | string    | Low / Medium / High                 |
| status                | string    | default "Pending Triage"            |
| raw_input_text         | text      | original uploaded/pasted text       |
| created_at            | datetime  | auto                                 |

## 5. Backend API Endpoints

### `POST /api/intake/extract`
Input: multipart file upload OR JSON `{ "text": "..." }`
Process: run the LangGraph pipeline (see section 6) on the raw text
Output: JSON matching the complaint fields above (unsaved, for form pre-fill), plus
`completeness_notes`, `risk_classification`, `capa_suggestion` if implemented.

### `POST /api/complaints`
Input: full complaint JSON (as reviewed/edited by user in the form)
Process: save to DB
Output: saved complaint with `id`

### `GET /api/complaints`
List all saved complaints.

### `GET /api/complaints/{id}`
Get one complaint.

### `POST /api/chat`
Input: `{ "complaint_context": {...}, "message": "..." }`
Output: `{ "reply": "..." }` — simple LLM call answering questions about the current complaint
(does not need to be a graph node, can be a direct Groq call).

## 6. LangGraph Pipeline (agent/graph.py)

State (TypedDict):
```python
class ComplaintState(TypedDict):
    raw_text: str
    extracted_fields: dict
    completeness_notes: str
    risk_classification: str
    capa_suggestion: str
```

Nodes (in agent/nodes.py), run in this order:

1. **extract_fields_node**
   Prompt the LLM to read `raw_text` and return a JSON object with exactly the fields listed
   in section 4 (excluding id/status/created_at). Instruct the LLM to output ONLY valid JSON,
   no markdown fences, no preamble. Parse with `json.loads`, with a fallback that strips
   markdown code fences if present.

2. **risk_classification_node**
   Given `extracted_fields`, prompt the LLM to assign `initial_severity` and `priority`
   based on product risk, quantity affected, and complaint type. Update state.

3. **completeness_check_node** (bonus, optional — include if time allows)
   Check which required fields are missing or vague; return a short note like
   "Missing: batch number, manufacturing date."

4. **capa_recommendation_node** (bonus, optional — include if time allows)
   Given the complaint description, suggest a short CAPA (Corrective and Preventive Action)
   recommendation in 2-3 sentences.

Edges: linear — extract → risk_classification → completeness_check → capa_recommendation → END.
(Bonus nodes can be skipped entirely if time runs out; keep the linear structure simple, no
conditional branching needed for MVP.)

Compile the graph once at module load. Expose a single function:
```python
def run_complaint_pipeline(raw_text: str) -> dict:
    ...
```
This is what routers/intake.py calls.

## 7. Frontend Requirements

- `ComplaintForm.tsx`: renders all fields from section 4, grouped into the 4 sections shown
  in the reference UI (Origin & Customer Details / Product & Batch Identification /
  Complaint Details / Initial Assessment & Priority). Fields are controlled inputs bound to
  Redux state. "Reset Form" and "Save Complaint" buttons.
- `AIAssistantPanel.tsx`: drag-and-drop file upload zone + "paste complaint text" textarea +
  a progress indicator + a small chat box below for follow-up questions. On successful
  extraction, dispatch a Redux action that populates `ComplaintForm` fields.
- Redux slice `complaintSlice.ts`: holds the current complaint form state, an `isLoading`
  flag for extraction in progress, and actions to set/reset fields.
- Use Google Inter font (import via `@import url('https://fonts.googleapis.com/css2?family=Inter...')`
  in index.html or main CSS file).
- Styling: functional and clean is enough; does not need to pixel-match the reference
  screenshot, per the assignment notes.

## 8. Sample Test Data

Create 2-3 realistic fake pharmaceutical complaint texts in `backend/sample_data/`, e.g. a
customer email reporting a batch of API (Active Pharmaceutical Ingredient) with discoloration,
or an FDF (Finished Dosage Form) tablet complaint about broken tablets in a blister pack.
These are used to demonstrate the extraction pipeline in the demo video.

## 9. Environment Variables (.env)

```
GROQ_API_KEY=your_key_here
DATABASE_URL=sqlite:///./complaints.db
```

## 10. Implementation Order (for the AI tool to follow)

1. Backend: FastAPI app skeleton + DB models + SQLite connection, confirm server boots
2. Backend: Groq client setup (agent/llm.py), test one raw call works
3. Backend: LangGraph pipeline with extract_fields_node only, test via curl/Postman with a
   sample text, confirm structured JSON comes back correctly
4. Backend: add risk_classification_node, test again
5. Backend: wire up all API routes (intake, complaints CRUD, chat)
6. Frontend: scaffold Vite + Redux, build ComplaintForm with static fields first
7. Frontend: build AIAssistantPanel with upload/paste UI
8. Frontend: connect to backend, confirm end-to-end: paste text → form auto-fills → save works
9. Add bonus nodes (completeness check, CAPA) only if time remains
10. Polish: Google Inter font, basic styling pass

## 11. Out of Scope / Explicitly Not Required

- Production-grade OCR or document parsing (per assignment notes)
- Authentication/login
- Pixel-perfect UI matching
- Postgres (SQLite is sufficient for this assignment)
