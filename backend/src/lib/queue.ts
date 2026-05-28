import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = { url: redisUrl, maxRetriesPerRequest: null as unknown as number };

export const redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const QUEUE_NAME = 'assessment-generation';

export const assessmentQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const queueEvents = new QueueEvents(QUEUE_NAME, { connection });
