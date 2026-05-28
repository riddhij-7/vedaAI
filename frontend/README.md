# VedaAI – AI Assessment Creator

AI-powered question paper generator for teachers.

---

## What It Does

Teachers can create an assignment by filling out a form, upload optional reference material, and the system generates a structured question paper using AI complete with sections, difficulty tags, and marks. The output page displays a clean, exam-style layout ready to print as PDF.

---

## Architecture

```
```
---

## Request Flow

```

```

---

## Approach & Key Decisions

**Two-step form**
Step 1 collects basic info (title, subject, grade, due date). Step 2 handles file upload, question configuration per section, and additional instructions. Splitting steps keeps each screen focused and surfaces validation errors in context.

**Queue-based generation**
The Express API and BullMQ worker run as separate processes. The API returns immediately after queuing, the worker handles the slow LLM call. This keeps the API responsive and lets workers be scaled independently.

**WebSocket + polling hybrid**
WebSocket gives instant updates. If WS fails (firewall, proxy), the frontend falls back to polling every 2 seconds. Both paths converge on the same result.

**Structured JSON, not raw LLM text**
The prompt forces JSON output via `response_format: { type: 'json_object' }`. The response is parsed, each question/section assigned a UUID, and validated before saving. The frontend renders only the normalized `GeneratedPaper` type, never raw AI text.

**Redis caching**
Three layers with different TTLs:
- Single assignment (1 hour): only cached when status is `done`
- Assignment list (30 seconds): short TTL since list changes often  
- In-progress jobs are never cached

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| State | Zustand |
| Realtime | WebSocket + HTTP polling fallback |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Queue | BullMQ |
| Cache | Redis |
| AI | Groq API (LLaMA 3.3 70B) |
| Validation | Zod (server) + custom (client) |

---

## Features

- **Question paper generation**: sections (A, B, C…), difficulty tags, marks per question
- **PDF export**: print-optimized CSS, only the exam paper renders when printing
- **Regenerate**: one-click regeneration from the output page

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running on `mongodb://localhost:27017`
- Redis running on `redis://localhost:6379`
- Groq API key (free) → https://console.groq.com

### Install

```bash
git clone https://github.com/YOUR_USERNAME/vedaai-assessment.git
cd vedaai-assessment

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env: set GROQ_API_KEY

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

### Run

Open 4 terminals:

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: API server
cd backend && npm run dev

# Terminal 4: Worker
cd backend && npm run worker

# Terminal 5: Frontend
cd frontend && npm run dev
```

Or use Docker for MongoDB and Redis:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
docker run -d -p 6379:6379 --name redis redis:alpine
```

Open → http://localhost:3000

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