import 'dotenv/config';
import http from 'http';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { Assignment } from '../models/assignment.model';
import { generatePaper } from '../services/llm.service';
import { wsManager } from '../lib/ws';
import { QUEUE_NAME } from '../lib/queue';
import type { AssignmentInput } from '../types';

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRetriesPerRequest: null as unknown as number,
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai');
  console.log('[worker] MongoDB connected');

  // Worker needs its own WS server on a different port so it can broadcast
  const server = http.createServer();
  wsManager.init(server);
  server.listen(4001, () => console.log('[worker] WS ready on port 4001'));

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { assignmentId, input }: { assignmentId: string; input: AssignmentInput } = job.data;
      console.log(`[worker] Processing job for assignment ${assignmentId}`);

      const notify = (status: string, progress: number) =>
        wsManager.broadcast(assignmentId, { type: 'status', assignmentId, status: status as any, progress });

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing', progress: 10 });
      notify('processing', 10);

      await job.updateProgress(40);
      notify('processing', 40);

      const paper = await generatePaper(input);
      paper.assignmentId = assignmentId;

      await job.updateProgress(80);
      notify('processing', 80);

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'done', progress: 100, paper });

      wsManager.broadcast(assignmentId, {
        type: 'result', assignmentId, status: 'done', progress: 100, paper,
      });

      console.log(`[worker] Done: ${assignmentId}`);
    },
    { connection, concurrency: 3 }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed', error: err.message });
    wsManager.broadcast(assignmentId, { type: 'error', assignmentId, status: 'failed', error: err.message });
    console.error(`[worker] Failed: ${assignmentId}`, err.message);
  });

  console.log('[worker] Listening for jobs...');
}

main().catch(console.error);