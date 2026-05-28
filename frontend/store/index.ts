import { create } from 'zustand';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'short' | 'long' | 'true_false';
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marksEach: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions: string;
  file: File | null;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
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

export interface AssignmentListItem {
  _id: string;
  input: { title: string; subject: string; dueDate: string };
  status: JobStatus;
  createdAt: string;
}

interface Store {
  // Form
  form: AssignmentFormData;
  setForm: (patch: Partial<AssignmentFormData>) => void;
  resetForm: () => void;

  // Generation status
  generatingId: string | null;
  generationProgress: number;
  generationStatus: JobStatus | null;
  setGenerating: (id: string) => void;
  setProgress: (p: number, s: JobStatus) => void;
  clearGeneration: () => void;

  // Paper result
  papers: Record<string, GeneratedPaper>;
  setPaper: (id: string, paper: GeneratedPaper) => void;
}

const defaultForm: AssignmentFormData = {
  title: '',
  subject: '',
  gradeLevel: '',
  dueDate: '',
  questionConfigs: [{ type: 'mcq', count: 4, marksEach: 1 }],
  additionalInstructions: '',
  file: null,
};

export const useStore = create<Store>((set) => ({
  form: { ...defaultForm },
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  resetForm: () => set({ form: { ...defaultForm } }),

  generatingId: null,
  generationProgress: 0,
  generationStatus: null,
  setGenerating: (id) => set({ generatingId: id, generationProgress: 0, generationStatus: 'queued' }),
  setProgress: (p, s) => set({ generationProgress: p, generationStatus: s }),
  clearGeneration: () => set({ generatingId: null, generationProgress: 0, generationStatus: null }),

  papers: {},
  setPaper: (id, paper) => set((s) => ({ papers: { ...s.papers, [id]: paper } })),
}));
