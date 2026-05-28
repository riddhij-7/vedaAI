import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentInput, GeneratedPaper, JobStatus } from '../types';

export interface IAssignment extends Document {
  input: AssignmentInput;
  status: JobStatus;
  progress: number;
  paper?: GeneratedPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    input: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'done', 'failed'],
      default: 'queued',
    },
    progress: { type: Number, default: 0 },
    paper: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
