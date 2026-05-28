import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { Assignment } from '../models/assignment.model';
import { assessmentQueue, redis } from '../lib/queue';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const QuestionConfigSchema = z.object({
  type: z.enum(['mcq', 'short', 'long', 'true_false']),
  count: z.number().int().positive(),
  marksEach: z.number().int().positive(),
});

const AssignmentInputSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  dueDate: z.string().min(1),
  questionConfigs: z.array(QuestionConfigSchema).min(1),
  additionalInstructions: z.string().optional(),
});


router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const input = AssignmentInputSchema.parse(body);

    
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(req.file.buffer);
        input.additionalInstructions = (input.additionalInstructions || '') + '\n' + parsed.text;
      } else {
        (input as any).fileContent = req.file.buffer.toString('utf-8');
      }
    }

    const assignment = await Assignment.create({ input, status: 'queued' });
    const id = (assignment._id as any).toString();

    await assessmentQueue.add('generate', { assignmentId: id, input });

    res.status(201).json({ assignmentId: id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  const assignments = await Assignment.find({}, { paper: 0 }).sort({ createdAt: -1 }).lean();
  res.json(assignments);
});


router.get('/:id', async (req: Request, res: Response) => {
  const cacheKey = `assignment:${req.params.id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const assignment = await Assignment.findById(req.params.id).lean();
  if (!assignment) return res.status(404).json({ error: 'Not found' });

  if (assignment.status === 'done') {
    await redis.set(cacheKey, JSON.stringify(assignment), 'EX', 3600); // 1hr cache
  }

  res.json(assignment);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await Assignment.findByIdAndDelete(req.params.id);
  await redis.del(`assignment:${req.params.id}`);
  res.json({ success: true });
});

export default router;
