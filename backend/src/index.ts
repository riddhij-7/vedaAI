import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { wsManager } from './lib/ws';
import assignmentsRouter from './routes/assignments';
import './workers/assessment.worker';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/assignments', assignmentsRouter);
app.get('/health', (_req, res) => res.json({ ok: true }));

wsManager.init(server);

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai');
  console.log('[server] MongoDB connected');

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`[server] Listening on http://localhost:${PORT}`));
}

start().catch(console.error);
