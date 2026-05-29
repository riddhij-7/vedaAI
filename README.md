# VedaAI – AI Assessment Creator

 Full-stack AI-powered question paper generator for teachers.  
 
**Live Demo:** https://veda-ai-mu-eight.vercel.app

---

## Live Architecture
![Architecture](docs/architecture.png)

---

## Flow

![Request Flow](docs/requestflow.png)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Zustand, WebSocket |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Queue | BullMQ + Redis (Upstash) |
| AI | Groq API — LLaMA 3.3 70B (JSON mode) |
| Styling | Inline styles + Tailwind utility classes |

---

## Setup


### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Redis running locally (`redis://localhost:6379`)
- Groq API key (free) → https://console.groq.com

### 1. Clone & install

```bash
git clone https://github.com/riddhij-7/vedaAI.git
cd vedaAI

# Backend
cd backend && npm install
cp .env.example .env
# Fill in GROQ_API_KEY in .env

# Frontend
cd ../frontend && npm install
cp .env.local.example .env.local
```

### 2. Start services

```bash
# Terminal 1 – MongoDB
mongod

# Terminal 2 – Redis
redis-server

# Terminal 3 – Backend (API server + Worker combined)
cd backend && npm run dev

# Terminal 4 – Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

**`backend/.env`**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_...
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

---

## Key Design Decisions

### Prompt → Structured JSON
The LLM is prompted to return **only valid JSON** matching a strict schema. The response is stripped of any markdown fences, parsed, and normalized with UUIDs before storage. The frontend **never renders raw AI text**.

### Unified Server + Worker (Production Adaptation)
Originally designed as two separate processes (API server + BullMQ worker), the architecture was adapted for cloud deployment on Render's free tier which does not support multiple always-on services efficiently.

The worker was merged into the main Express server process while keeping the BullMQ queue intact — jobs are still enqueued and processed asynchronously:
API request → BullMQ queue → in-process worker → MongoDB → WebSocket notify
This preserves non-blocking generation without requiring a paid deployment tier.

### WebSocket + Polling Fallback
Clients subscribe via WebSocket using `{ type: 'subscribe', assignmentId }`. If WebSocket fails (firewall, proxy, cold start), the frontend automatically falls back to HTTP polling every 2 seconds — the result always reaches the user.

### Redis Caching
Completed assignments are cached in Redis for 1 hour. Repeated page refreshes are served from cache without hitting MongoDB or re-running the LLM.

### Two-Step Form with Double Validation
Step 1 collects basic info (title, subject, grade, due date). Step 2 handles file upload, question types, and instructions. Client-side validation runs before submission. Zod validates again server-side — the API never processes malformed input.

### Production Debugging
During deployment the following were debugged and resolved:
- WebSocket connections behind Render's reverse proxy
- Redis TLS connections (Upstash requires `rediss://`)
- CORS between Vercel frontend and Render backend
- Environment variable configuration across local and production
- Cold start latency on Render free tier
