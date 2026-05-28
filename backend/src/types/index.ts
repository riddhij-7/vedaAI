export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'short' | 'long' | 'true_false';
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marksEach: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions?: string;
  fileContent?: string; // extracted text from PDF/txt
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // for MCQ
}

export interface Section {
  id: string;
  title: string; // "Section A", "Section B"
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  assignmentId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  totalMarks: number;
  duration?: string;
  sections: Section[];
  generatedAt: string;
}

export interface WSMessage {
  type: 'status' | 'result' | 'error';
  assignmentId: string;
  status?: JobStatus;
  progress?: number; // 0-100
  paper?: GeneratedPaper;
  error?: string;
}
