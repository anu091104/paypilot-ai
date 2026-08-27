# PayPilot — AI Commerce & Payment Agent

PayPilot is an agentic AI system that turns a natural-language shopping request into a ranked, explainable recommendation — factoring in product fit **and** the effective price after real payment offers (cashback/discounts), instead of just showing a list of products.

> "Wireless headphones under ₹8,000, mainly for travel, and I want maximum cashback"
> → PayPilot parses intent → searches the catalog → pulls matching offers → calculates effective price → ranks candidates → explains its pick.

**Live demo:** `<add your Vercel URL here after deploying>`
**Demo video:** `<add your YouTube link here>`

---

## Why this isn't "just a chatbot"

A chatbot maps `user → LLM → answer`. PayPilot is a multi-step **agent**: it decides which tools it needs, calls them in sequence, and only then produces an answer a person couldn't get from an LLM alone (accurate math, real inventory, real offer data).

```
User query
   │
   ▼
parse_intent            (LLM if a key is configured, else deterministic rule-based extractor)
   │
   ▼
search_products()        → tool: queries the product catalog by category + budget
   │
   ▼
rank_products()           → tool: for each candidate, internally calls
   │                          get_payment_offers() + calculate_effective_price()
   │                          and scores by price, rating, priority, and cashback
   ▼
generate_explanation()   → turns the winning candidate into a plain-language recommendation
```

Every step is visible in the UI as a live agent trace, and every step's output is returned in the `/ask` API response under `"steps"` — so the reasoning is inspectable, not a black box.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Agent tools | Plain Python functions (`search_products`, `get_payment_offers`, `calculate_effective_price`, `rank_products`) |
| Intent understanding | Gemini or OpenAI if an API key is set, **with a deterministic rule-based fallback** so the app always works with zero API cost |
| Database | SQLite by default (zero setup) — swap to Postgres in one env var for production |
| ORM | SQLAlchemy |
| Containerization | Docker + Docker Compose |
| Deployment | Vercel (frontend) + Render (backend) |

**Note on data:** products and payment offers are a small, realistic **synthetic dataset** (`backend/data/*.csv`) — this is intentionally a scoped MVP, not a scraped or live-integrated catalog, and it does not claim to be real-time Razorpay offer data.

---

## Project structure

```
paypilot/
├── frontend/                # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── components/      # AgentTrace, RecommendationCard, AlternativesList
│   │   ├── api.js
│   │   └── App.jsx
│   ├── Dockerfile
│   └── vercel.json
├── backend/
│   ├── main.py               # FastAPI app: /ask, /products, /offers
│   ├── agent/
│   │   ├── intent_parser.py  # LLM + rule-based fallback
│   │   └── orchestrator.py   # runs the full agent pipeline
│   ├── tools/                # the 4 agent tools
│   ├── models/               # SQLAlchemy models
│   ├── database/              # db session + CSV seeding
│   ├── data/                 # products.csv, offers.csv (synthetic)
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Running locally

### Option A — Docker Compose (recommended, one command)

```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000 (docs at `/docs`)

### Option B — Run each service manually

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # optionally add GEMINI_API_KEY / OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8000
npm run dev
```

---

## Deploying live (Vercel + Render)

**Backend on Render**
1. Push this repo to GitHub.
2. In Render: New → Blueprint → connect the repo (it will read `render.yaml`).
3. Add `GEMINI_API_KEY` / `OPENAI_API_KEY` if you have one (optional — leave blank to use the fallback parser).
4. Deploy. Copy the resulting URL, e.g. `https://paypilot-backend.onrender.com`.
5. *(Optional, to match the original spec exactly)* add a Render Postgres instance and set `DATABASE_URL` to its connection string — the app already reads this via `DATABASE_URL` and needs no code changes.

**Frontend on Vercel**
1. In Vercel: New Project → import the repo → set root directory to `frontend`.
2. Add an environment variable: `VITE_API_URL = https://paypilot-backend.onrender.com`.
3. Deploy. Vercel gives you a URL like `https://paypilot.vercel.app`.
4. Back in Render, set `FRONTEND_ORIGIN` to that Vercel URL (tightens CORS from `*` to your real domain).

Update the two links at the top of this README once both are live.

---

## API reference

`POST /ask`
```json
{ "query": "Earbuds under ₹3000 with the best battery life" }
```
Returns `intent`, `steps` (the full agent trace), `recommendation`, and `alternatives`.

`GET /products?category=earbuds` — list catalog items
`GET /offers` — list all synthetic payment offers

---

## What was deliberately left out of this MVP (and why)

Per the original scope: no real payment processing, no real bank integrations, no massive catalog, no multi-agent orchestration framework. The goal was **a small dataset + a genuinely working 4-tool agent + a clear business narrative**, done well — not a sprawling half-finished platform.

## Business relevance (for the pitch)

PayPilot demonstrates AI as a layer *before* checkout, not just at it: understanding intent, comparing real options, and surfacing the payment offer that actually lowers the price a customer pays. For a payments company, that reframes the product question from "how do we process a payment" to "how do we help a customer arrive at the best possible payment before they check out" — touching conversion, personalization, and payment-offer discovery at once.
