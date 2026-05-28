import Groq from 'groq-sdk';
import { v4 as uuid } from 'uuid';
import type { AssignmentInput, GeneratedPaper, Section, QuestionType, Difficulty } from '../types';

let _client: Groq | null = null;
const getClient = () => {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _client;
};

const TYPE_LABEL: Record<QuestionType, string> = {
  mcq: 'Multiple Choice Questions',
  short: 'Short Answer Questions',
  long: 'Long Answer Questions',
  true_false: 'True / False Questions',
};

function buildPrompt(input: AssignmentInput): string {
  const sections = input.questionConfigs.map((qc, i) => {
    const label = TYPE_LABEL[qc.type] ?? qc.type;
    return `Section ${String.fromCharCode(65 + i)}: ${label} — ${qc.count} questions, ${qc.marksEach} marks each`;
  });

  return `You are an expert teacher. Generate a complete question paper as valid JSON only — no markdown, no explanation, no code fences.

Assignment: ${input.title}
Subject: ${input.subject}
Grade: ${input.gradeLevel}
${input.additionalInstructions ? `Instructions: ${input.additionalInstructions}` : ''}
${input.fileContent ? `Source Material:\n${input.fileContent.slice(0, 4000)}` : ''}

Sections to generate:
${sections.join('\n')}

Return ONLY this JSON shape, nothing else:
{
  "title": "${input.title}",
  "subject": "${input.subject}",
  "gradeLevel": "${input.gradeLevel}",
  "dueDate": "${input.dueDate}",
  "duration": "45 minutes",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions.",
      "questions": [
        {
          "text": "question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. option1", "B. option2", "C. option3", "D. option4"]
        }
      ]
    }
  ]
}

Rules:
- options field only for mcq type, omit for all others
- difficulty must be exactly one of: easy, medium, hard
- type must be exactly one of: mcq, short, long, true_false
- Vary difficulty naturally across questions
- Questions must be specific and appropriate for ${input.gradeLevel}`;
}

export async function generatePaper(input: AssignmentInput): Promise<GeneratedPaper> {
  const response = await getClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are an expert teacher that generates question papers. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: buildPrompt(input),
      },
    ],
  });

  const raw = response.choices[0].message.content || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const totalMarks = input.questionConfigs.reduce((s, q) => s + q.count * q.marksEach, 0);

  const sections: Section[] = (parsed.sections as any[]).map((sec) => ({
    id: uuid(),
    title: sec.title,
    instruction: sec.instruction,
    totalMarks: (sec.questions as any[]).reduce((s: number, q: any) => s + (q.marks || 0), 0),
    questions: (sec.questions as any[]).map((q) => ({
      id: uuid(),
      text: q.text,
      type: q.type as QuestionType,
      difficulty: q.difficulty as Difficulty,
      marks: q.marks,
      ...(q.options ? { options: q.options } : {}),
    })),
  }));

  return {
    assignmentId: '',
    title: parsed.title,
    subject: parsed.subject,
    gradeLevel: parsed.gradeLevel,
    dueDate: parsed.dueDate || input.dueDate,
    duration: parsed.duration,
    totalMarks,
    sections,
    generatedAt: new Date().toISOString(),
  };
}